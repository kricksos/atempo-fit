import { NextResponse } from "next/server";
import { z } from "zod";

import { foodAllowedForPlan } from "@/lib/food-restrictions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const itemSchema = z.object({
  foodId: z.string().uuid(),
  quantityGrams: z.number().int().min(1).max(2000),
  role: z.enum(["protein", "carbohydrate", "fat", "vegetable", "fruit", "dairy"]),
  sourceItemId: z.string().uuid().optional(),
});
const mealSchema = z.object({ name: z.string().trim().min(1).max(80), suggestedTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(), items: z.array(itemSchema).min(1).max(20) });
const payloadSchema = z.object({ name: z.string().trim().min(1).max(100), meals: z.array(mealSchema).min(3).max(6), sourceVersionId: z.string().uuid().optional() });

async function discardInactiveVersion(db: ReturnType<typeof createAdminClient>, versionId: string) {
  const { error } = await db.from("nutrition_plan_versions").delete().eq("id", versionId).eq("active", false);
  if (error) console.error("Unable to remove incomplete nutrition version", error.message);
}

export async function POST(request: Request) {
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revisa las comidas y alimentos de la dieta." }, { status: 400 });

  let db: ReturnType<typeof createAdminClient> | null = null;
  let pendingVersionId: string | null = null;
  try {
    db = createAdminClient();
    const { data: profile } = await db.from("profiles").select("primary_goal, food_restrictions, diet_preference").eq("user_id", auth.user.id).single();
    if (!profile) return NextResponse.json({ error: "Complete your profile first." }, { status: 400 });
    const foodIds = [...new Set(parsed.data.meals.flatMap((meal) => meal.items.map((item) => item.foodId)))];
    const { data: foods } = await db.from("foods_catalog").select("id, name, calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g").in("id", foodIds);
    if (!foods || foods.length !== foodIds.length) return NextResponse.json({ error: "Hay alimentos que ya no están disponibles." }, { status: 400 });
    const foodById = new Map(foods.map((food) => [food.id, food]));
    const restrictions = Array.isArray(profile.food_restrictions) ? profile.food_restrictions.filter((value): value is string => typeof value === "string") : [];
    const incompatible = foods.find((food) => !foodAllowedForPlan(food.name, restrictions, profile.diet_preference));
    if (incompatible) return NextResponse.json({ error: `${incompatible.name} no es compatible con tus restricciones activas.` }, { status: 400 });

    const totals = parsed.data.meals.flatMap((meal) => meal.items).reduce((total, item) => {
      const food = foodById.get(item.foodId)!;
      const factor = item.quantityGrams / 100;
      return { calories: total.calories + food.calories_per_100g * factor, protein: total.protein + food.protein_per_100g * factor, carbs: total.carbs + food.carbs_per_100g * factor, fats: total.fats + food.fats_per_100g * factor };
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    const { data: plan, error: planError } = await db.from("nutrition_plans").select("id").eq("user_id", auth.user.id).eq("active", true).maybeSingle();
    if (planError) throw planError;
    const sourceItems = parsed.data.meals.flatMap((meal) => meal.items).filter((item) => item.sourceItemId);
    if (sourceItems.length && !parsed.data.sourceVersionId) return NextResponse.json({ error: "No se ha indicado la versión de origen." }, { status: 400 });
    if (parsed.data.sourceVersionId && !plan) return NextResponse.json({ error: "No hay una dieta activa que editar." }, { status: 409 });
    const planId = plan?.id ?? (await db.from("nutrition_plans").insert({ user_id: auth.user.id, name: parsed.data.name }).select("id").single()).data?.id;
    if (!planId) throw new Error("Unable to create nutrition plan.");
    const [{ data: oldVersion, error: oldVersionError }, { data: latestVersion, error: latestVersionError }] = await Promise.all([
      db.from("nutrition_plan_versions").select("id").eq("nutrition_plan_id", planId).eq("active", true).maybeSingle(),
      db.from("nutrition_plan_versions").select("version_number").eq("nutrition_plan_id", planId).order("version_number", { ascending: false }).limit(1).maybeSingle(),
    ]);
    if (oldVersionError || latestVersionError) throw oldVersionError ?? latestVersionError;
    if (parsed.data.sourceVersionId && oldVersion?.id !== parsed.data.sourceVersionId) return NextResponse.json({ error: "La dieta activa ha cambiado. Vuelve a abrir el editor para continuar." }, { status: 409 });
    const sourceMetadata = new Map<string, { alternative_group: string | null; substitution_group: string | null; weight_basis: string }>();
    if (parsed.data.sourceVersionId && sourceItems.length) {
      const sourceIds = sourceItems.map((item) => item.sourceItemId!);
      if (new Set(sourceIds).size !== sourceIds.length) return NextResponse.json({ error: "Hay alimentos duplicados en la dieta de origen." }, { status: 400 });
      const { data: sourceMeals, error: sourceMealsError } = await db.from("nutrition_meals").select("id").eq("nutrition_plan_version_id", parsed.data.sourceVersionId);
      if (sourceMealsError || !sourceMeals) throw sourceMealsError ?? new Error("Unable to load source meals.");
      const mealIds = sourceMeals.map((meal) => meal.id);
      if (!mealIds.length) return NextResponse.json({ error: "No se ha encontrado la dieta de origen." }, { status: 409 });
      const { data: originals, error: originalsError } = await db.from("nutrition_meal_items").select("id, food_id, role, alternative_group, substitution_group, weight_basis").in("meal_id", mealIds).in("id", sourceIds);
      if (originalsError || !originals) throw originalsError ?? new Error("Unable to load source items.");
      const { data: selections, error: selectionsError } = await db.from("nutrition_item_selections").select("meal_item_id, selected_food_id").eq("user_id", auth.user.id).in("meal_item_id", sourceIds);
      if (selectionsError || !selections) throw selectionsError ?? new Error("Unable to load selected foods.");
      const selectionByItem = new Map(selections.map((selection) => [selection.meal_item_id, selection.selected_food_id]));
      for (const item of sourceItems) {
        const original = originals.find((entry) => entry.id === item.sourceItemId);
        if (!original || original.role !== item.role || (selectionByItem.get(original.id) ?? original.food_id) !== item.foodId) return NextResponse.json({ error: "Los alimentos seleccionados han cambiado. Vuelve a abrir el editor." }, { status: 409 });
        sourceMetadata.set(original.id, original);
      }
    }
    const { data: run } = await db.from("plan_generation_runs").insert({ user_id: auth.user.id, run_type: "manual_regeneration", status: "pending", input_snapshot: parsed.data, engine_version: "manual-nutrition-v1" }).select("id").single();
    if (!run) throw new Error("Unable to start manual nutrition generation.");
    const { data: version, error: versionError } = await db.from("nutrition_plan_versions").insert({ nutrition_plan_id: planId, generation_run_id: run.id, version_number: (latestVersion?.version_number ?? 0) + 1, profile_snapshot: { ...profile, manual_name: parsed.data.name }, calories: Math.round(totals.calories), protein_grams: Math.round(totals.protein), carbs_grams: Math.round(totals.carbs), fats_grams: Math.round(totals.fats), meal_count: parsed.data.meals.length, precision_mode: "precise", reason: "restriction_change", active: false }).select("id").single();
    if (versionError || !version) throw versionError ?? new Error("Unable to create nutrition version.");
    pendingVersionId = version.id;
    for (const [index, meal] of parsed.data.meals.entries()) {
      const { data: savedMeal, error: mealError } = await db.from("nutrition_meals").insert({ nutrition_plan_version_id: version.id, name: meal.name, meal_order: index + 1, suggested_time: meal.suggestedTime, target_calories: Math.max(1, Math.round(meal.items.reduce((sum, item) => { const food = foodById.get(item.foodId)!; return sum + food.calories_per_100g * item.quantityGrams / 100; }, 0)) ) }).select("id").single();
      if (mealError || !savedMeal) throw mealError ?? new Error("Unable to create meal.");
      const { error: itemError } = await db.from("nutrition_meal_items").insert(meal.items.map((item) => {
        const source = item.sourceItemId ? sourceMetadata.get(item.sourceItemId) : undefined;
        return { meal_id: savedMeal.id, food_id: item.foodId, quantity_grams: item.quantityGrams, role: item.role, alternative_group: source?.alternative_group ?? null, substitution_group: source?.substitution_group ?? null, weight_basis: source?.weight_basis ?? "as_served" };
      }));
      if (itemError) throw itemError;
    }
    if (oldVersion) {
      const { data: deactivated, error: deactivateError } = await db.from("nutrition_plan_versions").update({ active: false }).eq("id", oldVersion.id).eq("active", true).select("id").maybeSingle();
      if (deactivateError) throw deactivateError;
      if (!deactivated) {
        await discardInactiveVersion(db, version.id);
        pendingVersionId = null;
        return NextResponse.json({ error: "La dieta activa ha cambiado. Vuelve a abrir el editor para continuar." }, { status: 409 });
      }
    }
    const { error: activateError } = await db.from("nutrition_plan_versions").update({ active: true }).eq("id", version.id);
    if (activateError) {
      if (oldVersion) {
        const { error: restoreError } = await db.from("nutrition_plan_versions").update({ active: true }).eq("id", oldVersion.id);
        if (restoreError) {
          console.error("Unable to restore previous nutrition version", restoreError.message);
          await discardInactiveVersion(db, version.id);
          pendingVersionId = null;
          return NextResponse.json({ error: "No hemos podido confirmar qué dieta está activa. Compruébalo antes de volver a intentarlo." }, { status: 500 });
        }
      }
      throw activateError;
    }
    pendingVersionId = null;
    await db.from("plan_generation_runs").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", run.id);
    return NextResponse.json({ saved: true, versionId: version.id, totals: { calories: Math.round(totals.calories), protein: Math.round(totals.protein), carbs: Math.round(totals.carbs), fats: Math.round(totals.fats) } });
  } catch (error) {
    if (db && pendingVersionId) await discardInactiveVersion(db, pendingVersionId);
    console.error("Unable to save manual nutrition", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ error: "No hemos podido guardar la dieta manual." }, { status: 500 });
  }
}

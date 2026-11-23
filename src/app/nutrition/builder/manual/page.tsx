import { redirect } from "next/navigation";

import { ManualNutritionBuilder } from "@/components/manual-nutrition-builder";
import { prepareNutritionEditor } from "@/features/planning/nutrition-editor";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function ManualNutritionPage({ searchParams }: { searchParams: Promise<{ source?: string }> }) {
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) redirect("/login");
  const db = createAdminClient();
  const { data: foods, error: foodsError } = await db.from("foods_catalog").select("id, name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g").order("name");
  if (foodsError || !foods) throw new Error("No hemos podido cargar el catálogo de alimentos.");
  const catalog = foods.map((food) => ({ id: food.id, name: food.name, category: food.category, calories: food.calories_per_100g, protein: food.protein_per_100g, carbs: food.carbs_per_100g, fats: food.fats_per_100g }));
  if ((await searchParams).source !== "active") return <ManualNutritionBuilder foods={catalog} />;

  const { data: plan, error: planError } = await db.from("nutrition_plans").select("id, name").eq("user_id", auth.user.id).eq("active", true).maybeSingle();
  if (planError) throw new Error("No hemos podido cargar tu dieta activa.");
  if (!plan) redirect("/nutrition/builder");
  const { data: version, error: versionError } = await db.from("nutrition_plan_versions").select("id, profile_snapshot").eq("nutrition_plan_id", plan.id).eq("active", true).maybeSingle();
  if (versionError) throw new Error("No hemos podido cargar la versión activa.");
  if (!version) redirect("/nutrition/builder");
  const { data: meals, error: mealsError } = await db.from("nutrition_meals").select("id, name, suggested_time").eq("nutrition_plan_version_id", version.id).order("meal_order");
  if (mealsError || !meals?.length) throw new Error("No hemos podido cargar las comidas de tu dieta activa.");
  const { data: items, error: itemsError } = await db.from("nutrition_meal_items").select("id, meal_id, food_id, quantity_grams, role").in("meal_id", meals.map((meal) => meal.id));
  if (itemsError || !items?.length) throw new Error("No hemos podido cargar los alimentos de tu dieta activa.");
  const { data: selections, error: selectionsError } = await db.from("nutrition_item_selections").select("meal_item_id, selected_food_id, quantity_grams").eq("user_id", auth.user.id).in("meal_item_id", items.map((item) => item.id));
  if (selectionsError || !selections) throw new Error("No hemos podido cargar las alternativas seleccionadas.");
  const snapshot = version.profile_snapshot;
  const name = snapshot && typeof snapshot === "object" && !Array.isArray(snapshot) && typeof snapshot.manual_name === "string" ? snapshot.manual_name : plan.name;
  const initialDiet = prepareNutritionEditor(version.id, name, meals, items, selections, new Set(foods.map((food) => food.id)));
  return <ManualNutritionBuilder foods={catalog} initialDiet={initialDiet} />;
}

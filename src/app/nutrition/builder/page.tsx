import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { foodRestrictionLabelsFromRestrictions } from "@/lib/food-restrictions";
import { NutritionManagement } from "@/components/nutrition-management";

function reasonLabel(reason: string) {
  const labels: Record<string, string> = {
    onboarding: "Plan inicial",
    restriction_change: "Cambio de restricciones",
    progress_adjustment: "Ajuste por evolución",
    goal_change: "Cambio de objetivo",
    equipment_change: "Cambio de contexto",
    injury_change: "Adaptación por lesión",
  };
  return labels[reason] ?? "Actualización del plan";
}

function snapshotString(snapshot: unknown, key: string) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return "";
  const value = (snapshot as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function snapshotArray(snapshot: unknown, key: string) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return [];
  const value = (snapshot as Record<string, unknown>)[key];
  return Array.isArray(value) ? value : [];
}

function goalLabel(value: string) {
  const labels: Record<string, string> = {
    "Ganar masa muscular": "Ganancia muscular",
    "Perder grasa": "Pérdida de grasa",
    "Recomposición corporal": "Recomposición corporal",
    "Mantener peso": "Mantenimiento",
  };
  return labels[value] ?? (value || "Plan personalizado");
}

export default async function NutritionBuilderPage({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) redirect("/login");

  const db = createAdminClient();
  const { data: nutritionPlan } = await db.from("nutrition_plans").select("id, name").eq("user_id", auth.user.id).eq("active", true).maybeSingle();
  const versions = nutritionPlan
    ? (await db.from("nutrition_plan_versions").select("id, version_number, calories, protein_grams, carbs_grams, fats_grams, meal_count, profile_snapshot, reason, active, created_at").eq("nutrition_plan_id", nutritionPlan.id).order("version_number", { ascending: false }).limit(12)).data ?? []
    : [];
  const history = versions.map((version) => ({ id: version.id, active: version.active, versionNumber: version.version_number, calories: version.calories, proteinGrams: version.protein_grams, carbsGrams: version.carbs_grams, fatsGrams: version.fats_grams, mealCount: version.meal_count, goal: goalLabel(snapshotString(version.profile_snapshot, "primary_goal")), reason: reasonLabel(version.reason), createdAt: version.created_at, restrictions: foodRestrictionLabelsFromRestrictions(snapshotArray(version.profile_snapshot, "food_restrictions")).filter((restriction) => restriction !== "Ninguna") }));
  const activeVersion = versions.find((version) => version.active);
  return <NutritionManagement planName={activeVersion ? snapshotString(activeVersion.profile_snapshot, "manual_name") || nutritionPlan?.name || null : null} activeVersion={history.find((version) => version.active) ?? null} versions={history} initialSection={(await searchParams).section === "active" ? "active" : "home"} />;
}

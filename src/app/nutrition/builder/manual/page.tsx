import { redirect } from "next/navigation";

import { ManualNutritionBuilder } from "@/components/manual-nutrition-builder";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function ManualNutritionPage() {
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) redirect("/login");
  const db = createAdminClient();
  const { data: foods } = await db.from("foods_catalog").select("id, name, category, calories_per_100g, protein_per_100g, carbs_per_100g, fats_per_100g").order("name");
  return <ManualNutritionBuilder foods={(foods ?? []).map((food) => ({ id: food.id, name: food.name, category: food.category, calories: food.calories_per_100g, protein: food.protein_per_100g, carbs: food.carbs_per_100g, fats: food.fats_per_100g }))} />;
}

import { buildPlanningExerciseCatalog } from "@/lib/exercise-catalog";
import { getManualIllustrationCatalog } from "@/lib/manual-illustration-catalog";
import { createAdminClient } from "@/lib/supabase/admin";

export async function getManualExerciseCatalog() {
  const { data, error, count } = await createAdminClient().from("exercises")
    .select("id, name, primary_muscle, muscle_groups, difficulty, equipment_required, is_momentum_approved", { count: "exact" })
    .order("name");
  if (error) throw error;
  if (!data || count === null || count !== data.length) throw new Error("No se ha podido cargar el catálogo de ejercicios completo.");
  return getManualIllustrationCatalog(data);
}

export async function getWorkoutTemplateCatalogs() {
  const { data, error, count } = await createAdminClient().from("exercises")
    .select("id, name, description, primary_muscle, muscle_groups, difficulty, equipment_required, restrictions, media_source, is_momentum_approved", { count: "exact" })
    .order("name");
  if (error) throw error;
  if (!data || count === null || count !== data.length) throw new Error("No se ha podido cargar el catálogo de ejercicios completo.");
  return { manual: getManualIllustrationCatalog(data), planning: buildPlanningExerciseCatalog(data) };
}

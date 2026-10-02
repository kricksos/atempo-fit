import { createAdminClient } from "@/lib/supabase/admin";
import { localExerciseNames } from "@/lib/local-exercise-media";

const primaryMuscleMap: Record<string, string> = {
  chest: "pectorals", pectorals: "pectorals", shoulders: "deltoids", deltoids: "deltoids", lats: "lats", "middle back": "lats", back: "lats", biceps: "biceps", triceps: "triceps", quadriceps: "quadriceps", quads: "quadriceps", hamstrings: "hamstrings", glutes: "glutes", calves: "calves", adductors: "adductors", abdominals: "core", abs: "core", core: "core", "lower back": "lower_back", forearms: "forearms",
};

export function normalizeMuscle(value: string) {
  return primaryMuscleMap[value.toLowerCase()] ?? value.toLowerCase().replaceAll(" ", "_");
}

export type PlanningCatalogExercise = {
  name: string;
  primaryMuscle: string | null;
  muscleGroups: string[];
  restrictions: string[];
  equipment: string[];
  hasTrustedMedia: boolean;
};

export async function getPlanningExerciseCatalog() {
  const db = createAdminClient();
  const { data, error } = await db.from("exercises").select("name, primary_muscle, muscle_groups, restrictions, equipment_required, image_start_url, image_end_url, media_source, is_momentum_approved").order("name");
  if (error) throw error;
  return (data ?? []).map((exercise) => ({
    name: exercise.name,
    primaryMuscle: typeof exercise.primary_muscle === "string" ? normalizeMuscle(exercise.primary_muscle) : null,
    muscleGroups: Array.isArray(exercise.muscle_groups) ? exercise.muscle_groups.filter((group): group is string => typeof group === "string").map(normalizeMuscle) : [],
    restrictions: Array.isArray(exercise.restrictions) ? exercise.restrictions.filter((restriction): restriction is string => typeof restriction === "string") : [],
    equipment: Array.isArray(exercise.equipment_required) ? exercise.equipment_required.filter((item): item is string => typeof item === "string") : [],
    hasTrustedMedia: localExerciseNames.has(exercise.name) || (exercise.media_source === "free-exercise-db" && exercise.is_momentum_approved === true && typeof exercise.image_start_url === "string" && typeof exercise.image_end_url === "string" && exercise.image_start_url !== exercise.image_end_url),
  }));
}
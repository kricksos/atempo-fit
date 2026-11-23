import illustrationCatalog from "../../data/illustration-library/catalog.json";
import candidateMapping from "../../data/illustration-library/candidate-mapping.json";
import releaseNames from "../../data/illustration-library/release-names.json";
import { requiredEquipment, type ExerciseEquipment } from "@/lib/exercise-equipment";
import { exercisePrimaryMuscle, normalizeMuscle } from "@/lib/exercise-muscles";
import { isAutomaticPlanningSource } from "@/lib/exercise-planning-source";
import { getManualIllustrationCatalog } from "@/lib/manual-illustration-catalog";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

export type PlanningCatalogExercise = {
  id?: string;
  name: string;
  primaryMuscle: string | null;
  muscleGroups: string[];
  restrictions: string[];
  equipment: ExerciseEquipment[];
  difficulty: string;
  hasTrustedMedia: boolean;
};

type ExerciseRow = Pick<Database["public"]["Tables"]["exercises"]["Row"], "id" | "name" | "description" | "primary_muscle" | "muscle_groups" | "difficulty" | "equipment_required" | "restrictions" | "media_source" | "is_momentum_approved">;

const additionalRestrictions: Record<string, string[]> = {
  "Cruce de poleas bajas": ["shoulder_injury"],
  Flexiones: ["shoulder_injury", "elbow_injury"],
  "Flexiones de pecho": ["shoulder_injury", "elbow_injury"],
  "Flexiones inclinadas": ["shoulder_injury", "elbow_injury"],
  "Prensa de piernas": ["knee_injury"],
  "Sentadilla goblet": ["knee_injury"],
};

export function buildPlanningExerciseCatalog(data: ExerciseRow[]) {
  const manual = getManualIllustrationCatalog(data).catalog;
  const rows = new Map(data.map((row) => [row.id, row]));
  const released = new Set(releaseNames);
  const assignments: Record<string, string> = candidateMapping.assignments;
  const illustrations = new Map(illustrationCatalog.exercises.map((exercise) => [exercise.id, exercise]));
  const excluded: string[] = [];
  const catalog: PlanningCatalogExercise[] = [];
  for (const exercise of manual) {
    const row = rows.get(exercise.id);
    if (!row) {
      excluded.push(exercise.name);
      continue;
    }
    if (!row.is_momentum_approved && !released.has(exercise.name)) {
      excluded.push(exercise.name);
      continue;
    }
    if (!isAutomaticPlanningSource(row.media_source, row.name, row.description)) {
      excluded.push(row.name);
      continue;
    }
    const source = illustrations.get(assignments[exercise.name]);
    const equipment = requiredEquipment(row.equipment_required, source?.equipment ?? null, { name: exercise.name, illustrationId: source?.id });
    if (!equipment || !Array.isArray(row.restrictions) || !row.restrictions.every((item): item is string => typeof item === "string")) {
      excluded.push(row.name);
      continue;
    }
    catalog.push({
      id: row.id,
      name: row.name,
      primaryMuscle: exercisePrimaryMuscle(exercise.name, row.primary_muscle),
      muscleGroups: exercise.name === "Prensa de piernas" ? ["quadriceps", "glutes"] : Array.isArray(row.muscle_groups) ? row.muscle_groups.filter((item): item is string => typeof item === "string").map(normalizeMuscle) : [],
      restrictions: [...new Set([...row.restrictions, ...(additionalRestrictions[exercise.name] ?? [])])],
      equipment,
      difficulty: row.difficulty,
      hasTrustedMedia: Boolean(exercise.image),
    });
  }
  if (excluded.length) console.warn("Ejercicios excluidos de la planificación por datos o revisión pendientes:", excluded.join(", "));
  if (!catalog.length) throw new Error("No hay ejercicios del catálogo disponibles para la planificación automática.");
  return catalog;
}

export async function getPlanningExerciseCatalog() {
  const db = createAdminClient();
  const { data, error, count } = await db.from("exercises")
    .select("id, name, description, primary_muscle, muscle_groups, difficulty, equipment_required, restrictions, media_source, is_momentum_approved", { count: "exact" })
    .order("name");
  if (error) throw error;
  if (!data || count === null || count !== data.length) throw new Error("No se ha podido cargar el catálogo de ejercicios completo.");
  return buildPlanningExerciseCatalog(data);
}

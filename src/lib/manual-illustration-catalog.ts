import aliases from "../../data/illustration-library/catalog-aliases.json";
import illustrationCatalog from "../../data/illustration-library/catalog.json";
import candidateMapping from "../../data/illustration-library/candidate-mapping.json";
import superseded from "../../data/illustration-library/superseded-exercises.json";
import type { CatalogExercise } from "@/components/exercise-catalog-selector";
import { requiredEquipment } from "@/lib/exercise-equipment";
import { exercisePrimaryMuscle, normalizeMuscle } from "@/lib/exercise-muscles";
import { getExerciseIllustration } from "@/lib/illustration-media";
import { getIllustrationPreviewCatalog } from "@/lib/illustration-preview";
import { getExerciseMedia } from "@/lib/local-exercise-media";

type ExerciseRow = {
  id: string;
  name: string;
  primary_muscle: string | null;
  muscle_groups: unknown;
  difficulty: string;
  equipment_required: unknown;
  is_momentum_approved: boolean;
};

function databaseExercise(row: ExerciseRow): CatalogExercise {
  const media = getExerciseMedia(row.name);
  const illustration = getExerciseIllustration(row.name);
  return {
    id: row.id,
    name: row.name,
    primaryMuscle: row.primary_muscle ? normalizeMuscle(row.primary_muscle) : null,
    muscleGroups: Array.isArray(row.muscle_groups) ? row.muscle_groups.filter((value): value is string => typeof value === "string").map(normalizeMuscle) : [],
    difficulty: row.difficulty,
    equipment: Array.isArray(row.equipment_required) ? row.equipment_required.filter((value): value is string => typeof value === "string") : [],
    image: media?.[0] ?? null,
    imageEnd: media && media[0] !== media[1] ? media[1] : null,
    imageBackground: illustration ? "dark" : undefined,
    imageScale: illustration?.scale,
    lazyFrames: Boolean(illustration),
    illustration: Boolean(illustration),
  };
}

export function getManualIllustrationCatalog(rows: ExerciseRow[]) {
  const byName = new Map(rows.map((row) => [row.name, row]));
  const aliasNames: Record<string, string> = aliases;
  const usedIds = new Set<string>();
  const supersededNames = new Set(superseded);
  const illustrations = new Map(illustrationCatalog.exercises.map((exercise) => [exercise.id, exercise]));
  const assignments: Record<string, string> = candidateMapping.assignments;
  const catalog = getIllustrationPreviewCatalog().map((exercise): CatalogExercise => {
    const row = byName.get(exercise.name) ?? byName.get(aliasNames[exercise.name]);
    if (!row) return { ...exercise, id: `pending:${exercise.name}`, available: false };
    if (usedIds.has(row.id)) throw new Error(`Dos ejercicios comparten el mismo registro: ${exercise.name}`);
    usedIds.add(row.id);
    const illustration = illustrations.get(assignments[exercise.name]);
    const equipment = requiredEquipment(row.equipment_required, illustration?.equipment ?? null, { name: exercise.name, illustrationId: illustration?.id });
    const displayedEquipment = equipment ?? ["Material pendiente de revisión"];
    if (!exercise.illustration) return { ...databaseExercise(row), name: exercise.name, equipment: displayedEquipment };
    const primaryMuscle = exercisePrimaryMuscle(exercise.name, row.primary_muscle);
    return { ...exercise, id: row.id, difficulty: row.difficulty, equipment: displayedEquipment, primaryMuscle, muscleGroups: primaryMuscle ? [...new Set([primaryMuscle, ...exercise.muscleGroups])] : exercise.muscleGroups };
  });
  return {
    catalog: [...catalog, ...rows.filter((row) => row.is_momentum_approved && !usedIds.has(row.id) && !supersededNames.has(row.name)).map((row) => {
      const equipment = requiredEquipment(row.equipment_required, null, { name: row.name });
      return { ...databaseExercise(row), equipment: equipment ?? ["Material pendiente de revisión"] };
    })]
      .sort((a, b) => a.name.localeCompare(b.name, "es")),
    exerciseDetails: rows.map(databaseExercise),
  };
}

import { hasRequiredEquipment, type ExerciseEquipment } from "@/lib/exercise-equipment";
import type { PlanningCatalogExercise } from "@/lib/exercise-catalog";
import { normalizeSummaryMuscle } from "@/lib/exercise-muscles";
import { isTimedExercise, mainMovement } from "./movement-patterns";

export class PlanningAvailabilityError extends Error {}

const restrictedMuscles: Record<string, readonly string[]> = {
  shoulder_injury: ["deltoids", "pectorals", "lats"],
  knee_injury: ["quadriceps"],
  back_injury: ["lats", "lower_back"],
  elbow_injury: ["biceps", "triceps"],
  ankle_injury: ["calves"],
  neck_injury: ["traps"],
  wrist_injury: ["forearms"],
};

export function isPlanningExerciseCompatible(exercise: PlanningCatalogExercise, restrictions: string[], equipment: ExerciseEquipment[], beginner: boolean) {
  const muscles = [exercise.primaryMuscle, ...exercise.muscleGroups]
    .filter((muscle): muscle is string => Boolean(muscle))
    .map(normalizeSummaryMuscle);
  const upperLimbRestriction = restrictions.some((restriction) =>
    restriction === "shoulder_injury" || restriction === "elbow_injury" || restriction === "wrist_injury");
  const supportedOnHands = isTimedExercise(exercise.name) || /cuadrupedia|escaladores/i.test(exercise.name);
  const movement = mainMovement(exercise.name);
  return (!beginner || exercise.difficulty === "beginner") &&
    hasRequiredEquipment(exercise.equipment, equipment) &&
    !exercise.restrictions.some((restriction) => restrictions.includes(restriction)) &&
    !restrictions.some((restriction) => restrictedMuscles[restriction]?.some((muscle) => muscles.includes(muscle))) &&
    !(upperLimbRestriction && (supportedOnHands || movement === "push" || movement === "pull"));
}

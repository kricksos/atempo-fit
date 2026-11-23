import { muscleGroupLabels, normalizeSummaryMuscle } from "@/lib/exercise-muscles";
import { estimateStrengthSeconds } from "@/features/planning/strength-estimate";

type Exercise = { id: string; primaryMuscle: string | null; muscleGroups: string[] };
type Day = { id: string; name: string; orderNumber: number; exercises: Array<{ exerciseId: string; orderNumber: number; sets: number; restSeconds: number }> };
type StoredExercise = { exercise_id: string; order_number: number; sets: number; rest_seconds: number };
type DraftDay = { id: string; name: string; order_number: number; manual_workout_draft_exercises: StoredExercise[] };
type PlanVersion = { active: boolean; workout_days: Array<{ id: string; name: string; order_number: number; workout_exercises: StoredExercise[] }> };

export type WorkoutCardDay = {
  id: string;
  name: string;
  muscles: string[];
  exerciseCount: number;
  incomplete: boolean;
  estimatedMinutes: number | null;
};

export function workoutMuscleLookup(catalog: Exercise[], exerciseDetails: Exercise[]) {
  const lookup = new Map(exerciseDetails.map((exercise) => [exercise.id, exercise]));
  for (const exercise of catalog) lookup.set(exercise.id, exercise);
  return lookup;
}

export function summarizeWorkoutDays(days: Day[], lookup: Map<string, Exercise>): WorkoutCardDay[] {
  return [...days].sort((a, b) => a.orderNumber - b.orderNumber).map((day) => {
    const groups: string[] = [];
    let incomplete = false;
    for (const item of [...day.exercises].sort((a, b) => a.orderNumber - b.orderNumber)) {
      const exercise = lookup.get(item.exerciseId);
      if (!exercise) {
        incomplete = true;
        continue;
      }
      if (exercise.primaryMuscle?.trim()) groups.push(exercise.primaryMuscle);
      else incomplete = true;
    }
    const validTime = day.exercises.length > 0 && day.exercises.every((exercise) =>
      Number.isInteger(exercise.sets) && exercise.sets > 0 && Number.isInteger(exercise.restSeconds) && exercise.restSeconds >= 0);
    return {
      id: day.id, name: day.name, muscles: muscleGroupLabels(groups.map(normalizeSummaryMuscle)),
      exerciseCount: day.exercises.length, incomplete,
      estimatedMinutes: validTime ? Math.ceil(estimateStrengthSeconds(day.exercises) / 60) : null,
    };
  });
}

export function summarizeDraftDays(days: DraftDay[], lookup: Map<string, Exercise>) {
  return summarizeWorkoutDays(days.map((day) => ({
    id: day.id, name: day.name, orderNumber: day.order_number,
    exercises: day.manual_workout_draft_exercises.map((exercise) => ({ exerciseId: exercise.exercise_id, orderNumber: exercise.order_number, sets: exercise.sets, restSeconds: exercise.rest_seconds })),
  })), lookup);
}

export function summarizePlanDays(versions: PlanVersion[], lookup: Map<string, Exercise>) {
  const active = versions.filter((version) => version.active);
  if (active.length > 1) throw new Error("La rutina tiene más de una versión activa.");
  return summarizeWorkoutDays((active[0]?.workout_days ?? []).map((day) => ({
    id: day.id, name: day.name, orderNumber: day.order_number,
    exercises: day.workout_exercises.map((exercise) => ({ exerciseId: exercise.exercise_id, orderNumber: exercise.order_number, sets: exercise.sets, restSeconds: exercise.rest_seconds })),
  })), lookup);
}

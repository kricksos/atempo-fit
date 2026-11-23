import assert from "node:assert/strict";

import { summarizeDraftDays, summarizePlanDays, summarizeWorkoutDays, workoutMuscleLookup } from "../src/lib/workout-card-summary";

const lookup = workoutMuscleLookup(
  [
    { id: "press", primaryMuscle: "pectorals", muscleGroups: ["pectorals", "triceps"] },
    { id: "triceps", primaryMuscle: "triceps", muscleGroups: ["triceps"] },
  ],
  [
    { id: "press", primaryMuscle: "lats", muscleGroups: ["lats"] },
    { id: "historic", primaryMuscle: "glutes", muscleGroups: [] },
    { id: "unknown", primaryMuscle: null, muscleGroups: ["lats"] },
  ],
);
const item = (exerciseId: string, orderNumber: number) => ({ exerciseId, orderNumber, sets: 2, restSeconds: 60 });
const result = summarizeWorkoutDays([
  { id: "second", name: "Pierna", orderNumber: 2, exercises: [item("historic", 2), item("missing", 1)] },
  { id: "first", name: "Torso", orderNumber: 1, exercises: [item("triceps", 2), item("press", 1)] },
  { id: "empty", name: "Descanso", orderNumber: 3, exercises: [] },
  { id: "unknown", name: "Otro", orderNumber: 4, exercises: [item("unknown", 1)] },
  { id: "invalid", name: "Datos incompletos", orderNumber: 5, exercises: [{ ...item("press", 1), sets: 0 }] },
], lookup);
assert.deepEqual(result, [
  { id: "first", name: "Torso", muscles: ["Pectoral", "Tríceps"], exerciseCount: 2, incomplete: false, estimatedMinutes: 12 },
  { id: "second", name: "Pierna", muscles: ["Glúteos"], exerciseCount: 2, incomplete: true, estimatedMinutes: 12 },
  { id: "empty", name: "Descanso", muscles: [], exerciseCount: 0, incomplete: false, estimatedMinutes: null },
  { id: "unknown", name: "Otro", muscles: [], exerciseCount: 1, incomplete: true, estimatedMinutes: 9 },
  { id: "invalid", name: "Datos incompletos", muscles: ["Pectoral"], exerciseCount: 1, incomplete: false, estimatedMinutes: null },
]);

const planDay = { id: "plan-day", name: "Día activo", order_number: 1, workout_exercises: [{ exercise_id: "press", order_number: 1, sets: 2, rest_seconds: 60 }] };
const oldDay = { ...planDay, id: "old-day", name: "Versión anterior" };
const activeVersion = { active: true, workout_days: [planDay] };
assert.deepEqual(summarizePlanDays([{ active: false, workout_days: [oldDay] }, activeVersion], lookup), [
  { id: "plan-day", name: "Día activo", muscles: ["Pectoral"], exerciseCount: 1, incomplete: false, estimatedMinutes: 9 },
]);
assert.deepEqual(summarizePlanDays([{ active: false, workout_days: [oldDay] }], lookup), []);
assert.throws(() => summarizePlanDays([activeVersion, activeVersion], lookup), /más de una versión activa/);
assert.deepEqual(summarizeDraftDays([
  { id: "empty", name: "Vacío", order_number: 2, manual_workout_draft_exercises: [] },
  { id: "full", name: "Con ejercicios", order_number: 1, manual_workout_draft_exercises: [{ exercise_id: "historic", order_number: 1, sets: 2, rest_seconds: 60 }] },
], lookup), [
  { id: "full", name: "Con ejercicios", muscles: ["Glúteos"], exerciseCount: 1, incomplete: false, estimatedMinutes: 9 },
  { id: "empty", name: "Vacío", muscles: [], exerciseCount: 0, incomplete: false, estimatedMinutes: null },
]);
console.log("Resumen de sesiones: músculos y duración estimada correctos.");

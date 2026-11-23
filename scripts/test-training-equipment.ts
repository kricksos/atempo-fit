import assert from "node:assert/strict";

import reviewed from "../data/illustration-library/automatic-reviewed.json";
import { generateInitialPlan, isPlanningExerciseCompatible, parsePlanningProfile, PlanningAvailabilityError } from "../src/features/planning/engine";
import { equipmentForOnboarding, equipmentFromLabels, equipmentFromOnboardingAnswer, equipmentLabelsFromValues, gymEquipmentPreset, hasRequiredEquipment, homeEquipmentLabelsFromValues, homeEquipmentOptions, requiredEquipment } from "../src/lib/exercise-equipment";
import type { PlanningCatalogExercise } from "../src/lib/exercise-catalog";
import { isAutomaticPlanningSource, pendingManualExerciseSource } from "../src/lib/exercise-planning-source";
import { normalizeTrainingPlace, trainingPlaces } from "../src/lib/training-place";

assert.deepEqual(requiredEquipment([], ["machine"]), ["machine"]);
assert.deepEqual(requiredEquipment(["none_(bodyweight_exercise)"], ["barbell", "squat-rack"]), ["straight_bar", "rack"]);
assert.deepEqual(requiredEquipment(["cable"], ["cable"]), ["cable_machine"]);
assert.deepEqual(requiredEquipment(["dumbbell", "bench"], ["dumbbell", "incline-bench"]), ["dumbbell", "bench", "incline_bench"]);
assert.equal(requiredEquipment([], null), null);
assert.equal(requiredEquipment(["unknown-equipment"], []), null);
assert.equal(hasRequiredEquipment(["bench"], ["incline_bench"]), true);
assert.equal(hasRequiredEquipment(["bench"], ["decline_bench"]), false);
assert.equal(hasRequiredEquipment(["machine"], []), false);
assert.deepEqual(requiredEquipment(["machine"], ["machine"], { name: "Prensa de piernas", illustrationId: "leg-press" }), ["leg_press_machine"]);
assert.deepEqual(requiredEquipment(["machine"], ["machine"], { name: "Curl femoral", illustrationId: "leg-curl" }), ["leg_curl_lying_machine"]);
assert.deepEqual(requiredEquipment(["machine"], ["roman-chair"], { name: "Hiperextensiones lumbares", illustrationId: "back-extensions" }), ["hyperextension_bench"]);
assert.deepEqual(requiredEquipment(["machine"], null, { name: "Hiperextensión inversa" }), ["reverse_hyperextension_machine"]);
assert.deepEqual(requiredEquipment(["barbell"], ["barbell"], { name: "Subida al cajón con barra" }), ["straight_bar", "step"]);
assert.deepEqual(requiredEquipment(["barbell", "bench"], ["barbell", "bench"], { name: "Press banca" }), ["straight_bar", "bench", "rack"]);
assert.deepEqual(requiredEquipment(["barbell", "bench"], ["ez-bar", "bench"], { name: "Press francés con barra Z" }), ["bench", "ez_bar"]);
assert.deepEqual(requiredEquipment(["cable_machine"], null, { name: "Curl predicador en polea" }), ["cable_machine", "preacher_bench"]);
assert.deepEqual(requiredEquipment(["dumbbell"], ["dumbbell"], { name: "Aperturas posteriores con mancuernas" }), ["dumbbell", "incline_bench"]);
assert.deepEqual(requiredEquipment(["dumbbell", "bench"], null, { name: "Elevación posterior tumbado con mancuernas" }), ["dumbbell", "bench", "incline_bench"]);
assert.deepEqual(requiredEquipment(["cable_machine"], null, { name: "Remo elevado en polea" }), ["cable_machine", "step"]);
assert.deepEqual(requiredEquipment(["barbell", "dumbbell"], ["dumbbell"], { name: "Elevaciones frontales" }), ["dumbbell"]);
assert.equal(hasRequiredEquipment(["leg_press_machine"], ["leg_press_machine"]), true);
assert.equal(hasRequiredEquipment(["leg_press_machine"], ["machine"]), true);
assert.equal(hasRequiredEquipment(["leg_press_machine"], ["leg_extension_machine"]), false);
assert.equal(hasRequiredEquipment(["machine"], ["leg_press_machine"]), false);
assert.equal(hasRequiredEquipment(["ez_bar"], ["barbell"]), true);
assert.equal(hasRequiredEquipment(["straight_bar"], ["barbell"]), true);
assert.equal(hasRequiredEquipment(["ez_bar"], ["straight_bar"]), false);
assert.deepEqual(equipmentFromLabels(equipmentLabelsFromValues(["dumbbell", "bench"])), ["dumbbell", "bench"]);
assert.deepEqual(equipmentFromOnboardingAnswer(["Barra y discos, incluida barra Z"]), ["barbell"]);
assert.throws(() => equipmentFromLabels(["material desconocido"]), /Material desconocido/);
assert.equal(equipmentFromOnboardingAnswer(undefined), null);
assert.deepEqual(equipmentFromOnboardingAnswer(["Sin material"]), []);
assert.deepEqual(equipmentFromOnboardingAnswer(["Mancuernas"]), ["dumbbell"]);
assert.throws(() => equipmentFromOnboardingAnswer([]), /Selecciona/);
assert.throws(() => equipmentFromOnboardingAnswer(["Sin material", "Mancuernas"]), /no se puede combinar/);
assert.throws(() => equipmentFromOnboardingAnswer(["Mancuernas", 1]), /Selecciona/);
assert.throws(() => equipmentFromOnboardingAnswer(["material desconocido"]), /Material desconocido/);
assert.deepEqual(trainingPlaces.map((place) => place.value), ["Casa", "Gimnasio"]);
assert.equal(normalizeTrainingPlace("Gimnasio completo"), "Gimnasio");
assert.equal(normalizeTrainingPlace("Gimnasio básico"), "Gimnasio");
assert.equal(normalizeTrainingPlace("Mixto"), "Mixto");
assert.equal(normalizeTrainingPlace("desconocido"), null);
assert.deepEqual(equipmentForOnboarding("Gimnasio", undefined), gymEquipmentPreset());
assert.deepEqual(equipmentForOnboarding("Gimnasio", ["Sin material"]), gymEquipmentPreset());
assert.deepEqual(equipmentForOnboarding("Casa", ["Sin material"]), []);
assert.deepEqual(equipmentForOnboarding("Casa", ["Mancuernas", "Barra de dominadas"]), ["dumbbell", "pull_up_bar"]);
assert.throws(() => equipmentForOnboarding("Casa", undefined), /Indica el material/);
assert.equal(equipmentForOnboarding("Mixto", undefined), null);
assert.equal(homeEquipmentOptions.length, 11);
assert.deepEqual(equipmentForOnboarding("Casa", ["Mochila resistente con carga"]), ["backpack"]);
assert.equal(hasRequiredEquipment(["backpack"], []), false);
assert.equal(hasRequiredEquipment(["backpack"], ["backpack"]), true);
assert.ok(!homeEquipmentOptions.some((option) => option.value === "machine"));
assert.deepEqual(homeEquipmentLabelsFromValues(["barbell", "machine"]), ["Barra recta y discos", "Barra Z y discos"]);

assert.equal(Object.keys(reviewed).length, 55);
for (const [name, entry] of Object.entries(reviewed)) {
  assert.equal(isAutomaticPlanningSource(pendingManualExerciseSource, name, entry.description), true, name);
  assert.equal(isAutomaticPlanningSource(pendingManualExerciseSource, name, "descripción distinta"), false, name);
}
assert.equal(isAutomaticPlanningSource(pendingManualExerciseSource, "Ejercicio no revisado", "descripción"), false);

const catalog: PlanningCatalogExercise[] = [
  { name: "Sentadilla con peso corporal", primaryMuscle: "quadriceps", muscleGroups: ["quadriceps"], equipment: [], restrictions: [], difficulty: "beginner", hasTrustedMedia: true },
  { name: "Flexiones en pared", primaryMuscle: "pectorals", muscleGroups: ["pectorals"], equipment: [], restrictions: ["shoulder_injury"], difficulty: "beginner", hasTrustedMedia: true },
  { name: "Remo inclinado con mochila", primaryMuscle: "lats", muscleGroups: ["lats"], equipment: ["backpack"], restrictions: [], difficulty: "beginner", hasTrustedMedia: true },
  { name: "Prensa de piernas", primaryMuscle: "quadriceps", muscleGroups: ["quadriceps"], equipment: ["machine"], restrictions: [], difficulty: "beginner", hasTrustedMedia: true },
];
const base = {
  sex: "male" as const, age: 30, heightCm: 178, weightKg: 80, goal: "Ganar masa muscular",
  experience: "Nunca he entrenado", daysPerWeek: 3, sessionMinutes: 60, mealCount: 4,
  restrictions: ["shoulder_injury"],
};
const plan = generateInitialPlan({ ...base, trainingPlace: "Casa", trainingEquipment: ["backpack"] }, catalog, { allowAdaptation: true });
assert.equal(plan.days.length, 3);
for (const day of plan.days) for (const exercise of day.exercises) {
  const row = catalog.find((item) => item.name === exercise.name);
  assert.ok(row && isPlanningExerciseCompatible(row, base.restrictions, ["backpack"], true), exercise.name);
}
assert.ok(plan.workoutAdaptations.some((item) => item.kind === "coverage" && item.missingGroups.includes("pecho")));
assert.ok(plan.workoutAdaptations.some((item) => item.kind === "review"));
assert.throws(() => generateInitialPlan({ ...base, trainingPlace: "Casa" }, catalog), PlanningAvailabilityError);
const noCompatible = catalog.filter((exercise) => exercise.equipment.includes("machine"));
assert.throws(() => generateInitialPlan({ ...base, trainingPlace: "Casa", trainingEquipment: [] }, noCompatible), PlanningAvailabilityError);
assert.throws(() => generateInitialPlan({ ...base, trainingPlace: "Casa", trainingEquipment: [] }, noCompatible, { allowAdaptation: true }), /sesión alternativa compatible/);
assert.throws(() => parsePlanningProfile({ training_equipment: ["not-real"] }), PlanningAvailabilityError);
assert.deepEqual(parsePlanningProfile({ training_equipment: [] }).trainingEquipment, []);
assert.equal(parsePlanningProfile({}).trainingEquipment, null);
assert.deepEqual(parsePlanningProfile({ training_place: "Gimnasio", training_equipment: null }).trainingEquipment, gymEquipmentPreset());
assert.deepEqual(parsePlanningProfile({ training_place: "Gimnasio básico", training_equipment: ["dumbbell"] }).trainingEquipment, gymEquipmentPreset());
assert.deepEqual(parsePlanningProfile({ training_place: "Casa", training_equipment: ["dumbbell"] }).trainingEquipment, ["dumbbell"]);
assert.deepEqual(parsePlanningProfile({ training_place: "Mixto", training_equipment: ["dumbbell"] }).trainingEquipment, ["dumbbell"]);
console.log("Material y generación automática: pruebas correctas.");

import assert from "node:assert/strict";

import { generateInitialPlan, isPlanningExerciseCompatible, parsePlanningProfile, PlanningAvailabilityError } from "../src/features/planning/engine";
import { displayPrescription, isTimedPrescription, mainMovement } from "../src/features/planning/movement-patterns";
import { directSetBudget, estimateStrengthSeconds } from "../src/features/planning/workout-planner";
import type { PlanningCatalogExercise } from "../src/lib/exercise-catalog";
import { gymEquipmentPreset, type ExerciseEquipment } from "../src/lib/exercise-equipment";
import { workoutReplacementSessions, workoutTemplates } from "../src/lib/workout-templates";
import { continuityOptions, techniqueOptions } from "../src/lib/training-experience";

function exercise(name: string, primaryMuscle: string, equipment: ExerciseEquipment[] = [], restrictions: string[] = []): PlanningCatalogExercise {
  return { name, primaryMuscle, muscleGroups: [primaryMuscle], equipment, restrictions, difficulty: "beginner", hasTrustedMedia: true };
}
const catalog = [
  exercise("Sentadilla con peso corporal", "quadriceps", [], ["knee_injury"]),
  exercise("Prensa de piernas", "quadriceps", ["machine"], ["knee_injury"]),
  exercise("Sentadilla con banda elástica", "quadriceps", ["resistance_band"], ["knee_injury"]),
  exercise("Zancada atrás sin carga", "quadriceps", [], ["knee_injury"]),
  exercise("Puente de glúteos con peso corporal", "glutes"),
  exercise("Puente de glúteos a una pierna", "glutes"),
  exercise("Peso muerto rumano con pesa rusa", "hamstrings", ["kettlebell"], ["back_injury"]),
  exercise("Peso muerto rumano", "hamstrings", ["barbell"], ["back_injury"]),
  exercise("Flexiones en pared", "pectorals", [], ["shoulder_injury"]),
  exercise("Press banca en máquina", "pectorals", ["machine"], ["shoulder_injury"]),
  exercise("Press de pecho en polea", "pectorals", ["cable_machine"], ["shoulder_injury"]),
  exercise("Remo inclinado con mochila", "lats", ["backpack"], ["back_injury"]),
  exercise("Remo sentado con banda elástica", "lats", ["resistance_band"], ["back_injury"]),
  exercise("Remo sentado en polea", "lats", ["cable_machine"], ["back_injury"]),
  exercise("Jalon al pecho", "lats", ["cable_machine"]),
  exercise("Curl de bíceps con banda elástica", "biceps", ["resistance_band"]),
  exercise("Curl de bíceps con mancuernas", "biceps", ["dumbbell"]),
  exercise("Extensión de tríceps en polea", "triceps", ["cable_machine"]),
  exercise("Patada de tríceps con mancuerna", "triceps", ["dumbbell"]),
  exercise("Press de hombros con mancuernas", "deltoids", ["dumbbell"]),
  exercise("Elevaciones laterales con mancuernas", "deltoids", ["dumbbell"]),
  exercise("Elevación de gemelos en escalón", "calves", ["step"]),
  exercise("Plancha abdominal", "core"),
  exercise("Ejercicio ajeno a las plantillas", "quadriceps"),
];
const base = {
  sex: "male" as const, age: 30, heightCm: 178, weightKg: 80, goal: "Ganar masa muscular",
  experience: "Nunca he entrenado", daysPerWeek: 3, sessionMinutes: 45, mealCount: 4, restrictions: [],
};
const home: ExerciseEquipment[] = ["resistance_band", "backpack", "dumbbell", "step", "kettlebell"];
const gym = gymEquipmentPreset();
const byName = new Map(catalog.map((item) => [item.name, item]));

for (const [place, equipment] of [["Casa", home], ["Gimnasio", gym]] as const) {
  for (const experience of ["Nunca he entrenado", "Entre 1 y 3 años"]) {
    const level = experience === "Nunca he entrenado" ? "beginner" : "intermediate";
    for (const daysPerWeek of [2, 3, 4, 5, 6]) for (const sessionMinutes of [30, 45, 60]) {
      const profile = { ...base, trainingPlace: place, trainingEquipment: equipment, experience, daysPerWeek, sessionMinutes };
      const plan = generateInitialPlan(profile, catalog, { allowAdaptation: true });
      const template = workoutTemplates.find((item) => item.place === place && item.level === level && item.days.length === daysPerWeek)!;
      const allowed = new Set([...template.days, ...workoutReplacementSessions(place, level)].flatMap((day) =>
        day.exercises.flatMap((item) => [item.name, ...(item.alternatives ?? [])])));
      assert.match(plan.structure, new RegExp(template.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
      assert.equal(plan.days.length, daysPerWeek);
      if (daysPerWeek <= 3) assert.ok(plan.days.every((day) => day.name.startsWith("Cuerpo completo")));
      const direct = new Map<string, number>();
      for (const day of plan.days) {
        assert.ok(day.exercises.length);
        assert.ok(estimateStrengthSeconds(day.exercises) <= sessionMinutes * 60);
        assert.equal(new Set(day.exercises.map((item) => item.name)).size, day.exercises.length);
        for (const item of day.exercises) {
          const entry = byName.get(item.name);
          assert.ok(entry && allowed.has(item.name) && isPlanningExerciseCompatible(entry, [], equipment, level === "beginner"), item.name);
          direct.set(entry.primaryMuscle!, (direct.get(entry.primaryMuscle!) ?? 0) + item.sets);
          if (item.name === "Plancha abdominal") assert.equal(item.repetitions, "20-30 segundos");
        }
      }
      for (const [group, sets] of direct) assert.ok(sets <= directSetBudget(profile, group), `${group}: ${sets} series`);
    }
  }
}

for (const restrictions of [
  ["shoulder_injury"], ["knee_injury"], ["back_injury"], ["elbow_injury"],
  ["ankle_injury"], ["neck_injury"], ["wrist_injury"], ["shoulder_injury", "knee_injury"],
]) {
  for (const daysPerWeek of [2, 4, 6]) {
    const profile = { ...base, trainingPlace: "Gimnasio", trainingEquipment: gym, restrictions, daysPerWeek };
    const plan = generateInitialPlan(profile, catalog, { allowAdaptation: true });
    assert.equal(plan.days.length, daysPerWeek);
    assert.ok(plan.workoutAdaptations.some((item) => item.kind === "review" && item.reasons.some((reason) => reason.includes("profesional"))));
    for (const day of plan.days) {
      assert.ok(day.exercises.length && estimateStrengthSeconds(day.exercises) <= profile.sessionMinutes * 60);
      for (const item of day.exercises) {
        const row = byName.get(item.name);
        assert.ok(row && isPlanningExerciseCompatible(row, restrictions, gym, true), item.name);
      }
    }
  }
}
const shoulder = generateInitialPlan({ ...base, daysPerWeek: 4, trainingPlace: "Gimnasio", trainingEquipment: gym, restrictions: ["shoulder_injury"] }, catalog, { allowAdaptation: true });
assert.ok(shoulder.days.every((day) => day.name.startsWith("Piernas")));
const shoulderGroups = shoulder.days.map((day) => new Set(day.exercises.map((item) => byName.get(item.name)?.primaryMuscle)));
for (let index = 1; index < shoulderGroups.length; index++) {
  assert.ok([...shoulderGroups[index]].every((group) => !shoulderGroups[index - 1].has(group)), "Las sesiones alternativas deben evitar repetir músculos principales cuando sea posible.");
}
assert.ok(shoulder.workoutAdaptations.some((item) => item.kind === "coverage" && item.missingGroups.includes("pecho")));
const noBack = generateInitialPlan({ ...base, daysPerWeek: 4, trainingPlace: "Casa", trainingEquipment: [] }, catalog, { allowAdaptation: true });
assert.ok(noBack.workoutAdaptations.some((item) => item.kind === "coverage" && item.missingGroups.includes("espalda")));
assert.ok(noBack.days.every((day) => day.exercises.length));
assert.throws(() => generateInitialPlan({ ...base, trainingPlace: "Casa" }, catalog), PlanningAvailabilityError);
assert.throws(() => generateInitialPlan({ ...base, trainingPlace: "Casa", trainingEquipment: [] }, [catalog[1]], { allowAdaptation: true }), PlanningAvailabilityError);
assert.throws(() => generateInitialPlan({ ...base, trainingPlace: "Casa", trainingEquipment: [], restrictions: ["unknown_injury"] }, catalog, { allowAdaptation: true }), PlanningAvailabilityError);

const normalProfile = { ...base, daysPerWeek: 2, trainingPlace: "Gimnasio", trainingEquipment: gym, sessionMinutes: 60 };
const normal = generateInitialPlan(normalProfile, catalog, { allowAdaptation: true });
const parsedTraining = parsePlanningProfile({ experience: "Más de 5 años", training_continuity: continuityOptions[1], training_technique: techniqueOptions[0] });
assert.equal(parsedTraining.trainingContinuity, continuityOptions[1]);
assert.equal(parsedTraining.trainingTechnique, techniqueOptions[0]);
const experienced = { ...normalProfile, experience: "Más de 5 años" };
const legacyPlan = generateInitialPlan(experienced, catalog, { allowAdaptation: true });
const returningPlan = generateInitialPlan({ ...experienced, trainingContinuity: continuityOptions[1], trainingTechnique: techniqueOptions[0] }, catalog, { allowAdaptation: true });
const needsHelpPlan = generateInitialPlan({ ...experienced, trainingContinuity: continuityOptions[0], trainingTechnique: techniqueOptions[1] }, catalog, { allowAdaptation: true });
assert.equal(directSetBudget(experienced, "pectorals"), 8);
assert.equal(directSetBudget({ ...experienced, trainingContinuity: continuityOptions[1] }, "pectorals"), 6);
assert.notDeepEqual(returningPlan.days, legacyPlan.days);
assert.deepEqual(returningPlan.days, needsHelpPlan.days);
assert.ok(returningPlan.workoutAdaptations.some((item) => item.kind === "review" && item.reasons.some((reason) => reason.includes("continuidad"))));
const foodChanged = generateInitialPlan({ ...normalProfile, age: 45, weightKg: 90, mealCount: 5 }, catalog, { allowAdaptation: true });
assert.deepEqual(normal.days, foodChanged.days);
const priority = generateInitialPlan({ ...normalProfile, priorities: ["pecho"] }, catalog, { allowAdaptation: true });
const chestSets = (plan: typeof normal) => plan.days.flatMap((day) => day.exercises).filter((item) => byName.get(item.name)?.primaryMuscle === "pectorals").reduce((sum, item) => sum + item.sets, 0);
assert.ok(chestSets(priority) > chestSets(normal));
const advancedTemplate = workoutTemplates.find((item) => item.id === "estudio-arazi-gimnasio-avanzado-4")!;
const advancedCatalog = [...catalog];
for (const name of new Set(advancedTemplate.days.flatMap((day) => day.exercises.map((item) => item.name)))) {
  if (!advancedCatalog.some((item) => item.name === name)) advancedCatalog.push(exercise(name, "quadriceps"));
}
const advancedProfile = {
  ...base, experience: "Entre 3 y 5 años", trainingContinuity: continuityOptions[0],
  trainingTechnique: techniqueOptions[0], trainingPlace: "Gimnasio", trainingEquipment: gym,
  daysPerWeek: 4, sessionMinutes: 60, priorities: ["pecho"],
};
const advanced = generateInitialPlan(advancedProfile, advancedCatalog, { allowAdaptation: true });
assert.deepEqual(advanced.days, advancedTemplate.days.map((day) => ({
  name: day.name,
  exercises: day.exercises.map(({ name, sets, repetitions, restSeconds }) => ({ name, sets, repetitions, restSeconds })),
})));
assert.ok(advanced.workoutAdaptations.some((item) => item.kind === "review" && item.reasons.some((reason) => reason.includes("10.7717/peerj.10537"))));
const fallbackProfiles = [
  { trainingContinuity: null }, { trainingTechnique: techniqueOptions[1] }, { experience: "Entre 1 y 3 años" },
  { daysPerWeek: 2 }, { daysPerWeek: 3 }, { trainingPlace: "Casa" }, { trainingEquipment: [] },
  { restrictions: ["shoulder_injury"] }, { restrictionsKnown: false }, { sessionMinutesKnown: false },
  { sessionMinutes: advancedTemplate.minutes - 1 }, { goal: "Mejorar salud general" },
];
for (const changes of fallbackProfiles) {
  const plan = generateInitialPlan({ ...advancedProfile, ...changes }, advancedCatalog, { allowAdaptation: true });
  assert.notEqual(plan.structure, advancedTemplate.name, JSON.stringify(changes));
}
const missingAdvanced = generateInitialPlan(advancedProfile, advancedCatalog.filter((item) => item.name !== advancedTemplate.days[0].exercises[0].name), { allowAdaptation: true });
assert.notEqual(missingAdvanced.structure, advancedTemplate.name);
assert.ok(missingAdvanced.workoutAdaptations.some((item) => item.kind === "review" && item.reasons.some((reason) => reason.includes("base anterior"))));
assert.equal(parsePlanningProfile({}).sessionMinutesKnown, false);
assert.equal(parsePlanningProfile({}).restrictionsKnown, false);
assert.equal(isPlanningExerciseCompatible(exercise("Press sin etiqueta", "pectorals"), ["shoulder_injury"], [], true), false);
assert.equal(isPlanningExerciseCompatible({ ...exercise("Ejercicio con hombro secundario", "glutes"), muscleGroups: ["glutes", "deltoids"] }, ["shoulder_injury"], [], true), false);
assert.equal(isPlanningExerciseCompatible(exercise("Plancha abdominal", "core"), ["shoulder_injury"], [], true), false);
assert.equal(isPlanningExerciseCompatible(exercise("Abducción en cuadrupedia", "glutes"), ["wrist_injury"], [], true), false);
assert.equal(mainMovement("Extensión de cuádriceps"), null);
assert.equal(mainMovement("Curl femoral"), null);
assert.equal(isTimedPrescription("Plancha abdominal", "8-12"), true);
assert.equal(displayPrescription("Plancha abdominal", "8-12"), "20-30 segundos");
console.log("Selector automático: plantillas, perfiles, material, lesiones, tiempo y prioridades correctos.");

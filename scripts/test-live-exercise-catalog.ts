import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadEnvConfig } from "@next/env";
import generatedIllustrations from "../data/generated-illustrations/released.json";
import { generateInitialPlan, isPlanningExerciseCompatible, parsePlanningProfile } from "../src/features/planning/engine";
import { mainMovement } from "../src/features/planning/movement-patterns";
import { estimateStrengthSeconds } from "../src/features/planning/workout-planner";
import { buildPlanningExerciseCatalog } from "../src/lib/exercise-catalog";
import { equipmentOptions, gymEquipmentPreset, specificMachineOptions, type ExerciseEquipment } from "../src/lib/exercise-equipment";
import { getManualIllustrationCatalog } from "../src/lib/manual-illustration-catalog";
import { workoutReplacementSessions, workoutTemplates } from "../src/lib/workout-templates";
import { createAdminClient } from "../src/lib/supabase/admin";
import { homeExerciseFixtures } from "./home-exercise-fixtures";
import { moreHomeExerciseFixtures } from "./more-home-exercise-fixtures";

async function main() {
  loadEnvConfig(process.cwd());
  const { data, error, count } = await createAdminClient().from("exercises")
    .select("id, name, description, primary_muscle, muscle_groups, difficulty, equipment_required, restrictions, media_source, is_momentum_approved", { count: "exact" })
    .order("name");
  if (error) throw error;
  assert.ok(data && count === data.length, "El catálogo de la base debe estar completo");
  const cards = getManualIllustrationCatalog(data).catalog;
  const expectedPending = new Set<string>([...homeExerciseFixtures, ...moreHomeExerciseFixtures].map((fixture) => fixture.name));
  const pending = cards.filter((exercise) => exercise.available === false);
  for (const card of pending) assert.ok(expectedPending.has(card.name), `Registro inesperadamente pendiente: ${card.name}`);
  if (pending.length) console.log(`${pending.length} fichas de los lotes de casa todavía no están activas en esta base.`);
  const manual = cards.filter((exercise) => exercise.available !== false);
  const namesById = new Map(data.map((row) => [row.id, row.name]));
  const automatic = buildPlanningExerciseCatalog(data);
  const manualNames = manual.map((exercise) => {
    const name = namesById.get(exercise.id);
    assert.ok(name, `Falta el registro de ${exercise.name}`);
    return name;
  }).sort();
  assert.ok(manualNames.length >= 148, "El catálogo debe conservar las 148 fichas revisadas");
  assert.deepEqual(automatic.map((exercise) => exercise.name).sort(), manualNames, "Las fichas manuales y automáticas deben coincidir");
  assert.ok(automatic.every((exercise) => !exercise.equipment.includes("machine")), "Cada máquina del catálogo debe estar identificada");
  for (const option of specificMachineOptions) {
    assert.ok(automatic.some((exercise) => exercise.equipment.includes(option.value)), `Máquina sin ejercicios: ${option.label}`);
  }
  for (const card of manual) {
    const name = namesById.get(card.id);
    const generated = automatic.find((exercise) => exercise.name === name);
    assert.ok(generated, card.name);
    assert.deepEqual(card.equipment, generated.equipment, `Material inconsistente: ${card.name}`);
    assert.equal(card.primaryMuscle, generated.primaryMuscle, `Músculo principal inconsistente: ${card.name}`);
  }
  for (const fixture of [...homeExerciseFixtures, ...moreHomeExerciseFixtures]) {
    const row: (typeof data)[number] | undefined = data.find((exercise) => exercise.name === fixture.name);
    if (!row) continue;
    const card = manual.find((exercise) => exercise.id === row.id);
    const generated = automatic.find((exercise) => exercise.name === fixture.name);
    assert.ok(card?.image && card.imageEnd && generated?.hasTrustedMedia, `Ficha o imágenes no disponibles: ${fixture.name}`);
    assert.equal(row.description, fixture.description, fixture.name);
    assert.equal(row.difficulty, fixture.difficulty, fixture.name);
    assert.equal(row.primary_muscle, fixture.primary_muscle, fixture.name);
    assert.deepEqual(row.muscle_groups, fixture.muscle_groups, fixture.name);
    assert.deepEqual(row.equipment_required, fixture.equipment_required, fixture.name);
    assert.deepEqual(row.restrictions, fixture.restrictions, fixture.name);
  }
  for (const name of Object.keys(generatedIllustrations)) {
    const card = manual.find((exercise) => exercise.name === name);
    const generated = automatic.find((exercise) => exercise.name === name);
    assert.ok(card?.image && card.imageEnd, `Faltan fotogramas para ${name}`);
    assert.ok(generated?.hasTrustedMedia, `La rutina automática no reconoce las imágenes de ${name}`);
  }
  assert.equal(automatic.find((exercise) => exercise.name === "Prensa de piernas")?.primaryMuscle, "quadriceps");
  assert.deepEqual(automatic.find((exercise) => exercise.name === "Prensa de piernas")?.equipment, ["leg_press_machine"]);
  const migration = readFileSync(join("supabase", "migrations", "0049_approve_manual_exercises.sql"), "utf8");
  const approvalBlock = migration.match(/where name in \(([\s\S]*?)\) and is_momentum_approved = false;/)?.[1];
  assert.ok(approvalBlock, "Falta la lista de aprobación de la migración");
  const approvalNames = [...approvalBlock.matchAll(/'([^']+)'/g)].map((match) => match[1]);
  assert.equal(approvalNames.length, 41);
  assert.equal(new Set(approvalNames).size, approvalNames.length);
  for (const name of approvalNames) assert.ok(manualNames.includes(name), `La migración incluye una ficha ajena: ${name}`);
  for (const card of manual) {
    const row = data.find((exercise) => exercise.id === card.id);
    if (row && !row.is_momentum_approved) assert.ok(approvalNames.includes(row.name), `Falta aprobar ${card.name}`);
  }

  const allEquipment = equipmentOptions.filter((option) => option.value !== "machine" && option.value !== "barbell").map((option) => option.value);
  const machineValues = new Set<string>(specificMachineOptions.map((option) => option.value));
  const legacyEquipment = equipmentOptions.filter((option) => !machineValues.has(option.value) && option.value !== "straight_bar" && option.value !== "ez_bar").map((option) => option.value);
  const scenarios: Array<{ place: string; equipment: ExerciseEquipment[] }> = [
    { place: "Casa", equipment: ["dumbbell", "bench", "pull_up_bar"] },
    { place: "Gimnasio", equipment: ["dumbbell", "bench", "pull_up_bar", "leg_press_machine"] },
    { place: "Mixto", equipment: ["dumbbell", "bench", "pull_up_bar"] },
    { place: "Gimnasio", equipment: allEquipment },
    { place: "Gimnasio", equipment: legacyEquipment },
  ];
  const base = {
    sex: "male" as const, age: 30, heightCm: 178, weightKg: 80, goal: "Ganar masa muscular",
    experience: "Entre 1 y 3 años", daysPerWeek: 3, sessionMinutes: 60, mealCount: 4, restrictions: [],
  };
  const gymProfile = parsePlanningProfile({
    sex: "male", age: 30, height_cm: 178, current_weight_kg: 80, primary_goal: "Ganar masa muscular",
    experience: "Entre 1 y 3 años", days_per_week: 3, session_duration_minutes: 60, meal_count: 4,
    training_place: "Gimnasio", training_equipment: null,
  });
  assert.deepEqual(gymProfile.trainingEquipment, gymEquipmentPreset());
  const gymPlan = generateInitialPlan(gymProfile, automatic);
  for (const day of gymPlan.days) for (const exercise of day.exercises) {
    const row = automatic.find((candidate) => candidate.name === exercise.name);
    assert.ok(row && isPlanningExerciseCompatible(row, [], gymEquipmentPreset(), false), exercise.name);
  }
  for (const { place, equipment } of scenarios) {
    const plan = generateInitialPlan({ ...base, trainingPlace: place, trainingEquipment: equipment }, automatic, { allowAdaptation: true });
    assert.equal(plan.days.length, 3);
    for (const day of plan.days) {
      assert.ok(day.exercises.length > 0 && day.exercises.length <= 8);
      for (const exercise of day.exercises) {
        const row = automatic.find((candidate) => candidate.name === exercise.name);
        assert.ok(row && isPlanningExerciseCompatible(row, [], equipment, false), exercise.name);
      }
    }
  }
  const homeEquipment: ExerciseEquipment[] = ["dumbbell", "ez_bar", "bench", "incline_bench", "pull_up_bar"];
  for (const { place, equipment } of [{ place: "Casa", equipment: homeEquipment }, { place: "Gimnasio", equipment: gymEquipmentPreset() }] as const) {
    for (const experience of ["Nunca he entrenado", "Entre 1 y 3 años"]) {
      for (const daysPerWeek of [2, 3, 4, 5, 6]) {
        const plan = generateInitialPlan({ ...base, experience, daysPerWeek, trainingPlace: place, trainingEquipment: equipment }, automatic, { allowAdaptation: true });
        const level = experience === "Nunca he entrenado" ? "beginner" : "intermediate";
        const template = workoutTemplates.find((item) => item.place === place && item.level === level && item.days.length === daysPerWeek)!;
        const allowed = new Set([...template.days, ...workoutReplacementSessions(place, level)].flatMap((day) =>
          day.exercises.flatMap((item) => [item.name, ...(item.alternatives ?? [])])));
        assert.equal(plan.days.length, daysPerWeek);
        for (const [index, day] of plan.days.entries()) {
          assert.ok(day.exercises.length > 0 && day.exercises.length <= 8);
          assert.ok(estimateStrengthSeconds(day.exercises) <= base.sessionMinutes * 60);
          assert.equal(new Set(day.exercises.map((exercise) => exercise.name)).size, day.exercises.length);
          const warning = plan.workoutAdaptations.filter((item) => "dayIndex" in item).find((item) => item.dayIndex === index + 1);
          if (warning) assert.equal(warning.actualExercises, day.exercises.length);
          const movements = day.exercises.map((exercise) => mainMovement(exercise.name));
          const groups = new Set(day.exercises.map((exercise) => automatic.find((candidate) => candidate.name === exercise.name)?.primaryMuscle));
          const required = [
            groups.has("quadriceps") && "knee", groups.has("pectorals") && "push", groups.has("lats") && "pull",
            (groups.has("glutes") || groups.has("hamstrings")) && "hip",
          ].filter(Boolean);
          if (!warning) for (const movement of required) assert.ok(movements.includes(movement as ReturnType<typeof mainMovement>), `${day.name}: ${movement}`);
          for (const exercise of day.exercises) {
            const row = automatic.find((candidate) => candidate.name === exercise.name);
            assert.ok(row && allowed.has(exercise.name) && isPlanningExerciseCompatible(row, [], equipment, experience === "Nunca he entrenado"), exercise.name);
          }
        }
      }
    }
  }
  const baseline = generateInitialPlan({ ...base, trainingPlace: "Gimnasio", trainingEquipment: allEquipment }, automatic, { allowAdaptation: true });
  const foodChanged = generateInitialPlan({ ...base, age: 50, weightKg: 90, mealCount: 5, trainingPlace: "Gimnasio", trainingEquipment: allEquipment }, automatic, { allowAdaptation: true });
  assert.deepEqual(baseline.days, foodChanged.days, "Los datos de nutrición no deben alterar la rutina");
  console.log(`Catálogo real: ${automatic.length} fichas coincidentes; patrones, escenarios y material compatibles.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadEnvConfig } from "@next/env";

import { WorkoutTemplateLibrary } from "../src/components/workout-template-library";
import { mainMovement } from "../src/features/planning/movement-patterns";
import { generateInitialPlan } from "../src/features/planning/engine";
import { estimateStrengthSeconds } from "../src/features/planning/workout-planner";
import { gymEquipmentPreset, type ExerciseEquipment } from "../src/lib/exercise-equipment";
import { getWorkoutTemplateCatalogs } from "../src/lib/manual-exercise-catalog-server";
import { reviewWorkoutTemplate, workoutTemplates } from "../src/lib/workout-templates";
import { advancedTrainingReadiness, continuityOptions, techniqueOptions } from "../src/lib/training-experience";

async function main() {
  loadEnvConfig(process.cwd());
  const { planning, manual } = await getWorkoutTemplateCatalogs();
  const cards = [...manual.catalog, ...manual.exerciseDetails];
  const byName = new Map(planning.map((exercise) => [exercise.name, exercise]));
  const home = { experience: "Nunca he entrenado", training_place: "Casa", training_equipment: ["dumbbell", "bench", "backpack", "resistance_band", "step"], restrictions: [] };
  const gym = { ...home, training_place: "Gimnasio" };
  assert.equal(workoutTemplates.length, 31);
  assert.equal(new Set(workoutTemplates.map((template) => template.id)).size, workoutTemplates.length);
  for (const place of ["Casa", "Gimnasio"] as const) for (const level of ["beginner", "intermediate"] as const) {
    const options = workoutTemplates.filter((template) => template.variant === "base" && template.place === place && template.level === level);
    assert.deepEqual(options.map((template) => template.days.length), [2, 3, 4, 5, 6]);
    for (const template of options) {
      const profile = { ...(place === "Casa" ? home : gym), experience: level === "beginner" ? home.experience : "Entre 1 y 3 años", days_per_week: template.days.length };
      const review = reviewWorkoutTemplate(template, profile, planning, cards);
      assert.deepEqual(review.issues, [], `${template.id}: ${review.issues.join(" ")}`);
      assert.equal(review.resolvedDays.length, template.days.length);
      assert.equal(review.template.minutes, Math.ceil(Math.max(...review.template.days.map((day) => estimateStrengthSeconds(day.exercises))) / 60));
      for (const [index, day] of review.template.days.entries()) {
        assert.ok(day.exercises.length);
        assert.equal(day.exercises.length, review.resolvedDays[index].exercises.length);
        assert.equal(new Set(day.exercises.map((item) => item.name)).size, day.exercises.length);
        const movements = new Set(day.exercises.map((item) => mainMovement(item.name)));
        assert.ok(day.requiredMovements.every((movement) => movements.has(movement)), `${template.id}: ${day.name}`);
        for (const item of day.exercises) assert.ok(byName.has(item.name) && item.sets > 0);
      }
      if (template.days.length <= 3) assert.ok(template.days.every((day) => day.name.startsWith("Cuerpo completo")));
      else {
        assert.ok(template.days.some((day) => day.name === "Pecho y tríceps"));
        assert.ok(template.days.some((day) => day.name === "Espalda y bíceps"));
        assert.ok(template.days.some((day) => day.name.startsWith("Piernas")));
      }
    }
  }
  const template = workoutTemplates.find((item) => item.id === "base-casa-beginner-2")!;
  const first = template.days[0].exercises[0];
  const replaced = reviewWorkoutTemplate(template, home, planning.filter((item) => item.name !== first.name), cards);
  assert.deepEqual(replaced.issues, []);
  assert.notEqual(replaced.template.days[0].exercises[0].name, first.name);
  assert.ok(replaced.warnings.some((warning) => warning.includes(`${first.name} se sustituye`)));
  const removed = new Set([first.name, ...(first.alternatives ?? [])]);
  const unavailable = reviewWorkoutTemplate(template, home, planning.filter((item) => !removed.has(item.name)), cards);
  assert.ok(unavailable.issues.some((issue) => issue.includes("alternativa compatible")));
  assert.ok(unavailable.issues.some((issue) => issue.includes("movimientos principales")));
  const short = reviewWorkoutTemplate(template, { ...home, session_duration_minutes: 10 }, planning, cards);
  assert.deepEqual(short.issues, []);
  assert.ok(short.warnings.some((warning) => warning.includes("minutos")));
  assert.ok(reviewWorkoutTemplate(template, { ...home, restrictions: ["shoulder_injury"] }, planning, cards).issues.length);
  assert.ok(reviewWorkoutTemplate(template, { ...home, training_equipment: null }, planning, cards).issues.some((issue) => issue.includes("material")));
  assert.ok(reviewWorkoutTemplate(template, { ...home, restrictions: ["unknown_restriction"] }, planning, cards).issues.some((issue) => issue.includes("No se pueden verificar")));
  const fewerDays = reviewWorkoutTemplate(template, { ...home, days_per_week: 4 }, planning, cards);
  assert.deepEqual(fewerDays.issues, []);
  assert.ok(fewerDays.warnings.some((warning) => warning.includes("2 días") && warning.includes("perfil indica 4")));
  assert.equal(fewerDays.resolvedDays.length, 2);
  const moreDays = reviewWorkoutTemplate(workoutTemplates.find((item) => item.id === "base-casa-beginner-4")!, { ...home, days_per_week: 2 }, planning, cards);
  assert.deepEqual(moreDays.issues, []);
  assert.ok(moreDays.warnings.some((warning) => warning.includes("4 días") && warning.includes("perfil indica 2")));
  assert.equal(moreDays.resolvedDays.length, 4);
  assert.ok(reviewWorkoutTemplate(template, { ...home, days_per_week: 4, restrictions: ["shoulder_injury"] }, planning, cards).issues.length);
  const split = workoutTemplates.find((item) => item.id === "base-gimnasio-beginner-4")!;
  const missingBiceps = reviewWorkoutTemplate(split, { ...gym, days_per_week: 4 }, planning.filter((item) => item.primaryMuscle !== "biceps"), cards);
  assert.ok(missingBiceps.issues.some((issue) => issue.includes("Espalda y bíceps") && issue.includes("Bíceps")));
  const missingCore = reviewWorkoutTemplate(split, { ...gym, days_per_week: 4 }, planning.filter((item) => item.primaryMuscle !== "core"), cards);
  assert.ok(missingCore.issues.some((issue) => issue.includes("Hombros y core") && issue.includes("Core")));
  const studied = workoutTemplates.filter((item) => item.id.startsWith("estudio-pedersen-"));
  assert.deepEqual(studied.map((item) => item.days.length), [2, 4]);
  for (const item of studied) {
    assert.ok(item.evidence);
    assert.ok(item.evidence.url.includes("10.1186/s13102-022-00481-7"));
    assert.ok(item.evidence.differences.length && item.evidence.guidance.length);
    const review = reviewWorkoutTemplate(item, { ...gym, days_per_week: item.days.length }, planning, cards);
    assert.deepEqual(review.issues, [], `${item.id}: ${review.issues.join(" ")}`);
    assert.deepEqual(review.template.days.map((day) => day.exercises.length), item.days.length === 2 ? [9, 9] : [4, 5, 4, 5]);
    assert.ok(review.template.days.every((day) => day.exercises.every((exercise) => exercise.sets === 3 && exercise.restSeconds === 60)));
    assert.equal(review.template.minutes, Math.ceil(Math.max(...review.template.days.map((day) => estimateStrengthSeconds(day.exercises))) / 60));
    const missing = reviewWorkoutTemplate(item, { ...gym, days_per_week: item.days.length }, planning.filter((exercise) => exercise.name !== "Puente de glúteos con peso corporal"), cards);
    assert.ok(missing.issues.some((issue) => issue.includes("Puente de glúteos con peso corporal")));
    assert.ok(reviewWorkoutTemplate(item, { ...gym, days_per_week: item.days.length, restrictions: ["shoulder_injury"] }, planning, cards).issues.length);
  }
  const addedStudies = workoutTemplates.filter((item) => item.variant === "study" && !item.id.startsWith("estudio-pedersen-"));
  assert.equal(addedStudies.length, 9);
  for (const item of addedStudies) {
    assert.ok(item.evidence?.url && item.evidence.differences.length && item.evidence.guidance.length);
    const profile = {
      ...(item.place === "Casa" ? home : gym),
      experience: item.level === "beginner" ? home.experience : "Entre 3 y 5 años",
      days_per_week: item.days.length,
    };
    const review = reviewWorkoutTemplate(item, profile, planning, cards);
    assert.deepEqual(review.issues, [], `${item.id}: ${review.issues.join(" ")}`);
    assert.equal(review.resolvedDays.length, item.days.length);
    for (const day of review.template.days) {
      assert.ok(day.exercises.length >= 4, `${item.id}: ${day.name}`);
      assert.equal(new Set(day.exercises.map((exercise) => exercise.name)).size, day.exercises.length);
      assert.ok(day.requiredMovements.every((movement) => day.exercises.some((exercise) => mainMovement(exercise.name) === movement)));
      assert.ok(day.exercises.every((exercise) => byName.has(exercise.name) && exercise.sets >= 2 && !exercise.optional));
    }
    const advanced = workoutTemplates.find((item) => item.id === "estudio-arazi-gimnasio-avanzado-4")!;
    const selected = generateInitialPlan({
      sex: "male", age: 30, heightCm: 178, weightKg: 80, goal: "Ganar masa muscular",
      experience: "Entre 3 y 5 años", trainingContinuity: continuityOptions[0], trainingTechnique: techniqueOptions[0],
      daysPerWeek: 4, sessionMinutes: 60, mealCount: 4, trainingPlace: "Gimnasio", trainingEquipment: gymEquipmentPreset(), restrictions: [],
    }, planning, { allowAdaptation: true });
    assert.equal(selected.structure, advanced.name, "La rutina avanzada debe poder seleccionarse con el catálogo real.");
    assert.deepEqual(selected.days.map((day) => day.exercises.map((item) => item.name)), advanced.days.map((day) => day.exercises.map((item) => item.name)));
    assert.equal(review.template.minutes, Math.ceil(Math.max(...review.template.days.map((day) => estimateStrengthSeconds(day.exercises))) / 60) + (item.estimatedExtraMinutes ?? 0));
    const missingName = item.days[0].exercises[0].name;
    const missing = reviewWorkoutTemplate(item, profile, planning.filter((exercise) => exercise.name !== missingName), cards);
    assert.ok(missing.issues.some((issue) => issue.includes(missingName)));
    assert.ok(reviewWorkoutTemplate(item, { ...profile, restrictions: ["shoulder_injury"] }, planning, cards).issues.length);
    assert.ok(reviewWorkoutTemplate(item, { ...profile, session_duration_minutes: 10 }, planning, cards).warnings.some((warning) => warning.includes("minutos")));
    if (item.place === "Casa") {
      assert.ok(reviewWorkoutTemplate(item, { ...profile, training_equipment: [] }, planning, cards).issues.length);
    }
  }
  const dow = workoutTemplates.find((item) => item.id === "estudio-dow-gimnasio-principiante-3")!;
  assert.equal(dow.automaticEligible, undefined);
  assert.equal(dow.evidence?.url, "https://doi.org/10.14814/phy2.70219");
  assert.ok(dow.evidence.differences.some((difference) => difference.includes("dos series")));
  const dowNames = [
    "Sentadilla goblet con mancuerna", "Bisagra de cadera con mancuernas hasta las rodillas",
    "Press de hombros en polea", "Press de pecho en polea", "Jalon al pecho", "Remo sentado en polea",
  ];
  const dowReview = reviewWorkoutTemplate(dow, { ...gym, days_per_week: 3 }, planning, cards);
  assert.deepEqual(dowReview.issues, []);
  for (const day of dowReview.template.days) {
    assert.deepEqual(day.exercises.map((item) => item.name), dowNames);
    assert.ok(day.exercises.every((item) => item.sets === 2 && item.repetitions === "8-12" && item.restSeconds === 90));
  }
  assert.ok(reviewWorkoutTemplate(dow, { ...gym, days_per_week: 3 }, planning.filter((item) => item.name !== dowNames[2]), cards).issues.some((issue) => issue.includes(dowNames[2])));
  assert.ok(reviewWorkoutTemplate(dow, { ...gym, days_per_week: 3, restrictions: ["shoulder_injury"] }, planning, cards).issues.length);
  assert.ok(reviewWorkoutTemplate(dow, { ...gym, days_per_week: 2 }, planning, cards).warnings.some((warning) => warning.includes("días")));
  assert.ok(reviewWorkoutTemplate(dow, { ...gym, days_per_week: 3, session_duration_minutes: 10 }, planning, cards).warnings.some((warning) => warning.includes("minutos")));
  const connelly = workoutTemplates.find((item) => item.id === "estudio-connelly-casa-principiante-3")!;
  assert.equal(connelly.automaticEligible, undefined);
  assert.equal(connelly.evidence?.url, "https://doi.org/10.1038/s41598-025-27567-9");
  const connellyNames = [
    "Sentadilla con peso corporal", "Flexiones con rodillas apoyadas",
    "Bisagra de cadera con mancuernas hasta las rodillas", "Remo sentado con banda elástica",
  ];
  const connellyEquipment: ExerciseEquipment[] = ["dumbbell", "resistance_band"];
  const connellyProfile = { ...home, training_equipment: connellyEquipment, days_per_week: 3 };
  const connellyReview = reviewWorkoutTemplate(connelly, connellyProfile, planning, cards);
  assert.deepEqual(connellyReview.issues, []);
  for (const day of connellyReview.template.days) {
    assert.deepEqual(day.exercises.map((item) => item.name), connellyNames);
    assert.ok(day.exercises.every((item) => item.sets === 2 && item.repetitions === "8-12" && item.restSeconds === 60));
  }
  assert.ok(reviewWorkoutTemplate(connelly, { ...connellyProfile, training_equipment: ["dumbbell"] }, planning, cards).issues.length);
  assert.ok(reviewWorkoutTemplate(connelly, { ...connellyProfile, training_equipment: ["resistance_band"] }, planning, cards).issues.length);
  for (const [trainingPlace, trainingEquipment, study] of [
    ["Casa", connellyProfile.training_equipment, connelly],
    ["Gimnasio", gymEquipmentPreset(), dow],
  ] as const) {
    const selected = generateInitialPlan({
      sex: "female", age: 30, heightCm: 165, weightKg: 65, goal: "Ganar masa muscular",
      experience: "Nunca he entrenado", daysPerWeek: 3, sessionMinutes: 60, mealCount: 4,
      trainingPlace, trainingEquipment, restrictions: [],
    }, planning, { allowAdaptation: true });
    assert.notEqual(selected.structure, study.name);
  }
  const options = workoutTemplates.map((item) => {
    const review = reviewWorkoutTemplate(item, home, planning, cards);
    return { template: review.template, issues: review.issues, warnings: review.warnings };
  });
  const markup = renderToStaticMarkup(React.createElement(WorkoutTemplateLibrary, { options, catalog: manual.catalog, busy: false, message: null, onBack: () => {}, onUse: () => {}, onClearMessage: () => {} }));
  assert.match(markup, /31 rutinas encontradas/);
  assert.match(markup, /propuestas propias y adaptaciones de estudios/);
  assert.match(markup, /Adaptación de estudio/);
  assert.match(markup, /Procedencia/);
  assert.match(markup, /Incluye material/);
  assert.match(markup, /Avanzado/);
  assert.doesNotMatch(markup, /Todavía no hay rutinas clasificadas como avanzadas/);
  assert.match(markup, /Entrenar en casa/);
  assert.match(markup, /Entrenar en gimnasio/);
  assert.match(markup, /Revisar compatibilidad/);
  const advancedOption = { template: { ...template, id: "fixture-avanzada", level: "advanced" as const }, issues: [], warnings: ["Revisa tu perfil."] };
  const advancedMarkup = renderToStaticMarkup(React.createElement(WorkoutTemplateLibrary, { options: [advancedOption], catalog: manual.catalog, busy: false, message: null, onBack: () => {}, onUse: () => {}, onClearMessage: () => {} }));
  assert.match(advancedMarkup, /Avanzado.*1 rutina/);
  assert.match(advancedMarkup, /Disponible · revisa los avisos/);
  assert.equal(advancedTrainingReadiness({ experience: "Más de 5 años" }), "unknown");
  assert.equal(advancedTrainingReadiness({ experience: "Más de 5 años", training_continuity: continuityOptions[1], training_technique: techniqueOptions[0] }), "not_ready");
  assert.equal(advancedTrainingReadiness({ experience: "Nunca he entrenado", training_continuity: continuityOptions[0], training_technique: techniqueOptions[0] }), "not_ready");
  assert.equal(advancedTrainingReadiness({ experience: "Entre 3 y 5 años", training_continuity: continuityOptions[0], training_technique: techniqueOptions[0] }), "ready");
  console.log("Rutinas preparadas: distribución, sustituciones, tiempo, restricciones y presentación correctas.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

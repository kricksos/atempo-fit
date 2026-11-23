import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import releaseNames from "../data/illustration-library/release-names.json";
import illustrationCatalog from "../data/illustration-library/catalog.json";
import candidateMapping from "../data/illustration-library/candidate-mapping.json";
import catalogAliases from "../data/illustration-library/catalog-aliases.json";
import superseded from "../data/illustration-library/superseded-exercises.json";
import trialMapping from "../data/illustration-library/trial-mapping.json";
import generatedIllustrations from "../data/generated-illustrations/released.json";
import { ExerciseCatalogSelector, ExerciseMuscleFilters, type CatalogExercise } from "../src/components/exercise-catalog-selector";
import { WorkoutPlayerRebuilt } from "../src/components/workout-player-rebuilt";
import { IllustrationPreview } from "../src/app/preview-ilustraciones/preview";
import { CatalogIllustrationPreview } from "../src/app/preview-catalogo-ilustraciones/preview";
import { getExerciseDisplayName, getExerciseIllustration } from "../src/lib/illustration-media";
import { getIllustrationPreviewCatalog, hasIllustrationPreviewFrame } from "../src/lib/illustration-preview";
import { getExerciseMedia } from "../src/lib/local-exercise-media";
import { isAutomaticPlanningSource, pendingManualExerciseSource } from "../src/lib/exercise-planning-source";
import { getManualIllustrationCatalog } from "../src/lib/manual-illustration-catalog";
import { getIllustrationTrials, hasIllustrationTrialFrame } from "../src/lib/illustration-trials";

const catalog: CatalogExercise[] = [
  { id: "1", name: "Press banca", primaryMuscle: "pectorals", muscleGroups: ["pectorals"], difficulty: "beginner", equipment: ["barbell", "bench"], image: "/exercises/barbell-bench-press-start.jpg", imageEnd: "/exercises/barbell-bench-press-end.jpg", imageScale: 2.15 },
  { id: "2", name: "Curl de antebrazo", primaryMuscle: "forearms", muscleGroups: ["forearms"], difficulty: "intermediate", equipment: ["none_(bodyweight_exercise)"], image: null },
  { id: "3", name: "Otro ejercicio", primaryMuscle: null, muscleGroups: [], difficulty: "advanced", equipment: [], image: null },
];

const markup = renderToStaticMarkup(React.createElement(ExerciseCatalogSelector, { catalog, selectedIds: ["1"], onToggle: () => {} }));
assert.match(markup, /aria-pressed="true" aria-label="Press banca, quitar del día"/);
assert.match(markup, /Añadido · tocar para quitar/);
assert.doesNotMatch(markup, /disabled="" aria-pressed="true" aria-label="Press banca/);
assert.match(markup, /Curl de antebrazo, añadir al día/);
assert.match(markup, /Otro ejercicio, añadir al día/);
assert.match(markup, /Imagen no disponible/);
assert.match(markup, /3 ejercicios encontrados/);
assert.match(markup, /1 añadido/);
assert.match(markup, /barbell-bench-press-start\.jpg/);
assert.match(markup, /barbell-bench-press-end\.jpg/);
assert.match(markup, /exercise-motion-frame/);
assert.match(markup, /exercise-motion-card flex flex-col/);
assert.match(markup, /aspect-\[4\/3\] w-full shrink-0/);
assert.equal((markup.match(/transform:scale\(2\.15\)/g) ?? []).length, 2);
assert.match(markup, /aria-pressed="true"[^>]*>.*?Todos/);
assert.match(markup, /sm:flex-wrap/);
assert.match(markup, /grid grid-cols-1 gap-3/);
assert.match(markup, /Principiante · Barra · Banco/);
assert.match(markup, /Intermedio · Peso corporal/);
assert.match(markup, /Avanzado · Sin material/);
assert.doesNotMatch(markup, /none_\(bodyweight_exercise\)/);

const editorMarkup = renderToStaticMarkup(React.createElement(ExerciseCatalogSelector, { catalog, selectedIds: ["1"], onToggle: () => {}, externalFilter: "pectorals", editorMode: true, layout: "grid" }));
assert.match(editorMarkup, /aria-pressed="true" aria-label="Press banca, quitar del día"/);
assert.doesNotMatch(editorMarkup, /disabled="" aria-pressed="true" aria-label="Press banca/);
assert.match(editorMarkup, /1 ejercicio encontrado/);
assert.doesNotMatch(editorMarkup, /Curl de antebrazo/);
assert.doesNotMatch(editorMarkup, /Filtrar catálogo por músculo/);
assert.match(editorMarkup, /Ver ejercicios del día/);
assert.match(editorMarkup, /grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3/);
const filtersMarkup = renderToStaticMarkup(React.createElement(ExerciseMuscleFilters, { catalog, filter: "pectorals", onFilterChange: () => {} }));
assert.match(filtersMarkup, /aria-label="Filtrar catálogo por músculo"/);
assert.match(filtersMarkup, /aria-pressed="true"[^>]*>.*?Pectoral/);
assert.match(filtersMarkup, /Otros/);
const fullDayMarkup = renderToStaticMarkup(React.createElement(ExerciseCatalogSelector, { catalog, selectedIds: ["1"], onToggle: () => {}, externalFilter: "all", editorMode: true, limitReached: true }));
assert.match(fullDayMarkup, /límite de 12 ejercicios/);
assert.match(fullDayMarkup, /disabled="" aria-pressed="false" aria-label="Curl de antebrazo, límite de ejercicios alcanzado"/);
assert.doesNotMatch(fullDayMarkup, /disabled="" aria-pressed="true" aria-label="Press banca/);
const unavailableSelected = renderToStaticMarkup(React.createElement(ExerciseCatalogSelector, { catalog: [{ ...catalog[0], available: false }], selectedIds: ["1"], onToggle: () => {}, editorMode: true, limitReached: true }));
assert.match(unavailableSelected, /aria-pressed="true" aria-label="Press banca, quitar del día"/);
assert.doesNotMatch(unavailableSelected, /disabled="" aria-pressed="true" aria-label="Press banca/);
const favoritesMarkup = renderToStaticMarkup(React.createElement(ExerciseCatalogSelector, { catalog, selectedIds: [], onToggle: () => {}, favoriteIds: ["1"], onFavorite: () => {} }));
assert.match(favoritesMarkup, /Solo favoritos/);
assert.match(favoritesMarkup, /aria-pressed="true" aria-label="Quitar de favoritos: Press banca"/);
assert.match(favoritesMarkup, /aria-pressed="false" aria-label="Añadir a favoritos: Curl de antebrazo"/);
assert.doesNotMatch(favoritesMarkup, /<button[^>]*>(?:(?!<\/button>)[\s\S])*<button/);

const preview = renderToStaticMarkup(React.createElement(IllustrationPreview));
for (const name of ["bench-press", "overhead-press", "squat"]) {
  assert.ok(preview.includes(`/exercises/illustration-samples/${name}-blend.webp`));
  assert.ok(preview.includes(`/exercises/illustration-samples/${name}-end-blend.webp`));
}

const candidates = getIllustrationPreviewCatalog();
assert.equal(candidates.length, 180);
assert.equal(new Set(candidates.map((exercise) => exercise.name)).size, candidates.length);
assert.ok(candidates.every((exercise) => exercise.image === null || exercise.image.startsWith("/")));
assert.deepEqual(candidates.filter((exercise) => exercise.image === null).map((exercise) => exercise.name), []);
assert.equal(candidates.find((exercise) => exercise.name === "Plancha")?.imageEnd, null);
assert.equal(candidates.find((exercise) => exercise.name === "Press banca")?.image, "/exercises/illustration-samples/bench-press-blend.webp");
assert.equal(candidates.find((exercise) => exercise.name === "Curl inverso de pie con mancuernas"), undefined);
for (const name of ["Prensa de piernas", "Extensión de tríceps en máquina", "Curl femoral de pie en máquina", "Prensa de gemelos en máquina de piernas", "Press francés con barra Z", "Cruce de poleas bajas", "Curl de bíceps en banco Scott"]) {
  assert.ok(candidates.find((exercise) => exercise.name === name)?.image, name);
}
for (const name of ["Press banca con mancuernas", "Rotación externa de hombro en polea"]) assert.equal(candidates.find((exercise) => exercise.name === name), undefined);
assert.ok(candidates.every((exercise) => exercise.imageScale === undefined || (exercise.imageScale >= 1 && exercise.imageScale <= 2.15)));
assert.equal(hasIllustrationPreviewFrame("goblet-squat", "start"), true);
assert.equal(hasIllustrationPreviewFrame("plank", "hold"), true);
assert.equal(hasIllustrationPreviewFrame("plank", "end"), false);
assert.equal(hasIllustrationPreviewFrame("not-in-catalog", "start"), false);

assert.equal(getExerciseMedia("Ejercicio externo"), null);
assert.equal(getExerciseMedia("Press banca")?.[0], "/exercises/illustration-samples/bench-press-blend.webp");
assert.ok(getExerciseMedia("Prensa de piernas"));
assert.ok(getExerciseIllustration("Prensa de piernas"));
assert.equal(getExerciseMedia("Pájaros con mancuernas"), null);
assert.deepEqual(getExerciseMedia("Curl predicador"), getExerciseMedia("Curl de bíceps en banco Scott"));
assert.equal(getExerciseIllustration("Peso muerto con piernas rígidas y mancuernas")?.start, "/exercises/illustrations/dumbbell-romanian-deadlift/start.webp");
assert.equal(getExerciseIllustration("Plancha")?.end, null);
assert.equal(isAutomaticPlanningSource(pendingManualExerciseSource), false);
assert.equal(isAutomaticPlanningSource("free-exercise-db"), true);
assert.equal(isAutomaticPlanningSource(null), true);
for (const [name, alias] of Object.entries(catalogAliases)) {
  assert.deepEqual(getExerciseMedia(alias), getExerciseMedia(name));
  assert.equal(getExerciseDisplayName(alias), name);
  assert.equal(getExerciseDisplayName(name), name);
}
for (const [name, { id, scale }] of Object.entries(generatedIllustrations)) {
  const illustration = getExerciseIllustration(name);
  assert.deepEqual(illustration, {
    start: `/exercises/generated-illustrations/${id}/start.webp`,
    end: `/exercises/generated-illustrations/${id}/end.webp`,
    scale,
  });
  assert.deepEqual(getExerciseMedia(name), [illustration.start, illustration.end]);
  for (const image of [illustration.start, illustration.end]) {
    assert.ok(existsSync(path.join(process.cwd(), "public", image.substring(1))), `${name}: ${image}`);
  }
}
assert.equal(getExerciseDisplayName("Ejercicio externo"), "Ejercicio externo");

const aliases: Record<string, string> = catalogAliases;
const rows = candidates.map((exercise, index) => ({
  id: `exercise-${index}`,
  name: aliases[exercise.name] ?? exercise.name,
  primary_muscle: exercise.primaryMuscle,
  muscle_groups: exercise.muscleGroups,
  equipment_required: exercise.equipment,
  difficulty: exercise.difficulty,
  is_momentum_approved: index % 2 === 0,
}));
rows.push({ id: "extra", name: "Ejercicio adicional", primary_muscle: "core", muscle_groups: ["core"], equipment_required: [], difficulty: "beginner", is_momentum_approved: true });
const manual = getManualIllustrationCatalog(rows);
assert.equal(manual.catalog.length, candidates.length + 1);
for (const [index, exercise] of candidates.entries()) {
  const entry = manual.catalog.find((item) => item.name === exercise.name);
  assert.equal(entry?.id, rows[index].id);
  assert.equal(entry?.image, exercise.image);
  assert.equal(entry?.illustration, exercise.illustration);
}
assert.equal(manual.catalog.find((exercise) => exercise.name === "Ejercicio adicional")?.id, "extra");
assert.equal(new Set(manual.catalog.map((exercise) => exercise.id)).size, manual.catalog.length);
assert.ok(manual.catalog.every((exercise) => exercise.image === null || exercise.illustration));
assert.ok(manual.exerciseDetails.some((exercise) => exercise.id === "extra"));
const generatedRows = Object.keys(generatedIllustrations).filter((name) => !rows.some((row) => row.name === name)).map((name, index) => ({
  id: `generated-${index}`, name, primary_muscle: "deltoids", muscle_groups: ["deltoids"], equipment_required: ["dumbbell"], difficulty: "beginner", is_momentum_approved: true,
}));
const withGenerated = getManualIllustrationCatalog([...rows, ...generatedRows]);
for (const name of Object.keys(generatedIllustrations)) {
  const exercise = withGenerated.catalog.find((item) => item.name === name);
  assert.ok(exercise?.image, name);
  assert.equal(exercise.image, getExerciseMedia(name)?.[0]);
  assert.equal(exercise.imageEnd, getExerciseMedia(name)?.[1]);
  assert.equal(exercise.illustration, true);
}
const supersededRows = superseded.map((name, index) => ({
  id: `superseded-${index}`, name, primary_muscle: null, muscle_groups: [], equipment_required: [], difficulty: "beginner", is_momentum_approved: true,
})).filter((row) => !rows.some((existing) => existing.name === row.name));
const withSuperseded = getManualIllustrationCatalog([...rows, ...supersededRows]);
for (const row of supersededRows) {
  assert.ok(!withSuperseded.catalog.some((exercise) => exercise.id === row.id), row.name);
  assert.ok(withSuperseded.exerciseDetails.some((exercise) => exercise.id === row.id), row.name);
}
const trialFixtures: CatalogExercise[] = Object.keys(trialMapping).map((name, index) => ({
  id: `trial-${index}`, name, primaryMuscle: null, muscleGroups: [], difficulty: "beginner", equipment: [], image: null,
}));
const trialCatalog = getIllustrationTrials(trialFixtures);
assert.equal(trialCatalog.length, 0);
assert.ok(trialCatalog.every((exercise) => exercise.image?.startsWith("/preview-ilustraciones-image/") && exercise.trialNote));
assert.ok(trialFixtures.every((exercise) => exercise.image === null && !exercise.trialNote));
const trialEntries: Record<string, { id: string; note: string }> = trialMapping;
for (const [name, trial] of Object.entries(trialEntries)) {
  const illustration = illustrationCatalog.exercises.find((exercise) => exercise.id === trial.id);
  assert.ok(illustration, name);
  for (const frame of illustration.frames) {
    assert.ok(hasIllustrationTrialFrame(trial.id, frame), `${name}/${frame}`);
    assert.ok(existsSync(path.join(process.cwd(), "data", "illustration-library", "images", trial.id, `${frame}.webp`)), `${name}/${frame}`);
  }
}
assert.equal(hasIllustrationTrialFrame("not-in-catalog", "start"), false);
assert.equal(hasIllustrationTrialFrame("rear-delt-fly", "not-a-frame"), false);
const existingImage = { ...catalog[0], image: "/exercises/illustrations/example/start.webp" };
assert.deepEqual(getIllustrationTrials([existingImage]), [existingImage]);
const noTrialsMarkup = renderToStaticMarkup(React.createElement(CatalogIllustrationPreview, { catalog: candidates }));
assert.doesNotMatch(noTrialsMarkup, /Ver solo las .* pruebas/);
const homeMarkup = renderToStaticMarkup(React.createElement(CatalogIllustrationPreview, { catalog: candidates, initialBatch: "home" }));
assert.match(homeMarkup, /24 ejercicios encontrados/);
assert.match(homeMarkup, /Remo inclinado con mochila/);
assert.doesNotMatch(homeMarkup, /Press banca con barra/);
const moreHomeMarkup = renderToStaticMarkup(React.createElement(CatalogIllustrationPreview, { catalog: candidates, initialBatch: "home2" }));
assert.match(moreHomeMarkup, /15 ejercicios encontrados/);
assert.match(moreHomeMarkup, /Remo renegado con mancuernas/);
assert.doesNotMatch(moreHomeMarkup, /Remo inclinado con mochila/);
assert.equal(candidates.find((exercise) => exercise.name === "Remo renegado con mancuernas")?.difficulty, "intermediate");
assert.deepEqual(candidates.find((exercise) => exercise.name === "Sentadilla a banco")?.equipment, ["Banco"]);
assert.deepEqual(candidates.find((exercise) => exercise.name === "Remo con pesa rusa apoyado en banco")?.equipment, ["Pesa rusa", "Banco"]);
assert.deepEqual(candidates.find((exercise) => exercise.name === "Elevación de gemelo a una pierna con mancuerna en escalón")?.equipment, ["Escalón", "Mancuernas"]);
assert.equal(candidates.find((exercise) => exercise.name === "Plancha con toque de hombro")?.difficulty, "intermediate");
const photoName = "Pájaros con mancuernas";
const photoRow = { ...rows[0], id: "original-birds", name: photoName, equipment_required: ["dumbbell", "bench"] };
assert.deepEqual(getManualIllustrationCatalog([...rows, photoRow]).catalog.find((exercise) => exercise.name === photoName)?.equipment, ["dumbbell", "bench"]);
const withoutSidePlank = getManualIllustrationCatalog(rows.filter((row) => row.name !== "Plancha lateral"));
const pending = withoutSidePlank.catalog.find((exercise) => exercise.name === "Plancha lateral");
assert.equal(pending?.available, false);
assert.equal(pending?.id, "pending:Plancha lateral");
const pendingMarkup = renderToStaticMarkup(React.createElement(ExerciseCatalogSelector, { catalog: pending ? [pending] : [], selectedIds: [], onToggle: () => {} }));
assert.match(pendingMarkup, /disabled="" aria-pressed="false" aria-label="Plancha lateral, pendiente de activación"/);
assert.match(pendingMarkup, /1 ejercicio pendiente de activación/);
const duplicateRows = rows.map((row, index) => index === 1 ? { ...row, id: rows[0].id } : row);
assert.throws(() => getManualIllustrationCatalog(duplicateRows), /comparten el mismo registro/);
assert.equal(new Set(releaseNames).size, releaseNames.length);
for (const name of releaseNames) {
  const illustration = getExerciseIllustration(name);
  assert.ok(illustration, name);
  assert.ok(illustration.scale >= 1 && illustration.scale <= 2.15, name);
  for (const image of [illustration.start, illustration.end].filter((value): value is string => value !== null)) {
    assert.ok(image.startsWith("/exercises/"), `${name}: ${image}`);
    assert.ok(existsSync(path.join(process.cwd(), "public", image.substring(1))), `${name}: ${image}`);
  }
}
const assignments: Record<string, string> = candidateMapping.assignments;
for (const id of new Set(releaseNames.map((name) => assignments[name]))) {
  const illustration = illustrationCatalog.exercises.find((exercise) => exercise.id === id);
  assert.ok(illustration, id);
  for (const frame of illustration.frames) {
    const prepared = readFileSync(path.join(process.cwd(), "data", "illustration-library", "prepared", id, `${frame}.webp`));
    const published = readFileSync(path.join(process.cwd(), "public", "exercises", "illustrations", id, `${frame}.webp`));
    assert.ok(prepared.equals(published), `${id}/${frame}: la imagen publicada no coincide con la preparada`);
  }
}

const player = renderToStaticMarkup(React.createElement(WorkoutPlayerRebuilt, {
  workoutDayId: "day",
  workoutName: "Rutina",
  exercises: [{ id: "1", name: "Plancha", sets: 3, repetitions: "8", restSeconds: 30, media: getExerciseMedia("Plancha"), illustration: true }],
  lastPerformance: [],
}));
assert.match(player, /Ilustración orientativa con IA; no es una guía técnica/);
assert.match(player, /20-30 segundos/);
assert.doesNotMatch(player, /20-30 segundos repeticiones/);
assert.equal((player.match(/posición final/g) ?? []).length, 0);

const migration = readFileSync(path.join(process.cwd(), "supabase", "migrations", "0045_add_manual_exercises.sql"), "utf8");
assert.equal((migration.match(/'atempo-illustration-pending'/g) ?? []).length, 11);
assert.match(migration, /on conflict \(name\) do nothing/i);
for (const name of ["Sentadilla búlgara con mancuernas", "Extensión alterna de brazo y pierna en cuadrupedia", "Abducción de cadera en máquina", "Flexiones con rodillas apoyadas", "Flexiones en pared", "Aperturas de banda para espalda alta", "Balanceo con pesa rusa", "Remo con mancuernas en banco inclinado", "Remo en polea a un brazo de pie", "Flexiones en pica"]) {
  assert.ok(migration.includes(`'${name}'`));
  assert.ok(getExerciseIllustration(name));
}
assert.ok(migration.includes("'Elevación de gemelos sentado en máquina'"));
assert.ok(getExerciseIllustration("Elevación de gemelos sentado en máquina"));
const sidePlankMigration = readFileSync(path.join(process.cwd(), "supabase", "migrations", "0046_add_side_plank.sql"), "utf8");
assert.match(sidePlankMigration, /'Plancha lateral'.*'atempo-illustration-pending'/);
assert.match(sidePlankMigration, /on conflict \(name\) do nothing/i);
const reviewedMigration = readFileSync(path.join(process.cwd(), "supabase", "migrations", "0047_add_reviewed_illustration_exercises.sql"), "utf8");
const newNames = ["Pájaros con mancuernas de pie", "Press francés con mancuernas tumbado", "Peso muerto con banda elástica", "Elevación de gemelos de pie en máquina", "Giro de tronco en polea de pie"];
assert.equal((reviewedMigration.match(/'atempo-illustration-pending'/g) ?? []).length, newNames.length);
assert.match(reviewedMigration, /on conflict \(name\) do nothing/i);
const missingNewRows = getManualIllustrationCatalog(rows.filter((row) => !newNames.includes(row.name)));
for (const name of newNames) {
  assert.ok(reviewedMigration.includes(`'${name}'`));
  assert.ok(getExerciseIllustration(name));
  const active = manual.catalog.find((exercise) => exercise.name === name);
  assert.ok(active?.id.startsWith("exercise-"), name);
  assert.notEqual(active?.available, false);
  assert.ok(active?.image, name);
  const entry = missingNewRows.catalog.find((exercise) => exercise.name === name);
  assert.equal(entry?.id, `pending:${name}`);
  assert.equal(entry?.available, false);
}

console.log("Selector de ejercicios: pruebas correctas.");

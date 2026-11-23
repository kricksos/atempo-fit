import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { isPlanningExerciseCompatible } from "../src/features/planning/engine";
import { buildPlanningExerciseCatalog } from "../src/lib/exercise-catalog";
import { getManualIllustrationCatalog } from "../src/lib/manual-illustration-catalog";
import { homeExerciseFixtures } from "./home-exercise-fixtures";
import { moreHomeExerciseFixtures } from "./more-home-exercise-fixtures";
import homeBatchNames from "../data/illustration-library/home-preview-batch.json";
import moreHomeBatchNames from "../data/illustration-library/home-preview-batch-2.json";

const batches = [
  { names: homeBatchNames, fixtures: homeExerciseFixtures, migration: "0051_add_home_illustration_exercises.sql" },
  { names: moreHomeBatchNames, fixtures: moreHomeExerciseFixtures, migration: "0052_add_more_home_illustration_exercises.sql" },
];
for (const batch of batches) {
  const migration = readFileSync(join("supabase", "migrations", batch.migration), "utf8");
  const manual = getManualIllustrationCatalog(batch.fixtures).catalog.filter((exercise) => !exercise.id.startsWith("pending:"));
  const automatic = buildPlanningExerciseCatalog(batch.fixtures);
  assert.deepEqual([...batch.names].sort(), batch.fixtures.map((fixture) => fixture.name).sort());
  assert.equal(manual.length, batch.fixtures.length);
  assert.equal(automatic.length, batch.fixtures.length);
  for (const fixture of batch.fixtures) {
    const values = [fixture.name, fixture.description, "strength", fixture.difficulty,
      JSON.stringify(fixture.equipment_required), JSON.stringify(fixture.restrictions), "[]",
      JSON.stringify(fixture.muscle_groups), fixture.primary_muscle];
    assert.ok(migration.includes(`(${values.map((value) => `'${value}'`).join(", ")}, true, 'atempo-illustration-pending'`), fixture.name);
    const card = manual.find((exercise) => exercise.name === fixture.name);
    const generated = automatic.find((exercise) => exercise.name === fixture.name);
    assert.ok(card?.image && card.imageEnd && generated, fixture.name);
    assert.equal(card.difficulty, fixture.difficulty);
    assert.deepEqual(card.equipment, generated.equipment);
    assert.deepEqual(generated.equipment, fixture.equipment_required);
    assert.deepEqual(generated.restrictions, fixture.restrictions);
    assert.equal(generated.primaryMuscle, fixture.primary_muscle);
    assert.equal(isPlanningExerciseCompatible(generated, [], generated.equipment, false), true, fixture.name);
    assert.equal(isPlanningExerciseCompatible(generated, [], generated.equipment, true), fixture.difficulty === "beginner", fixture.name);
    for (const restriction of fixture.restrictions) {
      assert.equal(isPlanningExerciseCompatible(generated, [restriction], generated.equipment, false), false, fixture.name);
    }
    if (generated.equipment.length) {
      assert.equal(isPlanningExerciseCompatible(generated, [], [], false), false, fixture.name);
    }
    for (const media of [card.image, card.imageEnd]) {
      assert.ok(existsSync(join("public", media)), `${fixture.name}: ${media}`);
    }
  }
  console.log(`${batch.fixtures.length} fichas simuladas de ${batch.migration}: equipo, restricciones e imágenes coherentes.`);
}

/* eslint-disable @typescript-eslint/no-require-imports -- Database dependencies are replaced for isolated adjustment tests. */
const assert = require("node:assert/strict");
const Module = require("node:module");

let writes = [];
let reads = [];
let absent;
let sets = 2;
let exerciseName = "Ejercicio";
let repetitions = "8-12";
let progression = 0;
let durationSeconds = null;
let sessionMinutes = 60;
let eligible = true;
let publishResult = "published";
const date = (days) => new Date(Date.now() - days * 86400000).toISOString();
const sessions = Array.from({ length: 7 }, (_, index) => ({ id: `session-${index}`, completed_at: date(index * 2) }));
class Query {
  constructor(table) { this.table = table; this.operation = "read"; this.columns = ""; }
  select(columns) { this.columns = columns; return this; }
  eq() { return this; }
  in() { return this; }
  gte() { return this; }
  order() { return this; }
  update(values) { this.operation = "update"; writes.push({ table: this.table, operation: "update", values }); return this; }
  insert(values) { this.operation = "insert"; writes.push({ table: this.table, operation: "insert", values }); return this; }
  result() {
    if (this.operation === "insert") return { data: { id: `new-${this.table}` }, error: null };
    if (this.operation !== "read") return { data: null, error: null };
    reads.push(this.table);
    if (this.table === absent) return { data: null, error: null };
    if (this.table === "profiles") return { data: { primary_goal: "Ganar masa muscular", sex: "male", days_per_week: 3 }, error: null };
    if (this.table === "workout_plans" || this.table === "nutrition_plans") return { data: { id: this.table }, error: null };
    if (this.table === "workout_plan_versions") return { data: { id: "workout-version", version_number: 1, profile_snapshot: { workout_adaptations: [{ kind: "coverage", missingGroups: ["bíceps"] }] } }, error: null };
    if (this.table === "nutrition_plan_versions") return { data: { id: "nutrition-version", version_number: 1, calories: 2000, protein_grams: 100, fats_grams: 50, meal_count: 1 }, error: null };
    if (this.table === "workout_days") return { data: [{ id: "day", name: "Día", order_number: 1 }], error: null };
    if (this.table === "workout_exercises") return { data: [{ id: "row", workout_day_id: "day", exercise_id: "exercise", sets, repetitions, rest_seconds: 60, order_number: 1, progression_level: progression }], error: null };
    if (this.table === "workout_sessions") return { data: sessions, error: null };
    if (this.table === "exercise_logs") return { data: sessions.map((session) => ({ workout_session_id: session.id, exercise_id: "exercise", weight_kg: 10, repetitions: 10, duration_seconds: durationSeconds })), error: null };
    if (this.table === "nutrition_meals") return { data: [{ id: "meal", name: "Comida", meal_order: 1, target_calories: 2000 }], error: null };
    if (this.table === "nutrition_meal_completions") return { data: Array.from({ length: 15 }, (_, index) => ({ completed_on: date(index).slice(0, 10) })), error: null };
    if (this.table === "nutrition_meal_items") return { data: [{ food_id: "food", quantity_grams: 100, role: "carbohydrate", is_alternative: false }], error: null };
    if (this.table === "body_measurements") return { data: [0, 7, 14, 21].map((days) => ({ measured_at: date(days).slice(0, 10), weight_kg: 80 })), error: null };
    if (this.table === "exercises") return { data: [{ id: "exercise", name: exerciseName, alternatives: [] }], error: null };
    return { data: [], error: null };
  }
  single() { return Promise.resolve(this.result()); }
  maybeSingle() { return Promise.resolve(this.result()); }
  then(resolve, reject) { return Promise.resolve(this.result()).then(resolve, reject); }
}
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === "../../lib/supabase/admin") return { createAdminClient: () => ({
    from: (table) => new Query(table),
    rpc: async (_name, values) => { writes.push({ table: "workout_plan_versions", operation: "rpc", values }); return { data: publishResult, error: null }; },
  }) };
  if (request === "../../lib/exercise-catalog") return { getPlanningExerciseCatalog: async () => eligible ? [{ name: exerciseName, primaryMuscle: "pectorals", muscleGroups: ["pectorals"], restrictions: [], equipment: [], difficulty: "beginner" }] : [] };
  if (request === "./engine") return { parsePlanningProfile: () => ({ trainingEquipment: [], restrictions: [], experience: "Nunca", sessionMinutes }), isPlanningExerciseCompatible: () => true };
  return originalLoad.call(this, request, parent, isMain);
};
const { PlanAdjustmentAvailabilityError, runPlanAdjustment } = require("../src/features/planning/adjust.ts");
Module._load = originalLoad;

async function main() {
  absent = "nutrition_plans";
  let result = await runPlanAdjustment("fixture", "workout");
  assert.equal(result.workoutAdjusted, true);
  assert.equal(result.nutritionAdjusted, false);
  assert.ok(writes.some((write) => write.table === "workout_plan_versions"));
  assert.ok(!writes.some((write) => write.table === "nutrition_plan_versions"));
  assert.ok(!reads.includes("nutrition_plans") && !reads.includes("body_measurements"));
  const publication = writes.find((write) => write.operation === "rpc");
  assert.equal(publication.values.p_expected_version_id, "workout-version");
  assert.deepEqual(publication.values.p_profile.workout_adaptations, [{ kind: "coverage", missingGroups: ["bíceps"] }]);
  assert.equal(publication.values.p_days[0].exercises[0].sets, 3);

  writes = []; reads = []; publishResult = "version_changed";
  await assert.rejects(() => runPlanAdjustment("fixture", "workout"), PlanAdjustmentAvailabilityError);
  assert.ok(!writes.some((write) => write.operation === "update" && write.table === "workout_plan_versions"));
  publishResult = "published";

  writes = []; reads = []; sets = 6;
  result = await runPlanAdjustment("fixture", "workout");
  assert.equal(result.adjusted, false);
  assert.equal(result.reason, "review_required");
  assert.ok(!writes.some((write) => write.table === "workout_plan_versions"), "No debe clonarse la rutina sin cambios");
  sets = 2;
  writes = []; reads = []; sessionMinutes = 5;
  result = await runPlanAdjustment("fixture", "workout");
  assert.equal(result.reason, "review_required");
  assert.ok(!writes.some((write) => write.table === "workout_plan_versions"));
  sessionMinutes = 60;
  writes = []; reads = []; eligible = false; absent = null;
  await assert.rejects(() => runPlanAdjustment("fixture", "general"), PlanAdjustmentAvailabilityError);
  assert.equal(writes.length, 0, "No debe modificarse la dieta antes de validar la rutina");
  eligible = true;
  writes = []; reads = []; absent = "nutrition_plans"; exerciseName = "Plancha"; repetitions = "20-30 segundos"; durationSeconds = 30;
  result = await runPlanAdjustment("fixture", "workout");
  assert.equal(result.adjusted, false);
  assert.ok(!writes.some((write) => write.table === "workout_plan_versions"));
  exerciseName = "Ejercicio"; repetitions = "8-12"; durationSeconds = null;

  writes = []; reads = []; absent = "workout_plans";
  result = await runPlanAdjustment("fixture", "nutrition");
  assert.equal(result.workoutAdjusted, false);
  assert.equal(result.nutritionAdjusted, true);
  assert.ok(writes.some((write) => write.table === "nutrition_plan_versions"));
  assert.ok(!writes.some((write) => write.table === "workout_plan_versions"));
  assert.ok(!reads.includes("workout_plans") && !reads.includes("workout_sessions"));

  writes = []; reads = []; absent = null;
  result = await runPlanAdjustment("fixture", "general");
  assert.equal(result.workoutAdjusted, true);
  assert.equal(result.nutritionAdjusted, true);
  writes = []; reads = []; absent = "workout_plans";
  await assert.rejects(() => runPlanAdjustment("fixture", "workout"), PlanAdjustmentAvailabilityError);
  assert.equal(writes.length, 0);
  writes = []; reads = []; absent = "nutrition_plan_versions";
  await assert.rejects(() => runPlanAdjustment("fixture", "nutrition"), PlanAdjustmentAvailabilityError);
  assert.equal(writes.length, 0);
  console.log("Ajustes simulados: solo rutina, solo dieta y ambas sin tocar la parte no seleccionada.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

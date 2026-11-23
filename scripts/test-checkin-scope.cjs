/* eslint-disable @typescript-eslint/no-require-imports -- Server dependencies are replaced for isolated route tests. */
const assert = require("node:assert/strict");
const Module = require("node:module");
const { z } = require("zod");
const { continuityOptions, techniqueOptions } = require("../src/lib/training-experience.ts");

const initialProfile = {
  user_id: "fixture", primary_goal: "Ganar masa muscular", days_per_week: 3, session_duration_minutes: 60,
  training_place: "Casa", training_equipment: ["dumbbell"], restrictions: [], food_restrictions: [],
  workout_plan_review_needed: false, nutrition_plan_review_needed: false,
};
let profile;
let absent;
let writes;
class Query {
  constructor(table) { this.table = table; this.operation = "read"; }
  select() { return this; }
  eq() { return this; }
  order() { return this; }
  limit() { return this; }
  in(column, values) { this.values = values; return this; }
  update(values) { this.operation = "update"; writes.push({ table: this.table, operation: "update", values }); return this; }
  insert(values) { this.operation = "insert"; writes.push({ table: this.table, operation: "insert", values }); return this; }
  result() {
    if (this.operation === "insert") return { data: { id: `new-${this.table}` }, error: null };
    if (this.operation !== "read") return { data: null, error: null };
    if (this.table === "profiles") return { data: profile, error: null };
    if (this.table === absent) return { data: null, error: null };
    if (this.table === "workout_plans" || this.table === "nutrition_plans") return { data: { id: this.table }, error: null };
    if (this.table === "workout_plan_versions" || this.table === "nutrition_plan_versions") return { data: { id: this.table, version_number: 1, meal_count: 4 }, error: null };
    if (this.table === "exercises" || this.table === "foods_catalog") return { data: this.values.map((name) => ({ id: name, name })), error: null };
    return { data: null, error: null };
  }
  single() { return Promise.resolve(this.result()); }
  maybeSingle() { return Promise.resolve(this.result()); }
  then(resolve, reject) { return Promise.resolve(this.result()).then(resolve, reject); }
}
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === "@/lib/supabase/server") return { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: "fixture" } } }) } }) };
  if (request === "@/lib/supabase/admin") return { createAdminClient: () => ({ from: (table) => new Query(table) }) };
  if (request === "@/lib/exercise-catalog") return { getPlanningExerciseCatalog: async () => [] };
  if (request === "@/features/planning/adaptation-gate") return { adaptationGate: () => null, adaptationTokenSchema: z.string().optional() };
  if (request === "@/features/planning/engine") return {
    PlanningAvailabilityError: class PlanningAvailabilityError extends Error {},
    parsePlanningProfile: (value) => value,
    generateInitialPlan: () => ({
      structure: "fixture", workoutAdaptations: [], calories: 2000, proteinGrams: 100, carbsGrams: 200, fatsGrams: 50, mealCount: 1,
      days: [{ name: "Día", exercises: [{ name: "Ejercicio", sets: 2, repetitions: "8-12", restSeconds: 60 }] }],
      meals: [{ name: "Comida", targetCalories: 2000, suggestedTime: "12:00", items: [{ name: "Alimento", quantityGrams: 100, role: "protein", weightBasis: "as_served" }] }],
    }),
  };
  return originalLoad.call(this, request, parent, isMain);
};
const { POST } = require("../src/app/api/profile/checkin/route.ts");
Module._load = originalLoad;

const base = {
  goal: initialProfile.primary_goal, daysPerWeek: 3, sessionDuration: 60, trainingPlace: "Casa", trainingEquipment: ["dumbbell"],
  foodRestrictions: [], injuries: [], selfReport: "actualizar", mode: "general", confirm: true,
};
function reset(changes = {}, missing = null) {
  profile = { ...initialProfile, ...changes }; absent = missing; writes = [];
}
async function submit(changes) {
  const payload = { ...base, ...changes };
  if (payload.confirm && payload.mode !== "nutrition") {
    const preview = await POST(new Request("http://localhost/api/profile/checkin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, confirm: false }) }));
    const proposal = await preview.json();
    assert.equal(preview.status, 200, JSON.stringify(proposal));
    assert.equal(writes.length, 0, "La propuesta no debe modificar datos");
    if (proposal.proposalToken) payload.proposalToken = proposal.proposalToken;
  }
  const response = await POST(new Request("http://localhost/api/profile/checkin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }));
  const data = await response.json();
  assert.equal(response.status, 200, JSON.stringify(data));
  return data;
}
function wrote(table) { return writes.some((write) => write.table === table); }
function lastProfileWrite() { return writes.filter((write) => write.table === "profiles").at(-1).values; }

async function main() {
  reset({ nutrition_plan_review_needed: true });
  let result = await submit({ mode: "workout", selfReport: "bien", foodRestrictions: ["Gluten"], confirm: false });
  assert.equal(result.structuralChange, false);
  assert.deepEqual(result.changed, []);
  assert.equal(writes.length, 0);

  reset();
  result = await submit({ mode: "workout", selfReport: "bien", injuries: ["Hombro"], daysPerWeek: 2 });
  assert.equal(result.action, "profile_updated_plan_kept");
  assert.equal(wrote("workout_plan_versions"), false);
  assert.equal(lastProfileWrite().workout_plan_review_needed, true);
  assert.equal(lastProfileWrite().days_per_week, 2);

  reset();
  result = await submit({ mode: "workout", selfReport: "bien" });
  assert.equal(result.action, "no_change");
  assert.equal(wrote("workout_plan_versions"), false);

  reset({ experience: "Entre 1 y 3 años", training_continuity: null, training_technique: null });
  result = await submit({ mode: "workout", selfReport: "bien", experience: "Entre 3 y 5 años", trainingContinuity: continuityOptions[0], trainingTechnique: techniqueOptions[0] });
  assert.equal(result.action, "profile_updated_plan_kept");
  assert.ok(result.changed.includes("continuidad del entrenamiento"));
  assert.equal(lastProfileWrite().experience, "Entre 3 y 5 años");
  assert.equal(lastProfileWrite().training_continuity, continuityOptions[0]);
  assert.equal(lastProfileWrite().training_technique, techniqueOptions[0]);
  assert.equal(lastProfileWrite().workout_plan_review_needed, true);

  reset({ experience: "Entre 1 y 3 años", training_continuity: continuityOptions[1], training_technique: techniqueOptions[1] });
  await submit({ mode: "nutrition", experience: "Más de 5 años", trainingContinuity: continuityOptions[0], trainingTechnique: techniqueOptions[0] });
  assert.equal(writes.find((write) => write.table === "profiles").values.experience, "Entre 1 y 3 años");
  assert.equal(writes.find((write) => write.table === "profiles").values.training_continuity, continuityOptions[1]);
  assert.equal(writes.find((write) => write.table === "profiles").values.training_technique, techniqueOptions[1]);

  reset({ experience: "Entre 1 y 3 años", training_continuity: null, training_technique: null });
  const payload = { ...base, mode: "workout", confirm: false, trainingContinuity: continuityOptions[0], trainingTechnique: techniqueOptions[0] };
  const preview = await POST(new Request("http://localhost/api/profile/checkin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }));
  const proposal = await preview.json();
  assert.equal(writes.length, 0);
  const stale = await POST(new Request("http://localhost/api/profile/checkin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...payload, trainingTechnique: techniqueOptions[1], confirm: true, proposalToken: proposal.proposalToken }) }));
  assert.equal(stale.status, 409);
  assert.equal(writes.length, 0);

  reset();
  result = await submit({ mode: "workout", selfReport: "actualizar" });
  assert.equal(result.action, "regenerated_workout");
  assert.equal(wrote("workout_plan_versions"), true, "Se puede actualizar aunque no hayan cambiado las respuestas");

  reset();
  result = await submit({ mode: "nutrition", goal: "Perder grasa", daysPerWeek: 6, injuries: ["Rodilla"] });
  assert.equal(result.action, "regenerated_nutrition");
  assert.ok(wrote("nutrition_plan_versions"));
  assert.equal(wrote("workout_plan_versions"), false);
  assert.equal(lastProfileWrite().workout_plan_review_needed, true);
  const saved = writes.find((write) => write.table === "profiles").values;
  assert.equal(saved.days_per_week, 3);
  assert.deepEqual(saved.restrictions, []);

  reset({ nutrition_plan_review_needed: true });
  result = await submit({ mode: "workout", goal: "Perder grasa", foodRestrictions: ["Gluten"] });
  assert.equal(result.action, "regenerated_workout");
  assert.ok(wrote("workout_plan_versions"));
  assert.equal(wrote("nutrition_plan_versions"), false);
  assert.equal(lastProfileWrite().nutrition_plan_review_needed, true);

  reset({ workout_plan_review_needed: true });
  result = await submit({ mode: "nutrition", foodRestrictions: ["Gluten"] });
  assert.equal(result.action, "regenerated_nutrition");
  assert.equal(lastProfileWrite().workout_plan_review_needed, true);

  reset();
  result = await submit({ mode: "general", goal: "Perder grasa" });
  assert.equal(result.action, "regenerated_both");
  assert.ok(wrote("nutrition_plan_versions") && wrote("workout_plan_versions"));
  assert.equal(lastProfileWrite().workout_plan_review_needed, false);
  assert.equal(lastProfileWrite().nutrition_plan_review_needed, false);

  reset({}, "nutrition_plans");
  result = await submit({ mode: "nutrition", goal: "Perder grasa" });
  assert.equal(result.action, "profile_updated_only");
  assert.deepEqual(result.changed, ["objetivo"]);
  assert.equal(lastProfileWrite().workout_plan_review_needed, true);
  assert.equal(lastProfileWrite().nutrition_plan_review_needed, true);
  assert.equal(wrote("workout_plan_versions"), false);

  console.log("Revisión simulada: mantener, actualizar, ámbitos y revisiones pendientes correctos.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

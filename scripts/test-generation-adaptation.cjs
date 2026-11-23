/* eslint-disable @typescript-eslint/no-require-imports -- Server dependencies are replaced through the CommonJS loader. */
const assert = require("node:assert/strict");
const Module = require("node:module");

const profile = {
  user_id: "test-user", sex: "male", age: 30, height_cm: 178, current_weight_kg: 80,
  primary_goal: "Ganar masa muscular", experience: "Nunca he entrenado",
  days_per_week: 2, session_duration_minutes: 60, meal_count: 4,
  training_place: "Casa", training_equipment: ["dumbbell"], restrictions: [], food_restrictions: [],
};
const { originalCatalog, hipExercise } = require("./workout-planner-fixtures.cjs");
let catalog = originalCatalog;
let mode = "";
let sequence = 0;
const writes = [];
class Query {
  constructor(table) { this.table = table; this.operation = "read"; this.fields = ""; }
  select(fields) { this.fields = fields; return this; }
  eq() { return this; }
  order() { this.ordered = true; return this; }
  limit() { return this; }
  in(column, values) { this.inValues = values; return this; }
  insert(values) { this.operation = "insert"; writes.push({ table: this.table, operation: this.operation, values }); return this; }
  update(values) { this.operation = "update"; writes.push({ table: this.table, operation: this.operation, values }); return this; }
  delete() { this.operation = "delete"; writes.push({ table: this.table, operation: this.operation }); return this; }
  result() {
    if (this.operation === "insert") return { data: { id: `${this.table}-${++sequence}` }, error: null };
    if (this.operation !== "read") return { data: null, error: null };
    if (this.table === "profiles") return { data: profile, error: null };
    if (this.table === "workout_plans") return { data: mode === "initial" ? null : { id: "active-plan", updated_at: "2026-01-01" }, error: null };
    if (this.table === "workout_plan_versions") return { data: this.ordered ? { version_number: 1 } : { id: "old-version", version_number: 1 }, error: null };
    if (this.table === "exercises" || this.table === "foods_catalog") return { data: this.inValues.map((name) => ({ id: name, name })), error: null };
    return { data: null, error: null };
  }
  single() { return Promise.resolve(this.result()); }
  maybeSingle() { return Promise.resolve(this.result()); }
  then(resolve, reject) { return Promise.resolve(this.result()).then(resolve, reject); }
}
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === "@/lib/supabase/server") return { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: "test-user", email: "test@example.invalid" } } }) } }) };
  if (request === "@/lib/supabase/admin") return { createAdminClient: () => ({ from: (table) => new Query(table) }) };
  if (request === "@/lib/exercise-catalog") return { getPlanningExerciseCatalog: async () => catalog };
  if (request === "@/lib/admin-access") return { isAdminUser: () => true };
  return originalLoad.call(this, request, parent, isMain);
};
const routes = {
  initial: require("../src/app/api/plans/generate/route.ts").POST,
  automatic: require("../src/app/api/workouts/automatic/route.ts").POST,
  review: require("../src/app/api/plans/workout/regenerate/route.ts").POST,
  admin: require("../src/app/api/admin/users/[userId]/regenerate/route.ts").POST,
};
Module._load = originalLoad;

async function submit(body) {
  const request = new Request("http://localhost/test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const response = await routes[mode](request, { params: Promise.resolve({ userId: "test-user" }) });
  return { status: response.status, data: await response.json() };
}
async function main() {
  for (mode of Object.keys(routes)) {
    writes.length = 0;
    catalog = originalCatalog;
    const body = mode === "admin" ? { type: "workout" } : {};
    const first = await submit(body);
    assert.equal(first.status, 409, mode);
    assert.equal(first.data.action, "adaptation_required", mode);
    assert.match(first.data.error, /confirmación/, mode);
    assert.ok(first.data.adaptations.some((item) => item.unfilled?.includes("Peso muerto rumano con pesa rusa")), mode);
    assert.ok(first.data.adaptations.some((item) => item.kind === "coverage" && item.missingGroups.includes("isquiotibiales")), mode);
    assert.equal(writes.length, 0, `${mode}: la propuesta no debe guardar ni activar nada`);
    const invalid = await submit({ ...body, adaptationToken: "invalid" });
    assert.equal(invalid.status, 400, mode);
    assert.equal(writes.length, 0, `${mode}: un token inválido no debe activar nada`);

    catalog = originalCatalog.filter((exercise) => exercise.primaryMuscle !== "lats");
    const changed = await submit({ ...body, adaptationToken: first.data.adaptationToken });
    assert.equal(changed.status, 409, mode);
    assert.equal(changed.data.action, "adaptation_required", mode);
    assert.notEqual(changed.data.adaptationToken, first.data.adaptationToken, mode);
    assert.equal(writes.length, 0, `${mode}: la propuesta modificada requiere confirmación`);

    catalog = [{ ...originalCatalog[0], equipment: ["machine"] }];
    const blocked = await submit({ ...body, adaptationToken: first.data.adaptationToken });
    assert.equal(blocked.status, 400, mode);
    assert.equal(writes.length, 0, `${mode}: no debe activarse un día vacío`);

    catalog = originalCatalog;
    const accepted = await submit({ ...body, adaptationToken: first.data.adaptationToken });
    assert.equal(accepted.status, 200, mode);
    assert.deepEqual(accepted.data.adaptations, first.data.adaptations, mode);
    const version = writes.find((item) => item.table === "workout_plan_versions" && item.operation === "insert");
    assert.deepEqual(version.values.profile_snapshot.workout_adaptations, first.data.adaptations, mode);
    assert.equal(writes.filter((item) => item.table === "workout_days" && item.operation === "insert").length, 2, mode);
    assert.ok(writes.filter((item) => item.table === "workout_exercises" && item.operation === "insert").flatMap((item) => item.values).length > 0, mode);

    writes.length = 0;
    catalog = [...originalCatalog, hipExercise];
    const full = await submit(body);
    assert.equal(full.status, 200, mode);
    assert.notEqual(full.data.action, "adaptation_required", mode);
    assert.deepEqual(full.data.adaptations, [], mode);
    assert.ok(writes.filter((item) => item.table === "workout_exercises" && item.operation === "insert").flatMap((item) => item.values).length > 0, mode);

    writes.length = 0;
    profile.session_duration_minutes = 30;
    catalog = [...originalCatalog, hipExercise].filter((exercise) => exercise.primaryMuscle !== "lats");
    const short = await submit(body);
    assert.equal(short.status, 409, mode);
    assert.ok(short.data.adaptations.some((item) => item.kind === "coverage" && item.missingGroups.includes("espalda")), mode);
    assert.equal(writes.length, 0, `${mode}: la cobertura incompleta requiere confirmación`);
    const confirmedShort = await submit({ ...body, adaptationToken: short.data.adaptationToken });
    assert.equal(confirmedShort.status, 200, mode);
    assert.deepEqual(confirmedShort.data.adaptations, short.data.adaptations, mode);
    assert.deepEqual(writes.find((item) => item.table === "workout_plan_versions" && item.operation === "insert").values.profile_snapshot.workout_adaptations, short.data.adaptations, mode);
    profile.session_duration_minutes = 60;
  }
  const template = require("../src/lib/workout-templates.ts").workoutTemplates.find((item) => item.id === "estudio-arazi-gimnasio-avanzado-4");
  const { continuityOptions, techniqueOptions } = require("../src/lib/training-experience.ts");
  Object.assign(profile, {
    experience: "Entre 3 y 5 años", training_continuity: continuityOptions[0], training_technique: techniqueOptions[0],
    training_place: "Gimnasio", days_per_week: 4, session_duration_minutes: 60, restrictions: [],
  });
  const names = [...new Set(template.days.flatMap((day) => day.exercises.map((item) => item.name)))];
  catalog = names.map((name) => ({ name, primaryMuscle: "quadriceps", muscleGroups: ["quadriceps"], restrictions: [], equipment: [], difficulty: "intermediate", hasTrustedMedia: true }));
  for (mode of Object.keys(routes)) {
    writes.length = 0;
    const body = mode === "admin" ? { type: "workout" } : {};
    const proposed = await submit(body);
    assert.equal(proposed.status, 409, mode);
    assert.equal(proposed.data.structure, template.name, mode);
    assert.deepEqual(proposed.data.days.map((day) => day.exercises.map((item) => item.name)), template.days.map((day) => day.exercises.map((item) => item.name)), mode);
    assert.ok(proposed.data.adaptations.some((item) => item.kind === "review" && item.reasons.some((reason) => reason.includes("10.7717/peerj.10537"))), mode);
    assert.equal(writes.length, 0, mode);
    const originalName = template.name;
    template.name = `${originalName} modificada`;
    const renamed = await submit({ ...body, adaptationToken: proposed.data.adaptationToken });
    assert.equal(renamed.status, 409, mode);
    assert.notEqual(renamed.data.adaptationToken, proposed.data.adaptationToken, mode);
    assert.equal(writes.length, 0, mode);
    template.name = originalName;
    const accepted = await submit({ ...body, adaptationToken: proposed.data.adaptationToken });
    assert.equal(accepted.status, 200, mode);
    const version = writes.find((item) => item.table === "workout_plan_versions" && item.operation === "insert");
    assert.deepEqual(version.values.profile_snapshot.workout_adaptations, proposed.data.adaptations, mode);
    const savedExercises = writes.filter((item) => item.table === "workout_exercises" && item.operation === "insert").map((item) => item.values);
    assert.deepEqual(savedExercises.map((day) => day.map((item) => ({
      name: item.exercise_id, sets: item.sets, repetitions: item.repetitions, restSeconds: item.rest_seconds,
    }))), proposed.data.days.map((day) => day.exercises), mode);
  }
  console.log("Generaciones simuladas: inicial, automática, revisión y administración correctas.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

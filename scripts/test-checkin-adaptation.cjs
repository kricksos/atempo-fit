/* eslint-disable @typescript-eslint/no-require-imports -- The route's server dependencies are replaced through the CommonJS loader. */
const assert = require("node:assert/strict");
const Module = require("node:module");

const profile = {
  user_id: "test-user", sex: "male", age: 30, height_cm: 178, current_weight_kg: 80,
  primary_goal: "Ganar masa muscular", experience: "Nunca he entrenado",
  days_per_week: 3, session_duration_minutes: 60, meal_count: 4,
  training_place: "Casa", training_equipment: ["dumbbell"], restrictions: [], food_restrictions: [],
};
const { originalCatalog, hipExercise } = require("./workout-planner-fixtures.cjs");
let catalog = originalCatalog;
const writes = [];
let dayId = 0;
let activeVersion = "active-version";
let measurement = null;
let failure = null;
class Query {
  constructor(table) { this.table = table; this.operation = "read"; this.values = null; }
  select() { return this; }
  eq() { return this; }
  order() { return this; }
  limit() { return this; }
  in(column, values) { this.inValues = values; return this; }
  insert(values) { this.operation = "insert"; this.values = values; writes.push({ table: this.table, operation: this.operation, values }); return this; }
  update(values) { this.operation = "update"; this.values = values; writes.push({ table: this.table, operation: this.operation, values }); return this; }
  result() {
    if (failure?.table === this.table && failure.operation === this.operation) return { data: null, error: new Error("Error de base de datos simulado") };
    if (this.operation === "insert" && this.table === "plan_generation_runs") return { data: { id: "run" }, error: null };
    if (this.operation === "insert" && this.table === "workout_plan_versions") return { data: { id: "new-version" }, error: null };
    if (this.operation === "insert" && this.table === "workout_days") return { data: { id: `day-${++dayId}` }, error: null };
    if (this.operation !== "read") return { data: null, error: null };
    if (this.table === "profiles") return { data: profile, error: null };
    if (this.table === "workout_plans") return { data: { id: "plan" }, error: null };
    if (this.table === "workout_plan_versions") return { data: { id: activeVersion, version_number: 1 }, error: null };
    if (this.table === "body_measurements") return { data: measurement, error: null };
    if (this.table === "exercises") return { data: this.inValues.map((name) => ({ id: name, name })), error: null };
    return { data: null, error: null };
  }
  single() { return Promise.resolve(this.result()); }
  maybeSingle() { return Promise.resolve(this.result()); }
  then(resolve, reject) { return Promise.resolve(this.result()).then(resolve, reject); }
}
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === "@/lib/supabase/server") return { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: "test-user" } } }) } }) };
  if (request === "@/lib/supabase/admin") return { createAdminClient: () => ({ from: (table) => new Query(table) }) };
  if (request === "@/lib/exercise-catalog") return { getPlanningExerciseCatalog: async () => catalog };
  return originalLoad.call(this, request, parent, isMain);
};
const { POST } = require("../src/app/api/profile/checkin/route.ts");
const { checkinRecommendationSchema, checkinResultSchema } = require("../src/features/planning/checkin-proposal.ts");
Module._load = originalLoad;

const payload = {
  goal: profile.primary_goal, daysPerWeek: 2, sessionDuration: 60, trainingPlace: "Casa",
  trainingEquipment: ["dumbbell"], foodRestrictions: [], injuries: [], selfReport: "actualizar", mode: "workout", confirm: false,
};
async function submit(body) {
  const response = await POST(new Request("http://localhost/api/profile/checkin", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
  return { status: response.status, data: await response.json() };
}
async function main() {
  const first = await submit(payload);
  assert.equal(first.status, 200);
  assert.equal(first.data.action, "recommendation");
  assert.equal(first.data.recommendation, "activate_workout");
  assert.equal(checkinRecommendationSchema.safeParse(first.data).success, true, "La propuesta real debe poder mostrarse en el cliente");
  assert.equal(checkinRecommendationSchema.safeParse({ ...first.data, days: [] }).success, false);
  assert.equal(checkinRecommendationSchema.safeParse({ ...first.data, proposalToken: undefined }).success, false);
  assert.match(first.data.proposalToken, /^[a-f0-9]{64}$/);
  assert.equal(first.data.days.length, 2);
  assert.ok(first.data.adaptationNotes.some((note) => note.includes("isquiotibiales")), "La revisión debe mostrar la cobertura pendiente antes de activar");
  assert.equal(writes.length, 0, "La propuesta no debe modificar el perfil ni el plan");

  const missingToken = await submit({ ...payload, confirm: true });
  assert.equal(missingToken.status, 409);
  assert.equal(writes.length, 0, "No se puede activar sin confirmar la propuesta concreta");

  activeVersion = "another-version";
  const versionChanged = await submit({ ...payload, confirm: true, proposalToken: first.data.proposalToken });
  assert.equal(versionChanged.status, 409);
  assert.notEqual(versionChanged.data.proposalToken, first.data.proposalToken);
  assert.equal(writes.length, 0);
  activeVersion = "active-version";

  measurement = { measured_at: "2026-01-01", weight_kg: 79, waist_cm: null, chest_cm: null, arm_cm: null, thigh_cm: null };
  const measurementChanged = await submit({ ...payload, confirm: true, proposalToken: first.data.proposalToken });
  assert.equal(measurementChanged.status, 409);
  assert.notEqual(measurementChanged.data.proposalToken, first.data.proposalToken);
  assert.equal(writes.length, 0);
  measurement = null;

  failure = { table: "workout_plans", operation: "read" };
  const failedPreview = await submit(payload);
  assert.equal(failedPreview.status, 500);
  assert.equal(writes.length, 0, "Un fallo de lectura no debe confundirse con un plan ausente");
  failure = null;

  catalog = originalCatalog.filter((item) => item.primaryMuscle !== "lats");
  const changed = await submit({ ...payload, confirm: true, proposalToken: first.data.proposalToken });
  assert.equal(changed.status, 409);
  assert.equal(changed.data.recommendation, "activate_workout");
  assert.equal(checkinRecommendationSchema.safeParse(changed.data).success, true);
  assert.notEqual(changed.data.proposalToken, first.data.proposalToken);
  assert.equal(writes.length, 0, "Una propuesta modificada requiere otra confirmación");

  catalog = [...originalCatalog, hipExercise];
  const completed = await submit({ ...payload, confirm: true, proposalToken: first.data.proposalToken });
  assert.equal(completed.status, 409);
  assert.equal(writes.length, 0, "Una propuesta que ya no necesita adaptación debe revisarse de nuevo");
  const fullPreview = await submit(payload);
  assert.equal(fullPreview.status, 200);
  assert.equal(fullPreview.data.recommendation, "activate_workout");
  assert.equal(writes.length, 0);

  catalog = [{ ...originalCatalog[0], equipment: ["machine"] }];
  const impossible = await submit({ ...payload, confirm: true, proposalToken: first.data.proposalToken });
  assert.equal(impossible.status, 400);
  assert.equal(writes.length, 0, "Un día sin opciones no debe modificar el plan activo");

  catalog = originalCatalog;
  profile.days_per_week = 2;
  const alreadyChanged = await submit({ ...payload, confirm: true, proposalToken: first.data.proposalToken });
  assert.equal(alreadyChanged.status, 409);
  assert.equal(writes.length, 0, "Una propuesta obsoleta no debe guardar el perfil");
  profile.days_per_week = 3;
  failure = { table: "workout_plan_versions", operation: "update" };
  const failedActivation = await submit({ ...payload, confirm: true, proposalToken: first.data.proposalToken });
  assert.equal(failedActivation.status, 500);
  assert.match(failedActivation.data.error, /algunos cambios se hayan guardado/);
  assert.equal(writes.some((item) => item.table === "workout_plan_versions" && item.operation === "insert"), false);
  writes.length = 0;
  failure = null;
  const accepted = await submit({ ...payload, confirm: true, proposalToken: first.data.proposalToken });
  assert.equal(accepted.status, 200);
  assert.equal(accepted.data.action, "regenerated_workout");
  assert.equal(checkinResultSchema.safeParse(accepted.data).success, true);
  assert.ok(accepted.data.adaptations.some((item) => item.kind === "coverage" && item.missingGroups.includes("isquiotibiales")));
  const version = writes.find((item) => item.table === "workout_plan_versions" && item.operation === "insert");
  assert.deepEqual(version.values.profile_snapshot.workout_adaptations, accepted.data.adaptations);
  assert.equal(writes.filter((item) => item.table === "workout_days" && item.operation === "insert").length, 2);
  const inserted = writes.filter((item) => item.table === "workout_exercises" && item.operation === "insert").flatMap((item) => item.values);
  assert.ok(inserted.length > 0);
  assert.ok(inserted.every((item) => originalCatalog.some((exercise) => exercise.name === item.exercise_id)));
  writes.length = 0;
  catalog = [...originalCatalog, hipExercise];
  const injuryPayload = { ...payload, injuries: ["Hombro"] };
  const injuryProposal = await submit(injuryPayload);
  assert.equal(injuryProposal.status, 200);
  assert.equal(injuryProposal.data.recommendation, "activate_workout");
  assert.ok(injuryProposal.data.adaptationNotes.some((note) => note.includes("profesional")), "La propuesta debe mostrar las limitaciones de las restricciones");
  assert.equal(writes.length, 0);
  const injuryChanged = await submit({ ...injuryPayload, injuries: ["Rodilla"], confirm: true, proposalToken: injuryProposal.data.proposalToken });
  assert.equal(injuryChanged.status, 409);
  assert.notEqual(injuryChanged.data.proposalToken, injuryProposal.data.proposalToken);
  assert.equal(writes.length, 0);
  const injuryAccepted = await submit({ ...injuryPayload, confirm: true, proposalToken: injuryProposal.data.proposalToken });
  assert.equal(injuryAccepted.status, 200);
  assert.ok(injuryAccepted.data.adaptations.some((item) => item.kind === "review"));
  const filtered = writes.filter((item) => item.table === "workout_exercises" && item.operation === "insert").flatMap((item) => item.values);
  const { isPlanningExerciseCompatible } = require("../src/features/planning/workout-compatibility.ts");
  assert.ok(filtered.length > 0);
  assert.ok(filtered.every((item) => isPlanningExerciseCompatible(catalog.find((exercise) => exercise.name === item.exercise_id), ["shoulder_injury"], ["dumbbell"], true)));
  console.log("Revisión simulada: propuesta sin escrituras, cancelación, cambios y activación con una confirmación correctos.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

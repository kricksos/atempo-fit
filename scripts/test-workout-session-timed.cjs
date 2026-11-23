/* eslint-disable @typescript-eslint/no-require-imports -- Route dependencies are replaced for isolated tests. */
const assert = require("node:assert/strict");
const Module = require("node:module");

const sessionId = "11111111-1111-4111-8111-111111111111";
const timedId = "22222222-2222-4222-8222-222222222222";
const repsId = "33333333-3333-4333-8333-333333333333";
const unrelatedId = "44444444-4444-4444-8444-444444444444";
const day = [
  { exercise_id: timedId, repetitions: "8-12", sets: 2 },
  { exercise_id: repsId, repetitions: "8-12", sets: 2 },
];
const catalog = [{ id: timedId, name: "Plancha abdominal" }, { id: repsId, name: "Sentadilla con peso corporal" }, { id: unrelatedId, name: "Otro" }];
let writes = [];
class Query {
  constructor(table) { this.table = table; this.columns = ""; this.operation = "read"; this.values = []; }
  select(columns) { this.columns = columns; return this; }
  eq() { return this; }
  neq() { return this; }
  in(_column, values) { this.values = values; return this; }
  upsert(values) { writes.push({ table: this.table, operation: "upsert", values }); return Promise.resolve({ error: null }); }
  update(values) { this.operation = "update"; writes.push({ table: this.table, operation: "update", values }); return this; }
  result() {
    if (this.operation !== "read") return { data: null, error: null };
    if (this.table === "workout_sessions" && this.columns.startsWith("id, user_id")) return { data: { id: sessionId, user_id: "fixture-user", completed: false, workout_day_id: "fixture-day" }, error: null };
    if (this.table === "workout_sessions") return { data: [], error: null };
    if (this.table === "workout_exercises") return { data: day, error: null };
    if (this.table === "exercises") return { data: catalog.filter((entry) => this.values.includes(entry.id)), error: null };
    return { data: [], error: null };
  }
  single() { return Promise.resolve(this.result()); }
  then(resolve, reject) { return Promise.resolve(this.result()).then(resolve, reject); }
}
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === "@/lib/supabase/server") return { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: "fixture-user" } } }) } }) };
  if (request === "@/lib/supabase/admin") return { createAdminClient: () => ({ from: (table) => new Query(table) }) };
  if (request === "@/lib/analytics") return { trackAnalyticsEvent: async () => undefined };
  return originalLoad.call(this, request, parent, isMain);
};
const { POST } = require("../src/app/api/workouts/session/route.ts");
const { hasStrengthPerformance } = require("../src/lib/workout-log.ts");
Module._load = originalLoad;

async function submit(body) {
  const response = await POST(new Request("http://localhost/api/workouts/session", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
  return { status: response.status, data: await response.json() };
}
const timed = { exerciseId: timedId, setNumber: 1, weightKg: 0, repetitions: 0, durationSeconds: 25 };
const reps = { exerciseId: repsId, setNumber: 1, weightKg: 12, repetitions: 10, durationSeconds: null };
async function main() {
  assert.equal(hasStrengthPerformance({ duration_seconds: null, weight_kg: null, repetitions: 0 }), false);
  assert.equal(hasStrengthPerformance({ duration_seconds: 25, weight_kg: null, repetitions: 0 }), false);
  assert.equal(hasStrengthPerformance({ duration_seconds: null, weight_kg: null, repetitions: 10 }), true);
  assert.equal(hasStrengthPerformance({ duration_seconds: null, weight_kg: 0, repetitions: 10 }), true);
  let response = await submit({ action: "save", sessionId, logs: [timed, reps] });
  assert.equal(response.status, 200);
  assert.equal(writes[0].values[0].duration_seconds, 25);
  assert.equal(writes[0].values[0].repetitions, 0);
  assert.equal(writes[0].values[0].weight_kg, null);
  assert.equal(writes[0].values[1].duration_seconds, null);
  assert.equal(writes[0].values[1].repetitions, 10);
  writes = [];
  response = await submit({ action: "save", sessionId, logs: [{ ...timed, durationSeconds: null }] });
  assert.equal(response.status, 200);
  assert.equal(writes[0].values[0].duration_seconds, null);
  assert.equal(writes[0].values[0].weight_kg, null);
  assert.equal(writes[0].values[0].repetitions, 0);
  writes = [];
  for (const log of [
    { ...timed, durationSeconds: 0 },
    { ...timed, repetitions: 3 },
    { ...timed, weightKg: 3 },
    { ...reps, durationSeconds: 30 },
    { ...reps, setNumber: 3 },
    { ...reps, exerciseId: unrelatedId },
  ]) {
    response = await submit({ action: "save", sessionId, logs: [log] });
    assert.equal(response.status, 400);
    assert.equal(writes.length, 0);
  }
  response = await submit({ action: "complete", sessionId, durationMinutes: 25, logs: [timed, { ...timed, setNumber: 2, durationSeconds: null }, reps] });
  assert.equal(response.status, 200);
  assert.equal(response.data.completed, true);
  assert.equal(writes.find((item) => item.table === "exercise_logs").values[0].duration_seconds, 25);
  assert.equal(writes.find((item) => item.table === "exercise_logs").values[1].duration_seconds, null);
  assert.equal(writes.find((item) => item.table === "exercise_logs").values[1].weight_kg, null);
  assert.ok(writes.some((item) => item.table === "workout_sessions" && item.values.completed));
  console.log("Sesiones: segundos y repeticiones se validan y guardan por separado.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

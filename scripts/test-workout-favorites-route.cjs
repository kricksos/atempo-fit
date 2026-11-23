/* eslint-disable @typescript-eslint/no-require-imports -- Dependencies are replaced for isolated route tests. */
const assert = require("node:assert/strict");
const Module = require("node:module");
const { workoutTemplates } = require("../src/lib/workout-templates.ts");

const exerciseId = "11111111-1111-4111-8111-111111111111";
const routineId = "22222222-2222-4222-8222-222222222222";
const otherId = "33333333-3333-4333-8333-333333333333";
const draftId = "44444444-4444-4444-8444-444444444444";
const rows = {
  favorite_exercises: [],
  favorite_workout_templates: [],
  workout_plans: [{ id: routineId, user_id: "user-a", source: "manual", hidden_at: null, is_favorite: false }, { id: otherId, user_id: "user-b", source: "manual", hidden_at: null, is_favorite: false }],
  manual_workout_drafts: [{ id: draftId, user_id: "user-a", published_at: null, is_favorite: false }],
};
let authenticated = true;
let fail = false;
class Query {
  constructor(table) { this.table = table; this.filters = []; }
  eq(key, value) { this.filters.push((row) => row[key] === value); return this; }
  is(key, value) { return this.eq(key, value); }
  in(key, values) { this.filters.push((row) => values.includes(row[key])); return this; }
  select() { return this; }
  update(value) { this.operation = "update"; this.value = value; return this; }
  delete() { this.operation = "delete"; return this; }
  upsert(value) { this.operation = "upsert"; this.value = value; return this; }
  execute() {
    if (fail) return { data: null, error: new Error("simulated failure") };
    const table = rows[this.table];
    if (this.operation === "upsert") {
      if (!table.some((row) => Object.keys(this.value).every((key) => row[key] === this.value[key]))) table.push(this.value);
      return { data: null, error: null };
    }
    const matches = table.filter((row) => this.filters.every((filter) => filter(row)));
    if (this.operation === "update") matches.forEach((row) => Object.assign(row, this.value));
    if (this.operation === "delete") matches.forEach((row) => table.splice(table.indexOf(row), 1));
    return { data: matches[0] ?? null, error: null };
  }
  maybeSingle() { return Promise.resolve(this.execute()); }
  then(resolve, reject) { return Promise.resolve(this.execute()).then(resolve, reject); }
}
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === "@/lib/supabase/server") return { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: authenticated ? { id: "user-a" } : null } }) } }) };
  if (request === "@/lib/supabase/admin") return { createAdminClient: () => ({ from: (table) => new Query(table) }) };
  if (request === "@/lib/manual-exercise-catalog-server") return { getManualExerciseCatalog: async () => ({ catalog: [{ id: exerciseId }] }) };
  return originalLoad.call(this, request, parent, isMain);
};
const { POST } = require("../src/app/api/workouts/favorites/route.ts");
Module._load = originalLoad;

async function submit(body) {
  const response = await POST(new Request("http://localhost/api/workouts/favorites", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) }));
  return { status: response.status, data: await response.json() };
}
async function main() {
  authenticated = false;
  assert.equal((await submit({ kind: "exercise", id: exerciseId, favorite: true })).status, 401);
  authenticated = true;
  assert.equal((await submit("{")).status, 400);
  assert.equal((await submit({ kind: "exercise", id: "invalid", favorite: true })).status, 400);
  assert.equal((await submit({ kind: "template", id: "unknown", favorite: true })).status, 404);
  assert.equal((await submit({ kind: "exercise", id: otherId, favorite: true })).status, 404);
  assert.equal((await submit({ kind: "routine", id: otherId, favorite: true })).status, 404);
  assert.equal(rows.workout_plans[1].is_favorite, false);
  for (const [kind, id] of [["exercise", exerciseId], ["template", workoutTemplates[0].id], ["routine", routineId], ["draft", draftId]]) {
    assert.deepEqual(await submit({ kind, id, favorite: true }), { status: 200, data: { favorite: true } });
    assert.equal((await submit({ kind, id, favorite: true })).status, 200);
  }
  assert.equal(rows.favorite_exercises.length, 1);
  assert.equal(rows.favorite_workout_templates.length, 1);
  assert.equal(rows.workout_plans[0].is_favorite, true);
  assert.equal(rows.manual_workout_drafts[0].is_favorite, true);
  assert.equal((await submit({ kind: "exercise", id: exerciseId, favorite: false })).status, 200);
  assert.equal((await submit({ kind: "exercise", id: exerciseId, favorite: false })).status, 200);
  assert.equal(rows.favorite_exercises.length, 0);
  rows.manual_workout_drafts[0].published_at = "2026-01-01";
  assert.equal((await submit({ kind: "draft", id: draftId, favorite: false })).status, 404);
  fail = true;
  assert.equal((await submit({ kind: "routine", id: routineId, favorite: false })).status, 500);
  assert.equal(rows.workout_plans[0].is_favorite, true);
  console.log("Favoritos: autenticación, propiedad, validación, idempotencia y errores comprobados.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

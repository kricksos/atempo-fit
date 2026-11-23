/* eslint-disable @typescript-eslint/no-require-imports -- Route dependencies are replaced for isolated tests. */
const assert = require("node:assert/strict");
const Module = require("node:module");

const now = new Date(Date.now() - 86400000).toISOString();
const sessions = Array.from({ length: 505 }, (_, index) => ({ id: `session-${String(index).padStart(4, "0")}`, user_id: "user-1", completed: true, completed_at: now, duration_minutes: 30 }));
sessions.push({ id: "other-user", user_id: "user-2", completed: true, completed_at: now, duration_minutes: 30 });
sessions.push({ id: "unfinished", user_id: "user-1", completed: false, completed_at: now, duration_minutes: 30 });
const logs = [
  ...Array.from({ length: 501 }, (_, index) => ({ id: `log-${String(index).padStart(4, "0")}`, workout_session_id: "session-0000", exercise_id: "exercise-1", set_number: index + 1, weight_kg: 10, repetitions: 8, duration_seconds: null, completed: true })),
  { id: "other-log", workout_session_id: "other-user", exercise_id: "exercise-1", set_number: 1, weight_kg: 99, repetitions: 8, duration_seconds: null, completed: true },
  { id: "unfinished-log", workout_session_id: "session-0000", exercise_id: "exercise-1", set_number: 1, weight_kg: 99, repetitions: 8, duration_seconds: null, completed: false },
];
let user = { id: "user-1" };
let failTable = null;
const queries = [];
class Query {
  constructor(table) { this.table = table; this.filters = []; this.offset = 0; this.end = Infinity; }
  select() { return this; }
  eq(key, value) { this.filters.push((row) => row[key] === value); return this; }
  gte(key, value) { this.filters.push((row) => row[key] >= value); return this; }
  lte(key, value) { this.filters.push((row) => row[key] <= value); return this; }
  in(key, values) { this.filters.push((row) => values.includes(row[key])); return this; }
  order() { return this; }
  range(start, end) { this.offset = start; this.end = end; return this; }
  then(resolve, reject) {
    queries.push({ table: this.table, offset: this.offset });
    const source = this.table === "workout_sessions" ? sessions : this.table === "exercise_logs" ? logs : [{ id: "exercise-1", name: "Press", primary_muscle: "chest" }];
    const result = failTable === this.table ? { data: null, error: new Error("test database failure") } : { data: source.filter((row) => this.filters.every((filter) => filter(row))).slice(this.offset, this.end + 1), error: null };
    return Promise.resolve(result).then(resolve, reject);
  }
}
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === "@/lib/supabase/server") return { createClient: async () => ({ auth: { getUser: async () => ({ data: { user } }) } }) };
  if (request === "@/lib/supabase/admin") return { createAdminClient: () => ({ from: (table) => new Query(table) }) };
  return originalLoad.call(this, request, parent, isMain);
};
const { GET } = require("../src/app/api/progress/training/route.ts");
Module._load = originalLoad;

async function main() {
  user = null;
  assert.equal((await GET()).status, 401);
  assert.equal(queries.length, 0);
  user = { id: "user-1" };
  const response = await GET();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control"), /no-store/);
  const data = await response.json();
  assert.equal(data.sessions.length, 505);
  assert.equal(data.sessions[0].logs.length, 501);
  assert.equal(data.sessions[0].logs[0].muscle, "Pectoral");
  assert.ok(data.sessions.every((session) => session.id !== "other-user" && session.id !== "unfinished"));
  assert.ok(queries.some((query) => query.table === "workout_sessions" && query.offset === 500));
  assert.ok(queries.some((query) => query.table === "exercise_logs" && query.offset === 500));
  failTable = "exercise_logs";
  assert.equal((await GET()).status, 500);
  console.log("Evolución: autenticación, aislamiento, paginación y errores correctos.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

/* eslint-disable @typescript-eslint/no-require-imports -- Dependencies are replaced for isolated route tests. */
const assert = require("node:assert/strict");
const Module = require("node:module");

const userId = "fixture-user";
const dayId = "00000000-0000-4000-8000-000000000001";
let authenticated = true;
let failWrites = false;
let failReads = false;
let rows = [];
let profile = { primary_goal: "Ganar masa muscular", experience: "Nunca he entrenado", training_place: "Gimnasio" };
let profileColumns = "";

class Query {
  constructor(table) { this.table = table; this.filters = []; }
  update(value) { this.updateValue = value; return this; }
  eq(key, value) { this.filters.push([key, value]); return this; }
  select(columns) {
    if (!this.updateValue) {
      if (this.table === "profiles") profileColumns = columns;
      return this;
    }
    return this.finishUpdate();
  }
  async finishUpdate() {
    if (failWrites) return { data: null, error: "simulated failure" };
    const matches = rows.filter((row) => this.filters.every(([key, value]) => row[key] === value));
    matches.forEach((row) => Object.assign(row, this.updateValue));
    return { data: matches.map((row) => ({ id: row.session_key })), error: null };
  }
  async single() { return { data: profile, error: null }; }
  then(resolve, reject) {
    const result = failReads
      ? { data: null, error: "simulated failure" }
      : { data: rows.filter((row) => this.filters.every(([key, value]) => row[key] === value)), error: null };
    return Promise.resolve(result).then(resolve, reject);
  }
  async insert(value) {
    if (failWrites || rows.some((row) => row.user_id === value.user_id && (row.session_key === value.session_key || row.workout_day_id === value.workout_day_id))) return { error: "simulated conflict" };
    rows.push({ ...value });
    return { error: null };
  }
  async upsert(value) {
    if (failWrites || rows.some((row) => row.user_id === value.user_id && row.workout_day_id === value.workout_day_id && row.session_key !== value.session_key)) return { error: "simulated conflict" };
    const existing = rows.find((row) => row.user_id === value.user_id && row.session_key === value.session_key);
    if (existing) Object.assign(existing, value);
    else rows.push({ ...value });
    return { error: null };
  }
}

const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === "@/lib/supabase/server") return { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: authenticated ? { id: userId } : null } }) } }) };
  if (request === "@/lib/supabase/admin") return { createAdminClient: () => ({ from: (table) => new Query(table) }) };
  return originalLoad.call(this, request, parent, isMain);
};
const { GET, POST, DELETE } = require("../src/app/api/cardio/route.ts");
Module._load = originalLoad;

async function submit(method, body) {
  const handler = method === "POST" ? POST : DELETE;
  const response = await handler(new Request("http://localhost/api/cardio", { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
  return response.status;
}

async function main() {
  const sessionKey = `day-${dayId}`;
  const config = { modality: "Cinta", durationMinutes: 30, intensity: "Moderada" };
  const request = { sessionKey, workoutDayId: dayId };
  authenticated = false;
  assert.equal(await submit("POST", { ...request, ...config }), 401);
  assert.equal((await GET()).status, 401);
  authenticated = true;
  const gymResponse = await GET();
  const gymResult = await gymResponse.json();
  assert.equal(gymResponse.status, 200);
  assert.ok(profileColumns.includes("training_place"));
  assert.equal(gymResult.recommendations.length, 2);
  assert.ok(gymResult.recommendations.every((item) => item.modalities[0] === "Cinta" && item.durationMinutes === 15));
  profile = { primary_goal: "Perder grasa", experience: "Entre 1 y 3 años", training_place: "Casa" };
  const homeResult = await (await GET()).json();
  assert.equal(homeResult.recommendations.length, 3);
  assert.equal(homeResult.recommendations[0].modalities[0], "Caminar al aire libre");
  assert.equal(homeResult.recommendations[0].durationMinutes, 30);
  failReads = true;
  assert.equal((await GET()).status, 500);
  failReads = false;
  assert.equal(await submit("POST", { ...request, ...config, durationMinutes: 4 }), 400);
  assert.equal(await submit("DELETE", { ...request, configuration: { ...config, durationMinutes: 181 } }), 400);
  assert.equal(rows.length, 0);

  assert.equal(await submit("DELETE", { ...request, configuration: config }), 200);
  assert.deepEqual([rows[0].modality, rows[0].duration_minutes, rows[0].intensity, rows[0].enabled], ["Cinta", 30, "Moderada", false]);
  assert.equal(await submit("POST", { ...request, ...config }), 200);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].enabled, true);

  const changed = { modality: "Remo", durationMinutes: 17, intensity: "Suave" };
  assert.equal(await submit("POST", { ...request, ...changed }), 200);
  assert.equal(await submit("DELETE", { ...request, configuration: config }), 200);
  assert.deepEqual([rows[0].session_key, rows[0].modality, rows[0].duration_minutes, rows[0].intensity, rows[0].enabled], [sessionKey, "Remo", 17, "Suave", false]);
  assert.equal(await submit("POST", { ...request, ...changed }), 200);
  assert.equal(rows[0].enabled, true);

  assert.equal(await submit("POST", { ...request, sessionKey: "other-key", ...config }), 500);
  assert.equal(rows.length, 1);
  failWrites = true;
  assert.equal(await submit("DELETE", { ...request, configuration: config }), 500);
  assert.equal(await submit("POST", { ...request, ...config }), 500);
  assert.equal(rows[0].enabled, true);
  failWrites = false;
  const legacyDay = "00000000-0000-4000-8000-000000000002";
  rows.push({ user_id: userId, session_key: "base-2", workout_day_id: legacyDay, modality: "Bicicleta", duration_minutes: 25, intensity: "Suave", enabled: false });
  assert.equal(await submit("POST", { sessionKey: "base-2", workoutDayId: legacyDay, modality: "Bicicleta", durationMinutes: 25, intensity: "Suave" }), 200);
  assert.equal(rows.length, 2);
  assert.equal(rows[1].session_key, "base-2");
  assert.equal(rows[1].enabled, true);
  console.log("Cardio API: autenticación, validación, conservación, reactivación y errores correctos con datos ficticios.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

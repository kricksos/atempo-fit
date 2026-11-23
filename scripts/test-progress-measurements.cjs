/* eslint-disable @typescript-eslint/no-require-imports -- Exercises the server query with an isolated database. */
const assert = require("node:assert/strict");
const { loadMeasurements } = require("../src/lib/progress-measurements-server.ts");

const rows = Array.from({ length: 501 }, (_, index) => ({ id: String(index).padStart(4, "0"), measured_at: "2026-01-01", weight_kg: 70, waist_cm: null, chest_cm: null, arm_cm: null, thigh_cm: null, user_id: "one" }));
rows.push({ ...rows[0], id: "other", user_id: "two" });
let ranges = [];
let fail = false;
class Query {
  select() { return this; }
  eq(key, value) { assert.equal(key, "user_id"); this.userId = value; return this; }
  order() { return this; }
  range(start, end) {
    ranges.push(start);
    return Promise.resolve(fail ? { data: null, error: new Error("database error") } : { data: rows.filter((row) => row.user_id === this.userId).slice(start, end + 1), error: null });
  }
}
const db = { from(table) { assert.equal(table, "body_measurements"); return new Query(); } };
async function main() {
  const result = await loadMeasurements(db, "one");
  assert.equal(result.length, 501);
  assert.ok(result.every((entry) => entry.user_id === "one"));
  assert.deepEqual(ranges, [0, 500]);
  ranges = [];
  fail = true;
  await assert.rejects(loadMeasurements(db, "one"), /database error/);
  console.log("Medidas: historial completo, aislamiento y errores correctos.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

/* eslint-disable @typescript-eslint/no-require-imports -- Isolated route test with mocked database. */
const assert = require("node:assert/strict");
const Module = require("node:module");
const ids = {
  plan: "11111111-1111-4111-8111-111111111111", version: "22222222-2222-4222-8222-222222222222",
  food: "33333333-3333-4333-8333-333333333333", selected: "44444444-4444-4444-8444-444444444444",
  meal: "55555555-5555-4555-8555-555555555555", item: "66666666-6666-4666-8666-666666666666",
};
let rows;
let failActivation = false;
let sequence = 0;
function reset() {
  rows = {
    profiles: [{ user_id: "user", primary_goal: "Mantener peso", food_restrictions: [], diet_preference: "" }],
    nutrition_plans: [{ id: ids.plan, user_id: "user", active: true }],
    nutrition_plan_versions: [{ id: ids.version, nutrition_plan_id: ids.plan, active: true, version_number: 1 }],
    nutrition_meals: [{ id: ids.meal, nutrition_plan_version_id: ids.version }],
    nutrition_meal_items: [{ id: ids.item, meal_id: ids.meal, food_id: ids.food, role: "protein", alternative_group: "protein", substitution_group: "protein", weight_basis: "cooked" }],
    nutrition_item_selections: [{ user_id: "user", meal_item_id: ids.item, selected_food_id: ids.selected }],
    foods_catalog: [{ id: ids.food, name: "Pechuga de pollo", calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fats_per_100g: 4 }, { id: ids.selected, name: "Pavo", calories_per_100g: 135, protein_per_100g: 29, carbs_per_100g: 0, fats_per_100g: 2 }],
    plan_generation_runs: [],
  };
  failActivation = false;
}
class Query {
  constructor(table) { this.table = table; this.filters = []; }
  select() { return this; }
  eq(key, value) { this.filters.push((row) => row[key] === value); return this; }
  in(key, values) { this.filters.push((row) => values.includes(row[key])); return this; }
  order(key, options) { this.sortKey = key; this.ascending = options?.ascending !== false; return this; }
  limit(count) { this.max = count; return this; }
  insert(value) { this.operation = "insert"; this.value = value; return this; }
  update(value) { this.operation = "update"; this.value = value; return this; }
  delete() { this.operation = "delete"; return this; }
  execute(single) {
    const table = rows[this.table];
    if (this.operation === "insert") {
      const inserted = (Array.isArray(this.value) ? this.value : [this.value]).map((value) => ({ id: `new-${++sequence}`, ...value }));
      table.push(...inserted);
      return { data: single ? inserted[0] : inserted, error: null };
    }
    let matches = table.filter((row) => this.filters.every((filter) => filter(row)));
    if (this.sortKey) matches.sort((a, b) => (a[this.sortKey] - b[this.sortKey]) * (this.ascending ? 1 : -1));
    if (this.max) matches = matches.slice(0, this.max);
    if (this.operation === "update") {
      if (failActivation && this.table === "nutrition_plan_versions" && this.value.active === true && matches.some((row) => row.id !== ids.version)) return { data: null, error: new Error("activation failed") };
      matches.forEach((row) => Object.assign(row, this.value));
    }
    if (this.operation === "delete") matches.forEach((row) => table.splice(table.indexOf(row), 1));
    return { data: single ? matches[0] ?? null : matches, error: null };
  }
  maybeSingle() { return Promise.resolve(this.execute(true)); }
  single() { return Promise.resolve(this.execute(true)); }
  then(resolve, reject) { return Promise.resolve(this.execute(false)).then(resolve, reject); }
}
const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === "@/lib/supabase/server") return { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: "user" } } }) } }) };
  if (request === "@/lib/supabase/admin") return { createAdminClient: () => ({ from: (table) => new Query(table) }) };
  return originalLoad.call(this, request, parent, isMain);
};
const { POST } = require("../src/app/api/plans/nutrition/manual/route.ts");
Module._load = originalLoad;

const body = {
  name: "Mi dieta",
  sourceVersionId: ids.version,
  meals: [
    { name: "Desayuno", suggestedTime: "08:00", items: [{ foodId: ids.selected, quantityGrams: 170, role: "protein", sourceItemId: ids.item }] },
    ...["Comida", "Cena"].map((name) => ({ name, suggestedTime: null, items: [{ foodId: ids.food, quantityGrams: 150, role: "protein" }] })),
  ],
};
async function submit(value) {
  const response = await POST(new Request("http://localhost/api/plans/nutrition/manual", { method: "POST", body: JSON.stringify(value) }));
  return { status: response.status, data: await response.json() };
}
async function main() {
  reset();
  assert.equal((await submit({ ...body, sourceVersionId: ids.food })).status, 409);
  assert.equal(rows.nutrition_plan_versions.length, 1);
  const saved = await submit(body);
  assert.equal(saved.status, 200);
  assert.equal(rows.nutrition_plan_versions.find((version) => version.id === ids.version).active, false);
  assert.equal(rows.nutrition_plan_versions.find((version) => version.id === saved.data.versionId).active, true);
  const copied = rows.nutrition_meal_items.find((item) => item.id !== ids.item && item.food_id === ids.selected);
  assert.equal(copied.quantity_grams, 170);
  assert.equal(copied.alternative_group, "protein");
  assert.equal(copied.weight_basis, "cooked");
  reset();
  rows.nutrition_item_selections[0].selected_food_id = ids.food;
  assert.equal((await submit(body)).status, 409);
  assert.equal(rows.nutrition_plan_versions[0].active, true);
  reset();
  failActivation = true;
  assert.equal((await submit(body)).status, 500);
  assert.equal(rows.nutrition_plan_versions[0].active, true);
  assert.equal(rows.nutrition_plan_versions.length, 1);
  console.log("Edición nutricional: versión, alternativa, conflictos y recuperación comprobados.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

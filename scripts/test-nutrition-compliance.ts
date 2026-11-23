import { completedNutritionDayCount, nutritionProgress } from "../src/features/planning/nutrition-compliance";

let passed = 0;
let failed = 0;

function assert(description: string, condition: boolean, details?: unknown) {
  if (condition) { passed += 1; console.log(`  PASS  ${description}`); }
  else { failed += 1; console.log(`  FAIL  ${description}`, details ?? ""); }
}

console.log("\n=== cumplimiento nutricional por días completos ===");
{
  const completedDays = completedNutritionDayCount([
    { completed_on: "2026-08-20" },
    { completed_on: "2026-08-20" },
    { completed_on: "2026-08-20" },
    { completed_on: "2026-08-21" },
    { completed_on: "2026-08-21" },
    { completed_on: "2026-08-22" },
    { completed_on: "2026-08-22" },
    { completed_on: "2026-08-22" },
  ], 3);

  assert("solo cuentan los días con todas las comidas registradas", completedDays === 2, completedDays);
}

{
  const completedDays = completedNutritionDayCount([{ completed_on: "2026-08-20" }, { completed_on: null }], 1);
  assert("ignora fechas nulas y mantiene mínimo de una comida esperada", completedDays === 1, completedDays);
}

{
  const completions = [
    { completed_on: "2026-08-20", meal_id: "old-a" },
    { completed_on: "2026-08-20", meal_id: "old-b" },
    { completed_on: "2026-08-21", meal_id: "old-a" },
    { completed_on: "2026-08-21", meal_id: "old-b" },
    { completed_on: "2026-08-21", meal_id: "new-a" },
  ];
  const progress = nutritionProgress(completions, ["new-a", "new-b"], "2026-08-21");
  assert("hoy solo cuenta comidas del plan activo", JSON.stringify(progress.todayMealIds) === JSON.stringify(["new-a"]));
  assert("no completa hoy con comidas de un plan anterior y conserva días históricos", JSON.stringify(progress.completedDates) === JSON.stringify(["2026-08-20"]));
  assert("sin comidas activas no marca días completos", nutritionProgress(completions, [], "2026-08-21").completedDates.length === 0);
}

console.log(`\n${passed} pruebas OK, ${failed} fallidas.\n`);
if (failed > 0) process.exitCode = 1;
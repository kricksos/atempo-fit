import assert from "node:assert/strict";
import { prepareNutritionEditor } from "../src/features/planning/nutrition-editor";

const meals = [{ id: "m1", name: "Desayuno", suggested_time: "08:00:00" }, { id: "m2", name: "Comida", suggested_time: null }, { id: "m3", name: "Cena", suggested_time: "21:30:00" }];
const items = meals.map((meal, index) => ({ id: `i${index}`, meal_id: meal.id, food_id: "chicken", quantity_grams: 150, role: "protein" }));
const selections = [{ meal_item_id: "i1", selected_food_id: "turkey", quantity_grams: 168 }];
const result = prepareNutritionEditor("version", "Mi dieta", meals, items, selections, new Set(["chicken", "turkey"]));
assert.equal(result.meals[0].suggestedTime, "08:00");
assert.equal(result.meals[1].suggestedTime, null);
assert.deepEqual(result.meals[1].items[0], { foodId: "turkey", quantityGrams: 168, role: "protein", sourceItemId: "i1" });
assert.throws(() => prepareNutritionEditor("version", "Mi dieta", meals, items, selections, new Set(["chicken"])), /no están disponibles/);
assert.throws(() => prepareNutritionEditor("version", "Mi dieta", meals.slice(0, 2), items, selections, new Set(["chicken", "turkey"])), /entre 3 y 6/);
console.log("Editor nutricional: opciones seleccionadas, horas flexibles y datos incompletos comprobados.");

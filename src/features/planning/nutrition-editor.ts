import { z } from "zod";

export const nutritionRole = z.enum(["protein", "carbohydrate", "fat", "vegetable", "fruit", "dairy"]);
export type NutritionEditorItem = { foodId: string; quantityGrams: number; role: z.infer<typeof nutritionRole>; sourceItemId?: string };
export type NutritionEditorMeal = { name: string; suggestedTime: string | null; items: NutritionEditorItem[] };
export type NutritionEditorSource = { versionId: string; name: string; meals: NutritionEditorMeal[] };

export function prepareNutritionEditor(
  versionId: string,
  name: string,
  meals: Array<{ id: string; name: string; suggested_time: string | null }>,
  items: Array<{ id: string; meal_id: string; food_id: string; quantity_grams: number; role: string }>,
  selections: Array<{ meal_item_id: string; selected_food_id: string; quantity_grams: number }>,
  availableFoodIds: Set<string>,
): NutritionEditorSource {
  const selectionByItem = new Map(selections.map((selection) => [selection.meal_item_id, selection]));
  if (meals.length < 3 || meals.length > 6) throw new Error("La dieta activa debe tener entre 3 y 6 comidas para editarla.");
  const editorMeals = meals.map((meal) => {
    const mealItems = items.filter((item) => item.meal_id === meal.id).map((item) => {
      const selected = selectionByItem.get(item.id);
      const foodId = selected?.selected_food_id ?? item.food_id;
      const role = nutritionRole.safeParse(item.role);
      if (!role.success || !availableFoodIds.has(foodId)) throw new Error("Hay alimentos de la dieta que no están disponibles. No se puede editar sin perder información.");
      return { foodId, quantityGrams: selected?.quantity_grams ?? item.quantity_grams, role: role.data, sourceItemId: item.id };
    });
    if (!mealItems.length || mealItems.length > 20) throw new Error("Una comida no tiene alimentos o supera el límite permitido. No se puede editar sin perder información.");
    return { name: meal.name, suggestedTime: meal.suggested_time?.slice(0, 5) ?? null, items: mealItems };
  });
  return { versionId, name, meals: editorMeals };
}

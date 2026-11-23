export function completedNutritionDayCount(completions: Array<{ completed_on: string | null }>, mealsPerDay: number) {
  const expectedMeals = Math.max(1, mealsPerDay);
  const completionsByDate = new Map<string, number>();

  for (const completion of completions) {
    if (!completion.completed_on) continue;
    completionsByDate.set(completion.completed_on, (completionsByDate.get(completion.completed_on) ?? 0) + 1);
  }

  return [...completionsByDate.values()].filter((count) => count >= expectedMeals).length;
}

export function nutritionProgress(completions: Array<{ meal_id: string; completed_on: string }>, activeMealIds: string[], today: string) {
  const activeIds = new Set(activeMealIds);
  const todayMealIds: string[] = [];
  const countByDate = new Map<string, number>();
  for (const completion of completions) {
    if (completion.completed_on === today) {
      if (!activeIds.has(completion.meal_id)) continue;
      todayMealIds.push(completion.meal_id);
    }
    countByDate.set(completion.completed_on, (countByDate.get(completion.completed_on) ?? 0) + 1);
  }
  const completedDates = activeMealIds.length ? [...countByDate.entries()].filter(([, count]) => count >= activeMealIds.length).map(([date]) => date) : [];
  return { todayMealIds, completedDates };
}
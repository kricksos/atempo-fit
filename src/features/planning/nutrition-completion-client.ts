export async function saveNutritionCompletions(mealIds: string[], completed: boolean, date: string) {
  const results = await Promise.allSettled(mealIds.map(async (mealId) => {
    const response = await fetch("/api/plans/nutrition/completion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealId, completed, date }),
    });
    if (!response.ok) throw new Error("Unable to save meal completion");
    return mealId;
  }));
  return {
    savedIds: results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []),
    failed: results.some((result) => result.status === "rejected"),
  };
}

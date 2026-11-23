export function estimateStrengthSeconds(exercises: Array<{ sets: number; restSeconds: number }>) {
  return 5 * 60 + exercises.reduce((total, exercise) =>
    total + 45 + exercise.sets * 45 + Math.max(0, exercise.sets - 1) * exercise.restSeconds, 0);
}

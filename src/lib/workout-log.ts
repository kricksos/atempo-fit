export function hasStrengthPerformance(log: { duration_seconds: number | null; weight_kg: number | null; repetitions: number }) {
  return log.duration_seconds === null && (log.weight_kg !== null || log.repetitions > 0);
}

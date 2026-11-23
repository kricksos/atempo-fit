export type TrainingLog = {
  id: string;
  exerciseId: string;
  name: string;
  muscle: string | null;
  setNumber: number;
  weightKg: number | null;
  repetitions: number;
  durationSeconds: number | null;
};

export type TrainingSession = {
  id: string;
  completedAt: string;
  durationMinutes: number | null;
  logs: TrainingLog[];
};

export type TrainingProgressData = { asOf: string; sessions: TrainingSession[] };
export type TrainingMetric = "carga" | "repeticiones" | "tiempo";

export function sessionsInPeriod(data: TrainingProgressData, weeks: number) {
  const end = Date.parse(data.asOf);
  const start = end - weeks * 7 * 86400000;
  return data.sessions
    .filter((session) => {
      const time = Date.parse(session.completedAt);
      return time >= start && time <= end;
    })
    .sort((a, b) => a.completedAt.localeCompare(b.completedAt) || a.id.localeCompare(b.id));
}

export function metricValue(log: TrainingLog, metric: TrainingMetric): number | null {
  if (metric === "tiempo") return log.durationSeconds !== null && log.durationSeconds > 0 ? log.durationSeconds : null;
  if (log.durationSeconds !== null) return null;
  if (metric === "carga") return log.weightKg !== null && log.weightKg > 0 ? log.weightKg : null;
  return log.repetitions > 0 ? log.repetitions : null;
}

export function exercisePoints(sessions: TrainingSession[], exerciseId: string, metric: TrainingMetric) {
  return sessions.flatMap((session) => {
    const candidates = session.logs
      .filter((log) => log.exerciseId === exerciseId && metricValue(log, metric) !== null)
      .sort((a, b) => (metricValue(b, metric) ?? 0) - (metricValue(a, metric) ?? 0)
        || b.repetitions - a.repetitions
        || (b.weightKg ?? 0) - (a.weightKg ?? 0)
        || a.setNumber - b.setNumber);
    return candidates[0] ? [{ session, log: candidates[0], value: metricValue(candidates[0], metric)! }] : [];
  });
}

export function muscleDistribution(sessions: TrainingSession[]) {
  const groups = new Map<string, number>();
  for (const session of sessions) {
    for (const log of session.logs) {
      const name = log.muscle ?? "Sin clasificar";
      groups.set(name, (groups.get(name) ?? 0) + 1);
    }
  }
  return [...groups.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "es"));
}

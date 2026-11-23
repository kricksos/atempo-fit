import assert from "node:assert/strict";

import { exercisePoints, metricValue, muscleDistribution, sessionsInPeriod, type TrainingLog, type TrainingProgressData } from "../src/lib/training-progress";

const log = (id: string, values: Partial<TrainingLog>): TrainingLog => ({
  id, exerciseId: "press", name: "Press", muscle: "Pectoral", setNumber: 1,
  weightKg: 0, repetitions: 0, durationSeconds: null, ...values,
});
const data: TrainingProgressData = {
  asOf: "2026-11-23T12:00:00Z",
  sessions: [
    { id: "old", completedAt: "2026-08-01T12:00:00Z", durationMinutes: 30, logs: [] },
    { id: "recent", completedAt: "2026-11-22T12:00:00Z", durationMinutes: null, logs: [
      log("light", { weightKg: 30, repetitions: 12 }),
      log("heavy", { weightKg: 40, repetitions: 5, setNumber: 2 }),
      log("timed", { exerciseId: "plank", name: "Plancha", muscle: null, durationSeconds: 30 }),
      log("unknown", { exerciseId: "other", name: "Otro", muscle: null }),
    ] },
    { id: "older", completedAt: "2026-10-01T12:00:00Z", durationMinutes: 25, logs: [log("body", { exerciseId: "pushup", name: "Flexión", repetitions: 10 })] },
    { id: "future", completedAt: "2026-11-24T12:00:00Z", durationMinutes: null, logs: [] },
  ],
};

const fourWeeks = sessionsInPeriod(data, 4);
assert.deepEqual(fourWeeks.map((session) => session.id), ["recent"]);
const twelveWeeks = sessionsInPeriod(data, 12);
assert.deepEqual(twelveWeeks.map((session) => session.id), ["older", "recent"]);
assert.equal(exercisePoints(fourWeeks, "press", "carga")[0].log.id, "heavy");
assert.equal(exercisePoints(fourWeeks, "press", "repeticiones")[0].log.id, "light");
assert.equal(exercisePoints(fourWeeks, "plank", "tiempo")[0].value, 30);
assert.equal(metricValue(data.sessions[1].logs[2], "repeticiones"), null);
assert.equal(exercisePoints(twelveWeeks, "pushup", "carga").length, 0);
assert.equal(exercisePoints(twelveWeeks, "pushup", "repeticiones")[0].value, 10);
assert.deepEqual(muscleDistribution(fourWeeks), [{ name: "Pectoral", count: 2 }, { name: "Sin clasificar", count: 2 }]);
console.log("Evolución: periodos, métricas por serie, ejercicios sin carga y músculos correctos.");

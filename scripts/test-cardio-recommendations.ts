import { cardioByWorkoutDay, cardioRecommendations, resolveCardioByWorkoutDay, type CardioPreference } from "../src/features/planning/cardio";

function assert(description: string, condition: boolean) {
  if (!condition) throw new Error(description);
  console.log(`PASS  ${description}`);
}

const fatLoss = cardioRecommendations("Perder grasa", "Entre 1 y 3 años", "Casa");
assert("Pérdida de grasa propone tres sesiones", fatLoss.length === 3);
assert("Pérdida de grasa no impone intervalos", fatLoss.every((session) => session.intensity !== "Intervalos"));

const muscleGain = cardioRecommendations("Ganar masa muscular", "Entre 1 y 3 años", "Casa");
assert("Ganancia muscular mantiene cardio suave", muscleGain.every((session) => session.intensity === "Suave"));
assert("Ganancia muscular limita las sesiones a 20 minutos", muscleGain.every((session) => session.durationMinutes === 20));

const performance = cardioRecommendations("Mejorar rendimiento", "Entre 1 y 3 años", "Casa");
assert("Rendimiento combina actividad moderada y suave", performance.some((session) => session.intensity === "Moderada") && performance.some((session) => session.intensity === "Suave"));

for (const goal of ["Perder grasa", "Mantener peso", "Recomposición corporal", "Mejorar salud general", "Ganar masa muscular", "Mejorar rendimiento"]) for (const experience of ["Nunca he entrenado", "Menos de 1 año", "Entre 1 y 3 años"]) for (const count of [0, 1, 2, 3, 4, 5, 6, 7]) {
  const suggestions = cardioRecommendations(goal, experience, "Casa");
  const schedule = cardioByWorkoutDay(suggestions, count);
  assert(`${goal}, ${experience}, ${count} días: no se pierden sugerencias asignables`, schedule.filter(Boolean).length === Math.min(count, suggestions.length));
  assert(`${goal}, ${experience}, ${count} días: todas las claves son distintas`, new Set(schedule.filter((item) => item !== null).map((item) => item.key)).size === Math.min(count, suggestions.length));
  assert(`${goal}, ${experience}: no hay intervalos automáticos`, suggestions.every((item) => item.intensity !== "Intervalos"));
}
for (const goal of ["Mantener peso", "Recomposición corporal", "Mejorar salud general"]) for (const place of ["Casa", "Gimnasio"]) {
  const sessions = cardioRecommendations(goal, "Nunca he entrenado", place);
  assert(`${goal}, ${place}: dos bloques moderados de bienestar`, sessions.length === 2 && sessions.every((item) => item.durationMinutes === 25 && item.intensity === "Moderada" && item.modalities[0] === (place === "Gimnasio" ? "Cinta" : "Caminar al aire libre")));
}
for (const experience of ["Nunca he entrenado", "Menos de 1 año", "Entre 1 y 3 años"]) {
  const beginner = experience !== "Entre 1 y 3 años";
  for (const place of ["Casa", "Gimnasio", "Gimnasio completo", "Gimnasio básico", "Mixto", null]) {
    const gym = place === "Gimnasio" || place === "Gimnasio completo" || place === "Gimnasio básico";
    const gain = cardioRecommendations("Ganar masa muscular", experience, place);
    const loss = cardioRecommendations("Perder grasa", experience, place);
    assert(`${experience}, ${place}: dos bloques suaves para ganar masa`, gain.length === 2 && gain.every((item) => item.intensity === "Suave" && item.durationMinutes === (beginner ? 15 : 20)));
    assert(`${experience}, ${place}: ubicación por defecto correcta`, [...gain, ...loss.slice(0, 2)].every((item) => item.modalities[0] === (gym ? "Cinta" : "Caminar al aire libre")));
    assert(`${experience}, ${place}: pérdida de grasa propone dos bloques más largos y otro suave`, loss.length === 3 && loss.slice(0, 2).every((item) => item.intensity === "Moderada" && item.durationMinutes === (beginner ? 20 : 30)) && loss[2].intensity === "Suave" && loss[2].durationMinutes === 20);
    for (const count of [1, 2, 3, 4, 5, 6]) {
      const gainDays = cardioByWorkoutDay(gain, count).filter((item) => item !== null);
      const lossDays = cardioByWorkoutDay(loss, count).filter((item) => item !== null);
      assert(`${experience}, ${place}, ${count} días: cardio de ganancia repartido`, gainDays.length === Math.min(count, 2));
      assert(`${experience}, ${place}, ${count} días: pérdida propone más minutos asignados`, lossDays.reduce((sum, item) => sum + item.durationMinutes, 0) > gainDays.reduce((sum, item) => sum + item.durationMinutes, 0));
      assert(`${experience}, ${place}, ${count} días: opciones adicionales conservadas`, lossDays.length + loss.slice(count).length === loss.length && gainDays.length + gain.slice(count).length === gain.length);
    }
  }
}
const dayIds = ["day-a", "day-b", "day-c"];
const saved: CardioPreference = { session_key: "day-day-a", workout_day_id: "day-b", modality: "Bicicleta", duration_minutes: 35, intensity: "Suave", enabled: true };
const moved = resolveCardioByWorkoutDay(fatLoss, dayIds, [saved]);
assert("Un traslado guardado no reaparece en el día original", moved[0] === null);
assert("El traslado conserva la configuración y su clave", moved[1]?.key === saved.session_key && moved[1]?.durationMinutes === 35 && moved[1]?.modalities[0] === "Bicicleta");
assert("No se crean claves duplicadas", new Set(moved.filter((item) => item !== null).map((item) => item.key)).size === moved.filter(Boolean).length);
const disabled = resolveCardioByWorkoutDay(fatLoss, dayIds, [{ ...saved, workout_day_id: "day-a", enabled: false }]);
assert("La preferencia desactivada se respeta", disabled[0] === null);
const otherVersion = resolveCardioByWorkoutDay(fatLoss, ["new-a", "new-b"], [saved]);
assert("Los días nuevos no reutilizan claves de otra versión", otherVersion[0]?.key === "day-new-a" && otherVersion[1]?.key === "day-new-b");
const legacy = resolveCardioByWorkoutDay(fatLoss, dayIds, [{ ...saved, session_key: "base-1" }]);
assert("Un traslado de configuración antigua no duplica la recomendación", legacy[0] === null && legacy[1]?.key === "base-1");
const movedAcrossVersions = resolveCardioByWorkoutDay(fatLoss, dayIds, [{ ...saved, workout_day_id: "old-version-day" }]);
assert("Una clave de día trasladada a otra versión no se reutiliza", movedAcrossVersions[0] === null);
const legacyAcrossVersions = resolveCardioByWorkoutDay(fatLoss, dayIds, [{ ...saved, session_key: "base-1", workout_day_id: "old-version-day" }]);
assert("Las claves antiguas de otra versión no bloquean la sugerencia nueva", legacyAcrossVersions[0]?.key === "day-day-a");
for (const goal of ["Perder grasa", "Ganar masa muscular"]) for (const place of ["Casa", "Gimnasio"]) {
  const schedule = resolveCardioByWorkoutDay(cardioRecommendations(goal, "Nunca he entrenado", place), dayIds, [{ ...saved, workout_day_id: "day-a" }]);
  assert(`${goal}, ${place}: prevalece la configuración guardada al cambiar el perfil`, schedule[0]?.key === saved.session_key && schedule[0]?.modalities[0] === "Bicicleta" && schedule[0]?.durationMinutes === 35 && schedule[0]?.intensity === "Suave");
  assert(`${goal}, ${place}: cardio desactivado sigue desactivado`, resolveCardioByWorkoutDay(cardioRecommendations(goal, "Nunca he entrenado", place), dayIds, [{ ...saved, workout_day_id: "day-a", enabled: false }])[0] === null);
}
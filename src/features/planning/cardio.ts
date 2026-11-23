export type CardioRecommendation = {
  key: string;
  title: string;
  modalities: string[];
  durationMinutes: number;
  intensity: "Suave" | "Moderada" | "Intervalos";
  effort: string;
};

export type CardioPreference = {
  session_key: string;
  workout_day_id: string | null;
  modality: string;
  duration_minutes: number;
  intensity: string;
  enabled: boolean;
};

export function cardioRecommendations(goal: string, experience: string, trainingPlace: string | null): CardioRecommendation[] {
  const normalizedGoal = goal.toLowerCase();
  const beginner = experience.includes("Nunca") || experience.includes("Menos");
  const gym = normalizeTrainingPlace(trainingPlace) === "Gimnasio";
  const baseModalities = gym
    ? ["Cinta", "Caminar al aire libre", "Elíptica", "Bicicleta"]
    : ["Caminar al aire libre", "Cinta", "Elíptica", "Bicicleta"];

  if (normalizedGoal.includes("perder")) {
    return [
      { key: "base-1", title: "Cardio base", modalities: baseModalities, durationMinutes: beginner ? 20 : 30, intensity: "Moderada", effort: "A un ritmo sostenible al que puedas conversar." },
      { key: "base-2", title: "Cardio base", modalities: [...baseModalities, "Remo"], durationMinutes: beginner ? 20 : 30, intensity: "Moderada", effort: "Ajusta el ritmo a tu capacidad y recuperación." },
      { key: "recuperacion", title: "Movimiento opcional", modalities: ["Caminar al aire libre", "Cinta", "Bicicleta"], durationMinutes: 20, intensity: "Suave", effort: "Paseo o actividad suave en otro momento de la semana." },
    ];
  }

  if (normalizedGoal.includes("rendimiento")) {
    return [
      { key: "aerobico", title: "Base aeróbica", modalities: [...baseModalities, "Remo"], durationMinutes: beginner ? 20 : 30, intensity: "Moderada", effort: "A un ritmo sostenible al que puedas conversar." },
      { key: "aerobico-2", title: "Base aeróbica", modalities: [...baseModalities.filter((item) => item !== "Elíptica"), "Remo"], durationMinutes: beginner ? 20 : 30, intensity: "Moderada", effort: "Ajusta el ritmo a tu capacidad y recuperación." },
      { key: "recuperacion", title: "Recuperación activa", modalities: ["Caminar al aire libre", "Elíptica", "Bicicleta"], durationMinutes: 20, intensity: "Suave", effort: "RPE 3-4: deberías terminar con más energía." },
    ];
  }

  if (normalizedGoal.includes("ganar")) {
    return [
      { key: "salud-1", title: "Cardio de salud", modalities: baseModalities, durationMinutes: beginner ? 15 : 20, intensity: "Suave", effort: "Ritmo cómodo que permita recuperarte." },
      { key: "salud-2", title: "Cardio de salud", modalities: baseModalities, durationMinutes: beginner ? 15 : 20, intensity: "Suave", effort: "Ritmo cómodo y estable." },
    ];
  }

  return [
    { key: "bienestar-1", title: "Movimiento continuo", modalities: baseModalities, durationMinutes: 25, intensity: "Moderada", effort: "RPE 5: cómodo, pero con propósito." },
    { key: "bienestar-2", title: "Movimiento continuo", modalities: baseModalities, durationMinutes: 25, intensity: "Moderada", effort: "RPE 5: mantén una respiración controlada." },
  ];
}

export function cardioByWorkoutDay(recommendations: CardioRecommendation[], workoutDays: number) {
  const schedule = Array<CardioRecommendation | null>(Math.max(0, workoutDays)).fill(null);
  const indexes = Array.from({ length: schedule.length }, (_, index) => index).sort((a, b) => a % 2 - b % 2 || a - b);
  indexes.slice(0, recommendations.length).forEach((dayIndex, recommendationIndex) => { schedule[dayIndex] = recommendations[recommendationIndex]; });
  return schedule;
}

export function resolveCardioByWorkoutDay(recommendations: CardioRecommendation[], dayIds: string[], preferences: CardioPreference[]): Array<CardioRecommendation | null> {
  const schedule = cardioByWorkoutDay(recommendations, dayIds.length);
  return dayIds.map((dayId, index) => {
    const preference = preferences.find((item) => item.workout_day_id === dayId);
    if (preference?.enabled === false) return null;
    const suggestion = schedule[index];
    if (preference) {
      if (preference.intensity !== "Suave" && preference.intensity !== "Moderada" && preference.intensity !== "Intervalos") {
        throw new Error("La intensidad de cardio guardada no es válida.");
      }
      return {
        key: preference.session_key,
        title: suggestion?.title ?? "Cardio adicional",
        modalities: [preference.modality, ...(suggestion?.modalities ?? ["Caminar al aire libre", "Cinta", "Elíptica", "Bicicleta", "Remo"]).filter((item) => item !== preference.modality)],
        durationMinutes: preference.duration_minutes,
        intensity: preference.intensity,
        effort: "Configuración guardada para este día de entrenamiento.",
      };
    }
    if (!suggestion) return null;
    const key = `day-${dayId}`;
    const moved = preferences.some((item) => item.workout_day_id !== dayId &&
      (item.session_key === key || (item.session_key === suggestion.key && item.workout_day_id !== null && dayIds.includes(item.workout_day_id))));
    return moved ? null : { ...suggestion, key };
  });
}
import { normalizeTrainingPlace } from "@/lib/training-place";

import { notFound } from "next/navigation";

import { TrainingDaysPanel } from "@/components/training-days-panel";
import { TrainingManagementCard } from "@/components/training-management-card";
import { cardioRecommendations, resolveCardioByWorkoutDay, type CardioPreference } from "@/features/planning/cardio";

export default function TrainingPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const ids = [
    "00000000-0000-4000-8000-000000000001",
    "00000000-0000-4000-8000-000000000002",
    "00000000-0000-4000-8000-000000000003",
    "00000000-0000-4000-8000-000000000004",
  ];
  const recommendations = cardioRecommendations("Perder grasa", "Entre 1 y 3 años", "Casa");
  const preferences: CardioPreference[] = [
    { session_key: "custom-legacy", workout_day_id: ids[1], modality: "Bicicleta", duration_minutes: 25, intensity: "Suave", enabled: true },
    { session_key: `day-${ids[2]}`, workout_day_id: ids[2], modality: "Cinta", duration_minutes: 15, intensity: "Moderada", enabled: false },
  ];
  const schedule = resolveCardioByWorkoutDay(recommendations, ids, preferences);
  const days = ids.map((id, index) => {
    const cardio = schedule[index];
    return {
      id,
      name: ["Full Body A", "Upper B", "Lower A", "Full Body B"][index],
      exerciseCount: [7, 6, 6, 7][index],
      muscleSummary: ["Pectoral · Dorsal · Cuádriceps", "Pectoral · Tríceps", "Cuádriceps · Glúteos", "Dorsal · Bíceps"][index],
      cardio: cardio ? { ...cardio, modality: cardio.modalities[0] } : undefined,
    };
  });
  const nameFor = (name: string) => name.startsWith("Full Body") ? "Cuerpo completo" : name.startsWith("Upper") ? "Tren superior" : "Tren inferior";
  const variantFor = (name: string) => `Variante ${name.slice(-1)}`;
  const shortIds = ["00000000-0000-4000-8000-000000000005", "00000000-0000-4000-8000-000000000006"];
  const shortSchedule = resolveCardioByWorkoutDay(recommendations, shortIds, []);
  const shortDays = days.slice(0, 2).map((day, index) => {
    const cardio = shortSchedule[index];
    return { ...day, id: shortIds[index], cardio: cardio ? { ...cardio, modality: cardio.modalities[0] } : undefined };
  });
  const gymIds = ["00000000-0000-4000-8000-000000000007", "00000000-0000-4000-8000-000000000008", "00000000-0000-4000-8000-000000000009"];
  const gymRecommendations = cardioRecommendations("Ganar masa muscular", "Nunca he entrenado", "Gimnasio");
  const gymSchedule = resolveCardioByWorkoutDay(gymRecommendations, gymIds, []);
  const gymDays = days.slice(0, 3).map((day, index) => {
    const cardio = gymSchedule[index];
    return { ...day, id: gymIds[index], cardio: cardio ? { ...cardio, modality: cardio.modalities[0] } : undefined };
  });

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-4 py-8 text-[#18231f] sm:px-8">
      <div className="mx-auto max-w-4xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#72873f]">Vista de desarrollo</p>
        <h1 className="mt-2 text-3xl font-semibold">Entrenamiento de ejemplo</h1>
        <p className="mb-6 mt-2 text-sm text-[#68736b]">Datos ficticios: los cambios de cardio se simulan y no se guardan.</p>
        <div className="mb-6"><TrainingManagementCard /></div>
        <TrainingDaysPanel days={days} scheduledId={ids[1]} scheduledIndex={1} completedToday={false} nameFor={nameFor} variantFor={variantFor} cardioPreferences={preferences} additionalSuggestions={[]} defaultCardio={recommendations[0]} preview />
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Ejemplo con dos días</h2>
          <TrainingDaysPanel days={shortDays} scheduledId={shortIds[0]} scheduledIndex={0} completedToday nameFor={nameFor} variantFor={variantFor} cardioPreferences={[]} additionalSuggestions={recommendations.slice(2)} defaultCardio={recommendations[0]} preview />
        </div>
        <div className="mt-8">
          <h2 className="mb-1 text-lg font-semibold">Ejemplo: ganar masa en gimnasio</h2>
          <p className="mb-3 text-sm text-[#68736b]">Perfil ficticio principiante, con tres días de fuerza.</p>
          <TrainingDaysPanel days={gymDays} scheduledId={gymIds[0]} scheduledIndex={0} completedToday={false} nameFor={nameFor} variantFor={variantFor} cardioPreferences={[]} additionalSuggestions={[]} defaultCardio={gymRecommendations[0]} preview />
        </div>
      </div>
    </main>
  );
}

import { notFound } from "next/navigation";

import { getExerciseMedia } from "@/lib/local-exercise-media";
import { WorkoutStartPreview } from "./preview";

export default function WorkoutStartPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const exercises = [
    { name: "Sentadilla a banco", prescription: "3 series · 8–12 repeticiones", restSeconds: 90 },
    { name: "Press banca", prescription: "3 series · 8–12 repeticiones", restSeconds: 90 },
    { name: "Remo con mancuerna", prescription: "3 series · 10 repeticiones", restSeconds: 90 },
    { name: "Peso muerto rumano", prescription: "3 series · 10 repeticiones", restSeconds: 90 },
    { name: "Elevaciones laterales", prescription: "2 series · 12 repeticiones", restSeconds: 60 },
    { name: "Plancha", prescription: "2 series · 30 segundos", restSeconds: 60 },
  ].map((exercise) => ({ ...exercise, media: getExerciseMedia(exercise.name), illustration: true }));

  return <WorkoutStartPreview exercises={exercises} />;
}

import { notFound } from "next/navigation";

import { getExerciseMedia } from "@/lib/local-exercise-media";
import { getExerciseIllustration } from "@/lib/illustration-media";
import { WorkoutDemo } from "./preview";

export default function WorkoutDemoPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const exercises = [
    { id: "sentadilla-ejemplo", name: "Sentadilla a banco", sets: 2, repetitions: "8-12", restSeconds: 90 },
    { id: "press-ejemplo", name: "Press banca", sets: 2, repetitions: "8-12", restSeconds: 90 },
    { id: "plancha-ejemplo", name: "Plancha", sets: 1, repetitions: "30 segundos", restSeconds: 60 },
  ].map((exercise) => ({ ...exercise, media: getExerciseMedia(exercise.name), illustration: Boolean(getExerciseIllustration(exercise.name)) }));

  return <WorkoutDemo exercises={exercises} />;
}

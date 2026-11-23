import { notFound } from "next/navigation";

import { getExerciseMedia } from "@/lib/local-exercise-media";
import { SessionPreview } from "./preview";

export default function SessionPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return <SessionPreview squatMedia={getExerciseMedia("Sentadilla")} plankMedia={getExerciseMedia("Plancha")} />;
}

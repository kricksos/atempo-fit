import catalog from "../../data/illustration-library/catalog.json";
import trialMapping from "../../data/illustration-library/trial-mapping.json";
import scales from "../../data/illustration-library/preview-scales.json";
import type { CatalogExercise } from "@/components/exercise-catalog-selector";

type Trial = { id: string; note: string };
const trials: Record<string, Trial> = trialMapping;
const illustrations = new Map(catalog.exercises.map((exercise) => [exercise.id, exercise]));
const trialIds = new Set(Object.values(trials).map((trial) => trial.id));
const previewScales: Record<string, number> = scales;

export function getIllustrationTrials(exercises: CatalogExercise[]): CatalogExercise[] {
  return exercises.map((exercise) => {
    const trial = trials[exercise.name];
    if (!trial || exercise.image) return exercise;
    const illustration = illustrations.get(trial.id);
    if (!illustration || !trial.note) throw new Error(`Ilustración de prueba no válida: ${exercise.name}`);
    const first = illustration.frames.includes("hold") ? "hold" : "start";
    if (!illustration.frames.includes(first)) throw new Error(`Falta la imagen de prueba inicial: ${trial.id}`);
    const framePath = (frame: string) => `/preview-ilustraciones-image/${trial.id}/${frame}.webp`;
    return {
      ...exercise,
      image: framePath(first),
      imageEnd: illustration.frames.includes("end") ? framePath("end") : null,
      imageBackground: "dark",
      imageScale: previewScales[trial.id],
      lazyFrames: true,
      illustration: true,
      trialNote: trial.note,
    };
  });
}

export function hasIllustrationTrialFrame(id: string, frame: string) {
  return trialIds.has(id) && Boolean(illustrations.get(id)?.frames.includes(frame));
}

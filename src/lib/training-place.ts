export const trainingPlaces = [
  { value: "Casa", description: "Entrenas en casa. Después podrás indicar el material básico que tienes." },
  { value: "Gimnasio", description: "Entrenas en un gimnasio equipado. Se asumirán disponibles las máquinas, poleas y demás material del catálogo." },
] as const;

export type TrainingPlace = (typeof trainingPlaces)[number]["value"] | "Mixto";

export function normalizeTrainingPlace(value: unknown): TrainingPlace | null {
  if (value === "Gimnasio completo" || value === "Gimnasio básico") return "Gimnasio";
  if (value === "Mixto") return "Mixto";
  return trainingPlaces.find((place) => place.value === value)?.value ?? null;
}

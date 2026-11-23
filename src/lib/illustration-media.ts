import catalog from "../../data/illustration-library/catalog.json";
import candidates from "../../data/illustration-library/candidate-mapping.json";
import catalogAliases from "../../data/illustration-library/catalog-aliases.json";
import releaseNames from "../../data/illustration-library/release-names.json";
import scales from "../../data/illustration-library/preview-scales.json";
import generatedIllustrations from "../../data/generated-illustrations/released.json";

export const illustrationSamples: Record<string, { start: string; end: string; scale: number }> = {
  "bench-press": { start: "/exercises/illustration-samples/bench-press-blend.webp", end: "/exercises/illustration-samples/bench-press-end-blend.webp", scale: 2.15 },
  "overhead-press": { start: "/exercises/illustration-samples/overhead-press-blend.webp", end: "/exercises/illustration-samples/overhead-press-end-blend.webp", scale: 1.05 },
  squat: { start: "/exercises/illustration-samples/squat-blend.webp", end: "/exercises/illustration-samples/squat-end-blend.webp", scale: 1.45 },
};

const released = new Set(releaseNames);
const assignments: Record<string, string> = candidates.assignments;
const previewScales: Record<string, number> = scales;
const illustrations = new Map(catalog.exercises.map((exercise) => [exercise.id, exercise]));
const namesByAlias = new Map(Object.entries(catalogAliases).map(([name, alias]) => [alias, name]));
const generated: Record<string, { id: string; scale: number }> = generatedIllustrations;

export function getExerciseDisplayName(name: string) {
  return namesByAlias.get(name) ?? name;
}

export function getExerciseIllustration(name: string) {
  name = getExerciseDisplayName(name);
  const custom = Object.hasOwn(generated, name) ? generated[name] : undefined;
  if (custom) {
    return {
      start: `/exercises/generated-illustrations/${custom.id}/start.webp`,
      end: `/exercises/generated-illustrations/${custom.id}/end.webp`,
      scale: custom.scale,
    };
  }
  if (!released.has(name)) return null;
  const id = assignments[name];
  const illustration = illustrations.get(id);
  const scale = previewScales[id];
  if (!illustration || !Number.isFinite(scale)) throw new Error(`Ilustración no preparada: ${name}`);
  const sample = Object.hasOwn(illustrationSamples, id) ? illustrationSamples[id] : undefined;
  if (sample) return sample;
  const first = illustration.frames.includes("hold") ? "hold" : "start";
  if (!illustration.frames.includes(first)) throw new Error(`Falta la imagen inicial: ${id}`);
  return {
    start: `/exercises/illustrations/${id}/${first}.webp`,
    end: illustration.frames.includes("end") ? `/exercises/illustrations/${id}/end.webp` : null,
    scale,
  };
}

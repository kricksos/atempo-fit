import catalog from "../../data/illustration-library/catalog.json";
import candidates from "../../data/illustration-library/candidate-mapping.json";
import previewScales from "../../data/illustration-library/preview-scales.json";
import type { CatalogExercise } from "@/components/exercise-catalog-selector";
import { getExerciseIllustration } from "@/lib/illustration-media";
import { getExerciseMedia } from "@/lib/local-exercise-media";

const muscles: Record<string, string> = {
  adductors: "adductors", back: "lats", biceps: "biceps", calves: "calves", chest: "pectorals",
  core: "core", forearms: "forearms", glutes: "glutes", hamstrings: "hamstrings", lats: "lats",
  lower_back: "lower_back", obliques: "core", quads: "quadriceps", shoulders: "deltoids",
  tibialis: "tibialis", traps: "traps", triceps: "triceps",
};

const equipment: Record<string, string> = {
  anchor: "Anclaje", backpack: "Mochila resistente con carga", band: "Banda elástica", barbell: "Barra", bench: "Banco", cable: "Polea", "decline-bench": "Banco declinado",
  dumbbell: "Mancuernas", "ez-bar": "Barra Z", "incline-bench": "Banco inclinado", kettlebell: "Pesa rusa", machine: "Máquina",
  "parallel-bars": "Barras paralelas", post: "Soporte", "preacher-bench": "Banco predicador",
  "pull-up-bar": "Barra de dominadas", "roman-chair": "Banco de hiperextensiones",
  "smith-machine": "Máquina Smith", "squat-rack": "Soporte para barra", step: "Escalón", wall: "Pared",
};

const additionalIllustrationEquipment: Record<string, string[]> = {
  "kettlebell-row": ["bench"],
  "single-leg-calf-raise": ["dumbbell"],
};
const illustrationDifficulty: Record<string, string> = {
  "cossack-squat": "intermediate",
  "diamond-push-up": "intermediate",
  "dumbbell-pullover": "intermediate",
  "glute-bridge-march": "intermediate",
  "plank-shoulder-tap": "intermediate",
  "renegade-row": "intermediate",
  "single-leg-calf-raise": "intermediate",
};

function translate(values: string[], labels: Record<string, string>, category: string) {
  return values.map((value) => {
    const label = labels[value];
    if (!label) throw new Error(`Unknown illustration ${category}: ${value}`);
    return label;
  });
}

export function getIllustrationPreviewCatalog(): CatalogExercise[] {
  const illustrations = new Map(catalog.exercises.map((exercise) => [exercise.id, exercise]));
  const scales: Record<string, number> = previewScales;
  return Object.entries(candidates.assignments).map(([name, illustrationId]): CatalogExercise => {
    const illustration = illustrations.get(illustrationId);
    if (!illustration) throw new Error(`Unknown illustration: ${illustrationId}`);
    const groups = [...new Set(translate([
      ...illustration.muscles.primary,
      ...(illustration.muscles.secondary ?? []),
      ...(illustration.muscles.alsoTargets ?? []),
    ], muscles, "muscle"))];
    if (!Object.hasOwn(scales, illustrationId)) throw new Error(`Missing preview scale: ${illustrationId}`);
    const first = illustration.frames.includes("hold") ? "hold" : "start";
    if (!illustration.frames.includes(first)) throw new Error(`Missing first frame: ${illustrationId}`);
    const illustrationMedia = getExerciseIllustration(name);
    const media = getExerciseMedia(name);
    return {
      id: name,
      name,
      primaryMuscle: groups[0] ?? null,
      muscleGroups: groups,
      equipment: translate([...new Set([...illustration.equipment, ...(additionalIllustrationEquipment[illustrationId] ?? [])])], equipment, "equipment"),
      difficulty: illustrationDifficulty[illustrationId] ?? illustration.level,
      image: media?.[0] ?? null,
      imageEnd: media && media[0] !== media[1] ? media[1] : null,
      imageBackground: illustrationMedia ? "dark" : undefined,
      imageScale: illustrationMedia?.scale,
      lazyFrames: true,
      illustration: Boolean(illustrationMedia),
    };
  }).sort((a, b) => a.name.localeCompare(b.name, "es"));
}

export function hasIllustrationPreviewFrame(id: string, frame: string) {
  if (!Object.values(candidates.assignments).includes(id)) return false;
  return catalog.exercises.some((exercise) => exercise.id === id && exercise.frames.includes(frame));
}

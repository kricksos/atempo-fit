export const specificMachineOptions = [
  { value: "hip_abduction_machine", label: "Máquina de abductores" },
  { value: "hip_adduction_machine", label: "Máquina de aductores" },
  { value: "ab_crunch_machine", label: "Máquina de abdominales" },
  { value: "biceps_curl_machine", label: "Máquina de curl de bíceps" },
  { value: "leg_curl_lying_machine", label: "Máquina de curl femoral tumbado" },
  { value: "leg_curl_standing_machine", label: "Máquina de curl femoral de pie" },
  { value: "leg_curl_seated_machine", label: "Máquina de curl femoral sentado" },
  { value: "calf_raise_standing_machine", label: "Máquina de gemelos de pie" },
  { value: "calf_raise_seated_machine", label: "Máquina de gemelos sentado" },
  { value: "leg_extension_machine", label: "Máquina de extensión de cuádriceps" },
  { value: "triceps_extension_machine", label: "Máquina de extensión de tríceps" },
  { value: "leg_press_machine", label: "Prensa de piernas" },
  { value: "chest_press_machine", label: "Máquina de press de pecho" },
  { value: "hack_squat_machine", label: "Máquina de sentadilla hack" },
  { value: "reverse_hyperextension_machine", label: "Máquina de hiperextensión inversa" },
] as const;

export const equipmentOptions = [
  { value: "dumbbell", label: "Mancuernas" },
  { value: "kettlebell", label: "Pesa rusa" },
  { value: "resistance_band", label: "Bandas elásticas" },
  { value: "backpack", label: "Mochila resistente con carga" },
  { value: "barbell", label: "Barra recta y barra Z, ambas con discos" },
  { value: "straight_bar", label: "Barra recta y discos" },
  { value: "ez_bar", label: "Barra Z y discos" },
  { value: "bench", label: "Banco plano" },
  { value: "incline_bench", label: "Banco inclinable" },
  { value: "decline_bench", label: "Banco declinado" },
  { value: "rack", label: "Soporte o rack para barra" },
  { value: "pull_up_bar", label: "Barra de dominadas" },
  { value: "parallel_bars", label: "Barras paralelas" },
  { value: "step", label: "Cajón o escalón" },
  { value: "anchor", label: "Anclaje para ejercicios" },
  { value: "machine", label: "Todas las máquinas de musculación del catálogo" },
  { value: "cable_machine", label: "Poleas" },
  { value: "smith_machine", label: "Máquina Smith" },
  { value: "preacher_bench", label: "Banco Scott" },
  { value: "hyperextension_bench", label: "Banco de hiperextensiones" },
  ...specificMachineOptions,
] as const;

export type ExerciseEquipment = (typeof equipmentOptions)[number]["value"];
const equipmentValues = new Set<string>(equipmentOptions.map(({ value }) => value));

const homeEquipmentValues: readonly ExerciseEquipment[] = [
  "dumbbell", "kettlebell", "resistance_band", "backpack", "straight_bar", "ez_bar",
  "bench", "incline_bench", "rack", "pull_up_bar", "step",
];

export const homeEquipmentOptions = equipmentOptions.filter((option) => homeEquipmentValues.includes(option.value));

export function gymEquipmentPreset(): ExerciseEquipment[] {
  return [
    "dumbbell", "kettlebell", "resistance_band", "barbell", "bench", "incline_bench",
    "decline_bench", "rack", "pull_up_bar", "parallel_bars", "step", "anchor", "machine",
    "cable_machine", "smith_machine", "preacher_bench", "hyperextension_bench",
  ];
}

export function homeEquipmentLabelsFromValues(values: ExerciseEquipment[]): string[] {
  const available = new Set(values);
  if (available.has("barbell")) {
    available.add("straight_bar");
    available.add("ez_bar");
  }
  return homeEquipmentOptions.filter((option) => available.has(option.value)).map((option) => option.label);
}

export function isExerciseEquipment(value: string): value is ExerciseEquipment {
  return equipmentValues.has(value);
}

export function equipmentFromLabels(labels: string[]): ExerciseEquipment[] {
  return labels.map((label) => {
    if (label === "Barra y discos, incluida barra Z") return "barbell";
    const option = equipmentOptions.find((item) => item.label === label);
    if (!option) throw new Error(`Material desconocido: ${label}`);
    return option.value;
  });
}

export function equipmentFromOnboardingAnswer(answer: unknown): ExerciseEquipment[] | null {
  if (answer === null || answer === undefined) return null;
  if (!Array.isArray(answer) || answer.length === 0 || !answer.every((item): item is string => typeof item === "string")) {
    throw new Error("Selecciona el material disponible o «Sin material».");
  }
  if (answer.includes("Sin material")) {
    if (answer.length !== 1) throw new Error("«Sin material» no se puede combinar con otros materiales.");
    return [];
  }
  return equipmentFromLabels(answer);
}

export function equipmentForOnboarding(place: TrainingPlace, answer: unknown): ExerciseEquipment[] | null {
  if (place === "Gimnasio") return gymEquipmentPreset();
  const equipment = equipmentFromOnboardingAnswer(answer);
  if (place === "Casa" && equipment === null) {
    throw new Error("Indica el material que tienes en casa o selecciona «Sin material».");
  }
  return equipment;
}

export function equipmentLabelsFromValues(values: ExerciseEquipment[]): string[] {
  return values.map((value) => equipmentOptions.find((item) => item.value === value)!.label);
}

const equipmentAliases: Record<string, ExerciseEquipment | "free"> = {
  "": "free", "none_(bodyweight_exercise)": "free", wall: "free",
  gym_mat: "free", "mat": "free", post: "anchor",
  dumbbell: "dumbbell", kettlebell: "kettlebell", band: "resistance_band", resistance_band: "resistance_band", backpack: "backpack",
  barbell: "straight_bar", straight_bar: "straight_bar", "ez-bar": "ez_bar", ez_bar: "ez_bar",
  bench: "bench", "incline-bench": "incline_bench", incline_bench: "incline_bench",
  "decline-bench": "decline_bench", decline_bench: "decline_bench",
  rack: "rack", "squat-rack": "rack",
  "pull-up-bar": "pull_up_bar", "pull-up_bar": "pull_up_bar", pull_up_bar: "pull_up_bar",
  "parallel-bars": "parallel_bars", parallel_bars: "parallel_bars",
  step: "step", anchor: "anchor", machine: "machine", cable: "cable_machine",
  cable_machine: "cable_machine", "smith-machine": "smith_machine", smith_machine: "smith_machine",
  "preacher-bench": "preacher_bench", preacher_bench: "preacher_bench",
  "roman-chair": "hyperextension_bench", hyperextension_bench: "hyperextension_bench",
};

const machineByIllustration: Record<string, (typeof specificMachineOptions)[number]["value"]> = {
  "hip-abduction-machine": "hip_abduction_machine",
  "hip-adduction-machine": "hip_adduction_machine",
  "machine-abdominal-crunch": "ab_crunch_machine",
  "machine-preacher-curl": "biceps_curl_machine",
  "leg-curl": "leg_curl_lying_machine",
  "standing-leg-curl-machine": "leg_curl_standing_machine",
  "seated-leg-curl": "leg_curl_seated_machine",
  "standing-calf-raise-machine": "calf_raise_standing_machine",
  "seated-calf-raise-machine": "calf_raise_seated_machine",
  "leg-extension": "leg_extension_machine",
  "machine-triceps-extension": "triceps_extension_machine",
  "leg-press-calf-raise": "leg_press_machine",
  "leg-press": "leg_press_machine",
  "chest-press-machine": "chest_press_machine",
  "hack-squat": "hack_squat_machine",
};

const machineByName: Record<string, (typeof specificMachineOptions)[number]["value"]> = {
  "Hiperextensión inversa": "reverse_hyperextension_machine",
};

const additionalEquipment: Record<string, ExerciseEquipment[]> = {
  "Aperturas posteriores con mancuernas": ["incline_bench"],
  "Curl predicador en polea": ["preacher_bench"],
  "Elevación posterior tumbado con mancuernas": ["incline_bench"],
  "Press banca": ["rack"],
  "Press banca con barra": ["rack"],
  "Press inclinado": ["rack"],
  "Sentadilla con barra": ["rack"],
  "Sentadilla frontal con barra": ["rack"],
  "Subida al cajón con barra": ["step"],
  "Remo elevado en polea": ["step"],
};

export function requiredEquipment(database: unknown, illustration: string[] | null, context?: { illustrationId?: string; name: string }): ExerciseEquipment[] | null {
  if (!Array.isArray(database) || database.some((item) => typeof item !== "string")) return null;
  if (database.length === 0 && illustration === null) return null;
  const required = new Set<ExerciseEquipment>();
  const specificMachine = (context?.illustrationId && machineByIllustration[context.illustrationId]) || (context && machineByName[context.name]);
  for (const item of [...database, ...(illustration ?? [])]) {
    const normalized = equipmentAliases[item];
    if (!normalized) return null;
    if (normalized === "machine" && context?.illustrationId === "back-extensions") continue;
    if (normalized === "machine" && specificMachine) required.add(specificMachine);
    else if (normalized !== "free") required.add(normalized);
  }
  for (const item of (context && additionalEquipment[context.name]) || []) required.add(item);
  if (illustration?.includes("ez-bar") && !illustration.includes("barbell")) required.delete("straight_bar");
  if (context?.name === "Elevaciones frontales" && illustration?.includes("dumbbell")) required.delete("straight_bar");
  return [...required];
}

export function hasRequiredEquipment(required: ExerciseEquipment[], available: ExerciseEquipment[]) {
  return required.every((item) => available.includes(item) ||
    (available.includes("barbell") && (item === "straight_bar" || item === "ez_bar")) ||
    (available.includes("machine") && specificMachineOptions.some((option) => option.value === item)) ||
    (item === "bench" && available.includes("incline_bench")));
}
import type { TrainingPlace } from "@/lib/training-place";

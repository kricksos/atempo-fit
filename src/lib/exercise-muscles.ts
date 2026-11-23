const primaryMuscleMap: Record<string, string> = {
  chest: "pectorals", pectorals: "pectorals", shoulders: "deltoids", deltoids: "deltoids", lats: "lats", "middle back": "lats", back: "lats", biceps: "biceps", triceps: "triceps", quadriceps: "quadriceps", quads: "quadriceps", hamstrings: "hamstrings", glutes: "glutes", calves: "calves", adductors: "adductors", abdominals: "core", abs: "core", core: "core", "lower back": "lower_back", forearms: "forearms",
};

export const muscleGroups = [
  { value: "pectorals", label: "Pectoral" },
  { value: "lats", label: "Dorsal" },
  { value: "deltoids", label: "Deltoides" },
  { value: "biceps", label: "Bíceps" },
  { value: "triceps", label: "Tríceps" },
  { value: "quadriceps", label: "Cuádriceps" },
  { value: "hamstrings", label: "Isquiotibiales" },
  { value: "glutes", label: "Glúteos" },
  { value: "adductors", label: "Aductores" },
  { value: "calves", label: "Gemelos" },
  { value: "lower_back", label: "Zona lumbar" },
  { value: "core", label: "Core" },
] as const;

export const muscleLabels: Record<string, string> = {
  pecho: "Pecho", espalda: "Dorsal", hombros: "Deltoides", biceps: "Bíceps",
  triceps: "Tríceps", piernas: "Piernas", isquios: "Isquios", gluteos: "Glúteos",
  aductores: "Aductores", gemelos: "Gemelos", core: "Core", forearms: "Antebrazos",
  traps: "Trapecios", lower_back: "Zona lumbar", tibialis: "Tibial",
  ...Object.fromEntries(muscleGroups.map((group) => [group.value, group.label])),
};

export function muscleGroupLabels(groups: string[]) {
  return [...new Set(groups.map((group) => muscleLabels[group.toLowerCase()] ?? group))];
}

export function normalizeMuscle(value: string) {
  return primaryMuscleMap[value.toLowerCase()] ?? value.toLowerCase().replaceAll(" ", "_");
}

export function normalizeSummaryMuscle(value: string) {
  const aliases: Record<string, string> = {
    pecho: "pectorals", espalda: "lats", hombros: "deltoids", isquios: "hamstrings",
    gluteos: "glutes", aductores: "adductors", gemelos: "calves", antebrazos: "forearms",
  };
  const normalized = normalizeMuscle(value.trim());
  return aliases[normalized] ?? normalized;
}

export function exercisePrimaryMuscle(name: string, value: string | null) {
  if (name === "Prensa de piernas") return "quadriceps";
  return value ? normalizeMuscle(value) : null;
}

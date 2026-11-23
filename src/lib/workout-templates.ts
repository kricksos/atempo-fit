import { isPlanningExerciseCompatible } from "@/features/planning/workout-compatibility";
import { mainMovement, type MainMovement } from "@/features/planning/movement-patterns";
import { estimateStrengthSeconds } from "@/features/planning/strength-estimate";
import type { PlanningCatalogExercise } from "@/lib/exercise-catalog";
import { muscleGroupLabels, normalizeSummaryMuscle } from "@/lib/exercise-muscles";
import { gymEquipmentPreset, isExerciseEquipment, type ExerciseEquipment } from "@/lib/exercise-equipment";
import { injuryLabelsFromRestrictions } from "@/lib/injuries";
import { researchWorkoutTemplates } from "@/lib/research-workout-templates";
import { normalizeTrainingPlace } from "@/lib/training-place";
import { advancedTrainingReadiness, experienceOptions } from "@/lib/training-experience";

export type TemplateExercise = {
  name: string;
  alternatives?: string[];
  optional?: boolean;
  sets: number;
  repetitions: string;
  restSeconds: number;
};
export type TemplateDay = { name: string; exercises: TemplateExercise[]; requiredMovements: MainMovement[]; namedMuscles?: string[] };
export type WorkoutTemplate = {
  id: string;
  name: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  place: "Casa" | "Gimnasio";
  variant: "base" | "study";
  minutes: number;
  estimatedExtraMinutes?: number;
  equipment: string;
  days: TemplateDay[];
  automaticEligible?: boolean;
  evidence?: {
    attribution: string;
    url: string;
    licenseUrl: string;
    differences: string[];
    guidance: string[];
  };
};

function slot(names: string[], sets: number, optional = false, timed = false): TemplateExercise {
  return { name: names[0], alternatives: names.slice(1), optional, sets, repetitions: timed ? "20-30 segundos" : "8-12", restSeconds: 90 };
}

function sessions(place: WorkoutTemplate["place"], level: WorkoutTemplate["level"]) {
  const gym = place === "Gimnasio";
  const sets = level === "beginner" ? 2 : 3;
  const knee = gym
    ? ["Prensa de piernas", "Sentadilla goblet con mancuerna", "Sentadilla con mancuernas"]
    : ["Sentadilla goblet con mancuerna", "Sentadilla con mancuernas", "Sentadilla con banda elástica", "Sentadilla con peso corporal"];
  const kneeB = gym
    ? ["Sentadilla goblet con mancuerna", "Prensa de piernas", "Sentadilla con mancuernas"]
    : ["Sentadilla con mancuernas", "Sentadilla goblet con mancuerna", "Sentadilla con banda elástica", "Sentadilla con peso corporal"];
  const hip = level === "intermediate"
    ? ["Peso muerto rumano", "Peso muerto con piernas rígidas y mancuernas", "Peso muerto rumano con pesa rusa", "Bisagra de cadera con mancuernas hasta las rodillas", "Puente de glúteos con peso corporal"]
    : ["Peso muerto rumano con pesa rusa", "Bisagra de cadera con mancuernas hasta las rodillas", "Puente de glúteos con peso corporal"];
  const push = gym
    ? ["Press banca en máquina", "Press de pecho en polea", "Flexiones de pecho", "Flexiones con rodillas apoyadas", "Flexiones en pared"]
    : ["Flexiones de pecho", "Flexiones con rodillas apoyadas", "Flexiones en pared"];
  const pull = gym
    ? ["Remo sentado en polea", "Remo con mancuerna", "Remo sentado con banda elástica"]
    : ["Remo con mancuerna", "Remo inclinado con mochila", "Remo sentado con banda elástica"];
  const pullB = gym
    ? ["Jalon al pecho", "Jalón al pecho con agarre cerrado"]
    : ["Remo inclinado con mochila", "Remo con mancuerna", "Remo sentado con banda elástica"];
  const biceps = gym
    ? ["Curl de bíceps en máquina", "Curl de bíceps con mancuernas", "Curl de bíceps con banda elástica"]
    : ["Curl de bíceps con mancuernas", "Curl de bíceps con mochila", "Curl de bíceps con banda elástica"];
  const triceps = gym
    ? ["Extensión de tríceps en polea", "Extensión de tríceps con mancuerna", "Extensión de tríceps en máquina"]
    : ["Extensión de tríceps con mancuerna", "Patada de tríceps con mancuerna"];
  const shoulders = gym
    ? ["Press de hombros en polea", "Press de hombros con banda elástica", "Press de hombros con mancuernas"]
    : ["Press de hombros con banda elástica", "Press de hombros con mancuernas"];
  const calves = gym
    ? ["Elevación de gemelos de pie en máquina", "Elevación de gemelos sentado en máquina", "Elevación de gemelos en escalón"]
    : ["Elevación de gemelos en escalón"];
  const core = ["Plancha abdominal", "Plancha"];
  const glutes = ["Puente de glúteos con peso corporal", "Puente de glúteos a una pierna"];
  const kneeSlot = () => slot(knee, sets);
  const hipSlot = () => slot(hip, sets);
  const pushSlot = () => slot(push, sets);
  const pullSlot = () => slot(pull, sets);
  const shoulderSlot = () => slot(shoulders, sets);
  const bicepsSlot = () => slot(biceps, 2, true);
  const tricepsSlot = () => slot(triceps, 2, true);
  const coreSlot = () => slot(core, 2, true, true);
  const calvesSlot = () => slot(calves, 2, true);
  const glutesSlot = () => slot(glutes, 2, true);
  const full = (name: string, squat: string[], row: string[], accessory: TemplateExercise): TemplateDay => ({
    name,
    requiredMovements: ["knee", "hip", "push", "pull"],
    exercises: [slot(squat, sets), hipSlot(), pushSlot(), slot(row, sets), accessory, coreSlot()],
  });
  const fullA = full("Cuerpo completo A", knee, pull, bicepsSlot());
  const fullB = full("Cuerpo completo B", kneeB, pullB, tricepsSlot());
  const fullC = full("Cuerpo completo C", knee, pullB, calvesSlot());
  const chest: TemplateDay = {
    name: "Pecho y tríceps", requiredMovements: ["push"], namedMuscles: ["pectorals", "triceps"],
    exercises: [pushSlot(), slot(gym ? ["Press de pecho en polea", "Press banca en máquina"] : ["Flexiones con rodillas apoyadas", "Flexiones en pared"], 2, true), tricepsSlot(), coreSlot()],
  };
  const legsA: TemplateDay = {
    name: "Piernas y glúteos A", requiredMovements: ["knee", "hip"], namedMuscles: ["quadriceps", "glutes"],
    exercises: [kneeSlot(), hipSlot(), slot(["Zancadas con mancuernas", "Zancada atrás sin carga"], 2, true), glutesSlot(), calvesSlot()],
  };
  const legsB: TemplateDay = {
    name: "Piernas y glúteos B", requiredMovements: ["knee", "hip"], namedMuscles: ["quadriceps", "glutes"],
    exercises: [hipSlot(), slot(kneeB, sets), slot(["Zancadas con mancuernas", "Zancada atrás sin carga"], 2, true), calvesSlot(), glutesSlot()],
  };
  const back: TemplateDay = {
    name: "Espalda y bíceps", requiredMovements: ["pull"], namedMuscles: ["lats", "biceps"],
    exercises: [pullSlot(), slot(pullB, 2, true), bicepsSlot(), coreSlot()],
  };
  const shoulder: TemplateDay = {
    name: "Hombros y core", requiredMovements: [], namedMuscles: ["deltoids", "core"],
    exercises: [shoulderSlot(), slot(["Elevaciones laterales con mancuernas", "Elevaciones laterales con banda elástica"], 2, true), slot(["Face pull en polea", "Aperturas de banda para espalda alta"], 2, true), coreSlot()],
  };
  const upper: TemplateDay = {
    name: "Torso y brazos", requiredMovements: ["push", "pull"], namedMuscles: ["pectorals", "lats", "biceps", "triceps"],
    exercises: [slot(pullB, sets), pushSlot(), bicepsSlot(), tricepsSlot()],
  };
  const kneeFocused: TemplateDay = {
    name: "Piernas · dominante de rodilla", requiredMovements: ["knee"],
    exercises: [kneeSlot(), slot(["Zancadas con mancuernas", "Zancada atrás sin carga"], 2, true), calvesSlot()],
  };
  const hipFocused: TemplateDay = {
    name: "Piernas · dominante de cadera", requiredMovements: ["hip"],
    exercises: [hipSlot(), glutesSlot()],
  };
  return { fullA, fullB, fullC, chest, legsA, legsB, back, shoulder, upper, kneeFocused, hipFocused };
}

export function workoutReplacementSessions(place: WorkoutTemplate["place"], level: WorkoutTemplate["level"]): TemplateDay[] {
  const s = sessions(place, level);
  return [s.chest, s.legsA, s.back, s.shoulder, s.legsB, s.upper, s.kneeFocused, s.hipFocused];
}

const templateDefinitions: WorkoutTemplate[] = [];
for (const place of ["Casa", "Gimnasio"] as const) {
  for (const level of ["beginner", "intermediate"] as const) {
    const s = sessions(place, level);
    const plans = [
      [s.fullA, s.fullB],
      [s.fullA, s.fullB, s.fullC],
      [s.chest, s.legsA, s.back, s.shoulder],
      [s.chest, s.legsA, s.back, s.shoulder, s.legsB],
      [s.chest, s.legsA, s.upper, s.shoulder, s.back, s.legsB],
    ];
    for (const days of plans) {
      const full = days.length <= 3;
      const base: WorkoutTemplate = {
        id: `base-${place === "Casa" ? "casa" : "gimnasio"}-${level}-${days.length}`,
        name: `${full ? "Cuerpo completo" : "División muscular"} · ${days.length} días`,
        description: full
          ? "Movimientos de piernas, cadera, empuje y tirón en cada sesión."
          : "Pecho, piernas, espalda y hombros en sesiones diferenciadas.",
        level, place, variant: "base", minutes: 0,
        equipment: place === "Gimnasio" ? "Máquinas, poleas y peso libre; con alternativas" : "Mancuernas y banco, mochila o bandas; según alternativas",
        days,
      };
      templateDefinitions.push(base);
    }
  }
}

const studyEvidence: NonNullable<WorkoutTemplate["evidence"]> = {
  attribution: "Adaptación del protocolo de Pedersen y colaboradores (2022), publicado en BMC Sports Science, Medicine and Rehabilitation.",
  url: "https://doi.org/10.1186/s13102-022-00481-7",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  differences: [
    "Peso muerto rumano con pesa rusa en lugar de peso muerto con piernas rígidas; puente de glúteos sin carga en lugar de hip thrust.",
    "Press de pecho en máquina en lugar de press de banca con peso libre; curl de bíceps en máquina en lugar de polea.",
    "Los ejercicios de brazos se realizan por separado, no en superserie. Se muestra un rango de 8-12 repeticiones en lugar de las fases progresivas de 12, 10 y 8 del estudio.",
    "Al igual que el protocolo publicado, esta propuesta no incluye trabajo directo específico de hombros, gemelos ni core.",
  ],
  guidance: [
    "El ensayo incluyó a 44 mujeres jóvenes que lo completaron, sin entrenamiento de fuerza reciente y sin lesiones o dolor que afectaran al ejercicio; sus resultados no se pueden generalizar a todas las personas.",
    "Deja al menos 48 horas entre sesiones que trabajen los mismos músculos. El estudio supervisó la técnica y la progresión de cargas.",
    "La adaptación no reproduce las cargas ni la supervisión del ensayo y no ha sido validada clínicamente. Ajusta la carga con ayuda profesional.",
  ],
};

const studySlot = (name: string): TemplateExercise => ({ name, sets: 3, repetitions: "8-12", restSeconds: 60 });
const studyLegs = [
  studySlot("Prensa de piernas"),
  studySlot("Peso muerto rumano con pesa rusa"),
  studySlot("Extensión de cuádriceps en máquina"),
  studySlot("Puente de glúteos con peso corporal"),
];
const studyUpper = [
  studySlot("Jalon al pecho"),
  studySlot("Press banca en máquina"),
  studySlot("Remo sentado en polea"),
  studySlot("Extensión de tríceps en polea"),
  studySlot("Curl de bíceps en máquina"),
];
const studyDay = (name: string, exercises: TemplateExercise[], requiredMovements: MainMovement[], namedMuscles?: string[]): TemplateDay =>
  ({ name, exercises: exercises.map((exercise) => ({ ...exercise })), requiredMovements, namedMuscles });

templateDefinitions.push(
  {
    id: "estudio-pedersen-gimnasio-principiante-2",
    name: "Cuerpo completo · 2 días",
    description: "Adaptación de un protocolo de cuerpo completo estudiado en personas sin experiencia previa en fuerza.",
    level: "beginner", place: "Gimnasio", variant: "study", minutes: 0,
    equipment: "Prensa, máquinas, poleas y pesa rusa",
    evidence: studyEvidence,
    days: [
      studyDay("Cuerpo completo A", [...studyLegs, ...studyUpper], ["knee", "hip", "push", "pull"]),
      studyDay("Cuerpo completo B", [...studyLegs, ...studyUpper], ["knee", "hip", "push", "pull"]),
    ],
  },
  {
    id: "estudio-pedersen-gimnasio-principiante-4",
    name: "Torso y pierna · 4 días",
    description: "Adaptación de un protocolo alterno de pierna y torso estudiado en personas sin experiencia previa en fuerza.",
    level: "beginner", place: "Gimnasio", variant: "study", minutes: 0,
    equipment: "Prensa, máquinas, poleas y pesa rusa",
    evidence: studyEvidence,
    days: [
      studyDay("Pierna A", studyLegs, ["knee", "hip"], ["quadriceps", "hamstrings", "glutes"]),
      studyDay("Torso A", studyUpper, ["push", "pull"], ["lats", "pectorals", "triceps", "biceps"]),
      studyDay("Pierna B", studyLegs, ["knee", "hip"], ["quadriceps", "hamstrings", "glutes"]),
      studyDay("Torso B", studyUpper, ["push", "pull"], ["lats", "pectorals", "triceps", "biceps"]),
    ],
  },
);

templateDefinitions.push(...researchWorkoutTemplates);

export const workoutTemplates = templateDefinitions.map((template) => ({
  ...template,
  minutes: Math.ceil(Math.max(...template.days.map((day) => estimateStrengthSeconds(day.exercises))) / 60) + (template.estimatedExtraMinutes ?? 0),
}));

type TemplateProfile = { experience: unknown; training_continuity?: unknown; training_technique?: unknown; training_place: unknown; training_equipment: unknown; restrictions: unknown; days_per_week?: unknown; session_duration_minutes?: unknown };
type TemplateCard = { id: string; name: string; available?: boolean };
export type TemplateReview = {
  template: WorkoutTemplate;
  issues: string[];
  warnings: string[];
  resolvedDays: Array<{ name: string; exercises: Array<{ exerciseId: string; sets: number; repetitions: string; restSeconds: number }> }>;
};

export function reviewWorkoutTemplate(template: WorkoutTemplate, profile: TemplateProfile | null, catalog: PlanningCatalogExercise[], cards: TemplateCard[]): TemplateReview {
  const issues: string[] = [];
  const warnings: string[] = [];
  if ((!profile || !experienceOptions.some((option) => option === profile.experience)) && template.level !== "advanced") {
    issues.push("Completa tu experiencia en el perfil antes de utilizar esta rutina.");
  }
  const beginner = typeof profile?.experience === "string" && (profile.experience.includes("Nunca") || profile.experience.includes("Menos"));
  if (beginner && template.level === "intermediate") issues.push("Esta rutina es de nivel intermedio y tu perfil indica nivel principiante.");
  if (template.level === "advanced") {
    const readiness = advancedTrainingReadiness(profile ?? { experience: null });
    if (readiness === "unknown") warnings.push("Faltan datos de experiencia, continuidad o técnica para valorar esta rutina avanzada. Revísala con un profesional antes de utilizarla.");
    if (readiness === "not_ready") warnings.push("Esta rutina avanzada puede no encajar con tu experiencia, continuidad o autoevaluación técnica. Revísala con un profesional antes de utilizarla.");
    if (readiness === "ready") warnings.push("La experiencia y la técnica son autodeclaradas y no garantizan que esta rutina avanzada sea adecuada para ti. Consulta a un profesional si tienes dudas.");
  }
  const place = normalizeTrainingPlace(profile?.training_place);
  if (!place) issues.push("Indica dónde entrenas en tu perfil.");
  if (place && place !== "Mixto" && place !== template.place) issues.push(`La rutina es para ${template.place.toLowerCase()} y tu perfil indica ${place.toLowerCase()}.`);
  if (typeof profile?.days_per_week === "number" && profile.days_per_week !== template.days.length) {
    warnings.push(`La rutina tiene ${template.days.length} días y tu perfil indica ${profile.days_per_week}. Revisa tu disponibilidad: la rutina se mantendrá con sus ${template.days.length} días, sin añadir ni eliminar sesiones.`);
  }
  const storedEquipment = profile?.training_equipment;
  const validEquipment = Array.isArray(storedEquipment) && storedEquipment.every((item): item is ExerciseEquipment => typeof item === "string" && isExerciseEquipment(item));
  const equipment = place === "Gimnasio" ? gymEquipmentPreset() : validEquipment ? storedEquipment : null;
  if (!equipment) issues.push("Revisa el material disponible en tu perfil.");
  const restrictions = profile?.restrictions;
  const validRestrictions = Array.isArray(restrictions) && restrictions.every((item): item is string => typeof item === "string") ? restrictions : null;
  if (!validRestrictions) issues.push("Revisa las restricciones guardadas en tu perfil.");
  if (validRestrictions?.some((restriction) => injuryLabelsFromRestrictions([restriction])[0] === "Ninguna" && !catalog.some((item) => item.restrictions.includes(restriction)))) {
    issues.push("No se pueden verificar algunas restricciones de tu perfil. Consulta a un profesional antes de elegir una rutina.");
  }
  if (validRestrictions?.length) warnings.push("Las restricciones se han comprobado con los datos disponibles, pero no garantizan seguridad con una lesión. Consulta a un profesional.");
  const byName = new Map(catalog.map((item) => [item.name, item]));
  const cardsByName = new Map(cards.filter((card) => card.available !== false).map((card) => [card.name, card]));
  const cardsById = new Map(cards.filter((card) => card.available !== false).map((card) => [card.id, card]));
  const cardFor = (candidate: PlanningCatalogExercise) => candidate.id ? cardsById.get(candidate.id) : cardsByName.get(candidate.name);
  const resolvedDays: TemplateReview["resolvedDays"] = [];
  const displayDays = template.days.map((day) => {
    const used = new Set<string>();
    const resolved: TemplateReview["resolvedDays"][number]["exercises"] = [];
    const exercises = day.exercises.flatMap((item) => {
      const names = [item.name, ...(item.alternatives ?? [])];
      const name = names.find((candidateName) => {
        const candidate = byName.get(candidateName);
        return candidate && cardFor(candidate) && !used.has(candidateName) &&
          equipment && validRestrictions &&
          isPlanningExerciseCompatible(candidate, validRestrictions, equipment, template.level === "beginner" || (beginner && template.level !== "advanced"));
      });
      if (!name) {
        if (item.optional) warnings.push(`${day.name}: no se incluye el complemento ${item.name}.`);
        else issues.push(`${day.name}: no hay una alternativa compatible disponible para ${item.name}.`);
        return item.optional ? [] : [item];
      }
      if (name !== item.name) warnings.push(`${day.name}: ${item.name} se sustituye por ${name}.`);
      used.add(name);
      resolved.push({ exerciseId: cardFor(byName.get(name)!)!.id, sets: item.sets, repetitions: item.repetitions, restSeconds: item.restSeconds });
      return [{ ...item, name }];
    });
    const movements = new Set([...used].map((name) => mainMovement(name)));
    if (day.requiredMovements.some((movement) => !movements.has(movement))) {
      issues.push(`${day.name}: faltan movimientos principales previstos.`);
    }
    const directMuscles = new Set([...used].flatMap((name) => {
      const muscle = byName.get(name)?.primaryMuscle;
      return muscle ? [normalizeSummaryMuscle(muscle)] : [];
    }));
    const missingNamedMuscles = day.namedMuscles?.filter((muscle) => !directMuscles.has(muscle)) ?? [];
    if (missingNamedMuscles.length) {
      issues.push(`${day.name}: faltan ejercicios directos para ${muscleGroupLabels(missingNamedMuscles).join(", ")}. Revisa el material y las restricciones.`);
    }
    if (!exercises.length) issues.push(`${day.name}: no hay ejercicios compatibles disponibles.`);
    resolvedDays.push({ name: day.name, exercises: resolved });
    return { ...day, exercises };
  });
  const maximumMinutes = Math.ceil(Math.max(...displayDays.map((day) => estimateStrengthSeconds(day.exercises))) / 60) + (template.estimatedExtraMinutes ?? 0);
  if (typeof profile?.session_duration_minutes === "number" && maximumMinutes > profile.session_duration_minutes) {
    warnings.push(`La sesión más larga puede necesitar unos ${maximumMinutes} minutos de fuerza, más que los ${profile.session_duration_minutes} indicados. El cardio es adicional.`);
  }
  return { template: { ...template, days: displayDays, minutes: issues.length ? template.minutes : maximumMinutes }, issues: [...new Set(issues)], warnings: [...new Set(warnings)], resolvedDays };
}

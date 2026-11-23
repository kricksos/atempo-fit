import type { PlanningCatalogExercise } from "@/lib/exercise-catalog";
import { normalizeSummaryMuscle } from "@/lib/exercise-muscles";
import { injuryLabelsFromRestrictions } from "@/lib/injuries";
import { normalizeTrainingPlace } from "@/lib/training-place";
import { advancedTrainingReadiness, continuityOptions, experienceOptions, techniqueOptions } from "@/lib/training-experience";
import { workoutReplacementSessions, workoutTemplates, type TemplateDay, type TemplateExercise, type WorkoutTemplate } from "@/lib/workout-templates";
import type { GeneratedPlan, PlanningProfile, WorkoutAdaptation } from "./engine";
import { estimateStrengthSeconds } from "./strength-estimate";
import { isPlanningExerciseCompatible, PlanningAvailabilityError } from "./workout-compatibility";

export { estimateStrengthSeconds } from "./strength-estimate";

type PlanDay = GeneratedPlan["days"][number];
type PlanExercise = PlanDay["exercises"][number];
type ResolvedExercise = { exercise: PlanningCatalogExercise; prescription: TemplateExercise };
type ResolvedSession = {
  source: TemplateDay;
  exercises: ResolvedExercise[];
  missing: string[];
  injured: string[];
  groups: Set<string>;
};

const groupLabels: Record<string, string> = {
  quadriceps: "cuádriceps", pectorals: "pecho", lats: "espalda", hamstrings: "isquiotibiales",
  core: "core", biceps: "bíceps", triceps: "tríceps", deltoids: "hombros",
  glutes: "glúteos", calves: "gemelos", lower_back: "zona lumbar",
};

export function priorityMuscles(profile: Pick<PlanningProfile, "priorities">) {
  return new Set((profile.priorities ?? []).flatMap((value) =>
    value === "piernas" ? ["quadriceps", "hamstrings"] : [normalizeSummaryMuscle(value)]));
}

function usesBeginnerBase(profile: Pick<PlanningProfile, "experience" | "trainingContinuity" | "trainingTechnique">) {
  return profile.experience.includes("Nunca") || profile.experience.includes("Menos") ||
    profile.trainingContinuity === continuityOptions[1] || profile.trainingTechnique === techniqueOptions[1];
}

export function directSetBudget(profile: Pick<PlanningProfile, "experience" | "priorities" | "trainingContinuity" | "trainingTechnique">, group: string) {
  const beginner = usesBeginnerBase(profile);
  return (beginner ? 6 : 8) + (priorityMuscles(profile).has(group) ? 2 : 0);
}

function resolveSession(
  day: TemplateDay,
  catalog: Map<string, PlanningCatalogExercise>,
  profile: PlanningProfile,
  beginner: boolean,
): ResolvedSession {
  const used = new Set<string>();
  const exercises: ResolvedExercise[] = [];
  const missing: string[] = [];
  const injured: string[] = [];
  const equipment = profile.trainingEquipment!;
  const restrictions = profile.restrictions ?? [];
  for (const prescription of day.exercises) {
    const candidates = [prescription.name, ...(prescription.alternatives ?? [])]
      .map((name) => catalog.get(name))
      .filter((exercise): exercise is PlanningCatalogExercise => Boolean(exercise));
    const available = candidates.filter((exercise) => !used.has(exercise.name));
    const chosen = available.find((exercise) => isPlanningExerciseCompatible(exercise, restrictions, equipment, beginner));
    if (chosen) {
      used.add(chosen.name);
      exercises.push({ exercise: chosen, prescription });
    } else if (!prescription.optional) {
      const removedByRestriction = available.some((exercise) =>
        isPlanningExerciseCompatible(exercise, [], equipment, beginner) &&
        !isPlanningExerciseCompatible(exercise, restrictions, equipment, beginner));
      (removedByRestriction ? injured : missing).push(prescription.name);
    }
  }
  return {
    source: day, exercises, missing, injured,
    groups: new Set(exercises.flatMap(({ exercise, prescription }) =>
      !prescription.optional && exercise.primaryMuscle ? [normalizeSummaryMuscle(exercise.primaryMuscle)] : [])),
  };
}

function overlap(a: Set<string>, b: Set<string>) {
  return [...a].filter((group) => b.has(group)).length;
}

function adaptedName(session: ResolvedSession) {
  if (!session.injured.length) return session.source.name;
  const labels = [...session.groups].map((group) => groupLabels[group]).filter(Boolean);
  if (!labels.length) return "Sesión adaptada";
  return labels.map((label, index) => index ? label : label.charAt(0).toUpperCase() + label.slice(1)).join(" · ");
}

function chooseSessions(base: ResolvedSession[], replacements: ResolvedSession[], restructure: boolean) {
  if (!restructure) return base;
  type Choice = { sessions: ResolvedSession[]; score: number };
  let choices: Choice[] = [{ sessions: [], score: 0 }];
  for (const original of base) {
    const usableOriginal = original.exercises.some((item) => !item.prescription.optional) && !original.injured.length;
    const candidates = usableOriginal ? [original, ...replacements.filter((item) => item.source.name !== original.source.name)] : replacements;
    if (!candidates.length) throw new PlanningAvailabilityError(`No hay una sesión alternativa compatible para ${original.source.name}. Revisa el material y consulta a un profesional si tienes lesiones.`);
    const next: Choice[] = [];
    for (const choice of choices) for (const candidate of candidates) {
      const previous = choice.sessions.at(-1);
      const repeats = choice.sessions.filter((session) => session.source.name === candidate.source.name).length;
      const score = choice.score + (previous ? overlap(previous.groups, candidate.groups) * 100 : 0) +
        (candidate === original ? 0 : 6 + [...original.groups].filter((group) => !candidate.groups.has(group)).length * 2) +
        candidate.missing.length * 20 + repeats * 3 + Math.max(0, 2 - candidate.exercises.length) * 3;
      next.push({ sessions: [...choice.sessions, candidate], score });
    }
    next.sort((a, b) => a.score - b.score);
    choices = next.slice(0, 100);
  }
  choices.sort((a, b) =>
    (a.score + overlap(a.sessions[0].groups, a.sessions.at(-1)!.groups) * 30) -
    (b.score + overlap(b.sessions[0].groups, b.sessions.at(-1)!.groups) * 30));
  return choices[0].sessions;
}

export function planCatalogWorkout(profile: PlanningProfile, catalog: PlanningCatalogExercise[], allowAdaptation: boolean) {
  if (!Array.isArray(profile.trainingEquipment)) {
    throw new PlanningAvailabilityError("Indica el material disponible en la revisión de entrenamiento antes de generar la rutina.");
  }
  const place = normalizeTrainingPlace(profile.trainingPlace);
  if (!place) throw new PlanningAvailabilityError("Indica dónde entrenas antes de generar la rutina.");
  const experience = ["Nunca he entrenado", "Menos de 1 año", "Entre 1 y 3 años", "Entre 3 y 5 años", "Más de 5 años"];
  if (!experience.includes(profile.experience)) throw new PlanningAvailabilityError("Revisa tu experiencia antes de generar la rutina.");
  const restrictions = profile.restrictions ?? [];
  if (!Array.isArray(restrictions) || restrictions.some((restriction) => typeof restriction !== "string" ||
    (injuryLabelsFromRestrictions([restriction])[0] === "Ninguna" && !catalog.some((exercise) => exercise.restrictions.includes(restriction))))) {
    throw new PlanningAvailabilityError("No se pueden verificar algunas restricciones de tu perfil. Revísalas con un profesional antes de generar la rutina.");
  }
  const beginner = usesBeginnerBase(profile);
  const level: WorkoutTemplate["level"] = beginner ? "beginner" : "intermediate";
  const count = Math.min(6, Math.max(2, profile.daysPerWeek));
  const byName = new Map(catalog.map((exercise) => [exercise.name, exercise]));
  const readiness = advancedTrainingReadiness({
    experience: profile.experience,
    training_continuity: profile.trainingContinuity,
    training_technique: profile.trainingTechnique,
  });
  const advancedCandidate = readiness === "ready" &&
    (profile.experience === experienceOptions[3] || profile.experience === experienceOptions[4]) &&
    profile.restrictionsKnown !== false && Array.isArray(profile.restrictions) && restrictions.length === 0 &&
    ["Ganar masa muscular", "Recomposición corporal", "Mejorar rendimiento"].includes(profile.goal) &&
    profile.sessionMinutesKnown !== false && Number.isFinite(profile.sessionMinutes) && profile.sessionMinutes > 0
    ? workoutTemplates.find((template) =>
      template.automaticEligible === true && template.level === "advanced" && template.evidence &&
      template.days.length === profile.daysPerWeek && (place === "Mixto" || template.place === place) &&
      template.days.every((day) => estimateStrengthSeconds(day.exercises) + (template.estimatedExtraMinutes ?? 0) * 60 <= profile.sessionMinutes * 60 &&
        new Set(day.exercises.map((item) => item.name)).size === day.exercises.length &&
        day.exercises.every((item) => {
          const entry = byName.get(item.name);
          return entry && isPlanningExerciseCompatible(entry, restrictions, profile.trainingEquipment!, false);
        })))
    : undefined;
  if (advancedCandidate?.evidence) {
    const evidence = advancedCandidate.evidence;
    return {
      structure: advancedCandidate.name,
      days: advancedCandidate.days.map((day) => ({
        name: day.name,
        exercises: day.exercises.map(({ name, sets, repetitions, restSeconds }) => ({ name, sets, repetitions, restSeconds })),
      })),
      workoutAdaptations: [{
        kind: "review" as const,
        reasons: [
          `${evidence.attribution} ${evidence.url} Licencia: ${evidence.licenseUrl}`,
          ...evidence.differences,
          ...evidence.guidance,
          "Tu experiencia, continuidad y técnica son autodeclaradas; no se ha comprobado tu capacidad de recuperación ni se garantiza que esta rutina sea adecuada. Revisa la propuesta con un profesional.",
          "Las prioridades musculares no modifican esta adaptación. El margen de tiempo adicional es orientativo y no garantiza que la sesión quepa.",
        ],
      }],
    };
  }
  const candidates = workoutTemplates.filter((template) =>
    template.variant === "base" && template.level === level && template.days.length === count && (place === "Mixto" || template.place === place));
  if (!candidates.length) throw new PlanningAvailabilityError("No hay una rutina preparada para tus días, experiencia y lugar de entrenamiento.");
  const reviews = candidates.map((template) => ({
    template,
    sessions: template.days.map((day) => resolveSession(day, byName, profile, beginner)),
  }));
  reviews.sort((a, b) =>
    a.sessions.reduce((sum, day) => sum + day.missing.length + day.injured.length, 0) -
    b.sessions.reduce((sum, day) => sum + day.missing.length + day.injured.length, 0));
  const { template, sessions: base } = reviews[0];
  const restructure = base.some((day) => !day.exercises.some((item) => !item.prescription.optional) || (count >= 4 && day.injured.length > 0));
  const replacements = workoutReplacementSessions(template.place, level)
    .map((day) => resolveSession(day, byName, profile, beginner))
    .filter((day) => day.exercises.length > 0 && !day.missing.length && !day.injured.length);
  const selected = chooseSessions(base, replacements, restructure);
  const priorities = priorityMuscles(profile);
  const days = selected.map((session) => ({
    name: adaptedName(session),
    exercises: session.exercises.map(({ exercise, prescription }) => ({
      name: exercise.name,
      sets: prescription.sets + Number(priorities.has(normalizeSummaryMuscle(exercise.primaryMuscle ?? ""))),
      repetitions: prescription.repetitions.includes("segundos") ? prescription.repetitions : profile.goal.includes("Perder") ? "10-12" : prescription.repetitions,
      restSeconds: prescription.restSeconds,
    })),
  }));
  const byGroup = new Map<string, Array<{ day: PlanDay; exercise: PlanExercise; optional: boolean }>>();
  for (const [index, day] of days.entries()) for (const exercise of day.exercises) {
    const group = byName.get(exercise.name)?.primaryMuscle;
    if (!group) continue;
    const normalized = normalizeSummaryMuscle(group);
    const groupExercises = byGroup.get(normalized) ?? [];
    const optional = Boolean(selected[index].exercises.find((item) => item.exercise.name === exercise.name)?.prescription.optional);
    groupExercises.push({ day, exercise, optional });
    byGroup.set(normalized, groupExercises);
  }
  const reasons: string[] = [];
  if (readiness === "ready") {
    reasons.push("No se ha encontrado una adaptación avanzada completa que cumpla los criterios automáticos de perfil, objetivo, días, material, restricciones y tiempo. Se propone una base anterior, pendiente de revisión profesional.");
  }
  if (beginner && !profile.experience.includes("Nunca") && !profile.experience.includes("Menos")) {
    reasons.push("Se ha elegido una base inicial por la continuidad o la autoevaluación técnica indicadas. Es un punto de partida orientativo; consulta a un profesional para ajustarlo.");
  }
  for (const [group, entries] of byGroup) {
    const budget = directSetBudget(profile, group);
    while (entries.length > budget) {
      const optionalIndex = entries.findLastIndex((item) => item.optional);
      if (optionalIndex < 0) throw new PlanningAvailabilityError(`No se puede distribuir el trabajo de ${groupLabels[group] ?? group} entre tantos días con el material y las restricciones actuales. Revisa la disponibilidad con un profesional.`);
      const [removed] = entries.splice(optionalIndex, 1);
      removed.day.exercises.splice(removed.day.exercises.indexOf(removed.exercise), 1);
    }
    entries.forEach(({ exercise }, index) => {
      const allocation = Math.floor(budget / entries.length) + Number(index < budget % entries.length);
      exercise.sets = Math.max(1, Math.min(exercise.sets, allocation));
    });
  }
  const workoutAdaptations: WorkoutAdaptation[] = [];
  const minutes = profile.sessionMinutes || 60;
  for (const [index, day] of days.entries()) {
    const session = selected[index];
    const unfilled = [...session.missing];
    while (estimateStrengthSeconds(day.exercises) > minutes * 60) {
      const optionalIndex = day.exercises.findLastIndex((item) =>
        session.exercises.find((entry) => entry.exercise.name === item.name)?.prescription.optional);
      if (optionalIndex >= 0) {
        day.exercises.splice(optionalIndex, 1);
        continue;
      }
      const reducible = day.exercises.find((exercise) => exercise.sets > 1);
      if (reducible) {
        reducible.sets--;
        continue;
      }
      const removed = day.exercises.pop();
      if (!removed) break;
      unfilled.push(removed.name);
    }
    if (!day.exercises.length) throw new PlanningAvailabilityError(`No hay ejercicios compatibles que quepan en ${day.name}. Revisa tu tiempo, material y restricciones.`);
    if (unfilled.length) {
      if (!allowAdaptation) throw new PlanningAvailabilityError(`No hay ejercicios compatibles para ${unfilled.join(", ")} en ${day.name}. Revisa tu material y restricciones.`);
      workoutAdaptations.push({ dayIndex: index + 1, dayName: day.name, plannedExercises: day.exercises.length + unfilled.length, actualExercises: day.exercises.length, unfilled });
    }
  }
  const directGroups = new Set(days.flatMap((day) => day.exercises.flatMap((exercise) => {
    const group = byName.get(exercise.name)?.primaryMuscle;
    return group ? [normalizeSummaryMuscle(group)] : [];
  })));
  const missingGroups = ["quadriceps", "pectorals", "lats", "hamstrings"]
    .filter((group) => !directGroups.has(group)).map((group) => groupLabels[group]);
  if (missingGroups.length) workoutAdaptations.push({ kind: "coverage", missingGroups });
  const focusGroups = days.map((day, index) => new Set(day.exercises.flatMap((exercise) => {
    const entry = selected[index].exercises.find((item) => item.exercise.name === exercise.name);
    return entry && !entry.prescription.optional && entry.exercise.primaryMuscle
      ? [normalizeSummaryMuscle(entry.exercise.primaryMuscle)] : [];
  })));
  if (restrictions.length) reasons.push("Se han excluido ejercicios relacionados con las restricciones indicadas y, cuando ha sido necesario, se han reorganizado las sesiones. Las etiquetas no garantizan seguridad con una lesión: consulta a un profesional antes de entrenar.");
  if (restructure && !restrictions.length) reasons.push("Se han sustituido sesiones por otras preparadas porque faltan ejercicios principales compatibles. Revisa que la nueva distribución se ajuste a tu disponibilidad y material.");
  if (count >= 4 && focusGroups.some((groups, index) => index > 0 && overlap(groups, focusGroups[index - 1]) > 0))
    reasons.push("No se ha podido evitar que sesiones consecutivas compartan músculos principales. Deja descanso suficiente y revisa la distribución con un profesional.");
  if (count >= 4 && overlap(focusGroups[0], focusGroups[count - 1]) > 0)
    reasons.push("La última sesión y la primera del siguiente ciclo comparten músculos principales. Deja descanso suficiente entre ellas.");
  if (reasons.length) workoutAdaptations.push({ kind: "review", reasons: [...new Set(reasons)] });
  return {
    structure: `${template.name}${restructure || base.some((day) => day.injured.length) ? " · adaptada" : ""}`,
    workoutAdaptations,
    days,
  };
}

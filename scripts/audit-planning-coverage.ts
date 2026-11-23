import { loadEnvConfig } from "@next/env";
import illustrationCatalog from "../data/illustration-library/catalog.json";
import mapping from "../data/illustration-library/candidate-mapping.json";
import { generateInitialPlan, isPlanningExerciseCompatible, PlanningAvailabilityError } from "../src/features/planning/engine";
import { estimateStrengthSeconds } from "../src/features/planning/workout-planner";
import { buildPlanningExerciseCatalog } from "../src/lib/exercise-catalog";
import { gymEquipmentPreset, homeEquipmentOptions, type ExerciseEquipment } from "../src/lib/exercise-equipment";
import { createAdminClient } from "../src/lib/supabase/admin";
import { homeExerciseFixtures } from "./home-exercise-fixtures";
import { moreHomeExerciseFixtures } from "./more-home-exercise-fixtures";

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--simulate-0051" && arg !== "--simulate-0052")) throw new Error("Uso: npx tsx scripts/audit-planning-coverage.ts [--simulate-0051] [--simulate-0052]");
  loadEnvConfig(process.cwd());
  const { data, error, count } = await createAdminClient().from("exercises")
    .select("id, name, description, primary_muscle, muscle_groups, difficulty, equipment_required, restrictions, media_source, is_momentum_approved", { count: "exact" })
    .order("name");
  if (error) throw error;
  if (!data || count !== data.length) throw new Error("No se ha podido cargar el catálogo completo.");
  const simulated = [
    ...(args.includes("--simulate-0051") ? homeExerciseFixtures : []),
    ...(args.includes("--simulate-0052") ? moreHomeExerciseFixtures : []),
  ];
  const missingFixtures = simulated.filter((fixture) => !data.some((row) => row.name === fixture.name));
  const catalog = buildPlanningExerciseCatalog([...data, ...missingFixtures]);
  const byName = new Map(catalog.map((exercise) => [exercise.name, exercise]));
  const measuredGroups = ["quadriceps", "pectorals", "lats", "hamstrings", "core", "biceps", "triceps", "deltoids", "glutes", "calves"];
  const equipmentScenarios: Array<{ name: string; place: string; equipment: ExerciseEquipment[] }> = [
    { name: "Casa sin material", place: "Casa", equipment: [] },
    { name: "Casa con mancuernas", place: "Casa", equipment: ["dumbbell"] },
    { name: "Casa con mancuernas y mochila", place: "Casa", equipment: ["dumbbell", "backpack"] },
    { name: "Casa con mochila", place: "Casa", equipment: ["backpack"] },
    { name: "Casa con bandas", place: "Casa", equipment: ["resistance_band"] },
    { name: "Casa con equipo mostrado", place: "Casa", equipment: ["dumbbell", "ez_bar", "bench", "incline_bench", "pull_up_bar"] },
    { name: "Casa con todo el material seleccionable", place: "Casa", equipment: homeEquipmentOptions.map((option) => option.value) },
    { name: "Gimnasio equipado", place: "Gimnasio", equipment: gymEquipmentPreset() },
  ];
  const base = { sex: "male" as const, age: 30, heightCm: 178, weightKg: 80, goal: "Ganar masa muscular", mealCount: 4 };
  const restrictionScenarios = [
    { name: "sin restricciones", values: [] },
    { name: "restricción de rodilla", values: ["knee_injury"] },
    { name: "restricción de hombro", values: ["shoulder_injury"] },
    { name: "restricción de espalda", values: ["back_injury"] },
    { name: "restricción de codo", values: ["elbow_injury"] },
    { name: "restricción de tobillo", values: ["ankle_injury"] },
    { name: "restricción de cuello", values: ["neck_injury"] },
    { name: "restricción de muñeca", values: ["wrist_injury"] },
    { name: "restricciones de hombro y rodilla", values: ["shoulder_injury", "knee_injury"] },
    { name: "restricciones de hombro, rodilla y espalda", values: ["shoulder_injury", "knee_injury", "back_injury"] },
  ];
  const results = equipmentScenarios.map((scenario) => {
    const levels = ["Nunca he entrenado", "Entre 1 y 3 años"].map((experience) => {
      const beginner = experience === "Nunca he entrenado";
      const available = catalog.filter((exercise) => isPlanningExerciseCompatible(exercise, [], scenario.equipment, beginner));
      const counts: Record<string, number> = {};
      for (const exercise of available) {
        const key = exercise.primaryMuscle ?? "sin clasificar";
        counts[key] = (counts[key] ?? 0) + 1;
      }
      const cases = { full: 0, adapted: 0, blocked: 0 };
      const byRestriction = Object.fromEntries(restrictionScenarios.map((item) => [item.name, { full: 0, adapted: 0, blocked: 0 }]));
      const pending: Record<string, number> = {};
      const missingDirect: Record<string, number> = {};
      const maximumDirectSets: Record<string, number> = {};
      const maximumDirectFrequency: Record<string, number> = {};
      let adjacentDirectRepeats = 0;
      for (const daysPerWeek of [2, 3, 4, 5, 6]) for (const sessionMinutes of [30, 45, 60]) for (const restriction of restrictionScenarios) {
        try {
          const plan = generateInitialPlan({
            ...base, experience, daysPerWeek, sessionMinutes, restrictions: restriction.values,
            trainingPlace: scenario.place, trainingEquipment: scenario.equipment,
          }, catalog, { allowAdaptation: true });
          if (plan.days.length !== daysPerWeek) throw new Error(`${scenario.name}: número de sesiones incorrecto.`);
          const directSets: Record<string, number> = {};
          const directFrequency: Record<string, number> = {};
          let previousGroups = new Set<string>();
          for (const [index, day] of plan.days.entries()) {
            if (!day.exercises.length) throw new Error(`${scenario.name}: sesión vacía.`);
            if (estimateStrengthSeconds(day.exercises) > sessionMinutes * 60) throw new Error(`${scenario.name}: duración estimada excedida.`);
            const groupsInDay = new Set<string>();
            for (const exercise of day.exercises) {
              const entry = byName.get(exercise.name);
              if (!entry || !isPlanningExerciseCompatible(entry, restriction.values, scenario.equipment, beginner)) throw new Error(`${scenario.name}: ejercicio incompatible ${exercise.name}.`);
              const group = entry.primaryMuscle;
              if (!group) continue;
              directSets[group] = (directSets[group] ?? 0) + exercise.sets;
              groupsInDay.add(group);
            }
            if (index && [...groupsInDay].some((group) => previousGroups.has(group))) adjacentDirectRepeats++;
            previousGroups = groupsInDay;
            for (const group of groupsInDay) directFrequency[group] = (directFrequency[group] ?? 0) + 1;
          }
          for (const group of measuredGroups) {
            if ((directSets[group] ?? 0) > (beginner ? 6 : 8)) throw new Error(`${scenario.name}: ${group} supera el límite de series directas en ${experience}, ${daysPerWeek} días y ${sessionMinutes} minutos.`);
            if (!directSets[group]) missingDirect[group] = (missingDirect[group] ?? 0) + 1;
            maximumDirectSets[group] = Math.max(maximumDirectSets[group] ?? 0, directSets[group] ?? 0);
            maximumDirectFrequency[group] = Math.max(maximumDirectFrequency[group] ?? 0, directFrequency[group] ?? 0);
          }
          if (plan.workoutAdaptations.length) {
            cases.adapted++;
            byRestriction[restriction.name].adapted++;
            for (const warning of plan.workoutAdaptations) {
              const details = warning.kind === "coverage" ? warning.missingGroups : warning.kind === "review" ? warning.reasons : warning.unfilled;
              for (const group of details) pending[group] = (pending[group] ?? 0) + 1;
            }
          } else {
            cases.full++;
            byRestriction[restriction.name].full++;
          }
        } catch (caught) {
          if (!(caught instanceof PlanningAvailabilityError)) throw caught;
          cases.blocked++;
          byRestriction[restriction.name].blocked++;
        }
      }
      return { experience, eligibleExercises: available.length, primaryGroups: counts, cases, byRestriction, warningGroups: pending, missingDirect, maximumDirectSets, maximumDirectFrequency, adjacentDirectRepeats };
    });
    return { scenario: scenario.name, levels };
  });
  const mapped = new Set(Object.values(mapping.assignments));
  const potential = illustrationCatalog.exercises.filter((exercise) =>
    !mapped.has(exercise.id) && !exercise.isWarmUp && exercise.frames.length >= 2 &&
    exercise.level === "beginner" && exercise.equipment.every((item) => ["dumbbell", "band", "bench", "step"].includes(item)));
  const candidateGroups = ["calves", "hamstrings", "lats", "biceps", "glutes", "pectorals", "quadriceps"].map((group) => {
    const matches = potential.filter((exercise) => exercise.muscles.primary.includes(group));
    return { group, count: matches.length, examples: matches.slice(0, 6).map((exercise) => ({
      id: exercise.id, name: exercise.name, equipment: exercise.equipment, category: exercise.category, movementPattern: exercise.movementPattern,
    })) };
  });
  console.log(JSON.stringify({ exerciseCount: catalog.length, simulatedMigrationExercises: missingFixtures.length, matrixDefinition: "Por nivel: 5 frecuencias × 3 duraciones × 10 conjuntos de restricciones sintéticas. La cobertura y las series solo cuentan el músculo principal; los valores máximos no son objetivos clínicos.", results, libraryIllustrations: illustrationCatalog.exercises.length, mappedIllustrationIds: mapped.size, unreviewedIllustrationCandidates: candidateGroups }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });

import { createAdminClient } from "../../lib/supabase/admin";
import { goalDirection } from "../../lib/goal-direction";
import { getPlanningExerciseCatalog } from "../../lib/exercise-catalog";
import { hasStrengthPerformance } from "../../lib/workout-log";
import { isPlanningExerciseCompatible, parsePlanningProfile } from "./engine";
import { isTimedPrescription, mainMovement } from "./movement-patterns";
import { completedNutritionDayCount } from "./nutrition-compliance";
import { isExerciseStagnant, nextRepRange, nutritionStagnation, weeklyBuckets } from "./stagnation";
import { directSetBudget, estimateStrengthSeconds } from "./workout-planner";

const WINDOW_DAYS = 21;
const COMPLIANCE_THRESHOLD = 0.6;
const SHORT_TERM_PCT = 0.05;
const LONG_TERM_PCT = 0.08;

function daysAgoIso(days: number) {
  return new Date(Date.now() - days * 86400000).toISOString();
}

export type PlanAdjustmentResult =
  | { adjusted: false; reason: "insufficient_data" | "low_compliance" | "on_track" | "review_required"; nutritionCompliance: number; workoutCompliance: number }
  | { adjusted: boolean; nutritionAdjusted: boolean; workoutAdjusted: boolean; calories: number | null; exerciseActions: Record<string, string> };

export class PlanAdjustmentAvailabilityError extends Error {}

/** Core adaptive-engine logic (no HTTP/auth concerns) so it can run inside a route handler or a standalone script. */
export async function runPlanAdjustment(userId: string, mode: "workout" | "nutrition" | "general" = "general"): Promise<PlanAdjustmentResult> {
  const supabase = createAdminClient();
  const updateWorkout = mode !== "nutrition";
  const updateNutrition = mode !== "workout";

  const { data: profile } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
  if (!profile) throw new Error("Complete your profile first.");

  const { data: workoutPlan } = updateWorkout ? await supabase.from("workout_plans").select("id").eq("user_id", userId).eq("active", true).maybeSingle() : { data: null };
  const { data: nutritionPlan } = updateNutrition ? await supabase.from("nutrition_plans").select("id").eq("user_id", userId).eq("active", true).maybeSingle() : { data: null };
  if ((updateWorkout && !workoutPlan) || (updateNutrition && !nutritionPlan)) throw new PlanAdjustmentAvailabilityError("No hay un plan activo para analizar. Genera primero la parte que quieres revisar.");

  const { data: workoutVersion } = workoutPlan ? await supabase.from("workout_plan_versions").select("id, version_number, profile_snapshot").eq("workout_plan_id", workoutPlan.id).eq("active", true).maybeSingle() : { data: null };
  const { data: nutritionVersion } = nutritionPlan ? await supabase.from("nutrition_plan_versions").select("id, version_number, calories, protein_grams, fats_grams, meal_count").eq("nutrition_plan_id", nutritionPlan.id).eq("active", true).maybeSingle() : { data: null };
  if ((updateWorkout && !workoutVersion) || (updateNutrition && !nutritionVersion)) throw new PlanAdjustmentAvailabilityError("No hay una versión activa del plan seleccionado para analizar.");

  const { data: days } = workoutVersion ? await supabase.from("workout_days").select("id, name, order_number").eq("workout_plan_version_id", workoutVersion.id).order("order_number") : { data: [] };
  const dayIds = (days ?? []).map((day) => day.id);
  const { data: workoutExercises } = dayIds.length ? await supabase.from("workout_exercises").select("id, workout_day_id, exercise_id, sets, repetitions, rest_seconds, order_number, progression_level").in("workout_day_id", dayIds) : { data: [] };

  // --- Compliance: don't judge or change a plan the user hasn't actually been following ---
  const windowStart = daysAgoIso(WINDOW_DAYS);
  const { data: recentSessions } = dayIds.length ? await supabase.from("workout_sessions").select("completed_at").eq("user_id", userId).eq("completed", true).in("workout_day_id", dayIds).gte("completed_at", windowStart) : { data: [] };
  const workoutDaysCompleted = new Set((recentSessions ?? []).map((session) => session.completed_at?.slice(0, 10))).size;
  const expectedWorkouts = Math.max(1, Math.round((profile.days_per_week ?? 3) * (WINDOW_DAYS / 7)));
  const workoutCompliance = Math.min(1, workoutDaysCompleted / expectedWorkouts);

  const { data: nutritionVersionMeals } = nutritionVersion ? await supabase.from("nutrition_meals").select("id").eq("nutrition_plan_version_id", nutritionVersion.id) : { data: [] };
  const mealIds = (nutritionVersionMeals ?? []).map((meal) => meal.id);
  const { data: recentCompletions } = mealIds.length ? await supabase.from("nutrition_meal_completions").select("completed_on").eq("user_id", userId).in("meal_id", mealIds).gte("completed_on", windowStart.slice(0, 10)) : { data: [] };
  const mealsPerDay = Math.max(1, mealIds.length);
  const completedNutritionDays = completedNutritionDayCount(recentCompletions ?? [], mealsPerDay);
  const nutritionCompliance = Math.min(1, completedNutritionDays / WINDOW_DAYS);

  // --- Nutrition stagnation: weekly-average trend, not two isolated pesajes ---
  const { data: measurements } = updateNutrition ? await supabase.from("body_measurements").select("measured_at, weight_kg").eq("user_id", userId).order("measured_at", { ascending: true }) : { data: [] };
  const direction = goalDirection(profile.primary_goal);
  const buckets = weeklyBuckets((measurements ?? []).map((entry) => ({ measuredAt: entry.measured_at, weightKg: entry.weight_kg })));
  const nutritionResult = nutritionStagnation(buckets, direction);
  const canAdjustNutrition = updateNutrition && nutritionResult.status === "stagnant" && nutritionCompliance >= COMPLIANCE_THRESHOLD;

  // --- Training stagnation: same top weight + same reps for the last 3 logged sessions of that exercise ---
  const { data: sessionRows } = dayIds.length ? await supabase.from("workout_sessions").select("id, completed_at").eq("user_id", userId).eq("completed", true).in("workout_day_id", dayIds).order("completed_at", { ascending: true }) : { data: [] };
  const sessionIds = (sessionRows ?? []).map((session) => session.id);
  const { data: logs } = sessionIds.length ? await supabase.from("exercise_logs").select("workout_session_id, exercise_id, weight_kg, repetitions, duration_seconds").in("workout_session_id", sessionIds).eq("completed", true) : { data: [] };

  const occurrencesByExercise = new Map<string, Array<{ weightKg: number | null; reps: number | null }>>();
  for (const session of sessionRows ?? []) {
    const sessionLogs = (logs ?? []).filter((log) => log.workout_session_id === session.id && hasStrengthPerformance(log));
    const exerciseIdsInSession = new Set(sessionLogs.map((log) => log.exercise_id));
    for (const exerciseId of exerciseIdsInSession) {
      const setsForExercise = sessionLogs.filter((log) => log.exercise_id === exerciseId);
      const topSet = setsForExercise.reduce((best, current) => (current.weight_kg ?? 0) > (best.weight_kg ?? 0) ? current : best, setsForExercise[0]);
      const list = occurrencesByExercise.get(exerciseId) ?? [];
      list.push({ weightKg: topSet.weight_kg, reps: topSet.repetitions });
      occurrencesByExercise.set(exerciseId, list);
    }
  }

  const canAdjustTraining = updateWorkout && workoutCompliance >= COMPLIANCE_THRESHOLD;
  const lookupIds = [...new Set((workoutExercises ?? []).map((exercise) => exercise.exercise_id))];
  const { data: exerciseCatalog, error: exerciseCatalogError } = canAdjustTraining && lookupIds.length
    ? await supabase.from("exercises").select("id, name, alternatives").in("id", lookupIds)
    : { data: [], error: null };
  if (exerciseCatalogError) throw exerciseCatalogError;
  const catalogById = new Map((exerciseCatalog ?? []).map((exercise) => [exercise.id, exercise]));
  const stagnantExerciseIds = canAdjustTraining
    ? (workoutExercises ?? []).filter((exercise) => {
      const name = catalogById.get(exercise.exercise_id)?.name;
      return name && !isTimedPrescription(name, exercise.repetitions) && isExerciseStagnant(occurrencesByExercise.get(exercise.exercise_id) ?? []);
    }).map((exercise) => exercise.exercise_id)
    : [];

  const planningProfile = stagnantExerciseIds.length ? parsePlanningProfile(profile) : null;
  const eligible = planningProfile && Array.isArray(planningProfile.trainingEquipment)
    ? (await getPlanningExerciseCatalog()).filter((exercise) => isPlanningExerciseCompatible(exercise, planningProfile.restrictions ?? [], planningProfile.trainingEquipment ?? [], planningProfile.experience.includes("Nunca") || planningProfile.experience.includes("Menos")))
    : [];
  const { data: allExercises, error: allExercisesError } = eligible.length
    ? await supabase.from("exercises").select("id, name").in("name", eligible.map((exercise) => exercise.name))
    : { data: [], error: null };
  if (allExercisesError) throw allExercisesError;
  const idByName = new Map((allExercises ?? []).map((exercise) => [exercise.name, exercise.id]));
  const eligibleByName = new Map(eligible.map((exercise) => [exercise.name, exercise]));
  const weeklySets = new Map<string, number>();
  if (planningProfile) for (const exercise of workoutExercises ?? []) {
    const name = catalogById.get(exercise.exercise_id)?.name;
    const item = name ? eligibleByName.get(name) : undefined;
    if (!item?.primaryMuscle) throw new PlanAdjustmentAvailabilityError("No se puede comprobar la rutina actual con tu material, nivel y restricciones. Revisa el perfil o regenera la rutina antes de ajustarla.");
    weeklySets.set(item.primaryMuscle, (weeklySets.get(item.primaryMuscle) ?? 0) + exercise.sets);
  }

  if (!canAdjustNutrition && stagnantExerciseIds.length === 0) {
    const lowCompliance = (updateNutrition && nutritionResult.status === "stagnant" && nutritionCompliance < COMPLIANCE_THRESHOLD) || (updateWorkout && workoutCompliance < COMPLIANCE_THRESHOLD);
    const reason = updateNutrition && nutritionResult.status === "insufficient_data" ? "insufficient_data" : lowCompliance ? "low_compliance" : "on_track";
    return { adjusted: false, reason, nutritionCompliance, workoutCompliance };
  }

  const { data: run } = await supabase.from("plan_generation_runs").insert({ user_id: userId, run_type: "progress_adjustment", status: "pending", input_snapshot: { nutritionResult, stagnantExerciseIds, workoutCompliance, nutritionCompliance }, engine_version: "adaptive-v1" }).select("id").single();
  if (!run) throw new Error("Unable to start plan adjustment.");

  let newCalories: number | null = null;
  let nutritionAdjusted = false;

  if (canAdjustNutrition && nutritionVersion && nutritionPlan) {
    const pct = nutritionResult.longTermStagnant ? LONG_TERM_PCT : SHORT_TERM_PCT;
    const sign = direction === "up" ? 1 : -1;
    const floor = profile.sex === "male" ? 1800 : 1500;
    newCalories = Math.max(floor, Math.round((nutritionVersion.calories * (1 + sign * pct)) / 10) * 10);
    const scalingFactor = newCalories / nutritionVersion.calories;
    const proteinGrams = nutritionVersion.protein_grams;
    const fatsGrams = nutritionVersion.fats_grams;
    const carbsGrams = Math.max(0, Math.round((newCalories - proteinGrams * 4 - fatsGrams * 9) / 4));

    await supabase.from("nutrition_plan_versions").update({ active: false }).eq("id", nutritionVersion.id);
    const { data: newNutritionVersion } = await supabase.from("nutrition_plan_versions").insert({
      nutrition_plan_id: nutritionPlan.id,
      generation_run_id: run.id,
      version_number: nutritionVersion.version_number + 1,
      profile_snapshot: profile,
      calories: newCalories,
      protein_grams: proteinGrams,
      carbs_grams: carbsGrams,
      fats_grams: fatsGrams,
      meal_count: nutritionVersion.meal_count,
      precision_mode: "precise",
      reason: "progress_adjustment",
    }).select("id").single();
    if (!newNutritionVersion) throw new Error("Unable to create adjusted nutrition version.");

    const { data: currentMeals } = await supabase.from("nutrition_meals").select("id, name, meal_order, suggested_time, target_calories").eq("nutrition_plan_version_id", nutritionVersion.id).order("meal_order");
    for (const meal of currentMeals ?? []) {
      const { data: newMeal } = await supabase.from("nutrition_meals").insert({
        nutrition_plan_version_id: newNutritionVersion.id,
        name: meal.name,
        meal_order: meal.meal_order,
        suggested_time: meal.suggested_time,
        target_calories: Math.max(1, Math.round(meal.target_calories * scalingFactor)),
      }).select("id").single();
      if (!newMeal) throw new Error("Unable to clone nutrition meal.");

      const { data: items } = await supabase.from("nutrition_meal_items").select("food_id, quantity_grams, role, is_alternative, alternative_group, weight_basis, substitution_group").eq("meal_id", meal.id);
      const clonedItems = (items ?? []).map((item) => ({
        meal_id: newMeal.id,
        food_id: item.food_id,
        // Only carbohydrate portions absorb the calorie change; protein/fat/veg stay put to protect those targets.
        quantity_grams: item.role === "carbohydrate" ? Math.max(1, Math.round(item.quantity_grams * scalingFactor)) : item.quantity_grams,
        role: item.role,
        is_alternative: item.is_alternative,
        alternative_group: item.alternative_group,
        weight_basis: item.weight_basis,
        substitution_group: item.substitution_group,
      }));
      if (clonedItems.length) await supabase.from("nutrition_meal_items").insert(clonedItems);
    }
    nutritionAdjusted = true;
  }

  let workoutAdjusted = false;
  let workoutChangesPlanned = false;
  const exerciseActions: Record<string, string> = {};

  if (planningProfile && workoutVersion && workoutPlan) {
    const preparedDays = (days ?? []).map((day) => {
      const dayExercises = (workoutExercises ?? []).filter((exercise) => exercise.workout_day_id === day.id).sort((a, b) => a.order_number - b.order_number);
      const usedExerciseIds = new Set(dayExercises.map((exercise) => exercise.exercise_id));
      let daySeconds = estimateStrengthSeconds(dayExercises.map((exercise) => ({ sets: exercise.sets, restSeconds: exercise.rest_seconds })));

      const rowsToInsert = dayExercises.map((exercise) => {
        if (!stagnantExerciseIds.includes(exercise.exercise_id)) {
          return { exercise_id: exercise.exercise_id, sets: exercise.sets, repetitions: exercise.repetitions, rest_seconds: exercise.rest_seconds, order_number: exercise.order_number, progression_level: exercise.progression_level };
        }
        if (exercise.progression_level === 0) {
          const currentName = catalogById.get(exercise.exercise_id)?.name;
          const group = currentName ? eligibleByName.get(currentName)?.primaryMuscle : null;
          const extraSeconds = 45 + exercise.rest_seconds;
          if (group && exercise.sets < 6 && (weeklySets.get(group) ?? 0) < directSetBudget(planningProfile, group) && daySeconds + extraSeconds <= planningProfile.sessionMinutes * 60) {
            weeklySets.set(group, (weeklySets.get(group) ?? 0) + 1);
            daySeconds += extraSeconds;
            workoutChangesPlanned = true;
            exerciseActions[exercise.exercise_id] = "add_set";
            return { exercise_id: exercise.exercise_id, sets: exercise.sets + 1, repetitions: exercise.repetitions, rest_seconds: exercise.rest_seconds, order_number: exercise.order_number, progression_level: 1 };
          }
        }
        if (exercise.progression_level === 1) {
          workoutChangesPlanned = true;
          exerciseActions[exercise.exercise_id] = "change_rep_range";
          return { exercise_id: exercise.exercise_id, sets: exercise.sets, repetitions: nextRepRange(exercise.repetitions), rest_seconds: exercise.rest_seconds, order_number: exercise.order_number, progression_level: 2 };
        }
        if (exercise.progression_level === 2) {
          const catalogEntry = catalogById.get(exercise.exercise_id);
          const current = catalogEntry ? eligibleByName.get(catalogEntry.name) : undefined;
          const alternativeName = (Array.isArray(catalogEntry?.alternatives) ? catalogEntry.alternatives : []).find((name): name is string => {
            if (typeof name !== "string") return false;
            const candidate = eligibleByName.get(name);
            const id = idByName.get(name);
            const movement = current && mainMovement(current.name);
            return Boolean(current && candidate && id && !usedExerciseIds.has(id) && current.primaryMuscle === candidate.primaryMuscle &&
              movement && movement === mainMovement(candidate.name) && !isTimedPrescription(candidate.name, exercise.repetitions));
          });
          const alternativeId = alternativeName ? idByName.get(alternativeName) : null;
          if (alternativeId) {
            workoutChangesPlanned = true;
            exerciseActions[exercise.exercise_id] = "substitute_exercise";
            usedExerciseIds.add(alternativeId);
            return { exercise_id: alternativeId, sets: exercise.sets, repetitions: exercise.repetitions, rest_seconds: exercise.rest_seconds, order_number: exercise.order_number, progression_level: 3 };
          }
        }
        if (!exerciseActions[exercise.exercise_id]) exerciseActions[exercise.exercise_id] = "no_further_automatic_action";
        return { exercise_id: exercise.exercise_id, sets: exercise.sets, repetitions: exercise.repetitions, rest_seconds: exercise.rest_seconds, order_number: exercise.order_number, progression_level: exercise.progression_level };
      });
      return { day, rowsToInsert };
    });
    if (workoutChangesPlanned) {
      const previousSnapshot = workoutVersion.profile_snapshot;
      const adaptations = previousSnapshot && typeof previousSnapshot === "object" && !Array.isArray(previousSnapshot)
        ? previousSnapshot.workout_adaptations : undefined;
      const { data: published, error: publishError } = await supabase.rpc("publish_adjusted_workout", {
        p_user_id: userId, p_plan_id: workoutPlan.id, p_expected_version_id: workoutVersion.id,
        p_run_id: run.id, p_profile: { ...profile, ...(adaptations !== undefined ? { workout_adaptations: adaptations } : {}) },
        p_days: preparedDays.map(({ day, rowsToInsert }) => ({ name: day.name, exercises: rowsToInsert })),
      });
      if (publishError) {
        console.error("No se pudo confirmar la publicación del ajuste de entrenamiento", publishError);
        if (nutritionAdjusted) throw new PlanAdjustmentAvailabilityError("La dieta se ha actualizado, pero no se ha podido confirmar el ajuste de entrenamiento. Comprueba ambos planes antes de repetir.");
        throw publishError;
      }
      if (published !== "published") throw new PlanAdjustmentAvailabilityError(`${nutritionAdjusted ? "La dieta se ha actualizado, pero la rutina" : "La rutina"} ha cambiado o ya no está disponible. Revisa ambos planes antes de volver a ajustar.`);
      workoutAdjusted = true;
    }
  }

  await supabase.from("plan_rule_decisions").insert([
    { generation_run_id: run.id, rule_name: "nutrition_stagnation", input_data: { direction, buckets }, output_data: nutritionResult },
    { generation_run_id: run.id, rule_name: "training_stagnation", input_data: { workoutCompliance }, output_data: { stagnantExerciseIds, exerciseActions } },
  ]);
  await supabase.from("plan_generation_runs").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", run.id);

  if (!nutritionAdjusted && !workoutAdjusted) return { adjusted: false, reason: "review_required", nutritionCompliance, workoutCompliance };
  return { adjusted: true, nutritionAdjusted, workoutAdjusted, calories: newCalories, exerciseActions };
}

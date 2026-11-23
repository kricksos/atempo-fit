import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import { AssistantChat } from "@/components/assistant-chat";
import { DashboardTabs } from "@/components/dashboard-tabs";
import { GeneratePlanButton } from "@/components/generate-plan-button";
import { NutritionPlan } from "@/components/nutrition-plan";
import { NextStepPanel, PlanReviewNotice } from "@/components/next-step-panel";
import { NutritionSummaryCard } from "@/components/nutrition-summary-card";
import { ProgressCheckinForm, type ProgressCheckinSummary, type ProgressMeasurementSummary } from "@/components/progress-checkin-form";
import { ProgressPanel } from "@/components/progress-panel";
import { ProgressReviewBanner } from "@/components/progress-review-banner";
import { ProgressSummaryCard } from "@/components/progress-summary-card";
import { ProgressWorkspace } from "@/components/progress-workspace";
import { TrainingDaysPanel } from "@/components/training-days-panel";
import { estimateStrengthSeconds } from "@/features/planning/workout-planner";
import { nutritionProgress } from "@/features/planning/nutrition-compliance";
import { WorkoutHistoryPanel } from "@/components/workout-history-panel";
import { WeeklyActivityCard } from "@/components/weekly-activity-card";
import {
  computeGamification,
  computeStreaks,
} from "@/features/gamification/xp";
import { unifiedActivityDates, weeklyActivity } from "@/features/gamification/activity";
import {
  cardioRecommendations,
  resolveCardioByWorkoutDay,
} from "@/features/planning/cardio";
import { foodAllowedForPlan } from "@/lib/food-restrictions";
import { foodRestrictionLabelsFromRestrictions } from "@/lib/food-restrictions";
import { injuryLabelsFromRestrictions } from "@/lib/injuries";
import { muscleGroupLabels, normalizeSummaryMuscle } from "@/lib/exercise-muscles";
import { getExerciseDisplayName } from "@/lib/illustration-media";
import { loadMeasurements } from "@/lib/progress-measurements-server";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { hasStrengthPerformance } from "@/lib/workout-log";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type Day = {
  id: string;
  name: string;
  exerciseCount: number | null;
  muscleSummary: string;
  estimatedMinutes?: number;
  cardio?: { key: string; title: string; modalities: string[]; modality: string; durationMinutes: number; intensity: "Suave" | "Moderada" | "Intervalos"; effort: string };
};
type Meal = {
  id: string;
  name: string;
  suggestedTime: string | null;
  targetCalories: number;
  items: Array<{
    id: string;
    name: string;
    quantityGrams: number;
    role: string;
    alternativeGroup: string | null;
    selectedFoodName?: string;
    selectedQuantityGrams?: number;
  }>;
};
type Item = {
  id: string;
  meal_id: string;
  food_id: string;
  quantity_grams: number;
  role: string;
  alternative_group: string | null;
};

export const dynamic = "force-dynamic";
const showWorkoutProgressAnalysis = false;

function nameFor(value: string) {
  return value.startsWith("Full Body")
    ? "Cuerpo completo"
    : value.startsWith("Upper")
      ? "Tren superior"
      : value.startsWith("Lower")
        ? "Tren inferior"
        : value;
}
function variantFor(value: string) {
  if (/^(Cuerpo completo|Tren superior|Tren inferior|Fuerza adaptada) \d+$/.test(value)) return "Fuerza";
  const match = value.match(/[A-Z]$/);
  return match ? `Variante ${match[0]}` : value;
}

export default async function DashboardPage() {
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user)
    return (
      <main className="grid min-h-screen place-items-center bg-[#f4f1e9] text-center text-[#18231f]">
        <div>
          <h1 className="text-3xl font-semibold">Necesitas iniciar sesión</h1>
          <Link
            href="/login"
            className="mt-6 inline-flex rounded-full bg-[#18231f] px-5 py-3 text-sm font-semibold text-white"
          >
            Ir al acceso
          </Link>
        </div>
      </main>
    );
  void trackAnalyticsEvent(auth.user.id, "dashboard_viewed");
  const db = createAdminClient();
  const now = new Date();
  const [
    { data: profile, error: profileError },
    { data: activePlan },
    { data: nutrition },
    measurements,
    { data: checkinRows, error: checkinsError },
  ] = await Promise.all([
    db
      .from("profiles")
      .select(
        "primary_goal, experience, training_place, current_weight_kg, target_weight_kg, created_at, food_restrictions, restrictions, diet_preference, meals_out_slots, nutrition_plan_review_needed, workout_plan_review_needed",
      )
      .eq("user_id", auth.user.id)
      .maybeSingle(),
    db
      .from("workout_plans")
      .select("id, name")
      .eq("user_id", auth.user.id)
      .eq("active", true)
      .maybeSingle(),
    db
      .from("nutrition_plans")
      .select("id")
      .eq("user_id", auth.user.id)
      .eq("active", true)
      .maybeSingle(),
    loadMeasurements(db, auth.user.id),
    db
      .from("progress_checkins")
      .select("checked_in_at, energy_score, sleep_score, stress_score, soreness_score, training_adherence, nutrition_adherence, pain_present, pain_area, pain_severity, notes")
      .eq("user_id", auth.user.id)
      .order("checked_in_at", { ascending: false })
      .limit(30),
  ]);
  if (profileError) throw profileError;
  if (checkinsError) throw checkinsError;
  const checkins = (checkinRows ?? []) as ProgressCheckinSummary[];
  const latestCheckin = checkins[0] ?? null;
  const cardioPlan = cardioRecommendations(
    typeof profile?.primary_goal === "string" ? profile.primary_goal : "",
    typeof profile?.experience === "string" ? profile.experience : "",
    profile?.training_place ?? null,
  );
  const { data: cardioPreferences, error: cardioPreferencesError } = await db
    .from("cardio_preferences")
    .select("session_key, workout_day_id, modality, duration_minutes, intensity, enabled")
    .eq("user_id", auth.user.id);
  if (cardioPreferencesError) throw cardioPreferencesError;
  const plan =
    activePlan ??
    (
      await db
        .from("workout_plans")
        .select("id, name")
        .eq("user_id", auth.user.id)
        .is("hidden_at", null)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    ).data;
  let days: Day[] = [];
  let completedCount = 0;
  let completedToday = false;
  let planProfileSnapshot: Record<string, unknown> | null = null;
  if (plan) {
    const activeVersion = await db
      .from("workout_plan_versions")
      .select("id, profile_snapshot")
      .eq("workout_plan_id", plan.id)
      .eq("active", true)
      .maybeSingle();
    const version =
      activeVersion.data ??
      (
        await db
          .from("workout_plan_versions")
          .select("id, profile_snapshot")
          .eq("workout_plan_id", plan.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()
      ).data;
    if (version) {
      planProfileSnapshot =
        version.profile_snapshot && typeof version.profile_snapshot === "object"
          ? (version.profile_snapshot as Record<string, unknown>)
          : null;
      const { data: savedDays } = await db
        .from("workout_days")
        .select("id, name")
        .eq("workout_plan_version_id", version.id)
        .order("order_number");
      const cardioSchedule = resolveCardioByWorkoutDay(
        cardioPlan,
        (savedDays ?? []).map((day) => day.id),
        cardioPreferences ?? [],
      );
      const ids = savedDays?.map((day) => day.id) ?? [];
      const { data: exerciseRows, error: exerciseRowsError } = await db
        .from("workout_exercises")
        .select("workout_day_id, sets, rest_seconds, exercises(primary_muscle)")
        .in("workout_day_id", ids);
      if (exerciseRowsError) console.error("No se pudieron cargar los ejercicios de la rutina", exerciseRowsError);
      days = (savedDays ?? []).map((day, index) => {
        const configuredCardio = cardioSchedule[index];
        const dayExercises = (exerciseRows ?? []).filter((row) => row.workout_day_id === day.id);
        const muscles = muscleGroupLabels([...new Set(dayExercises.flatMap((row) =>
          row.exercises?.primary_muscle ? [normalizeSummaryMuscle(row.exercises.primary_muscle)] : []))]);
        const missingMuscle = dayExercises.some((row) => !row.exercises?.primary_muscle);
        const muscleSummary = exerciseRowsError ? "No se pudieron cargar los músculos" : muscles.length
          ? [...muscles, ...(missingMuscle ? ["Algún músculo sin clasificar"] : [])].join(" · ")
          : dayExercises.length ? "Músculos sin clasificar" : "Sin ejercicios";
        return {
          id: day.id,
          name: day.name,
          exerciseCount: exerciseRowsError ? null : dayExercises.length,
          estimatedMinutes: dayExercises.length ? Math.ceil(estimateStrengthSeconds(dayExercises.map((row) => ({ sets: row.sets, restSeconds: row.rest_seconds }))) / 60) : undefined,
          muscleSummary,
          cardio: configuredCardio
            ? {
                key: configuredCardio.key,
                title: configuredCardio.title,
                modalities: configuredCardio.modalities,
                modality: configuredCardio.modalities[0],
                durationMinutes: configuredCardio.durationMinutes,
                intensity: configuredCardio.intensity,
                effort: configuredCardio.effort,
              }
            : undefined,
        };
      });
      const { data: sessions } = await db
        .from("workout_sessions")
        .select("completed_at")
        .eq("user_id", auth.user.id)
        .eq("completed", true)
        .in("workout_day_id", ids)
        .order("completed_at", { ascending: false });
      // El ciclo avanza por sesiones completadas, no por semana natural.
      completedCount = sessions?.length ?? 0;
      completedToday =
        sessions?.[0]?.completed_at?.slice(0, 10) ===
        now.toISOString().slice(0, 10);
    }
  }
  let nutritionVersion: {
    id: string;
    calories: number;
    protein_grams: number;
    carbs_grams: number;
    fats_grams: number;
    meal_count: number;
  } | null = null;
  let meals: Meal[] = [];
  let foodIds: Record<string, string> = {};
  let todayMealIds: string[] = [];
  let completedDates: string[] = [];
  if (nutrition) {
    const { data: version } = await db
      .from("nutrition_plan_versions")
      .select(
        "id, calories, protein_grams, carbs_grams, fats_grams, meal_count",
      )
      .eq("nutrition_plan_id", nutrition.id)
      .eq("active", true)
      .maybeSingle();
    nutritionVersion = version;
    if (version) {
      const [{ data: foods }, { data: savedMeals }] = await Promise.all([
        db.from("foods_catalog").select("id, name"),
        db
          .from("nutrition_meals")
          .select("id, name, suggested_time, target_calories")
          .eq("nutrition_plan_version_id", version.id)
          .order("meal_order"),
      ]);
      const foodMap = Object.fromEntries(
        (foods ?? []).map((food) => [food.id, food.name]),
      );
      foodIds = Object.fromEntries(
        (foods ?? []).map((food) => [food.name, food.id]),
      );
      const mealIds = savedMeals?.map((meal) => meal.id) ?? [];
      const { data: savedItems } = await db
        .from("nutrition_meal_items")
        .select("id, meal_id, food_id, quantity_grams, role, alternative_group")
        .in("meal_id", mealIds);
      const items = (savedItems ?? []) as Item[];
      const itemIds = items.map((item) => item.id);
      const { data: selections } = itemIds.length
        ? await db
            .from("nutrition_item_selections")
            .select("meal_item_id, selected_food_id, quantity_grams")
            .eq("user_id", auth.user.id)
            .in("meal_item_id", itemIds)
        : { data: [] };
      const selectionByItemId = new Map(
        (selections ?? []).map((selection) => [
          selection.meal_item_id,
          selection,
        ]),
      );
      meals = (savedMeals ?? []).map((meal) => ({
        id: meal.id,
        name: meal.name,
        suggestedTime: meal.suggested_time,
        targetCalories: meal.target_calories,
        items: items
          .filter((item) => item.meal_id === meal.id)
          .map((item) => {
            const selection = selectionByItemId.get(item.id);
            return {
              id: item.id,
              name: foodMap[item.food_id] ?? "Alimento",
              quantityGrams: item.quantity_grams,
              role: item.role,
              alternativeGroup: item.alternative_group,
              selectedFoodName: selection
                ? foodMap[selection.selected_food_id]
                : undefined,
              selectedQuantityGrams: selection?.quantity_grams,
            };
          }),
      }));
      const { data: completions } = await db
        .from("nutrition_meal_completions")
        .select("meal_id, completed_on")
        .eq("user_id", auth.user.id);
      const today = new Date().toISOString().slice(0, 10);
      ({ todayMealIds, completedDates } = nutritionProgress(completions ?? [], mealIds, today));
    }
  }
  const scheduled = days.length ? days[completedCount % days.length] : null;
  const scheduledIndex = scheduled
    ? days.findIndex((day) => day.id === scheduled.id)
    : 0;
  const accountName =
    typeof auth.user.user_metadata?.name === "string"
      ? auth.user.user_metadata.name
      : "Mi cuenta";
  const foodRestrictions = Array.isArray(profile?.food_restrictions)
    ? profile.food_restrictions.filter(
        (restriction): restriction is string => typeof restriction === "string",
      )
    : [];
  const dietPreference =
    typeof profile?.diet_preference === "string"
      ? profile.diet_preference
      : "Omnívoro";
  const alternatives = {
    carb_base: [
      "Arroz cocido",
      "Pasta cocida",
      "Patata cocida",
      "Boniato cocido",
      "Quinoa cocida",
      "Cuscús cocido",
      "Tortitas de arroz",
    ],
    protein: [
      "Pechuga de pollo",
      "Pavo",
      "Ternera magra",
      "Salmón",
      "Atún al natural",
      "Tofu firme",
      "Tempeh",
      "Huevos",
      "Lentejas cocidas",
      "Garbanzos cocidos",
      "Yogur griego",
      "Skyr natural",
    ],
    vegetable: [
      "Brocoli",
      "Espinaca",
      "Calabacín",
      "Judías verdes",
      "Zanahoria",
      "Tomate",
      "Champiñones",
      "Espárragos",
    ],
    fat: [
      "Aceite de oliva",
      "Aguacate",
      "Almendras",
      "Crema de cacahuete",
      "Semillas de chía",
    ],
    fruit: ["Platano", "Manzana", "Naranja", "Kiwi", "Frutos rojos", "Piña"],
  };
  const safeAlternatives = Object.fromEntries(
    Object.entries(alternatives).map(([group, foods]) => [
      group,
      foods.filter((food) =>
        foodAllowedForPlan(food, foodRestrictions, dietPreference),
      ),
    ]),
  ) as Record<string, string[]>;
  const { data: loggedSessions } = showWorkoutProgressAnalysis ? await db
    .from("workout_sessions")
    .select("id, completed_at")
    .eq("user_id", auth.user.id)
    .eq("completed", true)
    .order("completed_at", { ascending: true })
    .limit(200) : { data: [] };
  const loggedSessionIds = (loggedSessions ?? []).map((session) => session.id);
  const { data: allLogs } = loggedSessionIds.length
    ? await db
        .from("exercise_logs")
        .select("workout_session_id, exercise_id, weight_kg, repetitions, duration_seconds")
        .in("workout_session_id", loggedSessionIds)
        .eq("completed", true)
    : { data: [] };
  const strengthLogs = (allLogs ?? []).filter(hasStrengthPerformance);
  const sessionDateById = new Map(
    (loggedSessions ?? []).map((session) => [
      session.id,
      session.completed_at ?? "",
    ]),
  );
  const exerciseIdsWithLogs = [
    ...new Set(strengthLogs.map((log) => log.exercise_id)),
  ];
  const { data: exerciseNames } = exerciseIdsWithLogs.length
    ? await db
        .from("exercises")
        .select("id, name, muscle_groups")
        .in("id", exerciseIdsWithLogs)
    : { data: [] };
  const exerciseMetaById = new Map(
    (exerciseNames ?? []).map((exercise) => [
      exercise.id,
      {
        name: getExerciseDisplayName(exercise.name),
        muscleGroups: Array.isArray(exercise.muscle_groups)
          ? exercise.muscle_groups.filter(
              (group): group is string => typeof group === "string",
            )
          : [],
      },
    ]),
  );
  const bestSetBySession = new Map<
    string,
    Map<string, { weightKg: number | null; reps: number | null; date: string }>
  >();
  for (const log of strengthLogs) {
    const sessionsForExercise =
      bestSetBySession.get(log.exercise_id) ??
      new Map<
        string,
        { weightKg: number | null; reps: number | null; date: string }
      >();
    const existing = sessionsForExercise.get(log.workout_session_id);
    if (!existing || (log.weight_kg ?? 0) > (existing.weightKg ?? 0))
      sessionsForExercise.set(log.workout_session_id, {
        weightKg: log.weight_kg,
        reps: log.repetitions,
        date: sessionDateById.get(log.workout_session_id) ?? "",
      });
    bestSetBySession.set(log.exercise_id, sessionsForExercise);
  }
  const exerciseProgress = [...bestSetBySession.entries()]
    .map(([exerciseId, sessionsMap]) => {
      const ordered = [...sessionsMap.values()].sort((a, b) =>
        a.date.localeCompare(b.date),
      );
      const latest = ordered[ordered.length - 1] ?? null;
      const previous = ordered.length > 1 ? ordered[ordered.length - 2] : null;
      const exerciseMeta = exerciseMetaById.get(exerciseId);
      return {
        exerciseId,
        name: exerciseMeta?.name ?? "Ejercicio",
        latestWeightKg: latest?.weightKg ?? null,
        latestReps: latest?.reps ?? null,
        previousWeightKg: previous?.weightKg ?? null,
        sessionsLogged: ordered.length,
        muscleGroups: exerciseMeta?.muscleGroups ?? [],
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  const measurementEntries =
    (measurements ?? []).length > 0
      ? (measurements ?? []).map((entry) => ({
          id: entry.id,
          measuredAt: entry.measured_at,
          weightKg: entry.weight_kg,
          waistCm: entry.waist_cm,
          chestCm: entry.chest_cm,
          armCm: entry.arm_cm,
          thighCm: entry.thigh_cm,
        }))
      : profile?.current_weight_kg
        ? [
            {
              id: "onboarding",
              measuredAt: (profile.created_at ?? now.toISOString()).slice(
                0,
                10,
              ),
              weightKg: profile.current_weight_kg,
              waistCm: null,
              chestCm: null,
              armCm: null,
              thighCm: null,
            },
          ]
        : [];
  const sortedMeasurements = [...measurementEntries].sort((a, b) =>
    a.measuredAt.localeCompare(b.measuredAt),
  );
  const firstMeasurement = sortedMeasurements[0] ?? null;
  const latestMeasurement =
    sortedMeasurements[sortedMeasurements.length - 1] ?? null;
  const displayedPrimaryGoal =
    typeof profile?.primary_goal === "string" && profile.primary_goal.trim()
      ? profile.primary_goal
      : typeof planProfileSnapshot?.primary_goal === "string"
        ? planProfileSnapshot.primary_goal
        : "";
  const displayedTargetWeightKg =
    profile?.target_weight_kg ??
    (typeof planProfileSnapshot?.target_weight_kg === "number"
      ? planProfileSnapshot.target_weight_kg
      : null);
  const weightDelta =
    firstMeasurement && latestMeasurement && sortedMeasurements.length > 1
      ? latestMeasurement.weightKg - firstMeasurement.weightKg
      : 0;
  const lastMeasuredAt = latestMeasurement?.measuredAt ?? null;
  const daysSinceLastMeasurement = lastMeasuredAt
    ? Math.floor(
        (now.getTime() - new Date(`${lastMeasuredAt}T00:00:00Z`).getTime()) /
          86400000,
      )
    : null;
  const { count: workoutSessionsCount } = await db
    .from("workout_sessions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", auth.user.id)
    .eq("completed", true);
  const activityDates = unifiedActivityDates([
    ...(loggedSessions ?? []).map((session) => [(session.completed_at ?? "").slice(0, 10)]),
    (measurements ?? []).map((entry) => entry.measured_at),
    completedDates,
  ]);
  const { current: currentStreak, best: bestStreak } =
    computeStreaks(activityDates);
  const weeklyProgress = weeklyActivity(activityDates);
  const gamification = computeGamification({
    workoutSessionsCount: workoutSessionsCount ?? 0,
    measurementsCount: (measurements ?? []).length,
    bodyMeasurementsCount: (measurements ?? []).filter((entry) => entry.waist_cm !== null || entry.chest_cm !== null || entry.arm_cm !== null || entry.thigh_cm !== null).length,
    nutritionDaysCount: completedDates.length,
    bestStreak,
    weightDeltaKg: sortedMeasurements.length > 1 ? weightDelta : null,
    targetSet: displayedTargetWeightKg !== null,
    targetReached: displayedTargetWeightKg !== null && latestMeasurement !== null && Math.abs(latestMeasurement.weightKg - displayedTargetWeightKg) <= 0.5,
    weeklyActiveDays: weeklyProgress.current.activeDays,
    completedWeeklyGoals: weeklyProgress.completedWeeks,
  });
  const notices = [
    scheduled && !completedToday ? { id: `workout-${scheduled.id}`, title: "Tu siguiente paso", message: `Hoy toca ${nameFor(scheduled.name)}. Completa la sesión para mantener tu ritmo.`, href: `/workout/${scheduled.id}`, actionLabel: "Comenzar sesión" } : null,
    !weeklyProgress.current.completed ? { id: `weekly-${weeklyProgress.current.weekStart}-${weeklyProgress.current.activeDays}`, title: "Tu objetivo semanal", message: `Llevas ${weeklyProgress.current.activeDays} de ${weeklyProgress.current.targetDays} días activos esta semana.`, href: "/dashboard", actionLabel: "Ver progreso" } : { id: `weekly-complete-${weeklyProgress.current.weekStart}`, title: "Objetivo semanal conseguido", message: "Has completado tu objetivo de actividad de esta semana. +100 XP.", href: "/achievements", actionLabel: "Ver progreso" },
    daysSinceLastMeasurement === null || daysSinceLastMeasurement >= 14 ? { id: `measurement-${daysSinceLastMeasurement ?? "none"}`, title: "Tu evolución te espera", message: daysSinceLastMeasurement === null ? "Aún no has registrado tu peso." : `Han pasado ${daysSinceLastMeasurement} días desde tu último registro.`, href: "/dashboard?tab=progress", actionLabel: "Actualizar progreso" } : null,
    profile?.nutrition_plan_review_needed || profile?.workout_plan_review_needed ? { id: "plan-review", title: "Tu plan necesita una revisión", message: "Tus datos han cambiado y podemos adaptar tu rutina o tu dieta.", href: "/checkin", actionLabel: "Revisar mi plan" } : null,
  ].filter((notice): notice is NonNullable<typeof notice> => Boolean(notice));
  const planReviewPending = Boolean(profile?.nutrition_plan_review_needed || profile?.workout_plan_review_needed || (daysSinceLastMeasurement !== null && daysSinceLastMeasurement >= 14));
  const planReviewIsStale = !profile?.nutrition_plan_review_needed && !profile?.workout_plan_review_needed && daysSinceLastMeasurement !== null && daysSinceLastMeasurement >= 14;
  const planReviewMessage = profile?.nutrition_plan_review_needed && profile?.workout_plan_review_needed
    ? "Tus intolerancias y lesiones han cambiado. Revísalas antes de empezar la siguiente sesión."
    : profile?.nutrition_plan_review_needed
      ? "Tus intolerancias o alergias han cambiado. Revisa tu dieta antes de continuar."
      : profile?.workout_plan_review_needed
        ? "Tus lesiones o molestias han cambiado. Revisa tu rutina antes de continuar."
        : planReviewIsStale
          ? `Han pasado ${daysSinceLastMeasurement} días desde tu último registro. Actualiza tu evolución para seguir ajustando el plan con datos recientes.`
          : undefined;
  const planReviewHref = planReviewIsStale ? "/dashboard?tab=progress" : profile?.nutrition_plan_review_needed && !profile?.workout_plan_review_needed ? "/checkin?mode=nutrition" : profile?.workout_plan_review_needed && !profile?.nutrition_plan_review_needed ? "/checkin?mode=workout" : "/checkin";
  const planReviewAction = planReviewIsStale ? "Actualizar evolución" : "Revisar mi plan";
  const nextStepProps = {
    completedToday,
    workoutLabel: scheduled ? nameFor(scheduled.name) : null,
    workoutHref: scheduled ? `/workout/${scheduled.id}` : null,
    workoutDetails: scheduled ? { day: scheduledIndex + 1, days: days.length, variant: variantFor(scheduled.name), muscles: scheduled.muscleSummary, exerciseCount: scheduled.exerciseCount, estimatedMinutes: scheduled.estimatedMinutes } : null,
    hasProfile: Boolean(profile),
  };
  const nextStep = <NextStepPanel {...nextStepProps} />;
  const overview = <>
    <div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
      {nextStep}
      <WeeklyActivityCard {...weeklyProgress.current} currentStreak={currentStreak} />
    </div>
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {nutritionVersion ? <NutritionSummaryCard calories={nutritionVersion.calories} proteinGrams={nutritionVersion.protein_grams} carbsGrams={nutritionVersion.carbs_grams} fatsGrams={nutritionVersion.fats_grams} mealIds={meals.map((meal) => meal.id)} todayCompletedMealIds={todayMealIds} completedDates={completedDates} /> : <section className="rounded-[1.75rem] border border-[#d8e6e3] bg-white p-6 sm:p-7"><p className="text-sm text-[#526e69]">Nutrición diaria</p><h2 className="mt-2 text-2xl font-semibold">Pendiente</h2></section>}
      <ProgressSummaryCard currentWeightKg={latestMeasurement?.weightKg ?? null} startingWeightKg={firstMeasurement?.weightKg ?? null} targetWeightKg={displayedTargetWeightKg} weightDeltaKg={sortedMeasurements.length > 1 ? weightDelta : null} daysSinceLastMeasurement={daysSinceLastMeasurement} primaryGoal={displayedPrimaryGoal} />
    </div>
  </>;
  const training = (
    <>
      <TrainingDaysPanel
        days={days}
        scheduledId={scheduled?.id ?? null}
        scheduledIndex={scheduledIndex}
        completedToday={completedToday}
        nameFor={nameFor}
        variantFor={variantFor}
        cardioPreferences={cardioPreferences ?? []}
        additionalSuggestions={days.length ? cardioPlan.slice(days.length) : []}
        defaultCardio={cardioPlan[0] ?? null}
      />
    </>
  );
  const nutritionView = nutritionVersion ? (
    <NutritionPlan
      key={meals.map((meal) => meal.id).join(":")}
      foodIds={foodIds}
      mealCount={nutritionVersion.meal_count}
      reference={{ calories: nutritionVersion.calories, proteinGrams: nutritionVersion.protein_grams, carbsGrams: nutritionVersion.carbs_grams, fatsGrams: nutritionVersion.fats_grams }}
      todayCompletedMealIds={todayMealIds}
      completedDates={completedDates}
      meals={meals}
      alternatives={safeAlternatives}
      mealsOutSlots={
        Array.isArray(profile?.meals_out_slots)
          ? profile.meals_out_slots.filter(
              (slot): slot is string => typeof slot === "string",
            )
          : []
      }
    />
  ) : (
    <div>
      <GeneratePlanButton />
    </div>
  );
  const progressFormProps = {
    latestCheckin,
    initialTargetWeightKg: profile?.target_weight_kg ?? null,
    latestMeasurement: latestMeasurement as ProgressMeasurementSummary | null,
    previousMeasurement: firstMeasurement && latestMeasurement && firstMeasurement.id !== latestMeasurement.id ? sortedMeasurements[sortedMeasurements.length - 2] as ProgressMeasurementSummary : null,
    primaryGoal: displayedPrimaryGoal,
    activeInjuries: injuryLabelsFromRestrictions(profile?.restrictions).filter((value) => value !== "Ninguna"),
    activeFoodRestrictions: foodRestrictionLabelsFromRestrictions(profile?.food_restrictions).filter((value) => value !== "Ninguna"),
  };
  const progress = <ProgressWorkspace
    entries={measurementEntries}
    checkins={checkins}
    measurementForm={<ProgressCheckinForm {...progressFormProps} mode="measurements" />}
    wellnessForm={<ProgressCheckinForm {...progressFormProps} mode="wellness" />}
    analysis={<><ProgressReviewBanner /><ProgressPanel key={displayedTargetWeightKg ?? "no-target"} entries={measurementEntries} targetWeightKg={displayedTargetWeightKg} primaryGoal={displayedPrimaryGoal} daysSinceLastMeasurement={daysSinceLastMeasurement} /></>}
  />;
  return (
    <main className="min-h-screen bg-[#f4f6f8] px-5 py-6 text-[#172f3b] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[1320px]">
        <AppHeader
          variant="dashboard"
          email={auth.user.email ?? ""}
          name={accountName}
          gamification={{ ...gamification, currentStreak, bestStreak }}
          notices={notices}
        />
        <section className="mt-7">
          <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#08786f]"><span className="size-2 rounded-full bg-[#08786f]" /> Tu espacio de progreso</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Tu ritmo. Tu progreso.</h1>
            <p className="mt-2 text-sm leading-6 text-[#667d88]">Todo lo que necesitas para seguir avanzando, en un solo lugar.</p></div>
            <span className="rounded-full border border-[#e0e7eb] bg-white px-4 py-2 text-xs font-semibold text-[#536e7a]">Tu semana, de un vistazo</span></div>
          <DashboardTabs
            overview={overview}
            trainingStep={<NextStepPanel {...nextStepProps} compact />}
            reviewNotice={planReviewPending ? <PlanReviewNotice message={planReviewMessage} href={planReviewHref} action={planReviewAction} /> : null}
            training={
              <>
                {training}
                {showWorkoutProgressAnalysis && <WorkoutHistoryPanel exerciseProgress={exerciseProgress} />}
              </>
            }
            nutrition={nutritionView}
            progress={progress}
          />
        </section>
      </div>
      <AssistantChat />
    </main>
  );
}

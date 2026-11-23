import { redirect } from "next/navigation";

import { ManualWorkoutBuilder } from "@/components/manual-workout-builder";
import { getWorkoutTemplateCatalogs } from "@/lib/manual-exercise-catalog-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { summarizeDraftDays, summarizePlanDays, workoutMuscleLookup } from "@/lib/workout-card-summary";
import { reviewWorkoutTemplate, workoutTemplates } from "@/lib/workout-templates";
import { workoutTemplateToken } from "@/lib/workout-template-token";

export default async function WorkoutBuilderPage({ searchParams }: { searchParams: Promise<{ setup?: string }> }) {
  const { setup } = await searchParams;
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) redirect("/login");
  const db = createAdminClient();
  const planSelection = "id, name, source, updated_at, is_favorite, workout_plan_versions(id, active, workout_days(id, name, order_number, workout_exercises(exercise_id, order_number, sets, rest_seconds)))";
  const [catalogs, profileResult, activeResult, archivedResult, draftsResult, favoriteExercises, favoriteTemplates] = await Promise.all([
    getWorkoutTemplateCatalogs(),
    db.from("profiles").select("experience, training_continuity, training_technique, training_place, training_equipment, restrictions, days_per_week, session_duration_minutes").eq("user_id", auth.user.id).maybeSingle(),
    db.from("workout_plans").select(planSelection).eq("user_id", auth.user.id).eq("active", true).eq("workout_plan_versions.active", true).maybeSingle(),
    db.from("workout_plans").select(planSelection).eq("user_id", auth.user.id).eq("active", false).is("hidden_at", null).in("source", ["manual", "copied"]).eq("workout_plan_versions.active", true).order("updated_at", { ascending: false }),
    db.from("manual_workout_drafts").select("id, name, updated_at, is_favorite, manual_workout_draft_days(id, name, order_number, manual_workout_draft_exercises(exercise_id, order_number, sets, rest_seconds)), nonempty_days:manual_workout_draft_days!inner(id, manual_workout_draft_exercises!inner(id))").eq("user_id", auth.user.id).is("published_at", null).order("updated_at", { ascending: false }),
    db.from("favorite_exercises").select("exercise_id").eq("user_id", auth.user.id),
    db.from("favorite_workout_templates").select("template_id").eq("user_id", auth.user.id),
  ]);
  if (activeResult.error || archivedResult.error || draftsResult.error || profileResult.error || favoriteExercises.error || favoriteTemplates.error) {
    console.error("No se pudieron cargar las rutinas manuales", activeResult.error ?? archivedResult.error ?? draftsResult.error ?? profileResult.error ?? favoriteExercises.error ?? favoriteTemplates.error);
    throw new Error("No hemos podido cargar tus rutinas y borradores.");
  }
  const exercises = catalogs.manual;
  const muscleLookup = workoutMuscleLookup(exercises.catalog, exercises.exerciseDetails);
  const activePlan = activeResult.data;
  const manualActivePlan = activePlan && activePlan.source !== "auto" ? activePlan : null;
  const routines = [
    ...(manualActivePlan ? [{ id: manualActivePlan.id, name: manualActivePlan.name, updatedAt: manualActivePlan.updated_at, active: true, favorite: manualActivePlan.is_favorite, days: summarizePlanDays(manualActivePlan.workout_plan_versions, muscleLookup) }] : []),
    ...(archivedResult.data ?? []).map((plan) => ({ id: plan.id, name: plan.name, updatedAt: plan.updated_at, active: false, favorite: plan.is_favorite, days: summarizePlanDays(plan.workout_plan_versions, muscleLookup) })),
  ];
  const drafts = (draftsResult.data ?? []).map((draft) => ({
    id: draft.id, name: draft.name, updatedAt: draft.updated_at, favorite: draft.is_favorite,
    days: summarizeDraftDays(draft.manual_workout_draft_days, muscleLookup),
  }));
  const templates = workoutTemplates.map((template) => {
    const review = reviewWorkoutTemplate(template, profileResult.data, catalogs.planning, [...exercises.catalog, ...exercises.exerciseDetails]);
    return { template: review.template, issues: review.issues, warnings: review.warnings, reviewToken: workoutTemplateToken(review) };
  });
  return <ManualWorkoutBuilder key={setup ?? "editor"} {...exercises} templates={templates} activeRoutine={activePlan ? { name: activePlan.name, automatic: activePlan.source === "auto", days: summarizePlanDays(activePlan.workout_plan_versions, muscleLookup) } : null} routines={routines} drafts={drafts} favoriteExerciseIds={favoriteExercises.data.map((item) => item.exercise_id)} favoriteTemplateIds={favoriteTemplates.data.map((item) => item.template_id)} />;
}
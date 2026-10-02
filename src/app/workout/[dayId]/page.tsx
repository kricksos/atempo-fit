import { notFound, redirect } from "next/navigation";

import { WorkoutPlayerRebuilt } from "@/components/workout-player-rebuilt";
import { cardioByWorkoutDay, cardioRecommendations } from "@/features/planning/cardio";
import { localExerciseMedia as exerciseMedia } from "@/lib/local-exercise-media";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ dayId: string }> };
type PreviousLog = { exerciseId: string; setNumber: number; weightKg: number; repetitions: number };

export default async function WorkoutDayPage({ params }: Props) {
  const { dayId } = await params;
  const authClient = await createClient();
  const { data: authData } = await authClient.auth.getUser();
  if (!authData.user) redirect("/login");

  const client = createAdminClient();
  const { data: day } = await client.from("workout_days").select("id, name, order_number, workout_plan_version_id").eq("id", dayId).single();
  const { data: version } = day ? await client.from("workout_plan_versions").select("workout_plan_id").eq("id", day.workout_plan_version_id).single() : { data: null };
  const { data: plan } = version ? await client.from("workout_plans").select("user_id").eq("id", version.workout_plan_id).single() : { data: null };
  if (!day || plan?.user_id !== authData.user.id) notFound();
  const [{ data: profile }, { data: versionDays }, { data: cardioPreference }] = await Promise.all([
    client.from("profiles").select("primary_goal, experience").eq("user_id", authData.user.id).single(),
    client.from("workout_days").select("id").eq("workout_plan_version_id", day.workout_plan_version_id),
    client.from("cardio_preferences").select("modality, duration_minutes, intensity, enabled").eq("user_id", authData.user.id).eq("workout_day_id", day.id).maybeSingle(),
  ]);
  const recommendation = cardioByWorkoutDay(cardioRecommendations(profile?.primary_goal ?? "", profile?.experience ?? ""), versionDays?.length ?? 0)[day.order_number - 1];
  const cardio = cardioPreference?.enabled === false ? null : recommendation || cardioPreference ? {
    modality: cardioPreference?.modality ?? recommendation?.modalities[0] ?? "Cardio",
    durationMinutes: cardioPreference?.duration_minutes ?? recommendation?.durationMinutes ?? 20,
    intensity: cardioPreference?.intensity ?? recommendation?.intensity ?? "Suave",
  } : null;
  const { data: completedDaySession } = await client.from("workout_sessions").select("completed_at").eq("user_id", authData.user.id).eq("workout_day_id", day.id).eq("completed", true).order("completed_at", { ascending: false }).limit(1).maybeSingle();
  if (completedDaySession?.completed_at?.slice(0, 10) === new Date().toISOString().slice(0, 10)) redirect("/dashboard");

  const { data: workoutExercises } = await client.from("workout_exercises").select("exercise_id, sets, repetitions, rest_seconds, order_number").eq("workout_day_id", day.id).order("order_number");
  const exerciseIds = workoutExercises?.map((exercise) => exercise.exercise_id) ?? [];
  const { data: catalog } = exerciseIds.length > 0 ? await client.from("exercises").select("id, name, image_start_url, image_end_url, media_source").in("id", exerciseIds) : { data: [] };
  const exercises = (workoutExercises ?? []).map((exercise) => {
    const catalogExercise = (catalog ?? []).find((item) => item.id === exercise.exercise_id);
    const name = catalogExercise?.name ?? "Ejercicio";
    const trustedDatabaseMedia = catalogExercise?.media_source === "free-exercise-db" && catalogExercise.image_start_url && catalogExercise.image_end_url && catalogExercise.image_start_url !== catalogExercise.image_end_url
      ? [catalogExercise.image_start_url, catalogExercise.image_end_url] as [string, string]
      : null;
    return { id: exercise.exercise_id, name, sets: exercise.sets, repetitions: exercise.repetitions, restSeconds: exercise.rest_seconds, media: exerciseMedia[name] ?? trustedDatabaseMedia };
  });
  const { data: previousSession } = await client.from("workout_sessions").select("id").eq("user_id", authData.user.id).eq("workout_day_id", day.id).eq("completed", true).order("completed_at", { ascending: false }).limit(1).maybeSingle();
  const { data: previousLogs } = previousSession ? await client.from("exercise_logs").select("exercise_id, set_number, weight_kg, repetitions").eq("workout_session_id", previousSession.id).order("set_number") : { data: [] };
  const lastPerformance: PreviousLog[] = (previousLogs ?? []).map((log) => ({ exerciseId: log.exercise_id, setNumber: log.set_number, weightKg: log.weight_kg ?? 0, repetitions: log.repetitions }));

  const workoutTitle = cardio ? `${day.name} · Cardio: ${cardio.modality} ${cardio.durationMinutes} min (${cardio.intensity.toLowerCase()})` : day.name;
  return <WorkoutPlayerRebuilt workoutDayId={day.id} workoutName={workoutTitle} exercises={exercises} lastPerformance={lastPerformance} />;
}

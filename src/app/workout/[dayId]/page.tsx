import { notFound, redirect } from "next/navigation";

import { WorkoutPlayerRebuilt } from "@/components/workout-player-rebuilt";
import { NavigationLink } from "@/components/navigation-control";
import { cardioRecommendations, resolveCardioByWorkoutDay } from "@/features/planning/cardio";
import { getExerciseDisplayName, getExerciseIllustration } from "@/lib/illustration-media";
import { getExerciseMedia } from "@/lib/local-exercise-media";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ dayId: string }> };
type PreviousLog = { exerciseId: string; setNumber: number; weightKg: number; repetitions: number; durationSeconds: number | null };

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
  const [{ data: profile, error: profileError }, { data: versionDays, error: daysError }, { data: cardioPreferences, error: cardioError }] = await Promise.all([
    client.from("profiles").select("primary_goal, experience, training_place").eq("user_id", authData.user.id).maybeSingle(),
    client.from("workout_days").select("id").eq("workout_plan_version_id", day.workout_plan_version_id).order("order_number"),
    client.from("cardio_preferences").select("session_key, workout_day_id, modality, duration_minutes, intensity, enabled").eq("user_id", authData.user.id),
  ]);
  if (profileError) throw profileError;
  if (daysError) throw daysError;
  if (cardioError) throw cardioError;
  const dayIds = (versionDays ?? []).map((item) => item.id);
  const cardio = resolveCardioByWorkoutDay(cardioRecommendations(profile?.primary_goal ?? "", profile?.experience ?? "", profile?.training_place ?? null), dayIds, cardioPreferences ?? [])[dayIds.indexOf(day.id)];
  const { data: completedDaySession } = await client.from("workout_sessions").select("completed_at").eq("user_id", authData.user.id).eq("workout_day_id", day.id).eq("completed", true).order("completed_at", { ascending: false }).limit(1).maybeSingle();
  if (completedDaySession?.completed_at?.slice(0, 10) === new Date().toISOString().slice(0, 10)) redirect("/dashboard");

  const { data: workoutExercises, error: exercisesError } = await client.from("workout_exercises").select("exercise_id, sets, repetitions, rest_seconds, order_number").eq("workout_day_id", day.id).order("order_number");
  if (exercisesError) throw exercisesError;
  if (!workoutExercises?.length) return <main className="grid min-h-screen place-items-center bg-[#f4f1e9] px-6 text-[#18231f]"><div className="max-w-lg text-center"><h1 className="text-3xl font-semibold">Este entrenamiento no tiene ejercicios.</h1><p className="mt-4 text-[#68736b]">Revisa tu rutina antes de comenzar.</p><NavigationLink href="/dashboard" kind="dashboard" className="mt-6">Volver al dashboard</NavigationLink></div></main>;
  const exerciseIds = workoutExercises?.map((exercise) => exercise.exercise_id) ?? [];
  const { data: catalog, error: catalogError } = exerciseIds.length > 0 ? await client.from("exercises").select("id, name").in("id", exerciseIds) : { data: [], error: null };
  if (catalogError) throw catalogError;
  const exercises = (workoutExercises ?? []).map((exercise) => {
    const catalogExercise = (catalog ?? []).find((item) => item.id === exercise.exercise_id);
    const name = getExerciseDisplayName(catalogExercise?.name ?? "Ejercicio");
    return { id: exercise.exercise_id, name, sets: exercise.sets, repetitions: exercise.repetitions, restSeconds: exercise.rest_seconds, media: getExerciseMedia(name), illustration: Boolean(getExerciseIllustration(name)) };
  });
  const { data: previousSession } = await client.from("workout_sessions").select("id").eq("user_id", authData.user.id).eq("workout_day_id", day.id).eq("completed", true).order("completed_at", { ascending: false }).limit(1).maybeSingle();
  const { data: previousLogs, error: logsError } = previousSession ? await client.from("exercise_logs").select("exercise_id, set_number, weight_kg, repetitions, duration_seconds").eq("workout_session_id", previousSession.id).order("set_number") : { data: [], error: null };
  if (logsError) throw logsError;
  const lastPerformance: PreviousLog[] = (previousLogs ?? []).map((log) => ({ exerciseId: log.exercise_id, setNumber: log.set_number, weightKg: log.weight_kg ?? 0, repetitions: log.repetitions, durationSeconds: log.duration_seconds }));

  const workoutTitle = cardio ? `${day.name} · Cardio adicional: ${cardio.modalities[0]} ${cardio.durationMinutes} min (${cardio.intensity.toLowerCase()}; no se registra aquí)` : day.name;
  return <WorkoutPlayerRebuilt workoutDayId={day.id} workoutName={workoutTitle} exercises={exercises} lastPerformance={lastPerformance} />;
}

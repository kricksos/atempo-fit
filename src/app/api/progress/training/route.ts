import { NextResponse } from "next/server";

import { muscleGroupLabels, normalizeSummaryMuscle } from "@/lib/exercise-muscles";
import { getExerciseDisplayName } from "@/lib/illustration-media";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { TrainingLog, TrainingSession } from "@/lib/training-progress";

const pageSize = 500;
const batchSize = 100;

export async function GET() {
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Necesitas iniciar sesión." }, { status: 401 });

  const db = createAdminClient();
  const now = new Date();
  const start = new Date(now.getTime() - 12 * 7 * 86400000).toISOString();
  try {
    const sessions: TrainingSession[] = [];
    for (let offset = 0; ; offset += pageSize) {
      const { data, error } = await db.from("workout_sessions")
        .select("id, completed_at, duration_minutes")
        .eq("user_id", auth.user.id).eq("completed", true)
        .gte("completed_at", start).lte("completed_at", now.toISOString())
        .order("id").range(offset, offset + pageSize - 1);
      if (error) throw error;
      for (const session of data) {
        if (session.completed_at) sessions.push({ id: session.id, completedAt: session.completed_at, durationMinutes: session.duration_minutes, logs: [] });
      }
      if (data.length < pageSize) break;
    }

    const logs: Array<{ id: string; workout_session_id: string; exercise_id: string; set_number: number; weight_kg: number | null; repetitions: number; duration_seconds: number | null }> = [];
    const sessionIds = sessions.map((session) => session.id);
    for (let index = 0; index < sessionIds.length; index += batchSize) {
      const batch = sessionIds.slice(index, index + batchSize);
      for (let offset = 0; ; offset += pageSize) {
        const { data, error } = await db.from("exercise_logs")
          .select("id, workout_session_id, exercise_id, set_number, weight_kg, repetitions, duration_seconds")
          .in("workout_session_id", batch).eq("completed", true)
          .order("id").range(offset, offset + pageSize - 1);
        if (error) throw error;
        logs.push(...data);
        if (data.length < pageSize) break;
      }
    }

    const exerciseIds = [...new Set(logs.map((log) => log.exercise_id))];
    const exercises = new Map<string, { name: string; muscle: string | null }>();
    for (let index = 0; index < exerciseIds.length; index += batchSize) {
      const { data, error } = await db.from("exercises").select("id, name, primary_muscle").in("id", exerciseIds.slice(index, index + batchSize));
      if (error) throw error;
      for (const exercise of data) {
        exercises.set(exercise.id, {
          name: getExerciseDisplayName(exercise.name),
          muscle: exercise.primary_muscle ? muscleGroupLabels([normalizeSummaryMuscle(exercise.primary_muscle)])[0] : null,
        });
      }
    }

    const sessionMap = new Map(sessions.map((session) => [session.id, session]));
    for (const log of logs) {
      const exercise = exercises.get(log.exercise_id);
      const entry: TrainingLog = {
        id: log.id, exerciseId: log.exercise_id, name: exercise?.name ?? "Ejercicio no disponible",
        muscle: exercise?.muscle ?? null, setNumber: log.set_number,
        weightKg: log.weight_kg, repetitions: log.repetitions, durationSeconds: log.duration_seconds,
      };
      sessionMap.get(log.workout_session_id)?.logs.push(entry);
    }
    for (const session of sessions) session.logs.sort((a, b) => a.name.localeCompare(b.name, "es") || a.setNumber - b.setNumber);
    return NextResponse.json({ asOf: now.toISOString(), sessions }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("No se pudo cargar la evolución de entrenamiento", error);
    return NextResponse.json({ error: "No hemos podido cargar tu evolución de entrenamiento. Inténtalo de nuevo." }, { status: 500 });
  }
}

"use client";

import { WorkoutPlayerRebuilt, type WorkoutExercise, type WorkoutSessionRequest } from "@/components/workout-player-rebuilt";

async function simulateSession(request: WorkoutSessionRequest): Promise<Response> {
  if (request.action === "start") return Response.json({ sessionId: "sesion-ejemplo" });
  if (request.action === "save") return Response.json({ saved: true });
  return Response.json({ completed: true, recordExerciseIds: [], streak: 0 });
}

export function WorkoutDemo({ exercises }: { exercises: WorkoutExercise[] }) {
  return <>
    <div role="note" className="border-b border-[#d6e5e2] bg-[#edf7f4] px-5 py-3 text-center text-sm text-[#315d59]"><strong>Entrenamiento de ejemplo.</strong> Puedes probar todo el recorrido; no se inicia ni se guarda ninguna sesión real.</div>
    <WorkoutPlayerRebuilt mode="preview" requestSession={simulateSession} workoutDayId="dia-ejemplo" workoutName="Fuerza · cuerpo completo (ejemplo)" exercises={exercises} lastPerformance={[
      { exerciseId: "sentadilla-ejemplo", setNumber: 1, weightKg: 20, repetitions: 10, durationSeconds: null },
      { exerciseId: "sentadilla-ejemplo", setNumber: 2, weightKg: 20, repetitions: 10, durationSeconds: null },
    ]} />
  </>;
}

import { z } from "zod";
import type { GeneratedPlan, WorkoutAdaptation } from "@/features/planning/engine";

const proposalSchema = z.object({
  structure: z.string().min(1),
  days: z.array(z.object({
    name: z.string().min(1),
    exercises: z.array(z.object({
      name: z.string().min(1), sets: z.number().int().positive(),
      repetitions: z.string().min(1), restSeconds: z.number().int().nonnegative(),
    })).min(1),
  })).min(1),
});

export type AdaptationProposal = { adaptations: WorkoutAdaptation[]; adaptationToken: string; structure: string; days: GeneratedPlan["days"] };

export function WorkoutAdaptationNotice({ adaptations, proposal }: { adaptations: WorkoutAdaptation[]; proposal?: Pick<AdaptationProposal, "structure" | "days"> }) {
  if (!adaptations.length) return null;
  const days = adaptations.filter((item) => "dayIndex" in item);
  const coverage = adaptations.filter((item) => item.kind === "coverage");
  const reviews = adaptations.filter((item) => item.kind === "review");
  return (
    <section className="w-full rounded-2xl border border-[#dcc996] bg-[#fff9e9] p-5 text-left text-[#504326]" aria-label="Rutina adaptada">
      <h2 className="font-semibold">Revisa la rutina propuesta</h2>
      {days.length > 0 && <><p className="mt-2 text-sm leading-6">No se han podido cubrir todos los movimientos previstos con tu tiempo, material, nivel y restricciones. Estos días necesitan revisión y no son equivalentes a una rutina completa.</p>
      <ul className="mt-3 space-y-2 text-sm">
        {days.map((day) => (
          <li key={day.dayIndex}><strong>Día {day.dayIndex} · {day.dayName}:</strong> {day.actualExercises} de {day.plannedExercises} ejercicios. Plazas sin cubrir: {day.unfilled.join(", ")}.</li>
        ))}
      </ul></>}
      {coverage.map((item) => <p key={item.missingGroups.join(",")} className="mt-3 text-sm leading-6"><strong>Sin ejercicio principal programado para:</strong> {item.missingGroups.join(", ")}. Estos músculos pueden intervenir de forma secundaria en otros movimientos. El tiempo, material y restricciones limitan la selección.</p>)}
      {reviews.flatMap((item) => item.reasons).map((reason) => <p key={reason} className="mt-3 text-sm leading-6">{reason}</p>)}
      {proposal && <div className="mt-4 border-t border-[#dcc996] pt-4">
        <p className="font-semibold">{proposal.structure}</p>
        {proposal.days.map((day, index) => <div key={index} className="mt-3 text-sm">
          <p className="font-semibold">Día {index + 1} · {day.name}</p>
          <ul className="mt-1 list-disc pl-5">{day.exercises.map((exercise, exerciseIndex) =>
            <li key={`${exercise.name}-${exerciseIndex}`}>{exercise.name} · {exercise.sets} series · {exercise.repetitions} · {exercise.restSeconds} s descanso</li>)}</ul>
        </div>)}
      </div>}
      <p className="mt-3 text-sm leading-6">Revisa el material indicado o consulta a un profesional para completar la rutina, especialmente si tienes lesiones o molestias.</p>
    </section>
  );
}

export function adaptationsFromSnapshot(snapshot: unknown): WorkoutAdaptation[] {
  if (!snapshot || typeof snapshot !== "object" || !("workout_adaptations" in snapshot)) return [];
  const value = snapshot.workout_adaptations;
  if (Array.isArray(value) && value.every((day) => day && typeof day === "object" && (day.kind === "coverage"
    ? Array.isArray(day.missingGroups) && day.missingGroups.length > 0 && day.missingGroups.every((group: unknown) => typeof group === "string" && group.length > 0)
    : day.kind === "review"
      ? Array.isArray(day.reasons) && day.reasons.length > 0 && day.reasons.every((reason: unknown) => typeof reason === "string" && reason.length > 0)
      : (day.kind === undefined || day.kind === "day") &&
        Number.isInteger(day.dayIndex) && day.dayIndex > 0 && typeof day.dayName === "string" &&
        Number.isInteger(day.plannedExercises) && Number.isInteger(day.actualExercises) &&
        day.actualExercises > 0 && day.plannedExercises > day.actualExercises &&
        Array.isArray(day.unfilled) && day.unfilled.length === day.plannedExercises - day.actualExercises &&
        day.unfilled.every((group: unknown) => typeof group === "string" && group.length > 0)))) return value;
  console.error("La versión de entrenamiento contiene avisos de adaptación no válidos.");
  return [];
}

export function adaptationProposalFromResponse(data: unknown): AdaptationProposal | null {
  if (!data || typeof data !== "object" || !("action" in data) || data.action !== "adaptation_required") return null;
  if (!("adaptationToken" in data) || typeof data.adaptationToken !== "string" || !/^[a-f0-9]{64}$/.test(data.adaptationToken) || !("adaptations" in data)) {
    throw new Error("No hemos podido interpretar la propuesta de rutina adaptada.");
  }
  const adaptations = adaptationsFromSnapshot({ workout_adaptations: data.adaptations });
  if (!adaptations.length) throw new Error("No hemos podido interpretar la propuesta de rutina adaptada.");
  const proposal = proposalSchema.safeParse(data);
  if (!proposal.success) throw new Error("No hemos podido interpretar los ejercicios de la propuesta.");
  return { adaptations, adaptationToken: data.adaptationToken, ...proposal.data };
}

import { Check } from "lucide-react";
import Link from "next/link";

import { CardioDayControl } from "@/components/cardio-day-control";
import type { CardioPreference, CardioRecommendation } from "@/features/planning/cardio";

export type TrainingDay = {
  id: string;
  name: string;
  exerciseCount: number | null;
  muscleSummary: string;
  estimatedMinutes?: number;
  cardio?: CardioRecommendation & { modality: string };
};

type TrainingDaysPanelProps = {
  days: TrainingDay[];
  scheduledId: string | null;
  scheduledIndex: number;
  completedToday: boolean;
  nameFor: (value: string) => string;
  variantFor: (value: string) => string;
  cardioPreferences: CardioPreference[];
  additionalSuggestions: CardioRecommendation[];
  defaultCardio: CardioRecommendation | null;
  preview?: boolean;
};

export function TrainingDaysPanel({ days, scheduledId, scheduledIndex, completedToday, nameFor, variantFor, cardioPreferences, additionalSuggestions, defaultCardio, preview = false }: TrainingDaysPanelProps) {
  return (
    <section className="rounded-[1.5rem] border border-[#e1e7eb] bg-white p-4 shadow-[0_12px_36px_rgba(19,43,57,0.05)] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h3 className="text-lg font-semibold">Días de entrenamiento</h3><p className="mt-1 text-sm text-[#68736b]">Tu ciclo semanal para completar paso a paso.</p></div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#819078]">{days.length} días</p>
      </div>
      {days.length === 0 ? <p className="mt-4 text-sm text-[#68736b]">Todavía no tienes una rutina activa. Genera tu plan para ver tus días aquí.</p> : <>
        <div className="mt-4 space-y-3">
          {days.map((day, index) => {
            const isNext = day.id === scheduledId;
            const isCompleted = index < scheduledIndex;
            const isLocked = isNext && completedToday;
            const preference = cardioPreferences.find((item) => item.workout_day_id === day.id) ?? null;
            const cardio = day.cardio ?? null;
            return (
              <article key={day.id} className={`rounded-2xl border p-4 sm:p-5 ${isCompleted ? "border-[#ded5ed] bg-[#faf8fd]" : isLocked ? "border-[#e1e7eb] bg-[#f7f9fa]" : isNext ? "border-[#9ed6cd] bg-[#f6fbfa]" : "border-[#e8edef] bg-white"}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] ${isCompleted ? "text-[#674b8a]" : "text-[#819078]"}`}>{isCompleted ? <><Check size={13} /> Día {index + 1} de {days.length} · Completado</> : isLocked ? `Día ${index + 1} de ${days.length} · Disponible mañana` : isNext ? `Día ${index + 1} de ${days.length} · Toca ahora` : `Día ${index + 1} de ${days.length} · Próximamente`}</p>
                    <h2 className="mt-1 text-xl font-semibold">{nameFor(day.name)}</h2>
                    <p className="mt-1 text-sm text-[#68736b]">{variantFor(day.name)} · {day.exerciseCount === null ? "Ejercicios no disponibles" : `${day.exerciseCount} ejercicios`}{day.estimatedMinutes ? ` · ${day.estimatedMinutes} min de fuerza aprox.` : ""}</p>
                    <p className="mt-3 text-xs font-semibold text-[#68736b]">Músculos principales</p>
                    <div className="mt-1 flex flex-wrap gap-1.5">{day.muscleSummary.split(" · ").map((tag, tagIndex) => <span key={tag} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${tagIndex === 0 ? "bg-[#e7eef0] text-[#3f6068]" : "bg-[#f0e9da] text-[#7a6335]"}`}>{tag}</span>)}</div>
                  </div>
                  {isCompleted ? <span className="rounded-full bg-[#694a98] px-4 py-2 text-sm font-semibold text-white">Completado</span> : isLocked ? <span className="rounded-full border border-[#d3dbcf] px-4 py-2 text-sm font-semibold text-[#a2aaa2]">Disponible mañana</span> : isNext ? <Link href={`/workout/${day.id}`} className="inline-flex min-h-10 items-center rounded-full bg-[#145257] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#103e43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f] motion-safe:transition-[background-color,box-shadow,translate,scale] motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-[0_8px_18px_rgba(24,35,31,0.2)] motion-safe:active:scale-[0.98]">Comenzar</Link> : <span className="rounded-full border border-[#d3dbcf] px-4 py-2 text-sm font-semibold text-[#819078]">En cola</span>}
                </div>
                <CardioDayControl key={JSON.stringify([day.id, cardio, preference, cardio || preference ? null : defaultCardio])} dayId={day.id} dayLabel={`día ${index + 1}`} recommendation={cardio} defaultRecommendation={defaultCardio} preference={preference} preview={preview} />
              </article>
            );
          })}
        </div>
        <div className="mt-4 rounded-2xl border border-[#d7e9e4] bg-white px-4 py-3 text-xs leading-5 text-[#526e69]">
          <p>El tiempo de fuerza es una estimación con calentamiento y descansos; puede variar. El cardio es adicional y puedes hacerlo en otro momento. Completar la fuerza no registra el cardio.</p>
          <p className="mt-2">La rutina es orientativa y no sustituye una valoración profesional, especialmente si tienes lesiones o molestias.</p>
          <p className="mt-2">Las sesiones son un orden, no días fijos del calendario. Distribúyelas con descanso suficiente, especialmente si trabajan músculos que se repiten.</p>
          {additionalSuggestions.length > 0 && <p className="mt-2">También puedes hacer fuera de los días de fuerza: {additionalSuggestions.map((item) => `${item.title.toLowerCase()}, ${item.durationMinutes} min (${item.intensity.toLowerCase()})`).join("; ")}.</p>}
          <details className="mt-2"><summary className="cursor-pointer font-semibold text-[#17655f]">Más sobre el cardio semanal</summary><p className="mt-2">Como referencia general para adultos, se recomiendan 150 minutos semanales de actividad moderada o 75 de vigorosa; también cuenta la actividad fuera de Atempo Fit. Cualquier cantidad adaptada a tus posibilidades suma. Empieza de forma gradual y consulta a un profesional si tienes lesiones o dudas.</p></details>
        </div>
      </>}
    </section>
  );
}

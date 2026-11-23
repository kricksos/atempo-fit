"use client";

import type { ReactNode } from "react";
import { ArrowRight, Check, ChevronLeft, Clock3, Dumbbell, LoaderCircle, RotateCcw, Trophy } from "lucide-react";
import { NavigationLink } from "@/components/navigation-control";
import { WorkoutCountdown } from "@/components/workout-countdown";
import type { PreviousLog, SetLog, WorkoutExercise } from "@/components/workout-player-rebuilt";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9df0dc]";
const navigation = "border-transparent bg-transparent px-0 text-[#c5d8df] shadow-none hover:border-transparent hover:bg-transparent hover:text-white focus-visible:outline-[#20b9a2]";

function OrbitHeader() {
  return <header className="border-b border-white/10 px-5 sm:px-8"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 py-4">
    <NavigationLink href="/dashboard" kind="back" className={navigation}>Volver al dashboard</NavigationLink>
    <span className="shrink-0 text-sm font-bold tracking-tight">atempo<span className="text-[#9df0dc]">.</span> fit</span>
  </div></header>;
}

export function OrbitSession({ workoutName, exercise, activeIndex, exerciseCount, progress, prescription, timed, previousLogs, sets, media, onUpdateSet, onPrevious, onNext, onComplete, isBusy, savedMessage, error }: {
  workoutName: string;
  exercise: WorkoutExercise;
  activeIndex: number;
  exerciseCount: number;
  progress: number;
  prescription: string;
  timed: boolean;
  previousLogs: PreviousLog[];
  sets: SetLog[];
  media: ReactNode;
  onUpdateSet: <K extends keyof SetLog>(index: number, field: K, value: SetLog[K]) => void;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  isBusy: boolean;
  savedMessage: string | null;
  error: string | null;
}) {
  const targetValues = prescription.match(/\d+/g)?.map(Number);
  const targetSeconds = targetValues?.length ? Math.max(...targetValues) : null;
  const isPlank = /\bplancha\b/i.test(exercise.name);
  return <main className="min-h-screen overflow-hidden bg-[#0c202a] text-white">
    <OrbitHeader />
    <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute -right-36 top-0 size-[32rem] rounded-full border border-[#76cfc2]/10 shadow-[0_0_0_5rem_rgba(112,207,194,0.025),0_0_0_10rem_rgba(112,207,194,0.02)]" />
      <div className="relative mb-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9df0dc]">Sesión en curso</p><p className="mt-2 break-words text-sm text-[#a3bdc3]">{workoutName}</p></div>
          <span className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-[#bdd4d6]">Ejercicio {activeIndex + 1} de {exerciseCount}</span>
        </div>
        <div aria-label={`Ejercicio ${activeIndex + 1} de ${exerciseCount}`} className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#9df0dc] transition-all motion-reduce:transition-none" style={{ width: `${progress}%` }} /></div>
      </div>
      <div className="relative grid items-start gap-6 lg:grid-cols-[1fr_1fr] lg:gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#18313c] shadow-[0_25px_80px_rgba(0,0,0,0.25)]">
          {media}
          <div className="p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9df0dc]">Ejercicio {String(activeIndex + 1).padStart(2, "0")}</p>
            <h1 className="mt-3 break-words text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{exercise.name}</h1>
            <div className="mt-5 flex flex-wrap gap-2 text-sm text-[#c8dfdf]">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"><Dumbbell size={15} aria-hidden="true" /> {exercise.sets} {exercise.sets === 1 ? "serie" : "series"} · {prescription}{timed ? "" : " repeticiones"}</span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2"><Clock3 size={15} aria-hidden="true" /> Descanso: {exercise.restSeconds} s</span>
            </div>
          </div>
        </section>
        <section className="rounded-[2rem] border border-white/10 bg-[#142d38] p-5 shadow-[0_25px_80px_rgba(0,0,0,0.15)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9df0dc]">Tu entrenamiento</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Registra tus series</h2>
          <p className="mt-3 text-sm leading-6 text-[#b8ced1]">{timed ? "Si quieres, anota los segundos que hayas realizado en cada serie. Es opcional: el temporizador no los registra automáticamente." : "Ajusta el peso y las repeticiones a lo que hagas en cada serie."}</p>
          {!isPlank && <div className="mt-5"><WorkoutCountdown key={exercise.id} kind="rest" durationSeconds={exercise.restSeconds} />{Number.isInteger(exercise.restSeconds) && exercise.restSeconds > 0 && exercise.restSeconds <= 3600 && <p className="mt-2 text-xs leading-5 text-[#a9c2c8]">Inícialo manualmente al terminar una serie.</p>}</div>}
          {previousLogs.length > 0 && <div className="mt-5 rounded-2xl border border-[#9df0dc]/20 bg-[#9df0dc]/5 px-4 py-3 text-sm leading-6 text-[#c5dddd]"><span className="font-semibold text-[#9df0dc]">Última vez:</span> {previousLogs.map((log) => timed ? `${log.durationSeconds} s` : `${log.weightKg} kg × ${log.repetitions}`).join(" · ")}</div>}
          <div className="mt-5 space-y-3">{sets.map((set, index) => <div key={`${exercise.id}-${index}`} className="rounded-2xl border border-white/10 bg-[#1a3742] p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-2"><span className="text-sm font-semibold">Serie {index + 1}</span><span className="text-xs text-[#a9c2c8]">Objetivo · {prescription}{timed ? "" : " reps"}</span></div>
            {timed ? <div className="space-y-4">
              <WorkoutCountdown kind="exercise" durationSeconds={targetSeconds} setNumber={index + 1} />
              <label className="block text-xs font-medium text-[#a9c2c8]">Segundos realizados <span className="text-[#c5dddd]">(opcional)</span><input aria-label={`Segundos realizados, serie ${index + 1}`} type="number" min="1" max="3600" value={set.durationSeconds ?? ""} onChange={(event) => onUpdateSet(index, "durationSeconds", event.target.value === "" ? null : Number(event.target.value))} className={`mt-2 block min-h-12 w-28 rounded-xl border border-white/15 bg-[#0c202a] px-3 text-base text-white ${focus}`} /></label>
            </div> : <div className="grid grid-cols-2 gap-3">
              <label className="text-xs font-medium text-[#a9c2c8]">Peso (kg)<input aria-label={`Peso en kg, serie ${index + 1}`} type="number" min="0" value={set.weightKg || ""} onChange={(event) => onUpdateSet(index, "weightKg", Number(event.target.value))} className={`mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#0c202a] px-3 text-base text-white ${focus}`} /></label>
              <label className="text-xs font-medium text-[#a9c2c8]">Repeticiones<input aria-label={`Repeticiones, serie ${index + 1}`} type="number" min="0" value={set.repetitions} onChange={(event) => onUpdateSet(index, "repetitions", Number(event.target.value))} className={`mt-2 min-h-12 w-full rounded-xl border border-white/15 bg-[#0c202a] px-3 text-base text-white ${focus}`} /></label>
            </div>}
          </div>)}</div>
          {savedMessage && <p className="mt-4 text-sm font-medium text-[#a8d7ce]">{savedMessage}</p>}
          {error && <p role="alert" className="mt-4 rounded-xl border border-[#efb4a1]/35 bg-[#913d30]/20 px-4 py-3 text-sm text-[#ffd4c7]">{error}</p>}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onClick={onPrevious} disabled={activeIndex === 0 || isBusy} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold text-[#d9efed] hover:bg-white/10 disabled:opacity-40 ${focus}`}><ChevronLeft size={17} aria-hidden="true" /> Anterior</button>
            <button type="button" onClick={activeIndex < exerciseCount - 1 ? onNext : onComplete} disabled={isBusy} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#9df0dc] px-5 text-sm font-bold text-[#103c3b] hover:bg-[#c4ffef] disabled:opacity-60 ${focus}`}>{isBusy && <LoaderCircle size={17} className="animate-spin" aria-hidden="true" />}{activeIndex < exerciseCount - 1 ? "Siguiente ejercicio" : "Finalizar entrenamiento"} <ArrowRight size={17} aria-hidden="true" /></button>
          </div>
        </section>
      </div>
    </div>
  </main>;
}

export function OrbitCompletion({ duration, exerciseCount, preview, recordNames, streak }: { duration: number | null; exerciseCount: number; preview: boolean; recordNames: string[]; streak: number }) {
  return <main className="min-h-screen overflow-hidden bg-[#0c202a] text-white">
    <OrbitHeader />
    <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl place-items-center px-5 py-12 sm:px-8">
      <div aria-hidden="true" className="pointer-events-none absolute size-[26rem] rounded-full border border-[#76cfc2]/15 shadow-[0_0_0_4rem_rgba(112,207,194,0.035),0_0_0_8rem_rgba(112,207,194,0.02)]" />
      <section className="relative w-full max-w-xl rounded-[2rem] border border-white/10 bg-[#18313c] p-6 text-center shadow-[0_25px_80px_rgba(0,0,0,0.3)] sm:p-10">
        <span className="mx-auto grid size-16 place-items-center rounded-full border border-[#9df0dc]/30 bg-[#9df0dc]/10 text-[#9df0dc]"><Trophy size={29} aria-hidden="true" /></span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#9df0dc]">Sesión completada</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Buen trabajo<span className="text-[#9df0dc]">.</span></h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-[#b8ced1]">{preview ? "Esta sesión es una muestra: no se ha guardado ningún dato." : "Tus series y los datos registrados han quedado guardados."}</p>
        {recordNames.length > 0 && <div className="mt-6 rounded-2xl border border-[#9df0dc]/20 bg-[#9df0dc]/5 p-4 text-left"><p className="text-sm font-bold text-[#9df0dc]">Nuevo récord personal</p><p className="mt-2 text-sm leading-6 text-[#c5dddd]">Has superado tu mejor peso en {recordNames.join(", ")}.</p></div>}
        {streak > 0 && <div className="mt-4 rounded-2xl border border-[#9df0dc]/20 bg-[#9df0dc]/5 p-4 text-left"><p className="text-sm font-bold text-[#9df0dc]">Racha actual: {streak} {streak === 1 ? "día" : "días"}</p><p className="mt-2 text-sm leading-6 text-[#c5dddd]">Cada sesión suma constancia a tu progreso.</p></div>}
        <div className="mt-7 grid grid-cols-2 gap-3 text-left">
          <div className="rounded-2xl border border-white/10 bg-[#102833] p-4"><p className="text-xs uppercase tracking-[0.12em] text-[#9bb7bc]">Duración</p><p className="mt-2 text-2xl font-semibold">{duration} <span className="text-sm font-normal text-[#bdd4d6]">min</span></p></div>
          <div className="rounded-2xl border border-white/10 bg-[#102833] p-4"><p className="text-xs uppercase tracking-[0.12em] text-[#9bb7bc]">Ejercicios</p><p className="mt-2 flex items-center gap-2 text-2xl font-semibold">{exerciseCount} <Check size={18} className="text-[#9df0dc]" aria-hidden="true" /></p></div>
        </div>
        {preview ? <a href="/preview-entrenamiento-completo" className={`mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#9df0dc] px-6 text-sm font-bold text-[#103c3b] hover:bg-[#c4ffef] ${focus}`}><RotateCcw size={16} aria-hidden="true" /> Volver al inicio de la muestra</a> : <NavigationLink href="/dashboard" kind="dashboard" className="mt-7 border-transparent bg-[#9df0dc] px-6 text-[#103c3b] shadow-none hover:border-transparent hover:bg-[#c4ffef] hover:text-[#103c3b] focus-visible:outline-[#9df0dc]">Volver al dashboard</NavigationLink>}
      </section>
    </div>
  </main>;
}

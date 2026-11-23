"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, CircleAlert, Clock3, LoaderCircle, Play } from "lucide-react";
import { ExtendedExerciseImage } from "@/components/extended-exercise-image";
import { usePrefersReducedMotion } from "@/lib/use-reduced-motion";

export type WorkoutOverviewExercise = {
  name: string;
  prescription: string;
  restSeconds: number;
  media: [string, string] | null;
  illustration: boolean;
};

const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#20b9a2]";

function QuickOverview({ exercises }: { exercises: WorkoutOverviewExercise[] }) {
  const [index, setIndex] = useState(0);
  const [manual, setManual] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const reducedMotion = usePrefersReducedMotion();
  const exercise = exercises[index];

  useEffect(() => {
    if (manual || reducedMotion || exercises.length < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % exercises.length), 3000);
    return () => window.clearInterval(timer);
  }, [manual, reducedMotion, exercises.length]);

  if (!exercise) return <p className="rounded-2xl bg-[#18313c] p-6 text-sm text-[#b8ced1]">Este entrenamiento no tiene ejercicios.</p>;

  function move(direction: number) {
    const next = (index + direction + exercises.length) % exercises.length;
    setIndex(next);
    setManual(true);
    setAnnouncement(`Ejercicio ${next + 1} de ${exercises.length}: ${exercises[next].name}. ${exercises[next].prescription}. Descanso entre series: ${exercises[next].restSeconds} segundos. Avance manual.`);
  }

  return <div role="region" aria-label="Vista rápida de los ejercicios" onFocusCapture={() => setManual(true)} className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#18313c] shadow-[0_25px_80px_rgba(0,0,0,0.3)]">
    <div className="flex items-center justify-between px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#b5cecf]"><span>Vista rápida</span><span className="text-[#9df0dc]">{String(index + 1).padStart(2, "0")} / {String(exercises.length).padStart(2, "0")}</span></div>
    <div className="relative h-64 overflow-hidden bg-[#090a0d] sm:h-80">
      {exercise.media ? <ExtendedExerciseImage key={`${index}-${exercise.media[0]}`} src={exercise.media[0]} alt={`${exercise.name}, posición inicial`} /> : <p className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-white">Demostración no disponible para este ejercicio.</p>}
    </div>
    {exercise.media && <p className="px-5 pt-3 text-[11px] leading-4 text-[#abc4c7]">{exercise.illustration ? "Ilustración orientativa con IA; no es una guía técnica." : "Demostración del movimiento."}</p>}
    <div className="px-5 pb-5 pt-4">
      <h2 className="text-2xl font-semibold">{exercise.name}</h2><p className="mt-2 text-sm text-[#b8ced1]">{exercise.prescription}</p><p className="mt-2 flex items-center gap-2 text-sm text-[#b8ced1]"><Clock3 size={15} aria-hidden="true" /> Descanso entre series: {exercise.restSeconds} s</p>
      {exercises.length > 1 && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <p className="text-xs text-[#b8ced1]">{reducedMotion ? "Movimiento reducido · avance manual" : manual ? "Avance manual · usa las flechas" : "Resumen automático"}</p>
        <div className="flex items-center gap-2">
          <button type="button" aria-label="Ejercicio anterior" onClick={() => move(-1)} className={`grid size-10 place-items-center rounded-full border border-white/20 text-white hover:bg-white/10 ${focus}`}><ChevronLeft size={18} aria-hidden="true" /></button>
          <button type="button" aria-label="Ejercicio siguiente" onClick={() => move(1)} className={`grid size-10 place-items-center rounded-full border border-white/20 text-white hover:bg-white/10 ${focus}`}><ChevronRight size={18} aria-hidden="true" /></button>
        </div>
      </div>}
    </div>
    <span className="sr-only" aria-live="polite">{announcement}</span>
  </div>;
}

export function WorkoutIntro({ workoutName, exercises, onStart, navigation, isBusy = false, error }: {
  workoutName: string;
  exercises: WorkoutOverviewExercise[];
  onStart: () => void;
  navigation: ReactNode;
  isBusy?: boolean;
  error?: string | null;
}) {
  return <main className="min-h-screen overflow-hidden bg-[#0c202a] text-white">
    <header className="border-b border-white/10 px-5 sm:px-8"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 py-4">{navigation}<span className="text-sm font-bold tracking-tight">atempo<span className="text-[#9df0dc]">.</span> fit</span></div></header>
    <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-0 size-[32rem] rounded-full border border-[#76cfc2]/10 shadow-[0_0_0_5rem_rgba(112,207,194,0.025),0_0_0_10rem_rgba(112,207,194,0.02)]" />
      <div className="relative mb-8 flex flex-wrap items-center justify-between gap-4"><p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#9df0dc]"><span className="size-2 rounded-full bg-[#9df0dc]" /> Tu sesión está lista</p><span className="rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-[#bdd4d6]">{exercises.length} {exercises.length === 1 ? "ejercicio" : "ejercicios"}</span></div>
      <div className="relative grid items-center gap-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <div><p className="break-words text-sm text-[#a3bdc3]">{workoutName}</p><h1 className="mt-4 text-4xl font-semibold leading-[1.03] tracking-[-0.06em] sm:text-6xl">Tu momento.<br /><span className="text-[#9df0dc]">Tu ritmo.</span></h1><p className="mt-5 max-w-sm text-sm leading-7 text-[#a8c0c6]">Todo preparado para comenzar. Concéntrate en el movimiento; nosotros te acompañamos serie a serie.</p>
          <aside className="mt-6 max-w-md rounded-2xl border border-[#d7a65a]/35 bg-[#a96e29]/10 p-4"><h2 className="flex items-center gap-2 text-sm font-bold text-[#ffdb9c]"><CircleAlert size={18} aria-hidden="true" /> Antes de empezar: calienta</h2><p className="mt-2 text-sm leading-6 text-[#ead8b9]">Realiza un calentamiento general y movimientos específicos. En ejercicios con carga, empieza con poco peso y auméntalo gradualmente hasta tu carga de trabajo, manteniendo una técnica controlada. Esto prepara el cuerpo y puede ayudar a reducir el riesgo de lesión.</p></aside>
          <button type="button" onClick={onStart} disabled={isBusy || exercises.length === 0} className={`mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#9df0dc] px-6 text-sm font-bold text-[#103c3b] transition hover:-translate-y-0.5 hover:bg-[#c4ffef] disabled:opacity-60 ${focus}`}>{isBusy ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Play size={16} fill="currentColor" aria-hidden="true" />} Comenzar entrenamiento <ArrowRight size={16} aria-hidden="true" /></button>
          {error && <p role="alert" className="mt-4 rounded-xl border border-[#efb4a1]/35 bg-[#913d30]/20 px-4 py-3 text-sm text-[#ffd4c7]">{error}</p>}
          <p className="mt-5 text-xs text-[#8faab0]">Registra tus series durante la sesión.</p></div>
        <QuickOverview exercises={exercises} />
      </div>
    </div>
  </main>;
}

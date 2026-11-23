"use client";

import { useState } from "react";
import Image from "next/image";
import { ExtendedExerciseImage } from "@/components/extended-exercise-image";
import {
  ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Clock3, Dumbbell, Flame, Play, Sparkles, Trophy,
} from "lucide-react";

type Stage = "before" | "active" | "finished";
type ImageMode = "extended" | "blurred";
type Media = [string, string] | null;
type SetValues = { weight: string; repetitions: string; seconds: string };

const stages: { id: Stage; label: string }[] = [
  { id: "before", label: "Antes de empezar" },
  { id: "active", label: "Durante la sesión" },
  { id: "finished", label: "Al finalizar" },
];
const imageModes: { id: ImageMode; label: string }[] = [
  { id: "extended", label: "Fondo prolongado" },
  { id: "blurred", label: "Fondo difuminado" },
];
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08786f]";

function ExerciseImage({ media, name, mode }: { media: Media; name: string; mode: ImageMode }) {
  const [failed, setFailed] = useState(false);
  return <div><div className="relative grid h-64 place-items-center overflow-hidden bg-[#090a0d] sm:h-80">
    {media && !failed ? mode === "extended" ? <ExtendedExerciseImage src={media[0]} alt={`${name}, posición inicial`} /> : <>
      <Image src={media[0]} alt="" fill unoptimized aria-hidden="true" className="scale-125 object-cover opacity-50 blur-2xl" />
      <div className="absolute inset-0 flex items-center justify-center"><Image src={media[0]} alt={`${name}, posición inicial`} width={1536} height={1152} unoptimized className="h-auto max-h-full w-auto max-w-full object-contain" style={{ maskImage: "linear-gradient(to right, transparent, black 4%, black 96%, transparent), linear-gradient(to bottom, transparent, black 4%, black 96%, transparent)", maskComposite: "intersect", WebkitMaskImage: "linear-gradient(to right, transparent, black 4%, black 96%, transparent), linear-gradient(to bottom, transparent, black 4%, black 96%, transparent)", WebkitMaskComposite: "source-in" }} onError={() => setFailed(true)} /></div>
    </> : <p className="px-6 text-center text-sm text-[#d9eae8]">Demostración no disponible para este ejercicio.</p>}
  </div><p className="bg-[#112f3c] px-4 pt-3 text-[11px] leading-4 text-[#c5d8da]">Ilustración orientativa con IA; no es una guía técnica.</p></div>;
}

export function SessionPreview({ squatMedia, plankMedia }: { squatMedia: Media; plankMedia: Media }) {
  const [stage, setStage] = useState<Stage>("active");
  const [imageMode, setImageMode] = useState<ImageMode>("extended");
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [sets, setSets] = useState<SetValues[][]>([
    Array.from({ length: 3 }, () => ({ weight: "20", repetitions: "10", seconds: "" })),
    Array.from({ length: 2 }, () => ({ weight: "", repetitions: "", seconds: "30" })),
  ]);
  const exercises = [
    { name: "Sentadilla", prescription: "3 × 10 repeticiones", rest: 90, media: squatMedia, timed: false },
    { name: "Plancha", prescription: "2 × 30 segundos", rest: 60, media: plankMedia, timed: true },
  ];
  const exercise = exercises[exerciseIndex];

  function chooseStage(next: Stage) {
    setStage(next);
    setMessage("");
  }

  function changeSet(index: number, field: keyof SetValues, value: string) {
    setSets((current) => current.map((group, groupIndex) => groupIndex === exerciseIndex ? group.map((set, setIndex) => setIndex === index ? { ...set, [field]: value } : set) : group));
  }

  return <main className="min-h-screen bg-[#f4f6f8] text-[#172f3b]">
    <div className="border-b border-[#dde5e9] bg-white px-5 py-4 sm:px-8">
      <div className="mx-auto max-w-6xl"><p className="text-xs leading-5 text-[#526a77]"><strong className="text-[#193b4a]">Propuesta de sesión.</strong> Datos ficticios: no se inicia ni se guarda ningún entrenamiento.</p>
        <div role="group" aria-label="Momentos de la sesión" className="mt-3 flex flex-wrap gap-2">{stages.map((item) => <button key={item.id} type="button" aria-pressed={stage === item.id} onClick={() => chooseStage(item.id)} className={`min-h-10 rounded-xl border px-4 py-2 text-xs font-semibold ${focus} ${stage === item.id ? "border-[#163e49] bg-[#edf4f5] text-[#163e49]" : "border-[#e1e7eb] text-[#5b707b] hover:bg-[#f7f9fa]"}`}>{item.label}</button>)}</div>
        <div role="group" aria-label="Opciones de fondo de la imagen" className="mt-3 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-semibold text-[#526a77]">Imagen:</span>{imageModes.map((item) => <button key={item.id} type="button" aria-pressed={imageMode === item.id} onClick={() => setImageMode(item.id)} className={`min-h-9 rounded-full border px-3 py-1.5 text-xs font-semibold ${focus} ${imageMode === item.id ? "border-[#08786f] bg-[#e7f6f3] text-[#08786f]" : "border-[#e1e7eb] text-[#5b707b]"}`}>{item.label}</button>)}<span className="text-xs text-[#71858e]">La opción prolongada conserva la imagen completa y estira los bordes.</span></div>
      </div>
    </div>
    <header className="border-b border-[#e1e7eb] bg-white px-5 py-4 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3"><button type="button" onClick={() => setMessage("Es una muestra: no se abandona ninguna sesión real.")} className={`inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#526e79] ${focus}`}><ArrowLeft size={16} aria-hidden="true" /> Volver al dashboard</button><div className="flex items-center gap-2 text-sm font-semibold text-[#163e49]"><span className="grid size-9 place-items-center rounded-xl bg-[#163e49] text-[#a6eee0]"><Sparkles size={16} aria-hidden="true" /></span> Atempo Fit</div></div>
    </header>
    <div className="mx-auto max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
      {message && <p role="status" className="mb-5 rounded-xl border border-[#d6e5e2] bg-white px-4 py-3 text-sm text-[#526e79]">{message}</p>}
      {stage === "before" ? <section className="grid items-center gap-8 lg:grid-cols-[1fr_0.85fr]">
        <div><p className="inline-flex items-center gap-2 rounded-full bg-[#e7f6f3] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#08786f]"><Dumbbell size={15} aria-hidden="true" /> Tu entrenamiento</p><h1 className="mt-5 text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">Cuerpo completo <span className="text-[#08786f]">· A</span></h1><p className="mt-5 max-w-lg text-base leading-7 text-[#667d88]">Tu sesión de ejemplo está lista. Revisa cada ejercicio y registra tus series a tu ritmo.</p><div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-[#526e79]"><span className="rounded-full border border-[#d6e5e2] bg-white px-3 py-2">2 ejercicios de ejemplo</span><span className="rounded-full border border-[#d6e5e2] bg-white px-3 py-2">Fuerza</span></div><button type="button" onClick={() => { setExerciseIndex(0); chooseStage("active"); }} className={`mt-8 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#163e49] px-6 text-sm font-bold text-white ${focus}`}><Play size={16} aria-hidden="true" /> Comenzar entrenamiento</button></div>
        <div className="overflow-hidden rounded-[1.75rem] bg-[#112f3c] shadow-[0_20px_50px_rgba(16,45,56,0.12)]"><ExerciseImage key="before" media={squatMedia} name="Sentadilla" mode={imageMode} /><div className="p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a6eee0]">Primer ejercicio</p><h2 className="mt-2 text-2xl font-semibold">Sentadilla</h2><p className="mt-2 text-sm text-[#c5d8da]">3 series · 10 repeticiones</p></div></div>
      </section> : stage === "active" ? <section>
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#08786f]">Cuerpo completo · A</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Tu sesión, paso a paso.</h1></div><p className="text-sm font-semibold text-[#526e79]">Ejercicio {exerciseIndex + 1} de {exercises.length}</p></div>
        <div className="mb-7 h-2 overflow-hidden rounded-full bg-[#dfe8e8]" aria-label={`Ejercicio ${exerciseIndex + 1} de ${exercises.length}`}><div className="h-full rounded-full bg-[#08786f]" style={{ width: `${((exerciseIndex + 1) / exercises.length) * 100}%` }} /></div>
        <div className="grid items-start gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="overflow-hidden rounded-[1.75rem] bg-[#112f3c] shadow-[0_20px_50px_rgba(16,45,56,0.12)]"><ExerciseImage key={exercise.name} media={exercise.media} name={exercise.name} mode={imageMode} /><div className="p-6 text-white"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a6eee0]">Ejercicio {exerciseIndex + 1} de {exercises.length}</p><h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{exercise.name}</h2><p className="mt-4 flex items-center gap-2 text-sm text-[#c5d8da]"><Clock3 size={16} aria-hidden="true" /> Descanso: {exercise.rest} s</p></div></div>
          <div className="rounded-[1.75rem] border border-[#e1e7eb] bg-white p-5 shadow-[0_12px_36px_rgba(19,43,57,0.05)] sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#08786f]">Registra tu rendimiento</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{exercise.prescription}</h2>
            {exercise.timed ? <p className="mt-3 text-sm leading-6 text-[#667d88]">Indica los segundos realizados en cada serie. El contador es orientativo y no registra el tiempo automáticamente.</p> : <div className="mt-4 rounded-xl border border-[#dce9e7] bg-[#f4faf8] px-4 py-3 text-sm text-[#526e79]"><span className="font-semibold text-[#08786f]">Última vez · ejemplo:</span> 20 kg × 10 · 20 kg × 10 · 20 kg × 10</div>}
            <div className="mt-5 space-y-3">{sets[exerciseIndex].map((set, index) => <div key={index} className="rounded-2xl border border-[#e1e7eb] bg-[#f8fafb] p-4"><p className="text-sm font-semibold text-[#375763]">Serie {index + 1}</p>{exercise.timed ? <div className="mt-3 flex flex-wrap items-end gap-3"><label className="text-xs font-semibold text-[#667d88]">Segundos realizados<input type="number" min="1" max="3600" value={set.seconds} onChange={(event) => changeSet(index, "seconds", event.target.value)} className="mt-1 block w-28 rounded-lg border border-[#d4e0e3] bg-white px-3 py-2 text-sm text-[#172f3b]" /></label><button type="button" onClick={() => setMessage("El contador no está activo en esta muestra visual.")} className={`min-h-10 rounded-lg border border-[#d4e0e3] px-3 text-sm font-semibold text-[#526e79] ${focus}`}>Iniciar contador</button></div> : <div className="mt-3 grid grid-cols-2 gap-3"><label className="text-xs font-semibold text-[#667d88]">Peso · kg<input type="number" min="0" value={set.weight} onChange={(event) => changeSet(index, "weight", event.target.value)} className="mt-1 block w-full rounded-lg border border-[#d4e0e3] bg-white px-3 py-2 text-sm text-[#172f3b]" /></label><label className="text-xs font-semibold text-[#667d88]">Repeticiones<input type="number" min="0" value={set.repetitions} onChange={(event) => changeSet(index, "repetitions", event.target.value)} className="mt-1 block w-full rounded-lg border border-[#d4e0e3] bg-white px-3 py-2 text-sm text-[#172f3b]" /></label></div>}</div>)}</div>
            <p className="mt-4 text-xs leading-5 text-[#667d88]">Los valores de esta muestra son ficticios y no se guardan.</p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3"><button type="button" disabled={exerciseIndex === 0} onClick={() => { setExerciseIndex((current) => current - 1); setMessage(""); }} className={`inline-flex min-h-11 items-center gap-1 rounded-full border border-[#d4e0e3] px-4 text-sm font-semibold text-[#526e79] disabled:opacity-40 ${focus}`}><ChevronLeft size={16} aria-hidden="true" /> Anterior</button><button type="button" onClick={() => { setMessage(""); if (exerciseIndex === exercises.length - 1) chooseStage("finished"); else setExerciseIndex((current) => current + 1); }} className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-[#163e49] px-5 text-sm font-bold text-white ${focus}`}>{exerciseIndex === exercises.length - 1 ? "Finalizar entrenamiento" : "Siguiente ejercicio"} <ChevronRight size={16} aria-hidden="true" /></button></div>
          </div>
        </div>
      </section> : <section className="mx-auto max-w-2xl text-center"><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#e9e4fa] text-[#694a98]"><Trophy size={28} aria-hidden="true" /></span><p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-[#694a98]">Finalización de ejemplo</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Buen trabajo.</h1><p className="mt-4 text-base leading-7 text-[#667d88]">Así podría verse el resumen al terminar. Esta muestra no guarda ningún entrenamiento.</p><div className="mt-7 grid grid-cols-2 gap-3 text-left"><div className="rounded-2xl border border-[#e1e7eb] bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#71858e]">Duración</p><p className="mt-2 text-xl font-semibold">35 min</p></div><div className="rounded-2xl border border-[#e1e7eb] bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#71858e]">Ejercicios</p><p className="mt-2 text-xl font-semibold">2</p></div></div><div className="mt-3 grid gap-3 text-left sm:grid-cols-2"><div className="rounded-2xl border border-[#ded5ed] bg-[#faf8fd] p-4"><p className="flex items-center gap-2 text-sm font-semibold text-[#694a98]"><Flame size={16} aria-hidden="true" /> Racha de ejemplo</p><p className="mt-2 text-sm text-[#667d88]">3 días de constancia</p></div><div className="rounded-2xl border border-[#d6e5e2] bg-white p-4"><p className="flex items-center gap-2 text-sm font-semibold text-[#08786f]"><Check size={16} aria-hidden="true" /> Récord de ejemplo</p><p className="mt-2 text-sm text-[#667d88]">Sentadilla</p></div></div><button type="button" onClick={() => chooseStage("before")} className={`mt-7 inline-flex min-h-12 items-center gap-2 rounded-full bg-[#163e49] px-6 text-sm font-bold text-white ${focus}`}>Volver al inicio de la muestra <ArrowRight size={16} aria-hidden="true" /></button></section>}
    </div>
  </main>;
}

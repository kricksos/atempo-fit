"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Dumbbell, Layers3, Play } from "lucide-react";
import { ExtendedExerciseImage } from "@/components/extended-exercise-image";
import { WorkoutIntro, type WorkoutOverviewExercise } from "@/components/workout-intro";

type Option = "enfoque" | "orbita" | "flujo";
type PreviewProps = { exercises: WorkoutOverviewExercise[] };
type DesignProps = PreviewProps & { simulate: () => void };

const options: { id: Option; name: string; detail: string }[] = [
  { id: "enfoque", name: "01 · Enfoque", detail: "Clara y equilibrada" },
  { id: "orbita", name: "02 · Órbita", detail: "Oscura y tecnológica" },
  { id: "flujo", name: "03 · Flujo", detail: "Compacta y práctica" },
];
const focus = "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#20b9a2]";

function Picture({ media, name = "Sentadilla a banco", height = "h-64 sm:h-80" }: { media: [string, string] | null; name?: string; height?: string }) {
  return <div className={`relative ${height} overflow-hidden bg-[#090a0d]`}>
    {media ? <ExtendedExerciseImage src={media[0]} alt={`${name}, posición inicial`} /> : <p className="absolute inset-0 grid place-items-center px-6 text-center text-sm text-white">Demostración no disponible para este ejercicio.</p>}
  </div>;
}

function StartButton({ simulate }: { simulate: () => void }) {
  return <button type="button" onClick={simulate} className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#163e49] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#205b65] ${focus}`}><Play size={16} fill="currentColor" aria-hidden="true" /> Comenzar entrenamiento <ArrowRight size={16} aria-hidden="true" /></button>;
}

function BackButton({ simulate, dark = false }: { simulate: () => void; dark?: boolean }) {
  return <button type="button" onClick={simulate} className={`inline-flex min-h-10 items-center gap-2 text-sm font-semibold ${focus} ${dark ? "text-[#c5d8df]" : "text-[#526d79]"}`}><ArrowLeft size={16} aria-hidden="true" /> Volver al dashboard</button>;
}

function Enfoque({ exercises, simulate }: DesignProps) {
  const media = exercises[0].media;
  return <div className="min-h-[700px] bg-[#f3f6f7] text-[#173c49]">
    <header className="border-b border-[#e1eaec] bg-white/80 px-5 sm:px-8"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 py-4"><BackButton simulate={simulate} /><span className="text-sm font-bold tracking-tight">atempo<span className="text-[#07877d]">.</span> fit</span></div></header>
    <main className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-10 sm:px-8 sm:py-16 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
      <div>
        <p className="inline-flex items-center gap-2 rounded-full bg-[#def4ee] px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-[#087e72]"><Dumbbell size={15} aria-hidden="true" /> Tu entrenamiento</p>
        <h1 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.05] tracking-[-0.06em] sm:text-6xl">Hoy toca <span className="text-[#0b9585]">moverte.</span></h1>
        <p className="mt-5 text-lg font-semibold text-[#294f5b]">Fuerza · cuerpo completo</p>
        <p className="mt-3 max-w-md text-sm leading-7 text-[#657d88]">Tu sesión está lista. Ve ejercicio a ejercicio y registra tus series a tu ritmo.</p>
        <div className="mt-7 flex flex-wrap gap-3"><span className="rounded-2xl border border-[#dce7e8] bg-white px-4 py-3 text-sm font-semibold text-[#45636d]"><Layers3 size={16} className="mr-2 inline text-[#0b9585]" aria-hidden="true" /> 6 ejercicios</span><span className="rounded-2xl border border-[#dce7e8] bg-white px-4 py-3 text-sm font-semibold text-[#45636d]"><Check size={16} className="mr-2 inline text-[#0b9585]" aria-hidden="true" /> A tu ritmo</span></div>
        <div className="mt-8"><StartButton simulate={simulate} /></div>
      </div>
      <div className="overflow-hidden rounded-[2rem] bg-[#123a43] shadow-[0_24px_70px_rgba(27,65,75,0.16)]">
        <Picture media={media} />
        <div className="px-6 pt-3 text-[11px] leading-4 text-[#b8cece]">Ilustración orientativa con IA; no es una guía técnica.</div>
        <div className="flex flex-wrap items-end justify-between gap-3 p-6 text-white"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#91e4d1]">Primer ejercicio</p><h2 className="mt-2 text-2xl font-semibold">Sentadilla a banco</h2><p className="mt-2 text-sm text-[#c5d8da]">3 series · 8–12 repeticiones</p></div><span className="grid size-10 place-items-center rounded-full border border-white/20 text-[#9df0dc]"><ArrowRight size={18} aria-hidden="true" /></span></div>
      </div>
    </main>
  </div>;
}

function Orbita({ exercises, simulate }: DesignProps) {
  return <WorkoutIntro workoutName="Fuerza · cuerpo completo" exercises={exercises} onStart={simulate} navigation={<BackButton simulate={simulate} dark />} />;
}

function Flujo({ exercises, simulate }: DesignProps) {
  const media = exercises[0].media;
  return <div className="min-h-[700px] bg-[#f3f6f7] text-[#173c49]">
    <header className="border-b border-[#e0e9eb] bg-white px-5 sm:px-8"><div className="mx-auto flex max-w-5xl items-center justify-between gap-4 py-4"><BackButton simulate={simulate} /><span className="text-sm font-bold">atempo<span className="text-[#07877d]">.</span> fit</span></div></header>
    <main className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#07877d]">Tu sesión de hoy</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Fuerza · cuerpo completo</h1><p className="mt-3 text-sm leading-6 text-[#657d88]">Todo preparado para empezar. Avanza a tu ritmo.</p></div><span className="rounded-full border border-[#dce7e8] bg-white px-4 py-2 text-xs font-bold text-[#526e79]">6 ejercicios</span></div>
      <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="overflow-hidden rounded-[1.75rem] border border-[#e0e8e9] bg-white shadow-[0_14px_40px_rgba(26,59,68,0.06)]">
          <Picture media={media} height="h-64 sm:h-72" />
          <p className="px-5 pt-3 text-[11px] leading-4 text-[#71858e]">Ilustración orientativa con IA; no es una guía técnica.</p>
          <div className="flex items-center gap-4 p-5"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e1f4ef] text-sm font-bold text-[#087e72]">01</span><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#71858e]">Primer ejercicio</p><h2 className="mt-1 text-xl font-semibold">Sentadilla a banco</h2></div></div>
        </div>
        <div className="flex flex-col rounded-[1.75rem] border border-[#e0e8e9] bg-white p-6 shadow-[0_14px_40px_rgba(26,59,68,0.06)]"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#07877d]">Antes de comenzar</p><h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Tu primer paso</h2><p className="mt-3 text-sm leading-6 text-[#657d88]">Revisa el primer ejercicio. Podrás registrar tus series y consultar los siguientes durante la sesión.</p><div className="mt-5 space-y-3 border-t border-[#e6eeee] pt-5 text-sm text-[#4c6972]"><p className="flex items-center justify-between"><span>Series</span><strong className="text-[#173c49]">3</strong></p><p className="flex items-center justify-between"><span>Repeticiones</span><strong className="text-[#173c49]">8–12</strong></p><p className="flex items-center justify-between"><span>Después</span><strong className="text-[#173c49]">5 ejercicios más</strong></p></div><div className="mt-7 lg:mt-auto lg:pt-7"><StartButton simulate={simulate} /></div></div>
      </div>
      <p className="mt-5 flex items-center gap-2 text-xs text-[#71858e]"><ChevronRight size={15} aria-hidden="true" /> Un ejercicio cada vez, a tu ritmo.</p>
    </main>
  </div>;
}

export function WorkoutStartPreview({ exercises }: PreviewProps) {
  const [option, setOption] = useState<Option>("enfoque");
  const [message, setMessage] = useState("");
  function simulate() { setMessage("Es una muestra visual: no se inicia ningún entrenamiento ni se cambian datos."); }
  const props = { exercises, simulate };

  return <div className="min-h-screen bg-white">
    <div className="border-b border-[#dce6e8] bg-white px-5 py-4 sm:px-8"><div className="mx-auto max-w-6xl">
      <p className="text-xs leading-5 text-[#526a77]"><strong className="text-[#193b4a]">Propuestas de inicio.</strong> Datos ficticios: no se inicia ni se guarda ningún entrenamiento.</p>
      <div role="group" aria-label="Diseños de inicio del entrenamiento" className="mt-3 flex flex-wrap gap-2">{options.map((item) => <button key={item.id} type="button" aria-pressed={option === item.id} onClick={() => { setOption(item.id); setMessage(""); }} className={`min-h-11 rounded-xl border px-4 py-2 text-left ${focus} ${option === item.id ? "border-[#087e72] bg-[#e8f7f3] text-[#086c64]" : "border-[#dfe8e9] text-[#526a77] hover:bg-[#f5f8f8]"}`}><span className="block text-xs font-bold">{item.name}</span><span className="mt-0.5 block text-[11px]">{item.detail}</span></button>)}</div>
      {message && <p role="status" className="mt-3 rounded-xl bg-[#edf7f4] px-4 py-3 text-sm text-[#315d59]">{message}</p>}
    </div></div>
    {option === "enfoque" ? <Enfoque {...props} /> : option === "orbita" ? <Orbita {...props} /> : <Flujo {...props} />}
  </div>;
}

"use client";

import { ArrowLeft, ArrowRight, BookOpen, Check, Clock3, Copy, Dumbbell, Layers3, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PulsoMotif, pulsoTrainingBackground } from "@/components/next-step-panel";

const choices = [
  {
    number: "01",
    title: "Rutinas preparadas",
    description: "Explora propuestas según días, nivel, lugar y material.",
    action: "Ver biblioteca",
    icon: BookOpen,
    card: "border-[#a9d8cc] bg-gradient-to-br from-[#ddf5ed] via-[#f2fbf8] to-white hover:border-[#60b39e]",
    iconTone: "bg-[#17655f] text-white",
    accent: "bg-[#38a78e]",
    textTone: "text-[#145850]",
    arrowTone: "bg-[#bfe9dc] group-hover:bg-[#a8dfcd]",
  },
  {
    number: "02",
    title: "Empezar desde cero",
    description: "Crea y gestiona todas tus rutinas manuales.",
    action: "Mis rutinas manuales",
    icon: Dumbbell,
    card: "border-[#b9cee8] bg-gradient-to-br from-[#e0edfc] via-[#f2f7fe] to-white hover:border-[#7da8d1]",
    iconTone: "bg-[#345d87] text-white",
    accent: "bg-[#669ccc]",
    textTone: "text-[#274e77]",
    arrowTone: "bg-[#cbdff5] group-hover:bg-[#b9d4f0]",
  },
  {
    number: "03",
    title: "Seleccionar para mí",
    description: "Prepara una rutina del catálogo según tu perfil.",
    action: "Generar rutina automática",
    icon: Sparkles,
    card: "border-[#e8cfaa] bg-gradient-to-br from-[#fbead4] via-[#fff8ef] to-white hover:border-[#d5a878]",
    iconTone: "bg-[#965326] text-white",
    accent: "bg-[#d89a57]",
    textTone: "text-[#86461f]",
    arrowTone: "bg-[#f3d9b8] group-hover:bg-[#eec99e]",
  },
] as const;

export function RoutineManagementPreview() {
  const [hasRoutine, setHasRoutine] = useState(true);
  const [manualWorkspace, setManualWorkspace] = useState(false);
  const [message, setMessage] = useState("");

  function showExample(action: string) {
    setMessage(`${action}: esta acción es solo una demostración y no modifica ninguna rutina.`);
  }

  return <main className="min-h-screen bg-[#f0f5f4] px-4 py-5 text-[#172d32] sm:px-8 sm:py-8">
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d6e5e2] bg-white/80 px-4 py-3 text-xs leading-5 text-[#526e69]">
        <p><strong className="text-[#24484a]">Prueba de color · Gestionar rutinas.</strong> Datos ficticios; no se guarda ni modifica nada.</p>
        <button type="button" onClick={() => { setHasRoutine(!hasRoutine); setMessage(""); }} className="min-h-10 rounded-full border border-[#bfd9d3] bg-white px-4 font-semibold text-[#17655f] hover:bg-[#eaf7f4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f]">
          {hasRoutine ? "Ver sin rutina activa" : "Ver con rutina activa"}
        </button>
      </div>

      {manualWorkspace ? <button type="button" onClick={() => { setManualWorkspace(false); setMessage(""); }} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#cfe0dd] bg-white px-4 text-sm font-semibold text-[#315d5a] hover:bg-[#e8f5f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f]"><ArrowLeft size={16} aria-hidden="true" /> Volver a gestionar rutinas</button> : <Link href="/preview-dashboard" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#cfe0dd] bg-white px-4 text-sm font-semibold text-[#315d5a] hover:bg-[#e8f5f2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f]">
        <ArrowLeft size={16} aria-hidden="true" /> Volver al dashboard de muestra
      </Link>}

      <header className="relative mt-5 overflow-hidden rounded-[2rem] p-6 text-white shadow-[0_20px_50px_rgba(16,54,58,0.16)] sm:p-9" style={{ background: pulsoTrainingBackground }}>
        <PulsoMotif />
        <div className="relative max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#a6eee0]"><Dumbbell size={16} aria-hidden="true" /> {manualWorkspace ? "Tu espacio personal" : "Tu entrenamiento"}</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">{manualWorkspace ? "Crea tu propia rutina." : "Gestiona tus rutinas."}</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#e2f0ed]">{manualWorkspace ? "Empieza desde cero o continúa con tus rutinas." : "Elige una propuesta, crea la tuya o deja que seleccionemos una para ti. Tu rutina actual no cambiará hasta activar otra."}</p>
        </div>
      </header>

      {message && <p role="status" className="mt-5 rounded-2xl border border-[#cbe4de] bg-[#e8f6f2] px-4 py-3 text-sm font-medium text-[#245c55]">{message}</p>}

      {!manualWorkspace ? <section aria-labelledby="preview-routine-choices" className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#39726e]">Tu siguiente paso</p><h2 id="preview-routine-choices" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Elige cómo empezar</h2><p className="mt-2 text-sm text-[#526e69]">Encuentra la forma de entrenar que encaja contigo.</p></div>
          <Link href="/preview-rutinas" className="inline-flex min-h-10 items-center gap-1.5 text-xs font-semibold text-[#315d5a] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f]"><Check size={15} aria-hidden="true" /> Comparar con el diseño actual</Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {choices.map(({ number, title, description, action, icon: Icon, card, iconTone, accent, textTone, arrowTone }) => <button key={title} type="button" onClick={() => { if (title === "Empezar desde cero") { setMessage(""); setManualWorkspace(true); } else showExample(title); }} className={`group relative flex min-h-60 flex-col overflow-hidden rounded-[1.5rem] border p-5 text-left shadow-[0_8px_24px_rgba(23,66,61,0.05)] transition-[border-color,box-shadow] hover:shadow-[0_16px_34px_rgba(23,66,61,0.10)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f] motion-safe:transition-transform motion-safe:hover:-translate-y-1 ${card}`}>
            <span aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
            <span className="flex items-start justify-between gap-3"><span className={`grid size-12 place-items-center rounded-2xl ${iconTone}`}><Icon size={22} aria-hidden="true" /></span><span className={`text-xs font-semibold tracking-[0.12em] ${textTone}`}>{number}</span></span>
            <span className="mt-5 block text-lg font-semibold tracking-[-0.02em]">{title}</span>
            <span className="mt-2 block text-sm leading-6 text-[#526e69]">{description}</span>
            <span className={`mt-auto flex items-center justify-between gap-3 pt-5 text-sm font-semibold ${textTone}`}><span>{action}</span><span className={`grid size-9 shrink-0 place-items-center rounded-full ${arrowTone}`}><ArrowRight size={17} aria-hidden="true" /></span></span>
          </button>)}
        </div>
      </section> : <>
        <section className="mt-6 flex flex-wrap items-center justify-between gap-5 rounded-[1.75rem] border border-[#cde4df] bg-white p-5 shadow-[0_12px_35px_rgba(23,66,61,0.05)] sm:p-6">
          <div><h2 className="text-xl font-semibold tracking-[-0.03em]">Una rutina a tu medida</h2><p className="mt-1 text-sm text-[#526e69]">Elige los días y ejercicios para crearla a tu ritmo.</p></div>
          <div className="flex flex-wrap gap-2">
            {hasRoutine && <button type="button" onClick={() => showExample("Copiar mi rutina actual")} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#bddbd4] bg-white px-4 text-sm font-semibold text-[#17655f] hover:bg-[#eaf7f4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f]"><Copy size={16} aria-hidden="true" /> Copiar mi rutina actual</button>}
            <button type="button" onClick={() => showExample("Crear rutina desde cero")} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#145257] px-5 text-sm font-semibold text-white hover:bg-[#1b6a68] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f]"><Plus size={17} aria-hidden="true" /> Crear rutina desde cero</button>
          </div>
        </section>
        <section className="mt-6 rounded-[1.75rem] border border-[#d5e6e2] bg-[#eaf6f3] p-5 sm:p-6" aria-labelledby="preview-manual-routines">
          <h2 id="preview-manual-routines" className="text-xl font-semibold">Mis rutinas manuales <span className="text-sm font-normal text-[#526e69]">· 2</span></h2>
          <p className="mt-1 text-sm text-[#526e69]">Todas tus rutinas manuales, ordenadas por la última actualización.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[{ name: "Mi rutina anterior", days: "3 días", minutes: "Hasta 45 min aprox." }, { name: "Mi borrador", days: "2 días", minutes: "Hasta 30 min aprox." }].map((routine) => <button key={routine.name} type="button" onClick={() => showExample(`Editar ${routine.name}`)} className="rounded-2xl border border-[#d5e6e2] bg-white p-4 text-left hover:border-[#93c8bc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f]">
              <span className="flex flex-wrap gap-2 text-xs font-semibold text-[#315e58]"><span className="inline-flex items-center gap-1 rounded-full bg-[#eaf6f3] px-2.5 py-1"><Layers3 size={13} aria-hidden="true" /> {routine.days}</span><span className="inline-flex items-center gap-1 rounded-full bg-[#eff5f5] px-2.5 py-1"><Clock3 size={13} aria-hidden="true" /> {routine.minutes}</span></span>
              <span className="mt-4 block text-lg font-semibold">{routine.name}</span><span className="mt-1 block text-xs text-[#526e69]">Actualizada el 1 de enero</span><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#17655f]">Editar rutina <ArrowRight size={15} aria-hidden="true" /></span>
            </button>)}
          </div>
          <p className="mt-4 text-xs leading-5 text-[#526e69]">Al editar una rutina activada se crea una copia para conservar tu rutina actual y tu historial.</p>
        </section>
      </>}
    </div>
  </main>;
}

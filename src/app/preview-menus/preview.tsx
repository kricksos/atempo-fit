"use client";

import { Apple, ArrowRight, Bell, ChartNoAxesCombined, Check, ChevronDown, Dumbbell, Flame, LayoutDashboard, LogOut, Sparkles, Trophy, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { WeeklyActivityCard } from "@/components/weekly-activity-card";

type Panel = "progress" | "account";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#375dac]";
const notices = [
  { title: "Tu siguiente entrenamiento", text: "Tienes una sesión preparada para hoy.", action: "Ver sesión", color: "bg-[#e7f6f3] text-[#08786f]", Icon: Dumbbell },
  { title: "Tu objetivo semanal", text: "Llevas 2 de 3 días activos esta semana.", action: "Ver actividad", color: "bg-[#f1eef9] text-[#7550a4]", Icon: Flame },
  { title: "Actualiza tu evolución", text: "Puedes añadir un nuevo registro cuando quieras.", action: "Ir a progreso", color: "bg-[#edf2ff] text-[#375dac]", Icon: ChartNoAxesCombined },
  { title: "Revisa tu planificación", text: "Tus preferencias han cambiado desde la última revisión.", action: "Revisar plan", color: "bg-[#fff4e5] text-[#a96c27]", Icon: Sparkles },
];

export function HeaderMenusPreview() {
  const [panel, setPanel] = useState<Panel | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showNotices, setShowNotices] = useState(true);
  const [noticeSeen, setNoticeSeen] = useState(false);
  const [feedback, setFeedback] = useState("");
  const progressRef = useRef<HTMLButtonElement>(null);
  const accountRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!panel) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setPanel(null);
        (panel === "progress" ? progressRef : accountRef).current?.focus();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [panel]);

  function togglePanel(next: Panel) {
    setPanel((current) => current === next ? null : next);
    if (next === "account") setNoticeSeen(true);
    setShowAll(false);
  }

  function demoAction(label: string) {
    setPanel(null);
    setFeedback(`${label}: acción de ejemplo. No se ha modificado ni enviado ningún dato.`);
  }

  return <main className="min-h-screen bg-[#f4f6f8] px-4 py-4 text-[#172f3b] sm:px-7 sm:py-7">
    <div className="mx-auto max-w-[1320px]">
      <div role="note" className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#d4e4e6] bg-white px-4 py-3 text-xs leading-5 text-[#526e75]">
        <p><strong className="text-[#173b44]">Muestra de los menús.</strong> Datos ficticios: no se guarda ni envía información.</p>
        <button type="button" onClick={() => { setShowNotices((current) => !current); setNoticeSeen(false); setShowAll(false); }} className={`min-h-10 rounded-full border border-[#d8e5e5] px-3 font-semibold text-[#315d5a] hover:bg-[#edf6f5] ${focus}`}>{showNotices ? "Probar sin avisos" : "Mostrar avisos de ejemplo"}</button>
      </div>
      {panel && <button type="button" aria-label="Cerrar menú abierto" onClick={() => setPanel(null)} tabIndex={-1} className="fixed inset-0 z-30 cursor-default bg-[#102a35]/10" />}
      <header className="relative z-40 flex flex-wrap items-center justify-between gap-3 border-b border-[#d6e5e2] pb-5">
        <div className="flex items-center gap-2 sm:gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#163e49] text-[#a6eee0]"><Sparkles size={18} aria-hidden="true" /></span><span><span className="block text-sm font-semibold tracking-tight sm:text-base">Atempo Fit</span><span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[#607d79] sm:block">Tu espacio personal</span></span></div>
        <div className="flex items-center gap-2">
          <button ref={progressRef} type="button" onClick={() => togglePanel("progress")} aria-expanded={panel === "progress"} aria-controls="preview-progress-menu" className={`flex min-h-11 items-center gap-2 rounded-full border bg-white py-1 pl-1.5 pr-2.5 text-left text-[#375dac] shadow-sm hover:border-[#9fb5de] ${panel === "progress" ? "border-[#9fb5de] bg-[#f4f7ff]" : "border-[#dfe5ec]"} ${focus}`}>
            <span className="grid size-8 place-items-center rounded-full bg-[#edf2ff] text-xs font-bold">7</span><span className="hidden text-xs font-bold sm:block">Nivel 7<span className="mt-0.5 block font-normal text-[#71858c]">11 logros</span></span><ChevronDown size={15} aria-hidden="true" className={panel === "progress" ? "rotate-180" : ""} /><span className="sr-only">Ver progreso y logros</span>
          </button>
          <button ref={accountRef} type="button" onClick={() => togglePanel("account")} aria-expanded={panel === "account"} aria-controls="preview-account-menu" className={`relative flex min-h-11 items-center gap-2 rounded-full border bg-white py-1 pl-1.5 pr-2.5 text-left shadow-sm hover:border-[#a9c9c4] ${panel === "account" ? "border-[#a9c9c4] bg-[#f4faf9]" : "border-[#dfe5ec]"} ${focus}`}>
            <span className="grid size-8 place-items-center rounded-full bg-[#e7f6f3] text-[#08786f]"><UserRound size={16} aria-hidden="true" /></span><span className="hidden text-xs font-bold text-[#315d5a] sm:block">Mi espacio<span className="mt-0.5 block font-normal text-[#71858c]">Alex</span></span><ChevronDown size={15} className={`text-[#526e75] ${panel === "account" ? "rotate-180" : ""}`} aria-hidden="true" /><span className="sr-only">Abrir mi espacio</span>
            {showNotices && !noticeSeen && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border-2 border-[#f4f6f8] bg-[#b6503c] text-[10px] font-bold text-white" aria-label="4 avisos nuevos">4</span>}
          </button>
        </div>

        {panel === "progress" && <section id="preview-progress-menu" aria-labelledby="preview-progress-title" className="fixed inset-x-4 top-4 z-40 max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[1.5rem] border border-[#e1e7eb] bg-white p-4 shadow-[0_20px_50px_rgba(16,54,58,0.18)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-[min(34rem,calc(100dvh-13rem))] sm:w-[min(400px,calc(100vw-2rem))] sm:p-5">
          <div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#375dac]">Tu progreso</p><h2 id="preview-progress-title" className="mt-1 text-xl font-bold tracking-tight">Cada paso cuenta.</h2><p className="mt-1 text-xs leading-5 text-[#71858c]">Un vistazo a tu recorrido.</p></div><button type="button" onClick={() => { setPanel(null); progressRef.current?.focus(); }} aria-label="Cerrar progreso" className={`grid size-10 shrink-0 place-items-center rounded-full text-[#71858c] hover:bg-[#f1f5f5] ${focus}`}><X size={18} aria-hidden="true" /></button></div>
          <div className="mt-4 rounded-2xl border border-[#dce5f9] bg-[#f2f6ff] p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold text-[#526e8d]">Tu nivel actual</p><p className="mt-1 text-2xl font-bold tracking-tight text-[#233e79]">Nivel 7</p></div><span className="grid size-11 place-items-center rounded-2xl bg-white text-[#375dac]"><Sparkles size={20} aria-hidden="true" /></span></div><div className="mt-3 flex justify-between gap-2 text-xs text-[#526e8d]"><span>Progreso al nivel 8</span><span className="font-semibold">430 / 800 XP</span></div><div role="progressbar" aria-label="Progreso al nivel 8" aria-valuenow={430} aria-valuemin={0} aria-valuemax={800} className="mt-2 h-2 overflow-hidden rounded-full bg-[#dce5f6]"><div className="h-full w-[53.75%] rounded-full bg-[#5277c6]" /></div></div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-[#e8e5f1] bg-[#f8f6fc] p-3"><p className="flex items-center gap-1.5 text-xs font-semibold text-[#7550a4]"><Flame size={14} aria-hidden="true" /> Esta semana</p><p className="mt-2 text-lg font-bold">2 <span className="text-sm font-medium text-[#71858c]">/ 3 días</span></p><p className="mt-1 text-[11px] leading-4 text-[#71858c]">Días activos</p></div>
            <div className="rounded-2xl border border-[#e6edf1] bg-[#f7f9fa] p-3"><p className="flex items-center gap-1.5 text-xs font-semibold text-[#526e75]"><Trophy size={14} aria-hidden="true" /> Tus logros</p><p className="mt-2 text-lg font-bold">11 <span className="text-sm font-medium text-[#71858c]">/ 26</span></p><p className="mt-1 text-[11px] leading-4 text-[#71858c]">Conseguidos</p></div>
          </div>
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#d9eae2] bg-[#f3faf6] p-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e2f4eb] text-[#34785f]"><Check size={18} aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#50836c]">Un logro conseguido</p><p className="mt-1 text-sm font-semibold">Primer objetivo semanal</p></div><span className="shrink-0 text-xs font-semibold text-[#50836c]">+100 XP</span></div>
          <button type="button" onClick={() => demoAction("Ver todos los logros")} className={`mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#173b44] px-4 text-sm font-semibold text-white hover:bg-[#24535a] ${focus}`}>Ver todos los logros <ArrowRight size={16} aria-hidden="true" /></button>
        </section>}

        {panel === "account" && <section id="preview-account-menu" aria-labelledby="preview-account-title" className="fixed inset-x-4 top-4 z-40 max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-[1.5rem] border border-[#e1e7eb] bg-white p-4 shadow-[0_20px_50px_rgba(16,54,58,0.18)] sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-[min(34rem,calc(100dvh-13rem))] sm:w-[min(400px,calc(100vw-2rem))] sm:p-5">
          <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e7f6f3] text-[#08786f]"><UserRound size={20} aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#08786f]">Tu espacio</p><h2 id="preview-account-title" className="mt-1 text-xl font-bold tracking-tight">Hola, Alex</h2><p className="mt-1 text-xs text-[#71858c]">Tu cuenta y avisos en un lugar.</p></div><button type="button" onClick={() => { setPanel(null); accountRef.current?.focus(); }} aria-label="Cerrar mi espacio" className={`grid size-10 shrink-0 place-items-center rounded-full text-[#71858c] hover:bg-[#f1f5f5] ${focus}`}><X size={18} aria-hidden="true" /></button></div>
          <div className="mt-5 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-bold"><Bell size={16} className="text-[#b6503c]" aria-hidden="true" /> Tus avisos</h3><span className="rounded-full bg-[#f2f5f6] px-2.5 py-1 text-xs font-semibold text-[#71858c]">{showNotices ? notices.length : 0}</span></div>
          {showNotices ? <><div className="mt-3 space-y-2">{(showAll ? notices : notices.slice(0, 2)).map(({ title, text, action, Icon, color }) => <article key={title} className="flex gap-3 rounded-2xl border border-[#e8edef] bg-[#fafcfc] p-3"><span className={`grid size-9 shrink-0 place-items-center rounded-xl ${color}`}><Icon size={16} aria-hidden="true" /></span><div className="min-w-0"><h4 className="text-sm font-semibold">{title}</h4><p className="mt-1 text-xs leading-5 text-[#647b82]">{text}</p><button type="button" onClick={() => demoAction(action)} className={`mt-1 inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-[#08786f] ${focus}`}>{action} <ArrowRight size={13} aria-hidden="true" /></button></div></article>)}</div><button type="button" onClick={() => setShowAll(!showAll)} aria-expanded={showAll} className={`mt-2 flex min-h-10 w-full items-center justify-center gap-1 text-xs font-semibold text-[#526e75] hover:text-[#173b44] ${focus}`}>{showAll ? "Mostrar menos" : "Ver los 4 avisos"} <ChevronDown size={14} aria-hidden="true" className={showAll ? "rotate-180" : ""} /></button></> : <p className="mt-3 rounded-2xl bg-[#f7f9f9] p-4 text-sm leading-6 text-[#647b82]">No tienes avisos pendientes. Todo está al día.</p>}
          <div className="mt-3 space-y-1 border-t border-[#edf1f2] pt-3"><button type="button" onClick={() => demoAction("Mi cuenta")} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold hover:bg-[#f1f7f6] ${focus}`}><UserRound size={17} className="text-[#08786f]" aria-hidden="true" /><span className="flex-1">Mi cuenta</span><ArrowRight size={16} aria-hidden="true" /></button><button type="button" onClick={() => demoAction("Cerrar sesión")} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-[#647b82] hover:bg-[#f7f9f9] ${focus}`}><LogOut size={17} aria-hidden="true" /> Cerrar sesión</button></div>
        </section>}
      </header>

      <div className="mt-7 flex flex-wrap items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#08786f]"><span className="size-2 rounded-full bg-[#08786f]" /> Tu espacio de progreso</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Tu ritmo. Tu progreso.</h1><p className="mt-2 text-sm leading-6 text-[#667d88]">Todo lo que necesitas para seguir avanzando, en un solo lugar.</p></div><span className="rounded-full border border-[#d1e2de] bg-white px-4 py-2 text-xs font-semibold text-[#46645f]">Tu semana, de un vistazo</span></div>
      {feedback && <p role="status" className="mt-4 rounded-xl border border-[#d4e4e6] bg-white px-4 py-3 text-sm text-[#526e75]">{feedback}</p>}
      <nav aria-label="Secciones de ejemplo" className="mt-7 grid grid-cols-2 gap-2 rounded-2xl border border-[#e0e7eb] bg-white p-1.5 sm:grid-cols-4">{[{ label: "Resumen", Icon: LayoutDashboard, color: "#163e49" }, { label: "Entrenamiento", Icon: Dumbbell, color: "#08786f" }, { label: "Nutrición", Icon: Apple, color: "#b6503c" }, { label: "Progreso", Icon: ChartNoAxesCombined, color: "#375dac" }].map(({ label, Icon, color }, index) => <span key={label} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl text-xs font-semibold text-[#5b707b] sm:text-sm ${index === 0 ? "bg-[#edf4f5]" : ""}`}><Icon size={17} style={{ color }} aria-hidden="true" />{label}</span>)}</nav>
      <div className="mt-7 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]"><section className="relative overflow-hidden rounded-[1.5rem] bg-[#173b44] p-6 text-white sm:p-7"><div aria-hidden="true" className="absolute -right-20 -top-32 size-80 rounded-full border border-white/10 shadow-[0_0_0_3rem_rgba(255,255,255,0.025),0_0_0_6rem_rgba(255,255,255,0.02)]" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a6eee0]">Tu siguiente paso</p><h2 className="mt-4 text-3xl font-semibold tracking-tight">Cuerpo completo.</h2><p className="mt-3 max-w-md text-sm leading-6 text-[#d0e3e1]">Tu sesión de ejemplo está preparada. Abre los menús de arriba para explorar la propuesta.</p><span className="mt-6 inline-flex rounded-full border border-white/20 px-4 py-2 text-xs text-[#d0e3e1]">Día 2 de 3 · 45 min aprox.</span></div></section><WeeklyActivityCard activeDays={2} targetDays={3} completed={false} currentStreak={2} /></div>
    </div>
  </main>;
}

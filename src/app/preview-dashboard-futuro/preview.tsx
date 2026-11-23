"use client";

import { useState } from "react";
import {
  Activity, Apple, ArrowRight, ArrowUpRight, CalendarDays, ChevronDown,
  CircleAlert, Clock3, Dumbbell, Flame, LayoutDashboard, LineChart, Sparkles,
} from "lucide-react";
import Link from "next/link";

import { PulsoMotif } from "@/components/next-step-panel";

const tabs = [
  { id: "overview", label: "Resumen", icon: LayoutDashboard, color: "text-[#163e49]", selected: "border-[#163e49] bg-[#edf4f5]" },
  { id: "training", label: "Entrenamiento", icon: Dumbbell, color: "text-[#08786f]", selected: "border-[#08786f] bg-[#e7f6f3]" },
  { id: "nutrition", label: "Nutrición", icon: Apple, color: "text-[#b6503c]", selected: "border-[#b6503c] bg-[#fff1ed]" },
  { id: "progress", label: "Progreso", icon: LineChart, color: "text-[#375dac]", selected: "border-[#375dac] bg-[#edf2ff]" },
] as const;

type TabId = (typeof tabs)[number]["id"];

const meals = [
  { name: "Desayuno", time: "08:00", calories: 500, detail: "Yogur natural · Avena · Fruta" },
  { name: "Comida", time: "14:00", calories: 700, detail: "Pechuga de pollo · Arroz · Verduras" },
  { name: "Cena", time: "21:00", calories: 550, detail: "Pescado · Patata · Verduras" },
];

const card = "rounded-[1.5rem] border border-[#e1e7eb] bg-white shadow-[0_12px_36px_rgba(19,43,57,0.05)]";
const eyebrow = "text-[11px] font-bold uppercase tracking-[0.16em] text-[#657985]";
const quietButton = "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[#dae3e8] bg-white px-4 text-xs font-semibold text-[#294654] transition-colors hover:bg-[#f3f7f8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08786f]";

function ReviewNotice({ previewAction }: { previewAction: () => void }) {
  return <div role="status" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#ecd9ad] bg-[#fffbf2] px-4 py-3.5">
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f7ebd0] text-[#8b5a13]"><CircleAlert size={18} aria-hidden="true" /></span>
      <div><p className="text-sm font-semibold text-[#684a20]">Tu plan necesita atención</p><p className="mt-1 text-xs leading-5 text-[#735f42]">Hace tiempo que no actualizas tu evolución. Revisa tus datos para seguir ajustando el plan.</p></div>
    </div>
    <button type="button" onClick={previewAction} className="ml-12 inline-flex min-h-10 items-center gap-1 text-xs font-semibold text-[#765016] hover:text-[#4f350d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b5a13] sm:ml-0">Actualizar evolución <ArrowRight size={14} aria-hidden="true" /></button>
  </div>;
}

function ActivityCard() {
  return <section className={`${card} p-6 sm:p-7`}>
    <div className="flex items-start justify-between"><div><p className={eyebrow}>Constancia</p><h2 className="mt-2 text-lg font-semibold">Tu semana</h2></div><span className="grid size-10 place-items-center rounded-xl bg-[#f1eef9] text-[#7550a4]"><Flame size={19} aria-hidden="true" /></span></div>
    <div className="mt-6 flex items-end gap-2"><p className="text-4xl font-semibold tracking-[-0.06em]">2<span className="text-2xl text-[#90a0a9]"> / 3</span></p><span className="pb-1 text-sm text-[#667d88]">días activos</span></div>
    <p className="mt-2 text-sm text-[#667d88]">Cada paso cuenta para tu objetivo semanal.</p>
    <div role="progressbar" aria-label="Objetivo semanal" aria-valuenow={2} aria-valuemin={0} aria-valuemax={3} className="mt-5 h-2 overflow-hidden rounded-full bg-[#edf0f3]"><div className="h-full w-2/3 rounded-full bg-[#7550a4]" /></div>
    <div className="mt-7 flex items-center justify-between border-t border-[#edf1f3] pt-5 text-sm"><span className="flex items-center gap-2 text-[#667d88]"><Flame size={16} className="text-[#7550a4]" aria-hidden="true" /> Racha actual</span><strong>2 días</strong></div>
  </section>;
}

function Overview({ selectTab, previewAction }: { selectTab: (tab: TabId) => void; previewAction: () => void }) {
  return <div className="space-y-4">
    <div className="grid gap-4 lg:grid-cols-[1.45fr_0.85fr]">
      <section className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#112b3a] via-[#153c4a] to-[#18565a] p-6 text-white shadow-[0_20px_44px_rgba(15,44,55,0.18)] sm:p-8">
        <PulsoMotif />
        <div className="relative">
          <div className="flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#a6eee0]"><span className="grid size-8 place-items-center rounded-xl bg-white/10"><Dumbbell size={16} aria-hidden="true" /></span> Tu próximo entrenamiento</p><span className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-[#d9eae8]">Día 2 de 3</span></div>
          <h2 className="mt-8 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Cuerpo completo <span className="text-[#a6eee0]">· Variante A</span></h2>
          <p className="mt-3 text-sm text-[#d1e4e3]">Pectoral · Dorsal · Cuádriceps</p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-[#dcebea]"><span className="rounded-full border border-white/15 bg-white/5 px-3 py-2">6 ejercicios</span><span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-2"><Clock3 size={14} aria-hidden="true" /> 45 min aprox.</span></div>
          <button type="button" onClick={previewAction} className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#a6eee0] px-5 text-sm font-bold text-[#103c3d] hover:bg-[#c4f6ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Comenzar sesión <ArrowRight size={16} aria-hidden="true" /></button>
        </div>
      </section>
      <ActivityCard />
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <section className={`${card} p-6 sm:p-7`}>
        <div className="flex items-start justify-between"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[#fff0ec] text-[#b6503c]"><Apple size={20} aria-hidden="true" /></span><div><p className={eyebrow}>Tu alimentación</p><h2 className="mt-1 text-lg font-semibold">Nutrición diaria</h2></div></div><button type="button" onClick={() => selectTab("nutrition")} aria-label="Ver nutrición" className="grid size-10 place-items-center rounded-full border border-[#e2e8eb] text-[#b6503c] hover:bg-[#fff1ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6503c]"><ArrowUpRight size={18} aria-hidden="true" /></button></div>
        <div className="mt-7 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs text-[#667d88]">Referencia diaria</p><p className="mt-1 text-3xl font-semibold tracking-tight">2100 <span className="text-sm font-medium text-[#667d88]">kcal</span></p></div><p className="text-xs leading-5 text-[#667d88]">140 g proteína · 240 g carbos · 65 g grasas</p></div>
        <div className="mt-6 flex justify-between text-xs font-semibold text-[#9f4b39]"><span>Comidas de hoy</span><span>2 de 3 · Día pendiente</span></div>
        <div role="progressbar" aria-label="Comidas completadas hoy" aria-valuenow={2} aria-valuemin={0} aria-valuemax={3} className="mt-2 h-2 overflow-hidden rounded-full bg-[#f4eeec]"><div className="h-full w-2/3 rounded-full bg-[#c75d47]" /></div>
        <p className="mt-5 text-xs text-[#667d88]">Tu planificación, un día a la vez.</p>
      </section>
      <section className={`${card} p-6 sm:p-7`}>
        <div className="flex items-start justify-between"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[#edf2ff] text-[#375dac]"><LineChart size={20} aria-hidden="true" /></span><div><p className={eyebrow}>Tu evolución</p><h2 className="mt-1 text-lg font-semibold">Progreso personal</h2></div></div><button type="button" onClick={() => selectTab("progress")} aria-label="Ver progreso" className="grid size-10 place-items-center rounded-full border border-[#e2e8eb] text-[#375dac] hover:bg-[#edf2ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#375dac]"><ArrowUpRight size={18} aria-hidden="true" /></button></div>
        <div className="mt-7 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs text-[#667d88]">Último peso registrado</p><p className="mt-1 text-3xl font-semibold tracking-tight">72,4 <span className="text-sm font-medium text-[#667d88]">kg</span></p></div><span className="rounded-full bg-[#edf2ff] px-3 py-1.5 text-xs font-semibold text-[#375dac]">−1,7 kg desde el inicio</span></div>
        <div className="mt-6 flex justify-between text-xs text-[#667d88]"><span>Objetivo: 70 kg</span><span>2,4 kg restantes</span></div>
        <div role="progressbar" aria-label="Progreso hacia el objetivo" aria-valuenow={41} aria-valuemin={0} aria-valuemax={100} className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf0f3]"><div className="h-full w-[41%] rounded-full bg-[#466dc0]" /></div>
        <p className="mt-5 text-xs text-[#667d88]">Actualizado ayer · Seguimiento al día</p>
      </section>
    </div>
  </div>;
}

function Training({ previewAction }: { previewAction: () => void }) {
  return <div className="space-y-4">
    <section className={`${card} flex flex-wrap items-center justify-between gap-5 p-6 sm:p-7`}><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#e7f6f3] text-[#08786f]"><Dumbbell size={21} aria-hidden="true" /></span><div><p className={eyebrow}>Tu rutina</p><h2 className="mt-1 text-xl font-semibold">Gestiona tu entrenamiento</h2><p className="mt-2 text-sm text-[#667d88]">Edita tu rutina, duplica una anterior o crea una desde cero.</p></div></div><button type="button" onClick={previewAction} className={quietButton}>Gestionar rutinas <ArrowRight size={15} aria-hidden="true" /></button></section>
    <section className={`${card} p-6 sm:p-7`}>
      <div className="flex items-end justify-between"><div><p className={eyebrow}>Tu plan semanal</p><h2 className="mt-1 text-xl font-semibold">Días de entrenamiento</h2></div><span className="text-xs font-semibold text-[#08786f]">3 días</span></div>
      <div className="mt-5 space-y-3">{[
        { title: "Cuerpo completo", label: "Día 1 · Completado", detail: "Variante A · 7 ejercicios", status: "Completado", active: false },
        { title: "Tren superior", label: "Día 2 · Toca ahora", detail: "Variante A · 6 ejercicios", status: "Comenzar", active: true },
        { title: "Tren inferior", label: "Día 3 · Próximamente", detail: "Variante A · 6 ejercicios", status: "En cola", active: false },
      ].map((day) => <article key={day.title} className={`flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4 ${day.active ? "border-[#9ed6cd] bg-[#f6fbfa]" : "border-[#e8edef] bg-white"}`}><div><p className={`text-xs font-semibold ${day.active ? "text-[#08786f]" : "text-[#71858e]"}`}>{day.label}</p><h3 className="mt-1 font-semibold">{day.title}</h3><p className="mt-1 text-sm text-[#667d88]">{day.detail}</p></div>{day.active ? <button type="button" onClick={previewAction} className="min-h-10 rounded-full bg-[#08786f] px-4 text-xs font-semibold text-white hover:bg-[#05645c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08786f]">{day.status}</button> : <span className="rounded-full bg-[#f1f5f6] px-3 py-2 text-xs font-semibold text-[#637982]">{day.status}</span>}</article>)}</div>
    </section>
  </div>;
}

function Nutrition() {
  const [openMeal, setOpenMeal] = useState<string | null>(null);
  return <div className="space-y-4">
    <section className={`${card} p-6 sm:p-7`}>
      <div className="flex flex-wrap items-start justify-between gap-4"><div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#fff0ec] text-[#b6503c]"><Apple size={21} aria-hidden="true" /></span><div><p className={eyebrow}>Tu día de alimentación</p><h2 className="mt-1 text-xl font-semibold">Claro, flexible y preciso.</h2><p className="mt-2 text-sm text-[#667d88]">Tu planificación de hoy, de un vistazo.</p></div></div><span className="rounded-full border border-[#f1d2c9] bg-[#fff7f4] px-4 py-2 text-xs font-semibold text-[#a94e3d]">3 comidas al día</span></div>
      <div className="mt-6 grid grid-cols-2 gap-3 border-t border-[#edf1f3] pt-5 sm:grid-cols-4">{[{ label: "Referencia diaria", value: "2100 kcal" }, { label: "Proteína", value: "140 g" }, { label: "Carbohidratos", value: "240 g" }, { label: "Grasas", value: "65 g" }].map((item) => <div key={item.label} className="rounded-xl bg-[#f7f9fa] p-3"><p className="text-xs text-[#667d88]">{item.label}</p><p className="mt-1 font-semibold">{item.value}</p></div>)}</div>
    </section>
    <section className={`${card} p-6 sm:p-7`}><div className="flex items-center justify-between"><div><p className={eyebrow}>Plan de hoy</p><h2 className="mt-1 text-xl font-semibold">Tus comidas</h2></div><span className="text-xs font-semibold text-[#b6503c]">2 de 3</span></div><div className="mt-5 space-y-3">{meals.map((meal) => <div key={meal.name} className="rounded-2xl border border-[#e8edef]"><button type="button" aria-expanded={openMeal === meal.name} onClick={() => setOpenMeal(openMeal === meal.name ? null : meal.name)} className="flex w-full items-center justify-between gap-3 p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6503c]"><span><span className="block text-xs text-[#71858e]">{meal.time}</span><span className="mt-1 block font-semibold">{meal.name}</span></span><span className="flex items-center gap-3 text-xs text-[#667d88]">{meal.calories} kcal <ChevronDown size={17} className={openMeal === meal.name ? "rotate-180" : ""} aria-hidden="true" /></span></button>{openMeal === meal.name && <p className="border-t border-[#edf1f3] px-4 py-3 text-sm text-[#667d88]">{meal.detail}</p>}</div>)}</div></section>
  </div>;
}

function Progress() {
  return <div className="space-y-4">
    <section className={`${card} p-6 sm:p-7`}>
      <div className="flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#edf2ff] text-[#375dac]"><LineChart size={21} aria-hidden="true" /></span><div><p className={eyebrow}>Tu evolución</p><h2 className="mt-1 text-xl font-semibold">Cada paso cuenta.</h2><p className="mt-2 text-sm text-[#667d88]">Sigue tu progreso con perspectiva, no solo con cifras.</p></div></div>
      <div className="mt-6 grid gap-3 border-t border-[#edf1f3] pt-5 sm:grid-cols-3">{[{ label: "Último peso", value: "72,4 kg" }, { label: "Desde el inicio", value: "−1,7 kg" }, { label: "Peso objetivo", value: "70 kg" }].map((item) => <div key={item.label} className="rounded-xl bg-[#f7f9fa] p-4"><p className="text-xs text-[#667d88]">{item.label}</p><p className="mt-2 text-xl font-semibold">{item.value}</p></div>)}</div>
    </section>
    <section className={`${card} p-6 sm:p-7`}>
      <div className="flex items-start justify-between gap-3"><div><p className={eyebrow}>Seguimiento</p><h2 className="mt-1 text-xl font-semibold">Tu evolución registrada</h2><p className="mt-2 text-sm text-[#667d88]">Dos mediciones de ejemplo.</p></div><span className="rounded-full bg-[#edf2ff] px-3 py-1.5 text-xs font-semibold text-[#375dac]">Al día</span></div>
      <div className="mt-6 flex items-end gap-5 border-t border-[#edf1f3] pt-5"><div><p className="text-xs text-[#667d88]">Inicio</p><p className="mt-1 text-lg font-semibold">74,1 kg</p></div><ArrowRight size={18} className="mb-1 text-[#93a6b0]" aria-hidden="true" /><div><p className="text-xs text-[#667d88]">Última medición</p><p className="mt-1 text-lg font-semibold text-[#375dac]">72,4 kg</p></div></div>
    </section>
  </div>;
}

export function FutureDashboardPreview() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [showNotice, setShowNotice] = useState(true);
  const [message, setMessage] = useState("");

  function selectTab(tab: TabId) {
    setActiveTab(tab);
    setMessage("");
  }

  return <main className="min-h-screen bg-[#f4f6f8] px-4 py-4 text-[#172f3b] sm:px-7 sm:py-7">
    <div className="mx-auto max-w-[1320px]">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#dce5eb] bg-white px-4 py-3 text-xs leading-5 text-[#526a77]"><p><strong className="text-[#193b4a]">Nueva propuesta · Dashboard.</strong> Datos ficticios: esta muestra no modifica ni guarda nada.</p><div className="flex flex-wrap items-center gap-3"><button type="button" aria-pressed={showNotice} onClick={() => setShowNotice(!showNotice)} className="min-h-9 font-semibold text-[#405e6b] underline underline-offset-4">{showNotice ? "Ocultar aviso" : "Mostrar aviso"}</button><Link href="/preview-dashboard" className="inline-flex min-h-9 items-center font-semibold text-[#08786f] underline underline-offset-4">Comparar con la anterior</Link></div></div>
      <header className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#e0e7eb] pb-5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#163e49] text-[#a6eee0]"><Sparkles size={20} aria-hidden="true" /></span><div><p className="text-lg font-bold leading-tight">Atempo <span className="font-medium text-[#78909a]">Fit</span></p><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#778d98]">Tu espacio personal</p></div></div><div className="flex items-center gap-2"><span className="rounded-full border border-[#e0e7eb] bg-white px-4 py-2 text-xs font-semibold text-[#405b68]">Nivel 4 · 420 XP</span><span className="grid size-10 place-items-center rounded-full bg-[#e5eef1] text-sm font-bold text-[#315763]">A</span></div></header>
      <div className="mt-7 flex flex-wrap items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#08786f]"><span className="size-2 rounded-full bg-[#08786f]" /> Tu espacio de progreso</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Tu ritmo. Tu progreso.</h1><p className="mt-2 text-sm leading-6 text-[#667d88]">Todo lo que necesitas para seguir avanzando, en un solo lugar.</p></div><span className="inline-flex items-center gap-2 rounded-full border border-[#e0e7eb] bg-white px-4 py-2 text-xs font-semibold text-[#536e7a]"><CalendarDays size={15} aria-hidden="true" /> Tu semana, de un vistazo</span></div>
      <nav aria-label="Secciones de la muestra" className="mt-7 grid grid-cols-2 gap-2 rounded-2xl border border-[#e0e7eb] bg-white p-1.5 shadow-[0_8px_24px_rgba(20,54,57,0.04)] sm:grid-cols-4">{tabs.map((tab) => { const Icon = tab.icon; const selected = activeTab === tab.id; return <button key={tab.id} type="button" aria-pressed={selected} onClick={() => selectTab(tab.id)} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08786f] sm:text-sm ${selected ? `${tab.selected} ${tab.color}` : "border-transparent text-[#5b707b] hover:bg-[#f7f9fa]"}`}><Icon size={17} className={tab.color} aria-hidden="true" />{tab.label}</button>; })}</nav>
      {showNotice && <div className="mt-5"><ReviewNotice previewAction={() => setMessage("Es un aviso de ejemplo; no se modifica tu evolución.")} /></div>}
      {message && <p role="status" className="mt-4 rounded-xl border border-[#dce5eb] bg-white px-4 py-3 text-sm text-[#526a77]">{message}</p>}
      <div className="mt-5">{activeTab === "overview" ? <Overview selectTab={selectTab} previewAction={() => setMessage("Es una acción de ejemplo; no se inicia ninguna sesión.")} /> : activeTab === "training" ? <Training previewAction={() => setMessage("Es una acción de ejemplo; no se modifica ninguna rutina.")} /> : activeTab === "nutrition" ? <Nutrition /> : <Progress />}</div>
      <p className="my-7 flex items-center gap-2 text-xs text-[#81929b]"><Activity size={15} aria-hidden="true" /> Propuesta visual con información ficticia.</p>
    </div>
  </main>;
}

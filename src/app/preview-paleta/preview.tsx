"use client";

import { Activity, Apple, ArrowRight, ChartNoAxesCombined, Dumbbell, Flame, LayoutDashboard, Sparkles } from "lucide-react";
import { useState } from "react";

import { pulsoBackground, pulsoNutritionBackground, pulsoProgressBackground, pulsoTrainingBackground, PulsoMotif } from "@/components/next-step-panel";

const sections = [
  {
    id: "resumen", label: "Resumen", icon: LayoutDashboard, accent: "#a6eee0", iconColor: "#17655f", tint: "#e5f5f2", active: "#163e49", background: pulsoBackground,
    eyebrow: "Tu siguiente paso", title: "Cuerpo completo · A", description: "Pectoral · Dorsal · Cuádriceps", detail: "Día 2 de 4 · 6 ejercicios · 35 min aprox.", action: "Comenzar sesión",
    sideLabel: "Constancia", sideTitle: "Tu semana", sideValue: "2 / 3", sideDetail: "días activos", sideNote: "Cada paso cuenta para tu objetivo semanal.", sideIcon: Flame,
    cards: [
      { label: "Tu alimentación", title: "Nutrición diaria", value: "2100 kcal", detail: "2 de 4 comidas · Día pendiente", icon: Apple, tint: "#fbead4", color: "#805321" },
      { label: "Tu evolución", title: "Progreso personal", value: "72,4 kg", detail: "Seguimiento al día", icon: ChartNoAxesCombined, tint: "#eaf1fa", color: "#3f6384" },
    ],
  },
  {
    id: "entrenamiento", label: "Entrenamiento", icon: Dumbbell, accent: "#a6eee0", iconColor: "#17655f", tint: "#e2f5f2", active: "#145257", background: pulsoTrainingBackground,
    eyebrow: "Tu próximo entrenamiento", title: "Cuerpo completo · A", description: "Pectoral · Dorsal · Cuádriceps", detail: "Día 2 de 4 · 6 ejercicios · 35 min aprox.", action: "Comenzar sesión",
    sideLabel: "Tu rutina", sideTitle: "Plan de entrenamiento", sideValue: "4 días", sideDetail: "por semana", sideNote: "Una semana organizada a tu ritmo.", sideIcon: Dumbbell,
    cards: [
      { label: "Organiza tu plan", title: "Gestiona tu entrenamiento", value: "Tu rutina", detail: "Revisa o cambia tus ejercicios.", icon: Dumbbell },
      { label: "Tu constancia", title: "Actividad semanal", value: "2 de 3", detail: "Días activos esta semana.", icon: Activity },
    ],
  },
  {
    id: "nutricion", label: "Nutrición", icon: Apple, accent: "#f8e0bc", iconColor: "#805321", tint: "#fbead4", active: "#805321", background: pulsoNutritionBackground,
    eyebrow: "Tu alimentación", title: "Nutrición diaria", description: "Un vistazo a tu planificación de hoy.", detail: "4 comidas · Datos de ejemplo", action: "Ver planificación",
    sideLabel: "Referencia diaria", sideTitle: "Tu día en cifras", sideValue: "2100", sideDetail: "kcal", sideNote: "Una referencia ficticia para esta muestra.", sideIcon: Apple,
    cards: [
      { label: "Plan de hoy", title: "Tus comidas", value: "2 de 4", detail: "Comidas completadas hoy.", icon: Apple },
      { label: "Resumen diario", title: "Macronutrientes", value: "140 g", detail: "Proteína · Dato de ejemplo.", icon: Activity },
    ],
  },
  {
    id: "progreso", label: "Progreso", icon: ChartNoAxesCombined, accent: "#cfdef5", iconColor: "#3f6384", tint: "#eaf1fa", active: "#34566e", background: pulsoProgressBackground,
    eyebrow: "Tu evolución", title: "Cada paso cuenta", description: "Sigue tu progreso con perspectiva.", detail: "Última actualización · Ayer", action: "Ver evolución",
    sideLabel: "Seguimiento", sideTitle: "Tu último registro", sideValue: "72,4", sideDetail: "kg", sideNote: "Un dato ficticio para esta muestra.", sideIcon: ChartNoAxesCombined,
    cards: [
      { label: "Tu objetivo", title: "Progreso personal", value: "En camino", detail: "Consulta tus registros y tendencias.", icon: ChartNoAxesCombined },
      { label: "Tus hábitos", title: "Tu constancia", value: "2 días", detail: "Actividad registrada esta semana.", icon: Activity },
    ],
  },
] as const;

export function PalettePreview() {
  const [section, setSection] = useState<(typeof sections)[number]>(sections[0]);
  const SectionIcon = section.icon;
  const SideIcon = section.sideIcon;

  return <main className="min-h-screen bg-[#f0f5f4] px-4 py-4 text-[#172d32] sm:px-7 sm:py-7">
    <div className="mx-auto max-w-[1320px]">
      <div role="status" className="rounded-2xl border border-[#cbdedb] bg-white/80 px-4 py-3 text-xs leading-5 text-[#496762]"><strong>Prueba de paleta · Datos ficticios.</strong> Cambia entre secciones para comparar los colores. Es una muestra visual: no modifica datos ni la aplicación real.</div>
      <header className="mt-5 flex flex-wrap items-center justify-between gap-3 border-b border-[#d6e5e2] pb-5">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#163e49] text-[#a6eee0]"><Sparkles size={20} aria-hidden="true" /></span><div><p className="text-lg font-bold leading-tight">Atempo <span className="font-medium text-[#5e7d79]">Fit</span></p><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#607d79]">Tu espacio personal</p></div></div>
        <span className="rounded-full border border-[#d1e2de] bg-white px-4 py-2 text-xs font-semibold text-[#46645f]">Una paleta, varios matices</span>
      </header>
      <div className="mt-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#39726e]">Tu espacio de progreso</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Tu ritmo. Tu progreso.</h1><p className="mt-2 text-sm leading-6 text-[#526e6b]">Todo lo que necesitas para seguir avanzando, en un solo lugar.</p></div>

      <nav className="mt-7 grid grid-cols-2 gap-1 rounded-2xl border border-[#d4e3e1] bg-white/80 p-1.5 shadow-[0_8px_24px_rgba(20,54,57,0.04)] sm:grid-cols-4" aria-label="Secciones de la muestra">
        {sections.map((item) => {
          const Icon = item.icon;
          const selected = item.id === section.id;
          return <button key={item.id} type="button" aria-pressed={selected} onClick={() => setSection(item)} className="flex min-h-12 items-center justify-center gap-2 rounded-xl px-2 text-xs font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f] sm:text-sm" style={{ backgroundColor: selected ? item.active : "transparent", color: selected ? "#ffffff" : "#3e5a59" }}><Icon size={17} aria-hidden="true" style={{ color: selected ? item.accent : item.iconColor }} />{item.label}</button>;
        })}
      </nav>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="relative overflow-hidden rounded-[1.75rem] p-6 text-white shadow-[0_18px_42px_rgba(16,45,51,0.14)] sm:p-8" style={{ background: section.background }}>
          <PulsoMotif />
          <div className="relative">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#f0f8f6]"><span className="grid size-8 place-items-center rounded-xl bg-white/10"><SectionIcon size={16} aria-hidden="true" /></span>{section.eyebrow}</p>
            <h2 className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">{section.title}</h2>
            <p className="mt-3 text-sm text-[#f0f8f6]">{section.description}</p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/10 px-3 py-2 text-xs text-[#f0f8f6]"><SectionIcon size={14} aria-hidden="true" />{section.detail}</p>
            <div className="mt-7"><span className="inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-bold text-[#18342f]" style={{ backgroundColor: section.accent }}>{section.action}<ArrowRight size={16} aria-hidden="true" /></span></div>
          </div>
        </section>
        <section className="rounded-[1.75rem] border border-[#d8e6e3] bg-white p-6 shadow-[0_14px_35px_rgba(20,54,57,0.05)] sm:p-7">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#526e69]">{section.sideLabel}</p><h2 className="mt-2 text-xl font-semibold">{section.sideTitle}</h2></div><span className="grid size-10 place-items-center rounded-2xl" style={{ backgroundColor: section.tint, color: section.iconColor }}><SideIcon size={19} aria-hidden="true" /></span></div>
          <div className="mt-7 flex flex-wrap items-end gap-2"><span className="text-4xl font-semibold tracking-tight">{section.sideValue}</span><span className="pb-1 text-sm text-[#526e69]">{section.sideDetail}</span></div>
          <p className="mt-3 text-sm leading-6 text-[#526e69]">{section.sideNote}</p>
          <div aria-hidden="true" className="mt-6 h-2 overflow-hidden rounded-full bg-[#edf3f2]"><div className="h-full w-2/3 rounded-full" style={{ backgroundColor: section.iconColor }} /></div>
          <p className="mt-7 flex items-center gap-2 border-t border-[#edf3f2] pt-5 text-sm text-[#526e69]"><Activity size={16} aria-hidden="true" /> Un paso más a tu ritmo</p>
        </section>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {section.cards.map((card) => <section key={card.title} className="rounded-[1.75rem] border border-[#d8e6e3] bg-white p-6 shadow-[0_14px_35px_rgba(20,54,57,0.05)] sm:p-7">
          <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl" style={{ backgroundColor: "tint" in card ? card.tint : section.tint, color: "color" in card ? card.color : section.iconColor }}><card.icon size={20} aria-hidden="true" /></span><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#526e69]">{card.label}</p><h2 className="mt-1 text-lg font-semibold">{card.title}</h2></div></div>
          <p className="mt-6 text-3xl font-semibold tracking-tight">{card.value}</p><p className="mt-2 text-sm text-[#526e69]">{card.detail}</p>
          <div aria-hidden="true" className="mt-5 h-2 overflow-hidden rounded-full bg-[#edf3f2]"><div className="h-full w-1/2 rounded-full" style={{ backgroundColor: "color" in card ? card.color : section.iconColor }} /></div>
        </section>)}
      </div>
      <p className="my-7 text-xs leading-5 text-[#526e69]">Los colores son una propuesta: el azul de Pulso une la aplicación y cada sección recibe un matiz propio.</p>
    </div>
  </main>;
}

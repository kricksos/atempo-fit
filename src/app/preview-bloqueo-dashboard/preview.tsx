"use client";

import { Apple, ArrowRight, ChartNoAxesCombined, Dumbbell, LayoutDashboard, LockKeyhole, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { NutritionPlan } from "@/components/nutrition-plan";

type Tab = "overview" | "training" | "nutrition" | "progress";

const tabs = [
  { id: "overview", label: "Resumen", icon: LayoutDashboard, color: "#163e49", light: "#edf4f5" },
  { id: "training", label: "Entrenamiento", icon: Dumbbell, color: "#08786f", light: "#e7f6f3" },
  { id: "nutrition", label: "Nutrición", icon: Apple, color: "#b6503c", light: "#fff1ed" },
  { id: "progress", label: "Progreso", icon: ChartNoAxesCombined, color: "#375dac", light: "#edf2ff" },
] as const;

const meals = [
  { id: "breakfast", name: "Desayuno", suggestedTime: "08:00", targetCalories: 480, items: [
    { id: "oats", name: "Avena", quantityGrams: 60, role: "carbohydrate", alternativeGroup: "cereal" },
    { id: "yogurt", name: "Yogur natural", quantityGrams: 200, role: "dairy", alternativeGroup: "dairy" },
    { id: "apple", name: "Manzana", quantityGrams: 120, role: "fruit", alternativeGroup: "fruit" },
  ] },
  { id: "morning", name: "Media mañana", suggestedTime: "11:00", targetCalories: 240, items: [] },
  { id: "lunch", name: "Comida", suggestedTime: "14:00", targetCalories: 650, items: [] },
  { id: "snack", name: "Merienda", suggestedTime: "17:30", targetCalories: 230, items: [] },
  { id: "dinner", name: "Cena", suggestedTime: "21:00", targetCalories: 500, items: [] },
];

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08786f]";

export function DashboardLockPreview() {
  const [activeTab, setActiveTab] = useState<Tab>("nutrition");
  const [showPlans, setShowPlans] = useState(false);

  function selectTab(tab: Tab) {
    setActiveTab(tab);
    setShowPlans(false);
  }

  return <main className="min-h-screen bg-[#f4f6f8] px-5 py-6 text-[#172f3b] sm:px-8 sm:py-8">
    <div className="mx-auto max-w-[1320px]">
      <div role="note" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d4e4e6] bg-white px-4 py-3 text-xs leading-5 text-[#526e75]"><p><strong className="text-[#173b44]">Muestra del dashboard.</strong> Datos ficticios: no bloquea tu cuenta ni activa pagos. El alcance del bloqueo está por decidir.</p><Link href="/preview-acceso" className={`font-semibold text-[#08786f] ${focus}`}>Volver a los ejemplos</Link></div>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d6e5e2] pb-5">
        <div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#163e49] text-[#a6eee0]"><Sparkles size={18} aria-hidden="true" /></span><span><span className="block font-semibold tracking-tight">Atempo Fit</span><span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#607d79]">Tu espacio personal</span></span></div>
        <span className="flex items-center gap-2 rounded-full border border-[#dfe8e8] bg-white py-1 pl-1.5 pr-3 text-xs font-semibold text-[#315d5a]"><span className="grid size-8 place-items-center rounded-full bg-[#e7f6f3] text-[#08786f]"><UserRound size={16} aria-hidden="true" /></span>Mi espacio · Alex</span>
      </header>
      <section className="mt-7">
        <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#08786f]"><span className="size-2 rounded-full bg-[#08786f]" /> Tu espacio de progreso</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Tu ritmo. Tu progreso.</h1><p className="mt-2 text-sm leading-6 text-[#667d88]">Todo lo que necesitas para seguir avanzando, en un solo lugar.</p></div><span className="rounded-full border border-[#e0e7eb] bg-white px-4 py-2 text-xs font-semibold text-[#536e7a]">Tu semana, de un vistazo</span></div>
        <nav className="mt-7 grid grid-cols-2 gap-2 rounded-2xl border border-[#e0e7eb] bg-white p-1.5 shadow-[0_8px_24px_rgba(20,54,57,0.04)] sm:grid-cols-4" aria-label="Secciones del dashboard de ejemplo">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return <button key={tab.id} type="button" aria-label={tab.id === "nutrition" ? "Nutrición, función Premium" : tab.label} aria-pressed={active} onClick={() => selectTab(tab.id)} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-semibold transition-colors hover:bg-[#f7f9fa] sm:text-sm ${focus}`} style={{ backgroundColor: active ? tab.light : undefined, borderColor: active ? tab.color : "transparent", color: active ? tab.color : "#5b707b" }}><Icon size={17} style={{ color: tab.color }} aria-hidden="true" /><span>{tab.label}</span>{tab.id === "nutrition" && <LockKeyhole size={15} className="shrink-0 text-[#b6503c]" aria-hidden="true" />}</button>;
          })}
        </nav>

        {activeTab === "nutrition" ? <div className="relative mt-7 overflow-clip rounded-[1.75rem]">
          <div inert aria-hidden="true" className="pointer-events-none select-none blur-[4px]"><NutritionPlan meals={meals} alternatives={{ cereal: ["Avena", "Pan integral"], dairy: ["Yogur natural"], fruit: ["Manzana"] }} foodIds={{}} mealCount={5} todayCompletedMealIds={[]} completedDates={[]} reference={{ calories: 2100, proteinGrams: 140, carbsGrams: 240, fatsGrams: 65 }} readOnly /></div>
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-white/10" />
          <div className="pointer-events-none absolute inset-0 flex justify-center px-4">
            <div className="pointer-events-auto sticky top-4 mt-8 h-fit w-full max-w-sm self-start rounded-[1.5rem] border border-[#d6e8e3] bg-white p-5 text-center shadow-[0_20px_60px_rgba(23,59,68,0.3)] sm:mt-16 sm:p-6">
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#e7f6f3] text-[#08786f]"><LockKeyhole size={22} aria-hidden="true" /></span>
              <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#08786f]">Función Premium</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight">Desbloquea nutrición</h2>
              <p className="mt-2 text-sm leading-6 text-[#647b82]">Tu prueba de acceso completo ha terminado. Elige un plan de pago para seguir accediendo a esta función.</p>
              <button type="button" onClick={() => setShowPlans(!showPlans)} aria-expanded={showPlans} className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#173b44] px-5 text-sm font-semibold text-white hover:bg-[#24535a] ${focus}`}>{showPlans ? "Ocultar planes de ejemplo" : "Ver planes de pago"} <ArrowRight size={16} aria-hidden="true" /></button>
              {showPlans && <p role="status" className="mt-3 rounded-xl bg-[#f1f9f6] p-3 text-xs leading-5 text-[#526e75]">Planes mensual, trimestral y anual. Esto es una muestra: no inicia ningún pago.</p>}
              <button type="button" onClick={() => selectTab("overview")} className={`mt-3 min-h-10 text-xs font-semibold text-[#526e75] hover:text-[#08786f] ${focus}`}>Volver al resumen</button>
            </div>
          </div>
        </div> : <div className="mt-7 rounded-[1.75rem] border border-[#e1e9eb] bg-white p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#08786f]">Dashboard de ejemplo</p><h2 className="mt-2 text-2xl font-semibold">{tabs.find((tab) => tab.id === activeTab)?.label}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#647b82]">Esta sección es una muestra simplificada. Pulsa Nutrición para ver el candado y la pantalla bloqueada.</p><button type="button" onClick={() => selectTab("nutrition")} className={`mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#173b44] px-5 text-sm font-semibold text-white hover:bg-[#24535a] ${focus}`}>Ver Nutrición <LockKeyhole size={15} aria-hidden="true" /></button></div>}
      </section>
    </div>
  </main>;
}

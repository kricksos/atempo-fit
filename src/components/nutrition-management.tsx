"use client";

import { ArrowRight, ChefHat, Clock3, History, Pencil, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { NavigationButton, NavigationLink } from "@/components/navigation-control";
import { NutritionHistoryList, type NutritionHistoryVersion } from "@/components/nutrition-history-list";

type Props = {
  planName: string | null;
  activeVersion: NutritionHistoryVersion | null;
  versions: NutritionHistoryVersion[];
  initialSection?: "home" | "active";
};

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6503c]";
const navigationClass = "border-[#eadbd6] bg-white text-[#79574e] hover:border-[#d8a99d] hover:bg-[#fff1ed] hover:text-[#9f4b39] focus-visible:outline-[#b6503c]";
const optionClass = `group flex min-h-52 flex-col rounded-[1.5rem] border border-[#e9dedb] bg-white p-5 text-left shadow-[0_8px_24px_rgba(54,34,29,0.04)] transition-[border-color,box-shadow] hover:border-[#d8a99d] hover:shadow-[0_16px_34px_rgba(54,34,29,0.08)] motion-safe:hover:-translate-y-1 ${focus}`;

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

export function NutritionManagement({ planName, activeVersion, versions, initialSection = "home" }: Props) {
  const [section, setSection] = useState<"home" | "active" | "history">(initialSection);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousSection = useRef(section);

  useEffect(() => {
    if (previousSection.current !== section) {
      headingRef.current?.focus();
      previousSection.current = section;
    }
  }, [section]);

  return <main className="min-h-screen bg-[#f4f6f8] px-4 py-6 text-[#172f3b] sm:px-8 sm:py-8">
    <div className="mx-auto max-w-6xl">
      <nav aria-label="Navegación de dietas" className="flex flex-wrap items-center gap-3">
        {section !== "home" && <NavigationButton kind="back" onClick={() => setSection("home")} className={navigationClass}>Volver a gestionar dietas</NavigationButton>}
        <NavigationLink href="/dashboard?tab=nutrition" kind="dashboard" className={navigationClass}>Volver al dashboard</NavigationLink>
      </nav>
      <header className="relative mt-5 overflow-hidden rounded-[2rem] bg-[#173b44] p-6 text-white shadow-[0_20px_50px_rgba(16,54,58,0.12)] sm:p-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 size-80 rounded-full border border-white/10 shadow-[0_0_0_3rem_rgba(255,255,255,0.025),0_0_0_6rem_rgba(255,255,255,0.02)]" />
        <div className="relative max-w-2xl"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f3b8a7]"><ChefHat size={16} aria-hidden="true" /> Tu alimentación</p><h1 ref={headingRef} tabIndex={-1} className="mt-4 text-3xl font-semibold tracking-[-0.05em] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#f3b8a7] sm:text-5xl">{section === "home" ? "Gestiona tus dietas." : section === "active" ? "Tu dieta activa." : "Historial de dietas."}</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[#d0e3e1]">{section === "home" ? "Consulta tu dieta, crea una nueva o revisa tus versiones anteriores." : section === "active" ? "Consulta los datos y el contexto de tu planificación actual." : "Revisa tus versiones anteriores y activa una cuando lo necesites."}</p></div>
      </header>

      {section === "home" && <section aria-labelledby="nutrition-management-title" className="mt-8">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b6503c]">Tu siguiente paso</p>
        <h2 id="nutrition-management-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Elige qué hacer</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <button type="button" onClick={() => setSection("active")} className={optionClass}>
            <span className="flex items-start justify-between"><span className="grid size-12 place-items-center rounded-2xl border border-[#f1d8d0] bg-[#fff1ed] text-[#b6503c]"><Sparkles size={22} aria-hidden="true" /></span><span className="text-xs font-semibold tracking-[0.12em] text-[#9b8780]">01</span></span>
            <span className="mt-5 block text-lg font-semibold">Dieta activa</span>
            <span className="mt-2 block text-sm leading-6 text-[#526e75]">{activeVersion ? "Consulta y configura tu planificación actual." : "Todavía no tienes una dieta activa."}</span>
            <span className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm font-semibold text-[#9f4b39]">Ver dieta <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#fff1ed] group-hover:bg-[#ffe4dc]"><ArrowRight size={17} aria-hidden="true" /></span></span>
          </button>
          <Link href="/nutrition/builder/manual" className={optionClass}>
            <span className="flex items-start justify-between"><span className="grid size-12 place-items-center rounded-2xl border border-[#f1d8d0] bg-[#fff7f4] text-[#b6503c]"><ChefHat size={22} aria-hidden="true" /></span><span className="text-xs font-semibold tracking-[0.12em] text-[#9b8780]">02</span></span>
            <span className="mt-5 block text-lg font-semibold">Crear dieta manual</span>
            <span className="mt-2 block text-sm leading-6 text-[#526e75]">Elige comidas, alimentos y cantidades.</span>
            <span className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm font-semibold text-[#9f4b39]">Crear dieta <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#fff1ed] group-hover:bg-[#ffe4dc]"><ArrowRight size={17} aria-hidden="true" /></span></span>
          </Link>
          <button type="button" onClick={() => setSection("history")} className={optionClass}>
            <span className="flex items-start justify-between"><span className="grid size-12 place-items-center rounded-2xl border border-[#e3e6ee] bg-[#f1f4f9] text-[#526c8d]"><History size={22} aria-hidden="true" /></span><span className="text-xs font-semibold tracking-[0.12em] text-[#9b8780]">03</span></span>
            <span className="mt-5 block text-lg font-semibold">Historial de dietas</span>
            <span className="mt-2 block text-sm leading-6 text-[#526e75]">Consulta tus versiones y recupera una anterior.</span>
            <span className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm font-semibold text-[#9f4b39]">Ver historial <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#fff1ed] group-hover:bg-[#ffe4dc]"><ArrowRight size={17} aria-hidden="true" /></span></span>
          </button>
        </div>
        <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[#526e75]"><ShieldCheck size={16} className="shrink-0 text-[#b6503c]" aria-hidden="true" /> Tus restricciones y preferencias se comprueban al regenerar o publicar una dieta manual.</p>
      </section>}

      {section === "active" && <section className="mt-8 rounded-[1.75rem] border border-[#e9dedb] bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b6503c]">Dieta activa</p><h2 className="mt-3 text-2xl font-semibold">{activeVersion ? planName ?? "Dieta activa" : "Aún no tienes una dieta activa"}</h2></div>{activeVersion && <span className="rounded-full border border-[#f1d8d0] bg-[#fff1ed] px-3 py-1.5 text-xs font-semibold text-[#9f4b39]">Versión {activeVersion.versionNumber}</span>}</div>
        {activeVersion ? <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[{ label: "Calorías", value: `${activeVersion.calories} kcal` }, { label: "Proteína", value: `${Math.round(activeVersion.proteinGrams)} g` }, { label: "Hidratos", value: `${Math.round(activeVersion.carbsGrams)} g` }, { label: "Grasas", value: `${Math.round(activeVersion.fatsGrams)} g` }].map(({ label, value }) => <div key={label} className="rounded-2xl bg-[#f7f9f9] p-4"><p className="text-xs text-[#71858c]">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></div>)}</div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#526e75]"><span className="flex items-center gap-1.5"><Clock3 size={14} aria-hidden="true" /> Actualizada {dateLabel(activeVersion.createdAt)}</span><span>{activeVersion.reason} · {activeVersion.mealCount} comidas al día</span></div>
          <div className="mt-6"><Link href="/nutrition/builder/manual?source=active" className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-[#b6503c] px-4 text-sm font-semibold text-white hover:bg-[#963e2f] ${focus}`}><Pencil size={16} aria-hidden="true" /> Configurar dieta activa</Link><p className="mt-2 text-xs leading-5 text-[#526e75]">Al guardar se activa una nueva versión; la actual se conserva en el historial.</p></div>
        </> : <NavigationLink href="/dashboard?tab=nutrition" kind="dashboard" className={`mt-6 ${navigationClass}`}>Volver a nutrición</NavigationLink>}
      </section>}

      {section === "history" && <section className="mt-8 rounded-[1.75rem] border border-[#e9dedb] bg-white p-5 sm:p-7"><h2 className="text-xl font-semibold">Tus versiones</h2><p className="mt-1 text-sm leading-6 text-[#526e75]">Puedes activar una versión anterior. La dieta actual se conservará.</p><NutritionHistoryList versions={versions} /></section>}
    </div>
  </main>;
}

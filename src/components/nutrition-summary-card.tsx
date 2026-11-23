"use client";

import { Apple, ArrowUpRight, Check, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { saveNutritionCompletions } from "@/features/planning/nutrition-completion-client";

type NutritionSummaryCardProps = {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  mealIds: string[];
  todayCompletedMealIds: string[];
  completedDates: string[];
  preview?: boolean;
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function mondayKey(value: string) {
  const date = new Date(`${value}T12:00:00Z`);
  const day = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() + (day === 0 ? -6 : 1 - day));
  return date.toISOString().slice(0, 10);
}

function weekDates(value: string) {
  const monday = new Date(`${mondayKey(value)}T12:00:00Z`);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setUTCDate(date.getUTCDate() + index);
    return date.toISOString().slice(0, 10);
  });
}

export function NutritionSummaryCard({ calories, proteinGrams, carbsGrams, fatsGrams, mealIds, todayCompletedMealIds, completedDates, preview = false }: NutritionSummaryCardProps) {
  const router = useRouter();
  const today = todayKey();
  const [completedMeals, setCompletedMeals] = useState(todayCompletedMealIds);
  const [completedDayDates, setCompletedDayDates] = useState(completedDates);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isComplete = mealIds.length > 0 && completedMeals.length >= mealIds.length;
  const week = weekDates(today);
  const completedThisWeek = week.filter((date) => completedDayDates.includes(date)).length;

  async function toggleDay() {
    if (mealIds.length === 0 || isSaving) return;
    const nextCompleted = !isComplete;
    if (preview) {
      setCompletedMeals(nextCompleted ? mealIds : []);
      setCompletedDayDates(nextCompleted ? [...new Set([...completedDayDates, today])] : completedDayDates.filter((date) => date !== today));
      return;
    }
    setIsSaving(true);
    setError(null);
    const changedIds = mealIds.filter((id) => nextCompleted !== completedMeals.includes(id));
    const { savedIds, failed } = await saveNutritionCompletions(changedIds, nextCompleted, today);
    const nextMeals = nextCompleted ? [...completedMeals, ...savedIds] : completedMeals.filter((id) => !savedIds.includes(id));
    setCompletedMeals(nextMeals);
    setCompletedDayDates(nextMeals.length === mealIds.length ? [...new Set([...completedDayDates, today])] : completedDayDates.filter((date) => date !== today));
    setIsSaving(false);
    if (failed) setError("No hemos podido guardar todas las comidas. Inténtalo de nuevo.");
    router.refresh();
  }

  return (
    <section className="rounded-[1.5rem] border border-[#e1e7eb] bg-white p-6 shadow-[0_12px_36px_rgba(19,43,57,0.05)] sm:p-7">
      <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[#fff0ec] text-[#b6503c]"><Apple size={20} aria-hidden="true" /></span><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#657985]">Tu alimentación</p><h2 className="mt-1 text-lg font-semibold">Nutrición diaria</h2></div></div>{!preview && <a href="/dashboard?tab=nutrition" aria-label="Ver nutrición" className="grid size-10 place-items-center rounded-full border border-[#e2e8eb] text-[#b6503c] hover:bg-[#fff1ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6503c]"><ArrowUpRight size={18} aria-hidden="true" /></a>}</div>
      <div className="mt-7 flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs text-[#526e69]">Referencia diaria</p><p className="mt-1 text-3xl font-semibold tracking-tight">{calories} <span className="text-sm font-medium text-[#526e69]">kcal</span></p></div><div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#526e69]"><span><strong className="text-[#18342f]">{Math.round(proteinGrams)} g</strong> proteína</span><span><strong className="text-[#18342f]">{Math.round(carbsGrams)} g</strong> carbos</span><span><strong className="text-[#18342f]">{Math.round(fatsGrams)} g</strong> grasas</span></div></div>
      {mealIds.length > 0 ? <>
        <div className="mt-6 flex items-center justify-between text-xs font-semibold text-[#9f4b39]"><span>Comidas de hoy</span><span>{completedMeals.length} de {mealIds.length} · {isComplete ? "Día completado" : "Día pendiente"}</span></div>
        <div role="progressbar" aria-label="Comidas completadas hoy" aria-valuenow={Math.min(completedMeals.length, mealIds.length)} aria-valuemin={0} aria-valuemax={mealIds.length} className="mt-2 h-2 overflow-hidden rounded-full bg-[#f4eeec]"><div className="h-full rounded-full bg-[#b6503c] motion-safe:transition-[width]" style={{ width: `${Math.min(100, Math.round((completedMeals.length / mealIds.length) * 100))}%` }} /></div>
        <button type="button" disabled={isSaving} onClick={toggleDay} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#ead7d2] bg-white px-4 text-xs font-semibold text-[#9f4b39] hover:bg-[#fff1ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6503c] disabled:opacity-60">{isSaving ? <LoaderCircle size={15} className="animate-spin" /> : isComplete ? <Check size={15} /> : null}{isComplete ? "Día completado · Desmarcar" : "Completar día"}</button>
        {error ? <p className="mt-2 text-xs font-semibold text-[#a64e3c]">{error}</p> : null}
        <div className="mt-5 border-t border-[#edf1f3] pt-4"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#526e69]">Esta semana</p><span className="text-xs font-semibold text-[#9f4b39]">{completedThisWeek} de 7 días</span></div><div className="mt-3 grid grid-cols-7 gap-1.5">{week.map((date) => { const completed = completedDayDates.includes(date); const isToday = date === today; const label = new Intl.DateTimeFormat("es-ES", { weekday: "short" }).format(new Date(`${date}T12:00:00Z`)).slice(0, 2); return <div key={date} className="text-center"><span className={`mx-auto grid size-7 place-items-center rounded-full text-[10px] font-semibold ${completed ? "bg-[#b6503c] text-white" : isToday ? "border-2 border-[#b6503c] bg-white text-[#9f4b39]" : "bg-[#f4eeec] text-[#526e69]"}`}>{completed ? <Check size={13} /> : "·"}</span><span className={`mt-1 block text-[9px] capitalize ${isToday ? "font-bold text-[#9f4b39]" : "text-[#526e69]"}`}>{label}</span></div>; })}</div>{completedThisWeek === 7 ? <div className="mt-4 rounded-xl border border-[#ead7d2] bg-[#fff1ed] px-3 py-2.5 text-xs font-semibold leading-5 text-[#9f4b39]"><span className="block text-sm">Semana completada</span>Has mantenido tu planificación nutricional durante los 7 días.</div> : null}</div>
      </> : <p className="mt-4 text-sm text-[#526e69]">Genera tu dieta para empezar a registrar tus comidas.</p>}
    </section>
  );
}

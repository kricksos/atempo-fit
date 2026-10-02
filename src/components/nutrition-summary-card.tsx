"use client";

import { Check, Flame, LoaderCircle } from "lucide-react";
import { useState } from "react";

type NutritionSummaryCardProps = {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  mealIds: string[];
  todayCompletedMealIds: string[];
  completedDates: string[];
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

export function NutritionSummaryCard({ calories, proteinGrams, carbsGrams, fatsGrams, mealIds, todayCompletedMealIds, completedDates }: NutritionSummaryCardProps) {
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
    const previousMeals = completedMeals;
    const previousDates = completedDayDates;
    const nextCompleted = !isComplete;
    setIsSaving(true);
    setError(null);
    setCompletedMeals(nextCompleted ? mealIds : []);
    setCompletedDayDates(nextCompleted ? [...new Set([...completedDayDates, today])] : completedDayDates.filter((date) => date !== today));

    const responses = await Promise.all(mealIds.map((mealId) => fetch("/api/plans/nutrition/completion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mealId, completed: nextCompleted, date: today }),
    })));
    setIsSaving(false);
    if (responses.some((response) => !response.ok)) {
      setCompletedMeals(previousMeals);
      setCompletedDayDates(previousDates);
      setError("No hemos podido guardar el día. Inténtalo de nuevo.");
    }
  }

  return (
    <section className="rounded-3xl border border-[#d3dbcf] bg-[#f8f7f1] p-6">
      <Flame className="text-[#72873f]" />
      <p className="mt-10 text-sm text-[#819078]">Nutrición diaria</p>
      <h2 className="mt-2 text-2xl font-semibold">{calories} kcal</h2>
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#68736b]"><span><strong className="text-[#18231f]">{Math.round(proteinGrams)}g</strong> proteína</span><span><strong className="text-[#18231f]">{Math.round(carbsGrams)}g</strong> carbos</span><span><strong className="text-[#18231f]">{Math.round(fatsGrams)}g</strong> grasas</span></div>
      {mealIds.length > 0 ? <>
        <div className="mt-4 flex items-center justify-between text-xs text-[#68736b]"><span>{completedMeals.length} de {mealIds.length} comidas hechas hoy</span><span>{isComplete ? "Día completado" : "Día pendiente"}</span></div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#e3e7dd]"><div className="h-full rounded-full bg-[#72873f] transition-all" style={{ width: `${Math.round((completedMeals.length / mealIds.length) * 100)}%` }} /></div>
        <button type="button" disabled={isSaving} onClick={toggleDay} className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold transition ${isComplete ? "border border-[#72873f] bg-[#e7f5b4] text-[#60703d]" : "bg-[#18231f] text-white"} disabled:opacity-60`}>{isSaving ? <LoaderCircle size={15} className="animate-spin" /> : isComplete ? <Check size={15} /> : null}{isComplete ? "Día completado · Desmarcar" : "Completar día"}</button>
        {error ? <p className="mt-2 text-xs font-semibold text-[#a64e3c]">{error}</p> : null}
        <div className="mt-5 border-t border-[#d3dbcf] pt-4"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#819078]">Esta semana</p><span className="text-xs font-semibold text-[#60703d]">{completedThisWeek} de 7 días</span></div><div className="mt-3 grid grid-cols-7 gap-1.5">{week.map((date) => { const completed = completedDayDates.includes(date); const isToday = date === today; const label = new Intl.DateTimeFormat("es-ES", { weekday: "short" }).format(new Date(`${date}T12:00:00Z`)).slice(0, 2); return <div key={date} className="text-center"><span className={`mx-auto grid size-7 place-items-center rounded-full text-[10px] font-semibold ${completed ? "bg-[#72873f] text-white" : isToday ? "border-2 border-[#72873f] bg-white text-[#60703d]" : "bg-[#dfe4d8] text-[#819078]"}`}>{completed ? <Check size={13} /> : "·"}</span><span className={`mt-1 block text-[9px] capitalize ${isToday ? "font-bold text-[#60703d]" : "text-[#819078]"}`}>{label}</span></div>; })}</div>{completedThisWeek === 7 ? <div className="mt-4 rounded-xl border border-[#b6c77b] bg-[#e7f5b4] px-3 py-2.5 text-xs font-semibold leading-5 text-[#3d4a24]"><span className="block text-sm">Semana completada</span>Has mantenido tu planificación nutricional durante los 7 días.</div> : null}</div>
      </> : <p className="mt-4 text-sm text-[#68736b]">Genera tu dieta para empezar a registrar tus comidas.</p>}
    </section>
  );
}

"use client";

import { useState } from "react";
import { ChevronRight, CircleHelp, Sparkles, Zap } from "lucide-react";
import Link from "next/link";

import { DashboardTabs } from "@/components/dashboard-tabs";
import { NextStepPanel, PlanReviewNotice } from "@/components/next-step-panel";
import { NutritionPlan } from "@/components/nutrition-plan";
import { NutritionSummaryCard } from "@/components/nutrition-summary-card";
import { ProgressCheckinForm } from "@/components/progress-checkin-form";
import { ProgressReviewBanner } from "@/components/progress-review-banner";
import { ProgressSummaryCard } from "@/components/progress-summary-card";
import { TrainingDaysPanel } from "@/components/training-days-panel";
import { TrainingManagementCard } from "@/components/training-management-card";
import { WeeklyActivityCard } from "@/components/weekly-activity-card";

export function DashboardDesignPreview({ colorStudy = false }: { colorStudy?: boolean }) {
  const [notice, setNotice] = useState("");
  const [reviewPending, setReviewPending] = useState(true);
  const previewOnly = (section: string) => setNotice(`${section}: este apartado se revisará por separado. Esta vista no modifica datos.`);
  const review = { planReviewPending: reviewPending, planReviewMessage: "Hace tiempo que no actualizas tu evolución. Revisa tus datos para seguir ajustando el plan.", planReviewHref: "#", planReviewAction: "Actualizar evolución" };
  const nextStep = { completedToday: false, workoutLabel: "Cuerpo completo", workoutHref: null, hasProfile: true, workoutDetails: { day: 2, days: 3, variant: "Variante A", muscles: "Pectoral · Dorsal · Cuádriceps", exerciseCount: 6, estimatedMinutes: 45 }, onPreviewAction: () => previewOnly("Comenzar sesión") };
  const sampleMeals = [
    { id: "breakfast", name: "Desayuno", suggestedTime: "08:00", targetCalories: 500, items: [{ id: "yogurt", name: "Yogur natural", quantityGrams: 200, role: "dairy", alternativeGroup: null }] },
    { id: "lunch", name: "Comida fuera de casa", suggestedTime: "14:00", targetCalories: 700, items: [{ id: "chicken", name: "Pechuga de pollo", quantityGrams: 150, role: "protein", alternativeGroup: "protein" }, { id: "rice", name: "Arroz cocido", quantityGrams: 180, role: "carbohydrate", alternativeGroup: null }] },
    { id: "dinner", name: "Cena", suggestedTime: "21:00", targetCalories: 550, items: [{ id: "vegetables", name: "Brócoli", quantityGrams: 200, role: "vegetable", alternativeGroup: null }] },
  ];
  const sampleToday = new Date();
  const sampleCompletedDates = Array.from({ length: sampleToday.getDay() === 1 ? 1 : 2 }, (_, index) => {
    const date = new Date(sampleToday);
    date.setDate(date.getDate() - index);
    return date.toISOString().slice(0, 10);
  });
  const sampleMealIds = sampleMeals.map((meal) => meal.id);
  const measurement = { measuredAt: "2026-01-20", weightKg: 72.4, waistCm: 80, chestCm: 95, armCm: 32, thighCm: 54 };
  const trainingDays = [
    { id: "00000000-0000-4000-8000-000000000001", name: "Cuerpo completo A", exerciseCount: 7, muscleSummary: "Pectoral · Dorsal · Cuádriceps" },
    { id: "00000000-0000-4000-8000-000000000002", name: "Tren superior A", exerciseCount: 6, muscleSummary: "Pectoral · Tríceps" },
    { id: "00000000-0000-4000-8000-000000000003", name: "Tren inferior A", exerciseCount: 6, muscleSummary: "Cuádriceps · Glúteos" },
  ];
  const activityCard = <WeeklyActivityCard activeDays={2} targetDays={3} completed={false} currentStreak={2} />;
  const nutritionCard = <NutritionSummaryCard calories={2100} proteinGrams={140} carbsGrams={240} fatsGrams={65} mealIds={sampleMealIds} todayCompletedMealIds={sampleMealIds} completedDates={sampleCompletedDates} preview />;
  const progressCard = <ProgressSummaryCard currentWeightKg={72.4} startingWeightKg={74.1} targetWeightKg={70} weightDeltaKg={-1.7} daysSinceLastMeasurement={1} primaryGoal="Recomposición corporal" preview />;

  return <main className="min-h-screen bg-[#f4f6f8] px-4 py-4 text-[#172f3b] sm:px-7 sm:py-7">
    <div className="mx-auto max-w-[1320px]">
      <div role="status" className="mb-4 rounded-2xl border border-[#d4dfcb] bg-white/80 px-4 py-3 text-xs leading-5 text-[#52644f]">
        <strong>{colorStudy ? "Colores aplicados · Dashboard." : "Propuesta de diseño · Dashboard."}</strong> Datos ficticios; puedes desplegar los detalles y probar el cardio, pero no se guarda ni modifica nada.
        <button type="button" aria-pressed={reviewPending} onClick={() => setReviewPending(!reviewPending)} className="ml-3 min-h-10 rounded-full border border-[#b8cdb1] bg-white px-3 font-semibold text-[#3d5537] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#536b2c]">{reviewPending ? "Ocultar aviso de ejemplo" : "Mostrar aviso de ejemplo"}</button>
        {colorStudy && <Link href="/preview-dashboard" className="ml-3 inline-flex min-h-10 items-center font-semibold text-[#315d5a] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f]">Ver la muestra general</Link>}
      </div>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d6e5e2] pb-5">
        <div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#163e49] text-[#a6eee0]"><Sparkles size={20} aria-hidden="true" /></span><div><p className="text-lg font-bold leading-tight tracking-tight">Atempo <span className="font-medium text-[#5e7d79]">Fit</span></p><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#607d79]">Tu espacio personal</p></div></div>
        <div className="flex items-center gap-2"><button type="button" onClick={() => previewOnly("Logros")} className="flex min-h-11 items-center gap-2 rounded-full border border-[#d9e3d6] bg-white px-3 text-xs font-semibold text-[#38543c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#536b2c]"><Zap size={15} aria-hidden="true" /> Nivel 4 <span className="hidden text-[#7b8b7b] sm:inline">· 420 XP</span></button><button type="button" aria-label="Mi cuenta" onClick={() => previewOnly("Cuenta")} className="flex min-h-11 items-center gap-2 rounded-full border border-[#d9e3d6] bg-white py-1 pl-1 pr-3 text-xs font-semibold text-[#314436] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#536b2c]"><span className="grid size-8 place-items-center rounded-full bg-[#e6f2d5] text-[#4c6639]">A</span><span className="hidden sm:inline">Mi cuenta</span><ChevronRight size={14} aria-hidden="true" /></button></div>
      </header>
      <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
        <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#39726e]"><span className="size-2 rounded-full bg-[#39726e]" /> Tu espacio de progreso</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Tu ritmo. Tu progreso.</h1><p className="mt-2 text-sm leading-6 text-[#526e6b]">Todo lo que necesitas para seguir avanzando, en un solo lugar.</p></div>
        <span className="rounded-full border border-[#d1e2de] bg-white px-4 py-2 text-xs font-semibold text-[#46645f]">Tu semana, de un vistazo</span>
      </div>
      {notice && <p role="status" className="mt-4 rounded-xl border border-[#d5e6ca] bg-[#edf6e4] px-4 py-3 text-sm text-[#3e613b]">{notice}</p>}
      <DashboardTabs
        overview={<><div className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr]"><NextStepPanel {...nextStep} />{activityCard}</div><div className="mt-4 grid gap-4 md:grid-cols-2">{nutritionCard}{progressCard}</div></>}
        trainingStep={<NextStepPanel {...nextStep} compact />}
        reviewNotice={reviewPending ? <PlanReviewNotice message={review.planReviewMessage} href={review.planReviewHref} action={review.planReviewAction} /> : null}
        trainingManagement={<div onClickCapture={(event) => { if ((event.target as HTMLElement).closest("a")) { event.preventDefault(); event.stopPropagation(); } }}><TrainingManagementCard /></div>}
        training={<div onClickCapture={(event) => { if ((event.target as HTMLElement).closest("a")) { event.preventDefault(); event.stopPropagation(); } }}><TrainingDaysPanel days={trainingDays} scheduledId={trainingDays[1].id} scheduledIndex={1} completedToday={false} nameFor={(name) => name.slice(0, -2)} variantFor={(name) => `Variante ${name.slice(-1)}`} cardioPreferences={[]} additionalSuggestions={[]} defaultCardio={null} preview /></div>}
        nutrition={<div onClickCapture={(event) => { if ((event.target as HTMLElement).closest("a")) { event.preventDefault(); event.stopPropagation(); } }}><NutritionPlan meals={sampleMeals} alternatives={{ protein: ["Pavo", "Tofu firme"] }} foodIds={{}} mealCount={3} todayCompletedMealIds={sampleMealIds} completedDates={sampleCompletedDates} reference={{ calories: 2100, proteinGrams: 140, carbsGrams: 240, fatsGrams: 65 }} mealsOutSlots={["lunch"]} readOnly /></div>}
        progress={<div onClickCapture={(event) => { if ((event.target as HTMLElement).closest("a")) { event.preventDefault(); event.stopPropagation(); } }} className="space-y-6"><ProgressReviewBanner href="#" /><fieldset disabled><ProgressCheckinForm latestCheckin={null} initialTargetWeightKg={70} latestMeasurement={measurement} previousMeasurement={{ ...measurement, measuredAt: "2026-01-01", weightKg: 74.1 }} primaryGoal="Pérdida de peso" activeInjuries={[]} activeFoodRestrictions={[]} disablePersonalizationSave /></fieldset></div>}
      />
      <p className="mb-8 flex items-start gap-2 text-xs leading-5 text-[#758675]"><CircleHelp size={15} className="shrink-0" aria-hidden="true" /> Las cifras y acciones son de ejemplo.</p>
    </div>
  </main>;
}

"use client";

import { ArrowLeft, ArrowRight, Check, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import { AppHeader } from "@/components/app-header";
import { foodRestrictionOptions } from "@/lib/food-restrictions";
import { injuryOptions } from "@/lib/injuries";

const loadingStages = [
  "Cargando tu información...",
  "Analizando tus respuestas...",
  "Ajustando tu entrenamiento...",
  "Ajustando tu nutrición...",
  "Preparando tu plan actualizado...",
];

const goalOptions = ["Ganar masa muscular", "Perder grasa", "Recomposición corporal", "Mantener peso", "Mejorar rendimiento", "Mejorar salud general"];
const daysOptions = ["2 días", "3 días", "4 días", "5 días", "6 días"];
const durationOptions = ["30 minutos", "45 minutos", "60 minutos", "90 minutos"];
const placeOptions = ["Gimnasio completo", "Gimnasio básico", "Casa", "Mixto"];
const selfReportOptions = [
  { value: "bien" as const, label: "Voy bien, sigo con mi rutina y dieta" },
  { value: "estancado" as const, label: "Siento que estoy estancado/a" },
];

type CheckinWizardProps = {
  initialGoal: string;
  initialDaysPerWeek: number;
  initialSessionDuration: number;
  initialTrainingPlace: string;
  initialInjuries: string[];
  initialFoodRestrictions: string[];
  mode: "workout" | "nutrition" | "general";
  email: string;
  name: string;
};

type Step = { key: string; title: string; description: string; options: readonly string[] };

const steps: Step[] = [
  { key: "goal", title: "¿Sigues con el mismo objetivo?", description: "Si algo ha cambiado, ajustamos tu plan a partir de aquí.", options: goalOptions },
  { key: "days", title: "¿Cuántos días puedes entrenar ahora?", description: "Puede que tu disponibilidad haya cambiado desde que empezaste.", options: daysOptions },
  { key: "duration", title: "¿Cuánto tiempo tienes por sesión?", description: "Ajustaremos el volumen de tu rutina a tu tiempo real.", options: durationOptions },
  { key: "place", title: "¿Dónde entrenas ahora?", description: "Si cambiaste de gimnasio o entrenas en casa, lo tenemos en cuenta.", options: placeOptions },
  { key: "foodRestrictions", title: "¿Qué alergias o intolerancias debemos tener en cuenta?", description: "Estas selecciones se aplicarán directamente a tu nueva dieta.", options: foodRestrictionOptions },
  { key: "injuries", title: "¿Qué zonas debemos proteger en tu rutina?", description: "Estas selecciones se usarán para evitar ejercicios incompatibles y buscar sustituciones seguras.", options: injuryOptions },
  { key: "selfReport", title: "¿Cómo sientes que va tu progreso?", description: "Tú conoces tu cuerpo mejor que cualquier gráfico.", options: selfReportOptions.map((option) => option.label) },
];

export function CheckinWizard({ initialGoal, initialDaysPerWeek, initialSessionDuration, initialTrainingPlace, initialInjuries, initialFoodRestrictions, mode, email, name }: CheckinWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [goal, setGoal] = useState(initialGoal);
  const [days, setDays] = useState(`${initialDaysPerWeek} días`);
  const [duration, setDuration] = useState(`${initialSessionDuration} minutos`);
  const [place, setPlace] = useState(initialTrainingPlace);
  const [foodRestrictions, setFoodRestrictions] = useState<string[]>(initialFoodRestrictions);
  const [injuries, setInjuries] = useState<string[]>(initialInjuries);
  const [selfReportLabel, setSelfReportLabel] = useState(mode === "workout" ? "Voy bien con mi rutina" : mode === "nutrition" ? "Voy bien con mi alimentación" : selfReportOptions[0].label);
  const [isSaving, setIsSaving] = useState(false);
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ action: string; changed: string[] } | null>(null);
  const [recommendation, setRecommendation] = useState<{ recommendation: string; changed: string[] } | null>(null);
  const stageTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const contextualSelfReportOptions = mode === "workout"
    ? [{ value: "bien" as const, label: "Voy bien con mi rutina" }, { value: "estancado" as const, label: "Siento que estoy estancado/a con mi entrenamiento" }]
    : mode === "nutrition"
      ? [{ value: "bien" as const, label: "Voy bien con mi alimentación" }, { value: "estancado" as const, label: "Siento que estoy estancado/a con mi alimentación" }]
      : selfReportOptions;
  const visibleSteps = steps
    .filter((item) => mode === "general" || (mode === "workout" ? item.key !== "foodRestrictions" : ["goal", "foodRestrictions", "selfReport"].includes(item.key)))
    .map((item) => item.key === "selfReport" ? { ...item, options: contextualSelfReportOptions.map((option) => option.label) } : item);
  const step = visibleSteps[currentIndex];
  const progress = Math.round(((currentIndex + 1) / visibleSteps.length) * 100);
  const valueByKey: Record<string, string | string[]> = { goal, days, duration, place, foodRestrictions, injuries, selfReport: selfReportLabel };

  function select(value: string) {
    if (step.key === "foodRestrictions") {
      if (value === "Ninguna") { setFoodRestrictions(["Ninguna"]); return; }
      const withoutNone = foodRestrictions.filter((item) => item !== "Ninguna");
      setFoodRestrictions(withoutNone.includes(value) ? withoutNone.filter((item) => item !== value) : [...withoutNone, value]);
      return;
    }
    if (step.key === "injuries") {
      if (value === "Ninguna") { setInjuries(["Ninguna"]); return; }
      const withoutNone = injuries.filter((item) => item !== "Ninguna");
      setInjuries(withoutNone.includes(value) ? withoutNone.filter((item) => item !== value) : [...withoutNone, value]);
      return;
    }
    if (step.key === "goal") setGoal(value);
    if (step.key === "days") setDays(value);
    if (step.key === "duration") setDuration(value);
    if (step.key === "place") setPlace(value);
    if (step.key === "selfReport") setSelfReportLabel(value);
  }

  async function submit(confirm = false) {
    if (confirm) setRecommendation(null);
    setIsSaving(true);
    setLoadingStageIndex(0);
    setError(null);
    stageTimer.current = setInterval(() => {
      setLoadingStageIndex((index) => Math.min(index + 1, loadingStages.length - 1));
    }, 750);
    const payload = {
      goal,
      daysPerWeek: Number(days.match(/\d+/)?.[0] ?? 3),
      sessionDuration: Number(duration.match(/\d+/)?.[0] ?? 60),
      trainingPlace: place,
      foodRestrictions: foodRestrictions.filter((label) => label !== "Ninguna"),
      injuries: injuries.filter((label) => label !== "Ninguna"),
      selfReport: contextualSelfReportOptions.find((option) => option.label === selfReportLabel)?.value ?? "bien",
      mode,
      confirm,
    };
    const minimumDisplay = new Promise((resolve) => setTimeout(resolve, loadingStages.length * 750));
    try {
      const [response] = await Promise.all([
        fetch("/api/profile/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }),
        minimumDisplay,
      ]);
      if (!response.ok) throw new Error("No hemos podido guardar tu revisión.");
      const data = await response.json();
      setLoadingStageIndex(loadingStages.length - 1);
      if (data.action === "recommendation") setRecommendation(data);
      else setResult(data);
    } catch {
      setError("No hemos podido guardar tu revisión. Inténtalo de nuevo.");
    } finally {
      if (stageTimer.current) clearInterval(stageTimer.current);
      setIsSaving(false);
    }
  }

  function goNext() {
    if (currentIndex === visibleSteps.length - 1) {
      submit();
      return;
    }
    setCurrentIndex((index) => Math.min(index + 1, steps.length - 1));
  }

  if (recommendation) {
    const recommendationCopy: Record<string, { title: string; text: string; action: string }> = {
      keep_plan: { title: "Tu plan sigue encajando", text: "No hemos detectado cambios estructurales. Puedes mantener tu dieta y tu rutina actuales.", action: "Mantener mi plan" },
      review_progress: { title: "Conviene revisar tu progreso", text: "Nos has indicado que sientes estancamiento. Podemos analizar adherencia, peso y entrenamiento antes de tocar el plan.", action: "Analizar mi progreso" },
      update_plan: { title: "Hemos detectado cambios", text: "Tus respuestas modifican aspectos que afectan a tu dieta o tu rutina. Puedes aplicar una nueva versión con estos datos.", action: "Aplicar actualización" },
      review_health: { title: "La seguridad va primero", text: "Has indicado un cambio relacionado con molestias o lesiones. Revisaremos tu rutina con especial cuidado antes de aplicar cambios.", action: "Revisar y adaptar" },
    };
    const copy = recommendationCopy[recommendation.recommendation] ?? recommendationCopy.update_plan;
    return <main className="min-h-screen bg-[#f4f1e9] px-5 py-6 text-[#18231f] sm:px-8 sm:py-8"><div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-2xl flex-col items-center justify-center text-center"><span className="grid size-14 place-items-center rounded-2xl bg-[#e7f5b4] text-[#60703d]"><Check size={26} /></span><p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-[#819078]">Revisión de tu plan</p><h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{copy.title}</h1><p className="mt-4 max-w-lg leading-7 text-[#68736b]">{copy.text}</p>{recommendation.changed.length > 0 ? <p className="mt-5 text-sm text-[#819078]">Tenemos en cuenta: {recommendation.changed.join(", ")}.</p> : null}<div className="mt-8 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => submit(true)} className="rounded-full bg-[#18231f] px-6 py-3 text-sm font-semibold text-white">{copy.action}</button><button type="button" onClick={() => setRecommendation(null)} className="rounded-full border border-[#cfd7c8] px-6 py-3 text-sm font-semibold text-[#68736b]">Revisar respuestas</button></div></div></main>;
  }

  if (isSaving || result) {
    const loadingProgress = result ? 100 : Math.round(((loadingStageIndex + 1) / loadingStages.length) * 100);
    const messages: Record<string, string> = {
      regenerated_workout: "Hemos generado una nueva versión de tu rutina. Tu dieta se mantiene sin cambios.",
      regenerated_nutrition: "Hemos generado una nueva versión de tu dieta. Tu rutina se mantiene sin cambios.",
      regenerated_both: "Hemos generado nuevas versiones de tu rutina y tu dieta con estos cambios.",
      adjusted: "Hemos revisado tu progreso y reajustado lo que hacía falta.",
      no_change: "Todo sigue igual: no hemos hecho ningún cambio.",
      profile_updated_only: "Hemos guardado tus respuestas. Genera tu plan inicial para que se apliquen.",
    };

    return (
      <main className="min-h-screen bg-[#f4f1e9] px-5 py-6 text-[#18231f] sm:px-8 sm:py-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-2xl flex-col items-center justify-center text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-[#18231f] text-[#d7f36b]">
            {result ? <Check size={26} /> : <LoaderCircle size={26} className="animate-spin" />}
          </span>
          <h1 className="mt-8 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{result ? "Revisión completada." : loadingStages[loadingStageIndex]}</h1>
          <p className="mt-3 max-w-md text-[#68736b]">{result ? (messages[result.action] ?? "Hemos guardado tu revisión.") : "Estamos recalculando tu plan con tus nuevos datos."}</p>
          <div className="mt-8 h-2 w-full max-w-sm overflow-hidden rounded-full bg-[#dfe4d8]"><div className="h-full rounded-full bg-[#72873f] transition-all duration-500" style={{ width: `${loadingProgress}%` }} /></div>
          <ul className="mt-8 space-y-2 text-left">
            {loadingStages.map((stage, index) => (
              <li key={stage} className={`flex items-center gap-2 text-sm ${result || index <= loadingStageIndex ? "text-[#3d4a24] font-semibold" : "text-[#a7b09c]"}`}>
                {result || index < loadingStageIndex ? <Check size={15} className="text-[#72873f]" /> : index === loadingStageIndex ? <LoaderCircle size={15} className="animate-spin" /> : <span className="size-[15px]" />}
                {stage}
              </li>
            ))}
          </ul>
          {result ? (
            <>
              {result.changed.length > 0 ? <p className="mt-6 text-sm text-[#819078]">Cambios detectados: {result.changed.join(", ")}</p> : null}
              <Link href="/dashboard" className="mt-8 inline-flex rounded-full bg-[#18231f] px-6 py-3 text-sm font-semibold text-white">Volver a mi panel</Link>
            </>
          ) : null}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-5 py-6 text-[#18231f] sm:px-8 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-3xl flex-col">
        <AppHeader email={email} name={name} />
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-[#819078]">{mode === "workout" ? "Actualización de entrenamiento" : mode === "nutrition" ? "Actualización de nutrición" : "Revisión general del plan"}</p>
        <p className="mt-2 max-w-xl text-sm leading-6 text-[#68736b]">{mode === "workout" ? "Revisaremos tu información para adaptar tu rutina. Tu dieta se mantendrá sin cambios." : mode === "nutrition" ? "Revisaremos tu información para adaptar tu dieta. Tu rutina se mantendrá sin cambios." : "Revisaremos tus datos para comprobar si conviene actualizar tu rutina, tu dieta o ambas."}</p>
        <p className="mt-4 text-sm text-[#68736b]">Paso {currentIndex + 1} de {visibleSteps.length}</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#dfe4d8]"><div className="h-full rounded-full bg-[#72873f] transition-all duration-300" style={{ width: `${progress}%` }} /></div>
        <section className="flex flex-1 flex-col justify-center py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#819078]">{progress}% completado</p>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.06em] sm:text-6xl">{step.title}</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-[#68736b]">{step.description}</p>
          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
            {step.options.map((option) => {
              const currentValue = valueByKey[step.key];
              const selected = Array.isArray(currentValue) ? currentValue.includes(option) : currentValue === option;
              return (
                <button type="button" key={option} onClick={() => select(option)} className={`flex min-h-16 items-center justify-between rounded-2xl border px-5 text-left transition ${selected ? "border-[#72873f] bg-[#e7f5b4]" : "border-[#d3dbcf] bg-[#f8f7f1] hover:border-[#9aaa89]"}`}>
                  <span className="font-medium">{option}</span>
                  {selected ? <Check size={19} className="text-[#60703d]" /> : null}
                </button>
              );
            })}
          </div>
          {error ? <p className="mt-6 text-sm font-medium text-[#a64e3c]">{error}</p> : null}
        </section>
        <footer className="flex items-center justify-between border-t border-[#d9ddd3] pt-5">
          <button type="button" disabled={currentIndex === 0 || isSaving} onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))} className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#68736b] disabled:opacity-40"><ArrowLeft size={17} /> Anterior</button>
          <button type="button" disabled={isSaving} onClick={goNext} className="inline-flex items-center gap-2 rounded-full bg-[#18231f] px-6 py-3 text-sm font-semibold text-[#f6f4ed] disabled:cursor-not-allowed disabled:opacity-40">
            {isSaving ? <LoaderCircle size={17} className="animate-spin" /> : currentIndex === visibleSteps.length - 1 ? <>Terminar revisión <Check size={17} /></> : <>Siguiente <ArrowRight size={17} /></>}
          </button>
        </footer>
      </div>
    </main>
  );
}

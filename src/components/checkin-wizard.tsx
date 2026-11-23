"use client";

import { NavigationAnchor, NavigationButton, NavigationLink } from "@/components/navigation-control";
import { ArrowRight, Check, LoaderCircle } from "lucide-react";
import { useRef, useState } from "react";

import { AppHeader } from "@/components/app-header";
import { EquipmentSelector } from "@/components/equipment-selector";
import { checkinRecommendationSchema, checkinResultSchema, type CheckinRecommendation } from "@/features/planning/checkin-proposal";
import { foodRestrictionOptions } from "@/lib/food-restrictions";
import { equipmentFromLabels, homeEquipmentLabelsFromValues, homeEquipmentOptions, type ExerciseEquipment } from "@/lib/exercise-equipment";
import { injuryOptions } from "@/lib/injuries";
import { trainingPlaces, type TrainingPlace } from "@/lib/training-place";
import { continuityOptions, experienceOptions, techniqueOptions, undisclosedTrainingAnswer } from "@/lib/training-experience";

const goalOptions = ["Ganar masa muscular", "Perder grasa", "Recomposición corporal", "Mantener peso", "Mejorar rendimiento", "Mejorar salud general"];
const daysOptions = ["2 días", "3 días", "4 días", "5 días", "6 días"];
const durationOptions = ["30 minutos", "45 minutos", "60 minutos", "90 minutos"];
const placeOptions = trainingPlaces.map((place) => place.value);
const selfReportOptions = [
  { value: "bien" as const, label: "Mantener mi plan", description: "Conservar mi entrenamiento y mi alimentación sin generar versiones nuevas." },
  { value: "actualizar" as const, label: "Actualizar mi plan", description: "Preparar una rutina con mis respuestas y generar una nueva dieta al activar el plan." },
];

type CheckinWizardProps = {
  initialGoal: string;
  initialExperience: string;
  initialContinuity: string | null;
  initialTechnique: string | null;
  initialDaysPerWeek: number;
  initialSessionDuration: number;
  initialTrainingPlace: TrainingPlace;
  initialTrainingEquipment: ExerciseEquipment[] | null;
  initialInjuries: string[];
  initialFoodRestrictions: string[];
  mode: "workout" | "nutrition" | "general";
  email: string;
  name: string;
};

type Step = { key: string; title: string; description: string; options: readonly string[] };

const steps: Step[] = [
  { key: "goal", title: "¿Sigues con el mismo objetivo?", description: "Si algo ha cambiado, ajustamos tu plan a partir de aquí.", options: goalOptions },
  { key: "experience", title: "¿Cuál es tu experiencia entrenando?", description: "Cuenta tu experiencia acumulada en entrenamiento de fuerza.", options: experienceOptions },
  { key: "continuity", title: "¿Cómo ha sido tu entrenamiento de fuerza recientemente?", description: "La continuidad importa además de los años acumulados.", options: [...continuityOptions, undisclosedTrainingAnswer] },
  { key: "technique", title: "¿Cómo valoras tu experiencia técnica?", description: "Es una autoevaluación orientativa, no una valoración profesional.", options: [...techniqueOptions, undisclosedTrainingAnswer] },
  { key: "days", title: "¿Cuántos días puedes entrenar ahora?", description: "Puede que tu disponibilidad haya cambiado desde que empezaste.", options: daysOptions },
  { key: "duration", title: "¿Cuánto tiempo tienes para fuerza por sesión?", description: "El tiempo es orientativo e incluye calentamiento y descansos. El cardio se añade aparte.", options: durationOptions },
  { key: "place", title: "¿Dónde entrenas ahora?", description: "Si cambiaste de gimnasio o entrenas en casa, lo tenemos en cuenta.", options: placeOptions },
  { key: "equipment", title: "¿Qué material tienes en casa?", description: "Marca el material básico del que dispones o elige «Sin material».", options: ["Sin material", ...homeEquipmentOptions.map((option) => option.label)] },
  { key: "foodRestrictions", title: "¿Qué alergias o intolerancias debemos tener en cuenta?", description: "Estas selecciones se aplicarán directamente a tu nueva dieta.", options: foodRestrictionOptions },
  { key: "injuries", title: "¿Qué zonas debemos proteger en tu rutina?", description: "Tendremos en cuenta las restricciones registradas. Ante molestias o lesiones, consulta a un profesional.", options: injuryOptions },
  { key: "selfReport", title: "¿Qué te gustaría hacer ahora?", description: "Elige cómo quieres continuar. Nada cambia hasta que lo confirmes.", options: selfReportOptions.map((option) => option.label) },
];

export function CheckinWizard({ initialGoal, initialExperience, initialContinuity, initialTechnique, initialDaysPerWeek, initialSessionDuration, initialTrainingPlace, initialTrainingEquipment, initialInjuries, initialFoodRestrictions, mode, email, name }: CheckinWizardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [goal, setGoal] = useState(initialGoal);
  const [experience, setExperience] = useState(initialExperience);
  const [continuity, setContinuity] = useState(initialContinuity ?? "");
  const [technique, setTechnique] = useState(initialTechnique ?? "");
  const [days, setDays] = useState(`${initialDaysPerWeek} días`);
  const [duration, setDuration] = useState(`${initialSessionDuration} minutos`);
  const [place, setPlace] = useState(initialTrainingPlace);
  const [equipment, setEquipment] = useState<string[]>(initialTrainingEquipment === null ? [] : initialTrainingEquipment.length ? homeEquipmentLabelsFromValues(initialTrainingEquipment) : ["Sin material"]);
  const [foodRestrictions, setFoodRestrictions] = useState<string[]>(initialFoodRestrictions);
  const [injuries, setInjuries] = useState<string[]>(initialInjuries);
  const [selfReport, setSelfReport] = useState<"" | "bien" | "actualizar">("");
  const [isSaving, setIsSaving] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [loadingStageIndex, setLoadingStageIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ action: string; changed: string[]; result?: { adjusted: boolean } } | null>(null);
  const [recommendation, setRecommendation] = useState<CheckinRecommendation | null>(null);
  const stageTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const preparationStages = [
    "Cargando tu información...",
    "Analizando tus respuestas...",
    ...(mode !== "nutrition" ? ["Revisando tu entrenamiento..."] : []),
    ...(mode !== "workout" ? ["Revisando tu nutrición..."] : []),
    "Preparando el resultado...",
  ];
  const loadingStages = isActivating
    ? [mode === "general" ? "Comprobando y guardando tu nuevo plan..." : "Comprobando y guardando tu nueva rutina...", "Confirmación de la activación"]
    : preparationStages;

  const contextualSelfReportOptions = mode === "workout"
    ? [{ value: "bien" as const, label: "Mantener mi rutina", description: "Conservar mi rutina actual sin generar una nueva." }, { value: "actualizar" as const, label: "Actualizar mi rutina", description: "Preparar una nueva rutina con mis respuestas y decidir si activarla." }]
    : mode === "nutrition"
      ? [{ value: "bien" as const, label: "Mantener mi alimentación", description: "Conservar mi dieta actual sin generar una nueva." }, { value: "actualizar" as const, label: "Actualizar mi alimentación", description: "Generar una nueva dieta con mis respuestas cuando lo confirme." }]
      : selfReportOptions;
  const visibleSteps = steps
    .filter((item) => mode === "general" || (mode === "workout" ? item.key !== "foodRestrictions" : ["goal", "foodRestrictions", "selfReport"].includes(item.key)))
    .filter((item) => item.key !== "equipment" || place === "Casa")
    .map((item) => item.key === "selfReport" ? { ...item, options: contextualSelfReportOptions.map((option) => option.label) } : item);
  const step = visibleSteps[currentIndex];
  const progress = Math.round(((currentIndex + 1) / visibleSteps.length) * 100);
  const valueByKey: Record<string, string | string[]> = { goal, experience, continuity, technique, days, duration, place, equipment, foodRestrictions, injuries, selfReport: contextualSelfReportOptions.find((option) => option.value === selfReport)?.label ?? "" };

  function select(value: string) {
    if (step.key === "equipment") {
      if (value === "Sin material") { setEquipment(["Sin material"]); return; }
      const withoutNone = equipment.filter((item) => item !== "Sin material");
      setEquipment(withoutNone.includes(value) ? withoutNone.filter((item) => item !== value) : [...withoutNone, value]);
      return;
    }
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
    if (step.key === "experience") setExperience(value);
    if (step.key === "continuity") setContinuity(value);
    if (step.key === "technique") setTechnique(value);
    if (step.key === "days") setDays(value);
    if (step.key === "duration") setDuration(value);
    if (step.key === "place") {
      if (value !== place) setEquipment([]);
      const selectedPlace = trainingPlaces.find((item) => item.value === value);
      if (selectedPlace) setPlace(selectedPlace.value);
    }
    if (step.key === "selfReport") setSelfReport(contextualSelfReportOptions.find((option) => option.label === value)?.value ?? "");
  }

  async function submit(confirm = false, proposalToken?: string) {
    const activating = confirm && recommendation?.recommendation === "activate_workout";
    if (confirm) setRecommendation(null);
    setIsActivating(activating);
    setIsSaving(true);
    setLoadingStageIndex(0);
    setError(null);
    if (!activating) {
      stageTimer.current = setInterval(() => {
        setLoadingStageIndex((index) => Math.min(index + 1, preparationStages.length - 1));
      }, 750);
    }
    const payload = {
      goal,
      ...(mode !== "nutrition" ? {
        experience,
        trainingContinuity: continuity === undisclosedTrainingAnswer ? null : continuity,
        trainingTechnique: technique === undisclosedTrainingAnswer ? null : technique,
      } : {}),
      daysPerWeek: Number(days.match(/\d+/)?.[0] ?? 3),
      sessionDuration: Number(duration.match(/\d+/)?.[0] ?? 60),
      trainingPlace: place,
      trainingEquipment: mode === "nutrition" || place === "Gimnasio" ? null : equipmentFromLabels(equipment.filter((label) => label !== "Sin material")),
      foodRestrictions: foodRestrictions.filter((label) => label !== "Ninguna"),
      injuries: injuries.filter((label) => label !== "Ninguna"),
      selfReport,
      mode,
      confirm,
      proposalToken,
    };
    try {
      const response = await fetch("/api/profile/checkin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data: unknown = await response.json();
      if (data && typeof data === "object" && "action" in data && data.action === "recommendation") {
        const parsed = checkinRecommendationSchema.safeParse(data);
        if (!parsed.success) throw new Error("No hemos podido interpretar la propuesta. Inténtalo de nuevo.");
        setRecommendation(parsed.data);
        return;
      }
      if (!response.ok) throw new Error(data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : "No hemos podido guardar tu revisión.");
      const parsed = checkinResultSchema.safeParse(data);
      if (!parsed.success) throw new Error("No hemos podido confirmar el resultado. Comprueba tu plan antes de intentarlo de nuevo.");
      setResult(parsed.data);
    } catch (caught) {
      setError(confirm && (caught instanceof TypeError || caught instanceof SyntaxError)
        ? "No hemos podido confirmar el resultado. Comprueba tu perfil y tu plan antes de intentarlo de nuevo."
        : caught instanceof Error ? caught.message : "No hemos podido guardar tu revisión. Inténtalo de nuevo.");
    } finally {
      if (stageTimer.current) clearInterval(stageTimer.current);
      setIsSaving(false);
    }
  }

  function goNext() {
    if (["experience", "continuity", "technique"].includes(step.key) && !valueByKey[step.key]) {
      setError("Selecciona una respuesta para continuar.");
      return;
    }
    if (step.key === "place" && place === "Mixto") {
      setError("Elige si entrenas en casa o en el gimnasio para actualizar tu rutina.");
      return;
    }
    if (step.key === "equipment" && equipment.length === 0) {
      setError("Selecciona el material disponible o «Sin material».");
      return;
    }
    if (step.key === "selfReport" && !selfReport) {
      setError("Elige qué quieres hacer para continuar.");
      return;
    }
    setError(null);
    if (currentIndex === visibleSteps.length - 1) {
      submit();
      return;
    }
    setCurrentIndex((index) => Math.min(index + 1, steps.length - 1));
  }

  if (recommendation && !isSaving) {
    const recommendationCopy: Record<string, { title: string; text: string; action: string }> = {
      keep_plan: { title: "Mantén tu plan actual", text: recommendation.structuralChange ? "Guardaremos tus respuestas, pero no cambiaremos tu plan. Las novedades quedarán pendientes de revisión." : "Tu plan seguirá igual; no generaremos una nueva versión.", action: "Mantener mi plan" },
      update_plan: { title: "Hemos detectado cambios", text: "Puedes aplicar una nueva versión de la parte seleccionada con estos datos.", action: "Aplicar actualización" },
      review_health: { title: "La seguridad va primero", text: "Has indicado un cambio relacionado con molestias o lesiones. Revisaremos tu rutina con especial cuidado antes de aplicar cambios.", action: "Revisar y adaptar" },
      activate_workout: { title: mode === "general" ? "Tu nuevo plan está listo" : "Tu nueva rutina está lista", text: mode === "general" ? "Hemos preparado tu entrenamiento y tu alimentación con tus respuestas. Tu plan actual no cambiará hasta que lo actives." : "Hemos preparado tu rutina con tus respuestas. Tu rutina actual no cambiará hasta que la actives.", action: mode === "general" ? "Activar nuevo plan" : "Activar nueva rutina" },
      profile_only: { title: "Tus respuestas están listas", text: "Todavía no hay un plan activo para actualizar. Puedes guardar tus respuestas y generar tu plan después.", action: "Guardar respuestas" },
    };
    const copy = recommendationCopy[recommendation.recommendation] ?? recommendationCopy.update_plan;
    return <main className="min-h-screen bg-[#f4f1e9] px-5 py-6 text-[#18231f] sm:px-8 sm:py-8"><div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-2xl flex-col items-center justify-center text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-[#e7f5b4] text-[#60703d]"><Check size={26} /></span>
      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-[#819078]">Revisión de tu plan</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{copy.title}</h1>
      <p className="mt-4 max-w-lg leading-7 text-[#68736b]">{copy.text}</p>
      {recommendation.error && <p role="alert" className="mt-4 text-sm font-semibold text-[#a64e3c]">{recommendation.error}</p>}
      {recommendation.days && <details className="mt-6 w-full rounded-2xl border border-[#d3dbcf] bg-[#f8f7f1] p-4 text-left"><summary className="cursor-pointer text-sm font-semibold text-[#536b2c]">Ver ejercicios propuestos</summary><div className="mt-4 space-y-4">{recommendation.days.map((day, index) => <div key={`${day.name}-${index}`}><p className="text-sm font-semibold">{day.name}</p><ul className="mt-2 space-y-1 text-sm text-[#68736b]">{day.exercises.map((exercise) => <li key={exercise.name}>{exercise.name} · {exercise.sets} × {exercise.repetitions} · {exercise.restSeconds} s descanso</li>)}</ul></div>)}</div></details>}
      {recommendation.adaptationNotes?.map((note) => <p key={note} className="mt-3 max-w-lg text-sm text-[#68736b]">{note}</p>)}
      {recommendation.recommendation === "keep_plan" && recommendation.structuralChange && <p className="mt-4 max-w-lg text-sm text-[#805321]">Si han cambiado tus lesiones, material o restricciones alimentarias, el plan actual podría no ser adecuado. Revísalo antes de seguir utilizándolo.</p>}
      {mode !== "nutrition" && !recommendation.adaptationNotes?.length && injuries.some((injury) => injury !== "Ninguna") && <p className="mt-4 max-w-lg text-sm text-[#68736b]">Si tienes molestias o lesiones, consulta a un profesional antes de entrenar.</p>}
      {mode !== "general" && recommendation.changed.includes("objetivo") && <p className="mt-3 text-sm text-[#805321]">Al cambiar el objetivo, {mode === "workout" ? "tu dieta" : "tu rutina"} seguirá igual y quedará pendiente de revisión.</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => submit(true, recommendation.proposalToken)} className="rounded-full bg-[#18231f] px-6 py-3 text-sm font-semibold text-white">{copy.action}</button><NavigationLink href={mode === "nutrition" ? "/dashboard?tab=nutrition" : "/dashboard?tab=training"} kind="back">Cancelar</NavigationLink></div>
    </div></main>;
  }

  if (isSaving || result) {
    const loadingProgress = result ? 100 : isActivating ? 30 : Math.round(((loadingStageIndex + 1) / loadingStages.length) * 100);
    const messages: Record<string, string> = {
      regenerated_workout: "Tu nueva rutina ya está activa. Tu dieta se mantiene sin cambios.",
      regenerated_nutrition: "Hemos generado una nueva versión de tu dieta. Tu rutina se mantiene sin cambios.",
      regenerated_both: "Hemos generado nuevas versiones de tu rutina y tu dieta con estos cambios.",
      no_change: "Todo sigue igual: no hemos hecho ningún cambio.",
      profile_updated_only: "Hemos guardado tus respuestas. Genera tu plan inicial para que se apliquen.",
      profile_updated_plan_kept: "Hemos guardado tus respuestas y mantenido tu plan. Tus cambios quedan pendientes de revisión.",
    };

    return (
      <main className="min-h-screen bg-[#f4f1e9] px-5 py-6 text-[#18231f] sm:px-8 sm:py-8">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-2xl flex-col items-center justify-center text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-[#18231f] text-[#d7f36b]">
            {result ? <Check size={26} /> : <LoaderCircle size={26} className="animate-spin" />}
          </span>
          <h1 className="mt-8 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{isActivating ? result ? (mode === "general" ? "Plan activado." : "Rutina activada.") : (mode === "general" ? "Activando tu plan..." : "Activando tu rutina...") : result ? "Revisión completada." : loadingStages[loadingStageIndex]}</h1>
          <p className="mt-3 max-w-md text-[#68736b]">{result ? (messages[result.action] ?? "Hemos guardado tu revisión.") : isActivating ? "Estamos comprobando la propuesta y guardando tus cambios." : "Estamos recalculando tu plan con tus nuevos datos."}</p>
          {result && mode !== "general" && result.changed.includes("objetivo") && <p className="mt-3 max-w-md text-sm text-[#805321]">{mode === "workout" ? "Tu dieta" : "Tu rutina"} sigue igual y está pendiente de revisión por el cambio de objetivo.</p>}
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
              <NavigationAnchor href="/dashboard" kind="dashboard" className="mt-8">Volver a mi panel</NavigationAnchor>
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
          {step.key === "equipment" ? <EquipmentSelector selected={equipment} onSelect={select} /> : <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">
            {step.options.map((option) => {
              const currentValue = valueByKey[step.key];
              const selected = Array.isArray(currentValue) ? currentValue.includes(option) : currentValue === option;
              return (
                <button type="button" key={option} onClick={() => select(option)} className={`flex min-h-16 items-center justify-between rounded-2xl border px-5 text-left transition ${selected ? "border-[#72873f] bg-[#e7f5b4]" : "border-[#d3dbcf] bg-[#f8f7f1] hover:border-[#9aaa89]"}`}>
                  <span><span className="block font-medium">{option}</span>{step.key === "place" && <span className="mt-1 block text-sm leading-5 text-[#68736b]">{trainingPlaces.find((item) => item.value === option)?.description}</span>}{step.key === "selfReport" && <span className="mt-1 block text-sm leading-5 text-[#68736b]">{contextualSelfReportOptions.find((item) => item.label === option)?.description}</span>}</span>
                  {selected ? <Check size={19} className="text-[#60703d]" /> : null}
                </button>
              );
            })}
          </div>}
          {error ? <p className="mt-6 text-sm font-medium text-[#a64e3c]">{error}</p> : null}
        </section>
        <footer className="flex items-center justify-between border-t border-[#d9ddd3] pt-5">
          <NavigationButton type="button" disabled={currentIndex === 0 || isSaving} onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))} kind="back">Anterior</NavigationButton>
          <button type="button" disabled={isSaving} onClick={goNext} className="inline-flex items-center gap-2 rounded-full bg-[#18231f] px-6 py-3 text-sm font-semibold text-[#f6f4ed] disabled:cursor-not-allowed disabled:opacity-40">
            {isSaving ? <LoaderCircle size={17} className="animate-spin" /> : currentIndex === visibleSteps.length - 1 ? <>Terminar revisión <Check size={17} /></> : <>Siguiente <ArrowRight size={17} /></>}
          </button>
        </footer>
      </div>
    </main>
  );
}

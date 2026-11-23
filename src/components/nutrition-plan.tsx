"use client";

import { Apple, ChefHat, Check, CheckCircle2, ChevronDown, Clock3, LoaderCircle, MapPin, RefreshCw, RotateCcw, ShoppingBasket, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { NutritionAssistantDialog } from "@/components/nutrition-assistant-dialog";
import { saveNutritionCompletions } from "@/features/planning/nutrition-completion-client";

type NutritionItem = { id: string; name: string; quantityGrams: number; role: string; alternativeGroup: string | null; selectedFoodName?: string; selectedQuantityGrams?: number };
type NutritionMeal = { id: string; name: string; suggestedTime: string | null; targetCalories: number; items: NutritionItem[] };
type NutritionPlanProps = {
  meals: NutritionMeal[];
  alternatives: Record<string, string[]>;
  foodIds: Record<string, string>;
  mealCount: number;
  todayCompletedMealIds: string[];
  completedDates: string[];
  reference?: { calories: number; proteinGrams: number; carbsGrams: number; fatsGrams: number };
  mealsOutSlots?: string[];
  readOnly?: boolean;
};

const mealOutOptions = [
  { id: "breakfast", label: "Desayuno" },
  { id: "mid_morning", label: "Media mañana" },
  { id: "lunch", label: "Comida" },
  { id: "afternoon_snack", label: "Merienda" },
  { id: "dinner", label: "Cena" },
] as const;

const ratios: Record<string, number> = {
  "Arroz cocido": 1, "Pasta cocida": 0.98, "Patata cocida": 1.45,
  "Pechuga de pollo": 1, Pavo: 1.12, "Tofu firme": 1.35, Huevos: 0.85,
  Brocoli: 1, Espinaca: 1.2, "Aceite de oliva": 1, Aguacate: 5,
};

const foodTypeStyles: Record<string, { label: string; className: string }> = {
  protein: { label: "Proteína", className: "border-[#efc89d] bg-[#fff7ed] text-[#aa6726]" },
  dairy: { label: "Lácteo", className: "border-[#b8c9ef] bg-[#f0f5ff] text-[#4c68a6]" },
  carbohydrate: { label: "Hidrato", className: "border-[#d7c28d] bg-[#fff9e8] text-[#8d7227]" },
  fat: { label: "Grasa", className: "border-[#e7b1c4] bg-[#fff1f5] text-[#a14c68]" },
  vegetable: { label: "Verdura", className: "border-[#a9d5bb] bg-[#effaf3] text-[#397c57]" },
  fruit: { label: "Fruta", className: "border-[#efb1aa] bg-[#fff1ef] text-[#b84f49]" },
};

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6503c]";

function equivalentQuantity(item: NutritionItem, selectedFood?: string) {
  if (!selectedFood || !item.alternativeGroup) return item.quantityGrams;
  return Math.max(1, Math.round(item.quantityGrams * (ratios[selectedFood] ?? 1) / (ratios[item.name] ?? 1)));
}

function dayStreaks(dates: string[]) {
  const sorted = [...new Set(dates)].sort();
  if (!sorted.length) return { current: 0, best: 0 };
  let best = 1;
  let run = 1;
  for (let index = 1; index < sorted.length; index++) {
    const diff = (new Date(`${sorted[index]}T00:00:00Z`).getTime() - new Date(`${sorted[index - 1]}T00:00:00Z`).getTime()) / 86400000;
    run = diff === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  let current = 0;
  if (sorted[sorted.length - 1] === today || sorted[sorted.length - 1] === yesterday) {
    current = 1;
    for (let index = sorted.length - 1; index > 0; index--) {
      const diff = (new Date(`${sorted[index]}T00:00:00Z`).getTime() - new Date(`${sorted[index - 1]}T00:00:00Z`).getTime()) / 86400000;
      if (diff !== 1) break;
      current++;
    }
  }
  return { current, best };
}

function preparationForMeal(meal: NutritionMeal) {
  if (meal.name.includes("fuera de casa")) return "Llévala en un recipiente o tupper. Prioriza una proteína lista para comer, un hidrato sencillo y fruta o verdura fácil de transportar. La cantidad ya está ajustada para este tipo de comida.";
  const protein = meal.items.find((item) => item.role === "protein" || item.role === "dairy")?.name;
  const carbohydrate = meal.items.find((item) => item.role === "carbohydrate")?.name;
  const vegetable = meal.items.find((item) => item.role === "vegetable")?.name;
  const parts = [protein && `Prepara ${protein}`, carbohydrate && `acompaña con ${carbohydrate}`, vegetable && `y añade ${vegetable}`].filter(Boolean);
  return parts.length ? `${parts.join(", ")}.` : "";
}

function weeklyShoppingList(meals: NutritionMeal[]) {
  const totals = new Map<string, { grams: number; role: string }>();
  for (const item of meals.flatMap((meal) => meal.items)) {
    const existing = totals.get(item.name);
    totals.set(item.name, { grams: (existing?.grams ?? 0) + item.quantityGrams * 7, role: item.role });
  }
  return [...totals.entries()].map(([name, details]) => ({ name, ...details })).sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));
}

export function NutritionPlan({ meals, alternatives, foodIds, mealCount, todayCompletedMealIds, completedDates, reference, mealsOutSlots = [], readOnly = false }: NutritionPlanProps) {
  const router = useRouter();
  const assistantTriggerRef = useRef<HTMLButtonElement>(null);
  const [assistantMealId, setAssistantMealId] = useState<string | null>(null);
  const [openMeal, setOpenMeal] = useState<string | null>(meals[0]?.id ?? null);
  const [completedMeals, setCompletedMeals] = useState(() => todayCompletedMealIds.filter((id) => meals.some((meal) => meal.id === id)));
  const [selectedAlternatives, setSelectedAlternatives] = useState<Record<string, string>>(() => Object.fromEntries(meals.flatMap((meal) => meal.items.filter((item) => item.alternativeGroup && item.selectedFoodName).map((item) => [`${meal.id}:${item.alternativeGroup}`, item.selectedFoodName as string]))));
  const [openAlternative, setOpenAlternative] = useState<string | null>(null);
  const [openTool, setOpenTool] = useState<"settings" | "outside" | "shopping" | null>(null);
  const [selectedMealsOutSlots, setSelectedMealsOutSlots] = useState(mealsOutSlots);
  const [savingMealsOut, setSavingMealsOut] = useState(false);
  const [mealsOutError, setMealsOutError] = useState<string | null>(null);
  const [mealsOutNeedsRegeneration, setMealsOutNeedsRegeneration] = useState(false);
  const [isChangingMealCount, setIsChangingMealCount] = useState(false);
  const [mealCountError, setMealCountError] = useState<string | null>(null);
  const [savingAlternative, setSavingAlternative] = useState(false);
  const [alternativeError, setAlternativeError] = useState<string | null>(null);
  const [savingCompletion, setSavingCompletion] = useState(false);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [completedDayDates, setCompletedDayDates] = useState(completedDates);
  const today = new Date().toISOString().slice(0, 10);

  async function changeMealCount(nextMealCount: number) {
    setIsChangingMealCount(true);
    setMealCountError(null);
    try {
      const response = await fetch("/api/plans/nutrition/regenerate", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mealCount: nextMealCount }),
      });
      if (!response.ok) throw new Error("No hemos podido actualizar el número de comidas.");
      router.refresh();
    } catch (error) {
      setMealCountError(error instanceof Error ? error.message : "No hemos podido actualizar el número de comidas.");
    } finally {
      setIsChangingMealCount(false);
    }
  }

  async function toggleMealOutSlot(slot: string) {
    const previousSlots = selectedMealsOutSlots;
    const nextSlots = previousSlots.includes(slot) ? previousSlots.filter((value) => value !== slot) : [...previousSlots, slot];
    setSelectedMealsOutSlots(nextSlots);
    setSavingMealsOut(true);
    setMealsOutError(null);
    setMealsOutNeedsRegeneration(false);
    let preferenceSaved = false;
    try {
      const response = await fetch("/api/profile/meals-out", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ slots: nextSlots }),
      });
      if (!response.ok) throw new Error("No hemos podido guardar tus comidas fuera de casa.");
      preferenceSaved = true;
      const regenerated = await fetch("/api/plans/nutrition/regenerate", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ preserveFoods: true }),
      });
      if (!regenerated.ok) throw new Error("No se ha podido recalcular la dieta.");
      router.refresh();
    } catch (error) {
      if (!preferenceSaved) setSelectedMealsOutSlots(previousSlots);
      setMealsOutNeedsRegeneration(preferenceSaved);
      setMealsOutError(preferenceSaved ? "Hemos guardado la preferencia, pero no hemos podido recalcular tu dieta. Inténtalo de nuevo." : error instanceof Error ? error.message : "No hemos podido guardar tus comidas fuera de casa.");
      router.refresh();
    } finally {
      setSavingMealsOut(false);
    }
  }

  async function retryMealsOutRegeneration() {
    setSavingMealsOut(true);
    setMealsOutError(null);
    try {
      const response = await fetch("/api/plans/nutrition/regenerate", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ preserveFoods: true }),
      });
      if (!response.ok) throw new Error("No hemos podido recalcular tu dieta. Inténtalo de nuevo.");
      setMealsOutNeedsRegeneration(false);
      router.refresh();
    } catch {
      setMealsOutError("No hemos podido recalcular tu dieta. Inténtalo de nuevo.");
    } finally {
      setSavingMealsOut(false);
    }
  }

  async function selectAlternative(mealId: string, item: NutritionItem, food: string) {
    const group = item.alternativeGroup;
    const selectedFoodId = foodIds[food];
    if (!group || !selectedFoodId) {
      setAlternativeError("No hemos encontrado este alimento. Actualiza la página e inténtalo de nuevo.");
      return;
    }
    setSavingAlternative(true);
    setAlternativeError(null);
    try {
      const response = await fetch("/api/plans/nutrition/substitution", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mealItemId: item.id, selectedFoodId, quantityGrams: equivalentQuantity(item, food) }),
      });
      if (!response.ok) throw new Error("No hemos podido guardar el cambio de alimento.");
      setSelectedAlternatives((current) => ({ ...current, [`${mealId}:${group}`]: food }));
      router.refresh();
    } catch (error) {
      setAlternativeError(error instanceof Error ? error.message : "No hemos podido guardar el cambio de alimento.");
      router.refresh();
    } finally {
      setSavingAlternative(false);
    }
  }

  async function setCompletion(ids: string[], completed: boolean) {
    if (savingCompletion || readOnly) return;
    const changedIds = ids.filter((id) => completed !== completedMeals.includes(id));
    if (!changedIds.length) return;
    setSavingCompletion(true);
    setCompletionError(null);
    const { savedIds, failed } = await saveNutritionCompletions(changedIds, completed, today);
    const nextMeals = completed ? [...completedMeals, ...savedIds] : completedMeals.filter((id) => !savedIds.includes(id));
    setCompletedMeals(nextMeals);
    setCompletedDayDates((current) => nextMeals.length === meals.length ? [...new Set([...current, today])] : current.filter((date) => date !== today));
    if (failed) setCompletionError("No hemos podido guardar todas las comidas. Revisa la conexión e inténtalo de nuevo.");
    setSavingCompletion(false);
    router.refresh();
  }

  function displayedItem(meal: NutritionMeal, item: NutritionItem) {
    const selected = item.alternativeGroup ? selectedAlternatives[`${meal.id}:${item.alternativeGroup}`] : undefined;
    return {
      ...item,
      name: selected ?? item.name,
      quantityGrams: selected && selected === item.selectedFoodName ? item.selectedQuantityGrams ?? item.quantityGrams : equivalentQuantity(item, selected),
    };
  }

  if (!meals.length) return <p className="mt-4 text-sm text-[#526e69]">El detalle de comidas estará disponible al regenerar tu plan.</p>;

  const dayCompleted = completedMeals.length === meals.length;
  const streak = dayStreaks(completedDayDates);
  const streakWeeks = Math.floor(streak.current / 7);
  const streakMonths = Math.floor(streak.current / 30);
  const streakYears = Math.floor(streak.current / 365);
  const milestoneMessage = streakYears > 0 ? `${streakYears} ${streakYears === 1 ? "año" : "años"} de racha nutricional.` : streakMonths > 0 ? `${streakMonths} ${streakMonths === 1 ? "mes" : "meses"} de racha nutricional.` : streakWeeks > 0 ? `${streakWeeks} ${streakWeeks === 1 ? "semana" : "semanas"} de racha nutricional.` : null;
  const shoppingList = weeklyShoppingList(meals.map((meal) => ({ ...meal, items: meal.items.map((item) => displayedItem(meal, item)) })));
  const activeAssistantMeal = meals.find((meal) => meal.id === assistantMealId);

  return <section>
    <div className="relative overflow-hidden rounded-[1.75rem] bg-[#173b44] p-5 text-white sm:p-6">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 size-80 rounded-full border border-white/10 shadow-[0_0_0_3rem_rgba(255,255,255,0.025),0_0_0_6rem_rgba(255,255,255,0.02)]" />
      <div className="relative flex flex-wrap items-start justify-between gap-5"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f3b8a7]"><Apple size={15} aria-hidden="true" /> Tu alimentación</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Tu día, a tu manera.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#c5d9d9]">Consulta tus comidas, adapta los alimentos disponibles y sigue tu plan a tu ritmo.</p></div><div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm"><span className="block text-xs text-[#c5d9d9]">Comidas registradas</span><strong className="mt-1 block text-2xl">{completedMeals.length} <span className="text-sm font-normal text-[#c5d9d9]">de {meals.length}</span></strong></div></div>
      <div role="progressbar" aria-label="Comidas marcadas hoy" aria-valuemin={0} aria-valuemax={meals.length} aria-valuenow={completedMeals.length} className="relative mt-4 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-[#f3b8a7] motion-safe:transition-[width]" style={{ width: `${completedMeals.length / meals.length * 100}%` }} /></div>
      <div className="relative mt-3 flex flex-wrap items-center justify-between gap-3"><p aria-live="polite" className="text-sm text-[#d0e3e1]">{dayCompleted ? "Has marcado todas las comidas de hoy." : completedMeals.length ? "Puedes marcar cada comida o el día completo." : "Empieza consultando tus comidas de hoy."}</p><button type="button" disabled={readOnly || savingCompletion} onClick={() => void setCompletion(meals.map((meal) => meal.id), !dayCompleted)} className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f5c2b4] px-4 text-sm font-bold text-[#502e27] hover:bg-[#ffe0d8] disabled:opacity-50 ${focus}`}>{savingCompletion ? <LoaderCircle size={16} className="animate-spin" /> : dayCompleted ? <RotateCcw size={16} /> : <Check size={16} />}{dayCompleted ? "Desmarcar día" : "Completar día"}</button></div>
      {completionError && <p role="alert" className="relative mt-3 text-sm font-semibold text-[#ffe0d8]">{completionError}</p>}
    </div>

    <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,0.8fr)]">
      <section aria-labelledby="nutrition-meals-title">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b6503c]">Tu plan de hoy</p><h2 id="nutrition-meals-title" className="mt-2 text-2xl font-semibold tracking-tight">Tus comidas</h2></div><span className="text-xs text-[#71858c]">Horarios orientativos · {meals.length} comidas</span></div>
        <div className="space-y-3">{meals.map((meal) => {
          const isOpen = openMeal === meal.id;
          const done = completedMeals.includes(meal.id);
          const isOutside = meal.name.toLowerCase().includes("fuera de casa");
          const displayedName = meal.name;
          const displayedMeal = { ...meal, name: displayedName, items: meal.items.map((item) => displayedItem(meal, item)) };
          const preparation = preparationForMeal(displayedMeal);
          return <article key={meal.id} className={`overflow-hidden rounded-[1.4rem] border bg-white shadow-[0_8px_24px_rgba(20,54,57,0.04)] ${done ? "border-[#b8dfd1]" : "border-[#e1e7eb]"}`}>
            <div className="flex items-center gap-2 p-3 sm:p-4">
              <button type="button" onClick={() => setOpenMeal(isOpen ? null : meal.id)} aria-expanded={isOpen} aria-controls={`nutrition-meal-${meal.id}`} className={`flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl text-left ${focus}`}>
                <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${done ? "bg-[#e2f4eb] text-[#34785f]" : "bg-[#fff1ed] text-[#b6503c]"}`}>{done ? <CheckCircle2 size={20} aria-hidden="true" /> : <ChefHat size={20} aria-hidden="true" />}</span>
                <span className="min-w-0 flex-1"><span className="block text-base font-bold">{displayedName}{isOutside && <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-[#9f4b39]"><MapPin size={12} aria-hidden="true" /> Fuera</span>}</span><span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#6b8086]"><Clock3 size={13} aria-hidden="true" /> {meal.suggestedTime ? meal.suggestedTime.slice(0, 5) : "Flexible"} · {meal.targetCalories} kcal {done && <span className="font-semibold text-[#34785f]">· Marcada</span>}</span></span>
                <ChevronDown size={18} aria-hidden="true" className={`shrink-0 text-[#8b9b9f] transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <button type="button" aria-label={`${done ? "Desmarcar" : "Marcar"} ${meal.name}`} aria-pressed={done} disabled={readOnly || savingCompletion} onClick={() => void setCompletion([meal.id], !done)} className={`grid size-11 shrink-0 place-items-center rounded-full border disabled:opacity-50 ${done ? "border-[#34785f] bg-[#34785f] text-white" : "border-[#d7e3e3] text-[#71888d] hover:border-[#34785f]"} ${focus}`}><Check size={19} aria-hidden="true" /></button>
            </div>
            <div id={`nutrition-meal-${meal.id}`} hidden={!isOpen} className="border-t border-[#edf1f2] px-4 pb-5 pt-4 sm:px-5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#748b90]">Alimentos del plan</p>
              <div className="mt-3 space-y-2">{meal.items.map((item) => {
                const displayed = displayedItem(meal, item);
                const style = foodTypeStyles[item.role] ?? { label: item.role, className: "border-[#d8e6d9] bg-[#f5faf4] text-[#526e69]" };
                const alternativeKey = `${meal.id}:${item.id}`;
                const options = item.alternativeGroup ? alternatives[item.alternativeGroup] ?? [] : [];
                const alternativesOpen = openAlternative === alternativeKey;
                return <div key={item.id} className={`rounded-xl border px-4 py-3 ${style.className}`}>
                  <div className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><p className="font-medium text-[#18342f]">{displayed.name}</p><span className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-semibold">{style.label}</span></div><p className="mt-1 text-xs opacity-75">{displayed.quantityGrams} g · cocinado o servido</p></div>{options.length > 0 && <button type="button" onClick={() => setOpenAlternative(alternativesOpen ? null : alternativeKey)} aria-expanded={alternativesOpen} className={`inline-flex items-center gap-1.5 rounded-xl border border-white/80 bg-white/70 px-3 py-2 text-xs font-semibold text-[#9f4b39] ${focus}`}><RefreshCw size={13} aria-hidden="true" /> {alternativesOpen ? "Cerrar" : "Cambiar alimento"}</button>}</div>
                  {alternativesOpen && <div className="mt-3 border-t border-white/60 pt-3"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#9f4b39]">Alternativas equivalentes</p><div className="mt-2 flex flex-wrap gap-2">{options.map((food) => <button key={food} type="button" disabled={readOnly || savingAlternative} aria-pressed={displayed.name === food} onClick={() => void selectAlternative(meal.id, item, food)} className={`rounded-full border px-3 py-2 text-xs font-medium disabled:opacity-50 ${displayed.name === food ? "border-[#b6503c] bg-[#fff1ed] text-[#9f4b39]" : "border-white/70 bg-white/60 text-[#526e69] hover:border-[#b6503c]"} ${focus}`}>{food}</button>)}</div><p className="mt-2 text-xs text-[#526e69]">Puedes probar varias opciones; la cantidad se recalcula para mantener la equivalencia.</p></div>}
                </div>;
              })}</div>
              {alternativeError && <p role="alert" className="mt-3 text-sm font-semibold text-[#a64e3c]">{alternativeError}</p>}
              {preparation && <div className="mt-4 flex gap-2 border-l-2 border-[#ead7d2] pl-3 text-sm text-[#526e69]"><ChefHat className="shrink-0 text-[#b6503c]" size={17} aria-hidden="true" /><p>{preparation}</p></div>}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f1d8d0] bg-[#fff7f4] p-4"><div><p className="text-sm font-bold text-[#8c4436]">¿Ideas para prepararla?</p><p className="mt-1 text-xs leading-5 text-[#8c6b62]">Consulta al asistente con los alimentos de esta comida.</p></div><button type="button" disabled={readOnly || savingAlternative || !meal.items.length} onClick={(event) => { assistantTriggerRef.current = event.currentTarget; setAssistantMealId(meal.id); }} className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-[#e4d7d2] bg-white px-4 text-sm font-semibold text-[#9f4b39] hover:bg-[#fff1ed] disabled:opacity-50 ${focus}`}><Sparkles size={16} aria-hidden="true" /> Preguntar al asistente</button></div>
            </div>
          </article>;
        })}</div>
        <p className="mt-3 text-xs leading-5 text-[#71858c]">Pesos en gramos, indicados como cocinados o servidos. El modo preciso es el estándar de Atempo Fit.</p>
      </section>

      <aside className="space-y-4">
        {reference && <section className="rounded-[1.4rem] border border-[#e1e7eb] bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#758992]">Referencia diaria</p><p className="mt-3 text-3xl font-semibold tracking-tight">{reference.calories} <span className="text-sm font-medium text-[#71858c]">kcal</span></p><p className="mt-1 text-xs text-[#71858c]">Objetivo de tu plan, no consumo registrado.</p><div className="mt-5 grid grid-cols-3 gap-2 text-xs">{[{ label: "Proteína", amount: reference.proteinGrams }, { label: "Hidratos", amount: reference.carbsGrams }, { label: "Grasas", amount: reference.fatsGrams }].map(({ label, amount }) => <div key={label} className="rounded-xl bg-[#f7f9f9] p-3"><strong className="block text-sm">{Math.round(amount)} g</strong><span className="mt-1 block text-[#71858c]">{label}</span></div>)}</div></section>}
        <section className="rounded-[1.4rem] border border-[#e1e7eb] bg-white p-5">
          <h2 className="text-base font-bold">Herramientas</h2><p className="mt-1 text-xs leading-5 text-[#71858c]">Tu plan y tus opciones, cuando las necesites.</p>
          <div className="mt-3 divide-y divide-[#edf1f2]">{([{ id: "settings", label: "Gestionar alimentación", icon: ChefHat }, { id: "outside", label: "Comidas fuera de casa", icon: MapPin }, { id: "shopping", label: "Lista de compra", icon: ShoppingBasket }] as const).map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setOpenTool(openTool === id ? null : id)} aria-expanded={openTool === id} className={`flex min-h-14 w-full items-center gap-3 rounded-lg text-left text-sm font-semibold ${focus}`}><Icon size={18} className="text-[#b6503c]" aria-hidden="true" /><span className="flex-1">{label}</span><ChevronDown size={17} className={openTool === id ? "rotate-180" : ""} aria-hidden="true" /></button>)}</div>
          {openTool === "settings" && <div className="rounded-xl bg-[#f7f9f9] p-3"><p className="text-xs font-semibold text-[#526e69]">Comidas al día</p><div className="mt-2 flex flex-wrap gap-2">{[3, 4, 5, 6].map((option) => <button key={option} type="button" disabled={readOnly || isChangingMealCount || option === mealCount} onClick={() => void changeMealCount(option)} className={`min-h-10 min-w-10 rounded-full border px-3 text-sm font-semibold disabled:opacity-60 ${option === mealCount ? "border-[#b6503c] bg-[#fff1ed] text-[#9f4b39]" : "border-[#e1e7eb] bg-white text-[#526e69]"} ${focus}`}>{option}</button>)}</div>{isChangingMealCount && <p className="mt-2 text-xs text-[#526e69]">Actualizando dieta...</p>}{mealCountError && <p role="alert" className="mt-2 text-xs font-semibold text-[#a64e3c]">{mealCountError}</p>}<Link href="/nutrition/builder" className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#b6503c] px-4 text-xs font-semibold text-white ${focus}`}><ChefHat size={15} aria-hidden="true" /> Gestionar dietas</Link></div>}
          {openTool === "outside" && <div className="rounded-xl bg-[#f7f9f9] p-3"><p className="text-xs leading-5 text-[#526e75]">Marca las comidas que te cuesta hacer en casa para adaptar tu dieta.</p><div className="mt-3 flex flex-wrap gap-2">{mealOutOptions.map((option) => <button key={option.id} type="button" disabled={readOnly || savingMealsOut} aria-pressed={selectedMealsOutSlots.includes(option.id)} onClick={() => void toggleMealOutSlot(option.id)} className={`min-h-10 rounded-full border px-3 text-xs font-semibold disabled:opacity-50 ${selectedMealsOutSlots.includes(option.id) ? "border-[#b6503c] bg-[#fff1ed] text-[#9f4b39]" : "border-[#dce6e6] bg-white text-[#526e75]"} ${focus}`}>{option.label}</button>)}</div>{savingMealsOut && <p className="mt-2 text-xs text-[#526e69]">Guardando preferencia...</p>}{mealsOutError && <p role="alert" className="mt-2 text-xs font-semibold text-[#a64e3c]">{mealsOutError}</p>}{mealsOutNeedsRegeneration && <button type="button" disabled={savingMealsOut} onClick={() => void retryMealsOutRegeneration()} className={`mt-2 min-h-10 rounded-full border border-[#e4d7d2] bg-white px-3 text-xs font-semibold text-[#9f4b39] disabled:opacity-50 ${focus}`}>Reintentar cálculo</button>}</div>}
          {openTool === "shopping" && <div className="rounded-xl bg-[#f7f9f9] p-3"><p className="text-xs leading-5 text-[#526e75]">Cantidades orientativas para 7 días repitiendo el plan, con las opciones seleccionadas.</p><ul className="mt-2 space-y-2">{shoppingList.map((item) => <li key={item.name} className="flex justify-between gap-3 text-xs text-[#526e75]"><span>{item.name}</span><span>{Math.round(item.grams)} g</span></li>)}</ul></div>}
        </section>
      </aside>
    </div>

    {milestoneMessage && <div className="mt-6 rounded-2xl border border-[#e1e7eb] bg-white p-4 text-sm font-semibold text-[#b6503c]">{milestoneMessage}</div>}
    {activeAssistantMeal && <NutritionAssistantDialog key={activeAssistantMeal.id} mealName={activeAssistantMeal.name} foods={activeAssistantMeal.items.map((item) => displayedItem(activeAssistantMeal, item))} onClose={() => { setAssistantMealId(null); assistantTriggerRef.current?.focus(); }} />}
  </section>;
}

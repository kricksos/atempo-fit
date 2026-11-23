"use client";

import { NavigationLink } from "@/components/navigation-control";
import { Check, ChefHat, ChevronDown, Clock3, LoaderCircle, Plus, Search, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState, type MouseEvent } from "react";

import type { NutritionEditorMeal, NutritionEditorSource } from "@/features/planning/nutrition-editor";

type Food = { id: string; name: string; category: string; calories: number; protein: number; carbs: number; fats: number };
type Role = NutritionEditorMeal["items"][number]["role"];
const categories: Array<{ value: Role; label: string; color: string }> = [
  { value: "protein", label: "Proteínas", color: "border-[#e8ad72] bg-[#fff0df] text-[#9a4f13]" },
  { value: "carbohydrate", label: "Hidratos", color: "border-[#e2c45d] bg-[#fff8d8] text-[#78600b]" },
  { value: "vegetable", label: "Verduras", color: "border-[#7fc49b] bg-[#e5f7eb] text-[#236b42]" },
  { value: "fruit", label: "Frutas", color: "border-[#e88d83] bg-[#ffe8e5] text-[#a4362f]" },
  { value: "fat", label: "Grasas", color: "border-[#b9a0e5] bg-[#f0eaff] text-[#60449b]" },
  { value: "dairy", label: "Lácteos", color: "border-[#82b9e8] bg-[#e7f3ff] text-[#28629a]" },
];
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6503c]";
const navigationClass = "border-[#eadbd6] bg-white text-[#79574e] hover:border-[#d8a99d] hover:bg-[#fff1ed] hover:text-[#9f4b39] focus-visible:outline-[#b6503c]";
const inputClass = `mt-2 min-h-11 w-full scroll-mt-28 rounded-xl border border-[#dce5e6] bg-white px-3 py-2 text-sm text-[#172f3b] ${focus}`;
const secondaryButton = `inline-flex min-h-11 scroll-mt-28 items-center justify-center gap-2 rounded-full border border-[#e4d7d2] bg-white px-4 text-sm font-semibold text-[#9f4b39] hover:bg-[#fff1ed] disabled:cursor-not-allowed disabled:opacity-40 ${focus}`;

export function ManualNutritionBuilder({ foods, initialDiet }: { foods: Food[]; initialDiet?: NutritionEditorSource }) {
  const [name, setName] = useState(initialDiet?.name ?? "Mi dieta personalizada");
  const [meals, setMeals] = useState<NutritionEditorMeal[]>(initialDiet?.meals ?? [{ name: "Desayuno", suggestedTime: "08:00", items: [] }]);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify({ name: initialDiet?.name ?? "Mi dieta personalizada", meals: initialDiet?.meals ?? [{ name: "Desayuno", suggestedTime: "08:00", items: [] }] }));
  const [openMeal, setOpenMeal] = useState<number | null>((initialDiet?.meals.length ?? 1) > 0 ? 0 : null);
  const [pickerMeal, setPickerMeal] = useState<number | null>(null);
  const [category, setCategory] = useState<Role>("protein");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [published, setPublished] = useState(false);
  const dirty = JSON.stringify({ name, meals }) !== savedSnapshot;
  const selectedCategory = categories.find((option) => option.value === category)!;
  const filteredFoods = useMemo(() => foods.filter((food) => food.category === category && food.name.toLowerCase().includes(search.toLowerCase())).slice(0, 24), [foods, category, search]);
  const summary = useMemo(() => meals.flatMap((meal) => meal.items).reduce((total, item) => {
    const food = foods.find((candidate) => candidate.id === item.foodId);
    if (!food) return total;
    const factor = item.quantityGrams / 100;
    return { calories: total.calories + food.calories * factor, protein: total.protein + food.protein * factor, carbs: total.carbs + food.carbs * factor, fats: total.fats + food.fats * factor };
  }, { calories: 0, protein: 0, carbs: 0, fats: 0 }), [foods, meals]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function updateMeal(index: number, update: Partial<NutritionEditorMeal>) {
    setMeals((current) => current.map((meal, mealIndex) => mealIndex === index ? { ...meal, ...update } : meal));
  }
  function addFood(mealIndex: number, food: Food) {
    updateMeal(mealIndex, { items: [...meals[mealIndex].items, { foodId: food.id, quantityGrams: 100, role: category }] });
    setSearch("");
  }
  function toggleMeal(index: number) {
    setOpenMeal((current) => current === index ? null : index);
    setPickerMeal(null);
    setSearch("");
  }
  function removeMeal(index: number) {
    setMeals((current) => current.filter((_, mealIndex) => mealIndex !== index));
    setOpenMeal((current) => current === null || current === index ? null : current > index ? current - 1 : current);
    setPickerMeal(null);
  }
  function addMeal() {
    setMeals((current) => [...current, { name: `Comida ${current.length + 1}`, suggestedTime: "14:00", items: [] }]);
    setOpenMeal(meals.length);
    setPickerMeal(null);
    setSearch("");
  }
  function confirmNavigation(event: MouseEvent<HTMLAnchorElement>) {
    if (saving || (dirty && !window.confirm("Tienes cambios sin guardar. ¿Quieres salir de todos modos?"))) event.preventDefault();
  }
  async function publish() {
    if (saving || published) return;
    const invalidMeal = meals.findIndex((meal) => !meal.name.trim() || !meal.items.length || meal.items.length > 20 || meal.items.some((item) => !Number.isInteger(item.quantityGrams) || item.quantityGrams < 1 || item.quantityGrams > 2000));
    if (meals.length < 3 || meals.length > 6 || !name.trim() || invalidMeal !== -1) {
      if (invalidMeal !== -1) {
        setOpenMeal(invalidMeal);
        setPickerMeal(null);
      }
      setError("Revisa el nombre, las cantidades y las comidas: necesitas entre 3 y 6 comidas, cada una con entre 1 y 20 alimentos de 1 a 2000 g.");
      return;
    }
    if (initialDiet && !window.confirm("Se activará una nueva versión de la dieta. Las comidas de la nueva versión quedarán sin marcar hoy y la dieta anterior se conservará en el historial. ¿Quieres continuar?")) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/plans/nutrition/manual", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, meals, sourceVersionId: initialDiet?.versionId }) });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : "No hemos podido guardar la dieta.");
      if (!data || typeof data !== "object" || !("saved" in data) || data.saved !== true) throw new Error("No hemos podido confirmar el guardado. Comprueba tu dieta antes de volver a intentarlo.");
      setSavedSnapshot(JSON.stringify({ name, meals }));
      setPublished(true);
      setPickerMeal(null);
      setMessage(initialDiet ? "Dieta guardada y activada. La versión anterior se conserva en el historial." : "Dieta guardada y activada.");
    } catch (requestError) {
      setError(requestError instanceof Error && !(requestError instanceof TypeError) ? requestError.message : "No hemos podido confirmar el guardado. Comprueba tu dieta antes de volver a intentarlo.");
    } finally {
      setSaving(false);
    }
  }

  return <main className="min-h-screen bg-[#f4f6f8] px-4 py-6 text-[#172f3b] sm:px-8 sm:py-8"><div className="mx-auto max-w-5xl">
    <nav aria-label="Navegación del editor de dietas" className="flex flex-wrap items-center gap-3">
      <NavigationLink href={initialDiet ? "/nutrition/builder?section=active" : "/nutrition/builder"} kind="back" onClick={confirmNavigation} aria-disabled={saving} className={navigationClass}>{initialDiet ? "Volver a mi dieta activa" : "Volver a gestionar dietas"}</NavigationLink>
      <NavigationLink href="/dashboard?tab=nutrition" kind="dashboard" onClick={confirmNavigation} aria-disabled={saving} className={navigationClass}>Ir al dashboard</NavigationLink>
    </nav>
    <header className="relative mt-5 overflow-hidden rounded-[2rem] bg-[#173b44] p-6 text-white shadow-[0_20px_50px_rgba(16,54,58,0.12)] sm:p-9">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 size-80 rounded-full border border-white/10 shadow-[0_0_0_3rem_rgba(255,255,255,0.025),0_0_0_6rem_rgba(255,255,255,0.02)]" />
      <div className="relative max-w-2xl"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f3b8a7]"><ChefHat size={16} aria-hidden="true" /> Configurador de dieta</p><h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">{initialDiet ? "Configura tu dieta." : "Construye tu dieta."}</h1><p className="mt-4 max-w-xl text-sm leading-6 text-[#d0e3e1]">{initialDiet ? "Edita las comidas y alimentos de tu dieta actual. No cambia hasta que guardes la nueva versión." : "Añade alimentos por categorías y ajusta sus cantidades. Tus restricciones se comprobarán antes de publicar."}</p>{initialDiet && <p className="mt-3 text-xs leading-5 text-[#d0e3e1]">Al guardar, las comidas de hoy empezarán sin marcar. Se comprobarán tus restricciones.</p>}</div>
    </header>
      <section aria-labelledby="diet-summary-title" className="mt-7 rounded-[1.75rem] border border-[#e9dedb] bg-white p-5 shadow-[0_8px_24px_rgba(54,34,29,0.04)] sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b6503c]">Tu planificación</p><h2 id="diet-summary-title" className="mt-2 text-xl font-semibold">Resumen de la dieta</h2>
        <fieldset disabled={saving || published} className="min-w-0">
        <label className="mt-5 block text-sm font-semibold">Nombre de la dieta<input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} className={inputClass} /></label>
        </fieldset>
      </section>
      <section aria-label="Resumen nutricional de la dieta" className="sticky top-2 z-30 -mx-2 mt-3 rounded-2xl border border-[#e9dedb] bg-white p-2 shadow-[0_8px_24px_rgba(54,34,29,0.12)] sm:mx-0 sm:p-3">
        <dl className="grid grid-cols-4 gap-1 sm:gap-2">{[["Calorías", Math.round(summary.calories), "kcal"], ["Proteína", Math.round(summary.protein), "g"], ["Hidratos", Math.round(summary.carbs), "g"], ["Grasas", Math.round(summary.fats), "g"]].map(([label, value, unit]) => <div key={label} className="min-w-0 rounded-xl bg-[#f7f9f9] px-1 py-2 sm:px-3"><dt className="text-[11px] leading-4 text-[#526e75] sm:text-xs">{label}</dt><dd className="mt-0.5 break-words text-[13px] font-semibold leading-5 tabular-nums sm:text-base">{value} <span className="text-[10px] sm:text-xs">{unit}</span></dd></div>)}</dl>
      </section>
      <section aria-labelledby="diet-meals-title" className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b6503c]">Tu plan</p><h2 id="diet-meals-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Tus comidas</h2><p className="mt-2 text-sm text-[#526e75]">Organiza entre 3 y 6 comidas. Abre una para editarla.</p><p className="mt-1 text-xs leading-5 text-[#71858c]">Al cerrarlas, los cambios se mantienen aquí. Pulsa «Guardar dieta activa» para guardarlos.</p></div><span className="text-xs font-semibold text-[#71858c]">{meals.length} de 6 comidas</span></div>
        <div className="mt-5 space-y-4">{meals.map((meal, mealIndex) => <section key={mealIndex} aria-label={`Comida ${mealIndex + 1}`} className="rounded-[1.5rem] border border-[#e9dedb] bg-white p-4 shadow-[0_8px_24px_rgba(54,34,29,0.04)] sm:p-5">
          <h3><button id={`meal-heading-${mealIndex}`} type="button" onClick={() => toggleMeal(mealIndex)} aria-expanded={openMeal === mealIndex} aria-controls={`meal-editor-${mealIndex}`} className={`flex min-h-12 w-full scroll-mt-28 items-center gap-3 rounded-xl text-left ${focus}`}>
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#fff1ed] text-[#b6503c]"><ChefHat size={20} aria-hidden="true" /></span>
            <span className="min-w-0 flex-1"><span className="block break-words text-base font-semibold">{meal.name.trim() || `Comida ${mealIndex + 1}`}</span><span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-[#71858c]">{meal.suggestedTime && <><Clock3 size={13} aria-hidden="true" /> {meal.suggestedTime} <span aria-hidden="true">·</span></>}{meal.items.length} {meal.items.length === 1 ? "alimento" : "alimentos"}</span></span>
            <ChevronDown size={18} aria-hidden="true" className={`shrink-0 text-[#9f4b39] transition-transform ${openMeal === mealIndex ? "rotate-180" : ""}`} />
          </button></h3>
          <div id={`meal-editor-${mealIndex}`} role="region" aria-labelledby={`meal-heading-${mealIndex}`} hidden={openMeal !== mealIndex} className="mt-4 border-t border-[#edf1f2] pt-4">
          <fieldset disabled={saving || published} className="min-w-0">
          <div className="flex items-center justify-between gap-3"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b6503c]">Comida {mealIndex + 1}</p><button type="button" onClick={() => removeMeal(mealIndex)} disabled={meals.length === 1} className={`grid size-11 place-items-center rounded-full text-[#9f4b39] hover:bg-[#fff1ed] disabled:opacity-30 ${focus}`} aria-label={`Eliminar ${meal.name}`}><Trash2 size={17} aria-hidden="true" /></button></div>
          <div className="mt-2 flex flex-wrap items-end gap-3"><label className="min-w-[10rem] flex-1 text-sm font-semibold">Nombre<input value={meal.name} maxLength={80} onChange={(event) => updateMeal(mealIndex, { name: event.target.value })} className={inputClass} /></label><label className="w-full text-sm font-semibold sm:w-40">Hora orientativa<input type="time" value={meal.suggestedTime ?? ""} onChange={(event) => updateMeal(mealIndex, { suggestedTime: event.target.value || null })} className={inputClass} /></label></div>
          <div className="mt-5 space-y-2">{meal.items.map((item, itemIndex) => { const food = foods.find((candidate) => candidate.id === item.foodId); return <div key={itemIndex} className="flex flex-wrap items-center gap-3 rounded-2xl bg-[#f7f9f9] p-3"><div className="min-w-0 flex-[1_1_100%] sm:flex-1"><p className="break-words text-sm font-semibold">{food?.name ?? "Alimento no disponible"}</p>{food && <p className="mt-1 text-xs text-[#71858c]">{Math.round(food.calories * item.quantityGrams / 100)} kcal · {Math.round(food.protein * item.quantityGrams / 100)} g proteína</p>}</div><label className="w-24 text-xs font-semibold text-[#526e75]">Gramos<input type="number" min="1" max="2000" value={item.quantityGrams} onChange={(event) => updateMeal(mealIndex, { items: meal.items.map((current, index) => index === itemIndex ? { ...current, quantityGrams: Number(event.target.value) } : current) })} className={inputClass} /></label><button type="button" onClick={() => updateMeal(mealIndex, { items: meal.items.filter((_, index) => index !== itemIndex) })} className={`grid size-11 place-items-center rounded-full text-[#9f4b39] hover:bg-[#fff1ed] ${focus}`} aria-label={`Eliminar ${food?.name ?? "alimento"}`}><Trash2 size={16} aria-hidden="true" /></button></div>; })}</div>
          {!meal.items.length && <p className="mt-4 text-sm text-[#71858c]">Todavía no has añadido alimentos a esta comida.</p>}
          <button type="button" disabled={meal.items.length >= 20} onClick={() => { setPickerMeal(pickerMeal === mealIndex ? null : mealIndex); setSearch(""); }} aria-expanded={pickerMeal === mealIndex} aria-controls={`food-picker-${mealIndex}`} className={`mt-4 ${secondaryButton}`}><Plus size={16} aria-hidden="true" /> Añadir alimento</button>
          {pickerMeal === mealIndex && <div id={`food-picker-${mealIndex}`} className="mt-4 rounded-2xl border border-[#f1d8d0] bg-[#fff7f4] p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">Elige un alimento</p><button type="button" onClick={() => setPickerMeal(null)} className={`grid size-11 place-items-center rounded-full text-[#79574e] hover:bg-white ${focus}`} aria-label="Cerrar selector"><X size={18} aria-hidden="true" /></button></div><label className="mt-3 flex min-h-11 items-center gap-2 rounded-xl border border-[#e4d7d2] bg-white px-3 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#b6503c]"><Search size={16} className="shrink-0 text-[#71858c]" aria-hidden="true" /><span className="sr-only">Buscar alimento</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar alimento..." className="min-w-0 w-full bg-transparent text-sm outline-none" /></label><div className="mt-3 flex flex-wrap gap-2">{categories.map((option) => <button key={option.value} type="button" aria-pressed={category === option.value} onClick={() => setCategory(option.value)} className={`min-h-10 rounded-full border px-3 text-xs font-semibold ${focus} ${category === option.value ? `${option.color} ring-2 ring-[#172f3b]/15` : "border-[#e4d7d2] bg-white text-[#526e75]"}`}>{option.label}</button>)}</div><div className={`mt-3 rounded-xl border p-3 text-xs font-semibold ${selectedCategory.color}`}>Añadiendo alimentos: {selectedCategory.label}</div><div className="mt-3 grid gap-2 sm:grid-cols-2">{filteredFoods.map((food) => <button key={food.id} type="button" onClick={() => addFood(mealIndex, food)} className={`min-h-11 rounded-xl border p-3 text-left ${selectedCategory.color} ${focus}`}><span className="block font-semibold">{food.name}</span><span className="mt-1 block text-xs opacity-80">{Math.round(food.calories)} kcal · {Math.round(food.protein)} g proteína / 100 g</span></button>)}</div>{!filteredFoods.length && <p className="mt-3 text-sm text-[#526e75]">No encontramos alimentos en esta categoría.</p>}</div>}
          </fieldset>
          </div>
        </section>)}</div>
      </section>
      <fieldset disabled={saving || published} className="min-w-0"><div className="mt-5 flex flex-wrap justify-between gap-3"><button type="button" disabled={meals.length >= 6} onClick={addMeal} className={secondaryButton}><Plus size={16} aria-hidden="true" /> Añadir comida</button><button type="button" onClick={() => void publish()} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#b6503c] px-5 text-sm font-semibold text-white hover:bg-[#963e2f] disabled:cursor-not-allowed disabled:opacity-50 ${focus}`}>{saving ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Check size={16} aria-hidden="true" />} {saving ? "Guardando..." : "Guardar dieta activa"}</button></div></fieldset>
    {error && <p role="alert" className="mt-4 rounded-xl bg-[#fff1ed] p-4 text-sm font-semibold text-[#9f4b39]">{error}</p>}{message && <p role="status" className="mt-4 rounded-xl bg-[#e2f4eb] p-4 text-sm font-semibold text-[#34785f]">{message}</p>}
  </div></main>;
}

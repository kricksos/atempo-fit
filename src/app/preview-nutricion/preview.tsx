"use client";

import { useEffect, useRef, useState } from "react";
import { Apple, ArrowRight, Bot, ChartNoAxesCombined, Check, CheckCircle2, ChefHat, ChevronDown, Clock3, Dumbbell, LayoutDashboard, MapPin, RotateCcw, ShoppingBasket, Sparkles, X } from "lucide-react";

type Food = { name: string; quantity: string; alternatives?: { name: string; quantity: string }[] };
type Meal = { id: string; name: string; time: string; kcal: number; foods: Food[] };

const meals: Meal[] = [
  { id: "desayuno", name: "Desayuno", time: "08:00", kcal: 420, foods: [{ name: "Yogur natural", quantity: "200 g", alternatives: [{ name: "Yogur natural", quantity: "200 g" }, { name: "Yogur de soja", quantity: "200 g" }] }, { name: "Copos de avena", quantity: "50 g" }, { name: "Plátano", quantity: "100 g" }] },
  { id: "media-manana", name: "Media mañana", time: "11:00", kcal: 220, foods: [{ name: "Manzana", quantity: "150 g" }, { name: "Nueces", quantity: "20 g" }] },
  { id: "comida", name: "Comida", time: "14:00", kcal: 650, foods: [{ name: "Pechuga de pollo", quantity: "150 g", alternatives: [{ name: "Pechuga de pollo", quantity: "150 g" }, { name: "Pavo", quantity: "170 g" }, { name: "Tofu firme", quantity: "200 g" }] }, { name: "Arroz cocido", quantity: "180 g" }, { name: "Brócoli", quantity: "150 g" }] },
  { id: "merienda", name: "Merienda", time: "17:30", kcal: 260, foods: [{ name: "Pan integral", quantity: "60 g" }, { name: "Queso fresco", quantity: "80 g" }] },
  { id: "cena", name: "Cena", time: "21:00", kcal: 550, foods: [{ name: "Merluza", quantity: "160 g" }, { name: "Patata cocida", quantity: "200 g" }, { name: "Verduras", quantity: "150 g" }] },
];

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6503c]";
const secondaryButton = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#e4d7d2] bg-white px-4 text-sm font-semibold text-[#9f4b39] hover:bg-[#fff1ed] ${focus}`;
const primaryButton = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#b6503c] px-4 text-sm font-semibold text-white hover:bg-[#963e2f] ${focus}`;

function AssistantDemo({ meal, foods, onClose }: { meal: Meal; foods: Food[]; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const [message, setMessage] = useState(`¿Cómo puedo preparar ${meal.name.toLowerCase()} con ${foods.map((food) => `${food.name} (${food.quantity})`).join(", ")}? Dame ideas sencillas respetando las cantidades de mi plan.`);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    questionRef.current?.focus();
    return () => { if (dialog?.open) dialog.close(); };
  }, []);

  function close() {
    dialogRef.current?.close();
    onClose();
  }

  return <dialog ref={dialogRef} onCancel={(event) => { event.preventDefault(); close(); }} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); close(); } }} aria-labelledby="assistant-demo-title" className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-[1.75rem] border border-[#e7d8d2] bg-white p-0 text-[#17343d] shadow-2xl backdrop:bg-[#102a35]/60">
    <div className="flex items-center justify-between gap-4 border-b border-[#edf0f1] p-5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#fff1ed] text-[#b6503c]"><Bot size={21} aria-hidden="true" /></span><div><h2 id="assistant-demo-title" className="font-bold">Pregunta al asistente</h2><p className="mt-1 text-xs text-[#647b82]">{meal.name} · propuesta de ejemplo</p></div></div><button type="button" onClick={close} aria-label="Cerrar asistente de ejemplo" className={`grid size-11 place-items-center rounded-full text-[#526e75] hover:bg-[#f1f5f5] ${focus}`}><X size={20} aria-hidden="true" /></button></div>
    <div className="p-5">
      <p className="text-sm leading-6 text-[#526e75]">Podrías consultar ideas de preparación con los alimentos seleccionados. Revisa y modifica la pregunta antes de enviarla.</p>
      <label htmlFor="nutrition-assistant-question" className="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-[#647b82]">Tu pregunta</label>
      <textarea ref={questionRef} id="nutrition-assistant-question" value={message} onChange={(event) => { setMessage(event.target.value); setSent(false); }} rows={5} className={`mt-2 w-full resize-y rounded-2xl border border-[#d7e2e4] bg-[#f7f9f9] p-3 text-sm leading-6 text-[#17343d] ${focus}`} />
      {sent && <p role="status" className="mt-3 rounded-xl bg-[#fff1ed] p-3 text-sm leading-6 text-[#9f4b39]">Muestra: aquí aparecería la respuesta del asistente. No se ha enviado ninguna consulta.</p>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-[#647b82]">Asistente simulado · sin conexión</p><button type="button" disabled={!message.trim()} onClick={() => setSent(true)} className={`${primaryButton} disabled:opacity-40`}>Enviar consulta de ejemplo <ArrowRight size={16} aria-hidden="true" /></button></div>
    </div>
  </dialog>;
}

export function NutritionPreview() {
  const assistantTriggerRef = useRef<HTMLButtonElement>(null);
  const [completed, setCompleted] = useState<string[]>([]);
  const [openMeal, setOpenMeal] = useState<string | null>(meals[0].id);
  const [alternatives, setAlternatives] = useState<Record<string, number>>({});
  const [assistantMeal, setAssistantMeal] = useState<string | null>(null);
  const [tools, setTools] = useState<"settings" | "outside" | "shopping" | null>(null);
  const [outside, setOutside] = useState<string[]>([]);
  const completedAll = completed.length === meals.length;
  const activeAssistantMeal = meals.find((meal) => meal.id === assistantMeal);

  function displayFood(meal: Meal, food: Food): Food {
    const selected = food.alternatives?.[alternatives[`${meal.id}:${food.name}`] ?? 0];
    return selected ? { ...food, name: selected.name, quantity: selected.quantity } : food;
  }

  function toggleMeal(id: string) {
    setCompleted((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  }

  const shopping = meals.flatMap((meal) => meal.foods.map((food) => displayFood(meal, food))).reduce((totals, food) => {
    totals.set(food.name, (totals.get(food.name) ?? 0) + Number.parseInt(food.quantity, 10) * 7);
    return totals;
  }, new Map<string, number>());

  return <main className="min-h-screen bg-[#f4f6f8] px-4 py-5 text-[#172f3b] sm:px-7 sm:py-8">
    <div className="mx-auto max-w-[1200px]">
      <div role="note" className="rounded-2xl border border-[#e7d8d2] bg-white px-4 py-3 text-sm leading-6 text-[#5b7076]"><strong className="text-[#9f4b39]">Propuesta de Nutrición.</strong> Todo es ficticio: las acciones y el asistente son simulados; no se guarda ni envía información.</div>
      <header className="mt-7"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#08786f]">Tu espacio de progreso</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Tu ritmo. Tu progreso.</h1><p className="mt-2 text-sm text-[#627a81]">Todo lo que necesitas para seguir avanzando, en un solo lugar.</p></header>
      <nav aria-label="Secciones del dashboard en la muestra" className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-[#e1e7eb] bg-white p-1.5 sm:grid-cols-4">{([{ label: "Resumen", Icon: LayoutDashboard }, { label: "Entrenamiento", Icon: Dumbbell }, { label: "Nutrición", Icon: Apple }, { label: "Progreso", Icon: ChartNoAxesCombined }] as const).map(({ label, Icon }) => <span key={label} aria-current={label === "Nutrición" ? "page" : undefined} className={`flex min-h-11 items-center justify-center gap-2 rounded-xl text-sm font-semibold ${label === "Nutrición" ? "border border-[#eec8be] bg-[#fff1ed] text-[#b6503c]" : "text-[#85969b]"}`}><Icon size={17} aria-hidden="true" />{label}</span>)}</nav>

      <section className="relative mt-5 overflow-hidden rounded-[1.75rem] bg-[#173b44] p-5 text-white sm:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 size-80 rounded-full border border-white/10 shadow-[0_0_0_3rem_rgba(255,255,255,0.025),0_0_0_6rem_rgba(255,255,255,0.02)]" />
        <div className="relative flex flex-wrap items-start justify-between gap-5"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f3b8a7]"><Apple size={15} aria-hidden="true" /> Tu alimentación</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Tu día, a tu manera.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#c5d9d9]">Consulta tus comidas, adapta los alimentos disponibles y sigue tu plan a tu ritmo.</p></div><div className="rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-sm"><span className="block text-xs text-[#c5d9d9]">Comidas registradas</span><strong className="mt-1 block text-2xl">{completed.length} <span className="text-sm font-normal text-[#c5d9d9]">de {meals.length}</span></strong></div></div>
        <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-white/15" role="progressbar" aria-label="Comidas marcadas hoy" aria-valuemin={0} aria-valuemax={meals.length} aria-valuenow={completed.length}><div className="h-full rounded-full bg-[#f3b8a7] motion-safe:transition-[width]" style={{ width: `${completed.length / meals.length * 100}%` }} /></div>
        <div className="relative mt-3 flex flex-wrap items-center justify-between gap-3"><p aria-live="polite" className="text-sm text-[#d0e3e1]">{completedAll ? "Has marcado todas las comidas de hoy." : completed.length ? "Puedes marcar cada comida o el día completo." : "Empieza consultando tus comidas de hoy."}</p><button type="button" onClick={() => setCompleted(completedAll ? [] : meals.map((meal) => meal.id))} className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-[#f5c2b4] px-4 text-sm font-bold text-[#502e27] hover:bg-[#ffe0d8] ${focus}`}>{completedAll ? <RotateCcw size={16} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}{completedAll ? "Desmarcar día" : "Completar día"}</button></div>
      </section>

      <div className="mt-7 grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,0.8fr)]">
        <section aria-labelledby="meals-title"><div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b6503c]">Tu plan de hoy</p><h2 id="meals-title" className="mt-2 text-2xl font-semibold tracking-tight">Tus comidas</h2></div><span className="text-xs text-[#71858c]">Horarios orientativos · {meals.length} comidas</span></div>
          <div className="space-y-3">{meals.map((meal) => {
            const isOpen = openMeal === meal.id;
            const done = completed.includes(meal.id);
            return <article key={meal.id} className={`overflow-hidden rounded-[1.4rem] border bg-white shadow-[0_8px_24px_rgba(20,54,57,0.04)] ${done ? "border-[#b8dfd1]" : "border-[#e1e7eb]"}`}>
              <div className="flex items-center gap-2 p-3 sm:p-4"><button type="button" onClick={() => setOpenMeal(isOpen ? null : meal.id)} aria-expanded={isOpen} aria-controls={`meal-${meal.id}`} className={`flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl text-left ${focus}`}><span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${done ? "bg-[#e2f4eb] text-[#34785f]" : "bg-[#fff1ed] text-[#b6503c]"}`}>{done ? <CheckCircle2 size={20} aria-hidden="true" /> : <ChefHat size={20} aria-hidden="true" />}</span><span className="min-w-0 flex-1"><span className="block text-base font-bold">{meal.name}{outside.includes(meal.id) && <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold text-[#9f4b39]"><MapPin size={12} aria-hidden="true" /> Fuera</span>}</span><span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#6b8086]"><Clock3 size={13} aria-hidden="true" /> {meal.time} · {meal.kcal} kcal <span className={done ? "font-semibold text-[#34785f]" : ""}>{done ? "· Marcada" : ""}</span></span></span><ChevronDown size={18} className={`shrink-0 text-[#8b9b9f] transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" /></button><button type="button" aria-label={`${done ? "Desmarcar" : "Marcar"} ${meal.name}`} aria-pressed={done} onClick={() => toggleMeal(meal.id)} className={`grid size-11 shrink-0 place-items-center rounded-full border ${done ? "border-[#34785f] bg-[#34785f] text-white" : "border-[#d7e3e3] text-[#71888d] hover:border-[#34785f]"} ${focus}`}><Check size={19} aria-hidden="true" /></button></div>
              <div id={`meal-${meal.id}`} hidden={!isOpen} className="border-t border-[#edf1f2] px-4 pb-5 pt-4 sm:px-5"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#748b90]">Alimentos del plan</p><div className="mt-3 space-y-2">{meal.foods.map((food) => { const selected = displayFood(meal, food); return <div key={food.name} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f7f9f9] px-3 py-3"><div><p className="text-sm font-semibold">{selected.name}</p><p className="mt-1 text-xs text-[#6b8086]">{selected.quantity} · preparado o servido</p></div>{food.alternatives && <label className="text-xs font-semibold text-[#9f4b39]">Cambiar alimento<select aria-label={`Cambiar ${food.name} en ${meal.name}`} value={alternatives[`${meal.id}:${food.name}`] ?? 0} onChange={(event) => setAlternatives((current) => ({ ...current, [`${meal.id}:${food.name}`]: Number(event.target.value) }))} className={`ml-2 max-w-[10rem] rounded-lg border border-[#e6d8d3] bg-white px-2 py-2 text-xs text-[#526e75] ${focus}`}>{food.alternatives.map((alternative, index) => <option key={alternative.name} value={index}>{alternative.name}</option>)}</select></label>}</div>; })}</div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#f1d8d0] bg-[#fff7f4] p-4"><div><p className="text-sm font-bold text-[#8c4436]">¿Ideas para prepararla?</p><p className="mt-1 text-xs leading-5 text-[#8c6b62]">Consulta al asistente con los alimentos de esta comida.</p></div><button type="button" onClick={(event) => { assistantTriggerRef.current = event.currentTarget; setAssistantMeal(meal.id); }} className={secondaryButton}><Sparkles size={16} aria-hidden="true" /> Preguntar al asistente</button></div>
              </div>
            </article>;
          })}</div>
        </section>
        <aside className="space-y-4"><section className="rounded-[1.4rem] border border-[#e1e7eb] bg-white p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#758992]">Referencia diaria</p><p className="mt-3 text-3xl font-semibold tracking-tight">2100 <span className="text-sm font-medium text-[#71858c]">kcal</span></p><p className="mt-1 text-xs text-[#71858c]">Objetivo del plan de ejemplo, no consumo registrado.</p><div className="mt-5 grid grid-cols-3 gap-2 text-xs"><div className="rounded-xl bg-[#f7f9f9] p-3"><strong className="block text-sm">140 g</strong><span className="mt-1 block text-[#71858c]">Proteína</span></div><div className="rounded-xl bg-[#f7f9f9] p-3"><strong className="block text-sm">240 g</strong><span className="mt-1 block text-[#71858c]">Hidratos</span></div><div className="rounded-xl bg-[#f7f9f9] p-3"><strong className="block text-sm">65 g</strong><span className="mt-1 block text-[#71858c]">Grasas</span></div></div></section>
          <section className="rounded-[1.4rem] border border-[#e1e7eb] bg-white p-5"><h2 className="text-base font-bold">Herramientas</h2><p className="mt-1 text-xs leading-5 text-[#71858c]">Tu plan y tus opciones, cuando las necesites.</p><div className="mt-3 divide-y divide-[#edf1f2]">{([{ id: "settings", label: "Gestionar alimentación", icon: ChefHat }, { id: "outside", label: "Comidas fuera de casa", icon: MapPin }, { id: "shopping", label: "Lista de compra", icon: ShoppingBasket }] as const).map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => setTools(tools === id ? null : id)} aria-expanded={tools === id} className={`flex min-h-14 w-full items-center gap-3 rounded-lg text-left text-sm font-semibold ${focus}`}><Icon size={18} className="text-[#b6503c]" aria-hidden="true" /><span className="flex-1">{label}</span><ChevronDown size={17} className={tools === id ? "rotate-180" : ""} aria-hidden="true" /></button>)}</div>
            {tools === "settings" && <div className="rounded-xl bg-[#f7f9f9] p-3 text-sm leading-6 text-[#526e75]">Desde aquí se accedería a gestionar tu dieta y el número de comidas. En esta muestra no se modifica ningún plan.</div>}
            {tools === "outside" && <div className="rounded-xl bg-[#f7f9f9] p-3"><p className="text-xs leading-5 text-[#526e75]">Marca las comidas que harías fuera de casa. Solo se simula la selección.</p><div className="mt-3 flex flex-wrap gap-2">{meals.map((meal) => <button key={meal.id} type="button" aria-pressed={outside.includes(meal.id)} onClick={() => setOutside((current) => current.includes(meal.id) ? current.filter((id) => id !== meal.id) : [...current, meal.id])} className={`min-h-10 rounded-full border px-3 text-xs font-semibold ${outside.includes(meal.id) ? "border-[#b6503c] bg-[#fff1ed] text-[#9f4b39]" : "border-[#dce6e6] bg-white text-[#526e75]"} ${focus}`}>{meal.name}</button>)}</div></div>}
            {tools === "shopping" && <div className="rounded-xl bg-[#f7f9f9] p-3"><p className="text-xs leading-5 text-[#526e75]">Cantidades orientativas para 7 días repitiendo este ejemplo, con las opciones seleccionadas.</p><ul className="mt-2 space-y-2">{Array.from(shopping, ([name, quantity]) => <li key={name} className="flex justify-between gap-3 text-xs text-[#526e75]"><span>{name}</span><span>{quantity} g</span></li>)}</ul></div>}
          </section>
          <p className="px-1 text-xs leading-5 text-[#71858c]">Cantidades y horarios ficticios. En tu plan se mostrarían los datos correspondientes a tu alimentación.</p>
        </aside>
      </div>
      {activeAssistantMeal && <AssistantDemo key={activeAssistantMeal.id} meal={activeAssistantMeal} foods={activeAssistantMeal.foods.map((food) => displayFood(activeAssistantMeal, food))} onClose={() => { setAssistantMeal(null); assistantTriggerRef.current?.focus(); }} />}
    </div>
  </main>;
}

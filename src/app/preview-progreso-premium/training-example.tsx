"use client";

import { Activity, ArrowRight, Award, BarChart3, CalendarDays, ChevronDown, Dumbbell, Flame, Layers3, Sparkles, Trophy } from "lucide-react";
import { useState } from "react";

type View = "resumen" | "ejercicios" | "musculos" | "logros";
type Period = "4" | "12";
type Metric = "carga" | "repeticiones";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08786f]";
const card = "min-w-0 rounded-[1.5rem] border border-[#dfeae7] bg-white p-5 shadow-[0_8px_24px_rgba(20,54,57,0.04)] sm:p-6";
const link = `inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#08786f] hover:text-[#14574f] ${focus}`;
const dates = ["Hace 12 sem.", "Hace 10 sem.", "Hace 8 sem.", "Hace 6 sem.", "Hace 4 sem.", "Hace 3 sem.", "Hace 2 sem.", "Última sesión"];

const exercises = [
  {
    id: "press", name: "Press de banca", muscle: "Pectoral", reps: 8,
    weights: [50, 52.5, 52.5, 55, 60, 60, 62.5, 65], repetitions: [8, 8, 9, 8, 8, 8, 8, 8],
    sets: ["60 kg × 10", "62,5 kg × 8", "65 kg × 8"],
  },
  {
    id: "sentadilla", name: "Sentadilla con barra", muscle: "Cuádriceps", reps: 8,
    weights: [55, 57.5, 60, 60, 62.5, 62.5, 65, 67.5], repetitions: [8, 8, 8, 9, 8, 9, 8, 8],
    sets: ["60 kg × 10", "65 kg × 8", "67,5 kg × 8"],
  },
  {
    id: "remo", name: "Remo con mancuerna", muscle: "Dorsal", reps: 10,
    weights: [20, 20, 22, 22, 24, 24, 26, 26], repetitions: [10, 11, 10, 10, 10, 11, 10, 10],
    sets: ["22 kg × 12", "24 kg × 10", "26 kg × 10"],
  },
] as const;
type ExerciseId = (typeof exercises)[number]["id"];

const muscleData = [
  { id: "pecho", name: "Pectoral", values: { "4": 24, "12": 64 }, exercise: "Press de banca", tone: "#3d9d89" },
  { id: "piernas", name: "Cuádriceps", values: { "4": 21, "12": 58 }, exercise: "Sentadilla con barra", tone: "#82b5df" },
  { id: "espalda", name: "Dorsal", values: { "4": 18, "12": 51 }, exercise: "Remo con mancuerna", tone: "#ac9bda" },
  { id: "hombros", name: "Deltoides", values: { "4": 12, "12": 36 }, exercise: "Press de hombros", tone: "#e5aa80" },
  { id: "gluteos", name: "Glúteos", values: { "4": 9, "12": 27 }, exercise: "Puente de glúteos", tone: "#dba9bc" },
] as const;
type MuscleId = (typeof muscleData)[number]["id"];

function number(value: number) {
  return value.toLocaleString("es-ES", { maximumFractionDigits: 1 });
}

function PerformanceChart({ exercise, period, metric }: { exercise: (typeof exercises)[number]; period: Period; metric: Metric }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const start = period === "4" ? 4 : 0;
  const values = (metric === "carga" ? exercise.weights : exercise.repetitions).slice(start);
  const selected = selectedIndex !== null && selectedIndex >= start ? selectedIndex : 7;
  const range = Math.max(...values) - Math.min(...values);
  const points = values.map((value, index) => ({
    x: 7 + index * 86 / (values.length - 1),
    y: range === 0 ? 50 : 80 - (value - Math.min(...values)) / range * 60,
    index: start + index,
    value,
  }));
  const unit = metric === "carga" ? "kg" : "reps";

  return <div>
    <div className="relative mt-5 h-44 sm:h-52">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 h-full w-full">
        <path d="M0 20H100 M0 50H100 M0 80H100" stroke="#e8f0ed" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <path d={`M${points[0].x} 100 ${points.map(({ x, y }) => `L${x} ${y}`).join(" ")} L${points[points.length - 1].x} 100 Z`} fill="#e7f6f1" />
        <polyline points={points.map(({ x, y }) => `${x},${y}`).join(" ")} fill="none" stroke="#138b78" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      </svg>
      {points.map((point) => <button key={point.index} type="button" onClick={() => setSelectedIndex(point.index)} aria-pressed={selected === point.index} aria-label={`${dates[point.index]}: ${number(point.value)} ${unit}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} className={`absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ${focus}`}><span className={`size-3 rounded-full border-2 border-white shadow-sm ${selected === point.index ? "scale-125 bg-[#075d54] ring-4 ring-[#bce6da]" : "bg-[#138b78]"}`} /></button>)}
    </div>
    <div className="mt-2 flex justify-between text-[11px] text-[#71858c]"><span>{dates[start]}</span><span>Última sesión</span></div>
    <div aria-live="polite" className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#f1f8f6] px-4 py-3"><div><p className="text-xs font-semibold text-[#526e75]">{dates[selected]}</p><p className="mt-1 text-sm font-semibold text-[#173b44]">{number(exercise.weights[selected])} kg × {exercise.repetitions[selected]} repeticiones</p></div><span className="text-xs text-[#647b82]">Serie con mayor carga</span></div>
    <p className="mt-3 text-xs leading-5 text-[#71858c]">Toca un punto para consultar el registro. La gráfica no empieza necesariamente en cero.</p>
  </div>;
}

function ExerciseDetail({ exerciseId, setExerciseId, period }: { exerciseId: ExerciseId; setExerciseId: (id: ExerciseId) => void; period: Period }) {
  const [metric, setMetric] = useState<Metric>("carga");
  const [showSets, setShowSets] = useState(false);
  const exercise = exercises.find((item) => item.id === exerciseId)!;
  const first = period === "4" ? 4 : 0;
  const delta = exercise.weights[7] - exercise.weights[first];

  return <div className="space-y-4">
    <div className="grid gap-4 lg:grid-cols-[0.32fr_0.68fr]">
      <section className={card}>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#08786f]">Tu biblioteca</p>
        <h3 className="mt-2 text-xl font-semibold">Elige un ejercicio</h3>
        <p className="mt-2 text-sm leading-6 text-[#71858c]">Compara tus registros de la misma variante.</p>
        <div className="mt-4 space-y-2">{exercises.map((item) => <button key={item.id} type="button" onClick={() => { setExerciseId(item.id); setShowSets(false); }} aria-pressed={exerciseId === item.id} className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border p-3 text-left ${exerciseId === item.id ? "border-[#81c7b8] bg-[#eff9f6]" : "border-[#e8eeed] hover:bg-[#f7faf9]"} ${focus}`}><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#08786f]"><Dumbbell size={17} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.name}</span><span className="mt-1 block text-xs text-[#71858c]">{item.muscle}</span></span><ArrowRight size={16} className="shrink-0 text-[#6aa997]" aria-hidden="true" /></button>)}</div>
      </section>
      <section className={card}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#08786f]">Evolución por ejercicio</p><h3 className="mt-2 text-xl font-semibold sm:text-2xl">{exercise.name}</h3><p className="mt-1 text-sm text-[#71858c]">Una serie por sesión · datos de ejemplo</p></div><span className="rounded-full bg-[#edf8f4] px-3 py-1.5 text-xs font-semibold text-[#08786f]">Últimas {period} semanas</span></div>
        <div className="mt-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs text-[#71858c]">Última serie con mayor carga</p><p className="mt-1 text-3xl font-semibold tracking-tight">{number(exercise.weights[7])} <span className="text-base font-normal text-[#71858c]">kg × {exercise.repetitions[7]} reps</span></p></div><div role="group" aria-label="Métrica del ejercicio" className="flex rounded-xl bg-[#f1f6f4] p-1">{([{ id: "carga", label: "Carga" }, { id: "repeticiones", label: "Repeticiones" }] as const).map((item) => <button key={item.id} type="button" onClick={() => setMetric(item.id)} aria-pressed={metric === item.id} className={`min-h-9 rounded-lg px-3 text-xs font-semibold ${metric === item.id ? "bg-white text-[#08786f] shadow-sm" : "text-[#71858c]"} ${focus}`}>{item.label}</button>)}</div></div>
        <PerformanceChart key={`${exercise.id}-${period}-${metric}`} exercise={exercise} period={period} metric={metric} />
      </section>
    </div>
    <div className="grid gap-4 md:grid-cols-2"><section className={card}><div className="flex items-center gap-2 text-[#08786f]"><BarChart3 size={18} aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-[0.14em]">Comparación contextual</p></div><h3 className="mt-3 text-lg font-semibold">La misma cifra de repeticiones</h3><div className="mt-4 flex flex-wrap items-center gap-3"><div><p className="text-xs text-[#71858c]">Hace {period} semanas</p><p className="mt-1 text-lg font-semibold">{number(exercise.weights[first])} kg × {exercise.reps}</p></div><ArrowRight size={18} className="text-[#8cb5aa]" aria-hidden="true" /><div><p className="text-xs text-[#71858c]">Última sesión</p><p className="mt-1 text-lg font-semibold">{number(exercise.weights[7])} kg × {exercise.reps}</p></div><span className="rounded-full bg-[#e6f6ed] px-3 py-1.5 text-xs font-semibold text-[#08786f]">+{number(delta)} kg</span></div><p className="mt-3 text-xs leading-5 text-[#71858c]">Una comparación del registro, no una indicación de aumentar la carga.</p></section>
      <section className={card}><div className="flex items-center gap-2 text-[#a6672a]"><Trophy size={18} aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-[0.14em]">Marca de ejemplo</p></div><h3 className="mt-3 text-lg font-semibold">Tu mejor registro a {exercise.reps} reps</h3><p className="mt-2 text-2xl font-semibold">{number(exercise.weights[7])} <span className="text-sm font-normal text-[#71858c]">kg · última sesión</span></p><button type="button" onClick={() => setShowSets(!showSets)} aria-expanded={showSets} className={`mt-3 ${link}`}>{showSets ? "Ocultar detalle" : "Ver series de la sesión"} <ChevronDown size={16} className={showSets ? "rotate-180" : ""} aria-hidden="true" /></button>{showSets && <div className="mt-2 space-y-2">{exercise.sets.map((set, index) => <div key={set} className="flex justify-between rounded-xl bg-[#f7faf9] px-3 py-2 text-sm"><span className="text-[#71858c]">Serie {index + 1}</span><span className="font-semibold">{set}</span></div>)}</div>}</section></div>
  </div>;
}

function MuscleDetail({ period }: { period: Period }) {
  const [selectedId, setSelectedId] = useState<MuscleId>("pecho");
  const selected = muscleData.find((item) => item.id === selectedId)!;
  const maximum = Math.max(...muscleData.map((item) => item.values[period]));
  return <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
    <section className={card}><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#08786f]">Distribución muscular</p><h3 className="mt-2 text-xl font-semibold">¿Dónde has puesto el foco?</h3><p className="mt-2 text-sm leading-6 text-[#71858c]">Series de ejemplo agrupadas por músculo principal durante las últimas {period} semanas. Selecciona un grupo para explorarlo.</p><div className="mt-5 space-y-2">{muscleData.map((muscle) => <button key={muscle.id} type="button" onClick={() => setSelectedId(muscle.id)} aria-pressed={selectedId === muscle.id} className={`w-full rounded-2xl border p-3 text-left ${selectedId === muscle.id ? "border-[#acd7cb] bg-[#f4faf8]" : "border-transparent hover:bg-[#f7faf9]"} ${focus}`}><span className="flex justify-between gap-2 text-sm"><span className="font-semibold">{muscle.name}</span><span className="text-[#526e75]">{muscle.values[period]} series</span></span><span className="mt-2 block h-2 overflow-hidden rounded-full bg-[#eaf0ee]"><span className="block h-full rounded-full" style={{ width: `${muscle.values[period] / maximum * 100}%`, backgroundColor: muscle.tone }} /></span></button>)}</div></section>
    <section className={card}><span className="grid size-12 place-items-center rounded-2xl bg-[#e7f6f3] text-[#08786f]"><Layers3 size={21} aria-hidden="true" /></span><p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#08786f]">Grupo seleccionado</p><h3 className="mt-2 text-2xl font-semibold">{selected.name}</h3><p className="mt-4 text-3xl font-semibold">{selected.values[period]} <span className="text-sm font-normal text-[#71858c]">series registradas</span></p><div className="mt-5 rounded-2xl bg-[#f5f9f8] p-4"><p className="text-xs font-semibold text-[#71858c]">Ejercicio de ejemplo</p><p className="mt-2 text-sm font-semibold">{selected.exercise}</p></div><p className="mt-5 text-xs leading-5 text-[#71858c]">Vista orientativa basada en el músculo principal del ejercicio. No mide el estímulo real y este ejemplo no distingue calentamiento de trabajo.</p></section>
  </div>;
}

function AchievementsDetail() {
  return <div className="space-y-4"><section className="relative overflow-hidden rounded-[1.5rem] bg-[#183e42] p-6 text-white sm:p-7"><div aria-hidden="true" className="absolute -right-10 -top-20 size-48 rounded-full border border-white/10 shadow-[0_0_0_2rem_rgba(255,255,255,0.03),0_0_0_4rem_rgba(255,255,255,0.02)]" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a9e5d7]">Récords y constancia · ejemplo</p><h3 className="mt-3 text-2xl font-semibold">Tu historia se construye sesión a sesión.</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[#cee2dd]">Celebra lo que has registrado, sin convertir cada entrenamiento en una competición.</p></div></section><div className="grid gap-4 md:grid-cols-3">{[
    { icon: Trophy, title: "Tu mejor marca", value: "65 kg × 8", text: "Press de banca · última sesión", color: "bg-[#fff4e8] text-[#a6672a]" },
    { icon: CalendarDays, title: "Un hábito que crece", value: "4 semanas", text: "Con al menos una sesión registrada", color: "bg-[#edf2ff] text-[#375dac]" },
    { icon: Award, title: "Una meta alcanzada", value: "25 sesiones", text: "Un hito de tu recorrido de ejemplo", color: "bg-[#f3eefb] text-[#7550a4]" },
  ].map(({ icon: Icon, title, value, text, color }) => <section key={title} className={card}><span className={`grid size-11 place-items-center rounded-2xl ${color}`}><Icon size={20} aria-hidden="true" /></span><p className="mt-4 text-sm font-semibold">{title}</p><p className="mt-3 text-2xl font-semibold">{value}</p><p className="mt-2 text-xs leading-5 text-[#71858c]">{text}</p></section>)}</div><p className="text-xs leading-5 text-[#71858c]">Marcas y logros ficticios. El descanso y adaptar una sesión también forman parte del progreso.</p></div>;
}

export function TrainingExample() {
  const [view, setView] = useState<View>("resumen");
  const [period, setPeriod] = useState<Period>("4");
  const [exerciseId, setExerciseId] = useState<ExerciseId>("press");
  const [showSession, setShowSession] = useState(false);
  function openExercise(id: ExerciseId) {
    setExerciseId(id);
    setView("ejercicios");
  }
  return <div className="space-y-4">
    <section className="relative overflow-hidden rounded-[1.5rem] bg-[#173b44] p-5 text-white sm:p-7"><div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full border border-white/10 shadow-[0_0_0_3rem_rgba(255,255,255,0.025),0_0_0_6rem_rgba(255,255,255,0.02)]" /><div className="relative flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a6eee0]">Tu centro de rendimiento · ejemplo</p><h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Tu trabajo, en perspectiva.</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[#d0e3e1]">Descubre cómo evolucionan tus ejercicios y qué has entrenado, más allá de un número.</p></div><div role="group" aria-label="Periodo de entrenamiento" className="flex rounded-xl border border-white/15 bg-white/5 p-1">{([{ id: "4", label: "4 semanas" }, { id: "12", label: "12 semanas" }] as const).map((item) => <button key={item.id} type="button" onClick={() => setPeriod(item.id)} aria-pressed={period === item.id} className={`min-h-10 rounded-lg px-3 text-xs font-semibold ${period === item.id ? "bg-white text-[#173b44]" : "text-[#d0e3e1] hover:bg-white/10"} ${focus}`}>{item.label}</button>)}</div></div><div className="relative mt-6 grid grid-cols-3 gap-2 sm:gap-3">{[{ label: "Sesiones", value: period === "4" ? "11" : "29", detail: "registradas" }, { label: "Ejercicios", value: period === "4" ? "18" : "26", detail: "diferentes" }, { label: "Grupos", value: "5", detail: "en esta vista" }].map((item) => <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-[#c5d9d9]">{item.label}</p><p className="mt-2 text-xl font-semibold sm:text-2xl">{item.value}</p><p className="mt-1 text-[11px] text-[#c5d9d9]">{item.detail}</p></div>)}</div></section>
    <div role="group" aria-label="Apartados de evolución de entrenamiento" className="grid grid-cols-2 gap-2 rounded-2xl border border-[#e1e7eb] bg-white p-1.5 sm:grid-cols-4">{([{ id: "resumen", label: "Resumen" }, { id: "ejercicios", label: "Ejercicios" }, { id: "musculos", label: "Distribución muscular" }, { id: "logros", label: "Récords y logros" }] as const).map((item) => <button key={item.id} type="button" aria-pressed={view === item.id} onClick={() => setView(item.id)} className={`min-h-11 rounded-xl px-2 text-xs font-semibold sm:text-sm ${view === item.id ? "bg-[#e7f6f3] text-[#08786f]" : "text-[#647b82] hover:bg-[#f7f9fa]"} ${focus}`}>{item.label}</button>)}</div>
    {view === "resumen" && <div className="space-y-4"><div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"><section className={card}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#08786f]">Un avance que puedes explorar</p><h3 className="mt-2 text-xl font-semibold">Tu press de banca</h3><p className="mt-2 text-sm leading-6 text-[#71858c]">Comparando registros de 8 repeticiones en las últimas {period} semanas.</p></div><span className="rounded-full bg-[#e6f6ed] px-3 py-1.5 text-xs font-semibold text-[#08786f]">+{number(65 - (period === "4" ? 60 : 50))} kg</span></div><div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl bg-[#f3f9f7] p-4"><div><p className="text-xs text-[#71858c]">Antes</p><p className="mt-1 text-xl font-semibold">{period === "4" ? "60" : "50"} <span className="text-sm font-normal">kg × 8</span></p></div><ArrowRight size={18} className="text-[#8cb5aa]" aria-hidden="true" /><div><p className="text-xs text-[#71858c]">Última sesión</p><p className="mt-1 text-xl font-semibold">65 <span className="text-sm font-normal">kg × 8</span></p></div></div><button type="button" onClick={() => openExercise("press")} className={`mt-3 ${link}`}>Explorar evolución <ArrowRight size={16} aria-hidden="true" /></button></section>
      <section className={card}><div className="flex items-center gap-2 text-[#a6672a]"><Trophy size={18} aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-[0.14em]">Última marca personal</p></div><h3 className="mt-3 text-xl font-semibold">65 kg × 8 repeticiones</h3><p className="mt-2 text-sm leading-6 text-[#71858c]">Press de banca · un registro para recordar y comparar en el futuro.</p><div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#f1e7d8] bg-[#fffbf5] p-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#b77b35]"><Flame size={18} aria-hidden="true" /></span><p className="text-xs leading-5 text-[#71858c]"><strong className="block text-sm text-[#173b44]">4 semanas con actividad</strong>Una muestra de tu constancia, a tu ritmo.</p></div><button type="button" onClick={() => setView("logros")} className={`mt-3 ${link}`}>Ver récords y logros <ArrowRight size={16} aria-hidden="true" /></button></section></div>
      <div className="grid gap-4 lg:grid-cols-2"><section className={card}><div className="flex items-center gap-2 text-[#08786f]"><Activity size={18} aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-[0.14em]">Tu entrenamiento, en contexto</p></div><h3 className="mt-3 text-lg font-semibold">Distribución por músculo</h3><p className="mt-2 text-sm text-[#71858c]">Un vistazo a los grupos principales registrados.</p><div className="mt-4 flex h-3 overflow-hidden rounded-full">{muscleData.map((muscle) => <span key={muscle.id} style={{ flex: muscle.values[period], backgroundColor: muscle.tone }} />)}</div><div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">{muscleData.slice(0, 3).map((muscle) => <span key={muscle.id} className="flex items-center gap-1.5 text-xs text-[#647b82]"><span className="size-2 rounded-full" style={{ backgroundColor: muscle.tone }} />{muscle.name}</span>)}<span className="text-xs text-[#71858c]">y otros</span></div><button type="button" onClick={() => setView("musculos")} className={`mt-3 ${link}`}>Explorar distribución <ArrowRight size={16} aria-hidden="true" /></button></section>
      <section className={card}><div className="flex items-center gap-2 text-[#375dac]"><CalendarDays size={18} aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-[0.14em]">Última sesión</p></div><h3 className="mt-3 text-lg font-semibold">Tren superior · 48 min</h3><p className="mt-2 text-sm text-[#71858c]">Press de banca, remo y press de hombros.</p><button type="button" onClick={() => setShowSession(!showSession)} aria-expanded={showSession} className={`mt-3 ${link}`}>{showSession ? "Ocultar sesión" : "Ver detalle de la sesión"} <ChevronDown size={16} className={showSession ? "rotate-180" : ""} aria-hidden="true" /></button>{showSession && <div className="mt-2 space-y-2">{[{ name: "Press de banca", sets: "60 kg × 10 · 62,5 kg × 8 · 65 kg × 8" }, { name: "Remo con mancuerna", sets: "22 kg × 12 · 24 kg × 10 · 26 kg × 10" }, { name: "Press de hombros", sets: "12 kg × 10 · 12 kg × 10" }].map((item) => <div key={item.name} className="rounded-xl bg-[#f7faf9] p-3"><p className="text-sm font-semibold">{item.name}</p><p className="mt-1 text-xs leading-5 text-[#71858c]">{item.sets}</p></div>)}</div>}</section></div></div>}
    {view === "ejercicios" && <ExerciseDetail exerciseId={exerciseId} setExerciseId={setExerciseId} period={period} />}
    {view === "musculos" && <MuscleDetail period={period} />}
    {view === "logros" && <AchievementsDetail />}
    <p className="flex items-start gap-2 text-xs leading-5 text-[#71858c]"><Sparkles size={15} className="mt-0.5 shrink-0" aria-hidden="true" />Datos ficticios y funciones propuestas para valorar el diseño; no se consulta ni modifica ningún entrenamiento real.</p>
  </div>;
}

"use client";

import { Activity, ArrowLeft, ArrowRight, Award, BarChart3, CalendarDays, ChevronDown, Dumbbell, Layers3, LoaderCircle, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { exercisePoints, metricValue, muscleDistribution, sessionsInPeriod, type TrainingLog, type TrainingMetric, type TrainingProgressData, type TrainingSession } from "@/lib/training-progress";

type View = "resumen" | "ejercicios" | "musculos" | "logros";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08786f]";
const card = "min-w-0 rounded-[1.5rem] border border-[#dfeae7] bg-white p-5 shadow-[0_8px_24px_rgba(20,54,57,0.04)] sm:p-6";
const action = `inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#08786f] hover:text-[#14574f] ${focus}`;
const colors = ["#3d9d89", "#82b5df", "#ac9bda", "#e5aa80", "#dba9bc", "#86b6a4"];

function number(value: number) {
  return value.toLocaleString("es-ES", { maximumFractionDigits: 2 });
}

function date(value: string) {
  return new Date(value).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function describeSet(log: TrainingLog) {
  if (log.durationSeconds !== null) return `${number(log.durationSeconds)} s`;
  if (log.repetitions > 0) return `${log.weightKg !== null && log.weightKg > 0 ? `${number(log.weightKg)} kg · ` : "Carga 0 o no registrada · "}${log.repetitions} reps`;
  return log.weightKg !== null && log.weightKg > 0 ? `${number(log.weightKg)} kg · repeticiones no registradas` : "Sin carga ni repeticiones registradas";
}

function SessionDetails({ session }: { session: TrainingSession }) {
  const grouped = new Map<string, TrainingLog[]>();
  for (const log of session.logs) grouped.set(log.exerciseId, [...(grouped.get(log.exerciseId) ?? []), log]);
  return <div className="mt-3 space-y-2">{grouped.size ? [...grouped.entries()].map(([id, logs]) => <div key={id} className="rounded-xl bg-[#f7faf9] p-3"><p className="text-sm font-semibold">{logs[0].name}</p><p className="mt-1 text-xs leading-5 text-[#71858c]">{logs.map((log) => `Serie ${log.setNumber}: ${describeSet(log)}`).join(" · ")}</p></div>) : <p className="text-sm text-[#71858c]">Esta sesión no tiene series completadas registradas.</p>}</div>;
}

function Chart({ points, metric }: { points: ReturnType<typeof exercisePoints>; metric: TrainingMetric }) {
  const [selectedId, setSelectedId] = useState(points[points.length - 1]?.session.id ?? "");
  const selected = points.find((point) => point.session.id === selectedId) ?? points[points.length - 1];
  if (!selected) return <p className="mt-5 rounded-2xl bg-[#f7faf9] p-4 text-sm text-[#71858c]">No hay registros para esta métrica en el periodo.</p>;
  const values = points.map((point) => point.value);
  const min = Math.min(...values);
  const span = Math.max(...values) - min;
  const positions = points.map((point, index) => ({ ...point, x: points.length === 1 ? 50 : 7 + index * 86 / (points.length - 1), y: span ? 80 - (point.value - min) / span * 60 : 50 }));
  const unit = metric === "carga" ? "kg" : metric === "tiempo" ? "s" : "reps";
  return <div>
    <div className="relative mt-5 h-44 sm:h-52">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-0 h-full w-full">
        <path d="M0 20H100 M0 50H100 M0 80H100" stroke="#e8f0ed" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        <polyline points={positions.map(({ x, y }) => `${x},${y}`).join(" ")} fill="none" stroke="#138b78" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      </svg>
      {positions.map((point) => <button key={point.session.id} type="button" onClick={() => setSelectedId(point.session.id)} aria-pressed={selected.session.id === point.session.id} aria-label={`${date(point.session.completedAt)}: ${number(point.value)} ${unit}`} style={{ left: `${point.x}%`, top: `${point.y}%` }} className={`absolute grid size-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full ${focus}`}><span className={`size-3 rounded-full border-2 border-white shadow-sm ${selected.session.id === point.session.id ? "bg-[#075d54] ring-4 ring-[#bce6da]" : "bg-[#138b78]"}`} /></button>)}
    </div>
    <div className="mt-2 flex justify-between text-[11px] text-[#71858c]"><span>{date(points[0].session.completedAt)}</span><span>{date(points[points.length - 1].session.completedAt)}</span></div>
    <label className="mt-4 block text-xs font-semibold text-[#526e75]">Seleccionar sesión<select value={selected.session.id} onChange={(event) => setSelectedId(event.target.value)} className={`mt-2 min-h-11 w-full rounded-xl border border-[#dce6e8] bg-white px-3 text-sm text-[#173b44] ${focus}`}>{points.map((point) => <option key={point.session.id} value={point.session.id}>{date(point.session.completedAt)} · {describeSet(point.log)}</option>)}</select></label>
    <div aria-live="polite" className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-[#f1f8f6] px-4 py-3"><div><p className="text-xs font-semibold text-[#526e75]">{date(selected.session.completedAt)}</p><p className="mt-1 text-sm font-semibold text-[#173b44]">{describeSet(selected.log)}</p></div><span className="text-xs text-[#647b82]">Serie seleccionada · {unit}</span></div>
    <p className="mt-3 text-xs leading-5 text-[#71858c]">Cada punto representa la serie con el mayor valor de la métrica en esa sesión. La escala no empieza necesariamente en cero.</p>
  </div>;
}

function Exercises({ sessions, initialId }: { sessions: TrainingSession[]; initialId: string }) {
  const [selectedId, setSelectedId] = useState(initialId);
  const [chosenMetric, setChosenMetric] = useState<TrainingMetric>("carga");
  const logs = sessions.flatMap((session) => session.logs);
  const list = [...new Map(logs.map((log) => [log.exerciseId, { id: log.exerciseId, name: log.name, muscle: log.muscle }])).values()].sort((a, b) => a.name.localeCompare(b.name, "es"));
  const selected = list.find((item) => item.id === selectedId) ?? list[0];
  if (!selected) return <section className={card}><h3 className="text-lg font-semibold">Todavía no hay ejercicios registrados</h3><p className="mt-2 text-sm leading-6 text-[#71858c]">Completa y registra una sesión para empezar a explorar tu evolución.</p></section>;
  const exerciseLogs = logs.filter((log) => log.exerciseId === selected.id);
  const options = ([{ id: "carga", label: "Carga" }, { id: "repeticiones", label: "Repeticiones" }, { id: "tiempo", label: "Tiempo" }] as const).filter((option) => exerciseLogs.some((log) => metricValue(log, option.id) !== null));
  const metric = options.find((option) => option.id === chosenMetric)?.id ?? options[0]?.id;
  const points = metric ? exercisePoints(sessions, selected.id, metric) : [];
  const latest = points[points.length - 1];
  const comparable = metric === "carga" && latest && latest.log.repetitions > 0
    ? points.slice(0, -1).reverse().find((point) => point.log.repetitions === latest.log.repetitions)
    : undefined;
  return <div className="space-y-4"><div className="grid gap-4 lg:grid-cols-[0.32fr_0.68fr]">
    <section className={card}><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#08786f]">Tu biblioteca</p><h3 className="mt-2 text-xl font-semibold">Elige un ejercicio</h3><p className="mt-2 text-sm leading-6 text-[#71858c]">Compara registros de la misma variante.</p><div className="mt-4 max-h-96 space-y-2 overflow-y-auto">{list.map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} aria-pressed={selected.id === item.id} className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border p-3 text-left ${selected.id === item.id ? "border-[#81c7b8] bg-[#eff9f6]" : "border-[#e8eeed] hover:bg-[#f7faf9]"} ${focus}`}><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#08786f]"><Dumbbell size={17} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.name}</span><span className="mt-1 block text-xs text-[#71858c]">{item.muscle ?? "Sin clasificar"}</span></span><ArrowRight size={16} className="shrink-0 text-[#6aa997]" aria-hidden="true" /></button>)}</div></section>
    <section className={card}><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#08786f]">Evolución por ejercicio</p><h3 className="mt-2 text-xl font-semibold sm:text-2xl">{selected.name}</h3><p className="mt-1 text-sm text-[#71858c]">{points.length} {points.length === 1 ? "sesión con datos" : "sesiones con datos"} para la métrica seleccionada</p>{options.length ? <><div role="group" aria-label="Métrica del ejercicio" className="mt-5 flex flex-wrap gap-1 rounded-xl bg-[#f1f6f4] p-1">{options.map((option) => <button key={option.id} type="button" onClick={() => setChosenMetric(option.id)} aria-pressed={metric === option.id} className={`min-h-10 rounded-lg px-3 text-xs font-semibold ${metric === option.id ? "bg-white text-[#08786f] shadow-sm" : "text-[#71858c]"} ${focus}`}>{option.label}</button>)}</div><Chart key={`${selected.id}-${metric}-${sessions[0]?.id ?? ""}`} points={points} metric={metric!} /></> : <p className="mt-5 rounded-2xl bg-[#f7faf9] p-4 text-sm text-[#71858c]">Las series registradas no contienen carga, repeticiones ni duración para mostrar en una gráfica.</p>}</section>
  </div><div className="grid gap-4 md:grid-cols-2"><section className={card}><div className="flex items-center gap-2 text-[#08786f]"><BarChart3 size={18} aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-[0.14em]">Comparación contextual</p></div><h3 className="mt-3 text-lg font-semibold">Misma variante y repeticiones</h3>{comparable && latest ? <><p className="mt-3 text-sm text-[#526e75]">{date(comparable.session.completedAt)}: <strong>{describeSet(comparable.log)}</strong></p><p className="mt-2 text-sm text-[#526e75]">{date(latest.session.completedAt)}: <strong>{describeSet(latest.log)}</strong></p></> : <p className="mt-3 text-sm leading-6 text-[#71858c]">Selecciona carga y registra al menos dos sesiones con el mismo número de repeticiones para comparar.</p>}<p className="mt-3 text-xs leading-5 text-[#71858c]">Los datos no evalúan la técnica ni indican cuándo aumentar la carga.</p></section>
    <section className={card}><div className="flex items-center gap-2 text-[#a6672a]"><CalendarDays size={18} aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-[0.14em]">Último registro</p></div>{latest ? <><h3 className="mt-3 text-lg font-semibold">{describeSet(latest.log)}</h3><p className="mt-2 text-sm text-[#71858c]">{date(latest.session.completedAt)} · serie {latest.log.setNumber}</p><details className="mt-3"><summary className={`${action} cursor-pointer`}>Ver series de la sesión <ChevronDown size={16} aria-hidden="true" /></summary><SessionDetails session={{ ...latest.session, logs: latest.session.logs.filter((log) => log.exerciseId === selected.id) }} /></details></> : <p className="mt-3 text-sm text-[#71858c]">Sin datos suficientes para esta métrica.</p>}</section></div></div>;
}

function Muscles({ sessions }: { sessions: TrainingSession[] }) {
  const [selectedName, setSelectedName] = useState("");
  const groups = muscleDistribution(sessions);
  const selected = groups.find((group) => group.name === selectedName) ?? groups[0];
  if (!selected) return <section className={card}><h3 className="text-lg font-semibold">Sin distribución todavía</h3><p className="mt-2 text-sm text-[#71858c]">Registra series completadas para ver los grupos trabajados.</p></section>;
  const names = [...new Set(sessions.flatMap((session) => session.logs).filter((log) => (log.muscle ?? "Sin clasificar") === selected.name).map((log) => log.name))].sort((a, b) => a.localeCompare(b, "es"));
  return <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]"><section className={card}><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#08786f]">Distribución muscular</p><h3 className="mt-2 text-xl font-semibold">¿Dónde has puesto el foco?</h3><p className="mt-2 text-sm leading-6 text-[#71858c]">Series completadas agrupadas por músculo principal. Selecciona un grupo para explorarlo.</p><div className="mt-5 space-y-2">{groups.map((group, index) => <button key={group.name} type="button" onClick={() => setSelectedName(group.name)} aria-pressed={selected.name === group.name} className={`w-full rounded-2xl border p-3 text-left ${selected.name === group.name ? "border-[#acd7cb] bg-[#f4faf8]" : "border-transparent hover:bg-[#f7faf9]"} ${focus}`}><span className="flex justify-between gap-2 text-sm"><span className="font-semibold">{group.name}</span><span className="text-[#526e75]">{group.count} {group.count === 1 ? "serie" : "series"}</span></span><span className="mt-2 block h-2 overflow-hidden rounded-full bg-[#eaf0ee]"><span className="block h-full rounded-full" style={{ width: `${group.count / groups[0].count * 100}%`, backgroundColor: colors[index % colors.length] }} /></span></button>)}</div></section><section className={card}><span className="grid size-12 place-items-center rounded-2xl bg-[#e7f6f3] text-[#08786f]"><Layers3 size={21} aria-hidden="true" /></span><p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#08786f]">Grupo seleccionado</p><h3 className="mt-2 text-2xl font-semibold">{selected.name}</h3><p className="mt-4 text-3xl font-semibold">{selected.count} <span className="text-sm font-normal text-[#71858c]">series registradas</span></p><div className="mt-5 rounded-2xl bg-[#f5f9f8] p-4"><p className="text-xs font-semibold text-[#71858c]">Ejercicios registrados</p><p className="mt-2 text-sm leading-6 font-semibold">{names.join(" · ")}</p></div><p className="mt-5 text-xs leading-5 text-[#71858c]">Vista orientativa basada en el músculo principal del catálogo. No mide el estímulo real ni distingue series de calentamiento.</p></section></div>;
}

function Records({ sessions, period }: { sessions: TrainingSession[]; period: number }) {
  const logs = sessions.flatMap((session) => session.logs);
  const exerciseIds = [...new Set(logs.map((log) => log.exerciseId))];
  const records = exerciseIds.flatMap((id) => {
    const metric = (["carga", "repeticiones", "tiempo"] as const).find((item) => logs.some((log) => log.exerciseId === id && metricValue(log, item) !== null));
    if (!metric) return [];
    const points = exercisePoints(sessions, id, metric).sort((a, b) => b.value - a.value || b.session.completedAt.localeCompare(a.session.completedAt));
    return points[0] ? [points[0]] : [];
  }).sort((a, b) => b.session.completedAt.localeCompare(a.session.completedAt));
  const activeDays = new Set(sessions.map((session) => session.completedAt.slice(0, 10))).size;
  return <div className="space-y-4"><section className="rounded-[1.5rem] bg-[#183e42] p-6 text-white sm:p-7"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a9e5d7]">Tu recorrido</p><h3 className="mt-3 text-2xl font-semibold">Cada sesión forma parte de tu historia.</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[#cee2dd]">Explora tus mejores registros de las últimas {period} semanas, sin convertir cada entrenamiento en una competición.</p></section><div className="grid gap-4 md:grid-cols-2"><section className={card}><span className="grid size-11 place-items-center rounded-2xl bg-[#edf2ff] text-[#375dac]"><CalendarDays size={20} aria-hidden="true" /></span><p className="mt-4 text-sm font-semibold">Días con entrenamiento</p><p className="mt-3 text-2xl font-semibold">{activeDays}</p><p className="mt-2 text-xs text-[#71858c]">En el periodo seleccionado</p></section><section className={card}><span className="grid size-11 place-items-center rounded-2xl bg-[#f3eefb] text-[#7550a4]"><Award size={20} aria-hidden="true" /></span><p className="mt-4 text-sm font-semibold">Tus logros de Atempo</p><p className="mt-2 text-sm leading-6 text-[#71858c]">Consulta tus hitos de entrenamiento y constancia.</p><Link href="/achievements" className={`mt-3 ${action}`}>Ver mis logros <ArrowRight size={16} aria-hidden="true" /></Link></section></div><section className={card}><div className="flex items-center gap-2 text-[#a6672a]"><Trophy size={18} aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a6672a]">Mejores registros del periodo</p></div><p className="mt-2 text-sm leading-6 text-[#71858c]">Se muestra la mayor carga registrada por ejercicio; si no hay carga, la mayor cantidad de repeticiones o tiempo. No son necesariamente récords históricos.</p>{records.length ? <div className="mt-4 grid gap-2 sm:grid-cols-2">{records.map((record) => <div key={record.log.exerciseId} className="rounded-2xl border border-[#e5eeeb] p-4"><p className="text-sm font-semibold">{record.log.name}</p><p className="mt-2 text-lg font-semibold">{describeSet(record.log)}</p><p className="mt-1 text-xs text-[#71858c]">{date(record.session.completedAt)}</p></div>)}</div> : <p className="mt-4 text-sm text-[#71858c]">Aún no hay registros con valores para mostrar.</p>}</section></div>;
}

function TrainingCenter({ data, onBack }: { data: TrainingProgressData; onBack: () => void }) {
  const [view, setView] = useState<View>("resumen");
  const [period, setPeriod] = useState<4 | 12>(4);
  const sessions = sessionsInPeriod(data, period);
  const allLogs = sessions.flatMap((session) => session.logs);
  const lastSession = sessions[sessions.length - 1];
  const exerciseCount = new Set(allLogs.map((log) => log.exerciseId)).size;
  const groups = muscleDistribution(sessions);
  const recentExerciseIds = [...new Set([...sessions].reverse().flatMap((session) => session.logs.map((log) => log.exerciseId)))];
  const highlights = recentExerciseIds.flatMap((id) => {
    const points = exercisePoints(sessions, id, "carga");
    const latest = points[points.length - 1];
    if (!latest) return [];
    const previous = latest.log.repetitions > 0 ? points.slice(0, -1).reverse().find((point) => point.log.repetitions === latest.log.repetitions) : undefined;
    return [{ latest, previous }];
  });
  const highlight = highlights.find((item) => item.previous) ?? highlights[0];
  const difference = highlight?.previous ? highlight.latest.value - highlight.previous.value : null;
  const best = highlight
    ? exercisePoints(sessions, highlight.latest.log.exerciseId, "carga").reduce((bestPoint, point) => point.value > bestPoint.value ? point : bestPoint)
    : null;
  const sessionExerciseCount = lastSession ? new Set(lastSession.logs.map((log) => log.exerciseId)).size : 0;
  return <div className="space-y-4"><button type="button" onClick={onBack} className={action}><ArrowLeft size={16} aria-hidden="true" /> Volver a Progreso</button><section className="relative overflow-hidden rounded-[1.5rem] bg-[#173b44] p-5 text-white sm:p-7"><div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full border border-white/10 shadow-[0_0_0_3rem_rgba(255,255,255,0.025),0_0_0_6rem_rgba(255,255,255,0.02)]" /><div className="relative flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a6eee0]">Tu centro de rendimiento</p><h3 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Tu trabajo, en perspectiva.</h3><p className="mt-2 max-w-xl text-sm leading-6 text-[#d0e3e1]">Descubre cómo evolucionan tus ejercicios y qué has entrenado, más allá de un número.</p></div><div role="group" aria-label="Periodo de entrenamiento" className="flex rounded-xl border border-white/15 bg-white/5 p-1">{([4, 12] as const).map((weeks) => <button key={weeks} type="button" onClick={() => setPeriod(weeks)} aria-pressed={period === weeks} className={`min-h-10 rounded-lg px-3 text-xs font-semibold ${period === weeks ? "bg-white text-[#173b44]" : "text-[#d0e3e1] hover:bg-white/10"} ${focus}`}>{weeks} semanas</button>)}</div></div><div className="relative mt-6 grid grid-cols-3 gap-2 sm:gap-3">{[{ label: "Sesiones", value: sessions.length, detail: "completadas" }, { label: "Ejercicios", value: exerciseCount, detail: "diferentes" }, { label: "Grupos", value: groups.filter((group) => group.name !== "Sin clasificar").length, detail: "identificados" }].map((item) => <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-[#c5d9d9]">{item.label}</p><p className="mt-2 text-xl font-semibold sm:text-2xl">{item.value}</p><p className="mt-1 text-[11px] text-[#c5d9d9]">{item.detail}</p></div>)}</div></section>
    <div role="group" aria-label="Apartados de evolución de entrenamiento" className="grid grid-cols-2 gap-2 rounded-2xl border border-[#e1e7eb] bg-white p-1.5 sm:grid-cols-4">{([{ id: "resumen", label: "Resumen" }, { id: "ejercicios", label: "Ejercicios" }, { id: "musculos", label: "Distribución muscular" }, { id: "logros", label: "Récords y logros" }] as const).map((item) => <button key={item.id} type="button" aria-pressed={view === item.id} onClick={() => setView(item.id)} className={`min-h-11 rounded-xl px-2 text-xs font-semibold sm:text-sm ${view === item.id ? "bg-[#e7f6f3] text-[#08786f]" : "text-[#647b82] hover:bg-[#f7f9fa]"} ${focus}`}>{item.label}</button>)}</div>
    {view === "resumen" && <div className="grid gap-4 lg:grid-cols-2">
      <section className={card}>
        <div className="flex items-center gap-2 text-[#08786f]"><Dumbbell size={18} aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-[0.14em]">Tu evolución por ejercicio</p></div>
        {highlight ? <>
          <div className="mt-3 flex flex-wrap items-start justify-between gap-2"><h3 className="text-xl font-semibold">{highlight.latest.log.name}</h3>{difference !== null && <span className="rounded-full bg-[#edf8f4] px-3 py-1.5 text-xs font-semibold text-[#08786f]">{difference > 0 ? "+" : ""}{number(difference)} kg</span>}</div>
          <p className="mt-2 text-sm leading-6 text-[#71858c]">{highlight.previous ? "Dos registros con el mismo número de repeticiones." : "Última serie con carga registrada en el periodo."}</p>
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl bg-[#f3f9f7] p-4">
            {highlight.previous && <><div><p className="text-xs text-[#71858c]">{date(highlight.previous.session.completedAt)}</p><p className="mt-1 text-sm font-semibold">{describeSet(highlight.previous.log)}</p></div><ArrowRight size={18} className="text-[#8cb5aa]" aria-hidden="true" /></>}
            <div><p className="text-xs text-[#71858c]">{date(highlight.latest.session.completedAt)}</p><p className="mt-1 text-sm font-semibold">{describeSet(highlight.latest.log)}</p></div>
          </div>
        </> : <><h3 className="mt-3 text-xl font-semibold">Tus registros, sesión a sesión</h3><p className="mt-2 text-sm leading-6 text-[#71858c]">{exerciseCount ? `${exerciseCount} ${exerciseCount === 1 ? "ejercicio registrado" : "ejercicios registrados"} en las últimas ${period} semanas. Explora sus gráficas.` : `No hay ejercicios registrados en las últimas ${period} semanas.`}</p></>}
        <button type="button" onClick={() => setView("ejercicios")} className={`mt-3 ${action}`}>Explorar ejercicios <ArrowRight size={16} aria-hidden="true" /></button>
      </section>
      <section className={card}>
        <div className="flex items-center gap-2 text-[#a6672a]"><Trophy size={18} aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-[0.14em]">Tus mejores registros</p></div>
        {best ? <><h3 className="mt-3 text-xl font-semibold">{describeSet(best.log)}</h3><p className="mt-2 text-sm leading-6 text-[#71858c]">{best.log.name} · mayor carga del periodo · {date(best.session.completedAt)}</p></> : <><h3 className="mt-3 text-xl font-semibold">Celebra tu recorrido</h3><p className="mt-2 text-sm leading-6 text-[#71858c]">Revisa tus mejores marcas del periodo y tus logros de Atempo.</p></>}
        <button type="button" onClick={() => setView("logros")} className={`mt-3 ${action}`}>Ver récords y logros <ArrowRight size={16} aria-hidden="true" /></button>
      </section>
      <section className={card}>
        <div className="flex items-center gap-2 text-[#08786f]"><Activity size={18} aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-[0.14em]">Tu entrenamiento, en contexto</p></div>
        <h3 className="mt-3 text-lg font-semibold">Distribución por músculo</h3>
        <p className="mt-2 text-sm text-[#71858c]">{groups.length ? groups.slice(0, 3).map((group) => group.name).join(" · ") : "Todavía no hay series registradas."}</p>
        {groups.length > 0 && <div className="mt-4 flex h-3 overflow-hidden rounded-full">{groups.map((group, index) => <span key={group.name} style={{ flex: group.count, backgroundColor: colors[index % colors.length] }} />)}</div>}
        <button type="button" onClick={() => setView("musculos")} className={`mt-3 ${action}`}>Explorar distribución <ArrowRight size={16} aria-hidden="true" /></button>
      </section>
      <section className={card}>
        <div className="flex items-center gap-2 text-[#375dac]"><CalendarDays size={18} aria-hidden="true" /><p className="text-xs font-bold uppercase tracking-[0.14em]">Última sesión del periodo</p></div>
        {lastSession ? <>
          <h3 className="mt-3 text-lg font-semibold">{date(lastSession.completedAt)}{lastSession.durationMinutes !== null ? ` · ${lastSession.durationMinutes} min` : ""}</h3>
          <p className="mt-2 text-sm text-[#71858c]">{sessionExerciseCount} {sessionExerciseCount === 1 ? "ejercicio" : "ejercicios"} con series registradas</p>
          <details className="mt-3"><summary className={`${action} cursor-pointer`}>Ver detalle de la sesión <ChevronDown size={16} aria-hidden="true" /></summary><SessionDetails session={lastSession} /></details>
        </> : <p className="mt-3 text-sm text-[#71858c]">Aún no hay sesiones completadas en este periodo.</p>}
      </section>
    </div>}
    {view === "ejercicios" && <Exercises sessions={sessions} initialId={highlight?.latest.log.exerciseId ?? ""} />}
    {view === "musculos" && <Muscles sessions={sessions} />}
    {view === "logros" && <Records sessions={sessions} period={period} />}
    <p className="text-xs leading-5 text-[#71858c]">Solo se muestran sesiones y series marcadas como completadas durante el periodo seleccionado.</p>
  </div>;
}

export function TrainingProgress({ onBack }: { onBack: () => void }) {
  const [result, setResult] = useState<{ data: TrainingProgressData } | { error: string } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch("/api/progress/training", { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("No hemos podido cargar tu evolución de entrenamiento.");
        const data: TrainingProgressData = await response.json();
        if (!controller.signal.aborted) setResult({ data });
      } catch {
        if (!controller.signal.aborted) setResult({ error: "No hemos podido cargar tu evolución de entrenamiento. Inténtalo de nuevo." });
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);

  if (!result) return <section className={card}><p role="status" className="flex items-center gap-2 text-sm text-[#526e75]"><LoaderCircle size={18} className="animate-spin" aria-hidden="true" /> Cargando tu evolución...</p><button type="button" onClick={onBack} className={`mt-3 ${action}`}>Volver a Progreso</button></section>;
  if ("error" in result) return <section className={card}><p role="alert" className="text-sm text-[#9b4937]">{result.error}</p><div className="mt-3 flex gap-4"><button type="button" onClick={() => { setResult(null); setAttempt((value) => value + 1); }} className={action}>Reintentar</button><button type="button" onClick={onBack} className={action}>Volver a Progreso</button></div></section>;
  return <TrainingCenter data={result.data} onBack={onBack} />;
}

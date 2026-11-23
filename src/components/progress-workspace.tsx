"use client";

import { ArrowLeft, ArrowRight, ChevronRight, Dumbbell, HeartPulse, Plus, Ruler, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import type { ProgressCheckinSummary, ProgressMeasurementSummary } from "@/components/progress-checkin-form";
import { TrainingProgress } from "@/components/training-progress";

type View = "inicio" | "medidas" | "bienestar" | "entrenamiento" | "analisis";
type Measurement = ProgressMeasurementSummary & { id: string };
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#375dac]";
const surface = "min-w-0 rounded-[1.5rem] border border-[#e1e7eb] bg-white p-5 shadow-[0_8px_24px_rgba(20,54,57,0.04)] sm:p-6";
const secondary = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d6e0ef] bg-white px-4 py-2 text-sm font-semibold text-[#375dac] hover:bg-[#f1f5ff] ${focus}`;
const sections = [
  { id: "medidas", title: "Mis medidas", description: "Consulta tus registros y evolución corporal.", icon: Ruler, tone: "bg-[#edf2ff] text-[#375dac]" },
  { id: "bienestar", title: "Mi bienestar", description: "Revisa cómo te has sentido y tu descanso.", icon: HeartPulse, tone: "bg-[#f3eefb] text-[#7550a4]" },
  { id: "entrenamiento", title: "Evolución de entrenamiento", description: "Descubre tus avances, mejores registros y distribución muscular.", icon: Dumbbell, tone: "bg-[#e7f6f3] text-[#08786f]" },
  { id: "analisis", title: "Análisis y ajustes", description: "Pon en contexto tu evolución y revisa opciones.", icon: Sparkles, tone: "bg-[#fff4e8] text-[#a6672a]" },
] as const;
const metrics = [
  { key: "weightKg", label: "Peso", unit: "kg" },
  { key: "waistCm", label: "Cintura", unit: "cm" },
  { key: "chestCm", label: "Pecho", unit: "cm" },
  { key: "armCm", label: "Brazo", unit: "cm" },
  { key: "thighCm", label: "Muslo", unit: "cm" },
] as const;

function formatNumber(value: number) {
  return value.toLocaleString("es-ES", { maximumFractionDigits: 1 });
}

function formatDate(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00Z`).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function Measurements({ entries, form }: { entries: Measurement[]; form: ReactNode }) {
  const [metric, setMetric] = useState<(typeof metrics)[number]["key"]>("weightKg");
  const [showForm, setShowForm] = useState(false);
  const selected = metrics.find((item) => item.key === metric)!;
  const values = entries.flatMap((entry) => {
    const value = entry[metric];
    return value !== null ? [{ ...entry, value }] : [];
  }).sort((a, b) => a.measuredAt.localeCompare(b.measuredAt) || a.id.localeCompare(b.id));
  const latest = values[values.length - 1];
  const first = values[0];
  const minimum = values.length ? Math.min(...values.map((entry) => entry.value)) : 0;
  const spread = values.length ? Math.max(...values.map((entry) => entry.value)) - minimum : 0;
  const start = first ? Date.parse(`${first.measuredAt}T12:00:00Z`) : 0;
  const end = latest ? Date.parse(`${latest.measuredAt}T12:00:00Z`) : start;
  const points = values.map((entry) => ({
    x: end > start ? 8 + (Date.parse(`${entry.measuredAt}T12:00:00Z`) - start) / (end - start) * 384 : 200,
    y: spread ? 98 - (entry.value - minimum) / spread * 70 : 63,
  }));
  return <div className="space-y-4">
    <section className={`${surface} flex flex-wrap items-center justify-between gap-4`}><div className="flex items-start gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#edf2ff] text-[#375dac]"><Ruler size={21} aria-hidden="true" /></span><div><h3 className="text-lg font-semibold">Tus medidas, en un solo lugar</h3><p className="mt-1 text-sm leading-6 text-[#71858c]">Consulta tus registros y compara cómo cambian con el tiempo.</p></div></div><button type="button" onClick={() => setShowForm(!showForm)} aria-expanded={showForm} className={secondary}>{showForm ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}{showForm ? "Cerrar registro" : "Añadir medición"}</button></section>
    <div hidden={!showForm}>{form}</div>
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"><section className={surface}><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#375dac]">Evolución corporal</p><h3 className="mt-2 text-xl font-semibold">Observa tu recorrido</h3><div role="group" aria-label="Medida que mostrar" className="mt-5 flex flex-wrap gap-2">{metrics.map((item) => <button key={item.key} type="button" aria-pressed={metric === item.key} onClick={() => setMetric(item.key)} className={`min-h-10 rounded-full border px-3 text-xs font-semibold ${metric === item.key ? "border-[#375dac] bg-[#edf2ff] text-[#375dac]" : "border-[#e1e7eb] text-[#71858c] hover:bg-[#f7f9fa]"} ${focus}`}>{item.label}</button>)}</div>
      {latest && first ? <><div className="mt-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs text-[#71858c]">Último registro · {selected.label.toLowerCase()}</p><p className="mt-1 text-2xl font-semibold">{formatNumber(latest.value)} <span className="text-sm font-normal text-[#71858c]">{selected.unit}</span></p></div>{values.length > 1 && <span className="rounded-full bg-[#edf2ff] px-3 py-1.5 text-xs font-semibold text-[#375dac]">{latest.value - first.value > 0 ? "+" : ""}{formatNumber(latest.value - first.value)} {selected.unit} · desde el primer registro</span>}</div><svg viewBox="0 0 400 120" role="img" aria-label={`${selected.label}: ${values.length} registros, último valor ${formatNumber(latest.value)} ${selected.unit}.`} className="mt-5 h-32 w-full" preserveAspectRatio="none"><path d="M8 28H392 M8 63H392 M8 98H392" stroke="#e9eef2" strokeWidth="1" /><polyline points={points.map(({ x, y }) => `${x},${y}`).join(" ")} fill="none" stroke="#5277c6" strokeWidth="3" vectorEffect="non-scaling-stroke" />{points.map(({ x, y }, index) => <circle key={values[index].id} cx={x} cy={y} r="4" fill="#5277c6" />)}</svg><div className="mt-2 flex justify-between text-xs text-[#8b9ca4]"><span>{formatDate(first.measuredAt)}</span><span>{formatDate(latest.measuredAt)}</span></div><p className="mt-3 text-xs text-[#71858c]">La escala se adapta a tus registros y no empieza necesariamente en cero.</p></> : <p className="mt-5 rounded-xl bg-[#f6f8fc] p-4 text-sm text-[#71858c]">Todavía no hay registros de {selected.label.toLowerCase()}.</p>}
    </section><section className={surface}><h3 className="text-lg font-semibold">Tus registros</h3><p className="mt-1 text-xs leading-5 text-[#71858c]">Historial de {selected.label.toLowerCase()}</p>{values.length ? <div className="mt-4 max-h-80 divide-y divide-[#edf1f2] overflow-y-auto">{[...values].reverse().map((entry) => <div key={entry.id} className="flex items-center justify-between gap-3 py-3"><span className="text-sm text-[#526e75]">{formatDate(entry.measuredAt)}{entry.id === "onboarding" ? " · perfil inicial" : ""}</span><span className="text-sm font-semibold">{formatNumber(entry.value)} {selected.unit}</span></div>)}</div> : <p className="mt-4 text-sm text-[#71858c]">Aún no tienes registros de esta medida.</p>}<p className="mt-4 rounded-xl bg-[#f6f8fc] p-3 text-xs leading-5 text-[#647b82]">Un dato aislado no cuenta toda la historia: revisa la tendencia junto al resto de tu evolución.</p></section></div>
  </div>;
}

function Wellness({ checkins, form }: { checkins: ProgressCheckinSummary[]; form: ReactNode }) {
  const [showForm, setShowForm] = useState(false);
  const latest = checkins[0];
  return <div className="space-y-4"><section className={`${surface} flex flex-wrap items-center justify-between gap-4`}><div className="flex items-start gap-3"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#f3eefb] text-[#7550a4]"><HeartPulse size={21} aria-hidden="true" /></span><div><h3 className="text-lg font-semibold">Tu bienestar también cuenta</h3><p className="mt-1 text-sm leading-6 text-[#71858c]">Un espacio para registrar cómo te encuentras, más allá de las cifras.</p></div></div><button type="button" onClick={() => setShowForm(!showForm)} aria-expanded={showForm} className={secondary}>{showForm ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}{showForm ? "Cerrar revisión" : "Nueva revisión"}</button></section><div hidden={!showForm}>{form}</div>
    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"><section className={surface}><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#7550a4]">Última revisión</p><h3 className="mt-2 text-xl font-semibold">Cómo te has sentido</h3>{latest ? <><p className="mt-1 text-xs text-[#71858c]">{formatDate(latest.checked_in_at)}</p><div className="mt-5 grid grid-cols-2 gap-3">{[{ label: "Energía", value: latest.energy_score }, { label: "Sueño", value: latest.sleep_score }, { label: "Estrés", value: latest.stress_score }, { label: "Molestias musculares", value: latest.soreness_score }].map((item) => <div key={item.label} className="rounded-2xl bg-[#f7f6fc] p-4"><p className="text-xs text-[#71858c]">{item.label}</p><p className="mt-2 text-xl font-semibold">{item.value} <span className="text-sm font-normal text-[#71858c]">/ 5</span></p></div>)}</div><p className="mt-4 text-xs leading-5 text-[#71858c]">Estas puntuaciones reflejan lo que registraste, no una valoración médica.</p></> : <p className="mt-4 text-sm text-[#71858c]">Aún no has guardado ninguna revisión.</p>}</section>
      <section className={surface}><h3 className="text-lg font-semibold">Revisiones anteriores</h3><p className="mt-1 text-xs text-[#71858c]">Hasta tus 30 revisiones más recientes</p>{checkins.length ? <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">{checkins.map((review) => <div key={review.checked_in_at} className="rounded-2xl border border-[#edf1f2] p-3"><p className="text-sm font-semibold">{formatDate(review.checked_in_at)}</p><p className="mt-1 text-xs text-[#71858c]">Energía {review.energy_score}/5 · Sueño {review.sleep_score}/5 · Estrés {review.stress_score}/5 · Molestias {review.soreness_score}/5</p></div>)}</div> : <p className="mt-4 text-sm text-[#71858c]">Aquí aparecerá tu historial cuando guardes una revisión.</p>}<p className="mt-4 text-xs leading-5 text-[#71858c]">Guardar una revisión no cambia automáticamente tu plan.</p></section></div>
  </div>;
}

export function ProgressWorkspace({ entries, checkins, measurementForm, wellnessForm, analysis }: { entries: Measurement[]; checkins: ProgressCheckinSummary[]; measurementForm: ReactNode; wellnessForm: ReactNode; analysis: ReactNode }) {
  const [view, setView] = useState<View>("inicio");
  const current = sections.find((section) => section.id === view);
  return <div className="space-y-5">
    {view === "inicio" && <><section className="relative overflow-hidden rounded-[1.75rem] bg-[#173b44] p-6 text-white sm:p-8"><div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full border border-white/10 shadow-[0_0_0_3rem_rgba(255,255,255,0.025),0_0_0_6rem_rgba(255,255,255,0.02)]" /><div className="relative flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b6caff]">Tu evolución</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Cada paso cuenta.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#d0e3e1]">Tus registros, tu bienestar y tus entrenamientos, en un espacio pensado para ti.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setView("medidas")} className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#173b44] ${focus}`}><Plus size={16} aria-hidden="true" /> Mis medidas</button><Link href="/checkin" className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-white/30 px-5 text-sm font-semibold text-white hover:bg-white/10 ${focus}`}>Actualizar mi plan <ArrowRight size={16} aria-hidden="true" /></Link></div></div></section><div className="pt-2"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#375dac]">Tu espacio</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">¿Qué quieres revisar?</h2><p className="mt-1 text-sm text-[#71858c]">Entra solo en el apartado que necesites.</p></div><div className="grid gap-3 md:grid-cols-2">{sections.map((section) => { const Icon = section.icon; return <button key={section.id} type="button" onClick={() => setView(section.id)} className={`group flex w-full items-start gap-4 rounded-[1.4rem] border border-[#e1e7eb] bg-white p-4 text-left shadow-[0_8px_24px_rgba(20,54,57,0.04)] hover:border-[#b8cbed] sm:p-5 ${focus}`}><span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${section.tone}`}><Icon size={20} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold sm:text-base">{section.title}</span><span className="mt-1 block text-xs leading-5 text-[#71858c] sm:text-sm">{section.description}</span><span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#375dac]">Explorar <ArrowRight size={14} aria-hidden="true" /></span></span><ChevronRight size={18} className="shrink-0 text-[#9cafb1] group-hover:text-[#375dac]" aria-hidden="true" /></button>; })}</div></>}
    {view !== "inicio" && view !== "entrenamiento" && current && <><button type="button" onClick={() => setView("inicio")} className={`inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#526e75] hover:text-[#375dac] ${focus}`}><ArrowLeft size={16} aria-hidden="true" /> Volver a Progreso</button><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#375dac]">Tu progreso</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{current.title}</h2><p className="mt-2 text-sm text-[#71858c]">{current.description}</p></div></>}
    <div hidden={view !== "medidas"}><Measurements entries={entries} form={measurementForm} /></div>
    <div hidden={view !== "bienestar"}><Wellness checkins={checkins} form={wellnessForm} /></div>
    {view === "entrenamiento" && <TrainingProgress onBack={() => setView("inicio")} />}
    <div hidden={view !== "analisis"} className="space-y-4">{analysis}</div>
  </div>;
}

"use client";

import { Apple, ArrowLeft, ArrowRight, ChartNoAxesCombined, Check, ChevronRight, Dumbbell, HeartPulse, LayoutDashboard, LockKeyhole, Plus, Ruler, Sparkles, UserRound } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

import { MeasurementsExample, WellnessExample } from "./detail-examples";
import { TrainingExample } from "./training-example";

type View = "inicio" | "medidas" | "bienestar" | "entrenamiento" | "analisis";
type Design = "ordenada" | "visual";
type Access = "free" | "premium";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#375dac]";
const primary = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#173b44] px-5 py-2 text-sm font-semibold text-white hover:bg-[#24535a] ${focus}`;
const secondary = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d6e0ef] bg-white px-4 py-2 text-sm font-semibold text-[#375dac] hover:bg-[#f1f5ff] ${focus}`;
const surface = "rounded-[1.5rem] border border-[#e1e7eb] bg-white p-5 shadow-[0_8px_24px_rgba(20,54,57,0.04)] sm:p-6";

const sections = [
  { id: "medidas", title: "Mis medidas", description: "Consulta tus registros y evolución corporal.", icon: Ruler, premium: false, tone: "bg-[#edf2ff] text-[#375dac]" },
  { id: "bienestar", title: "Mi bienestar", description: "Revisa cómo te has sentido y tu descanso.", icon: HeartPulse, premium: false, tone: "bg-[#f3eefb] text-[#7550a4]" },
  { id: "entrenamiento", title: "Evolución de entrenamiento", description: "Descubre tus avances, récords y distribución muscular.", icon: Dumbbell, premium: true, tone: "bg-[#e7f6f3] text-[#08786f]" },
  { id: "analisis", title: "Análisis y ajustes", description: "Pon en contexto tu evolución y revisa opciones.", icon: Sparkles, premium: true, tone: "bg-[#fff4e8] text-[#a6672a]" },
] as const;

const dashboardTabs = [
  { label: "Resumen", icon: LayoutDashboard, color: "#163e49" },
  { label: "Entrenamiento", icon: Dumbbell, color: "#08786f" },
  { label: "Nutrición", icon: Apple, color: "#b6503c" },
  { label: "Progreso", icon: ChartNoAxesCombined, color: "#375dac" },
] as const;

function WeightChart() {
  return <div>
    <div className="flex items-end justify-between gap-3"><div><p className="text-xs font-semibold text-[#71858c]">Peso registrado · ejemplo</p><p className="mt-1 text-2xl font-semibold">72,3 <span className="text-sm font-normal text-[#71858c]">kg</span></p></div><span className="rounded-full bg-[#edf2ff] px-3 py-1.5 text-xs font-semibold text-[#375dac]">−0,8 kg · 4 semanas</span></div>
    <svg viewBox="0 0 400 130" role="img" aria-label="Ejemplo de peso: 73,1 kg al inicio y 72,3 kg en la última medición." className="mt-4 h-32 w-full overflow-visible" preserveAspectRatio="none">
      <path d="M0 30H400 M0 75H400 M0 120H400" stroke="#e9eef2" strokeWidth="1" />
      <path d="M0 20 L100 40 L200 50 L300 70 L400 100 L400 120 L0 120 Z" fill="#edf2ff" />
      <path d="M0 20 L100 40 L200 50 L300 70 L400 100" fill="none" stroke="#5277c6" strokeWidth="3" vectorEffect="non-scaling-stroke" />
      <circle cx="0" cy="20" r="4" fill="#5277c6" /><circle cx="100" cy="40" r="4" fill="#5277c6" /><circle cx="200" cy="50" r="4" fill="#5277c6" /><circle cx="300" cy="70" r="4" fill="#5277c6" /><circle cx="400" cy="100" r="4" fill="#5277c6" />
    </svg>
    <div className="mt-2 flex justify-between text-xs text-[#8b9ca4]"><span>Hace 4 semanas</span><span>Último registro</span></div>
  </div>;
}

function SectionCard({ id, onOpen, access, compact = false }: { id: Exclude<View, "inicio">; onOpen: (view: View) => void; access: Access; compact?: boolean }) {
  const item = sections.find((section) => section.id === id)!;
  const Icon = item.icon;
  return <button type="button" onClick={() => onOpen(id)} className={`group flex w-full items-start gap-4 rounded-[1.4rem] border border-[#e1e7eb] bg-white p-4 text-left shadow-[0_8px_24px_rgba(20,54,57,0.04)] hover:border-[#b8cbed] sm:p-5 ${focus}`}>
    <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${item.tone}`}><Icon size={20} aria-hidden="true" /></span>
    <span className="min-w-0 flex-1"><span className="flex flex-wrap items-center gap-2"><span className="text-sm font-semibold sm:text-base">{item.title}</span>{item.premium && <span className="inline-flex items-center gap-1 rounded-full bg-[#edf2ff] px-2 py-1 text-[10px] font-bold text-[#375dac]">{access === "free" && <LockKeyhole size={11} aria-hidden="true" />} Premium</span>}</span><span className="mt-1 block text-xs leading-5 text-[#71858c] sm:text-sm">{item.description}</span>{!compact && <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#375dac]">{item.premium && access === "free" ? "Ver función Premium" : "Explorar"} <ArrowRight size={14} aria-hidden="true" /></span>}</span>
    <ChevronRight size={18} className="shrink-0 text-[#9cafb1] group-hover:text-[#375dac]" aria-hidden="true" />
  </button>;
}

function Detail({ view, onSimulate }: { view: Exclude<View, "inicio">; onSimulate: (action: string) => void }) {
  if (view === "medidas") return <MeasurementsExample />;
  if (view === "bienestar") return <WellnessExample />;
  if (view === "entrenamiento") return <TrainingExample />;

  return <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"><section className={surface}><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a6672a]">Una mirada conjunta</p><h3 className="mt-2 text-xl font-semibold">Tu evolución en contexto</h3><p className="mt-2 text-sm leading-6 text-[#71858c]">Una propuesta de cómo reunir tus registros antes de decidir si quieres revisar el plan.</p><div className="mt-5 space-y-3">{[{ icon: Ruler, title: "Medidas", text: "El peso de ejemplo cambió −0,8 kg en 4 semanas." }, { icon: Dumbbell, title: "Entrenamiento", text: "2 de 3 sesiones completadas esta semana de ejemplo." }, { icon: HeartPulse, title: "Bienestar", text: "Última revisión de energía: 4 de 5." }].map(({ icon: Icon, title, text }) => <div key={title} className="flex gap-3 rounded-2xl border border-[#edf1f2] p-4"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f2f6fb] text-[#375dac]"><Icon size={17} aria-hidden="true" /></span><div><p className="text-sm font-semibold">{title}</p><p className="mt-1 text-xs leading-5 text-[#71858c]">{text}</p></div></div>)}</div></section><section className={surface}><span className="grid size-11 place-items-center rounded-2xl bg-[#fff4e8] text-[#a6672a]"><Sparkles size={20} aria-hidden="true" /></span><h3 className="mt-4 text-lg font-semibold">Revisar antes de ajustar</h3><p className="mt-2 text-sm leading-6 text-[#71858c]">Una posible revisión mostraría sus motivos y cambios propuestos. Tú decidirías si aplicarlos.</p><button type="button" onClick={() => onSimulate("Revisar propuesta")} className={`mt-5 ${secondary}`}>Ver propuesta <ArrowRight size={15} aria-hidden="true" /></button><p className="mt-3 text-xs leading-5 text-[#71858c]">Es una idea de diseño, no una recomendación sanitaria.</p></section></div>;
}

function LockedDetail({ title, children, showPlans, onPlans }: { title: string; children: ReactNode; showPlans: boolean; onPlans: () => void }) {
  return <div className="relative overflow-clip rounded-[1.5rem]">
    <div inert aria-hidden="true" className={`pointer-events-none select-none bg-[#f4f6f8] blur-[4px] ${showPlans ? "min-h-[560px]" : "min-h-[480px]"}`}>{children}</div>
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-white/10" />
    <div className="pointer-events-none absolute inset-0 flex justify-center px-4"><div className="pointer-events-auto sticky top-4 mt-4 h-fit w-full max-w-sm self-start rounded-[1.5rem] border border-[#d6e8e3] bg-white p-5 text-center shadow-[0_20px_60px_rgba(23,59,68,0.25)] sm:mt-8">
      <span className="mx-auto grid size-11 place-items-center rounded-2xl bg-[#e7f6f3] text-[#08786f]"><LockKeyhole size={20} aria-hidden="true" /></span><p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#08786f]">Función Premium</p><h3 className="mt-2 text-xl font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[#647b82]">Desbloquea el seguimiento avanzado junto a nutrición y rutinas automáticas.</p><button type="button" onClick={onPlans} aria-expanded={showPlans} className={`mt-4 w-full ${primary}`}>{showPlans ? "Ocultar planes de ejemplo" : "Ver planes de pago"} <ArrowRight size={16} aria-hidden="true" /></button>{showPlans && <section aria-label="Planes de ejemplo" className="mt-3 rounded-xl bg-[#f1f9f6] p-3 text-xs leading-5 text-[#526e75]"><strong className="text-[#173b44]">Mensual, trimestral y anual.</strong> Muestra sin pagos reales.</section>}<p className="mt-3 text-xs text-[#71858c]">Tus registros básicos siguen disponibles gratis.</p>
    </div></div>
  </div>;
}

export function ProgressPremiumPreview() {
  const [design, setDesign] = useState<Design>("ordenada");
  const [access, setAccess] = useState<Access>("premium");
  const [view, setView] = useState<View>("inicio");
  const [showPlans, setShowPlans] = useState(false);
  const [feedback, setFeedback] = useState("");
  const current = sections.find((item) => item.id === view);
  const locked = access === "free" && current?.premium;

  function navigate(next: View) {
    setView(next);
    setShowPlans(false);
    setFeedback("");
  }

  function simulate(action: string) {
    setFeedback(`${action}: acción simulada. No se ha guardado ni cambiado ningún dato.`);
  }

  return <main className="min-h-screen bg-[#f4f6f8] px-4 py-4 text-[#172f3b] sm:px-7 sm:py-7"><div className="mx-auto max-w-[1320px]">
    <div role="note" className="rounded-2xl border border-[#d4e4e6] bg-white px-4 py-3 text-xs leading-5 text-[#526e75]"><strong className="text-[#173b44]">Muestra de Progreso.</strong> Diseños y funciones propuestas con datos ficticios: no se modifican datos ni se activan bloqueos, suscripciones o pagos. <Link href="/preview-bloqueo-dashboard" className={`font-semibold text-[#08786f] underline underline-offset-2 ${focus}`}>Ver muestra de Nutrición</Link></div>
    <section aria-label="Controles de la muestra" className="mt-4 grid gap-4 rounded-[1.4rem] border border-[#dce9e7] bg-white p-4 sm:grid-cols-2 sm:p-5">
      <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#71858c]">1 · Diseño de inicio</p><div role="group" aria-label="Diseño de inicio" className="mt-2 grid grid-cols-2 gap-2">{([{ id: "ordenada", title: "A · Por apartados", text: "Limpia y organizada" }, { id: "visual", title: "B · Más visual", text: "Evolución a primera vista" }] as const).map((option) => <button key={option.id} type="button" aria-pressed={design === option.id} onClick={() => { setDesign(option.id); navigate("inicio"); }} className={`min-h-14 rounded-xl border px-3 py-2 text-left ${design === option.id ? "border-[#08786f] bg-[#eef9f6] text-[#08786f]" : "border-[#e2eaea] text-[#526e75]"} ${focus}`}><span className="block text-xs font-bold sm:text-sm">{option.title}</span><span className="mt-1 block text-[11px] font-normal">{option.text}</span></button>)}</div></div>
      <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#71858c]">2 · Estado de acceso</p><div role="group" aria-label="Estado de acceso" className="mt-2 grid grid-cols-2 gap-2">{([{ id: "free", title: "Free", text: "Después de la prueba" }, { id: "premium", title: "Acceso completo", text: "Prueba o Premium" }] as const).map((option) => <button key={option.id} type="button" aria-pressed={access === option.id} onClick={() => { setAccess(option.id); setShowPlans(false); setFeedback(""); }} className={`min-h-14 rounded-xl border px-3 py-2 text-left ${access === option.id ? "border-[#08786f] bg-[#eef9f6] text-[#08786f]" : "border-[#e2eaea] text-[#526e75]"} ${focus}`}><span className="block text-xs font-bold sm:text-sm">{option.title}</span><span className="mt-1 block text-[11px] font-normal">{option.text}</span></button>)}</div></div>
    </section>

    <header className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#d6e5e2] pb-5"><div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#163e49] text-[#a6eee0]"><Sparkles size={18} aria-hidden="true" /></span><span><span className="block font-semibold tracking-tight">Atempo Fit</span><span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#607d79]">Tu espacio personal</span></span></div><span className="flex items-center gap-2 rounded-full border border-[#dfe8e8] bg-white py-1 pl-1.5 pr-3 text-xs font-semibold text-[#315d5a]"><span className="grid size-8 place-items-center rounded-full bg-[#e7f6f3] text-[#08786f]"><UserRound size={16} aria-hidden="true" /></span>Mi espacio · Alex</span></header>
    <div className="mt-7"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#08786f]"><span className="size-2 rounded-full bg-[#08786f]" /> Tu espacio de progreso</p><h1 className="mt-3 text-4xl font-semibold tracking-[-0.06em] sm:text-5xl">Tu ritmo. Tu progreso.</h1><p className="mt-2 text-sm leading-6 text-[#667d88]">Todo lo que necesitas para seguir avanzando, en un solo lugar.</p></div>
    <nav aria-label="Secciones del dashboard de ejemplo" className="mt-7 grid grid-cols-2 gap-2 rounded-2xl border border-[#e0e7eb] bg-white p-1.5 sm:grid-cols-4">{dashboardTabs.map(({ label, icon: Icon, color }) => <span key={label} aria-current={label === "Progreso" ? "page" : undefined} className={`flex min-h-12 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-semibold sm:text-sm ${label === "Progreso" ? "border-[#375dac] bg-[#edf2ff] text-[#375dac]" : "border-transparent text-[#5b707b]"}`}><Icon size={17} style={{ color }} aria-hidden="true" />{label}</span>)}</nav>

    {feedback && <p role="status" className="mt-4 rounded-xl border border-[#cde6e0] bg-[#effaf7] px-4 py-3 text-sm text-[#315d5a]">{feedback}</p>}

    {view === "inicio" ? <div className="mt-7">
      {design === "ordenada" ? <><section className="relative overflow-hidden rounded-[1.75rem] bg-[#173b44] p-6 text-white sm:p-8"><div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full border border-white/10 shadow-[0_0_0_3rem_rgba(255,255,255,0.025),0_0_0_6rem_rgba(255,255,255,0.02)]" /><div className="relative flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b6caff]">Tu evolución</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Cada paso cuenta.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#d0e3e1]">Tus registros, tu bienestar y tus entrenamientos, en un espacio pensado para ti.</p></div><button type="button" onClick={() => navigate("medidas")} className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-semibold text-[#173b44] ${focus}`}><Plus size={16} aria-hidden="true" /> Mis medidas</button></div></section><div className="mt-7"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#375dac]">Tu espacio</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">¿Qué quieres revisar?</h2><p className="mt-1 text-sm text-[#71858c]">Entra solo en el apartado que necesites.</p></div><div className="mt-4 grid gap-3 md:grid-cols-2">{sections.map((section) => <SectionCard key={section.id} id={section.id} onOpen={navigate} access={access} />)}</div></> : <><div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"><section className={surface}><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#375dac]">Tu evolución</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Tu recorrido de un vistazo.</h2><p className="mt-1 text-sm text-[#71858c]">Un resumen visual de tus registros.</p></div><button type="button" onClick={() => navigate("medidas")} className={secondary}>Ver mis medidas <ArrowRight size={15} aria-hidden="true" /></button></div><div className="mt-6"><WeightChart /></div></section><section className="relative overflow-hidden rounded-[1.5rem] bg-[#173b44] p-6 text-white"><div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-48 rounded-full border border-white/10 shadow-[0_0_0_2rem_rgba(255,255,255,0.03)]" /><div className="relative"><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b6caff]">Tu semana de ejemplo</p><h2 className="mt-3 text-2xl font-semibold">Lo importante es seguir.</h2><div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-[#c5d9d9]">Entrenamientos</p><p className="mt-2 text-xl font-semibold">2 <span className="text-sm font-normal text-[#c5d9d9]">de 3</span></p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-[#c5d9d9]">Energía</p><p className="mt-2 text-xl font-semibold">4 <span className="text-sm font-normal text-[#c5d9d9]">de 5</span></p></div></div><p className="mt-5 text-xs leading-5 text-[#c5d9d9]">Un espacio para entender tu recorrido, no solo el peso.</p></div></section></div><div className="mt-7 flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#375dac]">Explora tu progreso</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Todo en su lugar</h2></div><span className="text-xs text-[#71858c]">Elige un apartado para ver el detalle</span></div><div className="mt-4 grid gap-3 md:grid-cols-2">{sections.map((section) => <SectionCard key={section.id} id={section.id} onOpen={navigate} access={access} compact />)}</div></>}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d9e7e5] bg-[#f1f9f6] p-4"><p className="text-xs leading-5 text-[#526e75]"><strong className="text-[#173b44]">Acceso completo:</strong> nutrición, rutinas automáticas y seguimiento avanzado, en una suscripción.</p><button type="button" onClick={() => setShowPlans(true)} className={`text-xs font-semibold text-[#08786f] ${focus}`}>Ver planes de ejemplo <ArrowRight size={14} className="inline" aria-hidden="true" /></button></div>
      {showPlans && <section aria-label="Planes de ejemplo" className="mt-3 rounded-2xl border border-[#cfe6df] bg-white p-4 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#08786f]">Acceso completo</p><h2 className="mt-2 text-lg font-semibold">Más que nutrición</h2><p className="mt-2 text-sm leading-6 text-[#526e75]">La propuesta reúne nutrición, rutinas automáticas y seguimiento avanzado en una misma suscripción.</p><p className="mt-2 text-xs text-[#71858c]">Mensual, trimestral y anual · muestra sin pagos reales.</p></div><button type="button" onClick={() => setShowPlans(false)} className={secondary}>Cerrar</button></div></section>}
    </div> : current && <div className="mt-6">
      <button type="button" onClick={() => navigate("inicio")} className={`inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#526e75] hover:text-[#375dac] ${focus}`}><ArrowLeft size={16} aria-hidden="true" /> Volver a Progreso</button>
      <div className="my-5 flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#375dac]">Tu progreso</p><h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{current.title}</h2><p className="mt-2 text-sm text-[#71858c]">{current.description}</p></div><span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${current.premium ? "bg-[#edf2ff] text-[#375dac]" : "bg-[#e7f6f3] text-[#08786f]"}`}>{locked ? <LockKeyhole size={14} aria-hidden="true" /> : <Check size={14} aria-hidden="true" />}{current.premium ? "Premium" : "Disponible gratis"}</span></div>
      {locked ? <LockedDetail title={current.title} showPlans={showPlans} onPlans={() => setShowPlans(!showPlans)}><Detail view={current.id} onSimulate={simulate} /></LockedDetail> : <Detail view={current.id} onSimulate={simulate} />}
    </div>}
    <p className="my-7 text-center text-xs leading-5 text-[#71858c]">Datos ficticios. El diseño y la distribución de funciones Free/Premium son propuestas por decidir.</p>
  </div></main>;
}

"use client";

import { ArrowLeft, ArrowRight, Bell, CalendarDays, Check, ChefHat, ChevronRight, Clock3, Dumbbell, LineChart, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Area = "nutricion" | "progreso";
type Design = "central" | "parcial";
type Stage = "inicio" | "tres" | "uno" | "final";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#375dac]";
const primary = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#173b44] px-5 py-2 text-sm font-semibold text-white hover:bg-[#24535a] ${focus}`;
const secondary = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d6e5e2] bg-white px-5 py-2 text-sm font-semibold text-[#315d5a] hover:bg-[#f1f8f6] ${focus}`;

const stages: { id: Stage; label: string }[] = [
  { id: "inicio", label: "Inicio · 14 días" },
  { id: "tres", label: "Quedan 3 días" },
  { id: "uno", label: "Queda 1 día" },
  { id: "final", label: "Prueba finalizada" },
];

const areas = {
  nutricion: {
    title: "Tu alimentación, a tu manera.",
    intro: "Organiza tus comidas y encuentra el equilibrio que mejor encaja contigo.",
    premium: "Planificación automática",
    description: "Genera y ajusta tu dieta automáticamente según tu perfil y preferencias.",
    freeTitle: "Tu nutrición sigue contigo",
    freeText: "Consulta tu dieta guardada y crea o modifica comidas manualmente.",
    freeAction: "Crear dieta manual",
    icon: ChefHat,
    tone: "text-[#b6503c]",
    soft: "bg-[#fff1ed]",
  },
  progreso: {
    title: "Cada paso cuenta.",
    intro: "Consulta tu evolución y sigue avanzando a tu ritmo.",
    premium: "Reajuste automático",
    description: "Descubre la propuesta de reajuste automático de tu entrenamiento y nutrición.",
    freeTitle: "Tus registros siempre accesibles",
    freeText: "Sigue registrando y consultando tus medidas y tu evolución básica.",
    freeAction: "Ver mis registros",
    icon: LineChart,
    tone: "text-[#466dc0]",
    soft: "bg-[#edf2ff]",
  },
} as const;

function ExampleContent({ area }: { area: Area }) {
  if (area === "nutricion") {
    return <div className="space-y-4">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#b6503c]">Tu planificación</p><h3 className="mt-2 text-xl font-semibold">Tu día de comidas</h3><p className="mt-1 text-sm text-[#71858c]">Una propuesta adaptada a ti</p></div><span className="rounded-full bg-[#fff1ed] px-3 py-1.5 text-xs font-semibold text-[#a95643]">4 comidas</span></div>
      <div className="grid grid-cols-3 gap-2">{[["Energía", "2.150 kcal"], ["Proteína", "135 g"], ["Comidas", "4 al día"]].map(([label, value]) => <div key={label} className="rounded-2xl bg-[#f7f9f9] p-3"><p className="text-[11px] text-[#71858c]">{label}</p><p className="mt-1 text-sm font-semibold sm:text-base">{value}</p></div>)}</div>
      <div className="space-y-2">{[["Desayuno", "Una forma de empezar el día"], ["Comida", "Tu plato principal"], ["Cena", "Una opción para terminar el día"]].map(([name, text], index) => <div key={name} className="flex items-center gap-3 rounded-2xl border border-[#edf0ef] p-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#fff1ed] text-sm font-bold text-[#b6503c]">0{index + 1}</span><div className="min-w-0 flex-1"><p className="text-sm font-semibold">{name}</p><p className="mt-0.5 text-xs text-[#71858c]">{text}</p></div><ChevronRight size={17} className="text-[#b7c5c6]" aria-hidden="true" /></div>)}</div>
    </div>;
  }
  return <div className="space-y-4">
    <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#466dc0]">Tu evolución</p><h3 className="mt-2 text-xl font-semibold">Una mirada a tu progreso</h3><p className="mt-1 text-sm text-[#71858c]">Un ejemplo de seguimiento personal</p></div><span className="rounded-full bg-[#edf2ff] px-3 py-1.5 text-xs font-semibold text-[#466dc0]">Ejemplo</span></div>
    <div className="grid grid-cols-3 gap-2">{[["Último registro", "72,0 kg"], ["Objetivo", "En marcha"], ["Evolución", "−1,2 kg"]].map(([label, value]) => <div key={label} className="rounded-2xl bg-[#f7f9f9] p-3"><p className="text-[11px] text-[#71858c]">{label}</p><p className="mt-1 text-sm font-semibold sm:text-base">{value}</p></div>)}</div>
    <div className="rounded-2xl border border-[#edf0ef] p-4"><div className="flex justify-between text-xs font-semibold text-[#71858c]"><span>Evolución de ejemplo</span><span>Últimas semanas</span></div><div className="mt-4 flex h-28 items-end justify-around gap-2 border-b border-[#e3eaf0]">{[35, 44, 49, 56, 68, 77, 88].map((height, index) => <div key={index} className="w-full max-w-9 rounded-t-lg bg-[#c6d6f5]" style={{ height: `${height}%` }} />)}</div><div className="mt-2 flex justify-between text-[10px] text-[#9aabb3]"><span>Inicio</span><span>Hoy</span></div></div>
  </div>;
}

export function AccessPreview() {
  const [area, setArea] = useState<Area>("nutricion");
  const [design, setDesign] = useState<Design>("central");
  const [stage, setStage] = useState<Stage>("final");
  const [showPlans, setShowPlans] = useState(false);
  const [feedback, setFeedback] = useState("");
  const content = areas[area];
  const Icon = content.icon;
  const expired = stage === "final";

  function chooseArea(next: Area) {
    setArea(next);
    setFeedback("");
  }

  function openPlans() {
    setShowPlans(true);
    setFeedback("");
  }

  return <main className="min-h-screen bg-[#f4f6f8] px-4 py-4 text-[#172f3b] sm:px-7 sm:py-7">
    <div className="mx-auto max-w-6xl">
      <div role="note" className="rounded-2xl border border-[#d4e4e6] bg-white px-4 py-3 text-xs leading-5 text-[#526e75]"><strong className="text-[#173b44]">Muestra interactiva.</strong> Todo el contenido y las fechas son ejemplos. No se activan pruebas, pagos, bloqueos ni notificaciones reales.</div>
      <header className="mt-5 flex items-center justify-between gap-3 border-b border-[#dce7e6] pb-5">
        <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#163e49] text-[#a6eee0]"><Sparkles size={18} aria-hidden="true" /></span><span><span className="block text-sm font-semibold sm:text-base">Atempo Fit</span><span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[#607d79] sm:block">Tu espacio personal</span></span></div>
        <span className="inline-flex items-center gap-2 rounded-full border border-[#dfe8e8] bg-white px-3 py-2 text-xs font-semibold text-[#526e75]"><Bell size={15} aria-hidden="true" /> Avisos de ejemplo</span>
      </header>

      <div className="mt-6"><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#08786f]">Laboratorio de diseño</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Prueba y acceso Premium</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#667d88]">Compara los avisos de la prueba de 14 días y dos maneras de presentar las funciones de pago.</p><Link href="/preview-bloqueo-dashboard" className={`mt-4 ${primary}`}>Ver bloqueo en el dashboard <ArrowRight size={16} aria-hidden="true" /></Link></div>

      <section aria-label="Controles de la muestra" className="mt-5 rounded-[1.5rem] border border-[#dce9e7] bg-white p-4 sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
          <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#71858c]">1 · Elige la sección</p><div role="group" aria-label="Sección de ejemplo" className="mt-2 grid grid-cols-2 gap-2">{(["nutricion", "progreso"] as const).map((id) => <button key={id} type="button" aria-pressed={area === id} onClick={() => chooseArea(id)} className={`min-h-11 rounded-xl border px-3 text-sm font-semibold ${area === id ? "border-[#08786f] bg-[#eef9f6] text-[#08786f]" : "border-[#e2eaea] text-[#526e75] hover:bg-[#f7faf9]"} ${focus}`}>{id === "nutricion" ? "Nutrición" : "Progreso"}</button>)}</div></div>
          <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#71858c]">2 · Momento de la prueba</p><div role="group" aria-label="Momento de la prueba" className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{stages.map((option) => <button key={option.id} type="button" aria-pressed={stage === option.id} onClick={() => { setStage(option.id); setFeedback(""); }} className={`min-h-11 rounded-xl border px-2 py-2 text-xs font-semibold ${stage === option.id ? "border-[#08786f] bg-[#eef9f6] text-[#08786f]" : "border-[#e2eaea] text-[#526e75] hover:bg-[#f7faf9]"} ${focus}`}>{option.label}</button>)}</div></div>
        </div>
        <div className="mt-5 border-t border-[#edf2f1] pt-4"><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#71858c]">3 · Vista al finalizar la prueba</p><div role="group" aria-label="Diseño del bloqueo" className="mt-2 grid gap-2 sm:grid-cols-2">{([{ id: "central", title: "A · Ventana central", detail: "Desenfoque con mensaje protagonista" }, { id: "parcial", title: "B · Tarjeta destacada", detail: "Contenido libre separado del acceso Premium" }] as const).map((option) => <button key={option.id} type="button" aria-pressed={design === option.id} onClick={() => setDesign(option.id)} className={`rounded-xl border px-4 py-3 text-left ${design === option.id ? "border-[#08786f] bg-[#eef9f6] text-[#08786f]" : "border-[#e2eaea] text-[#526e75] hover:bg-[#f7faf9]"} ${focus}`}><span className="block text-sm font-semibold">{option.title}</span><span className="mt-1 block text-xs font-normal">{option.detail}</span></button>)}</div>{!expired && <p className="mt-2 text-xs text-[#71858c]">El diseño del bloqueo se muestra cuando seleccionas «Prueba finalizada».</p>}</div>
      </section>

      <div className="mt-7 flex flex-wrap items-center gap-2 text-sm"><span className="inline-flex items-center gap-2 font-semibold text-[#71858c]"><ArrowLeft size={16} aria-hidden="true" /> Vista de ejemplo</span><span className="text-[#c2d0d1]">/</span><span className={content.tone}>{area === "nutricion" ? "Nutrición" : "Progreso"}</span></div>

      <div className={`mt-4 flex flex-wrap items-center gap-3 rounded-2xl border px-4 py-4 sm:px-5 ${expired ? "border-[#e9d8c5] bg-[#fff8ee]" : stage === "inicio" ? "border-[#cfe8df] bg-[#effaf5]" : "border-[#f0dfc7] bg-[#fff8ed]"}`}>
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${expired ? "bg-[#f9ead7] text-[#a5682b]" : stage === "inicio" ? "bg-[#dff3ea] text-[#08786f]" : "bg-[#f9ead7] text-[#a5682b]"}`}>{stage === "inicio" ? <Sparkles size={19} aria-hidden="true" /> : <Bell size={19} aria-hidden="true" />}</span>
        <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{stage === "inicio" ? "Disfruta de 14 días de acceso completo" : stage === "tres" ? "Tu prueba termina en 3 días" : stage === "uno" ? "Tu prueba termina mañana" : "Tu prueba de acceso completo ha terminado"}</p><p className="mt-1 text-xs leading-5 text-[#647b82]">{stage === "inicio" ? "Explora todas las funciones Premium durante tu prueba." : expired ? "Puedes seguir usando las funciones gratuitas o elegir un plan de pago." : "Después podrás seguir gratis o elegir un plan para conservar el acceso completo."}</p></div>
        <button type="button" onClick={openPlans} className={`min-h-10 rounded-full border border-[#d8c6ab] bg-white px-4 text-xs font-semibold text-[#795b3b] hover:bg-[#fffaf4] ${focus}`}>Ver planes</button>
      </div>

      <header className="relative mt-5 overflow-hidden rounded-[1.75rem] bg-[#173b44] p-6 text-white sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full border border-white/10 shadow-[0_0_0_3rem_rgba(255,255,255,0.025),0_0_0_6rem_rgba(255,255,255,0.02)]" />
        <div className="relative"><p className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] ${area === "nutricion" ? "text-[#f3b8a7]" : "text-[#b6caff]"}`}><Icon size={16} aria-hidden="true" /> {area === "nutricion" ? "Tu nutrición" : "Tu progreso"}</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">{content.title}</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#d0e3e1]">{content.intro}</p></div>
      </header>

      {showPlans && <section aria-label="Planes de ejemplo" className="mt-5 rounded-2xl border border-[#cfe6df] bg-[#f2faf7] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#08786f]">Planes de ejemplo</p><h3 className="mt-2 text-lg font-semibold">Elige cómo continuar</h3><p className="mt-1 max-w-xl text-sm leading-6 text-[#526e75]">Mensual, trimestral o anual. Esta muestra no inicia ningún pago ni modifica tu suscripción.</p></div><button type="button" onClick={() => setShowPlans(false)} className={secondary}>Cerrar</button></div></section>}
      {feedback && <p role="status" className="mt-4 rounded-xl border border-[#cde6e0] bg-[#effaf7] px-4 py-3 text-sm text-[#315d5a]">{feedback}</p>}

      <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
        <section aria-label={expired ? `Vista de ejemplo de ${content.premium}` : `Ejemplo de ${content.premium}`} className="min-w-0">
          {expired && design === "central" ? <div className="relative overflow-hidden rounded-[1.5rem] border border-[#e1e9eb] bg-white">
            <div aria-hidden="true" className="pointer-events-none select-none p-5 opacity-50 blur-[7px] sm:p-6"><ExampleContent area={area} /></div>
            <div className="absolute inset-0 grid place-items-center bg-[#173b44]/20 p-4"><div className="w-full max-w-sm rounded-[1.4rem] border border-[#d6e8e3] bg-white p-5 text-center shadow-[0_16px_50px_rgba(23,59,68,0.25)] sm:p-6"><span className="mx-auto grid size-12 place-items-center rounded-2xl bg-[#e7f6f3] text-[#08786f]"><LockKeyhole size={21} aria-hidden="true" /></span><p className="mt-3 text-[11px] font-bold uppercase tracking-[0.14em] text-[#08786f]">Función Premium</p><h3 className="mt-2 text-xl font-semibold tracking-tight">{content.premium}</h3><p className="mt-2 text-sm leading-6 text-[#647b82]">{content.description}</p><button type="button" onClick={openPlans} className={`mt-4 w-full ${primary}`}>Ver planes de pago <ArrowRight size={16} aria-hidden="true" /></button><p className="mt-3 text-xs leading-5 text-[#71858c]">Puedes continuar usando tu cuenta gratis.</p></div></div>
          </div> : expired ? <div className="overflow-hidden rounded-[1.5rem] border border-[#d9e7e5] bg-white">
            <div className="relative h-40 overflow-hidden border-b border-[#e5efed]"><div aria-hidden="true" className="pointer-events-none select-none p-5 opacity-50 blur-[7px]"><ExampleContent area={area} /></div><div className="absolute inset-0 bg-gradient-to-t from-white via-white/25 to-transparent" /><span className="absolute left-5 top-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#08786f] shadow-sm"><LockKeyhole size={13} aria-hidden="true" /> Premium</span></div>
            <div className="p-5 sm:p-6"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#08786f]">Da el siguiente paso</p><h3 className="mt-2 text-xl font-semibold">{content.premium}</h3><p className="mt-2 text-sm leading-6 text-[#647b82]">{content.description}</p><button type="button" onClick={openPlans} className={`mt-4 ${primary}`}>Ver planes de pago <ArrowRight size={16} aria-hidden="true" /></button></div>
          </div> : <div className="rounded-[1.5rem] border border-[#e1e9eb] bg-white p-5 sm:p-6"><div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#e7f6f3] px-3 py-1.5 text-xs font-semibold text-[#08786f]"><Check size={14} aria-hidden="true" /> Acceso completo durante la prueba</div><ExampleContent area={area} /><div className="mt-5 rounded-xl bg-[#f4f8f7] px-4 py-3 text-xs leading-5 text-[#526e75]">Contenido ilustrativo para comparar la vista antes y después de la prueba.</div></div>}
        </section>

        <aside className="space-y-4">
          <div className="rounded-[1.5rem] border border-[#e1e9eb] bg-white p-5 sm:p-6"><span className={`grid size-11 place-items-center rounded-2xl ${content.soft} ${content.tone}`}><Icon size={20} aria-hidden="true" /></span><p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-[#71858c]">Disponible gratis</p><h3 className="mt-2 text-lg font-semibold">{content.freeTitle}</h3><p className="mt-2 text-sm leading-6 text-[#647b82]">{content.freeText}</p><button type="button" onClick={() => setFeedback(`${content.freeAction}: acción de ejemplo, no se ha modificado ningún dato.`)} className={`mt-4 ${secondary}`}>{content.freeAction} <ArrowRight size={16} aria-hidden="true" /></button></div>
          <div className="rounded-[1.5rem] border border-[#d8e9e4] bg-[#f1f9f6] p-5"><div className="flex gap-3"><ShieldCheck size={19} className="mt-0.5 shrink-0 text-[#08786f]" aria-hidden="true" /><div><p className="text-sm font-semibold">Tus datos son tuyos</p><p className="mt-1 text-xs leading-5 text-[#647b82]">La zona borrosa utiliza datos ficticios. La propuesta mantiene accesibles tus registros y planes guardados.</p></div></div></div>
          <div className="rounded-[1.5rem] border border-[#e1e9eb] bg-white p-5"><div className="flex items-center gap-2 text-sm font-semibold"><CalendarDays size={17} className="text-[#08786f]" aria-hidden="true" /> Ejemplo de avisos</div><div className="mt-3 space-y-2 text-xs leading-5 text-[#647b82]"><p><Clock3 size={14} className="mr-1 inline text-[#91a5a9]" aria-hidden="true" /> Al empezar: 14 días de acceso completo.</p><p><Bell size={14} className="mr-1 inline text-[#91a5a9]" aria-hidden="true" /> Recordatorios de ejemplo: 3 días y 1 día antes.</p><p><Dumbbell size={14} className="mr-1 inline text-[#91a5a9]" aria-hidden="true" /> Al terminar: sigues teniendo acceso gratuito.</p></div></div>
        </aside>
      </div>
      <p className="my-7 text-center text-xs leading-5 text-[#71858c]">Propuesta visual para revisar: funciones, avisos y plazos todavía por decidir.</p>
    </div>
  </main>;
}

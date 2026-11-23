"use client";

import { ArrowLeft, ArrowRight, Check, ChevronRight, CreditCard, Download, Dumbbell, LockKeyhole, Mail, ShieldCheck, Sparkles, Target, Trash2, UserRound, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { SubscriptionExample, subscriptionStyles, type SubscriptionStyle } from "./subscription-examples";

type Section = "inicio" | "datos" | "plan" | "privacidad" | "suscripcion";
type PaidPlan = "monthly" | "quarterly" | "annual";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#375dac]";
const primary = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#173b44] px-5 text-sm font-semibold text-white hover:bg-[#24535a] ${focus}`;
const secondary = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#d6e5e2] bg-white px-5 text-sm font-semibold text-[#315d5a] hover:bg-[#f1f8f6] ${focus}`;
const field = `mt-2 min-h-11 w-full rounded-xl border border-[#dce6e8] bg-white px-3 text-sm text-[#173b44] ${focus}`;

const sections = [
  { id: "datos", title: "Datos personales", text: "Tu nombre y correo de acceso.", icon: UserRound, tone: "bg-[#e7f6f3] text-[#08786f]" },
  { id: "plan", title: "Mi plan", text: "Tu objetivo y preferencias actuales.", icon: Target, tone: "bg-[#edf2ff] text-[#375dac]" },
  { id: "privacidad", title: "Seguridad y privacidad", text: "Contraseña, permisos y datos.", icon: ShieldCheck, tone: "bg-[#f1eef9] text-[#7550a4]" },
  { id: "suscripcion", title: "Suscripción", text: "Consulta y gestiona tu plan.", icon: CreditCard, tone: "bg-[#fff3e8] text-[#aa6b2a]" },
] as const;

const plans: { id: PaidPlan; title: string; price: string; period: string; description: string }[] = [
  { id: "monthly", title: "Mensual", price: "39 €", period: "cada mes", description: "Para empezar a tu ritmo" },
  { id: "quarterly", title: "Cada 3 meses", price: "99 €", period: "cada 3 meses", description: "Una opción para continuar" },
  { id: "annual", title: "Anual", price: "299 €", period: "cada año", description: "Un año para avanzar" },
];

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-[1.5rem] border border-[#e1e9eb] bg-white p-5 shadow-[0_12px_35px_rgba(19,43,57,0.04)] sm:p-6 ${className}`}>{children}</div>;
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#08786f]">{eyebrow}</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#172f3b] sm:text-4xl">{title}</h1><p className="mt-2 text-sm leading-6 text-[#667d88]">{description}</p></div>;
}

export function ProfilePreview() {
  const [section, setSection] = useState<Section>("inicio");
  const [name, setName] = useState("Alex");
  const [draftName, setDraftName] = useState("Alex");
  const [analytics, setAnalytics] = useState(false);
  const [health, setHealth] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PaidPlan>("quarterly");
  const [premiumExample, setPremiumExample] = useState(false);
  const [autoRenew, setAutoRenew] = useState(true);
  const [subscriptionStyle, setSubscriptionStyle] = useState<SubscriptionStyle>("equilibrada");
  const [feedback, setFeedback] = useState("");

  function navigate(next: Section) {
    setSection(next);
    setFeedback("");
    setDeleteConfirm(false);
    window.scrollTo({ top: 0 });
  }

  function simulate(action: string) {
    setFeedback(`${action}: demostración. No se ha guardado ni enviado ningún dato.`);
  }

  function saveName() {
    if (!draftName.trim()) {
      setFeedback("Escribe un nombre para continuar con la demostración.");
      return;
    }
    setName(draftName.trim());
    simulate("Nombre actualizado solo en esta muestra");
  }

  return <main className="min-h-screen bg-[#f4f6f8] px-4 py-4 text-[#172f3b] sm:px-7 sm:py-7">
    <div className="mx-auto max-w-6xl">
      <div role="note" className="mb-4 rounded-2xl border border-[#d4e4e6] bg-white px-4 py-3 text-xs leading-5 text-[#526e75]"><strong className="text-[#173b44]">Muestra de perfil.</strong> Datos ficticios: las acciones son simuladas y no modifican tu cuenta.</div>
      <header className="flex items-center justify-between gap-3 border-b border-[#d6e5e2] pb-5">
        <div className="flex items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#163e49] text-[#a6eee0]"><Sparkles size={18} aria-hidden="true" /></span><span><span className="block text-sm font-semibold sm:text-base">Atempo Fit</span><span className="hidden text-[10px] font-semibold uppercase tracking-[0.16em] text-[#607d79] sm:block">Tu espacio personal</span></span></div>
        <div className="flex items-center gap-2 rounded-full border border-[#dfe5ec] bg-white py-1 pl-1.5 pr-3"><span className="grid size-8 place-items-center rounded-full bg-[#e7f6f3] text-[#08786f]"><UserRound size={16} aria-hidden="true" /></span><span className="hidden text-xs font-semibold text-[#315d5a] sm:block">Mi espacio<span className="block font-normal text-[#71858c]">{name}</span></span></div>
      </header>

      <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
        {section === "inicio" ? <button type="button" onClick={() => simulate("Volver al dashboard")} className={`inline-flex min-h-10 items-center gap-2 font-semibold text-[#526e75] hover:text-[#08786f] ${focus}`}><ArrowLeft size={16} aria-hidden="true" /> Volver al dashboard</button> : <><button type="button" onClick={() => navigate("inicio")} className={`inline-flex min-h-10 items-center gap-2 font-semibold text-[#526e75] hover:text-[#08786f] ${focus}`}><ArrowLeft size={16} aria-hidden="true" /> Volver a mi cuenta</button><span className="text-[#c2d0d1]" aria-hidden="true">/</span><span className="text-[#71858c]">{sections.find((item) => item.id === section)?.title}</span></>}
      </div>
      {feedback && <p role="status" className="mt-3 rounded-xl border border-[#cde6e0] bg-[#effaf7] px-4 py-3 text-sm leading-6 text-[#315d5a]">{feedback}</p>}

      {section === "inicio" && <div className="mt-6">
        <SectionHeading eyebrow="Tu espacio personal" title="Mi cuenta" description="Todo lo que necesitas para gestionar tu perfil, en un solo lugar." />
        <div className="mt-5 rounded-2xl border border-[#d4e4e6] bg-white p-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold text-[#173b44]">Compara las tarjetas de suscripción</p><p className="mt-1 text-xs leading-5 text-[#71858c]">Elige un diseño y prueba cómo se ve con cada plan de ejemplo.</p></div><div role="group" aria-label="Plan de ejemplo" className="flex gap-2"><button type="button" aria-pressed={!premiumExample} onClick={() => { setPremiumExample(false); setAutoRenew(true); }} className={`min-h-10 rounded-full border px-3 text-xs font-semibold ${!premiumExample ? "border-[#08786f] bg-[#e7f6f3] text-[#08786f]" : "border-[#dfe8e8] text-[#647b82]"} ${focus}`}>Free</button><button type="button" aria-pressed={premiumExample} onClick={() => { setPremiumExample(true); setAutoRenew(true); }} className={`min-h-10 rounded-full border px-3 text-xs font-semibold ${premiumExample ? "border-[#08786f] bg-[#e7f6f3] text-[#08786f]" : "border-[#dfe8e8] text-[#647b82]"} ${focus}`}>Premium</button></div></div>
          <div role="group" aria-label="Diseño de la tarjeta" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">{subscriptionStyles.map((option) => <button key={option.id} type="button" aria-pressed={subscriptionStyle === option.id} onClick={() => setSubscriptionStyle(option.id)} className={`min-h-14 rounded-xl border px-3 py-2 text-left ${subscriptionStyle === option.id ? "border-[#08786f] bg-[#eef9f6] text-[#08786f]" : "border-[#e2eaea] bg-[#fafcfc] text-[#526e75] hover:border-[#9fcac0]"} ${focus}`}><span className="block text-xs font-bold">{option.title}</span><span className="mt-0.5 block text-[11px] font-normal">{option.description}</span></button>)}</div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
          <section className="relative overflow-hidden rounded-[1.75rem] bg-[#173b44] p-6 text-white sm:p-7">
            <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full border border-[#a6eee0]/15 shadow-[0_0_0_3rem_rgba(166,238,224,0.035),0_0_0_6rem_rgba(166,238,224,0.025)]" />
            <div className="relative flex flex-wrap items-center gap-4"><span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#a6eee0] text-2xl font-bold text-[#174c48]">{name.charAt(0).toUpperCase()}</span><div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a6eee0]">Tu perfil</p><h2 className="mt-1 break-words text-2xl font-semibold tracking-tight sm:text-3xl">{name}</h2><p className="mt-1 text-sm text-[#c5dcd9]">Miembro desde enero de 2025</p></div></div>
            <div className="relative mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-[#b8d2cf]">Mi objetivo</p><p className="mt-1 text-sm font-semibold">Mejorar salud general</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-[#b8d2cf]">Experiencia</p><p className="mt-1 text-sm font-semibold">Principiante</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-[#b8d2cf]">Preferencia alimentaria</p><p className="mt-1 text-sm font-semibold">Sin preferencia</p></div></div>
          </section>
          <SubscriptionExample style={subscriptionStyle} premium={premiumExample} autoRenew={autoRenew} plans={plans} onOpen={() => navigate("suscripcion")} />
        </div>
        <div className="mt-8 flex items-end justify-between gap-3"><div><h2 className="text-xl font-semibold tracking-tight">Gestiona tu espacio</h2><p className="mt-1 text-sm text-[#71858c]">Elige qué quieres consultar o actualizar.</p></div></div>
        <nav aria-label="Apartados de mi cuenta" className="mt-4 grid gap-3 sm:grid-cols-2">{sections.map(({ id, title, text, icon: Icon, tone }) => <button key={id} type="button" onClick={() => navigate(id)} className={`group flex min-h-28 items-center gap-4 rounded-[1.4rem] border border-[#e1e9eb] bg-white p-5 text-left shadow-[0_10px_30px_rgba(19,43,57,0.035)] transition hover:border-[#b8d8d1] hover:shadow-md ${focus}`}><span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${tone}`}><Icon size={21} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block font-semibold text-[#173b44]">{title}</span><span className="mt-1 block text-sm leading-5 text-[#71858c]">{text}</span></span><ChevronRight size={19} className="shrink-0 text-[#9cafb1] group-hover:text-[#08786f]" aria-hidden="true" /></button>)}</nav>
      </div>}

      {section === "datos" && <div className="mx-auto mt-6 max-w-3xl">
        <SectionHeading eyebrow="Mi cuenta" title="Datos personales" description="Consulta y actualiza la información básica de tu cuenta." />
        <div className="mt-6 space-y-4"><Card><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e7f6f3] text-[#08786f]"><UserRound size={20} aria-hidden="true" /></span><div><h2 className="font-semibold">Tu nombre</h2><p className="mt-1 text-sm leading-6 text-[#71858c]">Así te llamaremos en tu espacio personal.</p></div></div><label className="mt-5 block text-sm font-semibold text-[#526e75]">Nombre<input className={field} value={draftName} onChange={(event) => setDraftName(event.target.value)} /></label><button type="button" onClick={saveName} className={`mt-4 ${primary}`}>Guardar nombre <ArrowRight size={16} aria-hidden="true" /></button></Card>
          <Card><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#edf2ff] text-[#375dac]"><Mail size={20} aria-hidden="true" /></span><div className="min-w-0"><h2 className="font-semibold">Correo de acceso</h2><p className="mt-1 text-sm leading-6 text-[#71858c]">Utilizas este correo para acceder a tu cuenta. No se puede modificar desde aquí.</p><p className="mt-4 break-all text-sm font-semibold text-[#315d5a]">alex@example.test</p></div></div></Card></div>
      </div>}

      {section === "plan" && <div className="mx-auto mt-6 max-w-3xl">
        <SectionHeading eyebrow="Mi cuenta" title="Mi plan" description="Un resumen de los datos que orientan tu entrenamiento y alimentación." />
        <div className="mt-6 space-y-4"><Card><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#edf2ff] text-[#375dac]"><Target size={20} aria-hidden="true" /></span><div><h2 className="font-semibold">Tu punto de partida</h2><p className="mt-1 text-sm leading-6 text-[#71858c]">Tu plan se adapta a tus circunstancias.</p></div></div><dl className="mt-5 grid gap-3 sm:grid-cols-2">{[["Objetivo", "Mejorar salud general"], ["Experiencia", "Principiante"], ["Peso actual", "72,0 kg"], ["Peso objetivo", "No definido"], ["Preferencia alimentaria", "Sin preferencia"]].map(([label, value]) => <div key={label} className="rounded-2xl bg-[#f7f9fa] p-4"><dt className="text-xs text-[#71858c]">{label}</dt><dd className="mt-1 text-sm font-semibold">{value}</dd></div>)}</dl></Card>
          <Card className="border-[#d3ebe6] bg-[#f3faf8]"><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e1f3ed] text-[#08786f]"><Dumbbell size={20} aria-hidden="true" /></span><div><h2 className="font-semibold">¿Ha cambiado algo?</h2><p className="mt-1 text-sm leading-6 text-[#647b82]">Revisa tu objetivo, disponibilidad o restricciones. Podrás decidir qué parte de tu plan actualizar.</p><button type="button" onClick={() => simulate("Revisar mi plan")} className={`mt-4 ${primary}`}>Revisar mi plan <ArrowRight size={16} aria-hidden="true" /></button><p className="mt-3 text-xs leading-5 text-[#71858c]">Tu plan no cambia automáticamente al abrir la revisión.</p></div></div></Card></div>
      </div>}

      {section === "privacidad" && <div className="mx-auto mt-6 max-w-3xl">
        <SectionHeading eyebrow="Mi cuenta" title="Seguridad y privacidad" description="Tú decides cómo gestionar el acceso y tus datos." />
        <div className="mt-6 space-y-4"><Card><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#edf2ff] text-[#375dac]"><LockKeyhole size={20} aria-hidden="true" /></span><div><h2 className="font-semibold">Contraseña</h2><p className="mt-1 text-sm leading-6 text-[#71858c]">Mantén protegido el acceso a tu cuenta.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold text-[#526e75]">Nueva contraseña<input type="password" autoComplete="new-password" className={field} placeholder="Al menos 8 caracteres" /></label><label className="text-sm font-semibold text-[#526e75]">Confirmar contraseña<input type="password" autoComplete="new-password" className={field} placeholder="Repite la contraseña" /></label></div><button type="button" onClick={() => simulate("Cambiar contraseña")} className={`mt-4 ${secondary}`}>Actualizar contraseña</button></Card>
          <Card><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f1eef9] text-[#7550a4]"><ShieldCheck size={20} aria-hidden="true" /></span><div><h2 className="font-semibold">Tus permisos</h2><p className="mt-1 text-sm leading-6 text-[#71858c]">Puedes cambiar tus preferencias cuando quieras.</p></div></div><div className="mt-4 divide-y divide-[#eaf0f1]">{[{ title: "Analítica no esencial", text: "Ayuda a mejorar el producto con métricas agregadas.", checked: analytics, set: setAnalytics }, { title: "Datos de salud", text: "Permite adaptar recomendaciones a lesiones y restricciones. Si lo retiras, la personalización puede verse limitada.", checked: health, set: setHealth }].map((item) => <label key={item.title} className="flex min-h-20 items-center justify-between gap-4 py-4"><span><span className="block text-sm font-semibold">{item.title}</span><span className="mt-1 block text-xs leading-5 text-[#71858c]">{item.text}</span></span><input type="checkbox" checked={item.checked} onChange={(event) => item.set(event.target.checked)} className="size-5 shrink-0 accent-[#08786f]" /></label>)}</div><p className="text-xs text-[#71858c]">En esta muestra los cambios solo se reflejan en pantalla.</p></Card>
          <Card><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e7f6f3] text-[#08786f]"><Download size={20} aria-hidden="true" /></span><div><h2 className="font-semibold">Descargar mis datos</h2><p className="mt-1 text-sm leading-6 text-[#71858c]">Solicita una copia de tu información en formato JSON.</p><button type="button" onClick={() => simulate("Descargar mis datos")} className={`mt-4 ${secondary}`}><Download size={16} aria-hidden="true" /> Descargar datos</button></div></div></Card>
          <Card className="border-[#f0d9d4]"><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#fdf0ed] text-[#b6503c]"><Trash2 size={20} aria-hidden="true" /></span><div className="min-w-0"><h2 className="font-semibold">Eliminar cuenta</h2><p className="mt-1 text-sm leading-6 text-[#71858c]">Esta acción elimina la cuenta y sus datos asociados y no se puede deshacer.</p>{!deleteConfirm ? <button type="button" onClick={() => setDeleteConfirm(true)} className={`mt-4 inline-flex min-h-11 items-center rounded-full border border-[#e6c6bf] px-4 text-sm font-semibold text-[#a64e3c] hover:bg-[#fff5f2] ${focus}`}>Eliminar mi cuenta</button> : <div className="mt-4 rounded-2xl border border-[#efd2c9] bg-[#fff7f4] p-4"><p className="text-sm font-semibold text-[#8f4434]">¿Confirmas que quieres eliminar tu cuenta?</p><p className="mt-1 text-xs leading-5 text-[#91685e]">Esta es solo una demostración: no se eliminará ningún dato.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => { setDeleteConfirm(false); simulate("Eliminar cuenta"); }} className={`min-h-11 rounded-full bg-[#a64e3c] px-4 text-sm font-semibold text-white ${focus}`}>Confirmar eliminación</button><button type="button" onClick={() => setDeleteConfirm(false)} className={secondary}><X size={15} aria-hidden="true" /> Cancelar</button></div></div>}</div></div></Card></div>
      </div>}

      {section === "suscripcion" && <div className="mt-6">
        <div className="flex flex-wrap items-end justify-between gap-4"><SectionHeading eyebrow="Mi cuenta" title="Tu suscripción" description="Consulta tu plan actual y elige la opción que mejor encaja contigo." /><button type="button" onClick={() => { setPremiumExample(!premiumExample); setAutoRenew(true); setFeedback(""); }} className={secondary}>{premiumExample ? "Probar ejemplo Free" : "Probar ejemplo Premium"}</button></div>
        <p className="mt-3 text-xs leading-5 text-[#71858c]">El botón anterior cambia solo el estado ficticio de la muestra.</p>
        <div className="mt-6 grid gap-4 lg:grid-cols-[0.85fr_1.5fr]">
          <section className="relative overflow-hidden rounded-[1.75rem] bg-[#173b44] p-6 text-white sm:p-7">
            <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-60 rounded-full border border-[#a6eee0]/15 shadow-[0_0_0_3rem_rgba(166,238,224,0.035)]" />
            <div className="relative"><p className="text-xs font-bold uppercase tracking-[0.15em] text-[#a6eee0]">Tu plan actual</p><div className="mt-3 flex flex-wrap items-center gap-2"><h2 className="text-3xl font-semibold tracking-tight">{premiumExample ? "Mensual" : "Free"}</h2><span className="rounded-full border border-[#a6eee0]/30 bg-[#a6eee0]/10 px-3 py-1 text-xs font-semibold text-[#bff4e8]">{premiumExample ? "Activo" : "Incluido"}</span></div><p className="mt-3 text-sm leading-6 text-[#c7ddda]">{premiumExample ? "Tu suscripción de ejemplo está activa." : "Tu punto de partida en Atempo Fit."}</p>
              {premiumExample ? <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm"><p className="text-xs text-[#bdd4d1]">{autoRenew ? "Próxima renovación" : "Acceso hasta"}</p><p className="mt-1 font-semibold">15 de diciembre de 2026</p><p className="mt-2 text-xs text-[#bdd4d1]">{autoRenew ? "Renovación automática activa" : "Renovación automática desactivada"}</p><button type="button" onClick={() => { setAutoRenew(!autoRenew); simulate(autoRenew ? "Cancelar renovación" : "Reactivar renovación"); }} className={`mt-4 min-h-11 rounded-full border border-white/30 px-4 text-xs font-semibold text-white hover:bg-white/10 ${focus}`}>{autoRenew ? "Cancelar renovación" : "Reactivar renovación"}</button></div> : <div className="mt-5 space-y-3">{["Entrenamiento", "Nutrición", "Seguimiento de tu progreso"].map((item) => <p key={item} className="flex items-center gap-2 text-sm text-[#d9eae7]"><Check size={16} className="text-[#a6eee0]" aria-hidden="true" /> {item}</p>)}</div>}
              <p className="mt-5 text-xs leading-5 text-[#bdd4d1]">{premiumExample ? "Ejemplo: los cambios de plan se gestionan al finalizar el periodo activo." : "Los importes y condiciones mostrados son una muestra de la tarjeta actual."}</p>
            </div>
          </section>
          <section className="rounded-[1.75rem] border border-[#e1e9eb] bg-white p-5 shadow-[0_12px_35px_rgba(19,43,57,0.04)] sm:p-6">
            <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e7f6f3] text-[#08786f]"><Sparkles size={20} aria-hidden="true" /></span><div><h2 className="text-xl font-semibold tracking-tight">Elige tu ritmo</h2><p className="mt-1 text-sm leading-6 text-[#71858c]">Compara las opciones de suscripción antes de continuar.</p></div></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">{plans.map((plan) => {
              const selected = selectedPlan === plan.id;
              return <button key={plan.id} type="button" aria-pressed={selected && !premiumExample} disabled={premiumExample} onClick={() => setSelectedPlan(plan.id)} className={`relative flex min-h-40 flex-col rounded-2xl border p-4 text-left transition ${(selected && !premiumExample) || (premiumExample && plan.id === "monthly") ? "border-[#08786f] bg-[#f0faf7] ring-1 ring-[#08786f]" : "border-[#e1e9eb] bg-[#fafcfc] hover:border-[#a9cfc5]"} disabled:cursor-not-allowed ${premiumExample && plan.id !== "monthly" ? "opacity-65" : ""} ${focus}`}><span className="text-sm font-bold text-[#173b44]">{plan.title}</span><span className="mt-4 text-2xl font-bold tracking-tight text-[#173b44]">{plan.price}</span><span className="mt-1 text-xs text-[#647b82]">{plan.period}</span><span className="mt-3 text-xs leading-5 text-[#71858c]">{plan.description}</span>{((selected && !premiumExample) || (premiumExample && plan.id === "monthly")) && <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#08786f]"><Check size={14} aria-hidden="true" /> {premiumExample ? "Plan actual" : "Seleccionado"}</span>}</button>;
            })}</div>
            {premiumExample ? <p className="mt-4 text-sm leading-6 text-[#71858c]">Podrás cambiar de opción cuando termine el periodo activo de esta suscripción de ejemplo.</p> : <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f4f8f7] p-4"><div><p className="text-xs text-[#71858c]">Opción seleccionada · no contratada</p><p className="mt-1 text-sm font-semibold">{plans.find((plan) => plan.id === selectedPlan)?.title} · {plans.find((plan) => plan.id === selectedPlan)?.price} / {plans.find((plan) => plan.id === selectedPlan)?.period}</p></div><button type="button" onClick={() => simulate("Continuar con la suscripción seleccionada")} className={primary}>Continuar <ArrowRight size={16} aria-hidden="true" /></button></div>}
            <p className="mt-4 text-xs leading-5 text-[#71858c]">La selección y el pago son simulados. No se realizará ningún cargo.</p>
          </section>
        </div>
      </div>}
    </div>
  </main>;
}

"use client";

import { ArrowRight, Check, LoaderCircle, Sparkles } from "lucide-react";
import { useState } from "react";

import { hasPaidAccess, paidPlans, subscriptionLabel, subscriptionStatusLabel, type SubscriptionPlan, type SubscriptionStatus } from "@/features/subscription/plans";

export type SubscriptionDetails = { plan: SubscriptionPlan; status: SubscriptionStatus; startedAt: string | null; renewsAt: string | null; autoRenew: boolean; email: string };
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#375dac]";
const button = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#173b44] px-5 text-sm font-semibold text-white hover:bg-[#24535a] disabled:opacity-60 ${focus}`;

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

export function SubscriptionSummary({ details, onOpen, now }: { details: SubscriptionDetails; onOpen: () => void; now: number }) {
  const paidAccess = hasPaidAccess(details.plan, details.status, details.renewsAt, now);
  const date = formatDate(details.renewsAt);
  return <section aria-labelledby="membership-title" className="order-first relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#233a62] via-[#273e66] to-[#295e60] p-5 text-white shadow-[0_18px_40px_rgba(28,53,79,0.2)] sm:p-6 lg:order-last">
    <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 size-56 rounded-full border border-white/15 shadow-[0_0_0_2.5rem_rgba(255,255,255,0.035),0_0_0_5rem_rgba(255,255,255,0.025)]" />
    <div className="relative"><div className="flex flex-wrap items-center justify-between gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#d9f7ef]"><Sparkles size={14} aria-hidden="true" /> Tu suscripción</span><span className="rounded-full bg-[#b9f1dc] px-3 py-1.5 text-xs font-bold text-[#174c48]">{subscriptionStatusLabel(details.plan, details.status, details.autoRenew, paidAccess)}</span></div>
      <h2 id="membership-title" className="mt-4 text-3xl font-semibold tracking-[-0.05em]">Plan {subscriptionLabel(details.plan)}</h2>
      <p className="mt-2 text-sm leading-6 text-[#d5e4e6]">{paidAccess ? date ? `${details.autoRenew ? "Próxima renovación" : "Acceso hasta"}: ${date}.` : "Consulta la información de tu suscripción." : details.plan === "free" ? "Un espacio para avanzar a tu ritmo." : "Consulta el estado de tu suscripción."}</p>
      {!paidAccess && <div className="mt-5 grid grid-cols-3 gap-2">{paidPlans.map((plan) => <div key={plan.value} className="min-w-0 rounded-xl border border-white/15 bg-white/10 p-2.5"><p className="text-[11px] leading-4 text-[#d5e4e6]">{plan.label}</p><p className="mt-1 text-lg font-bold">{plan.price} €</p><p className="text-[10px] leading-4 text-[#d5e4e6]">{plan.period}</p></div>)}</div>}
      <button type="button" onClick={onOpen} className={`mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#b9f1dc] px-5 text-sm font-bold text-[#174c48] hover:bg-[#d2f8e9] ${focus}`}>{paidAccess ? "Gestionar suscripción" : "Ver planes de pago"} <ArrowRight size={16} aria-hidden="true" /></button>
    </div>
  </section>;
}

export function PremiumPlanCard({ details, onChange, now }: { details: SubscriptionDetails; onChange: (details: SubscriptionDetails) => void; now: number }) {
  const [selected, setSelected] = useState<SubscriptionPlan>("free");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isManaging, setIsManaging] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"cancel" | "reactivate" | null>(null);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const paidAccess = hasPaidAccess(details.plan, details.status, details.renewsAt, now);
  const date = formatDate(details.renewsAt);

  async function startCheckout() {
    if (selected === "free" || paidAccess) return;
    setIsSubmitting(true);
    setMessage(null);
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: selected }) });
      const payload = await response.json() as { url?: string; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error ?? "No se pudo iniciar el pago.");
      window.location.href = payload.url;
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "No se pudo iniciar el pago.", error: true });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function manageSubscription(action: "cancel" | "reactivate") {
    setIsManaging(true);
    setMessage(null);
    try {
      const response = await fetch("/api/stripe/manage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
      const payload = await response.json() as { error?: string; renewsAt?: string | null; autoRenew?: boolean };
      if (!response.ok) throw new Error(payload.error ?? "No se pudo actualizar la suscripción.");
      if (typeof payload.autoRenew !== "boolean") throw new Error("No hemos podido confirmar el estado de la renovación. Revisa tu suscripción antes de volver a intentarlo.");
      onChange({ ...details, autoRenew: payload.autoRenew, renewsAt: payload.renewsAt ?? details.renewsAt });
      setConfirmAction(null);
      setMessage({ text: action === "cancel" ? "Renovación cancelada. Mantendrás el acceso hasta el final del periodo." : "Renovación reactivada correctamente.", error: false });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "No se pudo actualizar la suscripción.", error: true });
    } finally {
      setIsManaging(false);
    }
  }

  return <div className="mt-6 grid gap-4 lg:grid-cols-[0.85fr_1.5fr]">
    <section className="rounded-[1.75rem] bg-[#173b44] p-6 text-white sm:p-7">
      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#a6eee0]">Tu plan actual</p><div className="mt-3 flex flex-wrap items-center gap-2"><h2 className="text-3xl font-semibold tracking-tight">{subscriptionLabel(details.plan)}</h2><span className="rounded-full border border-[#a6eee0]/30 bg-[#a6eee0]/10 px-3 py-1 text-xs font-semibold text-[#bff4e8]">{subscriptionStatusLabel(details.plan, details.status, details.autoRenew, paidAccess)}</span></div>
      {paidAccess ? <div className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm">
        {details.startedAt && <p className="mb-3 text-xs text-[#bdd4d1]">Activado: {formatDate(details.startedAt) ?? "Fecha no disponible"}</p>}
        <p className="text-xs text-[#bdd4d1]">{details.autoRenew ? "Próxima renovación" : "Acceso hasta"}</p><p className="mt-1 font-semibold">{date ?? "Fecha no disponible"}</p><p className="mt-2 text-xs text-[#bdd4d1]">{details.autoRenew ? "Renovación automática activa" : "Renovación automática desactivada"}</p>
        {details.email && (!confirmAction ? <button type="button" disabled={isManaging} onClick={() => setConfirmAction(details.autoRenew ? "cancel" : "reactivate")} className={`mt-4 min-h-11 rounded-full border border-white/30 px-4 text-xs font-semibold text-white hover:bg-white/10 ${focus}`}>{details.autoRenew ? "Cancelar renovación" : "Reactivar renovación"}</button> : <div className="mt-4 rounded-xl border border-white/20 p-3"><p className="text-sm font-semibold">{confirmAction === "cancel" ? "¿Cancelar la renovación?" : "¿Reactivar la renovación?"}</p><p className="mt-1 text-xs leading-5 text-[#c7ddda]">{confirmAction === "cancel" ? `Mantendrás el acceso hasta ${date ?? "el final del periodo actual"}. No se renovará al finalizar.` : `Tu suscripción volverá a renovarse automáticamente ${date ? `el ${date}` : "al finalizar el periodo actual"}.`}</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={isManaging} onClick={() => manageSubscription(confirmAction)} className={`min-h-11 rounded-full bg-white px-4 text-xs font-semibold text-[#173b44] disabled:opacity-60 ${focus}`}>{isManaging ? "Actualizando..." : confirmAction === "cancel" ? "Confirmar cancelación" : "Confirmar reactivación"}</button><button type="button" disabled={isManaging} onClick={() => setConfirmAction(null)} className={`min-h-11 rounded-full border border-white/30 px-4 text-xs font-semibold ${focus}`}>Volver</button></div></div>)}
      </div> : <p className="mt-4 text-sm leading-6 text-[#c7ddda]">{details.plan === "free" ? "Tu punto de partida en Atempo Fit." : "Consulta las opciones disponibles para tu cuenta."}</p>}
      {paidAccess && <p className="mt-4 text-xs leading-5 text-[#bdd4d1]">Podrás cambiar de plan o pasar a Free al finalizar el periodo activo.</p>}
      {message && <p role={message.error ? "alert" : "status"} className={`mt-4 text-sm ${message.error ? "text-[#ffd8d8]" : "text-[#bff4e8]"}`}>{message.text}</p>}
    </section>
    <section className="rounded-[1.75rem] border border-[#e1e9eb] bg-white p-5 shadow-[0_12px_35px_rgba(19,43,57,0.04)] sm:p-6">
      <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e7f6f3] text-[#08786f]"><Sparkles size={20} aria-hidden="true" /></span><div><h2 className="text-xl font-semibold tracking-tight">Elige tu ritmo</h2><p className="mt-1 text-sm leading-6 text-[#71858c]">Consulta las opciones de suscripción antes de continuar.</p></div></div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[{ value: "free" as const, label: "Free", price: 0, period: "sin coste" }, ...paidPlans].map((plan) => {
        const chosen = paidAccess ? plan.value === details.plan : plan.value === selected;
        return <button key={plan.value} type="button" aria-pressed={chosen} disabled={paidAccess || isSubmitting} onClick={() => setSelected(plan.value)} className={`flex min-h-36 flex-col rounded-2xl border p-4 text-left ${chosen ? "border-[#08786f] bg-[#f0faf7] ring-1 ring-[#08786f]" : "border-[#e1e9eb] bg-[#fafcfc] hover:border-[#a9cfc5]"} disabled:cursor-not-allowed ${focus}`}><span className="text-sm font-bold">{plan.label}</span><span className="mt-4 text-2xl font-bold">{plan.price} €</span><span className="mt-1 text-xs text-[#647b82]">{plan.period}</span>{chosen && <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#08786f]"><Check size={14} aria-hidden="true" /> {paidAccess || plan.value === details.plan ? "Plan actual" : "Seleccionado"}</span>}</button>;
      })}</div>
      {!paidAccess && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f4f8f7] p-4"><div><p className="text-xs text-[#71858c]">Opción seleccionada{selected !== "free" ? " · no contratada" : ""}</p><p className="mt-1 text-sm font-semibold">{subscriptionLabel(selected)}</p></div><button type="button" disabled={selected === "free" || isSubmitting} onClick={startCheckout} className={button}>{isSubmitting ? <><LoaderCircle size={16} className="animate-spin" /> Redirigiendo...</> : selected === "free" ? "Plan Free" : <>Pagar ahora <ArrowRight size={16} aria-hidden="true" /></>}</button></div>}
      <div className="mt-5 border-t border-[#edf1f2] pt-4"><h3 className="text-sm font-semibold">Tu experiencia Atempo Fit</h3><div className="mt-3 space-y-2">{["Rutinas automáticas adaptadas a tu objetivo", "Nutrición personalizada con seguimiento semanal", "Progreso, medidas y evolución en un solo lugar"].map((feature) => <p key={feature} className="flex items-start gap-2 text-sm leading-5 text-[#647b82]"><Check size={16} className="mt-0.5 shrink-0 text-[#08786f]" aria-hidden="true" />{feature}</p>)}</div></div>
      <p className="mt-4 text-xs leading-5 text-[#71858c]">El pago se gestiona con Stripe en modo sandbox. La suscripción se sincroniza mediante el webhook.</p>
    </section>
  </div>;
}

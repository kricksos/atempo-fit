"use client";

import { ArrowRight, Check, CreditCard, Sparkles } from "lucide-react";

export type SubscriptionStyle = "equilibrada" | "esencial" | "detallada" | "destacada";

export const subscriptionStyles: { id: SubscriptionStyle; title: string; description: string }[] = [
  { id: "equilibrada", title: "Equilibrada", description: "La propuesta anterior" },
  { id: "esencial", title: "Esencial", description: "Clara y compacta" },
  { id: "detallada", title: "Detallada", description: "Más información" },
  { id: "destacada", title: "Destacada", description: "Más llamativa" },
];

type Props = {
  style: SubscriptionStyle;
  premium: boolean;
  autoRenew: boolean;
  plans: { id: string; title: string; price: string; period: string }[];
  onOpen: () => void;
};

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#375dac]";
const darkButton = `inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#173b44] px-5 text-sm font-semibold text-white hover:bg-[#24535a] ${focus}`;
const renewal = (autoRenew: boolean) => autoRenew ? "Renovación de ejemplo: 15 de diciembre de 2026." : "Renovación desactivada. Acceso de ejemplo hasta el 15 de diciembre de 2026.";

export function SubscriptionExample({ style, premium, autoRenew, plans, onOpen }: Props) {
  const action = premium ? "Gestionar suscripción" : "Comparar planes";
  const title = premium ? "Plan Mensual" : "Plan Free";

  if (style === "esencial") return <section aria-labelledby="membership-title" className="order-first self-start rounded-[1.75rem] border border-[#dce9e7] bg-white p-5 shadow-[0_12px_35px_rgba(19,43,57,0.05)] sm:p-6 lg:order-last">
    <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e7f6f3] text-[#08786f]"><CreditCard size={20} aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#08786f]">Tu suscripción</p><h2 id="membership-title" className="mt-1 text-xl font-semibold">{title}</h2></div><span className="rounded-full bg-[#edf7f3] px-2.5 py-1 text-xs font-semibold text-[#34785f]">{premium ? "Activo" : "Incluido"}</span></div>
    <p className="mt-4 text-sm leading-6 text-[#647b82]">{premium ? renewal(autoRenew) : "Tu plan actual, con acceso a tu espacio personal."}</p>
    <button type="button" onClick={onOpen} className={`mt-4 ${darkButton}`}>{action} <ArrowRight size={16} aria-hidden="true" /></button>
  </section>;

  if (style === "detallada") return <section aria-labelledby="membership-title" className="order-first rounded-[1.75rem] border border-[#cfe6df] bg-white p-5 shadow-[0_12px_35px_rgba(19,43,57,0.05)] sm:p-6 lg:order-last">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#08786f]">Tu suscripción</p><h2 id="membership-title" className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2><p className="mt-1 text-xs text-[#71858c]">{premium ? "Suscripción de ejemplo" : "Tu acceso actual a Atempo Fit"}</p></div><span className="inline-flex items-center gap-1 rounded-full bg-[#e7f6f3] px-3 py-1.5 text-xs font-semibold text-[#08786f]"><Check size={14} aria-hidden="true" /> {premium ? "Activo" : "Incluido"}</span></div>
    {premium ? <div className="mt-4 rounded-2xl bg-[#f3f8f6] p-3"><p className="text-xs text-[#71858c]">{autoRenew ? "Próxima renovación" : "Acceso hasta"}</p><p className="mt-1 text-sm font-semibold">15 de diciembre de 2026</p><p className="mt-1 text-xs text-[#647b82]">{autoRenew ? "Renovación automática activa" : "Renovación automática desactivada"}</p></div> : <><p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#71858c]">Tu espacio reúne</p><div className="mt-2 flex flex-wrap gap-2">{["Entrenamiento", "Nutrición", "Progreso"].map((item) => <span key={item} className="rounded-full bg-[#f1f7f5] px-3 py-1.5 text-xs font-semibold text-[#52736d]">{item}</span>)}</div><p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#71858c]">Opciones de suscripción</p><div className="mt-2 divide-y divide-[#ecf1f0] rounded-xl border border-[#e5eeeb]">{plans.map((plan) => <div key={plan.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"><span className="text-sm font-semibold">{plan.title}</span><span className="text-xs text-[#647b82]"><strong className="text-[#173b44]">{plan.price}</strong> · {plan.period}</span></div>)}</div></>}
    <button type="button" onClick={onOpen} className={`mt-4 ${darkButton}`}>{action} <ArrowRight size={16} aria-hidden="true" /></button>
    {!premium && <p className="mt-2 text-[11px] text-[#71858c]">Precios de ejemplo basados en la tarjeta actual.</p>}
  </section>;

  if (style === "destacada") return <section aria-labelledby="membership-title" className="order-first relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#233a62] via-[#273e66] to-[#295e60] p-5 text-white shadow-[0_18px_40px_rgba(28,53,79,0.2)] sm:p-6 lg:order-last">
    <div aria-hidden="true" className="pointer-events-none absolute -right-12 -top-20 size-56 rounded-full border border-white/15 shadow-[0_0_0_2.5rem_rgba(255,255,255,0.035),0_0_0_5rem_rgba(255,255,255,0.025)]" />
    <div className="relative"><div className="flex flex-wrap items-center justify-between gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#d9f7ef]"><Sparkles size={14} aria-hidden="true" /> Tu suscripción</span><span className="rounded-full bg-[#b9f1dc] px-3 py-1.5 text-xs font-bold text-[#174c48]">{premium ? "Activo" : "Incluido"}</span></div>
      <h2 id="membership-title" className="mt-4 text-3xl font-semibold tracking-[-0.05em]">{title}</h2><p className="mt-2 text-sm leading-6 text-[#d5e4e6]">{premium ? renewal(autoRenew) : "Un espacio para avanzar a tu ritmo."}</p>
      {!premium && <div className="mt-5 grid grid-cols-3 gap-2">{plans.map((plan) => <div key={plan.id} className="min-w-0 rounded-xl border border-white/15 bg-white/10 p-2.5"><p className="text-[11px] leading-4 text-[#d5e4e6]">{plan.title}</p><p className="mt-1 text-lg font-bold">{plan.price}</p><p className="text-[10px] leading-4 text-[#d5e4e6]">{plan.period}</p></div>)}</div>}
      <button type="button" onClick={onOpen} className={`mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#b9f1dc] px-5 text-sm font-bold text-[#174c48] hover:bg-[#d2f8e9] ${focus}`}>{action} <ArrowRight size={16} aria-hidden="true" /></button>
      {!premium && <p className="mt-2 text-[11px] text-[#c8dfdc]">Precios de ejemplo basados en la tarjeta actual.</p>}
    </div>
  </section>;

  return <section aria-labelledby="membership-title" className="order-first rounded-[1.75rem] border border-[#cfe6df] bg-gradient-to-br from-[#eef9f5] via-white to-[#f7f5ff] p-5 shadow-[0_12px_35px_rgba(19,43,57,0.05)] sm:p-6 lg:order-last">
    <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#dcefe9] text-[#08786f]"><Sparkles size={20} aria-hidden="true" /></span><div><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#08786f]">Tu suscripción</p><h2 id="membership-title" className="mt-1 text-xl font-semibold tracking-tight">{title}</h2></div></div><span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-[#34785f] ring-1 ring-[#d6ebe3]"><Check size={14} aria-hidden="true" /> {premium ? "Activo" : "Incluido"}</span></div>
    <p className="mt-4 text-sm leading-6 text-[#647b82]">{premium ? renewal(autoRenew) : "Tu espacio está listo. Descubre las opciones de suscripción disponibles."}</p>
    {!premium && <div className="mt-4 grid grid-cols-3 gap-2">{plans.map((plan) => <div key={plan.id} className="min-w-0 rounded-xl border border-[#dceae7] bg-white/80 px-2 py-2.5 sm:px-3"><p className="text-[11px] font-semibold leading-4 text-[#526e75]">{plan.title}</p><p className="mt-1 text-base font-bold text-[#173b44]">{plan.price}</p><p className="text-[10px] leading-4 text-[#71858c]">{plan.period}</p></div>)}</div>}
    <button type="button" onClick={onOpen} className={`mt-4 ${darkButton}`}>{action} <ArrowRight size={16} aria-hidden="true" /></button>
    {!premium && <p className="mt-2 text-[11px] text-[#71858c]">Precios de ejemplo basados en la tarjeta actual.</p>}
  </section>;
}

"use client";

import { ChevronRight, CreditCard, Dumbbell, ShieldCheck, Sparkles, Target, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AccountDataExport } from "@/components/account-data-export";
import { AccountNameForm, AccountPasswordForm } from "@/components/account-form";
import { AccountPrivacyForm } from "@/components/account-privacy-form";
import { AppHeader } from "@/components/app-header";
import { NavigationButton, NavigationLink } from "@/components/navigation-control";
import { PremiumPlanCard, SubscriptionSummary, type SubscriptionDetails } from "@/components/premium-plan-card";

type Section = "inicio" | "datos" | "plan" | "privacidad" | "suscripcion";
type AccountProfile = { name: string; email: string; hasProfile: boolean; goal: string; experience: string; diet: string; currentWeight: string; targetWeight: string; createdAt: string | null };
type Props = { profile: AccountProfile; subscription: SubscriptionDetails; analytics: boolean; healthData: boolean; admin: boolean; checkout: string | undefined; initialNow: number };
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#375dac]";
const sections = [
  { id: "datos", title: "Datos personales", text: "Tu nombre y correo de acceso.", icon: UserRound, tone: "bg-[#e7f6f3] text-[#08786f]" },
  { id: "plan", title: "Mi plan", text: "Tu objetivo y preferencias actuales.", icon: Target, tone: "bg-[#edf2ff] text-[#375dac]" },
  { id: "privacidad", title: "Seguridad y privacidad", text: "Contraseña, permisos y datos.", icon: ShieldCheck, tone: "bg-[#f1eef9] text-[#7550a4]" },
  { id: "suscripcion", title: "Suscripción", text: "Consulta y gestiona tu plan.", icon: CreditCard, tone: "bg-[#fff3e8] text-[#aa6b2a]" },
] as const;

function Heading({ title, description }: { title: string; description: string }) {
  return <div><p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#08786f]">Mi cuenta</p><h1 className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-[#172f3b] sm:text-4xl">{title}</h1><p className="mt-2 text-sm leading-6 text-[#667d88]">{description}</p></div>;
}

export function AccountWorkspace({ profile, subscription, analytics, healthData, admin, checkout, initialNow }: Props) {
  const router = useRouter();
  const [section, setSection] = useState<Section>(checkout === "success" || checkout === "cancelled" ? "suscripcion" : "inicio");
  const [name, setName] = useState(profile.name);
  const [details, setDetails] = useState(subscription);
  const [now, setNow] = useState(initialNow);

  useEffect(() => {
    function updateNow() { setNow(Date.now()); }
    const timer = window.setInterval(updateNow, 60000);
    window.addEventListener("focus", updateNow);
    return () => { window.clearInterval(timer); window.removeEventListener("focus", updateNow); };
  }, []);

  function navigate(next: Section) {
    setSection(next);
    window.scrollTo({ top: 0 });
  }

  return <main className="min-h-screen bg-[#f4f6f8] px-4 py-4 text-[#172f3b] sm:px-7 sm:py-7"><div className="mx-auto max-w-6xl">
    <AppHeader email={profile.email} name={name || "Mi cuenta"} />
    <div className="mt-5 flex flex-wrap items-center gap-2"><NavigationLink href="/dashboard" kind="dashboard">Volver al dashboard</NavigationLink>{section !== "inicio" && <NavigationButton onClick={() => navigate("inicio")}>Volver a mi cuenta</NavigationButton>}</div>
    {admin && <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.5rem] bg-[#173b44] p-5 text-white"><div><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a6eee0]">Acceso de administrador</p><h2 className="mt-1 text-lg font-semibold">Panel operativo de Atempo Fit</h2><p className="mt-1 text-sm text-[#c5dcd9]">Gestiona usuarios, suscripciones y perfiles.</p></div><Link href="/admin" className={`inline-flex min-h-11 items-center rounded-full bg-[#a6eee0] px-4 text-sm font-semibold text-[#173b44] ${focus}`}>Abrir panel admin</Link></section>}
    <div hidden={section !== "inicio"} className="mt-6">
      <Heading title="Mi cuenta" description="Todo lo que necesitas para gestionar tu perfil, en un solo lugar." />
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.15fr_1fr]">
        <section className="relative overflow-hidden rounded-[1.75rem] bg-[#173b44] p-6 text-white sm:p-7"><div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-32 size-72 rounded-full border border-[#a6eee0]/15 shadow-[0_0_0_3rem_rgba(166,238,224,0.035),0_0_0_6rem_rgba(166,238,224,0.025)]" /><div className="relative flex items-center gap-4"><span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-[#a6eee0] text-2xl font-bold text-[#174c48]">{name ? name.charAt(0).toUpperCase() : "M"}</span><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a6eee0]">Tu perfil</p><h2 className="mt-1 break-words text-2xl font-semibold tracking-tight sm:text-3xl">{name || "Mi cuenta"}</h2>{profile.createdAt && <p className="mt-1 text-sm text-[#c5dcd9]">Miembro desde {profile.createdAt}</p>}</div></div><div className="relative mt-6 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">{[["Mi objetivo", profile.goal], ["Experiencia", profile.experience], ["Preferencia alimentaria", profile.diet]].map(([label, value]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-3"><p className="text-xs text-[#b8d2cf]">{label}</p><p className="mt-1 break-words text-sm font-semibold">{value}</p></div>)}</div></section>
        <SubscriptionSummary details={details} now={now} onOpen={() => navigate("suscripcion")} />
      </div>
      <div className="mt-8"><h2 className="text-xl font-semibold tracking-tight">Gestiona tu espacio</h2><p className="mt-1 text-sm text-[#71858c]">Elige qué quieres consultar o actualizar.</p></div>
      <nav aria-label="Apartados de mi cuenta" className="mt-4 grid gap-3 sm:grid-cols-2">{sections.map(({ id, title, text, icon: Icon, tone }) => <button key={id} type="button" onClick={() => navigate(id)} className={`group flex min-h-28 items-center gap-4 rounded-[1.4rem] border border-[#e1e9eb] bg-white p-5 text-left shadow-[0_10px_30px_rgba(19,43,57,0.035)] transition hover:border-[#b8d8d1] hover:shadow-md ${focus}`}><span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${tone}`}><Icon size={21} aria-hidden="true" /></span><span className="min-w-0 flex-1"><span className="block font-semibold text-[#173b44]">{title}</span><span className="mt-1 block text-sm leading-5 text-[#71858c]">{text}</span></span><ChevronRight size={19} className="shrink-0 text-[#9cafb1]" aria-hidden="true" /></button>)}</nav>
    </div>
    <div hidden={section !== "datos"} className="mx-auto mt-6 max-w-3xl"><Heading title="Datos personales" description="Consulta y actualiza la información básica de tu cuenta." /><div className="mt-6"><AccountNameForm initialName={profile.name} initialEmail={profile.email} hasProfile={profile.hasProfile} onSaved={(savedName) => { setName(savedName); router.refresh(); }} /></div></div>
    <div hidden={section !== "plan"} className="mx-auto mt-6 max-w-3xl"><Heading title="Mi plan" description="Un resumen de los datos que orientan tu entrenamiento y alimentación." /><div className="mt-6 space-y-4"><section className="rounded-[1.5rem] border border-[#e1e9eb] bg-white p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#edf2ff] text-[#375dac]"><Target size={20} aria-hidden="true" /></span><div><h2 className="font-semibold">Tu punto de partida</h2><p className="mt-1 text-sm leading-6 text-[#71858c]">Tu plan se adapta a tus circunstancias.</p></div></div><dl className="mt-5 grid gap-3 sm:grid-cols-2">{[["Objetivo", profile.goal], ["Experiencia", profile.experience], ["Peso actual", profile.currentWeight], ["Peso objetivo", profile.targetWeight], ["Preferencia alimentaria", profile.diet]].map(([label, value]) => <div key={label} className="rounded-2xl bg-[#f7f9fa] p-4"><dt className="text-xs text-[#71858c]">{label}</dt><dd className="mt-1 break-words text-sm font-semibold">{value}</dd></div>)}</dl></section><section className="rounded-[1.5rem] border border-[#d3ebe6] bg-[#f3faf8] p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e1f3ed] text-[#08786f]"><Dumbbell size={20} aria-hidden="true" /></span><div><h2 className="font-semibold">¿Ha cambiado algo?</h2><p className="mt-1 text-sm leading-6 text-[#647b82]">Revisa tu objetivo, disponibilidad o restricciones. Podrás decidir qué parte de tu plan actualizar.</p><Link href="/checkin" className={`mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#173b44] px-5 text-sm font-semibold text-white ${focus}`}>Revisar mi plan <Sparkles size={16} aria-hidden="true" /></Link><p className="mt-3 text-xs leading-5 text-[#71858c]">Tu plan no cambia automáticamente al abrir la revisión.</p></div></div></section></div></div>
    <div hidden={section !== "privacidad"} className="mx-auto mt-6 max-w-3xl"><Heading title="Seguridad y privacidad" description="Tú decides cómo gestionar el acceso y tus datos." /><div className="mt-6 space-y-4"><AccountPasswordForm /><AccountPrivacyForm initialAnalytics={analytics} initialHealthData={healthData} /><AccountDataExport /></div></div>
    <div hidden={section !== "suscripcion"} className="mt-6"><Heading title="Tu suscripción" description="Consulta tu plan actual y elige la opción que mejor encaja contigo." />{checkout === "success" && <p role="status" className="mt-4 rounded-xl bg-[#effaf7] p-4 text-sm text-[#315d5a]">Has vuelto del pago. La activación depende de la confirmación de Stripe; revisa el estado de tu plan.</p>}{checkout === "cancelled" && <p role="status" className="mt-4 rounded-xl bg-[#f7f9f9] p-4 text-sm text-[#647b82]">Has vuelto sin completar el pago.</p>}<PremiumPlanCard details={details} onChange={setDetails} now={now} /></div>
  </div></main>;
}

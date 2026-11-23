"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity, Apple, ArrowRight, ArrowUpRight, Check, ChevronDown, Clock3, Dumbbell,
  Flame, LineChart, Smartphone, Sparkles, UserRound, X,
} from "lucide-react";

import { PulsoMotif } from "@/components/next-step-panel";

const designs = [
  { id: "pulso", name: "Pulso", description: "Editorial y equilibrada" },
  { id: "orbita", name: "Órbita", description: "Oscura y tecnológica" },
  { id: "ritmo", name: "Ritmo", description: "Clara y dinámica" },
] as const;
type Design = (typeof designs)[number]["id"];

const features = [
  { title: "Entrenamiento", text: "Una rutina adaptada a tu experiencia, tiempo y material.", icon: Dumbbell, tone: "bg-[#e7f6f3] text-[#08786f]" },
  { title: "Nutrición", text: "Una guía flexible para acompañarte en tu día a día.", icon: Apple, tone: "bg-[#fff0ec] text-[#b6503c]" },
  { title: "Progreso", text: "Tus registros y evolución, en un mismo lugar.", icon: LineChart, tone: "bg-[#edf2ff] text-[#375dac]" },
] as const;

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08786f]";

function Logo({ light = false }: { light?: boolean }) {
  return <div className={`flex items-center gap-3 ${light ? "text-white" : "text-[#172f3b]"}`}><span className="grid size-10 place-items-center rounded-xl bg-[#163e49] text-[#a6eee0]"><Sparkles size={18} aria-hidden="true" /></span><span className="text-lg font-bold tracking-tight">Atempo <span className={light ? "font-medium text-[#bed4d5]" : "font-medium text-[#708b95]"}>Fit</span></span></div>;
}

function StoreNotice({ dark = false }: { dark?: boolean }) {
  return <div className={`inline-flex items-center gap-3 rounded-2xl border px-4 py-3 ${dark ? "border-[#cbbdff] bg-[#eae5ff] text-[#2e205e] shadow-[0_8px_28px_rgba(114,91,224,0.22)]" : "border-[#dde6ea] bg-white text-[#1b3946]"}`} aria-label="App para Android: futura disponibilidad prevista en Google Play, todavía no disponible">
    <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${dark ? "bg-[#6441cd] text-white" : "bg-[#e7f6f3] text-[#08786f]"}`}><Smartphone size={20} aria-hidden="true" /></span>
    <span><span className={`block text-[10px] font-semibold uppercase tracking-[0.12em] ${dark ? "text-[#5f5190]" : "text-[#71858e]"}`}>App para Android</span><span className="mt-0.5 block text-sm font-semibold">Google Play · Próximamente</span></span>
  </div>;
}

function Action({ onClick, light = false, children = "Empezar mi plan" }: { onClick: () => void; light?: boolean; children?: string }) {
  return <button type="button" onClick={onClick} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition-transform hover:-translate-y-0.5 ${focus} ${light ? "bg-[#a6eee0] text-[#103c3d]" : "bg-[#163e49] text-white"}`}>{children}<ArrowUpRight size={17} aria-hidden="true" /></button>;
}

function Device({ phone = false }: { phone?: boolean }) {
  return <div className={`relative mx-auto w-full ${phone ? "max-w-[285px] rounded-[2.4rem] border-[7px] border-[#203f4b] p-2" : "max-w-[520px] rounded-[1.8rem] border-[9px] border-[#203f4b] p-2"} bg-[#203f4b] shadow-[0_35px_80px_rgba(16,45,56,0.22)]`}>
    <div className={`overflow-hidden bg-[#f4f6f8] p-4 text-[#172f3b] sm:p-5 ${phone ? "rounded-[1.8rem]" : "rounded-[1.15rem]"}`}>
      {phone && <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-[#b7c8ce]" />}
      <div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#738994]">Tu espacio</p><p className="mt-1 text-lg font-semibold">Tu ritmo. Tu progreso.</p></div><span className="grid size-8 place-items-center rounded-full bg-[#e6eef1] text-xs font-bold text-[#375b68]">A</span></div>
      <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#112b3a] to-[#18565a] p-4 text-white">
        <PulsoMotif />
        <div className="relative"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#a6eee0]">Tu próximo entrenamiento</p><p className="mt-4 text-lg font-semibold">Cuerpo completo</p><p className="mt-1 text-xs text-[#c5e0dc]">Variante A · Día 2 de 3</p><div className="mt-4 flex gap-2 text-[10px] text-[#d9eae8]"><span className="rounded-full border border-white/20 px-2 py-1">6 ejercicios</span><span className="rounded-full border border-white/20 px-2 py-1">45 min</span></div></div>
      </div>
      <div className={`mt-3 grid gap-2 ${phone ? "grid-cols-1" : "grid-cols-2"}`}>
        <div className="rounded-xl border border-[#e1e7eb] bg-white p-3"><p className="flex items-center gap-2 text-[10px] font-semibold text-[#667d88]"><Flame size={14} className="text-[#7550a4]" aria-hidden="true" /> Constancia</p><p className="mt-3 text-xl font-semibold">2 <span className="text-sm text-[#98a9af]">/ 3 días</span></p><div className="mt-3 h-1.5 rounded-full bg-[#edf0f3]"><div className="h-full w-2/3 rounded-full bg-[#7550a4]" /></div></div>
        <div className="rounded-xl border border-[#e1e7eb] bg-white p-3"><p className="flex items-center gap-2 text-[10px] font-semibold text-[#667d88]"><Apple size={14} className="text-[#b6503c]" aria-hidden="true" /> Nutrición</p><p className="mt-3 text-xl font-semibold">2 <span className="text-sm text-[#98a9af]">/ 3 comidas</span></p><div className="mt-3 h-1.5 rounded-full bg-[#f4eeec]"><div className="h-full w-2/3 rounded-full bg-[#b6503c]" /></div></div>
      </div>
      <p className="mt-4 text-[9px] text-[#84969e]">Datos de ejemplo · Tu plan, a tu ritmo.</p>
    </div>
  </div>;
}

function FeatureCards() {
  return <div className="grid gap-4 md:grid-cols-3">{features.map((feature) => <article key={feature.title} className="rounded-[1.5rem] border border-[#e1e7eb] bg-white p-6 shadow-[0_12px_36px_rgba(19,43,57,0.05)]"><span className={`grid size-11 place-items-center rounded-xl ${feature.tone}`}><feature.icon size={20} aria-hidden="true" /></span><h3 className="mt-5 text-lg font-semibold text-[#172f3b]">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-[#667d88]">{feature.text}</p></article>)}</div>;
}

function BenefitSection() {
  return <section id="propuesta-detalles" className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"><div className="mb-9 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#08786f]">Una forma más clara de avanzar</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#172f3b] sm:text-4xl">Todo tu plan, conectado.</h2><p className="mt-4 text-base leading-7 text-[#667d88]">Entrenamiento, nutrición y seguimiento pensados para acompañarte en tu semana real.</p></div><FeatureCards /></section>;
}

function AppSection({ dark = false }: { dark?: boolean }) {
  if (dark) return <section id="futura-app" className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24">
    <div className="relative overflow-hidden rounded-[2rem] bg-[#112f3c] p-7 text-white sm:p-10 lg:p-14">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full border border-[#a6eee0]/10 shadow-[0_0_0_50px_rgba(166,238,224,0.03),0_0_0_100px_rgba(166,238,224,0.025)]" />
      <div className="relative grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <div>
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#a6eee0]"><Smartphone size={16} aria-hidden="true" /> La futura app de Atempo Fit</p>
          <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">Tu plan, siempre contigo.</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-[#c5d8da]">Imaginamos Atempo Fit también como una app para Android: un espacio para llevar tu entrenamiento, nutrición y progreso en el bolsillo.</p>
          <div className="mt-7"><StoreNotice dark /></div>
          <p className="mt-3 text-sm leading-6 text-[#c5d8da]">La app todavía no está disponible. Mientras tanto, puedes usar Atempo Fit desde la web.</p>
        </div>
        <div className="grid gap-3">
          {features.map((feature) => <div key={feature.title} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5"><span className={`grid size-11 shrink-0 place-items-center rounded-xl ${feature.tone}`}><feature.icon size={20} aria-hidden="true" /></span><h3 className="font-semibold">{feature.title}</h3></div>)}
        </div>
      </div>
    </div>
  </section>;
  return <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24"><div className="flex flex-wrap items-center justify-between gap-6 rounded-[1.75rem] border border-[#e1e7eb] bg-white p-7 text-[#172f3b] sm:p-10"><div className="max-w-xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#08786f]">Atempo Fit en tu bolsillo</p><h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Tu plan, también en el móvil.</h2><p className="mt-3 text-sm leading-6 text-[#667d88]">Estamos pensando en una futura app para Android. Por ahora puedes utilizar Atempo Fit desde la web.</p></div><StoreNotice /></div></section>;
}

function PulsoLanding({ onAction }: { onAction: () => void }) {
  return <div className="bg-[#f4f6f8]">
    <section className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-14 pt-14 sm:px-8 lg:grid-cols-[1fr_1fr] lg:pb-24 lg:pt-24">
      <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#08786f]"><span className="h-px w-8 bg-[#08786f]" /> Progreso con intención</p><h1 className="mt-6 text-5xl font-semibold leading-[0.98] tracking-[-0.065em] text-[#172f3b] sm:text-7xl">Tu plan.<br />Tu ritmo.<br /><span className="text-[#08786f]">Tu progreso.</span></h1><p className="mt-7 max-w-lg text-lg leading-8 text-[#627a85]">Entrenamiento, nutrición y seguimiento adaptados a tu vida, en un espacio que avanza contigo.</p><div className="mt-8 flex flex-wrap items-center gap-5"><Action onClick={onAction} /><span className="flex items-center gap-2 text-sm text-[#667d88]"><Clock3 size={16} aria-hidden="true" /> A tu ritmo, desde el primer paso</span></div><div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[#617782]"><span className="flex items-center gap-1"><Check size={15} className="text-[#08786f]" /> Adaptado a ti</span><span className="flex items-center gap-1"><Check size={15} className="text-[#08786f]" /> A tu medida</span><span className="flex items-center gap-1"><Check size={15} className="text-[#08786f]" /> Todo en un lugar</span></div></div>
      <div className="relative"><div className="absolute inset-10 rounded-full bg-[#b8e4de]/50 blur-3xl" aria-hidden="true" /><Device /></div>
    </section>
    <BenefitSection /><AppSection />
  </div>;
}

function OrbitaLanding({ onAction, signedIn }: { onAction: () => void; signedIn: boolean }) {
  return <div className="bg-[#f4f6f8]">
    <section className="relative overflow-hidden bg-[#102c3b] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-0 size-[38rem] rounded-full border border-[#a6eee0]/10 shadow-[0_0_0_65px_rgba(166,238,224,0.03),0_0_0_130px_rgba(166,238,224,0.025)]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.85fr] lg:py-20">
        <div><p className="inline-flex items-center gap-2 rounded-full border border-[#a6eee0]/25 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#a6eee0]"><Activity size={15} aria-hidden="true" /> Un espacio para avanzar</p><h1 className="mt-7 max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-0.065em] sm:text-7xl">Tu progreso<br /><span className="text-[#a6eee0]">toma forma.</span></h1><p className="mt-6 max-w-lg text-lg leading-8 text-[#c6d9db]">Entrenamiento, nutrición y seguimiento en un solo lugar. Hoy en la web, con la mirada puesta en tu futura app.</p><div className="mt-8 flex flex-wrap gap-4"><Action onClick={onAction} light>{signedIn ? "Ir a mi espacio" : "Empezar en la web"}</Action><a href="#futura-app" className={`inline-flex min-h-12 items-center gap-2 px-2 text-sm font-semibold text-white ${focus}`}>Conoce la futura app <ArrowRight size={16} aria-hidden="true" /></a></div><div className="mt-9 max-w-md rounded-2xl border border-[#a6eee0]/20 bg-white/5 p-4 sm:p-5"><p className="text-sm font-semibold text-white">Tu plan en el bolsillo</p><p className="mt-1 text-sm leading-6 text-[#c5d8da]">Queremos llevar Atempo Fit a Android.</p><div className="mt-4"><StoreNotice dark /></div><p className="mt-3 text-xs leading-5 text-[#bed0d2]">La app aún no está disponible. Mientras tanto, usa la web.</p></div></div>
        <div className="relative"><Device phone /></div>
      </div>
    </section>
    <AppSection dark /><BenefitSection />
  </div>;
}

function PreviewAccount({ onAction }: { onAction: () => void }) {
  const [panel, setPanel] = useState<"progress" | "account" | null>(null);

  return <div className="relative ml-auto flex items-center gap-2">
    <button type="button" aria-expanded={panel === "progress"} aria-label="Nivel 7 de ejemplo. Ver logros" onClick={() => setPanel(panel === "progress" ? null : "progress")} className={`flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-2.5 py-2 text-left text-white sm:px-3 ${focus}`}><span className="grid size-8 place-items-center rounded-full bg-[#e9e4fa] text-xs font-bold text-[#5b3e92]">7</span><span className="hidden sm:block"><span className="block text-xs font-semibold">Nivel 7</span><span className="block text-xs text-[#c5d8da]">11 logros</span></span><ChevronDown size={14} aria-hidden="true" /></button>
    <button type="button" aria-expanded={panel === "account"} aria-label="Abrir cuenta de ejemplo" onClick={() => setPanel(panel === "account" ? null : "account")} className={`flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-2.5 py-2 text-left text-white sm:px-3 ${focus}`}><span className="grid size-8 place-items-center rounded-full bg-[#d7f0eb] text-[#08786f]"><UserRound size={15} aria-hidden="true" /></span><span className="hidden sm:block"><span className="block text-xs font-semibold">Online</span><span className="block text-xs text-[#c5d8da]">Alex</span></span></button>
    {panel && <section aria-label={panel === "progress" ? "Progreso de ejemplo" : "Cuenta de ejemplo"} className="absolute right-0 top-full z-30 mt-3 w-[min(340px,calc(100vw-2.5rem))] rounded-2xl border border-[#dce5e9] bg-white p-5 text-[#172f3b] shadow-[0_20px_50px_rgba(16,45,56,0.2)]">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#71858e]">Datos de ejemplo</p><h2 className="mt-1 text-xl font-semibold">{panel === "progress" ? "Tu progreso · Nivel 7" : "Hola, Alex"}</h2></div><button type="button" aria-label="Cerrar panel de ejemplo" onClick={() => setPanel(null)} className={`rounded-lg p-1 text-[#667d88] ${focus}`}><X size={18} aria-hidden="true" /></button></div>
      {panel === "progress" ? <><p className="mt-3 text-sm text-[#667d88]">11 logros conseguidos · 4 días de racha</p><div className="mt-4 h-2 rounded-full bg-[#eeeaf6]"><div className="h-full w-2/3 rounded-full bg-[#7550a4]" /></div><p className="mt-4 rounded-xl bg-[#f4f1fa] p-3 text-sm text-[#5b3e92]">Tu constancia suma, paso a paso.</p><button type="button" onClick={() => { setPanel(null); onAction(); }} className={`mt-4 w-full rounded-full bg-[#163e49] px-4 py-2.5 text-sm font-semibold text-white ${focus}`}>Ver todos los logros</button></> : <><p className="mt-3 rounded-xl bg-[#f4f6f8] p-3 text-sm text-[#667d88]">Ahora mismo no tienes avisos pendientes.</p><div className="mt-4 grid gap-1"><button type="button" onClick={() => { setPanel(null); onAction(); }} className={`rounded-xl px-3 py-2 text-left text-sm font-semibold hover:bg-[#f4f6f8] ${focus}`}>Mi cuenta</button><button type="button" onClick={() => { setPanel(null); onAction(); }} className={`rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#667d88] hover:bg-[#f4f6f8] ${focus}`}>Cerrar sesión</button></div></>}
    </section>}
  </div>;
}

function RitmoLanding({ onAction }: { onAction: () => void }) {
  return <div className="bg-[#f4f6f8]">
    <section className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8 lg:pt-20">
      <div className="grid items-end gap-7 lg:grid-cols-[1fr_auto]"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#08786f]">Tu espacio personal</p><h1 className="mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-0.065em] text-[#172f3b] sm:text-7xl">Una vida en movimiento.<br /><span className="text-[#08786f]">Un plan a tu medida.</span></h1><p className="mt-6 max-w-2xl text-lg leading-8 text-[#667d88]">Organiza tu entrenamiento, tu alimentación y tu evolución en un solo lugar.</p></div><div className="flex flex-wrap items-center gap-3"><Action onClick={onAction} /><a href="#propuesta-detalles" className={`inline-flex min-h-12 items-center gap-2 px-3 text-sm font-semibold text-[#375763] ${focus}`}>Conocer más <ArrowRight size={16} aria-hidden="true" /></a></div></div>
      <div className="mt-12 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[1.7rem] bg-gradient-to-br from-[#112b3a] to-[#18565a] p-7 text-white sm:p-9"><PulsoMotif /><div className="relative"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a6eee0]">Tu siguiente paso</p><h2 className="mt-7 text-2xl font-semibold">Cuerpo completo · Variante A</h2><p className="mt-3 text-sm text-[#c9e0dd]">Una propuesta orientativa para tu próxima sesión.</p><div className="mt-6 flex gap-2 text-xs text-[#d9eae8]"><span className="rounded-full border border-white/20 px-3 py-2">6 ejercicios</span><span className="rounded-full border border-white/20 px-3 py-2">45 min aprox.</span></div><p className="mt-9 text-xs text-[#b6d5d1]">Datos de ejemplo</p></div></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">{features.slice(0, 2).map((feature) => <div key={feature.title} className="flex items-center gap-4 rounded-[1.5rem] border border-[#e1e7eb] bg-white p-6"><span className={`grid size-12 shrink-0 place-items-center rounded-xl ${feature.tone}`}><feature.icon size={21} aria-hidden="true" /></span><div><h2 className="font-semibold text-[#172f3b]">{feature.title}</h2><p className="mt-1 text-sm leading-6 text-[#667d88]">{feature.text}</p></div></div>)}</div>
      </div>
    </section>
    <BenefitSection /><AppSection />
  </div>;
}

export function LandingPreview() {
  const [design, setDesign] = useState<Design>("pulso");
  const [message, setMessage] = useState("");
  const [signedIn, setSignedIn] = useState(false);

  function chooseDesign(next: Design) {
    setDesign(next);
    setMessage("");
  }

  return <main className="min-h-screen bg-[#f4f6f8] text-[#172f3b]">
    <div className="border-b border-[#dde5e9] bg-white px-5 py-4 sm:px-8">
      <div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs leading-5 text-[#526a77]"><strong className="text-[#193b4a]">Propuestas de portada.</strong> Muestra de desarrollo con datos ficticios; no modifica la web ni guarda datos.</p><Link href="/" className={`inline-flex min-h-9 items-center text-xs font-semibold text-[#08786f] underline underline-offset-4 ${focus}`}>Ver portada actual</Link></div>
        <div role="group" aria-label="Diseños de portada" className="mt-3 flex flex-wrap gap-2">{designs.map((item) => <button key={item.id} type="button" aria-pressed={design === item.id} onClick={() => chooseDesign(item.id)} className={`min-h-10 rounded-xl border px-4 py-2 text-left text-xs ${focus} ${design === item.id ? "border-[#163e49] bg-[#edf4f5] text-[#163e49]" : "border-[#e1e7eb] bg-white text-[#5b707b] hover:bg-[#f7f9fa]"}`}><span className="font-bold">{item.name}</span><span className="ml-2 hidden sm:inline">{item.description}</span></button>)}</div>
        {design === "orbita" && <div role="group" aria-label="Estado de sesión simulado" className="mt-3 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-semibold text-[#526a77]">Ver como:</span>{[{ label: "Visitante", value: false }, { label: "Usuario conectado", value: true }].map((option) => <button key={option.label} type="button" aria-pressed={signedIn === option.value} onClick={() => { setSignedIn(option.value); setMessage(""); }} className={`min-h-9 rounded-full border px-3 py-1.5 text-xs font-semibold ${focus} ${signedIn === option.value ? "border-[#08786f] bg-[#e7f6f3] text-[#08786f]" : "border-[#e1e7eb] bg-white text-[#5b707b]"}`}>{option.label}</button>)}<span className="text-xs text-[#71858e]">Simulación con datos de ejemplo</span></div>}
      </div>
    </div>
    <header className={`relative z-10 px-5 py-5 sm:px-8 ${design === "orbita" ? "bg-[#102c3b]" : "bg-[#f4f6f8]"}`}><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><Logo light={design === "orbita"} /><nav aria-label="Navegación de muestra" className={`hidden gap-7 text-sm font-medium md:flex ${design === "orbita" ? "text-[#c5d8da]" : "text-[#667d88]"}`}><a href="#propuesta-detalles" className={focus}>Cómo funciona</a><a href="#propuesta-detalles" className={focus}>Tu plan</a></nav>{design === "orbita" && signedIn ? <PreviewAccount onAction={() => setMessage("Es una muestra: no se abre ninguna cuenta ni se modifican datos.")} /> : <button type="button" onClick={() => setMessage("Es una muestra: no se abre ninguna cuenta ni se modifican datos.")} className={`min-h-10 rounded-full border px-4 text-xs font-semibold ${focus} ${design === "orbita" ? "border-white/25 text-white" : "border-[#dce5e9] bg-white text-[#294654]"}`}>Mi espacio <ArrowUpRight size={14} className="ml-1 inline" aria-hidden="true" /></button>}</div></header>
    {message && <div role="status" className="mx-auto max-w-7xl px-5 py-3 text-sm text-[#526a77] sm:px-8">{message}</div>}
    {design === "pulso" ? <PulsoLanding onAction={() => setMessage("Es una muestra: no se inicia ningún plan ni se guardan datos.")} /> : design === "orbita" ? <OrbitaLanding signedIn={signedIn} onAction={() => setMessage("Es una muestra: no se abre el espacio ni se guardan datos.")} /> : <RitmoLanding onAction={() => setMessage("Es una muestra: no se inicia ningún plan ni se guardan datos.")} />}
    <footer className="border-t border-[#e1e7eb] bg-white px-5 py-7 text-sm text-[#667d88] sm:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3"><Logo /><p>Tu plan. Tu ritmo. Tu progreso.</p><span className="text-xs">Propuesta visual · Datos de ejemplo</span></div></footer>
  </main>;
}

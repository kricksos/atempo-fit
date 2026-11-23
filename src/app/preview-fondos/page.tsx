import { ArrowRight, Clock3, Dumbbell, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";

import { pulsoBackground, PulsoMotif } from "@/components/next-step-panel";

type StyleOption = {
  id: "anillos" | "pulso" | "pulso-brasa" | "brasa" | "prisma" | "grafito";
  number: string;
  name: string;
  description: string;
  background: string;
  accent: string;
  largePosition: MotifPosition;
  compactPosition: MotifPosition;
};

type MotifPosition = "top" | "side" | "bottom";

const options: StyleOption[] = [
  { id: "anillos", number: "01", name: "Anillos", description: "La opción verde que te gustó, como punto de comparación.", background: "linear-gradient(120deg, #10271e 0%, #193c30 65%, #245044 100%)", accent: "#d1f58a", largePosition: "top", compactPosition: "side" },
  { id: "pulso", number: "02", name: "Pulso", description: "Azul noche y turquesa, con trazos diagonales y luz suave.", background: pulsoBackground, accent: "#a6eee0", largePosition: "side", compactPosition: "bottom" },
  { id: "pulso-brasa", number: "03", name: "Pulso + Brasa", description: "El azul y turquesa de Pulso con las formas escalonadas de Brasa.", background: pulsoBackground, accent: "#a6eee0", largePosition: "bottom", compactPosition: "side" },
  { id: "brasa", number: "04", name: "Brasa", description: "Tonos cálidos y formas escalonadas con un toque de cobre.", background: "linear-gradient(120deg, #2c201e 0%, #47302c 65%, #633d32 100%)", accent: "#f5d0a6", largePosition: "bottom", compactPosition: "side" },
  { id: "prisma", number: "05", name: "Prisma", description: "Violeta profundo con planos geométricos translúcidos.", background: "linear-gradient(120deg, #1d2035 0%, #302941 60%, #49345d 100%)", accent: "#e0ccfa", largePosition: "top", compactPosition: "side" },
  { id: "grafito", number: "06", name: "Grafito", description: "Gris azulado con una retícula discreta de inspiración técnica.", background: "linear-gradient(120deg, #1c292b 0%, #293a3d 65%, #3a5153 100%)", accent: "#c5e8dc", largePosition: "side", compactPosition: "top" },
];

const positionClasses: Record<MotifPosition, string> = {
  top: "-right-[75px] -top-[112px]",
  side: "-right-[155px] top-1/2 -translate-y-1/2",
  bottom: "-right-[75px] -bottom-[125px]",
};

const positionLabels: Record<MotifPosition, string> = {
  top: "esquina superior",
  side: "lateral derecho",
  bottom: "esquina inferior",
};

function Motif({ id, position }: { id: StyleOption["id"]; position: MotifPosition }) {
  if (id === "pulso") return <PulsoMotif />;

  const shape = id === "anillos"
    ? <><circle cx="160" cy="160" r="96" /><circle cx="160" cy="160" r="128" /><circle cx="160" cy="160" r="160" /></>
    : id === "brasa" || id === "pulso-brasa"
        ? <><path d="M25 295 130 190 185 190 290 85 340 85" /><path d="M25 265 115 175 170 175 275 70 340 70" /><path d="M25 235 100 160 155 160 260 55 340 55" /><path d="M25 205 85 145 140 145 245 40 340 40" /><path d="M130 190 185 190 290 85 340 85 340 125 205 260 155 260 85 330Z" fill={id === "pulso-brasa" ? "#a6eee0" : "#f3c59a"} stroke="none" opacity=".3" /></>
        : id === "prisma"
          ? <><path d="M70 45 280 10 330 210 180 300Z" fill="#d9c3ff" opacity=".3" /><path d="M70 45 200 120 180 300M200 120 330 210M200 120 280 10" /><path d="M40 80 165 145 145 325M165 145 300 240" /></>
          : <><path d="M80 80h240M80 120h240M80 160h240M80 200h240M80 240h240M120 40v240M160 40v240M200 40v240M240 40v240M280 40v240" opacity=".5" /><path d="M120 80h25M120 80v25M260 200h25M285 175v25" strokeWidth="2" /><circle cx="160" cy="120" r="3" fill="#d4e8bd" /><circle cx="240" cy="160" r="3" fill="#d4e8bd" /><circle cx="200" cy="240" r="3" fill="#d4e8bd" /></>;

  return <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 h-full w-[44%] max-w-[220px] overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 30%)", WebkitMaskImage: "linear-gradient(to right, transparent, black 30%)" }}>
    <svg focusable="false" viewBox="0 0 320 320" className={`absolute h-[320px] w-[320px] max-w-none opacity-[0.17] ${id !== "anillos" && position === "side" ? "-right-[75px] top-1/2 -translate-y-1/2" : positionClasses[position]}`} fill="none" stroke={id === "pulso-brasa" ? "#a6eee0" : id === "brasa" ? "#f5d0a6" : id === "prisma" ? "#e0ccfa" : "#d4e8bd"} strokeWidth="1">{shape}</svg>
  </div>;
}

function SampleCard({ option, compact }: { option: StyleOption; compact: boolean }) {
  return <div className={`relative overflow-hidden rounded-[1.5rem] text-white shadow-[0_16px_38px_rgba(19,46,30,0.15)] ${compact ? "p-5" : "p-6 sm:p-7"}`} style={{ background: option.background }}>
    <Motif id={option.id} position={compact ? option.compactPosition : option.largePosition} />
    <div className="relative">
      {compact ? <>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#dcf3c6]"><Dumbbell size={15} aria-hidden="true" /> Tu próximo entrenamiento</p><p className="mt-2 text-xl font-semibold">Cuerpo completo <span style={{ color: option.accent }}>· A</span></p><p className="mt-1 text-sm text-[#e2f0db]">Pectoral · Dorsal · Cuádriceps</p><p className="mt-2 text-xs text-[#e2f0db]">Día 2 de 4 · 6 ejercicios · 35 min aprox.</p></div>
          <span className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-bold text-[#1a3221]" style={{ backgroundColor: option.accent }}>Comenzar sesión <ArrowRight size={15} aria-hidden="true" /></span>
        </div>
      </> : <>
        <div className="flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#dcf3c6]"><span className="grid size-8 place-items-center rounded-xl bg-white/10"><Dumbbell size={15} aria-hidden="true" /></span> Tu siguiente paso</p><span className="rounded-full border border-white/25 bg-black/10 px-3 py-1.5 text-xs text-[#e2f0db]">Día 2 de 4</span></div>
        <p className="mt-9 text-sm text-[#e2f0db]">Tu próximo entrenamiento</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight">Cuerpo completo <span style={{ color: option.accent }}>· A</span></p>
        <p className="mt-3 text-sm text-[#e2f0db]">Pectoral · Dorsal · Cuádriceps</p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-[#eef8e9]"><span className="rounded-full border border-white/20 bg-black/10 px-3 py-2">6 ejercicios</span><span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/10 px-3 py-2"><Clock3 size={13} aria-hidden="true" /> 35 min aprox.</span></div>
        <span className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-bold text-[#1a3221]" style={{ backgroundColor: option.accent }}>Comenzar sesión <ArrowRight size={15} aria-hidden="true" /></span>
      </>}
    </div>
  </div>;
}

export default function BackgroundPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return <main className="app-canvas min-h-screen bg-[#f4f1e9] px-4 py-8 text-[#18231f] sm:px-8">
    <div className="mx-auto max-w-6xl">
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.17em] text-[#526458]"><Sparkles size={16} aria-hidden="true" /> Estudio visual · Datos ficticios</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">Fondos con más personalidad.</h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-[#526458]">Seis estilos para comparar, incluida la combinación de Pulso y Brasa. Cada uno se muestra en un bloque grande y otro compacto. Son ejemplos: no cambian la aplicación ni realizan acciones.</p>
      <div className="mt-8 space-y-10">
        {options.map((option) => <section key={option.id} aria-labelledby={`${option.id}-title`}>
          <div className="mb-4 flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="text-xs font-bold tracking-widest text-[#526458]">{option.number}</span><h2 id={`${option.id}-title`} className="text-2xl font-semibold">{option.name}</h2><p className="text-sm text-[#526458]">{option.description}</p></div>
          <div className="grid gap-4 lg:grid-cols-2"><div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#526458]">Resumen · {positionLabels[option.largePosition]}</p><SampleCard option={option} compact={false} /></div><div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#526458]">Entrenamiento · {positionLabels[option.compactPosition]}</p><SampleCard option={option} compact /></div></div>
        </section>)}
      </div>
      <p className="mt-10 border-t border-[#d6e0d1] pt-5 text-sm text-[#526458]">Los detalles son decorativos y fijos, no aleatorios en cada carga. Se pueden ajustar y adaptar de forma distinta a cada apartado.</p>
    </div>
  </main>;
}

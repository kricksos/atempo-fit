import { ArrowRight, Check, CircleAlert, Clock3, Dumbbell } from "lucide-react";
import Link from "next/link";

export const pulsoBackground = "linear-gradient(120deg, #102432 0%, #173c49 65%, #18515a 100%)";
export const pulsoTrainingBackground = "linear-gradient(120deg, #102432 0%, #173f4a 65%, #16575d 100%)";
export const pulsoNutritionBackground = "linear-gradient(120deg, #443027 0%, #68452d 65%, #805321 100%)";
export const pulsoProgressBackground = "linear-gradient(120deg, #162d4d 0%, #23466f 65%, #2f5590 100%)";

export function PulsoMotif() {
  return <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-[44%] max-w-[220px]" style={{ maskImage: "linear-gradient(to right, transparent, black 50%)", WebkitMaskImage: "linear-gradient(to right, transparent, black 50%)" }}>
    <div className="absolute inset-0" style={{
      backgroundImage: "repeating-linear-gradient(135deg, transparent 0 23px, rgba(166, 238, 224, 0.17) 23px 24px, transparent 24px 32px)",
      maskImage: "linear-gradient(to bottom, transparent 5%, black 70%)",
      WebkitMaskImage: "linear-gradient(to bottom, transparent 5%, black 70%)",
    }} />
  </div>;
}

type NextStepPanelProps = {
  completedToday: boolean;
  workoutLabel: string | null;
  workoutHref: string | null;
  hasProfile: boolean;
  workoutDetails: { day: number; days: number; muscles: string; exerciseCount: number | null; estimatedMinutes?: number; variant: string } | null;
  onPreviewAction?: () => void;
  compact?: boolean;
};

export function PlanReviewNotice({ message, href, action }: { message?: string; href: string; action: string }) {
  return <div role="status" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#ecd9ad] bg-[#fffbf2] px-4 py-3.5">
    <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f7ebd0] text-[#8b5a13]"><CircleAlert size={18} aria-hidden="true" /></span><div><p className="text-sm font-semibold text-[#684a20]">Tu plan necesita atención</p><p className="mt-1 text-xs leading-5 text-[#735f42]">{message ?? "Revisa tu información antes de continuar."}</p></div></div>
    <a href={href} className="ml-12 inline-flex min-h-10 items-center gap-1 text-xs font-semibold text-[#765016] hover:text-[#4f350d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8b5a13] sm:ml-0">{action} <ArrowRight size={14} aria-hidden="true" /></a>
  </div>;
}

export function NextStepPanel({ completedToday, workoutLabel, workoutHref, hasProfile, workoutDetails, onPreviewAction, compact = false }: NextStepPanelProps) {
  const title = completedToday ? "Buen trabajo por hoy" : workoutLabel && hasProfile ? "Tu siguiente paso" : "Tu espacio está listo";
  if (compact) return <section className="relative overflow-hidden rounded-2xl p-4 text-white shadow-[0_12px_30px_rgba(19,46,30,0.12)] sm:p-5" style={{ background: pulsoTrainingBackground }}>
    <PulsoMotif />
    <div className="relative">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#dcf3c6]"><Dumbbell size={15} aria-hidden="true" /> {completedToday ? "Completado hoy · próximo entrenamiento" : workoutLabel ? "Tu próximo entrenamiento" : "Tu espacio está listo"}</p>
        {workoutLabel && workoutDetails ? <>
          <h2 className="mt-2 text-lg font-semibold sm:text-xl">{workoutLabel} <span className="text-[#a6eee0]">· {workoutDetails.variant}</span></h2>
          <p className="mt-1 text-sm leading-5 text-[#e2f0db]">{workoutDetails.muscles}</p>
          <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#e2f0db]"><span>Día {workoutDetails.day} de {workoutDetails.days}</span>{workoutDetails.exerciseCount !== null && <span>{workoutDetails.exerciseCount} {workoutDetails.exerciseCount === 1 ? "ejercicio" : "ejercicios"}</span>}{workoutDetails.estimatedMinutes !== undefined && <span className="inline-flex items-center gap-1"><Clock3 size={13} aria-hidden="true" /> {workoutDetails.estimatedMinutes} min aprox.</span>}</p>
        </> : <p className="mt-2 text-sm text-[#e2f0db]">Genera tu plan para empezar a registrar tu progreso.</p>}
      </div>
      {workoutLabel && workoutDetails && (completedToday ? <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold text-[#e2f0db]"><Check size={15} aria-hidden="true" /> Disponible mañana</span> : onPreviewAction ? <button type="button" onClick={onPreviewAction} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#a6eee0] px-5 text-sm font-bold text-[#1a3221] hover:bg-[#c9f6ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Comenzar sesión <ArrowRight size={16} aria-hidden="true" /></button> : workoutHref && <Link href={workoutHref} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#a6eee0] px-5 text-sm font-bold text-[#1a3221] hover:bg-[#c9f6ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Comenzar sesión <ArrowRight size={16} aria-hidden="true" /></Link>)}
    </div>
    </div>
  </section>;
  return <section className="relative overflow-hidden rounded-[1.75rem] p-6 text-white shadow-[0_20px_45px_rgba(19,46,30,0.16)] sm:p-8" style={{ background: pulsoBackground }}>
    <PulsoMotif />
    <div className="relative">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#dcf3c6]"><span className="grid size-8 place-items-center rounded-xl bg-white/10"><Dumbbell size={15} aria-hidden="true" /></span>{title}</p>
        {workoutDetails && <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#e2f0db]">Día {workoutDetails.day} de {workoutDetails.days}</span>}</div>
      {workoutLabel && workoutDetails ? <>
        <div className="mt-8"><p className="text-sm text-[#e2f0db]">{completedToday ? "Completado hoy · próximo entrenamiento" : "Tu próximo entrenamiento"}</p><h2 className="mt-2 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{workoutLabel} <span className="text-[#a6eee0]">· {workoutDetails.variant}</span></h2><p className="mt-3 max-w-md text-sm leading-6 text-[#e2f0db]">{workoutDetails.muscles}</p></div>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-[#e2f0db]">{workoutDetails.exerciseCount !== null && <span className="rounded-full border border-white/15 bg-white/5 px-3 py-2">{workoutDetails.exerciseCount} {workoutDetails.exerciseCount === 1 ? "ejercicio" : "ejercicios"}</span>}{workoutDetails.estimatedMinutes !== undefined && <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-2"><Clock3 size={13} aria-hidden="true" /> {workoutDetails.estimatedMinutes} min aprox.</span>}</div>
        <div className="mt-8 flex flex-wrap items-center gap-4">{completedToday ? <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold text-[#e2f0db]"><Check size={15} aria-hidden="true" /> Disponible mañana</span> : onPreviewAction ? <button type="button" onClick={onPreviewAction} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#a6eee0] px-5 py-3 text-sm font-bold text-[#1a3221] hover:bg-[#c9f6ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Comenzar sesión <ArrowRight size={16} aria-hidden="true" /></button> : workoutHref && <Link href={workoutHref} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#a6eee0] px-5 py-3 text-sm font-bold text-[#1a3221] hover:bg-[#c9f6ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">Comenzar sesión <ArrowRight size={16} aria-hidden="true" /></Link>}<span className="text-xs text-[#e2f0db]">A tu ritmo, paso a paso.</span></div>
      </> : <div className="mt-8"><h2 className="text-2xl font-semibold">Aún por generar</h2><p className="mt-3 text-sm leading-6 text-[#e2f0db]">Genera tu plan para empezar a registrar tu progreso.</p></div>}
    </div>
  </section>;
}
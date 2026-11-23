import { ArrowUpRight, LineChart, TrendingDown, TrendingUp } from "lucide-react";

type ProgressSummaryCardProps = {
  currentWeightKg: number | null;
  startingWeightKg: number | null;
  targetWeightKg: number | null;
  weightDeltaKg: number | null;
  daysSinceLastMeasurement: number | null;
  primaryGoal: string;
  preview?: boolean;
};

function progressToTarget(current: number, start: number, target: number) {
  const distance = target - start;
  if (distance === 0) return 100;
  return Math.max(0, Math.min(100, Math.round(((current - start) / distance) * 100)));
}

function lastUpdateLabel(days: number | null) {
  if (days === null) return "Sin registros todavía";
  if (days === 0) return "Actualizado hoy";
  if (days === 1) return "Actualizado ayer";
  return `Actualizado hace ${days} días`;
}

export function ProgressSummaryCard({ currentWeightKg, startingWeightKg, targetWeightKg, weightDeltaKg, daysSinceLastMeasurement, primaryGoal, preview = false }: ProgressSummaryCardProps) {
  const hasWeight = currentWeightKg !== null;
  const hasTarget = hasWeight && startingWeightKg !== null && targetWeightKg !== null;
  const progress = hasTarget ? progressToTarget(currentWeightKg, startingWeightKg, targetWeightKg) : null;
  const remaining = hasTarget ? Math.abs(targetWeightKg - currentWeightKg) : null;
  const isPositiveChange = weightDeltaKg !== null && weightDeltaKg !== 0;
  const trendLabel = weightDeltaKg === null ? "Aún necesitamos otra medición para leer tu tendencia." : weightDeltaKg === 0 ? "Tu peso se mantiene estable desde el inicio." : weightDeltaKg > 0 ? "Tu peso ha subido desde el inicio." : "Tu peso ha bajado desde el inicio.";
  const freshnessLabel = daysSinceLastMeasurement === null ? "Sin mediciones" : daysSinceLastMeasurement >= 14 ? "Conviene actualizarlo" : "Seguimiento al día";

  return (
    <section className="rounded-[1.5rem] border border-[#e1e7eb] bg-white p-6 shadow-[0_12px_36px_rgba(19,43,57,0.05)] sm:p-7">
      <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-xl bg-[#edf2ff] text-[#375dac]"><LineChart size={20} aria-hidden="true" /></span><div><p className="text-xs font-bold uppercase tracking-[0.12em] text-[#657985]">Tu evolución</p><h2 className="mt-1 text-lg font-semibold">Progreso personal</h2></div></div>{!preview && <a href="/dashboard?tab=progress" aria-label="Ver progreso" className="grid size-10 place-items-center rounded-full border border-[#e2e8eb] text-[#375dac] hover:bg-[#edf2ff] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#375dac]"><ArrowUpRight size={18} aria-hidden="true" /></a>}</div>
      <div className="mt-7 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs text-[#526e69]">Último peso registrado</p><p className="mt-1 text-3xl font-semibold tracking-tight">{hasWeight ? `${currentWeightKg} kg` : "Sin datos"}</p></div>{isPositiveChange ? <span className={`inline-flex items-center gap-1 rounded-full bg-[#e5f5f2] px-3 py-1.5 text-xs font-semibold ${weightDeltaKg < 0 ? "text-[#17655f]" : "text-[#805321]"}`}>{weightDeltaKg < 0 ? <TrendingDown size={15} /> : <TrendingUp size={15} />}{weightDeltaKg > 0 ? "+" : ""}{weightDeltaKg.toFixed(1)} kg desde el inicio</span> : null}</div>
      <p className="mt-2 text-sm text-[#526e69]">{trendLabel}</p>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs"><span className="text-[#526e69]">Objetivo: <strong className="text-[#172d32]">{primaryGoal || "Pendiente"}</strong></span><span className={`rounded-full px-2.5 py-1 font-semibold ${daysSinceLastMeasurement !== null && daysSinceLastMeasurement >= 14 ? "bg-[#f7ead9] text-[#7a5326]" : "bg-[#eaf1fa] text-[#3f6384]"}`}>{freshnessLabel}</span></div>
      {hasTarget && remaining !== null ? <><div className="mt-5 flex items-center justify-between text-xs text-[#526e69]"><span>Objetivo: {targetWeightKg} kg</span><span>{remaining === 0 ? "Objetivo alcanzado" : `${remaining.toFixed(1)} kg restantes`}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#edf0f3]"><div className="h-full rounded-full bg-[#466dc0] transition-all" style={{ width: `${progress}%` }} /></div></> : <p className="mt-5 rounded-xl border border-[#d0deec] bg-white px-3 py-2 text-xs text-[#526e69]">Añade un peso objetivo para seguir tu evolución.</p>}
      <div className="mt-5 text-xs text-[#526e69]">{lastUpdateLabel(daysSinceLastMeasurement)} · Consulta el detalle desde la pestaña Progreso.</div>
    </section>
  );
}

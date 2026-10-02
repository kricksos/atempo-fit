import { Scale, TrendingDown, TrendingUp } from "lucide-react";

type ProgressSummaryCardProps = {
  currentWeightKg: number | null;
  startingWeightKg: number | null;
  targetWeightKg: number | null;
  weightDeltaKg: number | null;
  daysSinceLastMeasurement: number | null;
  primaryGoal: string;
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

export function ProgressSummaryCard({ currentWeightKg, startingWeightKg, targetWeightKg, weightDeltaKg, daysSinceLastMeasurement, primaryGoal }: ProgressSummaryCardProps) {
  const hasWeight = currentWeightKg !== null;
  const hasTarget = hasWeight && startingWeightKg !== null && targetWeightKg !== null;
  const progress = hasTarget ? progressToTarget(currentWeightKg, startingWeightKg, targetWeightKg) : null;
  const remaining = hasTarget ? Math.abs(targetWeightKg - currentWeightKg) : null;
  const isPositiveChange = weightDeltaKg !== null && weightDeltaKg !== 0;
  const trendLabel = weightDeltaKg === null ? "Aún necesitamos otra medición para leer tu tendencia." : weightDeltaKg === 0 ? "Tu peso se mantiene estable desde el inicio." : weightDeltaKg > 0 ? "Tu peso ha subido desde el inicio." : "Tu peso ha bajado desde el inicio.";
  const freshnessLabel = daysSinceLastMeasurement === null ? "Sin mediciones" : daysSinceLastMeasurement >= 14 ? "Conviene actualizarlo" : "Seguimiento al día";

  return (
    <section className="rounded-3xl border border-[#d3dbcf] bg-[#f8f7f1] p-6">
      <Scale className="text-[#72873f]" />
      <div className="mt-8 flex items-end justify-between gap-3"><div><p className="text-sm text-[#819078]">Tu progreso</p><h2 className="mt-2 text-3xl font-semibold">{hasWeight ? `${currentWeightKg} kg` : "Sin datos"}</h2></div>{isPositiveChange ? <span className={`inline-flex items-center gap-1 text-sm font-semibold ${weightDeltaKg < 0 ? "text-[#72873f]" : "text-[#a06a3a]"}`}>{weightDeltaKg < 0 ? <TrendingDown size={15} /> : <TrendingUp size={15} />}{weightDeltaKg > 0 ? "+" : ""}{weightDeltaKg.toFixed(1)} kg</span> : null}</div>
      <p className="mt-2 text-sm text-[#68736b]">{trendLabel}</p>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs"><span className="text-[#819078]">Objetivo: <strong className="text-[#18231f]">{primaryGoal || "Pendiente"}</strong></span><span className={`rounded-full px-2.5 py-1 font-semibold ${daysSinceLastMeasurement !== null && daysSinceLastMeasurement >= 14 ? "bg-[#f7ead9] text-[#7a5326]" : "bg-[#eef4e1] text-[#60703d]"}`}>{freshnessLabel}</span></div>
      {hasTarget && remaining !== null ? <><div className="mt-5 flex items-center justify-between text-xs text-[#68736b]"><span>Objetivo: {targetWeightKg} kg</span><span>{remaining === 0 ? "Objetivo alcanzado" : `${remaining.toFixed(1)} kg restantes`}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#dfe4d8]"><div className="h-full rounded-full bg-[#72873f] transition-all" style={{ width: `${progress}%` }} /></div></> : <p className="mt-5 rounded-xl border border-[#d3dbcf] bg-white px-3 py-2 text-xs text-[#68736b]">Añade un peso objetivo para seguir tu evolución.</p>}
      <div className="mt-5 text-xs text-[#819078]">{lastUpdateLabel(daysSinceLastMeasurement)} · Consulta el detalle desde la pestaña Progreso.</div>
    </section>
  );
}

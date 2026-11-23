import { Flame } from "lucide-react";

export function WeeklyActivityCard({ activeDays, targetDays, completed, currentStreak }: { activeDays: number; targetDays: number; completed: boolean; currentStreak: number }) {
  return <section className="rounded-[1.5rem] border border-[#e1e7eb] bg-white p-6 shadow-[0_12px_36px_rgba(19,43,57,0.05)] sm:p-7">
    <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-[#657985]">Constancia</p><h2 className="mt-2 text-xl font-semibold tracking-tight">Tu semana</h2></div><span className="grid size-10 place-items-center rounded-xl bg-[#f1eef9] text-[#7550a4]"><Flame size={19} aria-hidden="true" /></span></div>
    <div className="mt-7 flex items-end gap-2"><span className="text-5xl font-semibold tracking-[-0.07em]">{activeDays}<span className="text-2xl text-[#526e69]"> / {targetDays}</span></span><span className="pb-1 text-sm text-[#526e69]">días activos</span></div>
    <p className="mt-2 text-sm leading-6 text-[#526e69]">{completed ? "Has alcanzado tu objetivo semanal." : "Cada paso cuenta para tu objetivo semanal."}</p>
    <div role="progressbar" aria-label="Objetivo semanal" aria-valuenow={Math.min(activeDays, targetDays)} aria-valuemin={0} aria-valuemax={targetDays} className="mt-5 h-2 overflow-hidden rounded-full bg-[#edf0f3]"><div className="h-full rounded-full bg-[#7550a4]" style={{ width: `${Math.min(100, activeDays / targetDays * 100)}%` }} /></div>
    <div className="mt-7 flex items-center justify-between border-t border-[#edf1f3] pt-5"><span className="flex items-center gap-2 text-sm text-[#526e69]"><Flame size={16} className="text-[#7550a4]" aria-hidden="true" /> Racha actual</span><span className="text-sm font-bold">{currentStreak} {currentStreak === 1 ? "día" : "días"}</span></div>
  </section>;
}

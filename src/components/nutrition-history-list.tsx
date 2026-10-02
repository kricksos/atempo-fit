"use client";

import { Check, ChevronLeft, ChevronRight, LoaderCircle, RotateCcw } from "lucide-react";
import { useState } from "react";

type NutritionHistoryVersion = {
  id: string;
  versionNumber: number;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  mealCount: number;
  goal: string;
  reason: string;
  createdAt: string;
  restrictions: string[];
  active?: boolean;
};

type Props = { versions: NutritionHistoryVersion[] };

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

export function NutritionHistoryList({ versions }: Props) {
  const [page, setPage] = useState(0);
  const pageSize = 4;
  const pageCount = Math.max(1, Math.ceil(versions.length / pageSize));
  const visibleVersions = versions.slice(page * pageSize, (page + 1) * pageSize);
  const [activating, setActivating] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function activate(versionId: string) {
    if (!window.confirm("Esta dieta sustituirá a la actual. La dieta actual se conservará en el historial. ¿Quieres activarla?")) return;
    setActivating(versionId);
    setMessage(null);
    const response = await fetch("/api/plans/nutrition/activate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ versionId }) });
    setActivating(null);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error ?? "No hemos podido activar esta dieta.");
      return;
    }
    setMessage("Dieta activada. La anterior se conserva en el historial.");
    window.location.reload();
  }

  if (versions.length === 0) return <div className="mt-6 rounded-2xl border border-dashed border-[#cfd7c8] p-6 text-sm text-[#68736b]">Cuando tu dieta se actualice, aquí podrás consultar sus versiones anteriores.</div>;

  return <>
    <div className="mt-6 space-y-3">{visibleVersions.map((version) => <article key={version.id} className="rounded-2xl border border-[#e3e7dd] bg-white p-4"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{version.goal}</h3><span className="rounded-full bg-[#eef1ea] px-2.5 py-1 text-[11px] font-semibold text-[#68736b]">{version.reason}</span></div><p className="mt-2 text-xs text-[#819078]">{dateLabel(version.createdAt)} · {version.mealCount} comidas · Versión {version.versionNumber}</p></div>{version.active ? <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f5b4] px-2.5 py-1 text-[11px] font-semibold text-[#60703d]"><Check size={13} /> Activa</span> : <button type="button" disabled={activating === version.id} onClick={() => activate(version.id)} className="inline-flex items-center gap-1.5 rounded-full border border-[#72873f] px-3 py-1.5 text-xs font-semibold text-[#60703d] transition hover:bg-[#e7f5b4] active:scale-95 disabled:opacity-50">{activating === version.id ? <LoaderCircle size={13} className="animate-spin" /> : <RotateCcw size={13} />} Activar esta dieta</button>}</div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"><div className="rounded-xl bg-[#f4f1e9] p-3"><p className="text-[11px] text-[#819078]">Calorías</p><p className="mt-1 font-semibold">{version.calories} kcal</p></div><div className="rounded-xl bg-[#f4f1e9] p-3"><p className="text-[11px] text-[#819078]">Proteína</p><p className="mt-1 font-semibold">{Math.round(version.proteinGrams)} g</p></div><div className="rounded-xl bg-[#f4f1e9] p-3"><p className="text-[11px] text-[#819078]">Hidratos</p><p className="mt-1 font-semibold">{Math.round(version.carbsGrams)} g</p></div><div className="rounded-xl bg-[#f4f1e9] p-3"><p className="text-[11px] text-[#819078]">Grasas</p><p className="mt-1 font-semibold">{Math.round(version.fatsGrams)} g</p></div></div><div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#68736b]"><span className="font-semibold text-[#819078]">Restricciones:</span>{version.restrictions.length > 0 ? version.restrictions.map((restriction) => <span key={restriction} className="rounded-full border border-[#d3dbcf] px-2.5 py-1">{restriction}</span>) : <span>Sin alergias o intolerancias activas</span>}</div></article>)}</div>
    {message ? <p className="mt-4 text-sm font-semibold text-[#60703d]">{message}</p> : null}
    {pageCount > 1 && <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#e3e7dd] pt-4"><button type="button" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))} className="inline-flex items-center gap-1 rounded-full border border-[#d3dbcf] px-3 py-2 text-xs font-semibold text-[#68736b] transition hover:border-[#72873f] hover:bg-[#e7f5b4] hover:text-[#60703d] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#d3dbcf] disabled:hover:bg-transparent disabled:hover:text-[#68736b]"><ChevronLeft size={15} /> Anteriores</button><span className="text-xs font-semibold text-[#819078]">Página {page + 1} de {pageCount} · {versions.length} dietas</span><button type="button" disabled={page === pageCount - 1} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))} className="inline-flex items-center gap-1 rounded-full border border-[#d3dbcf] px-3 py-2 text-xs font-semibold text-[#68736b] transition hover:border-[#72873f] hover:bg-[#e7f5b4] hover:text-[#60703d] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#d3dbcf] disabled:hover:bg-transparent disabled:hover:text-[#68736b]">Siguientes <ChevronRight size={15} /></button></div>}
  </>;
}

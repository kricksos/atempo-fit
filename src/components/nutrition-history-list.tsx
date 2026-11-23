"use client";

import { Check, ChevronLeft, ChevronRight, LoaderCircle, RotateCcw } from "lucide-react";
import { useState } from "react";

export type NutritionHistoryVersion = {
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

  if (versions.length === 0) return <div className="mt-6 rounded-2xl border border-dashed border-[#e4d7d2] p-6 text-sm text-[#526e75]">Cuando tu dieta se actualice, aquí podrás consultar sus versiones anteriores.</div>;

  return <>
    <div className="mt-6 space-y-3">{visibleVersions.map((version) => <article key={version.id} className="rounded-2xl border border-[#e9dedb] bg-[#fffcfb] p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold">{version.goal}</h3><span className="rounded-full bg-[#f7eeeb] px-2.5 py-1 text-[11px] font-semibold text-[#79574e]">{version.reason}</span></div><p className="mt-2 text-xs text-[#71858c]">{dateLabel(version.createdAt)} · {version.mealCount} comidas · Versión {version.versionNumber}</p></div>
        {version.active ? <span className="inline-flex items-center gap-1 rounded-full bg-[#e2f4eb] px-2.5 py-1 text-[11px] font-semibold text-[#34785f]"><Check size={13} aria-hidden="true" /> Activa</span> : <button type="button" disabled={activating === version.id} onClick={() => activate(version.id)} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#e4d7d2] bg-white px-4 text-xs font-semibold text-[#9f4b39] transition hover:bg-[#fff1ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6503c] disabled:opacity-50">{activating === version.id ? <LoaderCircle size={13} className="animate-spin" aria-hidden="true" /> : <RotateCcw size={13} aria-hidden="true" />} Activar esta dieta</button>}
      </div>
      <details className="mt-3 text-sm text-[#526e69]">
        <summary className="w-fit cursor-pointer rounded-md py-2 font-semibold text-[#9f4b39] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6503c]">Ver detalles <span className="sr-only">de la versión {version.versionNumber}</span></summary>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">{[{ label: "Calorías", value: `${version.calories} kcal` }, { label: "Proteína", value: `${Math.round(version.proteinGrams)} g` }, { label: "Hidratos", value: `${Math.round(version.carbsGrams)} g` }, { label: "Grasas", value: `${Math.round(version.fatsGrams)} g` }].map(({ label, value }) => <div key={label} className="rounded-xl bg-[#f7f9f9] p-3"><p className="text-[11px] text-[#71858c]">{label}</p><p className="mt-1 font-semibold">{value}</p></div>)}</div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#526e75]"><span className="font-semibold text-[#71858c]">Restricciones:</span>{version.restrictions.length > 0 ? version.restrictions.map((restriction) => <span key={restriction} className="rounded-full border border-[#e4d7d2] px-2.5 py-1">{restriction}</span>) : <span>Sin alergias o intolerancias activas</span>}</div>
      </details>
    </article>)}</div>
    {message ? <p className="mt-4 text-sm font-semibold text-[#9f4b39]">{message}</p> : null}
    {pageCount > 1 && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#e9dedb] pt-4"><button type="button" disabled={page === 0} onClick={() => setPage((current) => Math.max(0, current - 1))} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-[#e4d7d2] px-3 text-xs font-semibold text-[#9f4b39] hover:bg-[#fff1ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6503c] disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={15} aria-hidden="true" /> Anteriores</button><span className="text-xs font-semibold text-[#71858c]">Página {page + 1} de {pageCount} · {versions.length} dietas</span><button type="button" disabled={page === pageCount - 1} onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))} className="inline-flex min-h-11 items-center gap-1 rounded-full border border-[#e4d7d2] px-3 text-xs font-semibold text-[#9f4b39] hover:bg-[#fff1ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6503c] disabled:cursor-not-allowed disabled:opacity-40">Siguientes <ChevronRight size={15} aria-hidden="true" /></button></div>}
  </>;
}

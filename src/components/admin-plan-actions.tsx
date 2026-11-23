"use client";

import { Apple, Dumbbell, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { adaptationProposalFromResponse, WorkoutAdaptationNotice, type AdaptationProposal } from "@/components/workout-adaptation-notice";
import type { WorkoutAdaptation } from "@/features/planning/engine";

type Props = { userId: string };

export function AdminPlanActions({ userId }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState<"workout" | "nutrition" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [proposal, setProposal] = useState<AdaptationProposal | null>(null);
  const [adaptations, setAdaptations] = useState<WorkoutAdaptation[]>([]);

  async function regenerate(type: "workout" | "nutrition", adaptationToken?: string) {
    const label = type === "workout" ? "rutina" : "dieta";
    if (!adaptationToken && !window.confirm(`¿Regenerar la ${label} usando el perfil actual de este usuario?`)) return;
    setBusy(type);
    setMessage(null);
    setProposal(null);
    setAdaptations([]);
    try {
      const response = await fetch(`/api/admin/users/${userId}/regenerate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, adaptationToken }) });
      const data: { error?: string; adaptations?: WorkoutAdaptation[] } = await response.json();
      const pending = adaptationProposalFromResponse(data);
      if (pending) {
        setProposal(pending);
        return;
      }
      if (!response.ok) throw new Error(data.error ?? `No se ha podido regenerar la ${label}.`);
      setAdaptations(data.adaptations ?? []);
      setMessage(`${type === "workout" ? "Rutina" : "Dieta"} regenerada correctamente.`);
      router.refresh();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : `No se ha podido regenerar la ${label}.`);
    } finally {
      setBusy(null);
    }
  }

  return <section className="rounded-3xl border border-[#d3dbcf] bg-[#f8f7f1] p-6"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#819078]">Acciones operativas</p><h2 className="mt-2 text-2xl font-semibold">Regenerar planificación</h2><p className="mt-2 text-sm text-[#68736b]">Crea una nueva versión usando los datos actuales del usuario. La versión anterior queda archivada.</p><div className="mt-6 flex flex-wrap gap-3"><button type="button" disabled={busy !== null} onClick={() => regenerate("workout")} className="inline-flex items-center gap-2 rounded-full bg-[#18231f] px-4 py-3 text-sm font-semibold text-white disabled:opacity-60">{busy === "workout" ? <LoaderCircle size={16} className="animate-spin" /> : <Dumbbell size={16} />} Regenerar rutina</button><button type="button" disabled={busy !== null} onClick={() => regenerate("nutrition")} className="inline-flex items-center gap-2 rounded-full border border-[#b6c77b] bg-[#e7f5b4] px-4 py-3 text-sm font-semibold text-[#3d4a24] disabled:opacity-60">{busy === "nutrition" ? <LoaderCircle size={16} className="animate-spin" /> : <Apple size={16} />} Regenerar dieta</button></div>{proposal ? <div className="mt-6"><WorkoutAdaptationNotice adaptations={proposal.adaptations} proposal={proposal} /><p className="mt-3 text-sm">La rutina actual no ha cambiado. Confirma la propuesta para activarla para este usuario.</p><div className="mt-4 flex gap-3"><button type="button" disabled={busy !== null} onClick={() => regenerate("workout", proposal.adaptationToken)} className="rounded-full bg-[#18231f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">Activar rutina adaptada</button><button type="button" onClick={() => setProposal(null)} className="rounded-full border border-[#cfd7c8] px-4 py-2 text-sm font-semibold">Cancelar</button></div></div> : null}{adaptations.length ? <div className="mt-6"><WorkoutAdaptationNotice adaptations={adaptations} /></div> : null}{message ? <p className="mt-4 text-sm font-semibold text-[#60703d]">{message}</p> : null}</section>;
}

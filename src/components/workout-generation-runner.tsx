"use client";

import { Check, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { NavigationLink } from "@/components/navigation-control";
import { adaptationProposalFromResponse, WorkoutAdaptationNotice, type AdaptationProposal } from "@/components/workout-adaptation-notice";
import type { WorkoutAdaptation } from "@/features/planning/engine";

export function WorkoutGenerationRunner({ initial, review = false, returnToPreview = false }: { initial: boolean; review?: boolean; returnToPreview?: boolean }) {
  const [busy, setBusy] = useState(true);
  const [stageIndex, setStageIndex] = useState(0);
  const [proposal, setProposal] = useState<AdaptationProposal | null>(null);
  const [adaptations, setAdaptations] = useState<WorkoutAdaptation[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);
  const endpoint = initial ? "/api/plans/generate" : review ? "/api/plans/workout/regenerate" : "/api/workouts/automatic";
  const stages = initial
    ? ["Revisando tu perfil y disponibilidad...", "Seleccionando ejercicios compatibles...", "Calculando tu orientación nutricional...", "Preparando tu propuesta..."]
    : ["Revisando tu perfil y disponibilidad...", "Seleccionando ejercicios compatibles...", "Ajustando tus sesiones...", "Preparando tu propuesta..."];

  const generate = useCallback(async (adaptationToken?: string) => {
    setBusy(true);
    setStageIndex(0);
    setProposal(null);
    setError(null);
    try {
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adaptationToken }) });
      const data: { error?: string; generated?: boolean; reason?: string; adaptations?: WorkoutAdaptation[] } = await response.json();
      const pending = adaptationProposalFromResponse(data);
      if (pending) {
        setProposal(pending);
      } else {
        if (!response.ok) throw new Error(data.error ?? "No hemos podido preparar tu plan.");
        setAdaptations(data.adaptations ?? []);
        setMessage(data.generated === false && data.reason === "active_plan_exists" ? "Tu plan activo ya está disponible; no hemos creado otro." : initial ? "Tu rutina y tu dieta están listas." : "Tu rutina automática ya está activa.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No hemos podido conectar. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  }, [endpoint, initial]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void generate();
  }, [generate]);

  useEffect(() => {
    if (!busy) return;
    const timer = window.setInterval(() => setStageIndex((current) => Math.min(current + 1, stages.length - 1)), 750);
    return () => window.clearInterval(timer);
  }, [busy, stages.length]);

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-5 py-6 text-[#18231f] sm:px-8 sm:py-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-2xl flex-col items-center justify-center text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-[#18231f] text-[#d7f36b]">{busy ? <LoaderCircle size={26} className="animate-spin" /> : message ? <Check size={26} /> : "!"}</span>
        <h1 className="mt-8 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{busy ? "Preparando tu plan" : proposal ? "Revisa tu rutina adaptada" : message ? "Plan preparado." : "No se ha generado el plan"}</h1>
        <p className="mt-3 max-w-md text-[#68736b]">{busy ? stages[stageIndex] : proposal ? "Todavía no se ha activado la nueva rutina. Revisa los ejercicios y avisos antes de continuar." : message ?? "Puedes revisar tus datos antes de intentarlo de nuevo."}</p>
        {busy || message ? <><div className="mt-8 h-2 w-full max-w-sm overflow-hidden rounded-full bg-[#dfe4d8]"><div className="h-full rounded-full bg-[#72873f] transition-all duration-500" style={{ width: `${message ? 100 : Math.round(((stageIndex + 1) / stages.length) * 100)}%` }} /></div><ul className="mt-8 space-y-2 text-left">{stages.map((stage, index) => <li key={stage} className={`flex items-center gap-2 text-sm ${message || index <= stageIndex ? "font-semibold text-[#3d4a24]" : "text-[#a7b09c]"}`}>{message || index < stageIndex ? <Check size={15} className="text-[#72873f]" /> : index === stageIndex ? <LoaderCircle size={15} className="animate-spin" /> : <span className="size-[15px]" />}{stage}</li>)}</ul></> : null}
        {proposal ? <><div className="mt-6 w-full"><WorkoutAdaptationNotice adaptations={proposal.adaptations} proposal={proposal} /></div><button type="button" onClick={() => void generate(proposal.adaptationToken)} className="mt-6 rounded-full bg-[#18231f] px-6 py-3 text-sm font-semibold text-white">Activar rutina adaptada</button><NavigationLink href={!initial && !review ? "/workout/builder?setup=chooser" : "/dashboard?tab=training"} kind="back" className="mt-4">Cancelar</NavigationLink></> : null}
        {error ? <><p className="mt-6 text-sm font-semibold text-[#a64e3c]">{error}</p><button type="button" onClick={() => void generate()} className="mt-5 rounded-full bg-[#18231f] px-6 py-3 text-sm font-semibold text-white">Volver a intentarlo</button><Link href="/checkin?mode=workout" className="mt-4 text-sm font-semibold underline">Revisar material y restricciones</Link>{!initial && !review ? <NavigationLink href="/workout/builder?setup=chooser" kind="back" className="mt-4">Volver al configurador</NavigationLink> : <NavigationLink href="/dashboard" kind="dashboard" className="mt-4">Volver al panel</NavigationLink>}</> : null}
        {message ? <>{adaptations.length ? <div className="mt-6 w-full"><WorkoutAdaptationNotice adaptations={adaptations} /></div> : null}<NavigationLink href={returnToPreview ? "/preview" : "/dashboard?tab=training"} kind="dashboard" className="mt-8">{returnToPreview ? "Continuar" : "Ver mi plan"}</NavigationLink></> : null}
      </div>
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock3, Pause, Play, RotateCcw } from "lucide-react";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9df0dc]";

function formatTime(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function WorkoutCountdown({ durationSeconds, kind, setNumber }: {
  durationSeconds: number | null;
  kind: "rest" | "exercise";
  setNumber?: number;
}) {
  const [remaining, setRemaining] = useState(durationSeconds ?? 0);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [status, setStatus] = useState<"ready" | "running" | "paused" | "finished">("ready");
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const subject = kind === "rest" ? "descanso" : "ejercicio";
  const suffix = setNumber === undefined ? "" : `, serie ${setNumber}`;
  const validDuration = durationSeconds !== null && Number.isInteger(durationSeconds) && durationSeconds >= 1 && durationSeconds <= 3600;

  useEffect(() => {
    if (deadline === null) return;
    const timer = window.setInterval(() => {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(next);
      if (next === 0) {
        setDeadline(null);
        setStatus("finished");
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [deadline]);

  function start() {
    if (!validDuration || durationSeconds === null) return;
    const seconds = remaining > 0 ? remaining : durationSeconds;
    setRemaining(seconds);
    setNoticeDismissed(false);
    setStatus("running");
    setDeadline(Date.now() + seconds * 1000);
  }

  function pause() {
    if (deadline === null) return;
    const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    setRemaining(next);
    setDeadline(null);
    setStatus(next === 0 ? "finished" : "paused");
  }

  function reset() {
    setDeadline(null);
    setRemaining(durationSeconds ?? 0);
    setStatus("ready");
    setNoticeDismissed(false);
  }

  const restFinished = kind === "rest" && status === "finished";

  return <div role="group" aria-label={`Temporizador de ${subject}${suffix}`} className={`rounded-2xl border p-4 ${restFinished ? "border-[#9df0dc] bg-[#1d514d] shadow-[0_0_0_3px_rgba(157,240,220,0.12)]" : "border-[#9df0dc]/20 bg-[#102833]"}`}>
    {restFinished && <div className="mb-4 flex items-start gap-3 rounded-xl bg-[#d2fff1] px-4 py-3 text-[#103c3b]">
      <CheckCircle2 className="mt-0.5 shrink-0" size={21} aria-hidden="true" />
      <div><p className="text-base font-bold">Descanso completado</p><p className="mt-1 text-sm leading-5">Ya puedes comenzar la siguiente serie.</p></div>
    </div>}
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="flex items-center gap-2 text-sm font-bold text-[#d9efed]"><Clock3 size={16} className="text-[#9df0dc]" aria-hidden="true" /> {kind === "rest" ? "Descanso entre series" : "Temporizador del ejercicio"}</p>
        <p className="mt-1 text-xs leading-5 text-[#a9c2c8]">{validDuration ? kind === "rest" ? `Tiempo previsto: ${durationSeconds} s` : `Tiempo objetivo: ${durationSeconds} s` : kind === "rest" && durationSeconds === 0 ? "Este ejercicio no tiene descanso programado." : "No hay un tiempo válido para iniciar este temporizador."}</p>
      </div>
      {validDuration && <span aria-label={`Tiempo restante: ${formatTime(remaining)}`} className="font-mono text-3xl font-semibold tabular-nums text-[#9df0dc]">{formatTime(remaining)}</span>}
    </div>
    {validDuration && <div className="mt-4 flex flex-wrap items-center gap-2">
      <button type="button" onClick={status === "running" ? pause : start} aria-label={`${status === "running" ? "Pausar" : status === "paused" ? "Reanudar" : "Iniciar"} ${subject}${suffix}`} className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-[#9df0dc] px-4 text-sm font-bold text-[#103c3b] hover:bg-[#c4ffef] ${focus}`}>{status === "running" ? <Pause size={15} aria-hidden="true" /> : <Play size={15} aria-hidden="true" />}{status === "running" ? "Pausar" : status === "paused" ? "Reanudar" : "Iniciar"} {subject}</button>
      <button type="button" onClick={reset} disabled={status === "ready"} aria-label={`Reiniciar ${subject}${suffix}`} className={`inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-4 text-sm font-semibold text-[#d9efed] hover:bg-white/10 disabled:opacity-40 ${focus}`}><RotateCcw size={15} aria-hidden="true" /> Reiniciar</button>
    </div>}
    <p aria-live="polite" className={restFinished ? "sr-only" : "mt-3 text-xs font-semibold text-[#a8d7ce]"}>{status === "finished" ? kind === "rest" ? "Descanso completado. Ya puedes comenzar la siguiente serie." : "Tiempo del ejercicio terminado." : status === "paused" ? "Temporizador en pausa." : ""}</p>
    {restFinished && !noticeDismissed && <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-[#9df0dc] bg-[#d2fff1] p-4 text-[#103c3b] shadow-[0_12px_40px_rgba(0,0,0,0.4)]">
      <CheckCircle2 size={26} className="shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1"><p className="text-sm font-bold">Descanso completado</p><p className="mt-1 text-sm">Ya puedes empezar la siguiente serie.</p></div>
      <button type="button" onClick={() => setNoticeDismissed(true)} className="min-h-11 rounded-full border border-[#28766e]/40 px-3 text-sm font-bold hover:bg-[#a8f3de] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#103c3b]">Entendido</button>
    </div>}
  </div>;
}

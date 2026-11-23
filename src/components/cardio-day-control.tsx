"use client";

import { Activity, ChevronDown, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { CardioPreference, CardioRecommendation } from "@/features/planning/cardio";

type Intensity = CardioRecommendation["intensity"];
type Configuration = { modality: string; durationMinutes: number; intensity: Intensity };

const modalities = ["Caminar al aire libre", "Cinta", "Elíptica", "Bicicleta", "Remo"];
const intensities: Intensity[] = ["Suave", "Moderada", "Intervalos"];

function isIntensity(value: string): value is Intensity {
  return intensities.some((intensity) => intensity === value);
}

function fromPreference(preference: CardioPreference): Configuration {
  if (!isIntensity(preference.intensity)) throw new Error("La intensidad de cardio guardada no es válida.");
  return { modality: preference.modality, durationMinutes: preference.duration_minutes, intensity: preference.intensity };
}

type CardioDayControlProps = {
  dayId: string;
  dayLabel: string;
  recommendation: CardioRecommendation | null;
  defaultRecommendation: CardioRecommendation | null;
  preference: CardioPreference | null;
  preview?: boolean;
};

export function CardioDayControl({ dayId, dayLabel, recommendation, defaultRecommendation, preference, preview = false }: CardioDayControlProps) {
  const router = useRouter();
  const startingRecommendation = recommendation ?? defaultRecommendation;
  const initialConfig = preference
    ? fromPreference(preference)
    : startingRecommendation
      ? { modality: startingRecommendation.modalities[0], durationMinutes: startingRecommendation.durationMinutes, intensity: startingRecommendation.intensity }
      : { modality: modalities[0], durationMinutes: 20, intensity: "Suave" as const };
  const [saved, setSaved] = useState<Configuration | null>(recommendation ? initialConfig : null);
  const [sessionKey, setSessionKey] = useState(preference?.session_key ?? recommendation?.key ?? null);
  const [draft, setDraft] = useState(initialConfig);
  const [lastConfig, setLastConfig] = useState(initialConfig);
  const [duration, setDuration] = useState(String(initialConfig.durationMinutes));
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [isSuggested, setIsSuggested] = useState(Boolean(recommendation && !preference));
  const panelId = `cardio-${dayId}`;

  function closeEditor() {
    const config = saved ?? lastConfig;
    setDraft(config);
    setDuration(String(config.durationMinutes));
    setStatus(null);
    setOpen(false);
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const minutes = Number(duration);
    if (!duration.trim() || !Number.isInteger(minutes) || minutes < 5 || minutes > 180) {
      setStatus("Introduce una duración entre 5 y 180 minutos.");
      return;
    }
    const key = sessionKey ?? `custom-${crypto.randomUUID()}`;
    const config = { ...draft, durationMinutes: minutes };
    setBusy(true);
    setStatus(null);
    if (!preview) {
      let response: Response;
      try {
        response = await fetch("/api/cardio", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionKey: key, workoutDayId: dayId, ...config }) });
      } catch {
        setBusy(false);
        setStatus("No hemos podido conectar para guardar el cardio. Inténtalo de nuevo.");
        return;
      }
      if (!response.ok) {
        setBusy(false);
        setStatus("No hemos podido guardar el cardio. Inténtalo de nuevo.");
        return;
      }
    }
    setSessionKey(key);
    setSaved(config);
    setDraft(config);
    setLastConfig(config);
    setIsSuggested(false);
    setBusy(false);
    setOpen(false);
    setStatus(preview ? "Cambio de ejemplo; no se ha guardado." : null);
    if (!preview) router.refresh();
  }

  async function remove() {
    if (!saved || !sessionKey) return;
    setBusy(true);
    setStatus(null);
    if (!preview) {
      let response: Response;
      try {
        response = await fetch("/api/cardio", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sessionKey, workoutDayId: dayId, configuration: saved }) });
      } catch {
        setBusy(false);
        setStatus("No hemos podido conectar para quitar el cardio. Inténtalo de nuevo.");
        return;
      }
      if (!response.ok) {
        setBusy(false);
        setStatus("No hemos podido quitar el cardio. Inténtalo de nuevo.");
        return;
      }
    }
    setDraft(saved);
    setLastConfig(saved);
    setDuration(String(saved.durationMinutes));
    setSaved(null);
    setIsSuggested(false);
    setBusy(false);
    setOpen(false);
    setStatus(preview ? "Cambio de ejemplo; no se ha guardado." : null);
    if (!preview) router.refresh();
  }

  return (
    <div className="mt-4 border-t border-[#d7e9e4] pt-2">
      <div className="flex items-center justify-between gap-x-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          {saved ? <>
            <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-[#d5f1eb] px-1.5 py-1 text-[11px] font-semibold text-[#145257] sm:px-2.5 sm:text-xs"><Activity size={13} aria-hidden="true" /> Cardio añadido</span>
            <span className="text-xs text-[#526e69]">{saved.modality} · {saved.durationMinutes} min · {saved.intensity}</span>
          </> : <span className="inline-flex items-center gap-1.5 text-xs text-[#526e69]"><Activity size={13} aria-hidden="true" /> Sin cardio</span>}
        </div>
        <button type="button" aria-label={`${open ? "Cerrar ajustes de cardio" : saved ? "Configurar cardio" : "Añadir cardio"} del ${dayLabel}`} aria-expanded={open} aria-controls={panelId} onClick={() => open ? closeEditor() : (setStatus(null), setOpen(true))} disabled={busy} className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full px-1.5 py-1.5 text-xs font-semibold text-[#17655f] transition-colors hover:bg-white/70 hover:text-[#103e43] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f] disabled:opacity-50 motion-safe:transition-[background-color,color,translate,scale] motion-safe:enabled:hover:-translate-y-0.5 motion-safe:enabled:active:scale-[0.98] sm:px-2.5">
          {open ? "Cerrar" : saved ? "Ajustar" : "Añadir cardio"} {saved || open ? <ChevronDown size={14} aria-hidden="true" className={open ? "rotate-180" : ""} /> : <Plus size={14} aria-hidden="true" />}
        </button>
      </div>
      <div id={panelId} hidden={!open}>
      {open && <form onSubmit={save} className="mt-2 rounded-xl border border-[#d7e9e4] bg-white/70 p-3 sm:p-4" noValidate>
        <fieldset disabled={busy} className="grid gap-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,0.7fr)_minmax(0,1fr)]">
          <label className="text-xs font-semibold text-[#526e69]">Actividad
            <select value={draft.modality} onChange={(event) => setDraft({ ...draft, modality: event.target.value })} className="mt-1 w-full rounded-xl border border-[#cfe0dd] bg-white px-3 py-2 text-sm font-normal text-[#172d32] focus:outline-2 focus:outline-[#17655f]">
              {!modalities.includes(draft.modality) && <option value={draft.modality}>{draft.modality}</option>}
              {modalities.map((modality) => <option key={modality} value={modality}>{modality}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-[#526e69]">Minutos
            <input type="number" min={5} max={180} step={1} value={duration} onChange={(event) => setDuration(event.target.value)} className="mt-1 w-full rounded-xl border border-[#cfe0dd] bg-white px-3 py-2 text-sm font-normal text-[#172d32] focus:outline-2 focus:outline-[#17655f]" />
          </label>
          <label className="text-xs font-semibold text-[#526e69]">Intensidad
            <select value={draft.intensity} onChange={(event) => { if (isIntensity(event.target.value)) setDraft({ ...draft, intensity: event.target.value }); }} className="mt-1 w-full rounded-xl border border-[#cfe0dd] bg-white px-3 py-2 text-sm font-normal text-[#172d32] focus:outline-2 focus:outline-[#17655f]">
              {intensities.map((intensity) => <option key={intensity} value={intensity}>{intensity}</option>)}
            </select>
          </label>
        </fieldset>
        {recommendation && isSuggested && <p className="mt-3 text-xs leading-5 text-[#526e69]">{recommendation.effort}</p>}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button type="submit" disabled={busy} className="min-h-9 rounded-full bg-[#145257] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1b6a68] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f] disabled:opacity-50 motion-safe:transition-[background-color,box-shadow,translate,scale] motion-safe:enabled:hover:-translate-y-0.5 motion-safe:enabled:hover:shadow-sm motion-safe:enabled:active:scale-[0.98]">{busy ? "Guardando..." : "Guardar cardio"}</button>
          {saved && <button type="button" disabled={busy} onClick={remove} className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold text-[#945b48] transition-colors hover:bg-[#f6e8de] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#945b48] disabled:opacity-50 motion-safe:transition-[background-color,translate,scale] motion-safe:enabled:hover:-translate-y-0.5 motion-safe:enabled:active:scale-[0.98]"><Trash2 size={14} aria-hidden="true" /> Quitar cardio</button>}
          <button type="button" disabled={busy} onClick={closeEditor} className="min-h-9 rounded-full px-3 py-2 text-xs font-semibold text-[#526e69] transition-colors hover:bg-[#eaf7f4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f] disabled:opacity-50 motion-safe:transition-[background-color,translate,scale] motion-safe:enabled:hover:-translate-y-0.5 motion-safe:enabled:active:scale-[0.98]">Cancelar</button>
        </div>
      </form>}
      </div>
      {status && <p role="status" className="mt-3 text-xs font-medium text-[#945b48]">{status}</p>}
    </div>
  );
}

"use client";

import { NavigationButton, NavigationLink } from "@/components/navigation-control";
import { ArrowRight, BookOpen, Check, Clock3, Copy, Dumbbell, Layers3, LoaderCircle, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

import { FavoriteButton } from "@/components/favorite-button";
import { PulsoMotif, pulsoTrainingBackground } from "@/components/next-step-panel";
import type { WorkoutCardDay } from "@/lib/workout-card-summary";

type Props = {
  activeRoutine: { name: string; automatic: boolean; days: WorkoutCardDay[] } | null;
  routines: Array<{ id: string; name: string; updatedAt: string; active: boolean; favorite?: boolean; days: WorkoutCardDay[] }>;
  drafts: Array<{ id: string; name: string; updatedAt: string; favorite?: boolean; days: WorkoutCardDay[] }>;
  pendingFavorites?: string[];
  onFavorite?: (kind: "routine" | "draft", id: string, favorite: boolean) => void;
  busy: boolean;
  message: string | null;
  notice: string | null;
  manualWorkspace: boolean;
  onOpenManual: () => void;
  onBack: () => void;
  onCreate: (source: "manual" | "copy" | "history", planId?: string) => void;
  onOpenDraft: (draftId: string) => void;
  onDelete: (kind: "draft" | "routine", id: string, name: string) => void;
  onGenerateAutomatic: () => void;
  onBrowseTemplates: () => void;
};

function formattedDate(value: string) {
  return new Date(value).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function DaySummaries({ days }: { days: WorkoutCardDay[] }) {
  if (!days.length) return <span className="mt-4 block text-xs text-[#526e69]">Días no disponibles.</span>;
  return <span className="mt-4 block space-y-2 border-t border-[#e2eeeb] pt-3">
    <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#526e69]">Sesiones · músculos principales</span>
    {days.map((day) => <span key={day.id} className="block break-words text-xs leading-5">
      <span className="font-semibold text-[#315d5a]">{day.name}: </span>
      <span className="text-[#526e69]">{day.exerciseCount === 0 ? "Sin ejercicios" : day.muscles.length ? day.muscles.join(" · ") : "Músculos principales sin identificar"}{day.muscles.length > 0 && day.incomplete ? " · Información muscular incompleta" : ""}</span>
    </span>)}
  </span>;
}

function RoutineMetrics({ days }: { days: WorkoutCardDay[] }) {
  const nonempty = days.filter((day) => day.exerciseCount > 0);
  const minutes = nonempty.length && nonempty.every((day) => day.estimatedMinutes !== null)
    ? Math.max(...nonempty.map((day) => day.estimatedMinutes!)) : null;
  return <>
    <span className="inline-flex items-center gap-1 rounded-full bg-[#eaf6f3] px-2.5 py-1"><Layers3 size={13} aria-hidden="true" /> {days.length} {days.length === 1 ? "día" : "días"}</span>
    <span className="inline-flex items-center gap-1 rounded-full bg-[#eff5f5] px-2.5 py-1"><Clock3 size={13} aria-hidden="true" /> {minutes === null ? "Tiempo no disponible" : `Hasta ${minutes} min aprox.`}</span>
  </>;
}

function RoutineCard({ name, date, days, status, busy, favorite, favoriteBusy, onFavorite, onOpen, onDelete }: {
  name: string; date: string; days: WorkoutCardDay[]; status: "active" | "saved" | "draft"; busy: boolean;
  favorite: boolean; favoriteBusy: boolean; onFavorite?: () => void; onOpen: () => void; onDelete?: () => void;
}) {
  return <article className="relative rounded-2xl border border-[#d5e6e2] bg-white p-4 focus-within:ring-2 focus-within:ring-[#75b6a9] motion-safe:transition-[transform,box-shadow,border-color] motion-safe:hover:-translate-y-0.5 hover:border-[#93c8bc] hover:shadow-[0_10px_25px_rgba(23,66,61,0.08)]">
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-wrap gap-2 text-xs font-semibold text-[#315e58]">
        <RoutineMetrics days={days} />
      </div>
      <div className="flex items-center gap-1">
        {onFavorite && <FavoriteButton name={name} favorite={favorite} disabled={favoriteBusy || busy} onClick={onFavorite} className="border-[#bddbd4] text-[#17655f] hover:bg-[#eaf7f4] focus-visible:outline-[#17655f]" />}
        {onDelete && <button type="button" onClick={onDelete} disabled={busy} aria-label={`Eliminar rutina ${name}`} className="relative z-10 rounded-lg p-2 text-[#a64e3c] hover:bg-[#fff1ef] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a64e3c] disabled:opacity-50"><Trash2 size={17} aria-hidden="true" /></button>}
      </div>
    </div>
    <button type="button" onClick={onOpen} disabled={busy} className="mt-3 w-full cursor-pointer text-left before:absolute before:inset-0 before:rounded-2xl focus-visible:outline-none disabled:cursor-default disabled:opacity-60">
      <span className="block break-words text-lg font-semibold">{name}</span>
      <span className="mt-1 block text-xs text-[#526e69]">Actualizada {formattedDate(date)}</span>
      <DaySummaries days={days} />
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#17655f]">Editar rutina <ArrowRight size={15} aria-hidden="true" /></span>
    </button>
    {status === "active" && <p className="mt-2 text-xs text-[#526e69]">Para eliminarla, primero activa otra rutina.</p>}
  </article>;
}

export function ManualWorkoutStart({ activeRoutine, routines, drafts, busy, message, notice, manualWorkspace, pendingFavorites = [], onFavorite, onOpenManual, onBack, onCreate, onOpenDraft, onDelete, onGenerateAutomatic, onBrowseTemplates }: Props) {
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const optionClass = "group flex min-h-60 flex-col rounded-[1.5rem] border border-[#d5e6e2] bg-white p-5 text-left shadow-[0_8px_24px_rgba(23,66,61,0.04)] transition-[border-color,box-shadow] hover:border-[#93c8bc] hover:shadow-[0_16px_34px_rgba(23,66,61,0.10)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f] motion-safe:transition-transform motion-safe:hover:-translate-y-1 disabled:cursor-default disabled:opacity-60";
  const manualItems = [
    ...routines.map((routine) => ({ kind: "routine" as const, ...routine })),
    ...drafts.map((draft) => ({ kind: "draft" as const, ...draft })),
  ].filter((item) => !favoritesOnly || item.favorite).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime() || a.name.localeCompare(b.name, "es"));
  return <main className="min-h-screen bg-[#f0f5f4] px-4 py-6 text-[#172d32] sm:px-8 sm:py-8">
    <div className="mx-auto max-w-6xl">
      {manualWorkspace ? <NavigationButton kind="back" onClick={onBack} disabled={busy} className="border-[#cfe0dd] bg-white text-[#315d5a] hover:border-[#bddbd4] hover:bg-[#e8f5f2] hover:text-[#17655f] focus-visible:outline-[#17655f]">Volver a gestionar rutinas</NavigationButton> : <NavigationLink href="/dashboard?tab=training" kind="dashboard" className="border-[#cfe0dd] bg-white text-[#315d5a] hover:border-[#bddbd4] hover:bg-[#e8f5f2] hover:text-[#17655f] focus-visible:outline-[#17655f]">Volver al dashboard</NavigationLink>}
      <header className="relative mt-5 overflow-hidden rounded-[2rem] p-6 text-white shadow-[0_20px_50px_rgba(16,54,58,0.16)] sm:p-9" style={{ background: pulsoTrainingBackground }}>
        <PulsoMotif />
        <div className="relative max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#a6eee0]"><Dumbbell size={16} aria-hidden="true" /> {manualWorkspace ? "Tu espacio personal" : "Tu entrenamiento"}</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">{manualWorkspace ? "Crea tu propia rutina." : "Gestiona tus rutinas."}</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-[#e2f0ed]">{manualWorkspace ? "Empieza desde cero o continúa con tus rutinas." : "Elige una propuesta, crea la tuya o deja que seleccionemos una para ti. Tu rutina actual no cambiará hasta activar otra."}</p>
        </div>
      </header>
      {busy && <p role="status" className="mt-5 flex items-center gap-2 text-sm text-[#526e69]"><LoaderCircle size={16} className="animate-spin" /> Procesando...</p>}
      {notice && <p role="status" className="mt-5 text-sm font-semibold text-[#17655f]">{notice}</p>}
      {message && <p role="alert" className="mt-5 text-sm font-semibold text-[#a64e3c]">{message}</p>}

      {!manualWorkspace ? <>
        <section aria-labelledby="start-routine-title" className="mt-8">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#39726e]">Tu siguiente paso</p><h2 id="start-routine-title" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Elige cómo empezar</h2><p className="mt-2 text-sm text-[#526e69]">Encuentra la forma de entrenar que encaja contigo.</p></div><span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#526e69]"><Check size={15} aria-hidden="true" /> A tu ritmo</span></div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <button type="button" onClick={onBrowseTemplates} disabled={busy} className={optionClass}>
              <span className="flex items-start justify-between gap-3"><span className="grid size-12 place-items-center rounded-2xl border border-[#c9e6df] bg-[#e6f6f1] text-[#17655f]"><BookOpen size={22} aria-hidden="true" /></span><span className="text-xs font-semibold tracking-[0.12em] text-[#758e89]">01</span></span>
              <span className="mt-5 block text-lg font-semibold tracking-[-0.02em]">Rutinas preparadas</span>
              <span className="mt-2 block text-sm leading-6 text-[#526e69]">Explora propuestas según días, nivel, lugar y material.</span>
              <span className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm font-semibold text-[#17655f]"><span>Ver biblioteca</span><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e8f6f2] group-hover:bg-[#d2eee6]"><ArrowRight size={17} aria-hidden="true" /></span></span>
            </button>
            <button type="button" onClick={onOpenManual} disabled={busy} className={optionClass}>
              <span className="flex items-start justify-between gap-3"><span className="grid size-12 place-items-center rounded-2xl border border-[#d4e5e9] bg-[#edf6f8] text-[#345f70]"><Dumbbell size={22} aria-hidden="true" /></span><span className="text-xs font-semibold tracking-[0.12em] text-[#758e89]">02</span></span>
              <span className="mt-5 block text-lg font-semibold tracking-[-0.02em]">Empezar desde cero</span>
              <span className="mt-2 block text-sm leading-6 text-[#526e69]">Crea y gestiona todas tus rutinas manuales.</span>
              <span className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm font-semibold text-[#17655f]"><span>Mis rutinas manuales</span><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e8f6f2] group-hover:bg-[#d2eee6]"><ArrowRight size={17} aria-hidden="true" /></span></span>
            </button>
            <button type="button" onClick={onGenerateAutomatic} disabled={busy} className={optionClass}>
              <span className="flex items-start justify-between gap-3"><span className="grid size-12 place-items-center rounded-2xl border border-[#d7e5df] bg-[#eef5ee] text-[#456d58]"><Sparkles size={22} aria-hidden="true" /></span><span className="text-xs font-semibold tracking-[0.12em] text-[#758e89]">03</span></span>
              <span className="mt-5 block text-lg font-semibold tracking-[-0.02em]">Seleccionar para mí</span>
              <span className="mt-2 block text-sm leading-6 text-[#526e69]">Prepara una rutina del catálogo según tu perfil.</span>
              <span className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm font-semibold text-[#17655f]"><span>Generar rutina automática</span><span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e8f6f2] group-hover:bg-[#d2eee6]"><ArrowRight size={17} aria-hidden="true" /></span></span>
            </button>
          </div>
        </section>
      </> : <>
        <section className="mt-6 flex flex-wrap items-center justify-between gap-5 rounded-[1.75rem] border border-[#cde4df] bg-white p-5 shadow-[0_12px_35px_rgba(23,66,61,0.05)] sm:p-6">
          <div><h2 className="text-xl font-semibold tracking-[-0.03em]">Una rutina a tu medida</h2><p className="mt-1 text-sm text-[#526e69]">Elige los días y ejercicios para crearla a tu ritmo.</p></div>
          <div className="flex flex-wrap gap-2">
            {activeRoutine && <button type="button" onClick={() => onCreate("copy")} disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#bddbd4] bg-white px-4 text-sm font-semibold text-[#17655f] hover:bg-[#eaf7f4] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f] disabled:opacity-50"><Copy size={16} aria-hidden="true" /> Copiar mi rutina actual</button>}
            <button type="button" onClick={() => onCreate("manual")} disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#145257] px-5 text-sm font-semibold text-white hover:bg-[#1b6a68] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f] disabled:opacity-50"><Plus size={17} aria-hidden="true" /> Crear rutina desde cero</button>
          </div>
        </section>
        <section className="mt-6 rounded-[1.75rem] border border-[#d5e6e2] bg-[#eaf6f3] p-5 sm:p-6" aria-labelledby="manual-routines-title">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="manual-routines-title" className="text-xl font-semibold">Mis rutinas manuales <span className="text-sm font-normal text-[#526e69]">· {manualItems.length}</span></h2>
            {onFavorite && <button type="button" aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly(!favoritesOnly)} className="min-h-11 rounded-full border border-[#bddbd4] bg-white px-4 text-sm font-semibold text-[#17655f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17655f]">{favoritesOnly ? "Ver todas" : "Solo favoritas"}</button>}</div>
          <p className="mt-1 text-sm leading-6 text-[#526e69]">Todas tus rutinas manuales, ordenadas por la última actualización.</p>
          {manualItems.length === 0 ? <p className="mt-4 rounded-2xl border border-dashed border-[#bddbd4] p-4 text-sm text-[#526e69]">{favoritesOnly ? "No tienes rutinas favoritas." : "Todavía no tienes rutinas manuales con ejercicios."}</p> : <div className="mt-4 grid gap-3 md:grid-cols-2">{manualItems.map((item) =>
            item.kind === "draft"
              ? <RoutineCard key={`draft-${item.id}`} name={item.name} date={item.updatedAt} days={item.days} status="draft" busy={busy} favorite={!!item.favorite} favoriteBusy={pendingFavorites.includes(`draft:${item.id}`)} onFavorite={onFavorite ? () => onFavorite("draft", item.id, !!item.favorite) : undefined} onOpen={() => onOpenDraft(item.id)} onDelete={() => onDelete("draft", item.id, item.name)} />
              : <RoutineCard key={`routine-${item.id}`} name={item.name} date={item.updatedAt} days={item.days} status={item.active ? "active" : "saved"} busy={busy} favorite={!!item.favorite} favoriteBusy={pendingFavorites.includes(`routine:${item.id}`)} onFavorite={onFavorite ? () => onFavorite("routine", item.id, !!item.favorite) : undefined} onOpen={() => onCreate(item.active ? "copy" : "history", item.active ? undefined : item.id)} onDelete={item.active ? undefined : () => onDelete("routine", item.id, item.name)} />
          )}</div>}
          <p className="mt-4 text-xs leading-5 text-[#526e69]">Al editar una rutina activada se crea una copia para conservar tu rutina actual y tu historial.</p>
        </section>
        <p className="mt-4 text-xs leading-5 text-[#526e69]">Los minutos son una estimación de fuerza; el cardio se suma aparte. Los cambios manuales no se comprueban automáticamente con tu perfil.</p>
      </>}
    </div>
  </main>;
}

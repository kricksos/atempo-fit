"use client";

import { NavigationButton } from "@/components/navigation-control";
import { ArrowDown, ArrowUp, Check, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { ManualWorkoutStart } from "@/components/manual-workout-start";
import { ExerciseCatalogSelector, ExerciseMuscleFilters, muscleSummary, type CatalogExercise } from "@/components/exercise-catalog-selector";
import { WorkoutTemplateLibrary, type TemplateOption } from "@/components/workout-template-library";
import { isTimedExercise } from "@/features/planning/movement-patterns";
import type { WorkoutCardDay } from "@/lib/workout-card-summary";

type DraftExercise = { exerciseId: string; sets: number; repetitions: string; restSeconds: number };
type DraftDay = { id?: string; name: string; exercises: DraftExercise[] };
type Draft = { id: string; name: string; source: "manual" | "copied"; days: DraftDay[] };
type Routine = { id: string; name: string; updatedAt: string; active: boolean; favorite?: boolean; days: WorkoutCardDay[] };
type SavedDraft = { id: string; name: string; updatedAt: string; favorite?: boolean; days: WorkoutCardDay[] };
type FavoriteKind = "exercise" | "template" | "routine" | "draft";
type Props = { catalog: CatalogExercise[]; exerciseDetails: CatalogExercise[]; templates: TemplateOption[]; activeRoutine: { name: string; automatic: boolean; days: WorkoutCardDay[] } | null; routines: Routine[]; drafts: SavedDraft[]; favoriteExerciseIds?: string[]; favoriteTemplateIds?: string[]; preview?: { draft: Draft; onExit: () => void } };

function defaultDay(index: number): DraftDay {
  return { name: `Día ${index + 1}`, exercises: [] };
}

function EditableName({ value, kind, editing, disabled, onBegin, onChange, onFinish, onCancel }: {
  value: string;
  kind: "routine" | "day";
  editing: boolean;
  disabled: boolean;
  onBegin: () => void;
  onChange: (value: string) => void;
  onFinish: () => void;
  onCancel: () => void;
}) {
  const editButton = useRef<HTMLButtonElement>(null);
  const label = kind === "routine" ? "Nombre de la rutina" : "Nombre del día";
  const valid = value.trim().length > 0;
  const returnFocus = () => requestAnimationFrame(() => editButton.current?.focus());

  if (editing) {
    return <form className="mt-3 max-w-xl rounded-2xl border border-[#a5b979] bg-[#f7faec] p-3" onSubmit={(event) => { event.preventDefault(); if (valid) { onFinish(); returnFocus(); } }}>
      <label className="block text-xs font-semibold text-[#52682f]">{`Editando ${label.toLocaleLowerCase("es")}`}
        <input autoFocus value={value} maxLength={80} aria-label={label} aria-invalid={!valid} onChange={(event) => onChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") { onCancel(); returnFocus(); } }} className="mt-2 block w-full min-w-0 rounded-xl border border-[#a5b979] bg-white px-3 py-2 text-base font-semibold text-[#18231f] outline-none focus-visible:ring-2 focus-visible:ring-[#72873f]" />
      </label>
      {!valid && <p className="mt-2 text-xs font-medium text-[#a64e3c]">El nombre no puede estar vacío.</p>}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="submit" disabled={!valid} className="rounded-full bg-[#18231f] px-4 py-2 text-xs font-semibold text-white disabled:opacity-40">Listo</button>
        <button type="button" onClick={() => { onCancel(); returnFocus(); }} className="rounded-full px-3 py-2 text-xs font-semibold text-[#526052] hover:bg-white">Cancelar</button>
        <span className="text-xs text-[#68736b]">Guarda el borrador para conservar el cambio.</span>
      </div>
    </form>;
  }

  return <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
    {kind === "routine" ? <h1 className="min-w-0 break-words text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{value || "Sin nombre"}</h1> : <h3 className="min-w-0 break-words text-2xl font-semibold">{value || "Sin nombre"}</h3>}
    <button ref={editButton} type="button" disabled={disabled} onClick={onBegin} aria-label={`Editar ${label.toLocaleLowerCase("es")}`} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border border-[#d3dbcf] bg-white px-3 text-xs font-semibold text-[#526052] hover:border-[#9aaa89] disabled:opacity-40"><Pencil size={14} aria-hidden="true" /> Editar</button>
  </div>;
}

export function ManualWorkoutBuilder({ catalog: previewCatalog, exerciseDetails, templates, activeRoutine, routines, drafts, favoriteExerciseIds = [], favoriteTemplateIds = [], preview }: Props) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(preview?.draft ?? null);
  const [savedDraft, setSavedDraft] = useState<string | null>(preview ? JSON.stringify(preview.draft) : null);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [busy, setBusy] = useState<"create" | "save" | "publish" | "delete" | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [removedDraftIds, setRemovedDraftIds] = useState<string[]>([]);
  const [removedRoutineIds, setRemovedRoutineIds] = useState<string[]>([]);
  const [muscleFilter, setMuscleFilter] = useState("all");
  const [editingName, setEditingName] = useState<{ kind: "routine" | "day"; original: string } | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [manualWorkspace, setManualWorkspace] = useState(false);
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => ({
    ...Object.fromEntries(favoriteExerciseIds.map((id) => [`exercise:${id}`, true])),
    ...Object.fromEntries(favoriteTemplateIds.map((id) => [`template:${id}`, true])),
  }));
  const [pendingFavorites, setPendingFavorites] = useState<string[]>([]);
  const pendingRef = useRef(new Set<string>());

  const activeDay = draft?.days[activeDayIndex];
  const catalog = [...previewCatalog, ...exerciseDetails];
  const isFavorite = (kind: FavoriteKind, id: string, initial = false) => favorites[`${kind}:${id}`] ?? initial;

  async function toggleFavorite(kind: FavoriteKind, id: string, current: boolean) {
    const key = `${kind}:${id}`;
    if (preview) {
      setFavorites((items) => ({ ...items, [key]: !current }));
      setMessage("Vista de demostración: los favoritos no se guardan.");
      return;
    }
    if (pendingRef.current.has(key)) return;
    pendingRef.current.add(key);
    setPendingFavorites((items) => [...items, key]);
    setMessage(null);
    try {
      const response = await fetch("/api/workouts/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, id, favorite: !current }) });
      const result: { error?: string; favorite?: boolean } = await response.json();
      if (!response.ok || result.favorite !== !current) throw new Error(result.error ?? "No hemos podido confirmar el cambio de favorito.");
      setFavorites((items) => ({ ...items, [key]: !current }));
    } catch (error) {
      setMessage(error instanceof Error && !(error instanceof TypeError) && !(error instanceof SyntaxError) ? error.message : "No hemos podido confirmar el cambio. Recarga la página para comprobarlo.");
    } finally {
      pendingRef.current.delete(key);
      setPendingFavorites((items) => items.filter((item) => item !== key));
    }
  }

  async function loadDraft(draftId: string) {
    const response = await fetch(`/api/workouts/manual/${draftId}`);
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error ?? "No hemos podido abrir el borrador.");
    const loaded: Draft = { ...result.draft, days: result.draft.days.length ? result.draft.days : [defaultDay(0)] };
    setDraft(loaded);
    setSavedDraft(JSON.stringify(loaded));
    setActiveDayIndex(0);
  }

  function canLeaveEditor() {
    return !draft || JSON.stringify(draft) === savedDraft || window.confirm("Tienes cambios sin guardar. Si sales ahora, se perderán. ¿Quieres salir de todos modos?");
  }

  function returnToRoutines() {
    if (!canLeaveEditor()) return;
    if (preview) { preview.onExit(); return; }
    setDraft(null);
    setSavedDraft(null);
    setEditingName(null);
    setMessage(null);
    setNotice(null);
    setMuscleFilter("all");
    setManualWorkspace(true);
    router.refresh();
  }

  function returnToDashboard() {
    if (canLeaveEditor()) router.push("/dashboard?tab=training");
  }

  async function openDraft(draftId: string) {
    setBusy("create");
    setMessage(null);
    setNotice(null);
    try {
      await loadDraft(draftId);
    } catch (error) {
      setMessage(error instanceof Error && !(error instanceof TypeError) ? error.message : "No hemos podido abrir el borrador. Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      setBusy(null);
    }
  }

  async function create(source: "manual" | "copy" | "history", planId?: string) {
    setBusy("create");
    setMessage(null);
    setNotice(null);
    try {
      const response = await fetch("/api/workouts/manual", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ source, planId }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setMessage(result.error ?? "No hemos podido crear el borrador."); return; }
      await loadDraft(result.draftId);
    } catch (error) {
      setMessage(error instanceof Error && !(error instanceof TypeError) ? error.message : "No hemos podido abrir el borrador. Comprueba tu conexión e inténtalo de nuevo.");
    } finally {
      setBusy(null);
    }
  }

  async function generateAutomatic() {
    if (activeRoutine && !window.confirm("Se generará y activará una nueva rutina automática, que sustituirá la rutina actual. ¿Quieres continuar?")) return;
    router.push("/workout/generate-automatic");
  }

  async function applyTemplate(templateId: string, action: "edit" | "activate") {
    const reviewToken = templates.find((option) => option.template.id === templateId)?.reviewToken;
    if (!reviewToken) { setMessage("No hemos podido comprobar la propuesta. Recarga la página y vuelve a intentarlo."); return; }
    if (action === "activate" && !window.confirm("Se activará esta rutina y dejará de estar activa la rutina actual. ¿Quieres continuar?")) return;
    setBusy("create");
    setMessage(null);
    try {
      const response = await fetch("/api/workouts/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ templateId, action, confirmActivation: action === "activate", reviewToken }) });
      const result: { error?: string; issues?: string[]; draftId?: string; published?: boolean } = await response.json();
      if (!response.ok) {
        setMessage([result.error ?? "No hemos podido preparar la rutina.", ...(result.issues ?? [])].join(" "));
        router.refresh();
        return;
      }
      if (action === "edit" && result.draftId) {
        await loadDraft(result.draftId);
        setShowTemplates(false);
      } else if (action === "activate" && result.published) {
        router.push("/dashboard?tab=training");
        router.refresh();
      } else {
        setMessage("No hemos podido confirmar el resultado. Comprueba tus rutinas y borradores.");
      }
    } catch (error) {
      setMessage(error instanceof Error && !(error instanceof TypeError) ? error.message : "No hemos podido confirmar el resultado. Comprueba tus rutinas y borradores antes de repetirlo.");
    } finally {
      setBusy(null);
    }
  }

  async function deleteItem(kind: "draft" | "routine", id: string, name: string) {
    const prompt = kind === "draft"
      ? `¿Eliminar el borrador «${name}»? Esta acción no se puede deshacer.`
      : `¿Eliminar «${name}» de tus rutinas? Se conservará tu historial de entrenamientos.`;
    if (!window.confirm(prompt)) return;
    setBusy("delete");
    setMessage(null);
    setNotice(null);
    try {
      const path = kind === "draft" ? `/api/workouts/manual/${id}` : `/api/workouts/manual/routines/${id}`;
      const response = await fetch(path, { method: "DELETE" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setMessage(result.error ?? "No hemos podido eliminar la rutina."); return; }
      if (kind === "draft") setRemovedDraftIds((current) => [...current, id]);
      else setRemovedRoutineIds((current) => [...current, id]);
      setNotice(kind === "draft" ? "Borrador eliminado." : "Rutina eliminada de la lista. Tu historial se conserva.");
      router.refresh();
    } catch {
      setMessage("No hemos podido confirmar la eliminación. Actualiza la pantalla para comprobarlo.");
    } finally {
      setBusy(null);
    }
  }

  function updateDay(nextDay: DraftDay) {
    if (!draft) return;
    setMessage(null);
    setDraft({ ...draft, days: draft.days.map((day, index) => index === activeDayIndex ? nextDay : day) });
  }

  function toggleExercise(exerciseId: string) {
    if (!activeDay) return;
    const existingIndex = activeDay.exercises.findIndex((exercise) => exercise.exerciseId === exerciseId);
    if (existingIndex !== -1) { removeExercise(existingIndex); return; }
    if (activeDay.exercises.length >= 12) {
      setMessage("Cada día admite hasta 12 ejercicios.");
      return;
    }
    const name = catalog.find((item) => item.id === exerciseId)?.name ?? "";
    updateDay({ ...activeDay, exercises: [...activeDay.exercises, { exerciseId, sets: 3, repetitions: isTimedExercise(name) ? "20-30 segundos" : "8-12", restSeconds: 90 }] });
  }

  function updateExercise(exerciseIndex: number, patch: Partial<DraftExercise>) {
    if (!activeDay) return;
    updateDay({ ...activeDay, exercises: activeDay.exercises.map((exercise, index) => index === exerciseIndex ? { ...exercise, ...patch } : exercise) });
  }

  function removeExercise(exerciseIndex: number) {
    if (!activeDay) return;
    updateDay({ ...activeDay, exercises: activeDay.exercises.filter((_, index) => index !== exerciseIndex) });
  }

  function moveExercise(exerciseIndex: number, direction: -1 | 1) {
    if (!activeDay) return;
    const target = exerciseIndex + direction;
    if (target < 0 || target >= activeDay.exercises.length) return;
    const exercises = [...activeDay.exercises];
    [exercises[exerciseIndex], exercises[target]] = [exercises[target], exercises[exerciseIndex]];
    updateDay({ ...activeDay, exercises });
  }

  function addDay() {
    if (!draft || draft.days.length >= 7) return;
    setMessage(null);
    if (editingName?.kind === "day") setEditingName(null);
    setDraft({ ...draft, days: [...draft.days, defaultDay(draft.days.length)] });
    setActiveDayIndex(draft.days.length);
  }

  function removeDay(index: number) {
    if (!draft || draft.days.length <= 1) return;
    const day = draft.days[index];
    if (day.exercises.length > 0 && !window.confirm(`¿Eliminar ${day.name} y sus ejercicios del borrador?`)) return;
    setMessage(null);
    if (index === activeDayIndex && editingName?.kind === "day") setEditingName(null);
    setDraft({ ...draft, days: draft.days.filter((_, dayIndex) => dayIndex !== index) });
    setActiveDayIndex((current) => current === index ? Math.min(index, draft.days.length - 2) : current > index ? current - 1 : current);
  }

  async function save() {
    if (preview) { setMessage("Vista de demostración: no se guardan ni activan rutinas."); return false; }
    if (!draft) return false;
    if (!draft.name.trim() || draft.days.some((day) => !day.name.trim())) {
      setMessage("Pon nombre a la rutina y a cada día antes de guardar.");
      return false;
    }
    if (draft.days.some((day) => day.exercises.length === 0)) {
      setMessage("Añade al menos un ejercicio a cada día antes de guardar o activar la rutina.");
      return false;
    }
    if (draft.days.some((day) => day.exercises.some((exercise) => !Number.isInteger(exercise.sets) || exercise.sets < 1 || exercise.sets > 20 || !exercise.repetitions.trim() || !Number.isInteger(exercise.restSeconds) || exercise.restSeconds < 0 || exercise.restSeconds > 900))) {
      setMessage("Revisa los ejercicios: indica 1-20 series, las repeticiones y un descanso de 0-900 segundos.");
      return false;
    }
    setEditingName(null);
    setBusy("save");
    setMessage(null);
    try {
      const response = await fetch(`/api/workouts/manual/${draft.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: draft.name, days: draft.days }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setMessage(result.error ?? "No hemos podido guardar la rutina."); return false; }
      setSavedDraft(JSON.stringify(draft));
      setMessage("Borrador guardado.");
      return true;
    } catch {
      setMessage("No hemos podido confirmar el guardado. Vuelve a abrir el borrador para comprobarlo.");
      return false;
    } finally {
      setBusy(null);
    }
  }

  async function publish() {
    if (!(await save()) || !draft) return;
    setBusy("publish");
    try {
      const response = await fetch(`/api/workouts/manual/${draft.id}/publish`, { method: "POST" });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) { setMessage(result.error ?? "No hemos podido activar la rutina."); return; }
      router.push("/dashboard?tab=training");
      router.refresh();
    } catch {
      setMessage("No hemos podido confirmar la activación. Comprueba tu rutina actual antes de intentarlo de nuevo.");
    } finally {
      setBusy(null);
    }
  }

  if (!draft && showTemplates) return <WorkoutTemplateLibrary options={templates} catalog={catalog} busy={busy !== null} message={message} favoriteIds={templates.map(({ template }) => template.id).filter((id) => isFavorite("template", id))} pendingFavorites={pendingFavorites} onFavorite={(id, current) => void toggleFavorite("template", id, current)} onBack={() => { setShowTemplates(false); setMessage(null); }} onUse={(id, action) => void applyTemplate(id, action)} onClearMessage={() => setMessage(null)} />;
  if (!draft) return <ManualWorkoutStart activeRoutine={activeRoutine} routines={routines.filter((item) => !removedRoutineIds.includes(item.id)).map((item) => ({ ...item, favorite: isFavorite("routine", item.id, item.favorite) }))} drafts={drafts.filter((item) => !removedDraftIds.includes(item.id)).map((item) => ({ ...item, favorite: isFavorite("draft", item.id, item.favorite) }))} pendingFavorites={pendingFavorites} onFavorite={(kind, id, current) => void toggleFavorite(kind, id, current)} busy={busy !== null} message={message} notice={notice} manualWorkspace={manualWorkspace} onOpenManual={() => { setMessage(null); setManualWorkspace(true); }} onBack={() => { setMessage(null); setManualWorkspace(false); }} onCreate={(source, planId) => void create(source, planId)} onOpenDraft={(draftId) => void openDraft(draftId)} onDelete={(kind, id, name) => void deleteItem(kind, id, name)} onGenerateAutomatic={() => void generateAutomatic()} onBrowseTemplates={() => { setMessage(null); setShowTemplates(true); }} />;

  return (
    <main className="app-canvas min-h-screen bg-[#f4f1e9] px-5 py-6 text-[#18231f] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <nav aria-label="Navegación del editor" className="mb-5 flex flex-wrap items-center gap-x-5 gap-y-3">
          <NavigationButton type="button" onClick={returnToRoutines} disabled={busy !== null} kind="back">Volver a mis rutinas</NavigationButton>
          {!preview && <NavigationButton type="button" onClick={returnToDashboard} disabled={busy !== null} kind="dashboard">Ir al dashboard</NavigationButton>}
        </nav>
        <header className="grid gap-5 rounded-3xl border border-[#cddbb9] bg-gradient-to-br from-[#eef5de] to-[#f8f9ef] p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-center">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#60703d]">Editor de rutina</p>
            <EditableName value={draft.name} kind="routine" editing={editingName?.kind === "routine"} disabled={editingName !== null} onBegin={() => setEditingName({ kind: "routine", original: draft.name })} onChange={(value) => { setMessage(null); setDraft({ ...draft, name: value }); }} onFinish={() => setEditingName(null)} onCancel={() => { if (editingName?.kind === "routine") { setMessage(null); setDraft({ ...draft, name: editingName.original }); } setEditingName(null); }} />
            <p className="mt-3 text-sm text-[#68736b]">Organiza tus días y elige los ejercicios de cada entrenamiento.</p>
          </div>
          <section aria-label="Guardar o activar rutina" className="rounded-2xl border border-[#cddbb9] bg-white/80 p-4">
            <p className="text-sm font-semibold">Tu borrador</p>
            <p className="mt-1 text-xs leading-5 text-[#68736b]">Guarda los cambios o activa esta rutina para que sea tu rutina actual.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => void save().then((saved) => { if (saved) router.refresh(); })} disabled={busy !== null} className="min-h-10 rounded-full border border-[#cfd7c8] bg-white px-4 py-2 text-sm font-semibold hover:border-[#9aaa89] disabled:opacity-50">{busy === "save" ? "Guardando..." : "Guardar borrador"}</button>
              <button type="button" onClick={() => void publish()} disabled={busy !== null} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#18231f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#33463d] disabled:opacity-50"><Check size={16} /> {busy === "publish" ? "Activando..." : "Activar rutina"}</button>
            </div>
          </section>
        </header>
        {preview && <p className="mt-4 text-sm font-semibold text-[#60703d]">Vista de demostración con datos ficticios. No se guardan ni activan rutinas.</p>}
        {message && <p role="status" className={`mt-4 text-sm font-semibold ${message === "Borrador guardado." || preview ? "text-[#60703d]" : "text-[#a64e3c]"}`}>{message}</p>}

        <div className="mt-8 grid items-start gap-5 lg:grid-cols-[minmax(330px,390px)_minmax(0,1fr)]">
          <section id="ejercicios-del-dia" aria-label="Días y ejercicios del entrenamiento" tabIndex={0} className="min-w-0 scroll-mt-4 rounded-2xl border border-[#cdded8] bg-[#edf4f1] p-5 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
            <div className="flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">Días de entrenamiento</h2><button type="button" onClick={addDay} disabled={draft.days.length >= 7} className="grid size-8 shrink-0 place-items-center rounded-full bg-[#18231f] text-white disabled:opacity-50" aria-label="Añadir día"><Plus size={16} /></button></div>
            <div className="mt-4 flex flex-wrap gap-2">{draft.days.map((day, index) => <div key={`${day.id ?? "new"}-${index}`} className={`flex min-w-0 max-w-full items-center rounded-xl border ${index === activeDayIndex ? "border-[#9dbb5c] bg-[#e7f5b4] text-[#3d4a24]" : "border-[#d2dfd8] bg-white/80 hover:bg-white"}`}><button type="button" aria-pressed={index === activeDayIndex} onClick={() => { if (index !== activeDayIndex && editingName?.kind === "day") setEditingName(null); setActiveDayIndex(index); }} className="min-w-0 flex-1 px-3 py-2 text-left text-sm font-semibold"><span className="block max-w-36 truncate">{day.name}</span><span className="mt-1 block text-xs font-normal text-[#68736b]">{day.exercises.length} {day.exercises.length === 1 ? "ejercicio" : "ejercicios"}</span></button>{draft.days.length > 1 && <button type="button" onClick={() => removeDay(index)} className="mr-1 rounded-lg p-2 text-[#a64e3c] hover:bg-white" aria-label={`Eliminar día ${day.name}`}><Trash2 size={16} /></button>}</div>)}</div>
            <div className="my-5 border-t border-[#dfe4d8]" />
            <div className="flex flex-wrap items-end justify-between gap-3"><div className="min-w-0"><h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-[#819078]">Ejercicios del día</h2><EditableName value={activeDay?.name ?? ""} kind="day" editing={editingName?.kind === "day"} disabled={editingName !== null || !activeDay} onBegin={() => activeDay && setEditingName({ kind: "day", original: activeDay.name })} onChange={(value) => activeDay && updateDay({ ...activeDay, name: value })} onFinish={() => setEditingName(null)} onCancel={() => { if (activeDay && editingName?.kind === "day") updateDay({ ...activeDay, name: editingName.original }); setEditingName(null); }} /></div><span className="text-sm text-[#68736b]">{activeDay?.exercises.length ?? 0} / 12 ejercicios</span></div>
            <a href="#catalogo-ejercicios" className="mt-4 inline-block text-sm font-semibold text-[#60703d] underline lg:hidden">Ir al catálogo de ejercicios</a>
            <div className="mt-6 space-y-3">{activeDay?.exercises.map((exercise, index) => {
              const detail = catalog.find((catalogExercise) => catalogExercise.id === exercise.exerciseId);
              const name = detail?.name ?? "Ejercicio";
              return <div key={exercise.exerciseId} className="rounded-xl border border-[#d5e0d5] bg-white/85 p-4">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-semibold">{index + 1}. {name}</p><p className="mt-1 text-xs text-[#819078]">{detail ? muscleSummary(detail) : ""}</p></div><div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => moveExercise(index, -1)} disabled={index === 0} className="rounded-lg p-2 text-[#526052] hover:bg-white disabled:opacity-30" aria-label={`Subir ${name}`}><ArrowUp size={18} /></button>
                  <button type="button" onClick={() => moveExercise(index, 1)} disabled={index === activeDay.exercises.length - 1} className="rounded-lg p-2 text-[#526052] hover:bg-white disabled:opacity-30" aria-label={`Bajar ${name}`}><ArrowDown size={18} /></button>
                  <button type="button" onClick={() => removeExercise(index)} className="rounded-lg p-2 text-[#a64e3c] hover:bg-white" aria-label={`Eliminar ${name}`}><Trash2 size={18} /></button>
                </div></div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <label className="text-xs text-[#68736b]">Series<input type="number" min="1" max="20" value={exercise.sets} onChange={(event) => updateExercise(index, { sets: Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-[#cfd7c8] bg-white px-2 py-2 text-sm text-[#18231f]" /></label>
                  <label className="text-xs text-[#68736b]">Repeticiones o segundos<input value={exercise.repetitions} maxLength={30} onChange={(event) => updateExercise(index, { repetitions: event.target.value })} className="mt-1 w-full rounded-lg border border-[#cfd7c8] bg-white px-2 py-2 text-sm text-[#18231f]" /></label>
                  <label className="text-xs text-[#68736b]">Descanso (s)<input type="number" min="0" max="900" value={exercise.restSeconds} onChange={(event) => updateExercise(index, { restSeconds: Number(event.target.value) })} className="mt-1 w-full rounded-lg border border-[#cfd7c8] bg-white px-2 py-2 text-sm text-[#18231f]" /></label>
                </div>
              </div>;
            })}{activeDay?.exercises.length === 0 && <p className="rounded-xl border border-dashed border-[#cfd7c8] p-5 text-sm leading-6 text-[#68736b]">Elige un grupo muscular y añade ejercicios desde el catálogo. Después podrás configurar aquí las series, repeticiones y descanso.</p>}</div>
          </section>

          <div className="min-w-0 space-y-5">
            <section aria-label="Filtros del catálogo" className="min-w-0 rounded-2xl border border-[#d0ddbd] bg-[#eef5de] p-4">
              <h2 className="text-sm font-semibold">Filtrar catálogo por músculo</h2>
              <p className="mt-1 text-xs text-[#68736b]">El filtro solo cambia los ejercicios que ves en el catálogo.</p>
              <div className="mt-3"><ExerciseMuscleFilters catalog={previewCatalog} filter={muscleFilter} onFilterChange={setMuscleFilter} /></div>
            </section>
            <ExerciseCatalogSelector catalog={previewCatalog} selectedIds={activeDay?.exercises.map((exercise) => exercise.exerciseId) ?? []} onToggle={toggleExercise} externalFilter={muscleFilter} editorMode layout="grid" limitReached={(activeDay?.exercises.length ?? 0) >= 12} favoriteIds={previewCatalog.map((item) => item.id).filter((id) => isFavorite("exercise", id))} pendingFavorites={pendingFavorites} onFavorite={(id, current) => void toggleFavorite("exercise", id, current)} />
          </div>
        </div>
      </div>
    </main>
  );
}

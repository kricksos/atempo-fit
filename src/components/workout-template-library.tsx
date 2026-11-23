"use client";

import { ArrowRight, CheckCircle2, ChevronDown, Clock3, Dumbbell, House, Layers3 } from "lucide-react";
import { useState } from "react";

import type { CatalogExercise } from "@/components/exercise-catalog-selector";
import { FavoriteButton } from "@/components/favorite-button";
import { NavigationButton } from "@/components/navigation-control";
import { muscleGroupLabels } from "@/lib/exercise-muscles";
import type { WorkoutTemplate } from "@/lib/workout-templates";

export type TemplateOption = { template: WorkoutTemplate; issues: string[]; warnings?: string[]; reviewToken?: string };
const levelLabels: Record<WorkoutTemplate["level"], string> = { beginner: "Principiante", intermediate: "Intermedio", advanced: "Avanzado" };

export function WorkoutTemplateLibrary({ options, catalog, busy, message, favoriteIds = [], pendingFavorites = [], onFavorite, onBack, onUse, onClearMessage }: {
  options: TemplateOption[];
  catalog: CatalogExercise[];
  busy: boolean;
  message: string | null;
  favoriteIds?: string[];
  pendingFavorites?: string[];
  onFavorite?: (id: string, favorite: boolean) => void;
  onBack: () => void;
  onUse: (id: string, action: "edit" | "activate") => void;
  onClearMessage: () => void;
}) {
  const [place, setPlace] = useState("all");
  const [level, setLevel] = useState("all");
  const [days, setDays] = useState("all");
  const [equipment, setEquipment] = useState("all");
  const [duration, setDuration] = useState("all");
  const [origin, setOrigin] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [openLevels, setOpenLevels] = useState<Record<string, boolean>>({});
  const selectedOption = options.find((option) => option.template.id === selected);
  const byName = new Map(catalog.map((item) => [item.name, item]));
  const filtered = options.filter(({ template }) =>
    (!favoritesOnly || favoriteIds.includes(template.id)) &&
    (place === "all" || template.place === place) &&
    (level === "all" || template.level === level) &&
    (days === "all" || template.days.length === Number(days)) &&
    (origin === "all" || template.variant === origin) &&
    (equipment === "all" || template.days.some((day) => day.exercises.some((item) => byName.get(item.name)?.equipment.includes(equipment)))) &&
    (duration === "all" || template.minutes <= Number(duration)));
  const groups = (["Casa", "Gimnasio"] as const).map((location) => ({
    location,
    levels: (["beginner", "intermediate", "advanced"] as const).map((difficulty) => ({
      difficulty,
      routines: filtered.filter(({ template }) => template.place === location && template.level === difficulty)
        .sort((a, b) => a.template.days.length - b.template.days.length || a.template.name.localeCompare(b.template.name, "es")),
    })).filter((group) => group.routines.length),
  })).filter((group) => group.levels.length);
  const labels = (names: string[]) => muscleGroupLabels(names.map((name) => byName.get(name)?.primaryMuscle).filter((value): value is string => Boolean(value))).join(" · ");
  const selectClass = "mt-2 w-full min-h-11 rounded-xl border border-[#d4dfd1] bg-white px-3 text-sm text-[#18231f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#72873f]";
  const filtersActive = favoritesOnly || [place, level, days, equipment, duration, origin].some((value) => value !== "all");
  const updateFilter = (setValue: (value: string) => void, value: string) => {
    setValue(value);
    setOpenLevels({});
  };

  return <main className="app-canvas min-h-screen bg-[#f4f3ec] px-4 py-6 text-[#18231f] sm:px-8 sm:py-8">
    <div className="mx-auto max-w-6xl">
      <NavigationButton kind="back" onClick={selected ? () => { setSelected(null); onClearMessage(); } : onBack} disabled={busy}>{selected ? "Volver al catálogo" : "Volver a gestionar rutinas"}</NavigationButton>
      <header className="app-hero relative mt-6 overflow-hidden rounded-[2rem] bg-[#1d3028] p-6 text-white sm:p-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-20 size-64 rounded-full border-[38px] border-[#d5f17b]/10" />
        <div className="relative max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#c8e58a]">Biblioteca de rutinas</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{selectedOption ? selectedOption.template.name : "Encuentra tu forma de entrenar"}</h1>
          <p className="mt-4 text-sm leading-6 text-[#d2dfd4]">Rutinas organizadas para casa y gimnasio. Explora sus ejercicios y elige una opción que encaje contigo.</p>
        </div>
      </header>
      <p className="mt-4 text-xs leading-5 text-[#68736b]">Catálogo pendiente de revisión profesional: incluye propuestas propias y adaptaciones de estudios. No son programas reproducidos íntegramente ni están personalizados clínicamente. Consulta a un profesional si tienes lesiones o dudas.</p>
      {message && <p role="alert" className="mt-4 rounded-xl bg-[#fff1ef] p-4 text-sm font-semibold text-[#a64e3c]">{message}</p>}
      {selectedOption ? <section className="mt-6" aria-labelledby="template-details">
        <div className="rounded-3xl border border-[#d8e1d3] bg-white p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#748b53]">Tu plan, paso a paso</p>
              <h2 id="template-details" className="mt-2 text-2xl font-semibold">Detalle de la rutina</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68736b]">{selectedOption.template.description}</p>
            </div>
            <span className="rounded-full bg-[#edf6da] px-4 py-2 text-sm font-semibold text-[#52682f]">{levelLabels[selectedOption.template.level]}</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-[#526052]">
            <span className="rounded-full bg-[#f1f5ed] px-3 py-2">{selectedOption.template.place}</span>
            <span className="rounded-full bg-[#f1f5ed] px-3 py-2">{selectedOption.template.days.length} días</span>
            <span className="rounded-full bg-[#f1f5ed] px-3 py-2">{selectedOption.template.minutes} min de fuerza estimados</span>
          </div>
          <p className="mt-4 text-sm text-[#68736b]">Material habitual: {selectedOption.template.equipment}. La duración puede quedarse corta, especialmente con ejercicios por lado, calentamientos específicos o esperas de material. El cardio se suma aparte.</p>
          {selectedOption.template.evidence ? <div className="mt-5 rounded-2xl border border-[#d5e4bd] bg-[#f5faea] p-4 text-sm leading-6 text-[#52633c]">
            <p className="font-semibold">Adaptación de un estudio, no reproducción exacta</p>
            <p className="mt-2">{selectedOption.template.evidence.attribution} <a className="underline" href={selectedOption.template.evidence.url} target="_blank" rel="noreferrer">Estudio original</a> · <a className="underline" href={selectedOption.template.evidence.licenseUrl} target="_blank" rel="noreferrer">Licencia CC BY 4.0</a></p>
            <p className="mt-3 font-semibold">Cambios respecto al protocolo</p>
            <ul className="list-disc pl-5">{selectedOption.template.evidence.differences.map((difference) => <li key={difference}>{difference}</li>)}</ul>
            {selectedOption.template.evidence.guidance.map((item) => <p className="mt-2" key={item}>{item}</p>)}
          </div> : <p className="mt-4 text-sm text-[#805321]">Propuesta propia pendiente de revisión profesional; no reproduce un programa publicado.</p>}
          <div className="mt-6 grid gap-3 md:grid-cols-2">{selectedOption.template.days.map((day, index) => <article key={index} className="rounded-2xl border border-[#e1e9dc] bg-[#f8faf5] p-4 sm:p-5">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#839675]">Sesión {index + 1}</p>
            <h3 className="mt-1 text-lg font-semibold">{day.name}</h3>
            <p className="mt-1 text-xs leading-5 text-[#68736b]">{labels(day.exercises.map((item) => item.name)) || "Revisa la disponibilidad de ejercicios"}</p>
            <ul className="mt-4 space-y-3">{day.exercises.map((item, itemIndex) => <li key={`${item.name}-${itemIndex}`} className="flex items-start gap-3 text-sm">
              <span aria-hidden="true" className="mt-1 size-1.5 shrink-0 rounded-full bg-[#99b869]" />
              <span><span className="font-medium">{item.name}</span><span className="mt-0.5 block text-xs text-[#68736b]">{item.sets} series · {item.repetitions} · {item.restSeconds} s descanso</span></span>
            </li>)}</ul>
          </article>)}</div>
          {selectedOption.warnings?.length ? <div role="status" className="mt-5 rounded-2xl border border-[#d5e4bd] bg-[#f5faea] p-4 text-sm text-[#52633c]">
            <p className="font-semibold">Ten en cuenta</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">{selectedOption.warnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
            {selectedOption.template.level === "advanced" && <a href="/checkin?mode=workout" className="mt-3 inline-block font-semibold underline">Revisar mi perfil de entrenamiento</a>}
          </div> : null}
          {selectedOption.issues.length ? <div role="status" className="mt-5 rounded-2xl border border-[#e1c39d] bg-[#fff8ed] p-4 text-sm text-[#805321]">
            <p className="font-semibold">Revisa la compatibilidad antes de continuar</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">{selectedOption.issues.map((issue) => <li key={issue}>{issue}</li>)}</ul>
            <a href="/checkin?mode=workout" className="mt-3 inline-block font-semibold underline">Revisar mi perfil de entrenamiento</a>
          </div> : <p className="mt-5 flex items-start gap-2 text-sm font-semibold text-[#52682f]"><CheckCircle2 size={17} className="mt-0.5 shrink-0" /> {selectedOption.warnings?.length ? "Puedes continuar tras revisar los avisos; esto no garantiza que la rutina sea adecuada para ti." : "Coincide con los datos disponibles de tu perfil; esto no garantiza que sea adecuada para ti."}</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" disabled={busy || selectedOption.issues.length > 0} onClick={() => onUse(selectedOption.template.id, "activate")} className="min-h-11 rounded-full bg-[#1d3028] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#395440] disabled:cursor-not-allowed disabled:opacity-40">Activar esta rutina</button>
            <button type="button" disabled={busy || selectedOption.issues.length > 0} onClick={() => onUse(selectedOption.template.id, "edit")} className="min-h-11 rounded-full border border-[#9aaa89] bg-white px-5 py-3 text-sm font-semibold transition-colors hover:bg-[#f1f6e8] disabled:cursor-not-allowed disabled:opacity-40">Personalizar una copia</button>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#68736b]">Al activar se sustituirá la rutina actual. Si personalizas la copia, los cambios manuales no se comprueban automáticamente con tu perfil.</p>
        </div>
      </section> : <>
        <section aria-label="Filtros de rutinas" className="mt-6 rounded-3xl border border-[#d9e3d5] bg-white p-5 shadow-[0_8px_30px_rgba(29,48,40,0.04)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><h2 className="font-semibold">Encuentra tu rutina</h2><p className="mt-1 text-xs text-[#68736b]">Filtra por tu disponibilidad y experiencia.</p></div>
            <div className="flex items-center gap-2">{onFavorite && <button type="button" aria-pressed={favoritesOnly} onClick={() => { setFavoritesOnly(!favoritesOnly); setOpenLevels({}); }} className="min-h-11 rounded-full border border-[#a5b979] bg-white px-4 text-sm font-semibold text-[#52682f]">{favoritesOnly ? "Ver todas" : "Solo favoritas"}</button>}<span className="rounded-full bg-[#eaf4d6] px-3 py-1.5 text-xs font-semibold text-[#52682f]">{filtered.length} {filtered.length === 1 ? "rutina" : "rutinas"}</span></div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-xs font-semibold text-[#526052]">Lugar<select className={selectClass} value={place} onChange={(event) => updateFilter(setPlace, event.target.value)}><option value="all">Todos</option><option>Casa</option><option>Gimnasio</option></select></label>
            <label className="text-xs font-semibold text-[#526052]">Nivel<select className={selectClass} value={level} onChange={(event) => updateFilter(setLevel, event.target.value)}><option value="all">Todos</option><option value="beginner">Principiante</option><option value="intermediate">Intermedio</option><option value="advanced">Avanzado</option></select></label>
            <label className="text-xs font-semibold text-[#526052]">Días<select className={selectClass} value={days} onChange={(event) => updateFilter(setDays, event.target.value)}><option value="all">Todos</option>{[...new Set(options.map(({ template }) => template.days.length))].sort().map((count) => <option key={count} value={count}>{count} días</option>)}</select></label>
            <label className="text-xs font-semibold text-[#526052]">Incluye material<select className={selectClass} value={equipment} onChange={(event) => updateFilter(setEquipment, event.target.value)}><option value="all">Todos</option><option value="dumbbell">Mancuernas</option><option value="resistance_band">Bandas</option><option value="backpack">Mochila</option><option value="cable_machine">Poleas</option></select></label>
            <label className="text-xs font-semibold text-[#526052]">Duración estimada<select className={selectClass} value={duration} onChange={(event) => updateFilter(setDuration, event.target.value)}><option value="all">Todas</option><option value="30">Hasta 30 min estimados</option><option value="45">Hasta 45 min estimados</option><option value="60">Hasta 60 min estimados</option><option value="75">Hasta 75 min estimados</option><option value="90">Hasta 90 min estimados</option></select></label>
            <label className="text-xs font-semibold text-[#526052]">Procedencia<select className={selectClass} value={origin} onChange={(event) => updateFilter(setOrigin, event.target.value)}><option value="all">Todas</option><option value="study">Adaptaciones de estudios</option><option value="base">Propuestas propias</option></select></label>
          </div>
          <p className="mt-3 text-xs leading-5 text-[#68736b]">El material y las restricciones se comprueban con tu perfil al revisar cada rutina. La duración es una estimación, no un límite garantizado. {!options.some(({ template }) => template.level === "advanced") && "Todavía no hay rutinas clasificadas como avanzadas en la biblioteca."}</p>
        </section>
        <p role="status" className="sr-only">{filtered.length} {filtered.length === 1 ? "rutina encontrada" : "rutinas encontradas"}</p>
        {groups.length ? <div className="mt-6 space-y-5">{groups.map(({ location, levels }) => {
          const Icon = location === "Casa" ? House : Dumbbell;
          return <section key={location} className={`rounded-3xl border p-5 sm:p-6 ${location === "Casa" ? "border-[#d7e6c6] bg-[#eff6e7]" : "border-[#cee1dc] bg-[#edf5f2]"}`}>
            <div className="flex items-center gap-3">
              <span className={`grid size-12 shrink-0 place-items-center rounded-2xl ${location === "Casa" ? "bg-[#dff09c] text-[#52682f]" : "bg-[#d4e9e1] text-[#365e50]"}`}><Icon size={22} aria-hidden="true" /></span>
              <div><h2 className="text-xl font-semibold">{location === "Casa" ? "Entrenar en casa" : "Entrenar en gimnasio"}</h2><p className="mt-1 text-sm text-[#68736b]">Opciones organizadas por nivel y días.</p></div>
            </div>
            <div className="mt-5 space-y-3">{levels.map(({ difficulty, routines }) => {
              const id = `${location}-${difficulty}`;
              const isOpen = openLevels[id] ?? (filtersActive || id === "Casa-beginner");
              return <section key={id}>
                <h3><button type="button" aria-expanded={isOpen} aria-controls={`${id}-content`} onClick={() => setOpenLevels((current) => ({ ...current, [id]: !isOpen }))} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl border border-[#dce6d9] bg-white/80 px-4 text-left text-sm font-semibold text-[#526052] transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#72873f]">
                  <span>{levelLabels[difficulty]} <span className="ml-1 font-normal text-[#68736b]">· {routines.length} {routines.length === 1 ? "rutina" : "rutinas"}</span></span>
                  <ChevronDown size={18} aria-hidden="true" className={`shrink-0 motion-safe:transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button></h3>
                <div id={`${id}-content`} hidden={!isOpen} className="mt-3 grid gap-3 md:grid-cols-2">{routines.map(({ template, issues, warnings }) => <article key={template.id} className="relative rounded-2xl border border-[#e0e9dc] bg-white p-4 focus-within:ring-2 focus-within:ring-[#91a75e] motion-safe:transition-[transform,box-shadow,border-color] motion-safe:hover:-translate-y-0.5 hover:border-[#91a75e] hover:shadow-[0_10px_25px_rgba(35,50,31,0.08)]">
                  {onFavorite && <div className="absolute right-4 top-4 z-10"><FavoriteButton name={template.name} favorite={favoriteIds.includes(template.id)} disabled={busy || pendingFavorites.includes(`template:${template.id}`)} onClick={() => onFavorite(template.id, favoriteIds.includes(template.id))} /></div>}
                  <button type="button" onClick={() => { onClearMessage(); setSelected(template.id); }} className="group w-full pr-12 text-left before:absolute before:inset-0 before:rounded-2xl focus-visible:outline-none">
                  <span className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#536d40]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#edf5e0] px-2.5 py-1"><Layers3 size={13} /> {template.days.length} días</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f2f5ef] px-2.5 py-1"><Clock3 size={13} /> {template.minutes} min aprox.</span>
                  </span>
                  <span className="mt-3 block text-lg font-semibold">{template.name}</span>
                  <span className="mt-1 block text-xs font-semibold text-[#748b53]">{template.evidence ? "Adaptación de estudio" : "Propuesta propia"}</span>
                  <span className="mt-1 block text-sm leading-6 text-[#68736b]">{template.description}</span>
                  <span className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#edf1ea] pt-3">
                    <span className={`text-xs font-semibold ${issues.length || warnings?.length ? "text-[#805321]" : "text-[#52682f]"}`}>{issues.length ? "Revisar compatibilidad" : warnings?.length ? "Disponible · revisa los avisos" : "Compatible con tu perfil"}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#60703d]">Ver rutina <ArrowRight size={15} aria-hidden="true" className="motion-safe:transition-transform group-hover:translate-x-1" /></span>
                  </span>
                </button></article>)}</div>
              </section>;
            })}</div>
          </section>;
        })}</div> : <p className="mt-6 rounded-2xl border border-dashed border-[#cfd7c8] p-5 text-sm text-[#68736b]">No hay rutinas con estos filtros. Prueba otra combinación.</p>}
      </>}
    </div>
  </main>;
}

"use client";

import Image from "next/image";
import { Check, Dumbbell, Plus, Search } from "lucide-react";
import { useState } from "react";
import { equipmentOptions } from "@/lib/exercise-equipment";
import { muscleGroupLabels, muscleGroups, muscleLabels } from "@/lib/exercise-muscles";
import { FavoriteButton } from "@/components/favorite-button";

export type CatalogExercise = {
  id: string;
  name: string;
  primaryMuscle: string | null;
  muscleGroups: string[];
  difficulty: string;
  equipment: string[];
  image: string | null;
  imageEnd?: string | null;
  imageBackground?: "dark";
  imageScale?: number;
  lazyFrames?: boolean;
  illustration?: boolean;
  available?: boolean;
  trialNote?: string;
};

const filterColors: Record<string, { chip: string; dot: string }> = {
  all: { chip: "border-[#b6c77b] bg-[#f2facd] text-[#3d4a24]", dot: "bg-[#72873f]" },
  pectorals: { chip: "border-[#efb1aa] bg-[#fff1ef] text-[#913c37]", dot: "bg-[#d65f56]" },
  lats: { chip: "border-[#abc2f4] bg-[#eef4ff] text-[#31588f]", dot: "bg-[#5b8def]" },
  deltoids: { chip: "border-[#d0b9eb] bg-[#f6f0fc] text-[#694395]", dot: "bg-[#a879df]" },
  biceps: { chip: "border-[#efc89d] bg-[#fff7ed] text-[#88501c]", dot: "bg-[#d88537]" },
  triceps: { chip: "border-[#e6aed3] bg-[#fff0f8] text-[#873c6c]", dot: "bg-[#cb5fa5]" },
  quadriceps: { chip: "border-[#a9d5bb] bg-[#effaf3] text-[#286743]", dot: "bg-[#55a878]" },
  hamstrings: { chip: "border-[#9fd4d8] bg-[#eefbfc] text-[#1d6971]", dot: "bg-[#2e9eaa]" },
  glutes: { chip: "border-[#e9b3c2] bg-[#fff1f5] text-[#8e3f59]", dot: "bg-[#d87592]" },
  adductors: { chip: "border-[#cbd59e] bg-[#f7fae9] text-[#58652a]", dot: "bg-[#8e9d55]" },
  calves: { chip: "border-[#e1c39d] bg-[#fff8ed] text-[#805321]", dot: "bg-[#c48b4a]" },
  lower_back: { chip: "border-[#b8c1cd] bg-[#f1f4f7] text-[#475569]", dot: "bg-[#64748b]" },
  core: { chip: "border-[#e5d39a] bg-[#fffbea] text-[#79601c]", dot: "bg-[#b38d2d]" },
  other: { chip: "border-[#d3dbcf] bg-white text-[#526052]", dot: "bg-[#819078]" },
};

const equipmentLabels: Record<string, string> = {
  ...Object.fromEntries(equipmentOptions.map((option) => [option.value, option.label])),
  barbell: "Barra",
  bench: "Banco",
  cable: "Polea",
  cable_machine: "Polea",
  dumbbell: "Mancuernas",
  exercise_ball: "Pelota de ejercicio",
  ez_bar: "Barra Z",
  foam_roll: "Rodillo de espuma",
  gym_mat: "Esterilla",
  incline_bench: "Banco inclinado",
  kettlebell: "Pesa rusa",
  machine: "Máquina",
  "none_(bodyweight_exercise)": "Peso corporal",
  parallel_bars: "Barras paralelas",
  preacher_bench: "Banco predicador",
  "pull-up_bar": "Barra de dominadas",
  pull_up_bar: "Barra de dominadas",
  rack: "Soporte para barra",
  resistance_band: "Banda elástica",
  smith_machine: "Máquina Smith",
};

function equipmentSummary(equipment: string[]) {
  if (equipment.length === 0) return "Sin material";
  return equipment.map((item) => equipmentLabels[item.toLowerCase()] ?? item.replaceAll("_", " ")).join(" · ");
}

export function muscleSummary(exercise: CatalogExercise) {
  return muscleGroupLabels(exercise.muscleGroups).join(" · ");
}

function isKnownMuscle(muscle: string | null) {
  return muscleGroups.some((group) => group.value === muscle);
}

function normalizeSearch(value: string) {
  return value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function ExerciseImage({ exercise }: { exercise: CatalogExercise }) {
  const [failed, setFailed] = useState(false);
  const [endFailed, setEndFailed] = useState(false);

  if (!exercise.image || failed) {
    return <span className="flex h-full flex-col items-center justify-center gap-2 text-[#819078]"><Dumbbell size={28} aria-hidden="true" /><span className="text-center text-[11px] font-medium">Imagen no disponible</span></span>;
  }

  const imageClass = `object-contain ${exercise.imageBackground === "dark" ? "" : "p-2"}`;
  const imageStyle = exercise.imageScale ? { transform: `scale(${exercise.imageScale})` } : undefined;
  return <>
    <Image src={exercise.image} alt="" fill sizes="(max-width: 1023px) calc(100vw - 72px), 300px" unoptimized loading={exercise.lazyFrames ? "lazy" : exercise.imageScale ? "eager" : "lazy"} style={imageStyle} className={imageClass} onError={() => setFailed(true)} />
    {exercise.imageEnd && !endFailed && <Image src={exercise.imageEnd} alt="" fill sizes="(max-width: 1023px) calc(100vw - 72px), 300px" unoptimized loading={exercise.lazyFrames ? "lazy" : "eager"} style={imageStyle} className={`exercise-motion-frame ${imageClass}`} onError={() => setEndFailed(true)} />}
    {endFailed && <span className="absolute bottom-2 left-2 rounded-md bg-[#18231f] px-2 py-1 text-[11px] text-white">Movimiento no disponible</span>}
  </>;
}

type Props = {
  catalog: CatalogExercise[];
  selectedIds: string[];
  onToggle: (exerciseId: string) => void;
  externalFilter?: string;
  editorMode?: boolean;
  limitReached?: boolean;
  layout?: "list" | "grid";
  favoriteIds?: string[];
  pendingFavorites?: string[];
  onFavorite?: (id: string, favorite: boolean) => void;
};

export function ExerciseMuscleFilters({ catalog, filter, onFilterChange }: { catalog: CatalogExercise[]; filter: string; onFilterChange: (filter: string) => void }) {
  const hasOther = catalog.some((exercise) => !isKnownMuscle(exercise.primaryMuscle));
  const filters = [{ value: "all", label: "Todos" }, ...muscleGroups, ...(hasOther ? [{ value: "other", label: "Otros" }] : [])];

  return (
    <div role="group" aria-label="Filtrar catálogo por músculo" className="flex gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0">
      {filters.map((item) => {
        const color = filterColors[item.value];
        const selected = filter === item.value;
        return <button key={item.value} type="button" aria-pressed={selected} onClick={() => onFilterChange(item.value)} className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#72873f] ${color.chip} ${selected ? "ring-2 ring-current ring-offset-2 ring-offset-[#f8f7f1]" : "hover:brightness-95"}`}><span aria-hidden="true" className={`size-2 rounded-full ${color.dot}`} />{item.label}</button>;
      })}
    </div>
  );
}

export function ExerciseCatalogSelector({ catalog, selectedIds, onToggle, externalFilter, editorMode = false, limitReached = false, layout = "list", favoriteIds = [], pendingFavorites = [], onFavorite }: Props) {
  const [localFilter, setLocalFilter] = useState("all");
  const filter = externalFilter ?? localFilter;
  const [search, setSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const query = normalizeSearch(search);
  const pendingCount = catalog.filter((exercise) => exercise.available === false).length;
  const filtered = catalog.filter((exercise) => {
    const matchesMuscle = filter === "all" || (filter === "other" ? !isKnownMuscle(exercise.primaryMuscle) : exercise.primaryMuscle === filter);
    return matchesMuscle && (!favoritesOnly || favoriteIds.includes(exercise.id)) && normalizeSearch(exercise.name).includes(query);
  });
  const groups = [
    ...muscleGroups.map((group) => ({ ...group, exercises: filtered.filter((exercise) => exercise.primaryMuscle === group.value) })),
    { value: "other", label: "Otros", exercises: filtered.filter((exercise) => !isKnownMuscle(exercise.primaryMuscle)) },
  ].filter((group) => group.exercises.length > 0);
  return (
    <aside id={editorMode ? "catalogo-ejercicios" : undefined} className="min-w-0 scroll-mt-4 rounded-2xl border border-[#d2dec9] bg-[#f3f7ed] p-4">
      <div className="flex items-start justify-between gap-3">
        <div><h2 className="text-sm font-semibold">{editorMode ? "Catálogo de ejercicios" : "Añadir ejercicios"}</h2><p className="mt-1 text-xs text-[#68736b]">Pulsa un ejercicio para añadirlo o quitarlo del día.</p></div>
        <span className="rounded-full bg-[#e7f5b4] px-2.5 py-1 text-xs font-semibold text-[#3d4a24]">{selectedIds.length} {selectedIds.length === 1 ? "añadido" : "añadidos"}</span>
      </div>
      {editorMode && <a href="#ejercicios-del-dia" className="mt-3 inline-block text-xs font-semibold text-[#60703d] underline lg:hidden">Ver ejercicios del día ({selectedIds.length})</a>}
      {limitReached && <p role="status" className="mt-3 text-xs leading-5 text-[#805321]">Has alcanzado el límite de 12 ejercicios para este día. Elimina uno para añadir otro.</p>}
      {catalog.some((exercise) => exercise.illustration) && <p className="mt-3 text-xs leading-5 text-[#68736b]">Ilustraciones orientativas generadas con IA; no sustituyen una guía profesional de técnica.</p>}
      {pendingCount > 0 && <p className="mt-2 text-xs leading-5 text-[#805321]">{pendingCount} {pendingCount === 1 ? "ejercicio pendiente" : "ejercicios pendientes"} de activación en la base de datos.</p>}
      <label className="mt-4 flex min-h-11 items-center gap-2 rounded-xl border border-[#cfd7c8] bg-white px-3 text-sm text-[#68736b]">
        <Search size={16} aria-hidden="true" />
        <input aria-label="Buscar ejercicio" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar ejercicio" className="w-full bg-transparent outline-none" />
      </label>
      {onFavorite && <button type="button" aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly(!favoritesOnly)} className="mt-3 min-h-11 rounded-full border border-[#a5b979] bg-white px-4 text-sm font-semibold text-[#52682f]">{favoritesOnly ? "Ver todos" : "Solo favoritos"}</button>}
      {externalFilter === undefined && <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#68736b]">Músculos</p>
        <ExerciseMuscleFilters catalog={catalog} filter={filter} onFilterChange={setLocalFilter} />
      </div>}
      <p className="mt-2 text-xs text-[#68736b]" aria-live="polite">{filtered.length} {filtered.length === 1 ? "ejercicio encontrado" : "ejercicios encontrados"}</p>
      <div className="mt-4 max-h-[65vh] space-y-5 overflow-y-auto overscroll-contain pr-1 lg:max-h-[650px]">
        {groups.map((group) => (
          <section key={group.value}>
            <h3 className="mb-2 flex items-center justify-between gap-2 text-xs font-semibold"><span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 ${filterColors[group.value].chip}`}><span aria-hidden="true" className={`size-2 rounded-full ${filterColors[group.value].dot}`} />{group.label}</span><span className="text-[#526052]">{group.exercises.length}</span></h3>
            <div className={`grid grid-cols-1 gap-3 ${layout === "grid" ? "sm:grid-cols-2 xl:grid-cols-3" : ""}`}>
              {group.exercises.map((exercise) => {
                const added = selectedIds.includes(exercise.id);
                const blockedByLimit = limitReached && !added;
                const equipment = equipmentSummary(exercise.equipment);
                const difficulty = exercise.difficulty === "beginner" ? "Principiante" : exercise.difficulty === "intermediate" ? "Intermedio" : exercise.difficulty === "advanced" || exercise.difficulty === "expert" ? "Avanzado" : exercise.difficulty || "General";
                return (
                  <div key={exercise.id} className="relative">
                  {onFavorite && exercise.available !== false && <div className="absolute left-2 top-2 z-10"><FavoriteButton name={exercise.name} favorite={favoriteIds.includes(exercise.id)} disabled={pendingFavorites.includes(`exercise:${exercise.id}`)} onClick={() => onFavorite(exercise.id, favoriteIds.includes(exercise.id))} /></div>}
                  <button type="button" onClick={() => onToggle(exercise.id)} disabled={!added && (exercise.available === false || blockedByLimit)} aria-pressed={added} aria-label={`${exercise.name}, ${added ? "quitar del día" : exercise.available === false ? "pendiente de activación" : blockedByLimit ? "límite de ejercicios alcanzado" : "añadir al día"}`} className={`exercise-motion-card flex flex-col h-full w-full overflow-hidden rounded-2xl border text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#72873f] disabled:cursor-not-allowed ${exercise.available === false && !added ? "opacity-70" : ""} ${added ? "border-[#72873f] bg-[#f2facd]" : "border-[#dfe4d8] bg-white hover:border-[#72873f] hover:shadow-sm"}`}>
                    <span className={`relative block aspect-[4/3] w-full shrink-0 overflow-hidden ${exercise.imageBackground === "dark" ? "bg-[#090a0d]" : "bg-[#edf0e7]"}`}>
                      <ExerciseImage exercise={exercise} />
                      <span className={`absolute right-2 top-2 grid size-8 place-items-center rounded-full shadow-sm ${added ? "bg-[#72873f] text-white" : "bg-white text-[#3d4a24]"}`}>{added ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}</span>
                    </span>
                    <span className="block p-3">
                      <span className="block text-sm font-semibold leading-snug text-[#18231f]">{exercise.name}</span>
                      {exercise.trialNote && <span className="mt-1 block rounded-md bg-[#fff3db] px-2 py-1 text-[11px] font-medium leading-4 text-[#805321]">Prueba: {exercise.trialNote}</span>}
                      <span className="mt-1 block text-xs text-[#68736b]">{muscleSummary(exercise) || muscleLabels[exercise.primaryMuscle ?? ""] || group.label}</span>
                      <span className="mt-1 block text-[11px] text-[#819078]">{difficulty} · {equipment}</span>
                      <span className={`mt-2 block text-xs font-semibold ${added ? "text-[#60703d]" : "text-[#72873f]"}`}>{added ? "Añadido · tocar para quitar" : exercise.available === false ? "Pendiente de activación" : blockedByLimit ? "Límite alcanzado" : "Añadir"}</span>
                    </span>
                  </button></div>
                );
              })}
            </div>
          </section>
        ))}
        {groups.length === 0 && <p className="rounded-xl border border-dashed border-[#cfd7c8] p-4 text-sm text-[#68736b]">No hay ejercicios con estos filtros.</p>}
      </div>
    </aside>
  );
}

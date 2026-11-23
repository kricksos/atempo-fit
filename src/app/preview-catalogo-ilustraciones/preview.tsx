"use client";

import { NavigationLink } from "@/components/navigation-control";
import { useState } from "react";

import { ExerciseCatalogSelector, type CatalogExercise } from "@/components/exercise-catalog-selector";
import homeBatchNames from "../../../data/illustration-library/home-preview-batch.json";
import moreHomeBatchNames from "../../../data/illustration-library/home-preview-batch-2.json";

type PreviewFilter = "all" | "trials" | "home" | "home2";

export function CatalogIllustrationPreview({ catalog, initialBatch = "all" }: { catalog: CatalogExercise[]; initialBatch?: PreviewFilter }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<PreviewFilter>(initialBatch);
  const trials = catalog.filter((exercise) => exercise.trialNote);
  const homeBatch = catalog.filter((exercise) => homeBatchNames.includes(exercise.name));
  const moreHomeBatch = catalog.filter((exercise) => moreHomeBatchNames.includes(exercise.name));

  function toggleSample(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((selected) => selected !== id) : [...current, id]);
  }

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-5 py-8 text-[#18231f] sm:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#819078]">Vista previa local</p>
        <h1 className="mt-3 text-3xl font-semibold">Candidatas del catálogo</h1>
        <p className="mt-3 text-sm leading-6 text-[#68736b]">Estas correspondencias son provisionales. La selección de esta página no modifica ninguna rutina ni el catálogo real.</p>
        {trials.length > 0 && <p className="mt-2 text-sm leading-6 text-[#68736b]">Las tarjetas marcadas como «Prueba» son propuestas para comparar, no imágenes aprobadas. Algunas muestran material o posturas diferentes, o conservan bordes recortados; la nota de cada tarjeta señala lo que hay que revisar.</p>}
        <p className="mt-4 rounded-xl border border-[#e1c39d] bg-[#fff8ed] p-4 text-sm leading-6 text-[#805321]">Ilustraciones generadas con IA y no revisadas por profesionales. No las uses como guía de técnica.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => setFilter(filter === "home" ? "all" : "home")} aria-pressed={filter === "home"} className="min-h-11 rounded-xl border border-[#9aaa89] bg-[#e7f5b4] px-4 py-2 text-sm font-semibold text-[#3d4a24]">{filter === "home" ? "Mostrar todo el catálogo" : `Ver primer lote de casa (${homeBatch.length})`}</button>
          <button type="button" onClick={() => setFilter(filter === "home2" ? "all" : "home2")} aria-pressed={filter === "home2"} className="min-h-11 rounded-xl border border-[#9aaa89] bg-[#e7f5b4] px-4 py-2 text-sm font-semibold text-[#3d4a24]">{filter === "home2" ? "Mostrar todo el catálogo" : `Ver segundo lote de casa (${moreHomeBatch.length})`}</button>
          {trials.length > 0 && <button type="button" onClick={() => setFilter(filter === "trials" ? "all" : "trials")} aria-pressed={filter === "trials"} className="min-h-11 rounded-xl border border-[#c7a86f] bg-[#fff3db] px-4 py-2 text-sm font-semibold text-[#805321]">{filter === "trials" ? "Mostrar todo el catálogo" : `Ver solo las ${trials.length} pruebas`}</button>}
        </div>
        {(filter === "home" || filter === "home2") && <p className="mt-3 text-sm leading-6 text-[#68736b]">Lote para revisión visual. Las tarjetas pendientes no se pueden añadir hasta incorporar sus registros a la base de datos.</p>}
        <div className="mt-4"><ExerciseCatalogSelector catalog={filter === "home" ? homeBatch : filter === "home2" ? moreHomeBatch : filter === "trials" ? trials : catalog} selectedIds={selectedIds} onToggle={toggleSample} layout="grid" /></div>
        <NavigationLink href="/preview-ilustraciones" kind="back" className="mt-5">Volver a la muestra de tres ejercicios</NavigationLink>
        <p className="text-xs leading-5 text-[#68736b]">Imágenes de <a href="https://github.com/hitmanrepo/open-exercise-illustrations" target="_blank" rel="noreferrer" className="underline">Open Exercise Illustrations</a>, licencia CC0.</p>
      </div>
    </main>
  );
}

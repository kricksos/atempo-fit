"use client";

import { useState } from "react";
import Link from "next/link";

import { ExerciseCatalogSelector, type CatalogExercise } from "@/components/exercise-catalog-selector";

const samples: CatalogExercise[] = [
  { id: "bench-press", name: "Press banca con barra", primaryMuscle: "pectorals", muscleGroups: ["pectorals", "triceps"], difficulty: "intermediate", equipment: ["barra", "banco"], image: "/exercises/illustration-samples/bench-press-blend.webp", imageEnd: "/exercises/illustration-samples/bench-press-end-blend.webp", imageBackground: "dark", imageScale: 2.15 },
  { id: "overhead-press", name: "Press militar con barra", primaryMuscle: "deltoids", muscleGroups: ["deltoids", "triceps"], difficulty: "intermediate", equipment: ["barra"], image: "/exercises/illustration-samples/overhead-press-blend.webp", imageEnd: "/exercises/illustration-samples/overhead-press-end-blend.webp", imageBackground: "dark", imageScale: 1.05 },
  { id: "squat", name: "Sentadilla con barra", primaryMuscle: "quadriceps", muscleGroups: ["quadriceps", "glutes"], difficulty: "intermediate", equipment: ["barra"], image: "/exercises/illustration-samples/squat-blend.webp", imageEnd: "/exercises/illustration-samples/squat-end-blend.webp", imageBackground: "dark", imageScale: 1.45 },
];

export function IllustrationPreview() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  function toggleSample(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((selected) => selected !== id) : [...current, id]);
  }

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-5 py-8 text-[#18231f] sm:px-8">
      <div className="mx-auto max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#819078]">Vista previa local</p>
        <h1 className="mt-3 text-3xl font-semibold">Muestra de ilustraciones</h1>
        <p className="mt-3 text-sm leading-6 text-[#68736b]">Tres ejemplos para valorar el estilo en el selector. Puedes probar la selección sin modificar ninguna rutina.</p>
        <p className="mt-2 text-sm leading-6 text-[#68736b]">Pasa el cursor por una tarjeta para ver la transición entre dos posiciones. En móvil, tócala para iniciar o detener la transición.</p>
        <p className="mt-2 text-sm text-[#68736b]"><Link href="/preview-catalogo-ilustraciones" className="font-semibold underline">Ver las candidatas del catálogo</Link></p>
        <p className="mt-4 rounded-xl border border-[#e1c39d] bg-[#fff8ed] p-4 text-sm leading-6 text-[#805321]">Muestra visual generada con IA y no revisada por profesionales. No la uses como guía de técnica; las imágenes requieren revisión antes de su uso real.</p>
        <div className="mt-6"><ExerciseCatalogSelector catalog={samples} selectedIds={selectedIds} onToggle={toggleSample} /></div>
        <p className="mt-5 text-xs leading-5 text-[#68736b]">Imágenes de <a href="https://github.com/hitmanrepo/open-exercise-illustrations" target="_blank" rel="noreferrer" className="underline">Open Exercise Illustrations</a>, licencia CC0. Los archivos se cargan desde el proyecto.</p>
      </div>
    </main>
  );
}

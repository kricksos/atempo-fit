"use client";

import { useState } from "react";

import type { CatalogExercise } from "@/components/exercise-catalog-selector";
import { ManualWorkoutBuilder } from "@/components/manual-workout-builder";
import { ManualWorkoutStart } from "@/components/manual-workout-start";
import { WorkoutTemplateLibrary } from "@/components/workout-template-library";
import { getExerciseIllustration } from "@/lib/illustration-media";
import { workoutTemplates } from "@/lib/workout-templates";

const groups: Record<string, string> = {
  "Sentadilla con peso corporal": "quadriceps", "Sentadilla goblet con mancuerna": "quadriceps", "Prensa de piernas": "quadriceps",
  "Flexiones con rodillas apoyadas": "pectorals", "Flexiones en pared": "pectorals", "Flexiones de pecho": "pectorals",
  "Remo inclinado con mochila": "lats", "Remo con mancuerna": "lats", "Remo sentado con banda elástica": "lats",
  "Bisagra de cadera con mancuernas hasta las rodillas": "hamstrings", "Plancha": "core",
  "Press militar con mancuernas": "deltoids", "Elevaciones laterales con mancuernas": "deltoids",
  "Puente de glúteos con peso corporal": "glutes", "Curl femoral": "hamstrings",
  "Curl de bíceps con mancuernas": "biceps", "Patada de tríceps con mancuerna": "triceps", "Extensión de tríceps en polea": "triceps",
  "Elevación de gemelos en escalón": "calves", "Elevación de gemelos de pie en máquina": "calves",
  "Peso muerto rumano con pesa rusa": "hamstrings", "Peso muerto rumano": "hamstrings",
  "Press banca en máquina": "pectorals", "Press de pecho en polea": "pectorals",
  "Remo sentado en polea": "lats", "Jalon al pecho": "lats", "Zancadas con mancuernas": "quadriceps",
  "Plancha abdominal": "core", "Curl de bíceps en máquina": "biceps", "Extensión de tríceps con mancuerna": "triceps",
  "Press de hombros en polea": "deltoids", "Press de hombros con banda elástica": "deltoids", "Face pull en polea": "deltoids",
  "Extensión de cuádriceps en máquina": "quadriceps",
  "Remo a un brazo con mancuerna": "lats", "Sentadilla con barra": "quadriceps",
  "Press banca con barra": "pectorals", "Peso muerto con barra": "hamstrings",
  "Peso muerto con piernas rígidas y mancuernas": "hamstrings", "Remo con barra": "lats",
  "Press de hombros con mancuernas": "deltoids", "Curl femoral tumbado en máquina": "hamstrings",
  "Press inclinado": "pectorals", "Extensión de tríceps en máquina": "triceps",
};
const equipment: Record<string, string[]> = {
  "Sentadilla con peso corporal": [], "Sentadilla goblet con mancuerna": ["dumbbell"], "Prensa de piernas": ["leg_press_machine"],
  "Flexiones con rodillas apoyadas": [], "Flexiones en pared": [], "Flexiones de pecho": [],
  "Remo inclinado con mochila": ["backpack"], "Remo con mancuerna": ["dumbbell", "bench"], "Remo sentado con banda elástica": ["resistance_band"],
  "Bisagra de cadera con mancuernas hasta las rodillas": ["dumbbell"], "Plancha": [],
  "Elevaciones laterales con mancuernas": ["dumbbell"], "Puente de glúteos con peso corporal": [], "Curl femoral": ["leg_curl_lying_machine"],
  "Curl de bíceps con mancuernas": ["dumbbell"], "Patada de tríceps con mancuerna": ["dumbbell", "bench"], "Extensión de tríceps en polea": ["cable_machine"],
  "Elevación de gemelos en escalón": ["step"], "Elevación de gemelos de pie en máquina": ["calf_raise_standing_machine"],
  "Peso muerto rumano con pesa rusa": ["kettlebell"], "Peso muerto rumano": ["straight_bar"],
  "Press banca en máquina": ["chest_press_machine"], "Press de pecho en polea": ["cable_machine"],
  "Remo sentado en polea": ["cable_machine"], "Jalon al pecho": ["cable_machine"], "Zancadas con mancuernas": ["dumbbell"],
  "Plancha abdominal": [], "Curl de bíceps en máquina": ["biceps_curl_machine"], "Extensión de tríceps con mancuerna": ["dumbbell"],
  "Press de hombros en polea": ["cable_machine"], "Press de hombros con banda elástica": ["resistance_band"], "Face pull en polea": ["cable_machine"],
  "Extensión de cuádriceps en máquina": ["leg_extension_machine"],
  "Remo a un brazo con mancuerna": ["dumbbell", "bench"], "Sentadilla con barra": ["straight_bar", "rack"],
  "Press banca con barra": ["straight_bar", "bench", "rack"], "Peso muerto con barra": ["straight_bar"],
  "Peso muerto con piernas rígidas y mancuernas": ["dumbbell"], "Remo con barra": ["straight_bar"],
  "Press de hombros con mancuernas": ["dumbbell", "bench"], "Curl femoral tumbado en máquina": ["leg_curl_lying_machine"],
  "Press inclinado": ["straight_bar", "bench", "rack"], "Extensión de tríceps en máquina": ["triceps_extension_machine"],
};
const names = [...new Set(workoutTemplates.flatMap((template) => template.days.flatMap((day) => day.exercises.map((exercise) => exercise.name))))];
const catalog: CatalogExercise[] = names.map((name) => {
  const illustration = getExerciseIllustration(name);
  return {
    id: name, name, primaryMuscle: groups[name] ?? null, muscleGroups: groups[name] ? [groups[name]] : [], difficulty: "beginner", equipment: equipment[name] ?? ["Material no especificado en la vista previa"],
    image: illustration?.start ?? null, imageEnd: illustration?.end ?? null, imageBackground: illustration ? "dark" : undefined,
    imageScale: illustration?.scale, lazyFrames: Boolean(illustration), illustration: Boolean(illustration),
  };
});
const options = workoutTemplates.map((template) => ({
  template,
  issues: template.place === "Gimnasio" ? ["Ejemplo: el perfil simulado indica que entrenas en casa."] : [],
}));

export function RoutinePreview() {
  const [library, setLibrary] = useState(false);
  const [editor, setEditor] = useState(false);
  const [manualWorkspace, setManualWorkspace] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const toggleFavorite = (key: string) => setFavorites((current) => current.includes(key) ? current.filter((item) => item !== key) : [...current, key]);
  const demo = () => setMessage("Vista de demostración: esta acción no modifica ninguna rutina.");
  if (editor) return <ManualWorkoutBuilder catalog={catalog} exerciseDetails={[]} templates={options} activeRoutine={null} routines={[]} drafts={[]} preview={{
    draft: { id: "preview", name: "Mi rutina de ejemplo", source: "manual", days: [
      { name: "Día 1", exercises: [{ exerciseId: "Sentadilla con peso corporal", sets: 2, repetitions: "8-12", restSeconds: 90 }] },
      { name: "Día 2", exercises: [] },
    ] },
    onExit: () => { setEditor(false); setManualWorkspace(true); },
  }} />;
  if (library) return <WorkoutTemplateLibrary options={options} catalog={catalog} busy={false} message={message} favoriteIds={favorites} onFavorite={(id) => toggleFavorite(id)} onBack={() => { setLibrary(false); setMessage(null); }} onUse={demo} onClearMessage={() => setMessage(null)} />;
  return <ManualWorkoutStart
    activeRoutine={{ name: "Rutina de ejemplo", automatic: true, days: [{ id: "current", name: "Cuerpo completo", muscles: ["Cuádriceps", "Pectoral"], exerciseCount: 4, incomplete: false, estimatedMinutes: 38 }] }}
    routines={[{ id: "example", name: "Mi rutina anterior", favorite: favorites.includes("routine:example"), updatedAt: "2026-01-01", active: false, days: [{ id: "day", name: "Cuerpo completo", muscles: ["Cuádriceps", "Pectoral", "Dorsal"], exerciseCount: 3, incomplete: false, estimatedMinutes: 32 }] }]}
    drafts={[{ id: "draft", name: "Mi borrador", favorite: favorites.includes("draft:draft"), updatedAt: "2026-01-01", days: [{ id: "draft-day", name: "Día 1", muscles: ["Cuádriceps", "Pectoral"], exerciseCount: 2, incomplete: false, estimatedMinutes: 20 }] }]}
    onFavorite={(kind, id) => toggleFavorite(`${kind}:${id}`)}
    busy={false} message={null} notice={message ?? "Vista de demostración con datos ficticios. No se modifica ninguna rutina."}
    manualWorkspace={manualWorkspace} onOpenManual={() => { setMessage(null); setManualWorkspace(true); }} onBack={() => { setMessage(null); setManualWorkspace(false); }}
    onCreate={(source) => source === "manual" ? setEditor(true) : demo()} onOpenDraft={() => setEditor(true)} onDelete={demo} onGenerateAutomatic={demo} onBrowseTemplates={() => { setMessage(null); setLibrary(true); }}
  />;
}

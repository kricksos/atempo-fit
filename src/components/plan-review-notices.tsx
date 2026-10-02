import { Dumbbell, Utensils } from "lucide-react";

type PlanReviewNoticesProps = { nutritionPending: boolean; workoutPending: boolean };

export function PlanReviewNotices({ nutritionPending, workoutPending }: PlanReviewNoticesProps) {
  if (!nutritionPending && !workoutPending) return null;

  if (nutritionPending && workoutPending) {
    return <section className="mt-6 rounded-2xl border border-[#e5c66e] bg-[#fff1c6] p-5"><p className="text-sm font-semibold text-[#795d10]">Tu plan completo necesita una actualización</p><p className="mt-1 text-sm text-[#795d10]">Tus intolerancias y lesiones han cambiado. Usa el botón principal “Actualizar mi plan” en la sección Progreso para revisar los cambios y aplicar una nueva dieta y rutina.</p></section>;
  }

  const notice = nutritionPending
    ? { icon: Utensils, title: "Tu dieta necesita una actualización", text: "Tus intolerancias o alergias han cambiado. Usa el botón principal “Actualizar mi plan” en la sección Progreso para revisar y aplicar los cambios de nutrición." }
    : { icon: Dumbbell, title: "Tu rutina necesita una actualización", text: "Tus lesiones o molestias han cambiado. Usa el botón principal “Actualizar mi plan” en la sección Progreso para revisar y aplicar los cambios de entrenamiento." };
  const Icon = notice.icon;

  return <section className="mt-6 rounded-2xl border border-[#e5c66e] bg-[#fff1c6] p-5"><div className="flex gap-3"><Icon className="mt-0.5 shrink-0 text-[#795d10]" size={20} /><div><p className="text-sm font-semibold text-[#795d10]">{notice.title}</p><p className="mt-1 text-sm text-[#795d10]">{notice.text}</p></div></div></section>;
}
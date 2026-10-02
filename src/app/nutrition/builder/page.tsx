import { ArrowLeft, ChefHat, Clock3, History, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { foodRestrictionLabelsFromRestrictions } from "@/lib/food-restrictions";
import { NutritionHistoryList } from "@/components/nutrition-history-list";

function reasonLabel(reason: string) {
  const labels: Record<string, string> = {
    onboarding: "Plan inicial",
    restriction_change: "Cambio de restricciones",
    progress_adjustment: "Ajuste por evolución",
    goal_change: "Cambio de objetivo",
    equipment_change: "Cambio de contexto",
    injury_change: "Adaptación por lesión",
  };
  return labels[reason] ?? "Actualización del plan";
}

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
}

function snapshotString(snapshot: unknown, key: string) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return "";
  const value = (snapshot as Record<string, unknown>)[key];
  return typeof value === "string" ? value : "";
}

function snapshotArray(snapshot: unknown, key: string) {
  if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return [];
  const value = (snapshot as Record<string, unknown>)[key];
  return Array.isArray(value) ? value : [];
}

function goalLabel(value: string) {
  const labels: Record<string, string> = {
    "Ganar masa muscular": "Ganancia muscular",
    "Perder grasa": "Pérdida de grasa",
    "Recomposición corporal": "Recomposición corporal",
    "Mantener peso": "Mantenimiento",
  };
  return labels[value] ?? (value || "Plan personalizado");
}

export default async function NutritionBuilderPage() {
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) redirect("/login");

  const db = createAdminClient();
  const { data: nutritionPlan } = await db.from("nutrition_plans").select("id, name").eq("user_id", auth.user.id).eq("active", true).maybeSingle();
  const versions = nutritionPlan
    ? (await db.from("nutrition_plan_versions").select("id, version_number, calories, protein_grams, carbs_grams, fats_grams, meal_count, profile_snapshot, reason, active, created_at").eq("nutrition_plan_id", nutritionPlan.id).order("version_number", { ascending: false }).limit(12)).data ?? []
    : [];
  const activeVersion = versions.find((version) => version.active) ?? null;

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-5 py-8 text-[#18231f] sm:px-8">
      <div className="mx-auto max-w-5xl">
        <Link href="/dashboard?tab=nutrition" className="inline-flex items-center gap-2 text-sm font-semibold text-[#68736b] hover:text-[#18231f]"><ArrowLeft size={16} /> Volver a nutrición</Link>
        <header className="mt-10 max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#819078]">Gestor de alimentación</p><h1 className="mt-4 text-4xl font-semibold tracking-[-0.06em] sm:text-6xl">Tu dieta, bajo control.</h1><p className="mt-5 text-lg leading-8 text-[#68736b]">Consulta qué dieta está activa, entiende por qué se actualizó y conserva el contexto de tus versiones anteriores.</p></header>

        <section className="mt-10 rounded-[2rem] border border-[#cdd9bd] bg-gradient-to-br from-[#eef6da] via-[#f8f9f2] to-[#edf3e4] p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#6d7f42]"><Sparkles size={15} /> Dieta activa</p><h2 className="mt-3 text-2xl font-semibold">{nutritionPlan?.name ?? "Aún no tienes una dieta activa"}</h2></div>{activeVersion ? <span className="rounded-full border border-[#cdd9bd] bg-white/70 px-3 py-1.5 text-xs font-semibold text-[#60703d]">Versión {activeVersion.version_number}</span> : null}</div>
          {activeVersion ? <><div className="mt-6 grid gap-3 sm:grid-cols-4"><div className="rounded-2xl bg-white/70 p-4"><p className="text-xs text-[#819078]">Calorías</p><p className="mt-2 text-xl font-semibold">{activeVersion.calories} kcal</p></div><div className="rounded-2xl bg-white/70 p-4"><p className="text-xs text-[#819078]">Proteína</p><p className="mt-2 text-xl font-semibold">{Math.round(activeVersion.protein_grams)} g</p></div><div className="rounded-2xl bg-white/70 p-4"><p className="text-xs text-[#819078]">Carbohidratos</p><p className="mt-2 text-xl font-semibold">{Math.round(activeVersion.carbs_grams)} g</p></div><div className="rounded-2xl bg-white/70 p-4"><p className="text-xs text-[#819078]">Grasas</p><p className="mt-2 text-xl font-semibold">{Math.round(activeVersion.fats_grams)} g</p></div></div><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#68736b]"><span className="flex items-center gap-1.5"><Clock3 size={14} /> Actualizada {dateLabel(activeVersion.created_at)}</span><span>{reasonLabel(activeVersion.reason)} · {activeVersion.meal_count} comidas al día</span></div></> : <Link href="/dashboard?tab=nutrition" className="mt-6 inline-flex rounded-full bg-[#18231f] px-5 py-2.5 text-sm font-semibold text-white">Volver a generar mi dieta</Link>}
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-2"><Link href="/nutrition/builder/manual" className="rounded-2xl border border-[#b6c77b] bg-[#e7f5b4] p-5 hover:border-[#72873f]"><ChefHat className="text-[#60703d]" size={20} /><h2 className="mt-4 font-semibold">Crear dieta manual</h2><p className="mt-2 text-sm leading-6 text-[#3d4a24]">Elige comidas, alimentos y cantidades. Tus restricciones se comprobarán antes de publicar.</p></Link><div className="rounded-2xl border border-[#d3dbcf] bg-white/60 p-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#819078]">Seguridad</p><h2 className="mt-4 font-semibold">Tus restricciones siguen activas</h2><p className="mt-2 text-sm leading-6 text-[#68736b]">Las alergias, intolerancias y preferencias del perfil se mantienen al regenerar la dieta y al publicar una dieta manual.</p></div></section>

        <section className="mt-8 rounded-[2rem] border border-[#d3dbcf] bg-[#f8f7f1] p-6 sm:p-8"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-[#18231f] text-[#d7f36b]"><History size={18} /></span><div><h2 className="text-xl font-semibold">Historial de dietas</h2><p className="mt-1 text-sm text-[#68736b]">Puedes activar una versión anterior. La dieta actual se conservará.</p></div></div><NutritionHistoryList versions={versions.map((version) => ({ id: version.id, active: version.active, versionNumber: version.version_number, calories: version.calories, proteinGrams: version.protein_grams, carbsGrams: version.carbs_grams, fatsGrams: version.fats_grams, mealCount: version.meal_count, goal: goalLabel(snapshotString(version.profile_snapshot, "primary_goal")), reason: reasonLabel(version.reason), createdAt: version.created_at, restrictions: foodRestrictionLabelsFromRestrictions(snapshotArray(version.profile_snapshot, "food_restrictions")).filter((restriction) => restriction !== "Ninguna") }))} /></section>
      </div>
    </main>
  );
}

import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import { GamificationOverview } from "@/components/gamification-status";
import { unifiedActivityDates, weeklyActivity } from "@/features/gamification/activity";
import { computeGamification, computeStreaks } from "@/features/gamification/xp";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AchievementsPage() {
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();

  if (!auth.user) return <main className="grid min-h-screen place-items-center bg-[#f4f1e9] text-center text-[#18231f]"><div><h1 className="text-3xl font-semibold">Necesitas iniciar sesión</h1><Link href="/login" className="mt-6 inline-flex rounded-full bg-[#18231f] px-5 py-3 text-sm font-semibold text-white">Ir al acceso</Link></div></main>;

  const db = createAdminClient();
  const [{ data: profile }, { data: measurements }, { data: sessions }] = await Promise.all([
    db.from("profiles").select("name, created_at, target_weight_kg").eq("user_id", auth.user.id).maybeSingle(),
    db.from("body_measurements").select("measured_at, weight_kg, waist_cm, chest_cm, arm_cm, thigh_cm").eq("user_id", auth.user.id).order("measured_at", { ascending: true }),
    db.from("workout_sessions").select("completed_at").eq("user_id", auth.user.id).eq("completed", true).order("completed_at", { ascending: true }),
  ]);
  const { data: nutritionPlan } = await db.from("nutrition_plans").select("id").eq("user_id", auth.user.id).eq("active", true).maybeSingle();
  let nutritionDaysCount = 0;
  let nutritionCompletedDates: string[] = [];
  if (nutritionPlan) {
    const { data: nutritionVersion } = await db.from("nutrition_plan_versions").select("id").eq("nutrition_plan_id", nutritionPlan.id).eq("active", true).maybeSingle();
    if (nutritionVersion) {
      const [{ data: nutritionMeals }, { data: completions }] = await Promise.all([
        db.from("nutrition_meals").select("id").eq("nutrition_plan_version_id", nutritionVersion.id),
        db.from("nutrition_meal_completions").select("meal_id, completed_on").eq("user_id", auth.user.id),
      ]);
      const mealCount = nutritionMeals?.length ?? 0;
      const mealsByDate = new Map<string, Set<string>>();
      for (const completion of completions ?? []) {
        if (!completion.completed_on) continue;
        const meals = mealsByDate.get(completion.completed_on) ?? new Set<string>();
        meals.add(completion.meal_id);
        mealsByDate.set(completion.completed_on, meals);
      }
      nutritionCompletedDates = mealCount > 0 ? [...mealsByDate.entries()].filter(([, meals]) => meals.size >= mealCount).map(([date]) => date) : [];
      nutritionDaysCount = nutritionCompletedDates.length;
    }
  }
  const activityDates = unifiedActivityDates([
    ...(sessions ?? []).map((session) => [(session.completed_at ?? "").slice(0, 10)]),
    (measurements ?? []).map((measurement) => measurement.measured_at),
    nutritionCompletedDates,
  ]);
  const { current: currentStreak, best: bestStreak } = computeStreaks(activityDates);
  const weeklyProgress = weeklyActivity(activityDates);
  const firstMeasurement = measurements?.[0];
  const latestMeasurement = measurements?.[measurements.length - 1];
  const gamification = computeGamification({
    workoutSessionsCount: sessions?.length ?? 0,
    measurementsCount: measurements?.length ?? 0,
    bodyMeasurementsCount: (measurements ?? []).filter((measurement) => measurement.waist_cm !== null || measurement.chest_cm !== null || measurement.arm_cm !== null || measurement.thigh_cm !== null).length,
    nutritionDaysCount,
    bestStreak,
    weightDeltaKg: firstMeasurement && latestMeasurement && firstMeasurement.measured_at !== latestMeasurement.measured_at ? latestMeasurement.weight_kg - firstMeasurement.weight_kg : null,
    targetSet: profile?.target_weight_kg !== null && profile?.target_weight_kg !== undefined,
    targetReached: profile?.target_weight_kg !== null && profile?.target_weight_kg !== undefined && latestMeasurement !== undefined && Math.abs(latestMeasurement.weight_kg - profile.target_weight_kg) <= 0.5,
    weeklyActiveDays: weeklyProgress.current.activeDays,
    completedWeeklyGoals: weeklyProgress.completedWeeks,
  });
  const accountName = profile?.name ?? (typeof auth.user.user_metadata?.name === "string" ? auth.user.user_metadata.name : "Mi cuenta");

  return (
    <main className="min-h-screen bg-[#f4f1e9] px-5 py-6 text-[#18231f] sm:px-8 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <AppHeader email={auth.user.email ?? ""} name={accountName} gamification={{ ...gamification, currentStreak, bestStreak }} />
        <section className="mt-14">
          <Link href="/dashboard" className="text-sm font-semibold text-[#68736b] hover:text-[#18231f]">← Volver al dashboard</Link>
          <p className="mt-10 text-sm font-semibold uppercase tracking-[0.16em] text-[#819078]">Tu progreso</p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-5xl font-semibold tracking-[-0.07em] sm:text-7xl">Nivel {gamification.level}</h1><p className="mt-4 max-w-xl text-lg leading-8 text-[#68736b]">Cada entrenamiento y cada registro construyen tu progreso.</p></div><div className="rounded-2xl border border-[#d3dbcf] bg-[#f8f7f1] px-5 py-4"><p className="text-xs uppercase tracking-[0.14em] text-[#819078]">XP total</p><p className="mt-1 text-2xl font-semibold">{gamification.xp} XP</p><p className="mt-1 text-sm text-[#68736b]">{gamification.isMaxLevel ? "Nivel máximo" : `${gamification.xpIntoLevel} / ${gamification.xpForNextLevel} XP para avanzar`}</p></div></div>
          <div className="mt-8 h-3 overflow-hidden rounded-full bg-[#dfe4d8]"><div className="h-full rounded-full bg-[#72873f]" style={{ width: `${gamification.progressPercent}%` }} /></div>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-[#68736b]"><span className="rounded-full border border-[#d3dbcf] bg-[#f8f7f1] px-4 py-2">Racha actual: <strong className="text-[#18231f]">{currentStreak} días</strong></span><span className="rounded-full border border-[#d3dbcf] bg-[#f8f7f1] px-4 py-2">Mejor racha: <strong className="text-[#18231f]">{bestStreak} días</strong></span><span className="rounded-full border border-[#d3dbcf] bg-[#f8f7f1] px-4 py-2">Logros: <strong className="text-[#18231f]">{gamification.achievements.filter((achievement) => achievement.unlocked).length} / {gamification.achievements.length}</strong></span><span className="rounded-full border border-[#d3dbcf] bg-[#f8f7f1] px-4 py-2">Objetivo semanal: <strong className="text-[#18231f]">{weeklyProgress.current.activeDays} / {weeklyProgress.current.targetDays} días</strong></span></div>
          <section className="mt-10 rounded-3xl border border-[#d3dbcf] bg-[#f8f7f1] p-5 sm:p-7"><h2 className="text-2xl font-semibold">Todos tus logros</h2><p className="mt-2 text-sm text-[#68736b]">Los conseguidos quedan destacados; los demás muestran el siguiente objetivo.</p><div className="mt-6"><GamificationOverview summary={{ ...gamification, currentStreak, bestStreak }} /></div></section>
        </section>
      </div>
    </main>
  );
}

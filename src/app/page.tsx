import { Activity, Apple, ArrowRight, ArrowUpRight, Dumbbell, Flame, LineChart, Smartphone, Sparkles } from "lucide-react";
import Link from "next/link";

import { HeaderAccount } from "@/components/header-account";
import type { GamificationSummary } from "@/components/account-status";
import { PulsoMotif } from "@/components/next-step-panel";
import { unifiedActivityDates, weeklyActivity } from "@/features/gamification/activity";
import { computeGamification, computeStreaks } from "@/features/gamification/xp";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const features = [
  { title: "Entrenamiento", text: "Una rutina adaptada a tu experiencia, tiempo y material.", icon: Dumbbell, tone: "bg-[#e7f6f3] text-[#08786f]" },
  { title: "Nutrición", text: "Una guía flexible para acompañarte en tu día a día.", icon: Apple, tone: "bg-[#fff0ec] text-[#b6503c]" },
  { title: "Progreso", text: "Tus registros y evolución, en un mismo lugar.", icon: LineChart, tone: "bg-[#edf2ff] text-[#375dac]" },
] as const;

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08786f]";

function StoreNotice() {
  return <div className="inline-flex items-center gap-3 rounded-2xl border border-[#cbbdff] bg-[#eae5ff] px-4 py-3 text-[#2e205e] shadow-[0_8px_28px_rgba(114,91,224,0.22)]" aria-label="App para Android: futura disponibilidad prevista en Google Play, todavía no disponible">
    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#6441cd] text-white"><Smartphone size={20} aria-hidden="true" /></span>
    <span><span className="block text-[10px] font-semibold uppercase tracking-[0.12em] text-[#5f5190]">App para Android</span><span className="mt-0.5 block text-sm font-semibold">Google Play · Próximamente</span></span>
  </div>;
}

function PhonePreview() {
  return <div id="preview" className="relative mx-auto w-full max-w-[285px] rounded-[2.4rem] border-[7px] border-[#203f4b] bg-[#203f4b] p-2 shadow-[0_35px_80px_rgba(16,45,56,0.22)]">
    <div className="overflow-hidden rounded-[1.8rem] bg-[#f4f6f8] p-4 text-[#172f3b] sm:p-5">
      <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-[#b7c8ce]" />
      <p className="mb-3 text-[10px] font-semibold text-[#526a77]">Vista ilustrativa · Datos de ejemplo</p>
      <div className="flex items-center justify-between"><div><p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#738994]">Tu espacio</p><p className="mt-1 text-lg font-semibold">Tu ritmo. Tu progreso.</p></div><span className="grid size-8 place-items-center rounded-full bg-[#e6eef1] text-xs font-bold text-[#375b68]">A</span></div>
      <div className="relative mt-5 overflow-hidden rounded-2xl bg-gradient-to-br from-[#112b3a] to-[#18565a] p-4 text-white">
        <PulsoMotif />
        <div className="relative"><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#a6eee0]">Tu próximo entrenamiento</p><p className="mt-4 text-lg font-semibold">Cuerpo completo</p><p className="mt-1 text-xs text-[#c5e0dc]">Variante A · Día 2 de 3</p><div className="mt-4 flex gap-2 text-[10px] text-[#d9eae8]"><span className="rounded-full border border-white/20 px-2 py-1">6 ejercicios</span><span className="rounded-full border border-white/20 px-2 py-1">45 min</span></div></div>
      </div>
      <div className="mt-3 grid gap-2">
        <div className="rounded-xl border border-[#e1e7eb] bg-white p-3"><p className="flex items-center gap-2 text-[10px] font-semibold text-[#667d88]"><Flame size={14} className="text-[#7550a4]" aria-hidden="true" /> Constancia</p><p className="mt-3 text-xl font-semibold">2 <span className="text-sm text-[#98a9af]">/ 3 días</span></p><div className="mt-3 h-1.5 rounded-full bg-[#edf0f3]"><div className="h-full w-2/3 rounded-full bg-[#7550a4]" /></div></div>
        <div className="rounded-xl border border-[#e1e7eb] bg-white p-3"><p className="flex items-center gap-2 text-[10px] font-semibold text-[#667d88]"><Apple size={14} className="text-[#b6503c]" aria-hidden="true" /> Nutrición</p><p className="mt-3 text-xl font-semibold">2 <span className="text-sm text-[#98a9af]">/ 3 comidas</span></p><div className="mt-3 h-1.5 rounded-full bg-[#f4eeec]"><div className="h-full w-2/3 rounded-full bg-[#b6503c]" /></div></div>
      </div>
      <p className="mt-4 text-[9px] text-[#667d88]">Datos de ejemplo · Tu plan, a tu ritmo.</p>
    </div>
  </div>;
}

export default async function Home() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  const userName = typeof user?.user_metadata?.name === "string" ? user.user_metadata.name : "Mi cuenta";
  const homeAction = user ? { href: "/dashboard", label: "Ir a mi espacio" } : { href: "/onboarding", label: "Empezar en la web" };
  let gamification: GamificationSummary | undefined;
  if (user) {
    const db = createAdminClient();
    const [{ data: profile }, { data: sessions }, { data: measurements }, { data: nutritionPlan }] = await Promise.all([
      db.from("profiles").select("target_weight_kg").eq("user_id", user.id).maybeSingle(),
      db.from("workout_sessions").select("completed_at").eq("user_id", user.id).eq("completed", true).order("completed_at", { ascending: true }),
      db.from("body_measurements").select("measured_at, weight_kg, waist_cm, chest_cm, arm_cm, thigh_cm").eq("user_id", user.id).order("measured_at", { ascending: true }),
      db.from("nutrition_plans").select("id").eq("user_id", user.id).eq("active", true).maybeSingle(),
    ]);
    let nutritionCompletedDates: string[] = [];
    if (nutritionPlan) {
      const { data: nutritionVersion } = await db.from("nutrition_plan_versions").select("id").eq("nutrition_plan_id", nutritionPlan.id).eq("active", true).maybeSingle();
      if (nutritionVersion) {
        const [{ data: meals }, { data: completions }] = await Promise.all([
          db.from("nutrition_meals").select("id").eq("nutrition_plan_version_id", nutritionVersion.id),
          db.from("nutrition_meal_completions").select("meal_id, completed_on").eq("user_id", user.id),
        ]);
        const mealCount = meals?.length ?? 0;
        const mealsByDate = new Map<string, Set<string>>();
        for (const completion of completions ?? []) {
          if (!completion.completed_on) continue;
          const dateMeals = mealsByDate.get(completion.completed_on) ?? new Set<string>();
          dateMeals.add(completion.meal_id);
          mealsByDate.set(completion.completed_on, dateMeals);
        }
        nutritionCompletedDates = mealCount > 0 ? [...mealsByDate.entries()].filter(([, dateMeals]) => dateMeals.size >= mealCount).map(([date]) => date) : [];
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
    const weightDeltaKg = firstMeasurement && latestMeasurement && firstMeasurement.measured_at !== latestMeasurement.measured_at ? latestMeasurement.weight_kg - firstMeasurement.weight_kg : null;
    const calculatedGamification = computeGamification({
      workoutSessionsCount: sessions?.length ?? 0,
      measurementsCount: measurements?.length ?? 0,
      nutritionDaysCount: nutritionCompletedDates.length,
      bodyMeasurementsCount: (measurements ?? []).filter((measurement) => measurement.waist_cm !== null || measurement.chest_cm !== null || measurement.arm_cm !== null || measurement.thigh_cm !== null).length,
      bestStreak,
      weightDeltaKg,
      targetSet: profile?.target_weight_kg !== null && profile?.target_weight_kg !== undefined,
      targetReached: profile?.target_weight_kg !== null && profile?.target_weight_kg !== undefined && latestMeasurement !== undefined && Math.abs(latestMeasurement.weight_kg - profile.target_weight_kg) <= 0.5,
      weeklyActiveDays: weeklyProgress.current.activeDays,
      completedWeeklyGoals: weeklyProgress.completedWeeks,
    });
    gamification = { ...calculatedGamification, currentStreak, bestStreak };
  }

  return <div id="top" className="min-h-screen bg-[#f4f6f8] text-[#172f3b]">
    <header className="relative z-10 bg-[#102c3b] px-5 py-5 text-white sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <a href="#top" className={`flex items-center gap-3 ${focus}`} aria-label="Atempo Fit, inicio"><span className="grid size-10 place-items-center rounded-xl bg-[#163e49] text-[#a6eee0]"><Sparkles size={18} aria-hidden="true" /></span><span className="text-lg font-bold tracking-tight">Atempo <span className="font-medium text-[#bed4d5]">Fit</span></span></a>
        <nav className="hidden items-center gap-7 text-sm font-medium text-[#c5d8da] lg:flex" aria-label="Principal"><a href="#how-it-works" className={focus}>Cómo funciona</a><a href="#personalization" className={focus}>Personalización</a><a href="#preview" className={focus}>Vista previa</a></nav>
        <HeaderAccount initialUser={user ? { email: user.email ?? "", name: userName } : null} gamification={gamification} appearance="dark" />
      </div>
    </header>
    <main>
      <section className="relative overflow-hidden bg-[#102c3b] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-0 size-[38rem] rounded-full border border-[#a6eee0]/10 shadow-[0_0_0_65px_rgba(166,238,224,0.03),0_0_0_130px_rgba(166,238,224,0.025)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1fr_0.85fr] lg:py-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#a6eee0]/25 bg-white/5 px-3 py-1.5 text-xs font-semibold text-[#a6eee0]"><Activity size={15} aria-hidden="true" /> Un espacio para avanzar</p>
            <h1 className="mt-7 max-w-xl text-5xl font-semibold leading-[1.02] tracking-[-0.065em] sm:text-7xl">Tu progreso<br /><span className="text-[#a6eee0]">toma forma.</span></h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-[#c6d9db]">Entrenamiento, nutrición y seguimiento en un solo lugar. Hoy en la web, con la mirada puesta en tu futura app.</p>
            <div id="start" className="mt-8 flex flex-wrap gap-4"><Link href={homeAction.href} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#a6eee0] px-6 text-sm font-bold text-[#103c3d] transition-transform hover:-translate-y-0.5 ${focus}`}>{homeAction.label}<ArrowUpRight size={17} aria-hidden="true" /></Link><a href="#futura-app" className={`inline-flex min-h-12 items-center gap-2 px-2 text-sm font-semibold text-white ${focus}`}>Conoce la futura app <ArrowRight size={16} aria-hidden="true" /></a></div>
            <div className="mt-9 max-w-md rounded-2xl border border-[#a6eee0]/20 bg-white/5 p-4 sm:p-5"><p className="text-sm font-semibold">Tu plan en el bolsillo</p><p className="mt-1 text-sm leading-6 text-[#c5d8da]">Queremos llevar Atempo Fit a Android.</p><div className="mt-4"><StoreNotice /></div><p className="mt-3 text-xs leading-5 text-[#bed0d2]">La app aún no está disponible. Mientras tanto, usa la web.</p></div>
          </div>
          <PhonePreview />
        </div>
      </section>
      <section id="futura-app" className="mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#112f3c] p-7 text-white sm:p-10 lg:p-14">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 size-80 rounded-full border border-[#a6eee0]/10 shadow-[0_0_0_50px_rgba(166,238,224,0.03),0_0_0_100px_rgba(166,238,224,0.025)]" />
          <div className="relative grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:items-center"><div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#a6eee0]"><Smartphone size={16} aria-hidden="true" /> La futura app de Atempo Fit</p><h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.05em] sm:text-5xl">Tu plan, siempre contigo.</h2><p className="mt-5 max-w-xl text-base leading-7 text-[#c5d8da]">Imaginamos Atempo Fit también como una app para Android: un espacio para llevar tu entrenamiento, nutrición y progreso en el bolsillo.</p><div className="mt-7"><StoreNotice /></div><p className="mt-3 text-sm leading-6 text-[#c5d8da]">La app todavía no está disponible. Mientras tanto, puedes usar Atempo Fit desde la web.</p></div><div className="grid gap-3">{features.map((feature) => <div key={feature.title} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5"><span className={`grid size-11 shrink-0 place-items-center rounded-xl ${feature.tone}`}><feature.icon size={20} aria-hidden="true" /></span><h3 className="font-semibold">{feature.title}</h3></div>)}</div></div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24"><div className="mb-9 max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#08786f]">Una forma más clara de avanzar</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Todo tu plan, conectado.</h2><p className="mt-4 text-base leading-7 text-[#667d88]">Entrenamiento, nutrición y seguimiento pensados para acompañarte en tu semana real.</p></div><div className="grid gap-4 md:grid-cols-3">{features.map((feature) => <article key={feature.title} className="rounded-[1.5rem] border border-[#e1e7eb] bg-white p-6 shadow-[0_12px_36px_rgba(19,43,57,0.05)]"><span className={`grid size-11 place-items-center rounded-xl ${feature.tone}`}><feature.icon size={20} aria-hidden="true" /></span><h3 className="mt-5 text-lg font-semibold">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-[#667d88]">{feature.text}</p></article>)}</div></section>
      <section id="how-it-works" className="border-y border-[#e1e7eb] bg-white px-5 py-16 sm:px-8 sm:py-24"><div className="mx-auto max-w-7xl"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#08786f]">Sin complicarlo</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">Empieza desde donde estás.</h2><div className="mt-10 grid gap-8 md:grid-cols-3"><div><span className="text-sm font-bold text-[#08786f]">01</span><h3 className="mt-4 text-xl font-semibold">Cuéntanos sobre ti</h3><p className="mt-3 leading-7 text-[#667d88]">Tus objetivos, tu experiencia, tu tiempo y las circunstancias que importan.</p></div><div><span className="text-sm font-bold text-[#08786f]">02</span><h3 className="mt-4 text-xl font-semibold">Encontramos tu ritmo</h3><p className="mt-3 leading-7 text-[#667d88]">Construimos una propuesta inicial que puedas sostener en tu semana real.</p></div><div><span className="text-sm font-bold text-[#08786f]">03</span><h3 className="mt-4 text-xl font-semibold">Avanza con claridad</h3><p className="mt-3 leading-7 text-[#667d88]">Registra lo que haces, entiende tus avances y ajusta cuando sea necesario.</p></div></div></div></section>
      <section id="personalization" className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#08786f]">Personalización de verdad</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">No tienes que encajar en un plan.</h2><p className="mt-5 max-w-md leading-7 text-[#667d88]">Atempo Fit tiene en cuenta el contexto detrás del objetivo para ayudarte a avanzar sin convertir el progreso en otra fuente de presión.</p></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{["Objetivo", "Experiencia", "Disponibilidad", "Equipamiento", "Sueño", "Preferencias"].map((item) => <div key={item} className="rounded-2xl border border-[#e1e7eb] bg-white p-5"><span className="grid size-8 place-items-center rounded-full bg-[#e7f6f3] text-sm font-semibold text-[#08786f]">✓</span><p className="mt-6 font-medium">{item}</p></div>)}</div></section>
      <section className="bg-[#e7f6f3] px-5 py-16 sm:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#08786f]">A tu ritmo</p><h2 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">Tu siguiente paso puede ser sencillo.</h2></div><Link href={homeAction.href} className={`inline-flex min-h-12 items-center gap-2 rounded-full bg-[#163e49] px-6 text-sm font-semibold text-white ${focus}`}>{homeAction.label} <ArrowUpRight size={17} aria-hidden="true" /></Link></div></section>
    </main>
    <footer className="border-t border-[#e1e7eb] bg-white px-5 py-8 text-sm text-[#667d88] sm:px-8"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5"><div><p className="font-semibold text-[#172f3b]">Atempo Fit</p><p className="mt-1">Tu plan. Tu ritmo. Tu progreso.</p></div><nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Información legal"><Link href="/privacy" target="_blank" rel="noreferrer">Privacidad</Link><Link href="/terms" target="_blank" rel="noreferrer">Términos</Link><Link href="/cookies" target="_blank" rel="noreferrer">Cookies</Link><Link href="/legal-notice" target="_blank" rel="noreferrer">Aviso legal</Link><Link href="/health-safety" target="_blank" rel="noreferrer">Salud y seguridad</Link></nav><p>© 2026 Atempo Fit</p></div></footer>
  </div>;
}

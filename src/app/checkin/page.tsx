import { NavigationLink } from "@/components/navigation-control";
import Link from "next/link";

import { CheckinWizard } from "@/components/checkin-wizard";
import { AppHeader } from "@/components/app-header";
import { foodRestrictionLabelsFromRestrictions } from "@/lib/food-restrictions";
import { injuryLabelsFromRestrictions } from "@/lib/injuries";
import { isExerciseEquipment } from "@/lib/exercise-equipment";
import { normalizeTrainingPlace } from "@/lib/training-place";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type CheckinPageProps = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function CheckinPage({ searchParams }: CheckinPageProps) {
  const { mode } = await searchParams;
  const checkinMode = mode === "workout" || mode === "nutrition" || mode === "general" ? mode : null;
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();

  if (!auth.user) return <main className="grid min-h-screen place-items-center bg-[#f4f1e9] text-center text-[#18231f]"><div><h1 className="text-3xl font-semibold">Necesitas iniciar sesión</h1><Link href="/login" className="mt-6 inline-flex rounded-full bg-[#18231f] px-5 py-3 text-sm font-semibold text-white">Ir al acceso</Link></div></main>;

  const db = createAdminClient();
  const { data: profile, error: profileError } = await db.from("profiles").select("name, primary_goal, experience, training_continuity, training_technique, days_per_week, session_duration_minutes, training_place, training_equipment, restrictions, food_restrictions").eq("user_id", auth.user.id).maybeSingle();
  if (profileError) throw profileError;

  if (!profile) return <main className="grid min-h-screen place-items-center bg-[#f4f1e9] text-center text-[#18231f]"><div><h1 className="text-3xl font-semibold">Completa primero tu perfil inicial</h1><NavigationLink href="/dashboard" kind="dashboard" className="mt-6">Volver al panel</NavigationLink></div></main>;
  if (profile.training_equipment !== null && (!Array.isArray(profile.training_equipment) || !profile.training_equipment.every((item) => typeof item === "string" && isExerciseEquipment(item)))) {
    throw new Error("El material guardado en el perfil no es válido.");
  }

  const accountName = profile.name ?? (typeof auth.user.user_metadata?.name === "string" ? auth.user.user_metadata.name : "Mi cuenta");
  if (!checkinMode) {
    const choices = [
      { mode: "workout", title: "Solo entrenamiento", description: "Actualiza tu rutina, disponibilidad y material sin cambiar tu dieta." },
      { mode: "nutrition", title: "Solo alimentación", description: "Actualiza tu dieta y restricciones alimentarias sin cambiar tu rutina." },
      { mode: "general", title: "Entrenamiento y alimentación", description: "Revisa y actualiza ambos planes a la vez." },
    ];
    return <main className="app-canvas min-h-screen bg-[#f4f1e9] px-5 py-6 text-[#18231f] sm:px-8 sm:py-8"><div className="mx-auto max-w-5xl">
      <AppHeader email={auth.user.email ?? ""} name={accountName} />
      <NavigationLink href="/dashboard" kind="dashboard" className="mt-8">Volver al panel</NavigationLink>
      <section className="mx-auto mt-10 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#819078]">Actualización de tu plan</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">¿Qué quieres revisar?</h1>
        <p className="mt-3 leading-7 text-[#68736b]">Elige qué parte quieres actualizar. La otra conservará su versión actual.</p>
        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          {choices.map((choice) => <Link key={choice.mode} href={`/checkin?mode=${choice.mode}`} className="rounded-2xl border border-[#d3dbcf] bg-white p-5 transition hover:border-[#72873f] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#72873f]">
            <h2 className="font-semibold">{choice.title}</h2><p className="mt-2 text-sm leading-6 text-[#68736b]">{choice.description}</p><span className="mt-4 block text-sm font-semibold text-[#72873f]">Continuar →</span>
          </Link>)}
        </div>
        <p className="mt-5 text-sm leading-6 text-[#68736b]">Si cambias tu objetivo, puede que la parte que no actualices también necesite una revisión.</p>
      </section>
    </div></main>;
  }
  const trainingPlace = normalizeTrainingPlace(profile.training_place ?? "Gimnasio");
  if (!trainingPlace) throw new Error("El lugar de entrenamiento guardado en el perfil no es válido.");

  return (
    <CheckinWizard
      initialGoal={profile.primary_goal}
      initialExperience={profile.experience}
      initialContinuity={profile.training_continuity}
      initialTechnique={profile.training_technique}
      initialDaysPerWeek={profile.days_per_week ?? 3}
      initialSessionDuration={profile.session_duration_minutes ?? 60}
      initialTrainingPlace={trainingPlace}
      initialTrainingEquipment={profile.training_equipment}
      initialInjuries={injuryLabelsFromRestrictions(profile.restrictions)}
      initialFoodRestrictions={foodRestrictionLabelsFromRestrictions(profile.food_restrictions)}
      mode={checkinMode}
      email={auth.user.email ?? ""}
      name={accountName}
    />
  );
}

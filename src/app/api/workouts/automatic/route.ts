import { NextResponse } from "next/server";
import { z } from "zod";

import { generateInitialPlan, parsePlanningProfile, PlanningAvailabilityError } from "@/features/planning/engine";
import { adaptationGate, adaptationTokenSchema, readOptionalJson } from "@/features/planning/adaptation-gate";
import { getPlanningExerciseCatalog } from "@/lib/exercise-catalog";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  try {
    const parsed = z.object({ adaptationToken: adaptationTokenSchema }).safeParse(await readOptionalJson(request));
    if (!parsed.success) return NextResponse.json({ error: "Revisa los datos de generación de la rutina." }, { status: 400 });
    const db = createAdminClient();
    const { data: profile, error: profileError } = await db.from("profiles").select("*").eq("user_id", auth.user.id).single();
    if (profileError || !profile) return NextResponse.json({ error: "Completa tu perfil antes de generar una rutina." }, { status: 400 });

    const { data: activePlan, error: activePlanError } = await db.from("workout_plans").select("id, updated_at").eq("user_id", auth.user.id).eq("active", true).maybeSingle();
    if (activePlanError) throw activePlanError;
    const activeVersion = activePlan
      ? await db.from("workout_plan_versions").select("id").eq("workout_plan_id", activePlan.id).eq("active", true).maybeSingle()
      : { data: null, error: null };
    if (activeVersion.error) throw activeVersion.error;
    const generated = generateInitialPlan(parsePlanningProfile(profile), await getPlanningExerciseCatalog(), { allowAdaptation: true });
    const gate = adaptationGate(generated, parsed.data.adaptationToken, { scope: "automatic", userId: auth.user.id, profile, activePlan, activeVersion: activeVersion.data });
    if (gate) return gate;
    const { data: run, error: runError } = await db.from("plan_generation_runs").insert({ user_id: auth.user.id, run_type: "manual_regeneration", status: "pending", input_snapshot: profile, engine_version: "rules-v2" }).select("id").single();
    if (runError || !run) throw runError ?? new Error("Unable to start workout generation.");

    const { data: plan, error: planError } = await db.from("workout_plans").insert({ user_id: auth.user.id, name: `Plan ${generated.structure}`, description: "Rutina automática generada con tu perfil actual.", source: "auto", active: false }).select("id").single();
    if (planError || !plan) throw planError ?? new Error("Unable to create automatic workout.");
    const { data: version, error: versionError } = await db.from("workout_plan_versions").insert({ workout_plan_id: plan.id, generation_run_id: run.id, version_number: 1, profile_snapshot: { ...profile, workout_adaptations: generated.workoutAdaptations }, reason: "goal_change" }).select("id").single();
    if (versionError || !version) throw versionError ?? new Error("Unable to create workout version.");

    const exerciseNames = [...new Set(generated.days.flatMap((day) => day.exercises.map((exercise) => exercise.name)))];
    const { data: catalog, error: catalogError } = await db.from("exercises").select("id, name").in("name", exerciseNames);
    if (catalogError || !catalog) throw catalogError ?? new Error("Exercise catalog is unavailable.");
    const exerciseByName = new Map(catalog.map((exercise) => [exercise.name, exercise.id]));

    for (const [dayIndex, day] of generated.days.entries()) {
      const { data: savedDay, error: dayError } = await db.from("workout_days").insert({ workout_plan_version_id: version.id, name: day.name, order_number: dayIndex + 1 }).select("id").single();
      if (dayError || !savedDay) throw dayError ?? new Error("Unable to create workout day.");
      const exercises = day.exercises.map((exercise, exerciseIndex) => ({ workout_day_id: savedDay.id, exercise_id: exerciseByName.get(exercise.name)!, sets: exercise.sets, repetitions: exercise.repetitions, rest_seconds: exercise.restSeconds, order_number: exerciseIndex + 1 }));
      if (exercises.some((exercise) => !exercise.exercise_id)) throw new Error("Generated exercise is missing from catalog.");
      const { error: exercisesError } = await db.from("workout_exercises").insert(exercises);
      if (exercisesError) throw exercisesError;
    }

    const { error: archiveError } = await db.from("workout_plans").update({ active: false, updated_at: new Date().toISOString() }).eq("user_id", auth.user.id).eq("active", true);
    if (archiveError) throw archiveError;
    const { error: activateError } = await db.from("workout_plans").update({ active: true, updated_at: new Date().toISOString() }).eq("id", plan.id);
    if (activateError) throw activateError;
    await db.from("plan_generation_runs").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", run.id);
    return NextResponse.json({ generated: true, adaptations: generated.workoutAdaptations });
  } catch (error) {
    console.error("Unable to generate automatic workout", error);
    if (error instanceof PlanningAvailabilityError) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "No hemos podido generar tu rutina automática." }, { status: 500 });
  }
}
import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { foodRestrictionsFromLabels } from "@/lib/food-restrictions";
import { restrictionsFromInjuryLabels } from "@/lib/injuries";
import { generateInitialPlan, parsePlanningProfile, PlanningAvailabilityError } from "@/features/planning/engine";
import { adaptationTokenSchema } from "@/features/planning/adaptation-gate";
import { gymEquipmentPreset, isExerciseEquipment } from "@/lib/exercise-equipment";
import { normalizeTrainingPlace } from "@/lib/training-place";
import { getPlanningExerciseCatalog } from "@/lib/exercise-catalog";
import { continuityOptions, experienceOptions, techniqueOptions } from "@/lib/training-experience";

const checkinSchema = z.object({
  goal: z.string().min(1),
  experience: z.enum(experienceOptions).optional(),
  trainingContinuity: z.enum(continuityOptions).nullable().optional(),
  trainingTechnique: z.enum(techniqueOptions).nullable().optional(),
  daysPerWeek: z.number().int().min(2).max(6),
  sessionDuration: z.number().int().min(30).max(180),
  trainingPlace: z.preprocess((value) => normalizeTrainingPlace(value) ?? value, z.enum(["Casa", "Gimnasio", "Mixto"])),
  trainingEquipment: z.array(z.string().refine(isExerciseEquipment, "Material desconocido")).nullable().optional(),
  foodRestrictions: z.array(z.string()).default([]),
  injuries: z.array(z.string()),
  selfReport: z.enum(["bien", "actualizar"]),
  mode: z.enum(["workout", "nutrition", "general"]).default("general"),
  confirm: z.boolean().default(false),
  proposalToken: adaptationTokenSchema,
}).superRefine((value, ctx) => {
  if (value.mode !== "nutrition" && value.trainingPlace !== "Gimnasio" && value.trainingEquipment == null) {
    ctx.addIssue({ code: "custom", path: ["trainingEquipment"], message: "Indica el material disponible." });
  }
});

function sameSet(a: string[], b: string[]) {
  const left = [...a].sort();
  const right = [...b].sort();
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export async function POST(request: Request) {
  const authClient = await createClient();
  const { data: authData } = await authClient.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const parsed = checkinSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Revisa los datos de la revisión, incluido el material disponible." }, { status: 400 });

  const supabase = createAdminClient();
  const userId = authData.user.id;
  let writesStarted = false;

  try {
    const { data: profile, error: profileReadError } = await supabase.from("profiles").select("*").eq("user_id", userId).single();
    if (profileReadError) throw profileReadError;
    if (!profile) return NextResponse.json({ error: "Complete your profile first." }, { status: 400 });

    const currentRestrictions = Array.isArray(profile.restrictions) ? (profile.restrictions as string[]) : [];
    const currentFoodRestrictions = Array.isArray(profile.food_restrictions) ? (profile.food_restrictions as string[]) : [];
    const updateWorkout = parsed.data.mode !== "nutrition";
    const updateNutrition = parsed.data.mode !== "workout";
    const nextRestrictions = updateWorkout ? restrictionsFromInjuryLabels(parsed.data.injuries) : currentRestrictions;
    const nextFoodRestrictions = updateNutrition ? foodRestrictionsFromLabels(parsed.data.foodRestrictions) : currentFoodRestrictions;

    // Compare against the same fallbacks the check-in page pre-fills, so an unset field doesn't look like a false "change".
    const goalChanged = (profile.primary_goal ?? "") !== parsed.data.goal;
    const daysChanged = updateWorkout && (profile.days_per_week ?? 3) !== parsed.data.daysPerWeek;
    const nextExperience = updateWorkout ? parsed.data.experience ?? profile.experience : profile.experience;
    const nextContinuity = updateWorkout && parsed.data.trainingContinuity !== undefined ? parsed.data.trainingContinuity : profile.training_continuity;
    const nextTechnique = updateWorkout && parsed.data.trainingTechnique !== undefined ? parsed.data.trainingTechnique : profile.training_technique;
    const experienceChanged = updateWorkout && nextExperience !== profile.experience;
    const continuityChanged = updateWorkout && nextContinuity !== profile.training_continuity;
    const techniqueChanged = updateWorkout && nextTechnique !== profile.training_technique;
    const durationChanged = updateWorkout && (profile.session_duration_minutes ?? 60) !== parsed.data.sessionDuration;
    const currentPlace = normalizeTrainingPlace(profile.training_place ?? "Gimnasio");
    if (!currentPlace) return NextResponse.json({ error: "El lugar de entrenamiento guardado no es válido." }, { status: 400 });
    const placeChanged = currentPlace !== parsed.data.trainingPlace;
    if (parsed.data.mode === "nutrition" && placeChanged) {
      return NextResponse.json({ error: "Revisa el lugar y el material desde la revisión de entrenamiento." }, { status: 400 });
    }
    const currentEquipment = Array.isArray(profile.training_equipment) && profile.training_equipment.every((item) => typeof item === "string" && isExerciseEquipment(item)) ? profile.training_equipment : null;
    const nextEquipment = parsed.data.mode === "nutrition" ? currentEquipment
      : parsed.data.trainingPlace === "Gimnasio" ? gymEquipmentPreset()
        : parsed.data.trainingEquipment ?? currentEquipment;
    const equipmentChanged = nextEquipment !== null && (currentEquipment === null || !sameSet(currentEquipment, nextEquipment));
    const restrictionsChanged = !sameSet(currentRestrictions, nextRestrictions);
    const foodRestrictionsChanged = !sameSet(currentFoodRestrictions, nextFoodRestrictions);
    const structuralChange = goalChanged || experienceChanged || continuityChanged || techniqueChanged || daysChanged || durationChanged || placeChanged || equipmentChanged || restrictionsChanged || foodRestrictionsChanged ||
      (updateNutrition && profile.nutrition_plan_review_needed) || (updateWorkout && profile.workout_plan_review_needed);
    const changed = [
      goalChanged ? "objetivo" : null,
      experienceChanged ? "experiencia de entrenamiento" : null,
      continuityChanged ? "continuidad del entrenamiento" : null,
      techniqueChanged ? "autoevaluación técnica" : null,
      daysChanged ? "días de entrenamiento" : null,
      durationChanged ? "duración de la sesión" : null,
      placeChanged ? "lugar de entreno" : null,
      equipmentChanged ? "material disponible" : null,
      foodRestrictionsChanged ? "alergias/intolerancias alimentarias" : null,
      restrictionsChanged ? "lesiones/molestias" : null,
    ].filter((value): value is string => Boolean(value));

    const recommendation = restrictionsChanged ? "review_health" : "update_plan";
    if (!parsed.data.confirm && parsed.data.selfReport === "bien") {
      return NextResponse.json({ action: "recommendation", recommendation: "keep_plan", changed, structuralChange });
    }
    if (!parsed.data.confirm && parsed.data.selfReport === "actualizar" && !updateWorkout) {
      return NextResponse.json({ action: "recommendation", recommendation, changed, structuralChange });
    }

    const updatedProfile = {
      ...profile,
      primary_goal: parsed.data.goal,
      experience: nextExperience,
      training_continuity: nextContinuity,
      training_technique: nextTechnique,
      days_per_week: updateWorkout ? parsed.data.daysPerWeek : profile.days_per_week,
      session_duration_minutes: updateWorkout ? parsed.data.sessionDuration : profile.session_duration_minutes,
      training_place: parsed.data.trainingPlace,
      training_equipment: nextEquipment,
      restrictions: nextRestrictions,
      food_restrictions: nextFoodRestrictions,
    };
    async function saveProfile(pendingSelected = false) {
      writesStarted = true;
      const { error: profileError } = await supabase.from("profiles").update({
        primary_goal: updatedProfile.primary_goal,
        experience: updatedProfile.experience,
        training_continuity: updatedProfile.training_continuity,
        training_technique: updatedProfile.training_technique,
        days_per_week: updatedProfile.days_per_week,
        session_duration_minutes: updatedProfile.session_duration_minutes,
        training_place: updatedProfile.training_place,
        training_equipment: updatedProfile.training_equipment,
        restrictions: updatedProfile.restrictions,
        food_restrictions: updatedProfile.food_restrictions,
        workout_plan_review_needed: updatedProfile.workout_plan_review_needed || (!updateWorkout && goalChanged) || (pendingSelected && updateWorkout),
        nutrition_plan_review_needed: updatedProfile.nutrition_plan_review_needed || (!updateNutrition && goalChanged) || (pendingSelected && updateNutrition),
      }).eq("user_id", userId);
      if (profileError) throw profileError;
    }

    if (parsed.data.selfReport === "bien") {
      if (parsed.data.proposalToken) return NextResponse.json({ error: "Tu plan o tus datos han cambiado. Revisa las respuestas de nuevo." }, { status: 409 });
      await saveProfile(Boolean(structuralChange));
      return NextResponse.json({ action: structuralChange ? "profile_updated_plan_kept" : "no_change", changed });
    }

    const { data: workoutPlan, error: workoutPlanError } = await supabase.from("workout_plans").select("id").eq("user_id", userId).eq("active", true).maybeSingle();
    if (workoutPlanError) throw workoutPlanError;
    const { data: nutritionPlan, error: nutritionPlanError } = await supabase.from("nutrition_plans").select("id").eq("user_id", userId).eq("active", true).maybeSingle();
    if (nutritionPlanError) throw nutritionPlanError;
    if ((updateWorkout && !workoutPlan) || (updateNutrition && !nutritionPlan)) {
      if (updateWorkout && workoutPlan && updateNutrition && !nutritionPlan) {
        return NextResponse.json({ error: "No hay un plan de nutrición activo. Para actualizar tu rutina, usa la revisión de entrenamiento." }, { status: 400 });
      }
      if (!parsed.data.confirm) return NextResponse.json({ action: "recommendation", recommendation: "profile_only", changed, structuralChange });
      if (parsed.data.proposalToken) return NextResponse.json({ error: "El plan activo ha cambiado. Revisa las respuestas de nuevo." }, { status: 409 });
      await saveProfile(true);
      return NextResponse.json({ action: "profile_updated_only", changed });
    }

    const { data: currentWorkoutVersion, error: currentWorkoutVersionError } = updateWorkout && workoutPlan
      ? await supabase.from("workout_plan_versions").select("id, version_number").eq("workout_plan_id", workoutPlan.id).eq("active", true).maybeSingle()
      : { data: null, error: null };
    if (currentWorkoutVersionError) throw currentWorkoutVersionError;
    const { data: currentNutritionVersion, error: currentNutritionVersionError } = updateNutrition && nutritionPlan
      ? await supabase.from("nutrition_plan_versions").select("id, version_number, meal_count").eq("nutrition_plan_id", nutritionPlan.id).eq("active", true).maybeSingle()
      : { data: null, error: null };
    if (currentNutritionVersionError) throw currentNutritionVersionError;
    if ((updateWorkout && !currentWorkoutVersion) || (updateNutrition && !currentNutritionVersion)) {
      if (updateWorkout && currentWorkoutVersion && updateNutrition && !currentNutritionVersion) {
        return NextResponse.json({ error: "No hay una versión activa del plan de nutrición. Para actualizar tu rutina, usa la revisión de entrenamiento." }, { status: 400 });
      }
      if (!parsed.data.confirm) return NextResponse.json({ action: "recommendation", recommendation: "profile_only", changed, structuralChange });
      if (parsed.data.proposalToken) return NextResponse.json({ error: "El plan activo ha cambiado. Revisa las respuestas de nuevo." }, { status: 409 });
      await saveProfile(true);
      return NextResponse.json({ action: "profile_updated_only", changed });
    }

    const reason = goalChanged ? "goal_change" : placeChanged || equipmentChanged ? "equipment_change" : restrictionsChanged ? "injury_change" : "goal_change";
    const { data: latestMeasurement, error: measurementError } = await supabase
      .from("body_measurements")
      .select("measured_at, weight_kg, waist_cm, chest_cm, arm_cm, thigh_cm")
      .eq("user_id", userId)
      .order("measured_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (measurementError) throw measurementError;
    const progressSnapshot = latestMeasurement ? {
      measured_at: latestMeasurement.measured_at,
      weight_kg: latestMeasurement.weight_kg,
      waist_cm: latestMeasurement.waist_cm,
      chest_cm: latestMeasurement.chest_cm,
      arm_cm: latestMeasurement.arm_cm,
      thigh_cm: latestMeasurement.thigh_cm,
    } : null;
    const profileForEngine = {
      ...updatedProfile,
      current_weight_kg: latestMeasurement?.weight_kg ?? updatedProfile.current_weight_kg,
      meal_count: currentNutritionVersion?.meal_count ?? updatedProfile.meal_count ?? 4,
    };
    const generatedPlan = generateInitialPlan(parsePlanningProfile(profileForEngine), updateWorkout ? await getPlanningExerciseCatalog() : [], { allowAdaptation: updateWorkout });
    if (updateWorkout) {
      const proposalToken = createHash("sha256").update(JSON.stringify({
        scope: "checkin", userId, mode: parsed.data.mode, profile, profileForEngine, progressSnapshot,
        workoutVersion: currentWorkoutVersion?.id, nutritionVersion: currentNutritionVersion?.id, generatedPlan,
      })).digest("hex");
      const adaptationNotes = generatedPlan.workoutAdaptations.flatMap((item) =>
        item.kind === "coverage" ? [`Sin ejercicio principal programado para: ${item.missingGroups.join(", ")}.`] :
          item.kind === "review" ? item.reasons :
            [`${item.dayName}: no se han podido incluir ${item.unfilled.join(", ")}.`]);
      const proposal = { action: "recommendation", recommendation: "activate_workout", changed, structuralChange, proposalToken, days: generatedPlan.days, adaptationNotes };
      if (!parsed.data.confirm) return NextResponse.json(proposal);
      if (parsed.data.proposalToken !== proposalToken) {
        return NextResponse.json({ ...proposal, error: "La propuesta ha cambiado. Comprueba la nueva rutina antes de activarla." }, { status: 409 });
      }
    }
    await saveProfile();

    const { data: run, error: runError } = await supabase
      .from("plan_generation_runs")
      .insert({ user_id: userId, run_type: "manual_regeneration", status: "pending", input_snapshot: { ...profileForEngine, progress_snapshot: progressSnapshot }, engine_version: "checkin-v1" })
      .select("id")
      .single();
    if (runError || !run) throw runError ?? new Error("Unable to start plan regeneration.");

    if (updateWorkout && workoutPlan && currentWorkoutVersion) {
      const { error: deactivateWorkoutError } = await supabase.from("workout_plan_versions").update({ active: false }).eq("id", currentWorkoutVersion.id);
      if (deactivateWorkoutError) throw deactivateWorkoutError;
      const { data: workoutVersion, error: workoutVersionError } = await supabase.from("workout_plan_versions").insert({ workout_plan_id: workoutPlan.id, generation_run_id: run.id, version_number: currentWorkoutVersion.version_number + 1, profile_snapshot: { ...profileForEngine, progress_snapshot: progressSnapshot, workout_adaptations: generatedPlan.workoutAdaptations }, reason }).select("id").single();
      if (workoutVersionError || !workoutVersion) throw workoutVersionError ?? new Error("Unable to create workout version.");

      const exerciseNames = [...new Set(generatedPlan.days.flatMap((day) => day.exercises.map((exercise) => exercise.name)))];
      const { data: exercises, error: exercisesError } = await supabase.from("exercises").select("id, name").in("name", exerciseNames);
      if (exercisesError || !exercises) throw exercisesError ?? new Error("Exercise catalog is empty.");
      const exerciseByName = new Map(exercises.map((exercise) => [exercise.name, exercise.id]));
      for (const [dayIndex, day] of generatedPlan.days.entries()) {
        const { data: workoutDay, error: dayError } = await supabase.from("workout_days").insert({ workout_plan_version_id: workoutVersion.id, name: day.name, order_number: dayIndex + 1 }).select("id").single();
        if (dayError || !workoutDay) throw dayError ?? new Error("Unable to create workout day.");
        const exercisesToInsert = day.exercises.map((exercise, exerciseIndex) => ({ workout_day_id: workoutDay.id, exercise_id: exerciseByName.get(exercise.name)!, sets: exercise.sets, repetitions: exercise.repetitions, rest_seconds: exercise.restSeconds, order_number: exerciseIndex + 1 }));
        if (exercisesToInsert.some((exercise) => !exercise.exercise_id)) throw new Error("Generated exercise is missing from catalog.");
        const { error: workoutExerciseError } = await supabase.from("workout_exercises").insert(exercisesToInsert);
        if (workoutExerciseError) throw workoutExerciseError;
      }
    }

    if (updateNutrition && nutritionPlan && currentNutritionVersion) {
      const { error: deactivateNutritionError } = await supabase.from("nutrition_plan_versions").update({ active: false }).eq("id", currentNutritionVersion.id);
      if (deactivateNutritionError) throw deactivateNutritionError;
      const { data: nutritionVersion, error: nutritionVersionError } = await supabase.from("nutrition_plan_versions").insert({ nutrition_plan_id: nutritionPlan.id, generation_run_id: run.id, version_number: currentNutritionVersion.version_number + 1, profile_snapshot: { ...profileForEngine, progress_snapshot: progressSnapshot }, calories: generatedPlan.calories, protein_grams: generatedPlan.proteinGrams, carbs_grams: generatedPlan.carbsGrams, fats_grams: generatedPlan.fatsGrams, meal_count: generatedPlan.mealCount, precision_mode: "precise", reason }).select("id").single();
      if (nutritionVersionError || !nutritionVersion) throw nutritionVersionError ?? new Error("Unable to create nutrition version.");

      const mealFoodNames = [...new Set(generatedPlan.meals.flatMap((meal) => meal.items.map((item) => item.name)))];
      const { data: mealFoods, error: mealFoodsError } = await supabase.from("foods_catalog").select("id, name").in("name", mealFoodNames);
      if (mealFoodsError || !mealFoods) throw mealFoodsError ?? new Error("Food catalog is empty.");
      const foodByName = new Map(mealFoods.map((food) => [food.name, food.id]));

      for (const [mealIndex, meal] of generatedPlan.meals.entries()) {
      const { data: nutritionMeal, error: mealError } = await supabase.from("nutrition_meals").insert({
        nutrition_plan_version_id: nutritionVersion.id,
        name: meal.name,
        meal_order: mealIndex + 1,
        suggested_time: meal.suggestedTime,
        target_calories: meal.targetCalories,
      }).select("id").single();
      if (mealError || !nutritionMeal) throw mealError ?? new Error("Unable to create nutrition meal.");

      const mealItems = meal.items.map((item) => ({
        meal_id: nutritionMeal.id,
        food_id: foodByName.get(item.name)!,
        quantity_grams: item.quantityGrams,
        role: item.role,
        alternative_group: item.alternativeGroup ?? null,
        substitution_group: item.alternativeGroup ?? null,
        weight_basis: item.weightBasis,
      }));
      if (mealItems.some((item) => !item.food_id)) throw new Error("Generated food is missing from catalog.");
        const { error: mealItemsError } = await supabase.from("nutrition_meal_items").insert(mealItems);
        if (mealItemsError) throw mealItemsError;
      }
    }

    const { error: completeRunError } = await supabase.from("plan_generation_runs").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", run.id);
    if (completeRunError) throw completeRunError;
    const { error: reviewFlagsError } = await supabase.from("profiles").update({ nutrition_plan_review_needed: updateNutrition ? false : profile.nutrition_plan_review_needed || goalChanged, workout_plan_review_needed: updateWorkout ? false : profile.workout_plan_review_needed || goalChanged }).eq("user_id", userId);
    if (reviewFlagsError) throw reviewFlagsError;

    return NextResponse.json({ action: updateWorkout && updateNutrition ? "regenerated_both" : updateWorkout ? "regenerated_workout" : "regenerated_nutrition", changed, reason, structure: generatedPlan.structure, calories: generatedPlan.calories, adaptations: updateWorkout ? generatedPlan.workoutAdaptations : [] });
  } catch (error) {
    console.error("Unable to process check-in", error instanceof Error ? error.message : "Unknown error");
    if (writesStarted) return NextResponse.json({ error: "No hemos podido completar la actualización. Puede que algunos cambios se hayan guardado: comprueba tu perfil y tu plan antes de intentarlo de nuevo." }, { status: 500 });
    if (error instanceof PlanningAvailabilityError) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "No hemos podido preparar tu revisión. Inténtalo de nuevo." }, { status: 500 });
  }
}

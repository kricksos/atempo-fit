import { NextResponse } from "next/server";
import { z } from "zod";

import { getWorkoutTemplateCatalogs } from "@/lib/manual-exercise-catalog-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { reviewWorkoutTemplate, workoutTemplates } from "@/lib/workout-templates";
import { workoutTemplateToken } from "@/lib/workout-template-token";

const requestSchema = z.object({
  templateId: z.string().min(1),
  action: z.enum(["edit", "activate"]),
  confirmActivation: z.boolean().optional(),
  reviewToken: z.string().regex(/^[a-f0-9]{64}$/),
});

export async function POST(request: Request) {
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Inicia sesión para utilizar una rutina." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "No hemos podido leer la solicitud." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Selecciona una rutina válida." }, { status: 400 });
  if (parsed.data.action === "activate" && parsed.data.confirmActivation !== true) {
    return NextResponse.json({ error: "Confirma que quieres sustituir tu rutina activa." }, { status: 400 });
  }
  const template = workoutTemplates.find((item) => item.id === parsed.data.templateId);
  if (!template) return NextResponse.json({ error: "La rutina seleccionada no está disponible." }, { status: 404 });

  const db = createAdminClient();
  try {
    const [profileResult, catalogs] = await Promise.all([
      db.from("profiles").select("experience, training_continuity, training_technique, training_place, training_equipment, restrictions, days_per_week, session_duration_minutes").eq("user_id", auth.user.id).maybeSingle(),
      getWorkoutTemplateCatalogs(),
    ]);
    if (profileResult.error) throw profileResult.error;
    const review = reviewWorkoutTemplate(template, profileResult.data, catalogs.planning, [...catalogs.manual.catalog, ...catalogs.manual.exerciseDetails]);
    if (review.issues.length) return NextResponse.json({ error: "La rutina no es compatible con tu perfil actual.", issues: review.issues }, { status: 409 });
    if (parsed.data.reviewToken !== workoutTemplateToken(review)) return NextResponse.json({ error: "La propuesta ha cambiado. Revisa los ejercicios y vuelve a intentarlo." }, { status: 409 });
    const { data: draft, error: draftError } = await db.from("manual_workout_drafts")
      .insert({ user_id: auth.user.id, name: template.name, source: "manual" }).select("id").single();
    if (draftError || !draft) throw draftError ?? new Error("Unable to create template draft");
    const { data: saved, error: saveError } = await db.rpc("save_manual_workout_draft", {
      p_user_id: auth.user.id, p_draft_id: draft.id, p_name: template.name, p_days: review.resolvedDays,
    });
    if (saveError || saved !== "saved") {
      console.error("Unable to save template draft", saveError ?? saved);
      return NextResponse.json({ error: "No hemos podido confirmar la creación de la copia. Revisa tus borradores antes de repetirlo." }, { status: 500 });
    }
    if (parsed.data.action === "edit") return NextResponse.json({ draftId: draft.id });
    const { data: published, error: publishError } = await db.rpc("publish_manual_workout_draft", { p_user_id: auth.user.id, p_draft_id: draft.id });
    if (publishError || published !== "published") {
      console.error("Unable to publish template draft", publishError ?? published);
      return NextResponse.json({ error: "No hemos podido confirmar la activación. Comprueba tu rutina actual y tus borradores antes de volver a intentarlo." }, { status: 500 });
    }
    return NextResponse.json({ published: true });
  } catch (error) {
    console.error("Unable to prepare workout template", error);
    return NextResponse.json({ error: "No hemos podido preparar la rutina. Inténtalo de nuevo." }, { status: 500 });
  }
}

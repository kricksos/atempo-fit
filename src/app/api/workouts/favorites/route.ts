import { NextResponse } from "next/server";
import { z } from "zod";

import { getManualExerciseCatalog } from "@/lib/manual-exercise-catalog-server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { workoutTemplates } from "@/lib/workout-templates";

const requestSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("template"), id: z.string().min(1).max(120), favorite: z.boolean() }),
  z.object({ kind: z.enum(["exercise", "routine", "draft"]), id: z.string().uuid(), favorite: z.boolean() }),
]);

export async function POST(request: Request) {
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Inicia sesión para guardar favoritos." }, { status: 401 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "No hemos podido leer la solicitud." }, { status: 400 });
  }
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Selecciona un favorito válido." }, { status: 400 });
  const { kind, id, favorite } = parsed.data;
  const db = createAdminClient();
  try {
    if (kind === "template") {
      if (favorite && !workoutTemplates.some((template) => template.id === id)) return NextResponse.json({ error: "La rutina no está disponible." }, { status: 404 });
      const result = favorite
        ? await db.from("favorite_workout_templates").upsert({ user_id: auth.user.id, template_id: id })
        : await db.from("favorite_workout_templates").delete().eq("user_id", auth.user.id).eq("template_id", id);
      if (result.error) throw result.error;
    } else if (kind === "exercise") {
      if (favorite) {
        const { catalog } = await getManualExerciseCatalog();
        if (!catalog.some((exercise) => exercise.id === id && exercise.available !== false)) return NextResponse.json({ error: "El ejercicio no está disponible." }, { status: 404 });
      }
      const result = favorite
        ? await db.from("favorite_exercises").upsert({ user_id: auth.user.id, exercise_id: id })
        : await db.from("favorite_exercises").delete().eq("user_id", auth.user.id).eq("exercise_id", id);
      if (result.error) throw result.error;
    } else {
      const result = kind === "routine"
        ? await db.from("workout_plans").update({ is_favorite: favorite }).eq("user_id", auth.user.id).eq("id", id).in("source", ["manual", "copied"]).is("hidden_at", null).select("id").maybeSingle()
        : await db.from("manual_workout_drafts").update({ is_favorite: favorite }).eq("user_id", auth.user.id).eq("id", id).is("published_at", null).select("id").maybeSingle();
      if (result.error) throw result.error;
      if (!result.data) return NextResponse.json({ error: "La rutina no está disponible." }, { status: 404 });
    }
    return NextResponse.json({ favorite });
  } catch (error) {
    console.error("Unable to update workout favorite", error);
    return NextResponse.json({ error: "No hemos podido guardar el favorito. Inténtalo de nuevo." }, { status: 500 });
  }
}

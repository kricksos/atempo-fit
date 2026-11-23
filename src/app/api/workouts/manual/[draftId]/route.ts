import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const draftSchema = z.object({
  name: z.string().trim().min(1).max(80),
  days: z.array(z.object({
    id: z.string().uuid().optional(),
    name: z.string().trim().min(1).max(80),
    exercises: z.array(z.object({ exerciseId: z.string().uuid(), sets: z.number().int().min(1).max(20), repetitions: z.string().trim().min(1).max(30), restSeconds: z.number().int().min(0).max(900) })).min(1).max(12),
  })).min(1).max(7),
});

type Context = { params: Promise<{ draftId: string }> };

async function draftForUser(db: ReturnType<typeof createAdminClient>, draftId: string, userId: string) {
  return db.from("manual_workout_drafts").select("id, name, source").eq("id", draftId).eq("user_id", userId).is("published_at", null).maybeSingle();
}

export async function GET(_: Request, { params }: Context) {
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { draftId } = await params;
  const db = createAdminClient();
  const { data: draft, error: draftError } = await draftForUser(db, draftId, auth.user.id);
  if (draftError) { console.error("Unable to load workout draft", draftError); return NextResponse.json({ error: "No hemos podido cargar el borrador." }, { status: 500 }); }
  if (!draft) return NextResponse.json({ error: "No se ha encontrado el borrador." }, { status: 404 });
  const { data: days, error: daysError } = await db.from("manual_workout_draft_days").select("id, name, order_number").eq("draft_id", draft.id).order("order_number");
  if (daysError) { console.error("Unable to load workout draft days", daysError); return NextResponse.json({ error: "No hemos podido cargar los días del borrador." }, { status: 500 }); }
  const dayIds = (days ?? []).map((day) => day.id);
  const { data: exercises, error: exercisesError } = dayIds.length ? await db.from("manual_workout_draft_exercises").select("draft_day_id, exercise_id, sets, repetitions, rest_seconds, order_number").in("draft_day_id", dayIds).order("order_number") : { data: [], error: null };
  if (exercisesError) { console.error("Unable to load workout draft exercises", exercisesError); return NextResponse.json({ error: "No hemos podido cargar los ejercicios del borrador." }, { status: 500 }); }
  return NextResponse.json({ draft: { ...draft, days: (days ?? []).map((day) => ({ id: day.id, name: day.name, exercises: (exercises ?? []).filter((exercise) => exercise.draft_day_id === day.id).map((exercise) => ({ exerciseId: exercise.exercise_id, sets: exercise.sets, repetitions: exercise.repetitions, restSeconds: exercise.rest_seconds })) })) } });
}

export async function PATCH(request: Request, { params }: Context) {
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const parsed = draftSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "La rutina necesita al menos un día con un ejercicio." }, { status: 400 });
  const { draftId } = await params;
  const db = createAdminClient();
  const { data, error } = await db.rpc("save_manual_workout_draft", {
    p_user_id: auth.user.id, p_draft_id: draftId, p_name: parsed.data.name, p_days: parsed.data.days,
  });
  if (error) { console.error("Unable to save workout draft", error); return NextResponse.json({ error: "No hemos podido confirmar el guardado. Vuelve a abrir el borrador para comprobarlo." }, { status: 500 }); }
  if (data === "not_found") return NextResponse.json({ error: "El borrador ya no está disponible o ya se ha activado." }, { status: 404 });
  if (data !== "saved") { console.error("Unexpected workout draft save result", data); return NextResponse.json({ error: "No hemos podido confirmar el guardado del borrador." }, { status: 500 }); }
  return NextResponse.json({ saved: true });
}

export async function DELETE(_: Request, { params }: Context) {
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { draftId } = await params;
  const db = createAdminClient();
  const { data, error } = await db.from("manual_workout_drafts").delete()
    .eq("id", draftId).eq("user_id", auth.user.id).is("published_at", null).select("id").maybeSingle();
  if (error) { console.error("Unable to delete workout draft", error); return NextResponse.json({ error: "No hemos podido eliminar el borrador." }, { status: 500 }); }
  if (!data) return NextResponse.json({ error: "El borrador ya no está disponible o ya se ha activado." }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
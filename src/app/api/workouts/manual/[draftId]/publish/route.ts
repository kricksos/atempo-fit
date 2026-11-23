import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ draftId: string }> };

export async function POST(_: Request, { params }: Context) {
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { draftId } = await params;
  const db = createAdminClient();
  const { data, error } = await db.rpc("publish_manual_workout_draft", { p_user_id: auth.user.id, p_draft_id: draftId });
  if (error) { console.error("Unable to publish manual workout", error); return NextResponse.json({ error: "No hemos podido confirmar la activación. Comprueba tu rutina actual antes de intentarlo de nuevo." }, { status: 500 }); }
  if (data === "not_found") return NextResponse.json({ error: "No se ha encontrado el borrador." }, { status: 404 });
  if (data === "already_published") return NextResponse.json({ error: "Esta rutina ya se ha activado." }, { status: 409 });
  if (data === "empty_day") return NextResponse.json({ error: "Cada día debe tener al menos un ejercicio." }, { status: 400 });
  if (data === "missing_profile") return NextResponse.json({ error: "Completa tu perfil antes de activar la rutina." }, { status: 400 });
  if (data !== "published") { console.error("Unexpected workout publish result", data); return NextResponse.json({ error: "No hemos podido confirmar la activación de la rutina." }, { status: 500 }); }
  return NextResponse.json({ published: true });
}

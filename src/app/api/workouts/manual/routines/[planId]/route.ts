import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type Context = { params: Promise<{ planId: string }> };

export async function DELETE(_: Request, { params }: Context) {
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const { planId } = await params;
  const db = createAdminClient();
  const { data, error } = await db.from("workout_plans").update({ hidden_at: new Date().toISOString() })
    .eq("id", planId).eq("user_id", auth.user.id).eq("active", false)
    .in("source", ["manual", "copied"]).is("hidden_at", null).select("id").maybeSingle();
  if (error) { console.error("Unable to remove manual workout", error); return NextResponse.json({ error: "No hemos podido eliminar la rutina de la lista." }, { status: 500 }); }
  if (!data) return NextResponse.json({ error: "La rutina no está disponible o está activa. Activa otra antes de eliminarla." }, { status: 409 });
  return NextResponse.json({ deleted: true });
}

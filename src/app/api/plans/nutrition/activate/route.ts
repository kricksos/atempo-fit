import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const requestSchema = z.object({ versionId: z.string().uuid() });

export async function POST(request: Request) {
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const parsed = requestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid nutrition version." }, { status: 400 });

  const db = createAdminClient();
  const { data: version } = await db
    .from("nutrition_plan_versions")
    .select("id, nutrition_plan_id, active")
    .eq("id", parsed.data.versionId)
    .maybeSingle();
  if (!version) return NextResponse.json({ error: "Nutrition version not found." }, { status: 404 });

  const { data: plan } = await db
    .from("nutrition_plans")
    .select("id")
    .eq("id", version.nutrition_plan_id)
    .eq("user_id", auth.user.id)
    .maybeSingle();
  if (!plan) return NextResponse.json({ error: "Nutrition version does not belong to this user." }, { status: 403 });
  if (version.active) return NextResponse.json({ activated: false, alreadyActive: true });

  const { error: deactivateError } = await db
    .from("nutrition_plan_versions")
    .update({ active: false })
    .eq("nutrition_plan_id", plan.id)
    .eq("active", true);
  if (deactivateError) return NextResponse.json({ error: "Unable to deactivate current diet." }, { status: 500 });

  const { error: activateError } = await db
    .from("nutrition_plan_versions")
    .update({ active: true })
    .eq("id", version.id);
  if (activateError) return NextResponse.json({ error: "Unable to activate nutrition version." }, { status: 500 });

  await db.from("nutrition_plans").update({ updated_at: new Date().toISOString() }).eq("id", plan.id);
  return NextResponse.json({ activated: true, versionId: version.id });
}

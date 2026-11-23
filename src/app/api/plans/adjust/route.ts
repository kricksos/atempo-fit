import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { PlanAdjustmentAvailabilityError, runPlanAdjustment } from "@/features/planning/adjust";

export async function POST() {
  const authClient = await createClient();
  const { data: authData } = await authClient.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  try {
    const result = await runPlanAdjustment(authData.user.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Unable to adjust plan", error instanceof Error ? error.message : "Unknown error");
    if (error instanceof PlanAdjustmentAvailabilityError) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ error: "Unable to adjust plan." }, { status: 500 });
  }
}


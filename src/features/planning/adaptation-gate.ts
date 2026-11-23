import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import type { GeneratedPlan } from "@/features/planning/engine";

export const adaptationTokenSchema = z.string().regex(/^[a-f0-9]{64}$/).optional();

export async function readOptionalJson(request: Request): Promise<unknown> {
  const body = await request.text();
  if (!body.trim()) return {};
  try {
    return JSON.parse(body);
  } catch (error) {
    if (error instanceof SyntaxError) return null;
    throw error;
  }
}

export function adaptationGate(plan: GeneratedPlan, token: string | undefined, context: unknown) {
  if (!plan.workoutAdaptations.length) {
    return token ? NextResponse.json({ error: "La propuesta de entrenamiento ha cambiado. Revisa tus datos y vuelve a intentarlo." }, { status: 409 }) : null;
  }
  const expected = createHash("sha256").update(JSON.stringify({ context, structure: plan.structure, days: plan.days, adaptations: plan.workoutAdaptations })).digest("hex");
  if (token === expected) return null;
  return NextResponse.json({ action: "adaptation_required", error: "La rutina necesita una confirmación antes de activarse.", structure: plan.structure, days: plan.days, adaptations: plan.workoutAdaptations, adaptationToken: expected }, { status: 409 });
}

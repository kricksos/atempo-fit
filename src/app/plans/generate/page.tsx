import { redirect } from "next/navigation";

import { WorkoutGenerationRunner } from "@/components/workout-generation-runner";
import { createClient } from "@/lib/supabase/server";

export default async function GenerateInitialPlanPage({ searchParams }: { searchParams: Promise<{ from?: string }> }) {
  const { data: auth } = await (await createClient()).auth.getUser();
  if (!auth.user) redirect("/login");
  const { from } = await searchParams;
  return <WorkoutGenerationRunner initial returnToPreview={from === "onboarding"} />;
}

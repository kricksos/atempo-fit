import type { createAdminClient } from "@/lib/supabase/admin";

export async function loadMeasurements(db: ReturnType<typeof createAdminClient>, userId: string) {
  const entries: Array<{ id: string; measured_at: string; weight_kg: number; waist_cm: number | null; chest_cm: number | null; arm_cm: number | null; thigh_cm: number | null }> = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await db.from("body_measurements")
      .select("id, measured_at, weight_kg, waist_cm, chest_cm, arm_cm, thigh_cm")
      .eq("user_id", userId)
      .order("measured_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);
    if (error) throw error;
    entries.push(...data);
    if (data.length < pageSize) return entries;
  }
}

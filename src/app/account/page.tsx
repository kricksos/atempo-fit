import Link from "next/link";

import { AccountWorkspace } from "@/components/account-workspace";
import { normalizeSubscriptionPlan, normalizeSubscriptionStatus } from "@/features/subscription/plans";
import { isAdminUser } from "@/lib/admin-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const { checkout } = await searchParams;
  const authClient = await createClient();
  const { data: auth } = await authClient.auth.getUser();
  if (!auth.user) return <main className="grid min-h-screen place-items-center bg-[#f4f1e9] text-center text-[#18231f]"><div><h1 className="text-3xl font-semibold">Necesitas iniciar sesión</h1><Link href="/login" className="mt-6 inline-flex rounded-full bg-[#18231f] px-5 py-3 text-sm font-semibold text-white">Ir al acceso</Link></div></main>;

  const db = createAdminClient();
  const [{ data: profile, error: profileError }, { data: consentRows, error: consentError }] = await Promise.all([
    db.from("profiles").select("name, primary_goal, current_weight_kg, target_weight_kg, diet_preference, experience, subscription_plan, subscription_status, subscription_started_at, subscription_renews_at, subscription_auto_renew, created_at").eq("user_id", auth.user.id).maybeSingle(),
    db.from("user_consents").select("consent_type, accepted, accepted_at").eq("user_id", auth.user.id).order("accepted_at", { ascending: false }),
  ]);
  if (profileError) throw profileError;
  if (consentError) throw consentError;
  const latestConsent = new Map<string, boolean>();
  for (const consent of consentRows ?? []) if (!latestConsent.has(consent.consent_type)) latestConsent.set(consent.consent_type, consent.accepted);
  const name = profile?.name ?? (typeof auth.user.user_metadata?.name === "string" ? auth.user.user_metadata.name : "");
  const createdAt = profile?.created_at ? new Date(profile.created_at).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : null;
  const weight = (value: number | null | undefined, fallback: string) => value != null ? `${Number(value).toFixed(1)} kg` : fallback;
  // The request time is passed to the client to keep the initial subscription state consistent during hydration.
  // eslint-disable-next-line react-hooks/purity
  const initialNow = Date.now();

  return <AccountWorkspace profile={{ name, email: auth.user.email ?? "", hasProfile: Boolean(profile), goal: profile?.primary_goal || "Sin objetivo", experience: profile?.experience || "No indicada", diet: profile?.diet_preference || "No indicada", currentWeight: weight(profile?.current_weight_kg, "Sin registro"), targetWeight: weight(profile?.target_weight_kg, "No definido"), createdAt }} subscription={{ plan: normalizeSubscriptionPlan(profile?.subscription_plan), status: normalizeSubscriptionStatus(profile?.subscription_status), startedAt: profile?.subscription_started_at ?? null, renewsAt: profile?.subscription_renews_at ?? null, autoRenew: profile?.subscription_auto_renew ?? false, email: auth.user.email ?? "" }} analytics={latestConsent.get("analytics") ?? false} healthData={latestConsent.get("health_data") ?? false} admin={isAdminUser(auth.user)} checkout={checkout} initialNow={initialNow} />;
}

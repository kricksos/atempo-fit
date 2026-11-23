export type SubscriptionPlan = "free" | "monthly" | "quarterly" | "annual";
export type SubscriptionStatus = "pending" | "active" | "paused" | "cancelled";

export const paidPlans = [
  { value: "monthly", label: "Mensual", price: 39, period: "cada mes" },
  { value: "quarterly", label: "Cada 3 meses", price: 99, period: "cada 3 meses" },
  { value: "annual", label: "Anual", price: 299, period: "cada año" },
] as const;

export function normalizeSubscriptionPlan(value: string | null | undefined): SubscriptionPlan {
  if (value == null || value === "free") return "free";
  if (value === "starter" || value === "monthly") return "monthly";
  if (value === "pro" || value === "quarterly") return "quarterly";
  if (value === "elite" || value === "annual") return "annual";
  throw new Error(`Plan de suscripción desconocido: ${value}`);
}

export function normalizeSubscriptionStatus(value: string | null | undefined): SubscriptionStatus {
  if (value == null) return "pending";
  if (value === "pending" || value === "active" || value === "paused" || value === "cancelled") return value;
  throw new Error(`Estado de suscripción desconocido: ${value}`);
}

export function hasPaidAccess(plan: SubscriptionPlan, status: SubscriptionStatus, renewsAt: string | null, now: number) {
  return plan !== "free" && (status === "active" || (status === "cancelled" && renewsAt !== null && new Date(renewsAt).getTime() > now));
}

export function subscriptionLabel(plan: SubscriptionPlan) {
  return plan === "free" ? "Free" : paidPlans.find((option) => option.value === plan)?.label ?? plan;
}

export function subscriptionStatusLabel(plan: SubscriptionPlan, status: SubscriptionStatus, autoRenew: boolean, paidAccess: boolean) {
  if (plan === "free") return "Incluido";
  if (paidAccess && !autoRenew) return "Sin renovación";
  if (paidAccess) return "Activo";
  if (status === "pending") return "Pendiente";
  if (status === "paused") return "Pausado";
  return "Cancelado";
}

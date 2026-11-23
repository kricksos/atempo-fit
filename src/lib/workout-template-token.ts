import { createHash } from "node:crypto";
import type { TemplateReview } from "@/lib/workout-templates";

export function workoutTemplateToken(review: TemplateReview) {
  return createHash("sha256").update(JSON.stringify({
    days: review.resolvedDays,
    issues: review.issues,
    warnings: review.warnings,
  })).digest("hex");
}

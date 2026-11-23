import { z } from "zod";

const exerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.number().int().positive(),
  repetitions: z.string().min(1),
  restSeconds: z.number().int().nonnegative(),
});

export const checkinRecommendationSchema = z.object({
  action: z.literal("recommendation"),
  recommendation: z.enum(["keep_plan", "update_plan", "review_health", "activate_workout", "profile_only"]),
  changed: z.array(z.string()),
  structuralChange: z.boolean(),
  proposalToken: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  days: z.array(z.object({ name: z.string().min(1), exercises: z.array(exerciseSchema).min(1) })).min(1).optional(),
  adaptationNotes: z.array(z.string().min(1)).optional(),
  error: z.string().optional(),
}).superRefine((value, context) => {
  if (value.recommendation === "activate_workout" && (!value.proposalToken || !value.days)) {
    context.addIssue({ code: "custom", message: "Falta la propuesta de entrenamiento." });
  }
});

export type CheckinRecommendation = z.infer<typeof checkinRecommendationSchema>;

export const checkinResultSchema = z.object({
  action: z.enum(["regenerated_workout", "regenerated_nutrition", "regenerated_both", "adjusted", "no_change", "profile_updated_only", "profile_updated_plan_kept"]),
  changed: z.array(z.string()),
  result: z.object({ adjusted: z.boolean() }).optional(),
});

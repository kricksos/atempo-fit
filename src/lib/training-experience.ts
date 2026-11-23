export const experienceOptions = ["Nunca he entrenado", "Menos de 1 año", "Entre 1 y 3 años", "Entre 3 y 5 años", "Más de 5 años"] as const;
export const continuityOptions = ["Entreno fuerza de forma regular actualmente", "He entrenado de forma irregular o llevo tiempo sin entrenar"] as const;
export const techniqueOptions = ["Puedo ejecutar los movimientos básicos y ajustar las cargas con autonomía", "Necesito ayuda con la técnica o las cargas"] as const;
export const undisclosedTrainingAnswer = "Prefiero no indicarlo";

export function advancedTrainingReadiness(profile: { experience: unknown; training_continuity?: unknown; training_technique?: unknown }): "ready" | "unknown" | "not_ready" {
  if (!experienceOptions.some((option) => option === profile.experience) ||
      !continuityOptions.some((option) => option === profile.training_continuity) ||
      !techniqueOptions.some((option) => option === profile.training_technique)) return "unknown";
  if (profile.experience === experienceOptions[0] || profile.experience === experienceOptions[1] ||
      profile.training_continuity !== continuityOptions[0] || profile.training_technique !== techniqueOptions[0]) return "not_ready";
  return "ready";
}

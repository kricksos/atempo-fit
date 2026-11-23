import reviewed from "../data/illustration-library/automatic-reviewed.json";

const entries = [
  { name: "Remo renegado con mancuernas", difficulty: "intermediate", equipment: ["dumbbell"], restrictions: ["back_injury", "shoulder_injury", "elbow_injury", "wrist_injury"], muscles: ["lats", "biceps", "core"] },
  { name: "Curl martillo cruzado con mancuerna", difficulty: "beginner", equipment: ["dumbbell"], restrictions: ["elbow_injury", "wrist_injury"], muscles: ["biceps", "forearms"] },
  { name: "Elevación en plano escapular con mancuernas", difficulty: "beginner", equipment: ["dumbbell"], restrictions: ["shoulder_injury"], muscles: ["deltoids", "traps"] },
  { name: "Marcha en puente de glúteos", difficulty: "intermediate", equipment: [], restrictions: ["back_injury", "hip_injury"], muscles: ["glutes", "hamstrings", "core"] },
  { name: "Abducción de cadera en cuadrupedia", difficulty: "beginner", equipment: [], restrictions: ["hip_injury", "knee_injury", "wrist_injury"], muscles: ["glutes", "core"] },
  { name: "Elevación lateral de pierna tumbado", difficulty: "beginner", equipment: [], restrictions: ["hip_injury"], muscles: ["glutes"] },
  { name: "Flexiones con manos juntas", difficulty: "intermediate", equipment: [], restrictions: ["shoulder_injury", "elbow_injury", "wrist_injury"], muscles: ["pectorals", "triceps", "core"] },
  { name: "Elevación de brazos en T tumbado", difficulty: "beginner", equipment: [], restrictions: ["shoulder_injury", "back_injury"], muscles: ["deltoids", "traps"] },
  { name: "Elevación de brazos en W tumbado", difficulty: "beginner", equipment: [], restrictions: ["shoulder_injury", "back_injury"], muscles: ["deltoids", "traps"] },
  { name: "Elevación de brazos en Y tumbado", difficulty: "beginner", equipment: [], restrictions: ["shoulder_injury", "back_injury"], muscles: ["deltoids", "traps"] },
  { name: "Ángeles inversos tumbado", difficulty: "beginner", equipment: [], restrictions: ["shoulder_injury", "back_injury"], muscles: ["deltoids", "traps"] },
  { name: "Sentadilla cosaca", difficulty: "intermediate", equipment: [], restrictions: ["knee_injury", "hip_injury", "ankle_injury"], muscles: ["quadriceps", "glutes", "adductors"] },
  { name: "Sentadilla a banco", difficulty: "beginner", equipment: ["bench"], restrictions: ["knee_injury", "hip_injury"], muscles: ["quadriceps", "glutes"] },
  { name: "Peso muerto sumo con pesa rusa", difficulty: "beginner", equipment: ["kettlebell"], restrictions: ["back_injury", "hip_injury", "knee_injury"], muscles: ["glutes", "hamstrings", "quadriceps", "core"] },
  { name: "Pullover con mancuerna en banco", difficulty: "intermediate", equipment: ["dumbbell", "bench"], restrictions: ["shoulder_injury", "elbow_injury", "back_injury"], muscles: ["lats", "pectorals", "triceps"] },
] as const;

export const moreHomeExerciseFixtures = entries.map((entry, index) => ({
  id: `migration-0052-fixture-${index}`,
  name: entry.name,
  description: reviewed[entry.name].description,
  primary_muscle: entry.muscles[0],
  muscle_groups: [...entry.muscles],
  difficulty: entry.difficulty,
  equipment_required: [...entry.equipment],
  restrictions: [...entry.restrictions],
  media_source: "atempo-illustration-pending",
  is_momentum_approved: true,
}));

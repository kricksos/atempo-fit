const levelThresholds = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000];

export function levelForXp(xp: number) {
  let level = 1;
  for (let index = 0; index < levelThresholds.length; index++) {
    if (xp >= levelThresholds[index]) level = index + 1;
  }
  const currentThreshold = levelThresholds[level - 1] ?? 0;
  const nextThreshold = levelThresholds[level] ?? null;
  const xpIntoLevel = xp - currentThreshold;
  const xpForNextLevel = nextThreshold !== null ? nextThreshold - currentThreshold : null;
  const progressPercent = xpForNextLevel ? Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100)) : 100;
  return { level, xp, xpIntoLevel, xpForNextLevel, progressPercent, isMaxLevel: nextThreshold === null };
}

/** Longest run of consecutive calendar days, plus whether that run reaches up to today/yesterday (the "current" streak). */
export function computeStreaks(dates: string[]) {
  const uniqueSorted = [...new Set(dates)].sort();
  if (uniqueSorted.length === 0) return { current: 0, best: 0 };

  let best = 1;
  let run = 1;
  for (let index = 1; index < uniqueSorted.length; index++) {
    const previousDate = new Date(`${uniqueSorted[index - 1]}T00:00:00Z`);
    const currentDate = new Date(`${uniqueSorted[index]}T00:00:00Z`);
    const diffDays = Math.round((currentDate.getTime() - previousDate.getTime()) / 86400000);
    run = diffDays === 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const lastActiveDate = uniqueSorted[uniqueSorted.length - 1];
  let current = 0;
  if (lastActiveDate === today || lastActiveDate === yesterday) {
    current = 1;
    for (let index = uniqueSorted.length - 1; index > 0; index--) {
      const previousDate = new Date(`${uniqueSorted[index - 1]}T00:00:00Z`);
      const currentDate = new Date(`${uniqueSorted[index]}T00:00:00Z`);
      const diffDays = Math.round((currentDate.getTime() - previousDate.getTime()) / 86400000);
      if (diffDays === 1) current += 1;
      else break;
    }
  }

  return { current, best };
}

export type AchievementCategory = "entrenamiento" | "nutrición" | "seguimiento" | "constancia" | "objetivos" | "progreso";
export type Achievement = { id: string; title: string; xp: number; unlocked: boolean; category: AchievementCategory };

export type GamificationInput = {
  workoutSessionsCount: number;
  measurementsCount: number;
  bodyMeasurementsCount?: number;
  nutritionDaysCount?: number;
  bestStreak: number;
  weightDeltaKg: number | null;
  targetSet?: boolean;
  targetReached?: boolean;
  weeklyActiveDays?: number;
  completedWeeklyGoals?: number;
};

export function computeAchievements(input: GamificationInput): Achievement[] {
  return [
    { id: "first_workout", title: "Primer entrenamiento", xp: 100, unlocked: input.workoutSessionsCount >= 1, category: "entrenamiento" },
    { id: "five_workouts", title: "5 entrenamientos", xp: 100, unlocked: input.workoutSessionsCount >= 5, category: "entrenamiento" },
    { id: "ten_workouts", title: "10 entrenamientos", xp: 200, unlocked: input.workoutSessionsCount >= 10, category: "entrenamiento" },
    { id: "twenty_five_workouts", title: "25 entrenamientos", xp: 300, unlocked: input.workoutSessionsCount >= 25, category: "entrenamiento" },
    { id: "thirty_workouts", title: "30 entrenamientos", xp: 400, unlocked: input.workoutSessionsCount >= 30, category: "entrenamiento" },
    { id: "fifty_workouts", title: "50 entrenamientos", xp: 600, unlocked: input.workoutSessionsCount >= 50, category: "entrenamiento" },
    { id: "hundred_workouts", title: "100 entrenamientos", xp: 1000, unlocked: input.workoutSessionsCount >= 100, category: "entrenamiento" },
    { id: "first_nutrition_day", title: "Primer día de nutrición", xp: 50, unlocked: (input.nutritionDaysCount ?? 0) >= 1, category: "nutrición" },
    { id: "nutrition_week", title: "7 días de nutrición", xp: 100, unlocked: (input.nutritionDaysCount ?? 0) >= 7, category: "nutrición" },
    { id: "nutrition_month", title: "30 días de nutrición", xp: 300, unlocked: (input.nutritionDaysCount ?? 0) >= 30, category: "nutrición" },
    { id: "nutrition_hundred_days", title: "100 días de nutrición", xp: 700, unlocked: (input.nutritionDaysCount ?? 0) >= 100, category: "nutrición" },
    { id: "first_measurement", title: "Primera medición", xp: 50, unlocked: input.measurementsCount >= 1, category: "seguimiento" },
    { id: "track_week", title: "Registrar peso 7 veces", xp: 100, unlocked: input.measurementsCount >= 7, category: "seguimiento" },
    { id: "track_month", title: "Registrar peso 30 veces", xp: 300, unlocked: input.measurementsCount >= 30, category: "seguimiento" },
    { id: "track_habit", title: "14 registros de seguimiento", xp: 150, unlocked: input.measurementsCount >= 14, category: "seguimiento" },
    { id: "streak_3", title: "3 días seguidos", xp: 50, unlocked: input.bestStreak >= 3, category: "constancia" },
    { id: "streak_7", title: "7 días seguidos", xp: 100, unlocked: input.bestStreak >= 7, category: "constancia" },
    { id: "streak_14", title: "14 días seguidos", xp: 200, unlocked: input.bestStreak >= 14, category: "constancia" },
    { id: "streak_30", title: "30 días seguidos", xp: 300, unlocked: input.bestStreak >= 30, category: "constancia" },
    { id: "streak_90", title: "90 días seguidos", xp: 1000, unlocked: input.bestStreak >= 90, category: "constancia" },
    { id: "target_set", title: "Definir un objetivo", xp: 50, unlocked: input.targetSet ?? false, category: "objetivos" },
    { id: "weekly_goal", title: "Primer objetivo semanal", xp: 100, unlocked: (input.completedWeeklyGoals ?? 0) >= 1, category: "objetivos" },
    { id: "target_reached", title: "Objetivo alcanzado", xp: 1000, unlocked: input.targetReached ?? false, category: "objetivos" },
    { id: "weight_progress", title: "Primer kg de progreso", xp: 150, unlocked: input.weightDeltaKg !== null && Math.abs(input.weightDeltaKg) >= 1, category: "progreso" },
    { id: "weight_five_kg", title: "5 kg de progreso", xp: 300, unlocked: input.weightDeltaKg !== null && Math.abs(input.weightDeltaKg) >= 5, category: "progreso" },
    { id: "weight_ten_kg", title: "10 kg de progreso", xp: 600, unlocked: input.weightDeltaKg !== null && Math.abs(input.weightDeltaKg) >= 10, category: "progreso" },
  ];
}

const ONBOARDING_XP = 150;
const XP_PER_WORKOUT = 50;
const XP_PER_MEASUREMENT = 10;

export function computeGamification(input: GamificationInput) {
  const achievements = computeAchievements(input);
  const achievementXp = achievements.filter((achievement) => achievement.unlocked).reduce((sum, achievement) => sum + achievement.xp, 0);
  const actionXp = ONBOARDING_XP + input.workoutSessionsCount * XP_PER_WORKOUT + input.measurementsCount * XP_PER_MEASUREMENT + (input.bodyMeasurementsCount ?? 0) * 20 + (input.completedWeeklyGoals ?? 0) * 100;
  const xp = actionXp + achievementXp;
  return {
    ...levelForXp(xp),
    achievements,
    weeklyGoal: {
      activeDays: input.weeklyActiveDays ?? 0,
      targetDays: 3,
      completed: (input.weeklyActiveDays ?? 0) >= 3,
    },
  };
}

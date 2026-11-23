import { foodAllowedForPlan } from "@/lib/food-restrictions";
import { gymEquipmentPreset, isExerciseEquipment, type ExerciseEquipment } from "@/lib/exercise-equipment";
import { normalizeTrainingPlace } from "@/lib/training-place";
import type { PlanningCatalogExercise } from "@/lib/exercise-catalog";
import { isPlanningExerciseCompatible, PlanningAvailabilityError } from "./workout-compatibility";
import { planCatalogWorkout } from "./workout-planner";

export { isPlanningExerciseCompatible, PlanningAvailabilityError } from "./workout-compatibility";

export type PlanningProfile = {
  sex: "male" | "female";
  age: number;
  heightCm: number;
  weightKg: number;
  goal: string;
  experience: string;
  trainingContinuity?: string | null;
  trainingTechnique?: string | null;
  daysPerWeek: number;
  sessionMinutes: number;
  sessionMinutesKnown?: boolean;
  dailyActivity?: string;
  sleepHours?: number;
  trainingPlace?: string;
  trainingEquipment?: ExerciseEquipment[] | null;
  mealCount: number;
  dietPreference?: string;
  calorieAdjustment?: number;
  restrictions?: string[];
  restrictionsKnown?: boolean;
  foodRestrictions?: string[];
  priorities?: string[];
  dislikedFoods?: string[];
  preferredMealStyles?: string[];
  mealsOutSlots?: string[];
};

export type GeneratedPlan = {
  structure: string;
  workoutAdaptations: WorkoutAdaptation[];
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatsGrams: number;
  mealCount: number;
  meals: Array<{
    name: string;
    suggestedTime: string;
    targetCalories: number;
    items: Array<{ name: string; quantityGrams: number; role: string; alternativeGroup?: string; weightBasis: "cooked" | "as_served" }>;
  }>;
  days: Array<{
    name: string;
    exercises: Array<{ name: string; sets: number; repetitions: string; restSeconds: number }>;
  }>;
};

export type WorkoutAdaptation = {
  kind?: "day";
  dayIndex: number;
  dayName: string;
  plannedExercises: number;
  actualExercises: number;
  unfilled: string[];
} | { kind: "coverage"; missingGroups: string[] } | { kind: "review"; reasons: string[] };

function numberFromText(value: string, fallback: number) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : fallback;
}

function activityFactor(experience: string, daysPerWeek: number, dailyActivity = "") {
  if (dailyActivity.includes("físico")) return 1.65;
  if (dailyActivity.includes("Activo")) return 1.55;
  if (dailyActivity.includes("Algo activo")) return 1.45;
  if (daysPerWeek >= 5) return 1.55;
  if (daysPerWeek >= 3) return 1.45;
  return experience.includes("Nunca") ? 1.3 : 1.375;
}

function goalAdjustment(goal: string) {
  if (goal.includes("Perder")) return -400;
  if (goal.includes("Ganar")) return 300;
  if (goal.includes("Recomposición")) return -100;
  return 0;
}

function structureFor(daysPerWeek: number, experience: string) {
  if (daysPerWeek <= 3 || experience.includes("Nunca") || experience.includes("Menos")) return "Full Body";
  if (daysPerWeek === 4) return "Upper / Lower";
  return "Push / Pull / Legs";
}

function applyFoodRestrictions<
  T extends { name: string; items: Array<{ name: string; role: string }> },
>(meal: T, foodRestrictions: string[], dietPreference: string) {
  const safeItems = meal.items.filter((item) => foodAllowedForPlan(item.name, foodRestrictions, dietPreference));

  if (safeItems.length > 0) {
    return { ...meal, items: safeItems };
  }

  return {
    ...meal,
    items: meal.items.filter((item) => item.role !== "dairy" && !(item.role === "vegetable" && item.name.toLowerCase().includes("brocoli")) && !(item.role === "vegetable" && item.name.toLowerCase().includes("espinaca"))),
  };
}

function firstAllowedFood(candidates: string[], foodRestrictions: string[], dietPreference: string) {
  return candidates.find((food) => foodAllowedForPlan(food, foodRestrictions, dietPreference)) ?? "Lentejas cocidas";
}

function variedAllowedFood(candidates: string[], foodRestrictions: string[], dietPreference: string, seed: number) {
  const allowed = candidates.filter((food) => foodAllowedForPlan(food, foodRestrictions, dietPreference));
  return allowed[seed % allowed.length] ?? firstAllowedFood(["Lentejas cocidas", "Garbanzos cocidos"], foodRestrictions, dietPreference);
}

function avoidedByPreference(food: string, dislikedFoods: string[]) {
  const value = food.toLowerCase();
  const groups: Record<string, string[]> = {
    Pescado: ["salmón", "salmon", "atún"],
    "Carne roja": ["ternera"],
    "Pollo y pavo": ["pollo", "pavo"],
    Huevos: ["huevo"],
    Lácteos: ["yogur", "skyr", "queso"],
    Legumbres: ["lentejas", "garbanzos"],
    "Tofu y soja": ["tofu", "tempeh", "soja"],
    "Verduras verdes": ["brocoli", "espinaca", "calabacín", "judías", "espárragos"],
    Fruta: ["platano", "manzana", "naranja", "kiwi", "frutos rojos", "piña"],
  };
  return dislikedFoods.some((group) => (groups[group] ?? []).some((term) => value.includes(term)));
}

function preferredFood(candidates: string[], foodRestrictions: string[], dietPreference: string, dislikedFoods: string[], seed: number) {
  const allowed = candidates.filter((food) => foodAllowedForPlan(food, foodRestrictions, dietPreference) && !avoidedByPreference(food, dislikedFoods));
  return allowed[seed % allowed.length] ?? variedAllowedFood(candidates, foodRestrictions, dietPreference, seed);
}

// Mirrors the restrictions/alternatives/muscle groups seeded in the exercise catalog (migration 0003) so the engine can stay a pure function.
const exerciseCatalogInfo: Record<string, { restrictions: string[]; alternatives: string[]; muscleGroups: string[] }> = {
  "Sentadilla goblet": { restrictions: [], alternatives: ["Prensa de piernas"], muscleGroups: ["piernas", "gluteos"] },
  "Press banca con mancuernas": { restrictions: ["shoulder_injury"], alternatives: ["Press banca"], muscleGroups: ["pecho", "triceps"] },
  "Jalon al pecho": { restrictions: [], alternatives: ["Remo con mancuerna"], muscleGroups: ["espalda", "biceps"] },
  "Peso muerto rumano": { restrictions: ["back_injury"], alternatives: ["Curl femoral"], muscleGroups: ["isquios", "gluteos"] },
  Plancha: { restrictions: [], alternatives: ["Pallof press"], muscleGroups: ["core"] },
  "Elevaciones laterales": { restrictions: ["shoulder_injury"], alternatives: [], muscleGroups: ["hombros"] },
  "Prensa de piernas": { restrictions: ["knee_injury"], alternatives: ["Sentadilla goblet"], muscleGroups: ["piernas", "gluteos"] },
  "Press inclinado": { restrictions: ["shoulder_injury"], alternatives: ["Press banca con mancuernas"], muscleGroups: ["pecho", "triceps"] },
  "Remo con mancuerna": { restrictions: ["back_injury"], alternatives: ["Jalon al pecho"], muscleGroups: ["espalda", "biceps"] },
  "Curl femoral": { restrictions: [], alternatives: ["Peso muerto rumano"], muscleGroups: ["isquios"] },
  "Press militar con mancuernas": { restrictions: ["shoulder_injury"], alternatives: ["Elevaciones laterales"], muscleGroups: ["hombros", "triceps"] },
  "Pallof press": { restrictions: [], alternatives: ["Plancha"], muscleGroups: ["core"] },
  Sentadilla: { restrictions: ["knee_injury"], alternatives: ["Sentadilla goblet"], muscleGroups: ["piernas", "gluteos"] },
  "Press banca": { restrictions: ["shoulder_injury"], alternatives: ["Press banca con mancuernas"], muscleGroups: ["pecho", "triceps"] },
  "Remo con barra": { restrictions: ["back_injury"], alternatives: ["Remo con mancuerna"], muscleGroups: ["espalda", "biceps"] },
  "Hip thrust": { restrictions: [], alternatives: ["Peso muerto rumano"], muscleGroups: ["gluteos"] },
  "Curl de biceps": { restrictions: ["elbow_injury"], alternatives: ["Curl femoral"], muscleGroups: ["biceps"] },
  Flexiones: { restrictions: [], alternatives: ["Press banca"], muscleGroups: ["pecho", "triceps"] },
  "Aperturas en polea": { restrictions: ["shoulder_injury"], alternatives: ["Press banca"], muscleGroups: ["pecho"] },
  "Fondos para pecho": { restrictions: ["shoulder_injury"], alternatives: ["Press banca"], muscleGroups: ["pecho", "triceps"] },
  Dominadas: { restrictions: [], alternatives: ["Jalon al pecho"], muscleGroups: ["espalda", "biceps"] },
  "Remo sentado en polea": { restrictions: ["back_injury"], alternatives: ["Jalon al pecho"], muscleGroups: ["espalda", "biceps"] },
  "Jalón de brazos rectos": { restrictions: [], alternatives: ["Jalon al pecho"], muscleGroups: ["espalda"] },
  "Face pull": { restrictions: ["shoulder_injury"], alternatives: ["Pallof press"], muscleGroups: ["hombros"] },
  "Pájaros con mancuernas": { restrictions: ["shoulder_injury"], alternatives: ["Face pull"], muscleGroups: ["hombros"] },
  "Elevaciones frontales": { restrictions: ["shoulder_injury"], alternatives: ["Elevaciones laterales"], muscleGroups: ["hombros"] },
  "Curl con barra": { restrictions: ["elbow_injury"], alternatives: ["Curl femoral"], muscleGroups: ["biceps"] },
  "Curl martillo": { restrictions: ["elbow_injury"], alternatives: ["Curl de biceps"], muscleGroups: ["biceps"] },
  "Curl predicador": { restrictions: ["elbow_injury"], alternatives: ["Curl de biceps"], muscleGroups: ["biceps"] },
  "Fondos para tríceps": { restrictions: ["shoulder_injury", "elbow_injury"], alternatives: ["Pallof press"], muscleGroups: ["triceps"] },
  "Extensión de tríceps por encima de la cabeza": { restrictions: ["elbow_injury"], alternatives: ["Pallof press"], muscleGroups: ["triceps"] },
  "Extensión de tríceps en polea": { restrictions: ["elbow_injury"], alternatives: ["Pallof press"], muscleGroups: ["triceps"] },
  "Zancadas con barra": { restrictions: ["knee_injury"], alternatives: ["Hip thrust"], muscleGroups: ["piernas", "gluteos"] },
  "Extensión de cuádriceps": { restrictions: ["knee_injury"], alternatives: ["Curl femoral"], muscleGroups: ["piernas"] },
  "Sentadilla dividida con mancuernas": { restrictions: ["knee_injury"], alternatives: ["Hip thrust"], muscleGroups: ["piernas", "gluteos"] },
  "Buenos días": { restrictions: ["back_injury"], alternatives: ["Curl femoral"], muscleGroups: ["isquios", "gluteos"] },
  "Puente de glúteos con barra": { restrictions: [], alternatives: ["Hip thrust"], muscleGroups: ["gluteos"] },
  "Aducción de cadera en polea": { restrictions: ["hip_injury"], alternatives: ["Hip thrust"], muscleGroups: ["aductores"] },
  "Crunch abdominal": { restrictions: [], alternatives: ["Plancha"], muscleGroups: ["core"] },
  "Elevación de piernas colgado": { restrictions: ["back_injury"], alternatives: ["Plancha"], muscleGroups: ["core"] },
  "Giros rusos en polea": { restrictions: ["back_injury"], alternatives: ["Pallof press"], muscleGroups: ["core"] },
  "Crunch en polea": { restrictions: ["back_injury"], alternatives: ["Plancha"], muscleGroups: ["core"] },
  Hiperextensiones: { restrictions: ["back_injury"], alternatives: ["Plancha"], muscleGroups: ["lumbar", "gluteos"] },
  "Elevación de gemelos de pie": { restrictions: [], alternatives: [], muscleGroups: ["gemelos"] },
  "Elevación de gemelos sentado": { restrictions: [], alternatives: [], muscleGroups: ["gemelos"] },
};

/** Walks the alternatives chain (max 3 hops); if every linked alternative still conflicts, falls back to any unused catalog exercise with no restrictions at all rather than keeping an unsafe pick. */
function safeExerciseName(name: string, restrictions: string[], excluded: Set<string>, catalogInfo = exerciseCatalogInfo): string {
  const conflicts = (exerciseName: string) => (catalogInfo[exerciseName]?.restrictions ?? []).some((restriction) => restrictions.includes(restriction));

  let candidate = name;
  for (let hop = 0; hop < 3; hop++) {
    if (!conflicts(candidate) && !excluded.has(candidate)) return candidate;
    const nextCandidate = catalogInfo[candidate]?.alternatives.find((alternative) => !excluded.has(alternative));
    if (!nextCandidate) break;
    candidate = nextCandidate;
  }

  const safeFallback = Object.keys(catalogInfo).find((exerciseName) => !conflicts(exerciseName) && !excluded.has(exerciseName));
  return safeFallback ?? name; // catalog has no safe option left for this restriction: keep the original as a documented MVP limitation
}

function primaryForMuscleGroup(group: string) {
  return ({ pecho: "pectorals", espalda: "lats", hombros: "deltoids", biceps: "biceps", triceps: "triceps", piernas: "quadriceps", isquios: "hamstrings", gluteos: "glutes", aductores: "adductors", gemelos: "calves", core: "core", lumbar: "lower_back" } as Record<string, string>)[group];
}

function templateMuscleLabel(name: string) {
  const group = exerciseCatalogInfo[name]?.muscleGroups[0];
  if (!group || !primaryForMuscleGroup(group)) throw new Error(`No hay un grupo muscular definido para ${name}.`);
  return ({ piernas: "cuádriceps", isquios: "isquiotibiales", gluteos: "glúteos", biceps: "bíceps", triceps: "tríceps" } as Record<string, string>)[group] ?? group;
}

type ExerciseCatalogInfo = Record<string, { restrictions: string[]; alternatives: string[]; muscleGroups: string[] }>;

function catalogInfoFromRows(catalog: PlanningCatalogExercise[]): ExerciseCatalogInfo {
  return Object.fromEntries(catalog.map((exercise) => [exercise.name, { restrictions: exercise.restrictions, alternatives: [], muscleGroups: exercise.muscleGroups }]));
}

function templatePrimary(name: string) {
  const primary = (exerciseCatalogInfo[name]?.muscleGroups ?? []).map(primaryForMuscleGroup).find(Boolean);
  if (!primary) throw new Error(`No hay un grupo muscular definido para ${name}.`);
  return primary;
}

export function generateInitialPlan(profile: PlanningProfile, catalog: PlanningCatalogExercise[] = [], options: { allowAdaptation?: boolean } = {}): GeneratedPlan {
  const daysPerWeek = Math.min(6, Math.max(2, profile.daysPerWeek));
  const sessionMinutes = profile.sessionMinutes || 60;
  let structure = structureFor(daysPerWeek, profile.experience);
  const foodRestrictions = profile.foodRestrictions ?? [];
  const dietPreference = profile.dietPreference ?? "Omnívoro";
  const dislikedFoods = profile.dislikedFoods ?? [];
  const preferredMealStyles = profile.preferredMealStyles ?? [];
  const mealsOutSlots = profile.mealsOutSlots ?? [];
  const bmr = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + (profile.sex === "male" ? 5 : -161);
  const calories = Math.max(profile.sex === "male" ? 1800 : 1500, Math.round((bmr * activityFactor(profile.experience, daysPerWeek, profile.dailyActivity) + goalAdjustment(profile.goal) + (profile.calorieAdjustment ?? 0)) / 10) * 10);
  const proteinGrams = Math.round(profile.weightKg * (profile.goal.includes("Perder") ? 2.1 : 1.8));
  const fatsGrams = Math.round(profile.weightKg * 0.9);
  const carbsGrams = Math.max(0, Math.round((calories - proteinGrams * 4 - fatsGrams * 9) / 4));
  const mealCount = Math.min(6, Math.max(3, profile.mealCount || 4));
  const mealRatios = mealCount === 3 ? [0.3, 0.4, 0.3] : mealCount === 4 ? [0.25, 0.3, 0.15, 0.3] : mealCount === 5 ? [0.2, 0.15, 0.3, 0.15, 0.2] : [0.18, 0.12, 0.25, 0.12, 0.25, 0.08];
  const baseMealTargets = mealRatios.map((ratio) => Math.round(calories * ratio));
  const vegetarian = dietPreference.toLowerCase().includes("vegetariano");
  const vegan = dietPreference.toLowerCase().includes("vegano");
  const varietySeed = Math.round(profile.age * 7 + profile.weightKg * 3 + mealCount * 11 + (profile.goal.includes("Perder") ? 5 : 0));
  const proteinOptions = vegan
    ? ["Tofu firme", "Tempeh", "Lentejas cocidas", "Garbanzos cocidos"]
    : vegetarian
      ? ["Huevos", "Tofu firme", "Tempeh", "Lentejas cocidas", "Garbanzos cocidos", "Yogur griego", "Skyr natural"]
      : ["Pechuga de pollo", "Pavo", "Ternera magra", "Salmón", "Atún al natural", "Huevos", "Yogur griego", "Skyr natural"];
  const breakfastCarbs = ["Avena", "Pan integral", "Tortitas de arroz", "Patata cocida", "Quinoa cocida"];
  const mainCarbs = ["Arroz cocido", "Pasta cocida", "Patata cocida", "Boniato cocido", "Quinoa cocida", "Cuscús cocido"];
  const vegetables = ["Brocoli", "Espinaca", "Calabacín", "Judías verdes", "Zanahoria", "Tomate", "Champiñones", "Espárragos"];
  const fruits = ["Platano", "Manzana", "Naranja", "Kiwi", "Frutos rojos", "Piña"];
  const fats = ["Aceite de oliva", "Aguacate", "Almendras", "Crema de cacahuete", "Semillas de chía"];
  const breakfastProtein = preferredFood(proteinOptions, foodRestrictions, dietPreference, dislikedFoods, varietySeed);
  const lunchProtein = preferredFood(proteinOptions, foodRestrictions, dietPreference, dislikedFoods, varietySeed + 1);
  const snackProtein = preferredFood(proteinOptions, foodRestrictions, dietPreference, dislikedFoods, varietySeed + 2);
  const dinnerProtein = preferredFood(proteinOptions, foodRestrictions, dietPreference, dislikedFoods, varietySeed + 3);
  const breakfastCarb = preferredFood(breakfastCarbs, foodRestrictions, dietPreference, dislikedFoods, varietySeed);
  const lunchCarb = preferredFood(mainCarbs, foodRestrictions, dietPreference, dislikedFoods, varietySeed + 2);
  const snackCarb = preferredFood(mainCarbs, foodRestrictions, dietPreference, dislikedFoods, varietySeed + 4);
  const dinnerCarb = preferredFood(mainCarbs, foodRestrictions, dietPreference, dislikedFoods, varietySeed + 5);
  const lunchVegetable = preferredFood(vegetables, foodRestrictions, dietPreference, dislikedFoods, varietySeed + 1);
  const dinnerVegetable = preferredFood(vegetables, foodRestrictions, dietPreference, dislikedFoods, varietySeed + 4);
  const breakfastFruit = preferredFood(fruits, foodRestrictions, dietPreference, dislikedFoods, varietySeed);
  const snackFruit = preferredFood(fruits, foodRestrictions, dietPreference, dislikedFoods, varietySeed + 3);
  const lunchFat = preferredFood(fats, foodRestrictions, dietPreference, dislikedFoods, varietySeed + 2);
  const dinnerFat = preferredFood(fats, foodRestrictions, dietPreference, dislikedFoods, varietySeed + 4);
  const dairyProteins = new Set(["Yogur griego", "Skyr natural"]);
  const proteinRole = (food: string) => dairyProteins.has(food) ? "dairy" as const : "protein" as const;
  const outsideProteinOptions = vegan
    ? ["Tofu firme", "Tempeh", "Garbanzos cocidos"]
    : vegetarian
      ? ["Huevos", "Tofu firme", "Tempeh", "Yogur griego", "Skyr natural"]
      : ["Pavo", "Atún al natural", "Pechuga de pollo", "Yogur griego", "Skyr natural"];
  const outsideCarbOptions = ["Pan integral", "Tortitas de arroz", "Avena", "Quinoa cocida"];
  const outsideVegetableOptions = ["Tomate", "Zanahoria", "Espinaca", "Calabacín"];
  const outsideFatOptions = ["Aguacate", "Almendras", "Crema de cacahuete", "Semillas de chía"];
  const outsideFruit = (seed: number) => preferredFood(fruits, foodRestrictions, dietPreference, dislikedFoods, seed);
  const outsideProtein = (seed: number) => preferredFood(outsideProteinOptions, foodRestrictions, dietPreference, dislikedFoods, seed);
  const outsideCarb = (seed: number) => preferredFood(outsideCarbOptions, foodRestrictions, dietPreference, dislikedFoods, seed);
  const outsideVegetable = (seed: number) => preferredFood(outsideVegetableOptions, foodRestrictions, dietPreference, dislikedFoods, seed);
  const outsideFat = (seed: number) => preferredFood(outsideFatOptions, foodRestrictions, dietPreference, dislikedFoods, seed);
  const portableItems = (slot: string, seed: number) => {
    if (slot === "breakfast") return [
      { name: outsideCarb(seed), quantityGrams: 70, role: "carbohydrate", alternativeGroup: "carb_base" },
      { name: outsideProtein(seed + 1), quantityGrams: 120, role: proteinRole(outsideProtein(seed + 1)), alternativeGroup: "protein" },
      { name: outsideFruit(seed + 2), quantityGrams: 120, role: "fruit", alternativeGroup: "fruit" },
    ];
    if (slot === "lunch") return [
      { name: outsideProtein(seed), quantityGrams: 140, role: proteinRole(outsideProtein(seed)), alternativeGroup: "protein" },
      { name: outsideCarb(seed + 1), quantityGrams: 80, role: "carbohydrate", alternativeGroup: "carb_base" },
      { name: outsideVegetable(seed + 2), quantityGrams: 140, role: "vegetable", alternativeGroup: "vegetable" },
      { name: outsideFruit(seed + 3), quantityGrams: 120, role: "fruit", alternativeGroup: "fruit" },
    ];
    return [
      { name: outsideProtein(seed), quantityGrams: 120, role: proteinRole(outsideProtein(seed)), alternativeGroup: "protein" },
      { name: outsideCarb(seed + 1), quantityGrams: 60, role: "carbohydrate", alternativeGroup: "carb_base" },
      { name: outsideFruit(seed + 2), quantityGrams: 120, role: "fruit", alternativeGroup: "fruit" },
      { name: outsideFat(seed + 3), quantityGrams: 25, role: "fat", alternativeGroup: "fat" },
    ];
  };
  const baseMeals = [
    { name: mealsOutSlots.includes("breakfast") ? "Desayuno fuera de casa" : preferredMealStyles.includes("Desayunos salados") ? "Desayuno salado" : "Desayuno", suggestedTime: "08:00", items: mealsOutSlots.includes("breakfast") ? portableItems("breakfast", varietySeed) : [{ name: breakfastCarb, quantityGrams: Math.max(40, Math.round(profile.weightKg * 0.8)), role: "carbohydrate", alternativeGroup: "carb_base" }, { name: breakfastProtein, quantityGrams: dairyProteins.has(breakfastProtein) ? 200 : 120, role: proteinRole(breakfastProtein), alternativeGroup: "protein" }, { name: breakfastFruit, quantityGrams: 120, role: "fruit", alternativeGroup: "fruit" }] },
    { name: mealsOutSlots.includes("mid_morning") ? "Media mañana fuera de casa" : "Media mañana", suggestedTime: "11:00", items: mealsOutSlots.includes("mid_morning") ? portableItems("snack", varietySeed + 1) : [{ name: snackProtein, quantityGrams: 120, role: proteinRole(snackProtein), alternativeGroup: "protein" }, { name: snackFruit, quantityGrams: 150, role: "fruit", alternativeGroup: "fruit" }] },
    { name: mealsOutSlots.includes("lunch") ? "Comida fuera de casa" : preferredMealStyles.includes("Bowls") ? "Bowl completo" : preferredMealStyles.includes("Ensaladas completas") ? "Ensalada completa" : "Comida", suggestedTime: "14:00", items: mealsOutSlots.includes("lunch") ? portableItems("lunch", varietySeed + 2) : [{ name: lunchProtein, quantityGrams: Math.round(profile.weightKg * 2), role: proteinRole(lunchProtein), alternativeGroup: "protein" }, { name: lunchCarb, quantityGrams: Math.round(profile.weightKg * 2.2), role: "carbohydrate", alternativeGroup: "carb_base" }, { name: lunchVegetable, quantityGrams: 200, role: "vegetable", alternativeGroup: "vegetable" }, { name: lunchFat, quantityGrams: lunchFat === "Aceite de oliva" ? 10 : 45, role: "fat", alternativeGroup: "fat" }] },
    { name: mealsOutSlots.includes("afternoon_snack") ? "Merienda fuera de casa" : "Merienda", suggestedTime: "17:30", items: mealsOutSlots.includes("afternoon_snack") ? portableItems("snack", varietySeed + 3) : [{ name: snackProtein, quantityGrams: dairyProteins.has(snackProtein) ? 200 : 150, role: proteinRole(snackProtein), alternativeGroup: "protein" }, { name: snackCarb, quantityGrams: 180, role: "carbohydrate", alternativeGroup: "carb_base" }] },
    { name: mealsOutSlots.includes("dinner") ? "Cena fuera de casa" : "Cena", suggestedTime: "21:00", items: mealsOutSlots.includes("dinner") ? portableItems("dinner", varietySeed + 4) : [{ name: dinnerProtein, quantityGrams: 160, role: proteinRole(dinnerProtein), alternativeGroup: "protein" }, { name: dinnerCarb, quantityGrams: 220, role: "carbohydrate", alternativeGroup: "carb_base" }, { name: dinnerVegetable, quantityGrams: 180, role: "vegetable", alternativeGroup: "vegetable" }, { name: dinnerFat, quantityGrams: dinnerFat === "Aceite de oliva" ? 10 : 45, role: "fat", alternativeGroup: "fat" }] },
    { name: "Recena", suggestedTime: "23:00", items: [{ name: snackProtein, quantityGrams: dairyProteins.has(snackProtein) ? 180 : 100, role: proteinRole(snackProtein), alternativeGroup: "protein" }, { name: snackFruit, quantityGrams: 100, role: "fruit", alternativeGroup: "fruit" }] },
  ];
  const mealIndexes = mealCount === 3 ? [0, 2, 4] : mealCount === 4 ? [0, 2, 3, 4] : mealCount === 5 ? [0, 1, 2, 3, 4] : [0, 1, 2, 3, 4, 5];
  const outsideSlotByMealIndex = ["breakfast", "mid_morning", "lunch", "afternoon_snack", "dinner", ""];
  const outsideIndexes = new Set(mealIndexes.map((mealIndex, index) => mealsOutSlots.includes(outsideSlotByMealIndex[mealIndex]) ? index : -1).filter((index) => index >= 0));
  const homeIndexes = mealIndexes.map((_, index) => index).filter((index) => !outsideIndexes.has(index));
  const caloriesMovedFromOutside = [...outsideIndexes].reduce((total, index) => total + Math.round(baseMealTargets[index] * 0.2), 0);
  const mealTargets = baseMealTargets.map((target, index) => outsideIndexes.has(index) ? Math.round(target * 0.8) : target + (homeIndexes.length ? Math.round(caloriesMovedFromOutside / homeIndexes.length) : 0));
  const meals = mealIndexes.map((mealIndex, index) => {
    const meal = applyFoodRestrictions({ ...baseMeals[mealIndex], targetCalories: mealTargets[index], items: baseMeals[mealIndex].items.map((item) => ({ ...item, weightBasis: item.role === "carbohydrate" ? "cooked" as const : "as_served" as const })) }, foodRestrictions, dietPreference);

    return {
      ...meal,
      targetCalories: mealTargets[index],
      items: meal.items.map((item) => ({ ...item, weightBasis: item.role === "carbohydrate" ? "cooked" as const : "as_served" as const })),
    };
  });
  if (catalog.length > 0) {
    const workout = planCatalogWorkout(profile, catalog, options.allowAdaptation ?? false);
    return { ...workout, calories, proteinGrams, carbsGrams, fatsGrams, mealCount, meals };
  }
  const exerciseCount = sessionMinutes <= 30 ? 4 : sessionMinutes <= 45 ? 5 : 6;
  const beginner = profile.experience.includes("Nunca") || profile.experience.includes("Menos");
  const performanceFocus = profile.goal.toLowerCase().includes("rendimiento");
  type WorkoutTemplate = { name: string; exercises: Array<string | { preferred: string; fallback: string }> };
  const fullBody: WorkoutTemplate[] = beginner
    ? [
      { name: "Full Body A", exercises: ["Sentadilla goblet", "Flexiones", "Jalon al pecho", "Puente de glúteos con barra", "Plancha", "Elevación de gemelos de pie"] },
      { name: "Full Body B", exercises: ["Prensa de piernas", "Press banca con mancuernas", "Remo sentado en polea", "Curl femoral", "Pallof press", "Crunch abdominal"] },
      { name: "Full Body C", exercises: ["Sentadilla dividida con mancuernas", "Press militar con mancuernas", "Jalon al pecho", "Hip thrust", "Face pull", "Curl martillo"] },
    ]
    : [
      { name: "Full Body A", exercises: ["Sentadilla goblet", "Press banca con mancuernas", "Jalon al pecho", "Peso muerto rumano", "Plancha", "Elevaciones laterales"] },
      { name: "Full Body B", exercises: ["Prensa de piernas", "Press inclinado", "Remo sentado en polea", "Curl femoral", "Face pull", "Crunch en polea"] },
      { name: "Full Body C", exercises: ["Sentadilla dividida con mancuernas", "Flexiones", "Remo con barra", "Hip thrust", "Curl martillo", "Extensión de tríceps en polea"] },
    ];
  const fourDaySplit: WorkoutTemplate[] = performanceFocus
    ? [
      { name: "Pectoral y tríceps", exercises: ["Press banca", "Press inclinado", "Fondos para pecho", "Elevaciones laterales", "Fondos para tríceps", "Extensión de tríceps en polea"] },
      { name: "Dorsal y bíceps", exercises: ["Dominadas", "Remo con barra", "Jalon al pecho", "Face pull", "Curl con barra", "Curl martillo"] },
      { name: "Cuádriceps y gemelos", exercises: ["Sentadilla", "Zancadas con barra", "Prensa de piernas", { preferred: "Aducción de cadera en polea", fallback: "Extensión de cuádriceps" }, "Sentadilla dividida con mancuernas", "Elevación de gemelos de pie"] },
      { name: "Isquiotibiales, glúteos y core", exercises: ["Peso muerto rumano", "Curl femoral", "Hip thrust", "Puente de glúteos con barra", "Elevación de gemelos sentado", "Elevación de piernas colgado"] },
    ]
    : [
      { name: "Pectoral y tríceps", exercises: ["Press banca con mancuernas", "Press inclinado", "Flexiones", "Elevaciones laterales", "Extensión de tríceps en polea", "Fondos para tríceps"] },
      { name: "Dorsal y bíceps", exercises: ["Jalon al pecho", "Remo sentado en polea", "Remo con barra", "Face pull", "Curl martillo", "Curl con barra"] },
      { name: "Cuádriceps y gemelos", exercises: ["Sentadilla goblet", "Prensa de piernas", "Zancadas con barra", { preferred: "Aducción de cadera en polea", fallback: "Extensión de cuádriceps" }, "Sentadilla dividida con mancuernas", "Elevación de gemelos de pie"] },
      { name: "Isquiotibiales, glúteos y core", exercises: ["Peso muerto rumano", "Curl femoral", "Hip thrust", "Puente de glúteos con barra", "Crunch abdominal", "Plancha"] },
    ];
  const pushPullLegs: WorkoutTemplate[] = [
    { name: "Push · Pectoral, deltoides y tríceps", exercises: ["Press banca", "Press inclinado", "Press militar con mancuernas", "Elevaciones laterales", "Fondos para tríceps", "Extensión de tríceps en polea"] },
    { name: "Pull · Dorsal y bíceps", exercises: ["Dominadas", "Remo con barra", "Jalon al pecho", "Face pull", "Curl con barra", "Curl martillo"] },
    { name: "Legs · Piernas y glúteos", exercises: ["Sentadilla", "Peso muerto rumano", { preferred: "Aducción de cadera en polea", fallback: "Prensa de piernas" }, "Hip thrust", "Curl femoral", "Elevación de gemelos de pie"] },
    { name: "Push · Deltoides y tríceps", exercises: ["Flexiones", "Aperturas en polea", "Press militar con mancuernas", "Elevaciones frontales", "Extensión de tríceps por encima de la cabeza", "Extensión de tríceps en polea"] },
    { name: "Pull · Dorsal y core", exercises: ["Remo sentado en polea", "Jalón de brazos rectos", "Pájaros con mancuernas", "Curl predicador", "Giros rusos en polea", "Crunch en polea"] },
    { name: "Legs · Isquiotibiales y gemelos", exercises: ["Zancadas con barra", "Buenos días", "Sentadilla dividida con mancuernas", "Puente de glúteos con barra", "Elevación de gemelos sentado", { preferred: "Hiperextensiones", fallback: "Remo con mancuerna" }] },
  ];
  let templates = daysPerWeek <= 3 || beginner ? fullBody : daysPerWeek === 4 ? fourDaySplit : pushPullLegs;
  const catalogInfo = catalog.length > 0 ? catalogInfoFromRows(catalog) : exerciseCatalogInfo;
  if (catalog.length > 0 && !Array.isArray(profile.trainingEquipment)) {
    throw new PlanningAvailabilityError("Indica el material disponible en la revisión de entrenamiento antes de generar la rutina.");
  }
  const workoutAdaptations: WorkoutAdaptation[] = [];
  const eligible = catalog.filter((exercise) => isPlanningExerciseCompatible(exercise, profile.restrictions ?? [], profile.trainingEquipment ?? [], beginner));
  const templateName = (exercise: string | { preferred: string; fallback: string }) => typeof exercise === "string" ? exercise : exercise.preferred;
  const templateGroups = (template: WorkoutTemplate) => [...new Set(template.exercises.flatMap((exercise) => [
    templatePrimary(templateName(exercise)), ...(typeof exercise === "string" ? [] : [templatePrimary(exercise.fallback)]),
  ]))];
  if (catalog.length > 0 && templates !== fullBody && Array.from({ length: daysPerWeek }, (_, index) => templates[index % templates.length]).some((template) =>
    !eligible.some((exercise) => exercise.primaryMuscle && templateGroups(template).includes(exercise.primaryMuscle)))) {
    templates = fullBody;
    structure = "Full Body adaptado al material";
  }
  const scheduled = Array.from({ length: daysPerWeek }, (_, index) => {
    const template = templates[index % templates.length];
    return { template, slots: template.exercises.slice(0, exerciseCount).map((exercise) => ({ exercise, requiredMissing: false })) };
  });
  const essential = ["Sentadilla goblet", "Flexiones", "Jalon al pecho", "Curl femoral", "Plancha"];
  if (catalog.length > 0) {
    for (const name of essential) {
      const group = templatePrimary(name);
      if (scheduled.some((day) => day.slots.some((slot) => templatePrimary(templateName(slot.exercise)) === group))) continue;
      const counts = new Map<string, number>();
      for (const day of scheduled) for (const slot of day.slots) {
        const key = templatePrimary(templateName(slot.exercise));
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      const replacement = scheduled.flatMap((day) => day.slots.map((slot) => ({ day, slot })))
        .filter(({ slot }) => (counts.get(templatePrimary(templateName(slot.exercise))) ?? 0) > 1)
        .sort((a, b) => Number(templateGroups(b.day.template).includes(group)) - Number(templateGroups(a.day.template).includes(group)))[0];
      if (!replacement) throw new PlanningAvailabilityError("No hay suficientes plazas para distribuir los grupos básicos de entrenamiento.");
      replacement.slot.exercise = name;
    }
    for (const name of essential) {
      const group = templatePrimary(name);
      if (eligible.some((exercise) => exercise.primaryMuscle === group)) continue;
      const slot = scheduled.flatMap((day) => day.slots).find((item) => templatePrimary(templateName(item.exercise)) === group);
      if (slot) slot.requiredMissing = true;
    }
    const additional = ["Curl martillo", "Extensión de tríceps en polea", "Elevaciones laterales", "Hip thrust", "Elevación de gemelos de pie"];
    for (const name of additional) {
      const group = templatePrimary(name);
      if (!eligible.some((exercise) => exercise.primaryMuscle === group) ||
        scheduled.some((day) => day.slots.some((slot) => templatePrimary(templateName(slot.exercise)) === group))) continue;
      const counts = new Map<string, number>();
      for (const day of scheduled) for (const slot of day.slots) {
        const key = templatePrimary(templateName(slot.exercise));
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
      const replacement = scheduled.flatMap((day) => day.slots.map((slot) => ({ day, slot })))
        .filter(({ slot }) => !slot.requiredMissing && (counts.get(templatePrimary(templateName(slot.exercise))) ?? 0) > 1)
        .sort((a, b) => Number(templateGroups(b.day.template).includes(group)) - Number(templateGroups(a.day.template).includes(group)))[0];
      if (replacement) replacement.slot.exercise = name;
    }
  }
  const weeklyGroups = new Map<string, number>();
  const weeklyExercises = new Map<string, number>();
  const groupOccurrenceLimit = (group: string) => {
    const priority = eligible.some((exercise) => exercise.primaryMuscle === group && exercise.muscleGroups.some((muscle) => (profile.priorities ?? []).includes(muscle)));
    return (beginner ? 6 : 8) + (priority ? 2 : 0);
  };
  const days = Array.from({ length: daysPerWeek }, (_, index) => {
    const restrictions = profile.restrictions ?? [];
    const usedInDay = new Set<string>();
    const priorities = profile.priorities ?? [];
    const { template, slots: planned } = scheduled[index];
    const unfilled: string[] = [];
    const groupsInDay = new Map<string, number>();
    const dayGroups = templateGroups(template);
    const selected: Array<string | null> = planned.map(() => null);
    function selectCandidate(groups: string[], exerciseIndex: number) {
      const candidates = eligible.filter((exercise) => exercise.primaryMuscle && groups.includes(exercise.primaryMuscle) && !usedInDay.has(exercise.name) &&
        (weeklyGroups.get(exercise.primaryMuscle) ?? 0) < groupOccurrenceLimit(exercise.primaryMuscle) &&
        (groupsInDay.get(exercise.primaryMuscle) ?? 0) < Math.max(1, Math.floor(groupOccurrenceLimit(exercise.primaryMuscle) / daysPerWeek)));
      candidates.sort((a, b) =>
        (groupsInDay.get(a.primaryMuscle ?? "") ?? 0) - (groupsInDay.get(b.primaryMuscle ?? "") ?? 0) ||
        (weeklyGroups.get(a.primaryMuscle ?? "") ?? 0) - (weeklyGroups.get(b.primaryMuscle ?? "") ?? 0) ||
        (weeklyExercises.get(a.name) ?? 0) - (weeklyExercises.get(b.name) ?? 0) ||
        a.name.localeCompare(b.name, "es"));
      if (!candidates.length) return null;
      const best = candidates[0];
      const tied = candidates.filter((candidate) =>
        (groupsInDay.get(candidate.primaryMuscle ?? "") ?? 0) === (groupsInDay.get(best.primaryMuscle ?? "") ?? 0) &&
        (weeklyGroups.get(candidate.primaryMuscle ?? "") ?? 0) === (weeklyGroups.get(best.primaryMuscle ?? "") ?? 0) &&
        (weeklyExercises.get(candidate.name) ?? 0) === (weeklyExercises.get(best.name) ?? 0));
      const choice = tied[(index * exerciseCount + exerciseIndex + varietySeed) % tied.length];
      usedInDay.add(choice.name);
      const group = choice.primaryMuscle!;
      groupsInDay.set(group, (groupsInDay.get(group) ?? 0) + 1);
      weeklyGroups.set(group, (weeklyGroups.get(group) ?? 0) + 1);
      weeklyExercises.set(choice.name, (weeklyExercises.get(choice.name) ?? 0) + 1);
      return choice.name;
    }
    if (catalog.length > 0) {
      planned.forEach((slot, exerciseIndex) => {
        if (slot.requiredMissing) return;
        const name = templateName(slot.exercise);
        selected[exerciseIndex] = selectCandidate([templatePrimary(name)], exerciseIndex) ??
          (typeof slot.exercise !== "string" ? selectCandidate([templatePrimary(slot.exercise.fallback)], exerciseIndex) : null);
      });
      planned.forEach((slot, exerciseIndex) => {
        if (!selected[exerciseIndex] && !slot.requiredMissing) selected[exerciseIndex] = selectCandidate(dayGroups, exerciseIndex);
      });
      planned.forEach((slot, exerciseIndex) => {
        if (!selected[exerciseIndex] && !slot.requiredMissing) selected[exerciseIndex] = selectCandidate([...new Set(eligible.flatMap((exercise) => exercise.primaryMuscle ? [exercise.primaryMuscle] : []))], exerciseIndex);
      });
    }
    const exercises = planned.flatMap((slot, exerciseIndex) => {
        const name = templateName(slot.exercise);
        const fallback = typeof slot.exercise === "string" ? undefined : slot.exercise.fallback;
        const catalogName = catalog.length > 0 ? selected[exerciseIndex] : fallback ?? name;
        if (!catalogName) {
          const label = [templateMuscleLabel(name), ...(fallback ? [templateMuscleLabel(fallback)] : [])].filter((value, position, values) => values.indexOf(value) === position).join(" o ");
          if (!options.allowAdaptation) throw new PlanningAvailabilityError(`No hay suficientes ejercicios compatibles para ${label} en el día ${index + 1}. Revisa tu material y consulta a un profesional si tienes lesiones.`);
          unfilled.push(label);
          return [];
        }
        const safeName = catalog.length === 0 && restrictions.length ? safeExerciseName(catalogName, restrictions, usedInDay, catalogInfo) : catalogName;
        usedInDay.add(safeName);
        const targetsPriority = priorities.length > 0 && (catalogInfo[safeName]?.muscleGroups ?? []).some((muscleGroup) => priorities.includes(muscleGroup));
        const baseSets = profile.experience.includes("Nunca") || (profile.sleepHours ?? 8) < 6 ? 2 : 3;
        return [{
          name: safeName,
          sets: targetsPriority ? Math.min(5, baseSets + 1) : baseSets, // extra volume for the muscle groups the user asked to prioritize
          repetitions: profile.goal.includes("Perder") ? "10-12" : "8-12",
          restSeconds: sessionMinutes <= 45 ? 60 : 90,
        }];
      });
    if (catalog.length > 0 && exercises.length === 0) {
      throw new PlanningAvailabilityError(`No hay ejercicios compatibles para el día ${index + 1} (${template.name}). Revisa tu material y consulta a un profesional si tienes lesiones.`);
    }
    const namedMuscles: Array<[string, string]> = [
      ["pectoral", "pectorals"], ["dorsal", "lats"], ["deltoides", "deltoids"], ["bíceps", "biceps"],
      ["tríceps", "triceps"], ["cuádriceps", "quadriceps"], ["isquiotibiales", "hamstrings"],
      ["glúteos", "glutes"], ["gemelos", "calves"], ["core", "core"],
    ];
    const dayName = catalog.length > 0 && namedMuscles.some(([label, muscle]) =>
      template.name.toLowerCase().includes(label) && !groupsInDay.has(muscle))
      ? `Entrenamiento ${index + 1}` : template.name;
    if (unfilled.length) workoutAdaptations.push({ dayIndex: index + 1, dayName, plannedExercises: planned.length, actualExercises: exercises.length, unfilled });
    return { name: dayName, exercises };
  });

  if (catalog.length > 0) {
    const byName = new Map(catalog.map((exercise) => [exercise.name, exercise]));
    const direct = new Map<string, Array<(typeof days)[number]["exercises"][number]>>();
    for (const day of days) for (const exercise of day.exercises) {
      const group = byName.get(exercise.name)?.primaryMuscle;
      if (!group) continue;
      const entries = direct.get(group) ?? [];
      entries.push(exercise);
      direct.set(group, entries);
    }
    for (const [group, entries] of direct) {
      const budget = groupOccurrenceLimit(group);
      entries.forEach((exercise, index) => {
        const allocation = Math.floor(budget / entries.length) + (index < budget % entries.length ? 1 : 0);
        exercise.sets = Math.max(1, Math.min(exercise.sets, allocation));
      });
    }
    const coverageNames = ["Sentadilla goblet", "Flexiones", "Jalon al pecho", "Curl femoral", "Plancha", "Curl martillo", "Extensión de tríceps en polea", "Elevaciones laterales", "Hip thrust", "Elevación de gemelos de pie"];
    const missingGroups = coverageNames.filter((name) => !direct.has(templatePrimary(name))).map(templateMuscleLabel);
    if (missingGroups.length) workoutAdaptations.push({ kind: "coverage", missingGroups });
  }
  return { structure, workoutAdaptations, calories, proteinGrams, carbsGrams, fatsGrams, mealCount, meals, days };
}

export function parsePlanningProfile(profile: Record<string, unknown>, calorieAdjustment = 0): PlanningProfile {
  const equipment = profile.training_equipment;
  const sessionMinutes = Number(profile.session_duration_minutes ?? profile.session_duration);
  if (equipment !== null && equipment !== undefined && (!Array.isArray(equipment) || !equipment.every((item): item is ExerciseEquipment => typeof item === "string" && isExerciseEquipment(item)))) {
    throw new PlanningAvailabilityError("El material guardado en tu perfil no es válido. Revísalo antes de generar la rutina.");
  }
  const trainingPlace = normalizeTrainingPlace(profile.training_place) ?? String(profile.training_place ?? "");
  return {
    sex: profile.sex === "female" ? "female" : "male",
    age: Number(profile.age),
    heightCm: Number(profile.height_cm),
    weightKg: Number(profile.current_weight_kg),
    goal: String(profile.primary_goal),
    experience: String(profile.experience),
    trainingContinuity: typeof profile.training_continuity === "string" ? profile.training_continuity : null,
    trainingTechnique: typeof profile.training_technique === "string" ? profile.training_technique : null,
    daysPerWeek: numberFromText(String(profile.days_per_week ?? "3"), 3),
    sessionMinutes: sessionMinutes || 60,
    sessionMinutesKnown: Number.isFinite(sessionMinutes) && sessionMinutes > 0,
    dailyActivity: String(profile.daily_activity ?? ""),
    sleepHours: Number(profile.sleep_hours ?? 8),
    trainingPlace,
    trainingEquipment: trainingPlace === "Gimnasio" ? gymEquipmentPreset() : Array.isArray(equipment) ? equipment : null,
    mealCount: Number(profile.meal_count ?? 4),
    dietPreference: String(profile.diet_preference ?? "Omnívoro"),
    calorieAdjustment,
    restrictions: Array.isArray(profile.restrictions) ? (profile.restrictions as string[]) : [],
    restrictionsKnown: Array.isArray(profile.restrictions),
    foodRestrictions: Array.isArray(profile.food_restrictions) ? (profile.food_restrictions as string[]) : [],
    priorities: Array.isArray(profile.priorities) ? (profile.priorities as string[]) : [],
    dislikedFoods: Array.isArray(profile.disliked_foods) ? (profile.disliked_foods as string[]) : [],
    preferredMealStyles: Array.isArray(profile.preferred_meal_styles) ? (profile.preferred_meal_styles as string[]) : [],
    mealsOutSlots: Array.isArray(profile.meals_out_slots) ? (profile.meals_out_slots as string[]) : [],
  };
}

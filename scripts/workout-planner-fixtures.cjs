const groups = [
  ["Sentadilla con peso corporal", "quadriceps"],
  ["Flexiones en pared", "pectorals"],
  ["Remo inclinado con mochila", "lats"],
  ["Plancha abdominal", "core"],
  ["Elevaciones laterales con mancuernas", "deltoids"],
  ["Patada de glúteos en cuadrupedia", "glutes"],
  ["Curl de bíceps con mancuernas", "biceps"],
  ["Patada de tríceps con mancuerna", "triceps"],
  ["Elevación de gemelos en escalón", "calves"],
];
const originalCatalog = groups.map(([name, primaryMuscle]) => ({
  name, primaryMuscle, muscleGroups: [primaryMuscle],
  restrictions: [], equipment: [], difficulty: "beginner", hasTrustedMedia: true,
}));
const hipExercise = { name: "Peso muerto rumano con pesa rusa", primaryMuscle: "hamstrings", muscleGroups: ["hamstrings"], restrictions: [], equipment: [], difficulty: "beginner", hasTrustedMedia: true };
module.exports = { originalCatalog, hipExercise };

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Hand-picked, professional catalog: common, recognizable exercises only (no strongman/competition
// variants, no near-duplicate grip variations, no name that already exists among the 45 originally
// curated exercises in src/lib/local-exercise-media.ts — those keep their real local photos and are
// trusted independently by the planning engine). Each entry maps an existing Free Exercise DB source
// name (kept only to match the row that already has verified start/end images) to a clean Spanish
// name and to Momentum's internal muscle/equipment vocabulary, mixing equipment so home, basic-gym
// and full-gym users all get enough options per muscle category.
const curated = [
  // Pectoral (14)
  { en: "Pushups", es: "Flexiones de pecho", primary: "pectorals", groups: ["pectorals", "triceps", "core"], equipment: ["none_(bodyweight_exercise)"], restrictions: [], difficulty: "beginner" },
  { en: "Incline Push-Up", es: "Flexiones inclinadas", primary: "pectorals", groups: ["pectorals", "triceps"], equipment: ["none_(bodyweight_exercise)"], restrictions: [], difficulty: "beginner" },
  { en: "Push-Ups With Feet Elevated", es: "Flexiones con pies elevados", primary: "pectorals", groups: ["pectorals", "triceps", "core"], equipment: ["none_(bodyweight_exercise)"], restrictions: ["shoulder_injury"], difficulty: "intermediate" },
  { en: "Push-Up Wide", es: "Flexiones con manos abiertas", primary: "pectorals", groups: ["pectorals"], equipment: ["none_(bodyweight_exercise)"], restrictions: ["shoulder_injury"], difficulty: "beginner" },
  { en: "Barbell Bench Press - Medium Grip", es: "Press banca con barra", primary: "pectorals", groups: ["pectorals", "triceps"], equipment: ["barbell", "bench"], restrictions: ["shoulder_injury"], difficulty: "intermediate" },
  { en: "Decline Dumbbell Bench Press", es: "Press banca declinado con mancuernas", primary: "pectorals", groups: ["pectorals", "triceps"], equipment: ["dumbbell", "bench"], restrictions: ["shoulder_injury"], difficulty: "intermediate" },
  { en: "Smith Machine Bench Press", es: "Press banca en máquina Smith", primary: "pectorals", groups: ["pectorals", "triceps"], equipment: ["smith_machine"], restrictions: ["shoulder_injury"], difficulty: "beginner" },
  { en: "Incline Dumbbell Flyes", es: "Aperturas inclinadas con mancuernas", primary: "pectorals", groups: ["pectorals"], equipment: ["dumbbell", "incline_bench"], restrictions: ["shoulder_injury"], difficulty: "intermediate" },
  { en: "Dumbbell Flyes", es: "Apertura de pecho con mancuernas en banco", primary: "pectorals", groups: ["pectorals"], equipment: ["dumbbell", "bench"], restrictions: ["shoulder_injury"], difficulty: "intermediate" },
  { en: "Incline Cable Flye", es: "Aperturas inclinadas en polea", primary: "pectorals", groups: ["pectorals"], equipment: ["cable_machine"], restrictions: ["shoulder_injury"], difficulty: "intermediate" },
  { en: "Cable Crossover", es: "Cruce de poleas de pie para pectoral", primary: "pectorals", groups: ["pectorals"], equipment: ["cable_machine"], restrictions: ["shoulder_injury"], difficulty: "intermediate" },
  { en: "Machine Bench Press", es: "Press banca en máquina", primary: "pectorals", groups: ["pectorals", "triceps"], equipment: ["machine"], restrictions: ["shoulder_injury"], difficulty: "beginner" },
  { en: "Smith Machine Incline Bench Press", es: "Press banca inclinado en máquina Smith", primary: "pectorals", groups: ["pectorals", "triceps"], equipment: ["smith_machine"], restrictions: ["shoulder_injury"], difficulty: "intermediate" },
  { en: "Cable Chest Press", es: "Press de pecho en polea", primary: "pectorals", groups: ["pectorals", "triceps"], equipment: ["cable_machine"], restrictions: ["shoulder_injury"], difficulty: "beginner" },

  // Dorsal (12)
  { en: "Chin-Up", es: "Dominada supina", primary: "lats", groups: ["lats", "biceps"], equipment: ["pull-up_bar"], restrictions: [], difficulty: "intermediate" },
  { en: "Wide-Grip Lat Pulldown", es: "Jalón al pecho con agarre amplio", primary: "lats", groups: ["lats", "biceps"], equipment: ["cable_machine"], restrictions: [], difficulty: "beginner" },
  { en: "Close-Grip Front Lat Pulldown", es: "Jalón frontal al pecho con agarre cerrado", primary: "lats", groups: ["lats", "biceps"], equipment: ["cable_machine"], restrictions: [], difficulty: "beginner" },
  { en: "Rope Straight-Arm Pulldown", es: "Jalón de brazos rectos con cuerda", primary: "lats", groups: ["lats"], equipment: ["cable_machine"], restrictions: [], difficulty: "beginner" },
  { en: "Cable Rope Rear-Delt Rows", es: "Remo con cuerda para espalda alta", primary: "lats", groups: ["lats", "deltoids"], equipment: ["cable_machine"], restrictions: ["back_injury"], difficulty: "beginner" },
  { en: "Elevated Cable Rows", es: "Remo elevado en polea", primary: "lats", groups: ["lats", "biceps"], equipment: ["cable_machine"], restrictions: ["back_injury"], difficulty: "beginner" },
  { en: "Kneeling High Pulley Row", es: "Remo en polea alta de rodillas", primary: "lats", groups: ["lats", "biceps"], equipment: ["cable_machine"], restrictions: ["back_injury"], difficulty: "intermediate" },
  { en: "Bent Over Barbell Row", es: "Remo inclinado con barra", primary: "lats", groups: ["lats", "biceps"], equipment: ["barbell"], restrictions: ["back_injury"], difficulty: "intermediate" },
  { en: "Reverse Grip Bent-Over Rows", es: "Remo inclinado con agarre supino", primary: "lats", groups: ["lats", "biceps"], equipment: ["barbell"], restrictions: ["back_injury"], difficulty: "intermediate" },
  { en: "Bent Over Two-Dumbbell Row", es: "Remo inclinado con dos mancuernas", primary: "lats", groups: ["lats", "biceps"], equipment: ["dumbbell"], restrictions: ["back_injury"], difficulty: "intermediate" },
  { en: "One-Arm Dumbbell Row", es: "Remo a un brazo con mancuerna", primary: "lats", groups: ["lats", "biceps"], equipment: ["dumbbell", "bench"], restrictions: ["back_injury"], difficulty: "beginner" },
  { en: "Inverted Row", es: "Remo invertido con peso corporal", primary: "lats", groups: ["lats", "biceps"], equipment: ["none_(bodyweight_exercise)"], restrictions: [], difficulty: "beginner" },

  // Deltoides (13)
  { en: "Dumbbell Shoulder Press", es: "Press de hombros con mancuernas", primary: "deltoids", groups: ["deltoids", "triceps"], equipment: ["dumbbell"], restrictions: ["shoulder_injury"], difficulty: "intermediate" },
  { en: "Dumbbell One-Arm Shoulder Press", es: "Press de hombros a un brazo con mancuerna", primary: "deltoids", groups: ["deltoids", "triceps"], equipment: ["dumbbell"], restrictions: ["shoulder_injury"], difficulty: "intermediate" },
  { en: "Barbell Shoulder Press", es: "Press militar con barra", primary: "deltoids", groups: ["deltoids", "triceps"], equipment: ["barbell"], restrictions: ["shoulder_injury"], difficulty: "intermediate" },
  { en: "Standing Military Press", es: "Press militar de pie", primary: "deltoids", groups: ["deltoids", "triceps"], equipment: ["barbell"], restrictions: ["shoulder_injury"], difficulty: "intermediate" },
  { en: "Arnold Dumbbell Press", es: "Press Arnold con mancuernas", primary: "deltoids", groups: ["deltoids", "triceps"], equipment: ["dumbbell"], restrictions: ["shoulder_injury"], difficulty: "intermediate" },
  { en: "Cable Shoulder Press", es: "Press de hombros en polea", primary: "deltoids", groups: ["deltoids", "triceps"], equipment: ["cable_machine"], restrictions: ["shoulder_injury"], difficulty: "beginner" },
  { en: "Smith Machine Overhead Shoulder Press", es: "Press de hombros en máquina Smith", primary: "deltoids", groups: ["deltoids", "triceps"], equipment: ["smith_machine"], restrictions: ["shoulder_injury"], difficulty: "intermediate" },
  { en: "Side Lateral Raise", es: "Elevaciones laterales con mancuernas", primary: "deltoids", groups: ["deltoids"], equipment: ["dumbbell"], restrictions: ["shoulder_injury"], difficulty: "beginner" },
  { en: "Dumbbell Lying Rear Lateral Raise", es: "Elevación posterior tumbado con mancuernas", primary: "deltoids", groups: ["deltoids"], equipment: ["dumbbell", "bench"], restrictions: ["shoulder_injury"], difficulty: "intermediate" },
  { en: "Reverse Flyes", es: "Aperturas posteriores con mancuernas", primary: "deltoids", groups: ["deltoids"], equipment: ["dumbbell"], restrictions: ["shoulder_injury"], difficulty: "beginner" },
  { en: "Face Pull", es: "Face pull en polea", primary: "deltoids", groups: ["deltoids"], equipment: ["cable_machine"], restrictions: ["shoulder_injury"], difficulty: "beginner" },
  { en: "Standing Dumbbell Upright Row", es: "Remo vertical de pie con mancuernas", primary: "deltoids", groups: ["deltoids"], equipment: ["dumbbell"], restrictions: ["shoulder_injury"], difficulty: "beginner" },
  { en: "External Rotation with Cable", es: "Rotación externa de hombro en polea", primary: "deltoids", groups: ["deltoids"], equipment: ["cable_machine"], restrictions: ["shoulder_injury"], difficulty: "beginner" },

  // Bíceps (12)
  { en: "Dumbbell Bicep Curl", es: "Curl de bíceps con mancuernas", primary: "biceps", groups: ["biceps"], equipment: ["dumbbell"], restrictions: ["elbow_injury"], difficulty: "beginner" },
  { en: "Dumbbell Alternate Bicep Curl", es: "Curl de bíceps alterno con mancuernas", primary: "biceps", groups: ["biceps"], equipment: ["dumbbell"], restrictions: ["elbow_injury"], difficulty: "beginner" },
  { en: "Hammer Curls", es: "Curl martillo con mancuernas", primary: "biceps", groups: ["biceps"], equipment: ["dumbbell"], restrictions: ["elbow_injury"], difficulty: "beginner" },
  { en: "Incline Hammer Curls", es: "Curl martillo inclinado con mancuernas", primary: "biceps", groups: ["biceps"], equipment: ["dumbbell", "incline_bench"], restrictions: ["elbow_injury"], difficulty: "intermediate" },
  { en: "Cable Hammer Curls - Rope Attachment", es: "Curl martillo en polea con cuerda", primary: "biceps", groups: ["biceps"], equipment: ["cable_machine"], restrictions: ["elbow_injury"], difficulty: "beginner" },
  { en: "Preacher Curl", es: "Curl predicador con barra", primary: "biceps", groups: ["biceps"], equipment: ["barbell", "bench"], restrictions: ["elbow_injury"], difficulty: "intermediate" },
  { en: "Cable Preacher Curl", es: "Curl predicador en polea", primary: "biceps", groups: ["biceps"], equipment: ["cable_machine"], restrictions: ["elbow_injury"], difficulty: "intermediate" },
  { en: "Concentration Curls", es: "Curl de concentración con mancuerna", primary: "biceps", groups: ["biceps"], equipment: ["dumbbell"], restrictions: ["elbow_injury"], difficulty: "beginner" },
  { en: "Seated Dumbbell Curl", es: "Curl de bíceps sentado con mancuerna", primary: "biceps", groups: ["biceps"], equipment: ["dumbbell", "bench"], restrictions: ["elbow_injury"], difficulty: "beginner" },
  { en: "Standing Dumbbell Reverse Curl", es: "Curl inverso de pie con mancuernas", primary: "biceps", groups: ["biceps"], equipment: ["dumbbell"], restrictions: ["elbow_injury"], difficulty: "beginner" },
  { en: "Machine Bicep Curl", es: "Curl de bíceps en máquina", primary: "biceps", groups: ["biceps"], equipment: ["machine"], restrictions: ["elbow_injury"], difficulty: "beginner" },
  { en: "Zottman Curl", es: "Curl Zottman con mancuernas", primary: "biceps", groups: ["biceps"], equipment: ["dumbbell"], restrictions: ["elbow_injury"], difficulty: "intermediate" },

  // Tríceps (10)
  { en: "Triceps Pushdown - Rope Attachment", es: "Extensión de tríceps en polea con agarre de cuerda", primary: "triceps", groups: ["triceps"], equipment: ["cable_machine"], restrictions: ["elbow_injury"], difficulty: "beginner" },
  { en: "Cable Rope Overhead Triceps Extension", es: "Extensión de tríceps por encima de la cabeza en polea con cuerda", primary: "triceps", groups: ["triceps"], equipment: ["cable_machine"], restrictions: ["elbow_injury", "shoulder_injury"], difficulty: "intermediate" },
  { en: "Standing Overhead Barbell Triceps Extension", es: "Extensión de tríceps por encima de la cabeza con barra", primary: "triceps", groups: ["triceps"], equipment: ["barbell"], restrictions: ["elbow_injury", "shoulder_injury"], difficulty: "intermediate" },
  { en: "Standing Dumbbell Triceps Extension", es: "Extensión de tríceps con mancuerna", primary: "triceps", groups: ["triceps"], equipment: ["dumbbell"], restrictions: ["elbow_injury"], difficulty: "beginner" },
  { en: "One Arm Pronated Dumbbell Triceps Extension", es: "Extensión de tríceps a un brazo con mancuerna", primary: "triceps", groups: ["triceps"], equipment: ["dumbbell"], restrictions: ["elbow_injury"], difficulty: "intermediate" },
  { en: "Seated Triceps Press", es: "Press de tríceps sentado con mancuerna", primary: "triceps", groups: ["triceps"], equipment: ["dumbbell", "bench"], restrictions: ["elbow_injury"], difficulty: "beginner" },
  { en: "Machine Triceps Extension", es: "Extensión de tríceps en máquina", primary: "triceps", groups: ["triceps"], equipment: ["machine"], restrictions: ["elbow_injury"], difficulty: "beginner" },
  { en: "Tricep Dumbbell Kickback", es: "Patada de tríceps con mancuerna", primary: "triceps", groups: ["triceps"], equipment: ["dumbbell", "bench"], restrictions: ["elbow_injury"], difficulty: "beginner" },
  { en: "Bench Dips", es: "Fondos en banco para tríceps", primary: "triceps", groups: ["triceps"], equipment: ["bench"], restrictions: ["shoulder_injury", "elbow_injury"], difficulty: "beginner" },
  { en: "EZ-Bar Skullcrusher", es: "Press francés con barra Z", primary: "triceps", groups: ["triceps"], equipment: ["barbell", "bench"], restrictions: ["elbow_injury"], difficulty: "intermediate" },

  // Cuádriceps (13)
  { en: "Barbell Squat", es: "Sentadilla con barra", primary: "quadriceps", groups: ["quadriceps", "glutes"], equipment: ["barbell"], restrictions: ["knee_injury"], difficulty: "intermediate" },
  { en: "Bodyweight Squat", es: "Sentadilla con peso corporal", primary: "quadriceps", groups: ["quadriceps", "glutes"], equipment: ["none_(bodyweight_exercise)"], restrictions: ["knee_injury"], difficulty: "beginner" },
  { en: "Goblet Squat", es: "Sentadilla goblet con mancuerna", primary: "quadriceps", groups: ["quadriceps", "glutes"], equipment: ["dumbbell"], restrictions: ["knee_injury"], difficulty: "beginner" },
  { en: "Dumbbell Squat", es: "Sentadilla con mancuernas", primary: "quadriceps", groups: ["quadriceps", "glutes"], equipment: ["dumbbell"], restrictions: ["knee_injury"], difficulty: "beginner" },
  { en: "Front Barbell Squat", es: "Sentadilla frontal con barra", primary: "quadriceps", groups: ["quadriceps", "glutes"], equipment: ["barbell"], restrictions: ["knee_injury"], difficulty: "intermediate" },
  { en: "Smith Machine Squat", es: "Sentadilla en máquina Smith", primary: "quadriceps", groups: ["quadriceps", "glutes"], equipment: ["smith_machine"], restrictions: ["knee_injury"], difficulty: "beginner" },
  { en: "Hack Squat", es: "Sentadilla hack en máquina", primary: "quadriceps", groups: ["quadriceps", "glutes"], equipment: ["machine"], restrictions: ["knee_injury"], difficulty: "intermediate" },
  { en: "Narrow Stance Leg Press", es: "Prensa de piernas con postura estrecha", primary: "quadriceps", groups: ["quadriceps", "glutes"], equipment: ["machine"], restrictions: ["knee_injury"], difficulty: "intermediate" },
  { en: "Leg Extensions", es: "Extensión de cuádriceps en máquina", primary: "quadriceps", groups: ["quadriceps"], equipment: ["machine"], restrictions: ["knee_injury"], difficulty: "beginner" },
  { en: "Dumbbell Lunges", es: "Zancadas con mancuernas", primary: "quadriceps", groups: ["quadriceps", "glutes"], equipment: ["dumbbell"], restrictions: ["knee_injury"], difficulty: "beginner" },
  { en: "Bodyweight Walking Lunge", es: "Zancadas caminando con peso corporal", primary: "quadriceps", groups: ["quadriceps", "glutes"], equipment: ["none_(bodyweight_exercise)"], restrictions: ["knee_injury"], difficulty: "beginner" },
  { en: "Crossover Reverse Lunge", es: "Zancada cruzada hacia atrás", primary: "quadriceps", groups: ["quadriceps", "glutes", "adductors"], equipment: ["none_(bodyweight_exercise)"], restrictions: ["knee_injury"], difficulty: "intermediate" },
  { en: "Dumbbell Squat To A Bench", es: "Sentadilla con mancuerna a banco", primary: "quadriceps", groups: ["quadriceps", "glutes"], equipment: ["dumbbell", "bench"], restrictions: ["knee_injury"], difficulty: "beginner" },

  // Isquiotibiales (10)
  { en: "Romanian Deadlift", es: "Peso muerto rumano clásico con barra", primary: "hamstrings", groups: ["hamstrings", "glutes"], equipment: ["barbell"], restrictions: ["back_injury"], difficulty: "intermediate" },
  { en: "Barbell Deadlift", es: "Peso muerto con barra", primary: "hamstrings", groups: ["hamstrings", "glutes", "lower_back"], equipment: ["barbell"], restrictions: ["back_injury"], difficulty: "intermediate" },
  { en: "Sumo Deadlift", es: "Peso muerto sumo con barra", primary: "hamstrings", groups: ["hamstrings", "glutes", "adductors"], equipment: ["barbell"], restrictions: ["back_injury"], difficulty: "intermediate" },
  { en: "Stiff-Legged Dumbbell Deadlift", es: "Peso muerto con piernas rígidas y mancuernas", primary: "hamstrings", groups: ["hamstrings", "glutes"], equipment: ["dumbbell"], restrictions: ["back_injury"], difficulty: "intermediate" },
  { en: "Kettlebell One-Legged Deadlift", es: "Peso muerto a una pierna con kettlebell", primary: "hamstrings", groups: ["hamstrings", "glutes", "core"], equipment: ["kettlebell"], restrictions: ["back_injury"], difficulty: "intermediate" },
  { en: "Cable Deadlifts", es: "Peso muerto en polea", primary: "hamstrings", groups: ["hamstrings", "glutes"], equipment: ["cable_machine"], restrictions: ["back_injury"], difficulty: "beginner" },
  { en: "Lying Leg Curls", es: "Curl femoral tumbado en máquina", primary: "hamstrings", groups: ["hamstrings"], equipment: ["machine"], restrictions: [], difficulty: "beginner" },
  { en: "Seated Leg Curl", es: "Curl femoral sentado en máquina", primary: "hamstrings", groups: ["hamstrings"], equipment: ["machine"], restrictions: [], difficulty: "beginner" },
  { en: "Standing Leg Curl", es: "Curl femoral de pie en máquina", primary: "hamstrings", groups: ["hamstrings"], equipment: ["machine"], restrictions: [], difficulty: "beginner" },
  { en: "Natural Glute Ham Raise", es: "Elevación natural de glúteo-isquiotibial", primary: "hamstrings", groups: ["hamstrings", "glutes"], equipment: ["none_(bodyweight_exercise)"], restrictions: ["knee_injury"], difficulty: "intermediate" },

  // Glúteos (7)
  { en: "Barbell Hip Thrust", es: "Empuje de cadera con barra", primary: "glutes", groups: ["glutes", "hamstrings"], equipment: ["barbell", "bench"], restrictions: ["back_injury"], difficulty: "intermediate" },
  { en: "Single Leg Glute Bridge", es: "Puente de glúteos a una pierna", primary: "glutes", groups: ["glutes"], equipment: ["none_(bodyweight_exercise)"], restrictions: [], difficulty: "beginner" },
  { en: "Glute Kickback", es: "Patada de glúteo en polea", primary: "glutes", groups: ["glutes"], equipment: ["cable_machine"], restrictions: [], difficulty: "beginner" },
  { en: "One-Legged Cable Kickback", es: "Patada de glúteo a una pierna en polea", primary: "glutes", groups: ["glutes"], equipment: ["cable_machine"], restrictions: [], difficulty: "beginner" },
  { en: "Dumbbell Rear Lunge", es: "Zancada posterior con mancuerna", primary: "glutes", groups: ["glutes", "quadriceps"], equipment: ["dumbbell"], restrictions: ["knee_injury"], difficulty: "beginner" },
  { en: "Barbell Step Ups", es: "Subida al cajón con barra", primary: "glutes", groups: ["glutes", "quadriceps"], equipment: ["barbell"], restrictions: ["knee_injury"], difficulty: "intermediate" },
  { en: "Dumbbell Step Ups", es: "Subida al cajón con mancuernas", primary: "glutes", groups: ["glutes", "quadriceps"], equipment: ["dumbbell"], restrictions: ["knee_injury"], difficulty: "beginner" },

  // Aductores (2)
  { en: "Adductor", es: "Aductor en máquina", primary: "adductors", groups: ["adductors"], equipment: ["machine"], restrictions: [], difficulty: "beginner" },
  { en: "Band Hip Adductions", es: "Aducción de cadera con banda", primary: "adductors", groups: ["adductors"], equipment: ["resistance_band"], restrictions: [], difficulty: "beginner" },

  // Gemelos (4)
  { en: "Standing Dumbbell Calf Raise", es: "Elevación de gemelos de pie con mancuernas", primary: "calves", groups: ["calves"], equipment: ["dumbbell"], restrictions: [], difficulty: "beginner" },
  { en: "Barbell Seated Calf Raise", es: "Elevación de gemelos sentado con barra", primary: "calves", groups: ["calves"], equipment: ["barbell"], restrictions: [], difficulty: "beginner" },
  { en: "Donkey Calf Raises", es: "Elevación de gemelos estilo burro", primary: "calves", groups: ["calves"], equipment: ["machine"], restrictions: [], difficulty: "intermediate" },
  { en: "Calf Press On The Leg Press Machine", es: "Prensa de gemelos en máquina de piernas", primary: "calves", groups: ["calves"], equipment: ["machine"], restrictions: [], difficulty: "beginner" },

  // Zona lumbar (4)
  { en: "Hyperextensions (Back Extensions)", es: "Hiperextensiones lumbares", primary: "lower_back", groups: ["lower_back", "glutes", "hamstrings"], equipment: ["machine"], restrictions: ["back_injury"], difficulty: "beginner" },
  { en: "Good Morning", es: "Buenos días con barra", primary: "lower_back", groups: ["lower_back", "hamstrings", "glutes"], equipment: ["barbell"], restrictions: ["back_injury"], difficulty: "intermediate" },
  { en: "Reverse Hyperextension", es: "Hiperextensión inversa", primary: "lower_back", groups: ["lower_back", "glutes"], equipment: ["machine"], restrictions: ["back_injury"], difficulty: "intermediate" },
  { en: "Superman", es: "Extensión de espalda tipo Superman", primary: "lower_back", groups: ["lower_back", "glutes"], equipment: ["none_(bodyweight_exercise)"], restrictions: ["back_injury"], difficulty: "beginner" },

  // Core (12)
  { en: "Plank", es: "Plancha abdominal", primary: "core", groups: ["core"], equipment: ["none_(bodyweight_exercise)"], restrictions: [], difficulty: "beginner" },
  { en: "Crunches", es: "Encogimientos abdominales", primary: "core", groups: ["core"], equipment: ["none_(bodyweight_exercise)"], restrictions: ["back_injury"], difficulty: "beginner" },
  { en: "Reverse Crunch", es: "Crunch inverso", primary: "core", groups: ["core"], equipment: ["none_(bodyweight_exercise)"], restrictions: ["back_injury"], difficulty: "beginner" },
  { en: "Russian Twist", es: "Giro ruso", primary: "core", groups: ["core"], equipment: ["none_(bodyweight_exercise)"], restrictions: ["back_injury"], difficulty: "beginner" },
  { en: "Cable Russian Twists", es: "Giro ruso en polea", primary: "core", groups: ["core"], equipment: ["cable_machine"], restrictions: ["back_injury"], difficulty: "intermediate" },
  { en: "Ab Crunch Machine", es: "Crunch en máquina", primary: "core", groups: ["core"], equipment: ["machine"], restrictions: ["back_injury"], difficulty: "beginner" },
  { en: "Standing Cable Wood Chop", es: "Giro de leñador en polea de pie", primary: "core", groups: ["core"], equipment: ["cable_machine"], restrictions: ["back_injury"], difficulty: "intermediate" },
  { en: "Dead Bug", es: "Estabilización de core tumbado", primary: "core", groups: ["core"], equipment: ["none_(bodyweight_exercise)"], restrictions: [], difficulty: "beginner" },
  { en: "Mountain Climbers", es: "Escaladores", primary: "core", groups: ["core"], equipment: ["none_(bodyweight_exercise)"], restrictions: [], difficulty: "beginner" },
  { en: "Pallof Press", es: "Press Pallof en polea", primary: "core", groups: ["core"], equipment: ["cable_machine"], restrictions: [], difficulty: "beginner" },
  { en: "Flutter Kicks", es: "Patada de tijera", primary: "core", groups: ["core"], equipment: ["none_(bodyweight_exercise)"], restrictions: ["back_injury"], difficulty: "beginner" },
  { en: "Farmer's Walk", es: "Paseo del granjero con mancuernas", primary: "core", groups: ["core"], equipment: ["dumbbell"], restrictions: ["back_injury"], difficulty: "beginner" },
];

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "supabase", "migrations", "0043_serious_exercise_catalog.sql");

function sql(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

const names = new Set(curated.map((item) => item.en));
if (names.size !== curated.length) throw new Error("Duplicate source names in curated list");
const spanishNames = new Set(curated.map((item) => item.es));
if (spanishNames.size !== curated.length) throw new Error("Duplicate Spanish names in curated list");

const statements = curated.map((item) => `update public.exercises set
  name = ${sql(item.es)},
  primary_muscle = ${sql(item.primary)},
  muscle_groups = ${sql(JSON.stringify(item.groups))}::jsonb,
  equipment_required = ${sql(JSON.stringify(item.equipment))}::jsonb,
  restrictions = ${sql(JSON.stringify(item.restrictions))}::jsonb,
  difficulty = ${sql(item.difficulty)},
  is_momentum_approved = true,
  updated_at = now()
where media_source = 'free-exercise-db' and name = ${sql(item.en)};`);

const migration = `-- Serious, hand-picked exercise catalog: ${curated.length} common, recognizable exercises
-- covering every muscle category with home/basic-gym/full-gym equipment variety. Combined with the
-- 45 originally curated local-photo exercises (see src/lib/local-exercise-media.ts), the planning
-- engine now selects from ${curated.length} + 45 trusted, professionally named exercises.
-- Resets approval so only this curated list is used for automatic plan generation and the manual builder.
update public.exercises set is_momentum_approved = false where media_source = 'free-exercise-db';

${statements.join("\n\n")}
`;

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, migration, "utf8");
console.log(`Curated ${curated.length} exercises at ${output}`);

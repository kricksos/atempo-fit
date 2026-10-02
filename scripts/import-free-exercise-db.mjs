import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceUrl = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const output = path.join(root, "supabase", "migrations", "0034_free_exercise_db_catalog.sql");

function sql(value) {
  return value === null || value === undefined ? "null" : `'${String(value).replaceAll("'", "''")}'`;
}

function imageUrl(imagePath) {
  return `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${imagePath.split("/").map(encodeURIComponent).join("/")}`;
}

function groups(exercise) {
  return [...new Set([...(exercise.primaryMuscles ?? []), ...(exercise.secondaryMuscles ?? [])])];
}

function equipment(exercise) {
  const values = Array.isArray(exercise.equipment) ? exercise.equipment : [];
  const normalized = { "body only": "none_(bodyweight_exercise)", bands: "resistance_band", cable: "cable_machine", "e-z curl bar": "ez_bar", "exercise ball": "exercise_ball", "foam roll": "foam_roll", dumbbell: "dumbbell", barbell: "barbell", kettlebell: "kettlebell", machine: "machine", other: "other" };
  return values.map((value) => normalized[value] ?? value.replaceAll(" ", "_"));
}

function restrictions(exercise) {
  const text = `${exercise.name} ${(exercise.instructions ?? []).join(" ")}`.toLowerCase();
  const result = [];
  if (/(squat|lunge|leg press|jump|running|step-up)/.test(text)) result.push("knee_injury");
  if (/(deadlift|row|good morning|hyperextension|crunch|rotation|twist)/.test(text)) result.push("back_injury");
  if (/(press|dip|fly|raise|pull-up|shoulder|extension)/.test(text)) result.push("shoulder_injury");
  if (/(curl|triceps|biceps|extension)/.test(text)) result.push("elbow_injury");
  return [...new Set(result)];
}

const response = await fetch(sourceUrl);
if (!response.ok) throw new Error(`Free Exercise DB returned ${response.status}`);
const exercises = await response.json();
const selected = exercises.filter((exercise) => Array.isArray(exercise.images) && exercise.images.length >= 2 && exercise.images[0] !== exercise.images[1]);
if (selected.length < 800) throw new Error(`Only ${selected.length} exercises have two distinct images`);

const rows = selected.map((exercise) => {
  const startUrl = imageUrl(exercise.images[0]);
  const endUrl = imageUrl(exercise.images[1]);
  const description = (exercise.instructions ?? []).join(" ").slice(0, 1200) || "Ejercicio de entrenamiento guiado.";
  return `(${sql(exercise.name)}, ${sql(description)}, ${sql(exercise.category ?? "strength")}, ${sql(exercise.level ?? "intermediate")}, ${sql(JSON.stringify(equipment(exercise)))}::jsonb, ${sql(JSON.stringify(restrictions(exercise)))}::jsonb, '[]'::jsonb, ${sql(JSON.stringify(groups(exercise)))}::jsonb, ${sql(exercise.primaryMuscles?.[0] ?? null)}, ${sql(exercise.name.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase())}, ${sql(startUrl)}, ${sql(endUrl)}, 'free-exercise-db', 'Unlicense', 'yuhonas/free-exercise-db')`;
});

const migration = `-- Full visual exercise catalog from Free Exercise DB (Unlicense).\ninsert into public.exercises (name, description, category, difficulty, equipment_required, restrictions, alternatives, muscle_groups, primary_muscle, slug, image_start_url, image_end_url, media_source, media_license, media_author)\nvalues\n  ${rows.join(",\n  ")}\non conflict (name) do update set\n  description = excluded.description, category = excluded.category, difficulty = excluded.difficulty, equipment_required = excluded.equipment_required, restrictions = excluded.restrictions, muscle_groups = excluded.muscle_groups, primary_muscle = excluded.primary_muscle, slug = excluded.slug, image_start_url = excluded.image_start_url, image_end_url = excluded.image_end_url, media_source = excluded.media_source, media_license = excluded.media_license, media_author = excluded.media_author, updated_at = now();\n`;

await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, migration, "utf8");
console.log(`Generated ${selected.length} exercises at ${output}`);
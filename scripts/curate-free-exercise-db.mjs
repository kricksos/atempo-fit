import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceUrl = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";
const output = path.join(root, "supabase", "migrations", "0035_curated_exercise_catalog.sql");

function sql(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function equipmentBucket(exercise) {
  const equipment = String(exercise.equipment ?? "body only").toLowerCase();
  if (equipment === "body only") return "bodyweight";
  if (equipment === "dumbbell") return "dumbbell";
  if (equipment === "barbell") return "barbell";
  if (equipment === "cable") return "cable";
  if (equipment === "machine") return "machine";
  if (equipment === "kettlebell") return "kettlebell";
  if (equipment === "bands") return "bands";
  return "other";
}

function familyKey(name) {
  return name.toLowerCase()
    .replace(/\b(alternating|alternate|single arm|one arm|single leg|one leg|close grip|wide grip|reverse grip|underhand|overhand|neutral grip|mixed grip|left|right)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function score(exercise) {
  const name = exercise.name.toLowerCase();
  const common = ["squat", "deadlift", "bench press", "row", "push-up", "pull-up", "pulldown", "lunge", "plank", "curl", "press", "bridge", "thrust", "crunch", "raise", "extension", "fly", "calf", "shoulder", "leg press", "leg curl"];
  return common.reduce((total, term, index) => total + (name.includes(term) ? 100 - index : 0), 0) + (exercise.images?.length >= 2 ? 20 : 0);
}

function selectByBucket(candidates, bucket, limit, selected, families) {
  for (const exercise of candidates.filter((item) => equipmentBucket(item) === bucket).sort((a, b) => score(b) - score(a))) {
    if (selected.length >= 250 || selected.filter((item) => equipmentBucket(item) === bucket).length >= limit) break;
    const family = familyKey(exercise.name);
    if (families.has(family)) continue;
    selected.push(exercise);
    families.add(family);
  }
}

const exercises = process.env.FREE_EXERCISE_DB_JSON
  ? JSON.parse(await readFile(process.env.FREE_EXERCISE_DB_JSON, "utf8"))
  : await (async () => {
      const response = await fetch(sourceUrl);
      if (!response.ok) throw new Error(`Free Exercise DB returned ${response.status}`);
      return response.json();
    })();
const valid = exercises.filter((exercise) => Array.isArray(exercise.images) && exercise.images.length >= 2 && exercise.images[0] !== exercise.images[1]);
const cardio = valid.filter((exercise) => ["cardio", "plyometrics"].includes(exercise.category)).sort((a, b) => score(b) - score(a)).slice(0, 20);
const strength = valid.filter((exercise) => !cardio.includes(exercise) && exercise.category !== "stretching");
const selected = [...cardio];
const families = new Set(selected.map((exercise) => familyKey(exercise.name)));
for (const [bucket, limit] of [["bodyweight", 48], ["dumbbell", 48], ["barbell", 42], ["cable", 30], ["machine", 30], ["kettlebell", 18], ["bands", 18], ["other", 16]]) selectByBucket(strength, bucket, limit, selected, families);
for (const exercise of strength.sort((a, b) => score(b) - score(a))) {
  if (selected.length >= 250) break;
  const family = familyKey(exercise.name);
  if (!families.has(family)) { selected.push(exercise); families.add(family); }
}
if (selected.length !== 250) throw new Error(`Curated ${selected.length} exercises instead of 250`);

const names = selected.map((exercise) => sql(exercise.name)).join(", ");
const migration = `-- Curated production exercise catalog: 250 distinct, visual exercises from Free Exercise DB.\nalter table public.exercises add column if not exists is_momentum_approved boolean not null default false;\nupdate public.exercises set is_momentum_approved = false where media_source = 'free-exercise-db';\nupdate public.exercises set is_momentum_approved = true where media_source = 'free-exercise-db' and name in (${names});\n`;
await mkdir(path.dirname(output), { recursive: true });
await writeFile(output, migration, "utf8");
console.log(`Curated ${selected.length} exercises at ${output}`);
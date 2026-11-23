import { copyFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const library = path.join(root, "data", "illustration-library");
const catalog = JSON.parse(await readFile(path.join(library, "catalog.json"), "utf8"));
const mapping = JSON.parse(await readFile(path.join(library, "candidate-mapping.json"), "utf8"));
const names = JSON.parse(await readFile(path.join(library, "release-names.json"), "utf8"));
const scales = JSON.parse(await readFile(path.join(library, "preview-scales.json"), "utf8"));
const exercises = new Map(catalog.exercises.map((exercise) => [exercise.id, exercise]));
const ids = new Set();
const requestedIds = process.argv.slice(2);
if (requestedIds.some((id) => !names.some((name) => mapping.assignments[name] === id))) throw new Error("Indica únicamente identificadores de ilustraciones publicadas.");
if (new Set(names).size !== names.length) throw new Error("Nombres de ilustraciones repetidos");
for (const name of names) {
  const id = mapping.assignments[name];
  const exercise = exercises.get(id);
  if (!exercise || typeof scales[id] !== "number" || exercise.frames.includes("mid")) throw new Error(`Candidato no preparado: ${name}`);
  ids.add(id);
}
for (const id of ids) {
  if (requestedIds.length && !requestedIds.includes(id)) continue;
  const exercise = exercises.get(id);
  const target = path.join(root, "public", "exercises", "illustrations", id);
  await mkdir(target, { recursive: true });
  for (const frame of exercise.frames) {
    await copyFile(path.join(library, "prepared", id, `${frame}.webp`), path.join(target, `${frame}.webp`));
  }
}
console.log(`Copiadas ${requestedIds.length ? new Set(requestedIds).size : ids.size} ilustraciones.`);

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "data", "illustration-library");
const revision = "2786aefa4b36a08faeca8114e0d1eb0af3ef6732";
const source = `https://raw.githubusercontent.com/hitmanrepo/open-exercise-illustrations/${revision}/`;
const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--all") || args.length > 1) throw new Error("Uso: node scripts/import-illustration-library.mjs [--all]");
const candidates = JSON.parse(await readFile(path.join(output, "candidate-mapping.json"), "utf8"));
const trials = JSON.parse(await readFile(path.join(output, "trial-mapping.json"), "utf8"));
const geometryFixtures = JSON.parse(await readFile(path.join(output, "geometry-fixtures.json"), "utf8"));
const selectedIds = new Set([...Object.values(candidates.assignments), ...Object.values(trials).map((trial) => trial.id), ...geometryFixtures.map(([id]) => id)]);

async function download(relativePath) {
  const response = await fetch(new URL(relativePath, source), { signal: AbortSignal.timeout(60000) });
  if (!response.ok) throw new Error(`No se pudo descargar ${relativePath}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

function assertWebp(bytes, name) {
  if (bytes.length < 20 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WEBP") {
    throw new Error(`La imagen ${name} no es un WebP válido`);
  }
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

const catalogBytes = await download("exercises.json");
const catalog = JSON.parse(catalogBytes.toString("utf8"));
if (catalog.license !== "CC0-1.0" || !Array.isArray(catalog.exercises) || catalog.exercises.length !== 415) {
  throw new Error("El catálogo no tiene la licencia o el número de ejercicios esperados");
}
let previous;
try {
  previous = JSON.parse(await readFile(path.join(output, "provenance.json"), "utf8"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
if (previous && (previous.revision !== revision || previous.catalogSha256 !== sha256(catalogBytes))) {
  throw new Error("La biblioteca existente procede de otra revisión o tiene metadatos distintos");
}

const jobs = [];
const ids = new Set();
for (const exercise of catalog.exercises) {
  if (typeof exercise.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(exercise.id) || ids.has(exercise.id)) {
    throw new Error(`Identificador de ejercicio inválido o duplicado: ${exercise.id}`);
  }
  ids.add(exercise.id);
  if (!Array.isArray(exercise.frames) || exercise.frames.length === 0 || !exercise.images) {
    throw new Error(`Faltan fotogramas para ${exercise.id}`);
  }
  for (const frame of exercise.frames) {
    if (!["start", "mid", "end", "hold"].includes(frame)) throw new Error(`Fotograma desconocido: ${exercise.id}/${frame}`);
    const relativePath = `images/${exercise.id}/${frame}.webp`;
    if (exercise.images[frame] !== relativePath) throw new Error(`Ruta inesperada: ${exercise.id}/${frame}`);
    if (args.includes("--all") || selectedIds.has(exercise.id)) {
      jobs.push({ relativePath, destination: path.join(output, "images", exercise.id, `${frame}.webp`) });
    }
  }
}
for (const id of selectedIds) if (!ids.has(id)) throw new Error(`Ejercicio seleccionado no encontrado: ${id}`);
if (new Set(jobs.map((job) => job.relativePath)).size !== jobs.length) throw new Error("Hay rutas de imágenes duplicadas");

let next = 0;
const hashes = { ...previous?.imageSha256 };
async function worker() {
  while (next < jobs.length) {
    const job = jobs[next++];
    await mkdir(path.dirname(job.destination), { recursive: true });
    let bytes;
    try {
      bytes = await readFile(job.destination);
      assertWebp(bytes, job.relativePath);
      const expectedHash = previous?.imageSha256?.[job.relativePath];
      if (expectedHash) {
        if (sha256(bytes) !== expectedHash) throw new Error(`La imagen local ha cambiado: ${job.relativePath}`);
      } else {
        const upstream = await download(job.relativePath);
        assertWebp(upstream, job.relativePath);
        if (sha256(bytes) !== sha256(upstream)) throw new Error(`La imagen local no coincide con el original: ${job.relativePath}`);
      }
    } catch (error) {
      if (error.code !== "ENOENT") throw error;
      bytes = await download(job.relativePath);
      assertWebp(bytes, job.relativePath);
      const expectedHash = previous?.imageSha256?.[job.relativePath];
      if (expectedHash && sha256(bytes) !== expectedHash) throw new Error(`La imagen descargada no coincide con su hash: ${job.relativePath}`);
      await writeFile(job.destination, bytes, { flag: "wx" });
    }
    assertWebp(bytes, job.relativePath);
    hashes[job.relativePath] = sha256(bytes);
  }
}

await Promise.all(Array.from({ length: 12 }, () => worker()));
await writeFile(path.join(output, "catalog.json"), catalogBytes);
await writeFile(path.join(output, "provenance.json"), JSON.stringify({
  repository: "https://github.com/hitmanrepo/open-exercise-illustrations",
  revision,
  license: catalog.license,
  catalogSha256: sha256(catalogBytes),
  imageSha256: Object.fromEntries(Object.entries(hashes).sort(([a], [b]) => a.localeCompare(b))),
}, null, 2) + "\n");
console.log(`Biblioteca descargada: ${args.includes("--all") ? ids.size : selectedIds.size} ejercicios y ${jobs.length} imágenes. Pendiente de revisión y asignación.`);

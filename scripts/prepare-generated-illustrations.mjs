import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "data", "generated-illustrations", "source");
const output = path.join(root, "public", "exercises", "generated-illustrations");
const released = JSON.parse(await readFile(path.join(root, "data", "generated-illustrations", "released.json"), "utf8"));
const jobs = [
  { id: "chest-supported-rear-delt-fly", file: "dumbbells-and-curl.png", top: 45, height: 309, halfWidth: 512, mask: true },
  { id: "low-incline-rear-delt-fly", file: "dumbbells-and-curl.png", top: 405, height: 284, halfWidth: 512, mask: true },
  { id: "cable-preacher-curl", file: "dumbbells-and-curl.png", top: 738, height: 326, halfWidth: 512, mask: true },
  { id: "overhead-bar-triceps", file: "overhead-bar-triceps.png", top: 0, height: 1024, halfWidth: 768, mask: false },
  { id: "machine-reverse-hyperextension", file: "machine-reverse-hyperextension.png", top: 0, height: 1024, halfWidth: 768, mask: false },
  { id: "cable-shoulder-press", file: "cable-shoulder-press.png", top: 0, height: 887, halfWidth: 887, mask: false },
  { id: "raised-cable-row", file: "raised-cable-row.png", top: 0, height: 887, halfWidth: 887, mask: false },
  { id: "cable-external-rotation", file: "external-rotation.png", top: 1117, height: 419, halfWidth: 512, mask: false },
];

const ids = Object.values(released).map((entry) => entry.id).sort();
if (JSON.stringify(ids) !== JSON.stringify(jobs.map((job) => job.id).sort())) throw new Error("Las ilustraciones publicadas no coinciden con los originales preparados.");

for (const job of jobs) {
  const image = path.join(source, job.file);
  const metadata = await sharp(image).metadata();
  if (metadata.width !== job.halfWidth * 2 || !metadata.height || job.top + job.height > metadata.height) {
    throw new Error(`Tamaño inesperado en ${job.file}`);
  }
  await mkdir(path.join(output, job.id), { recursive: true });
  for (const [index, frameName] of ["start", "end"].entries()) {
    const left = index * job.halfWidth + (index ? 1 : 0);
    const width = job.halfWidth - 1;
    let frame = await sharp(image).extract({ left, top: job.top, width, height: job.height }).png().toBuffer();
    if (job.mask) {
      const mask = Buffer.from(`<svg width="${width}" height="60"><rect x="14" y="5" width="93" height="45" fill="#030508"/></svg>`);
      frame = await sharp(frame).composite([{ input: mask, top: 0, left: 0 }]).png().toBuffer();
    }
    const canvasWidth = Math.max(width, Math.ceil(job.height * 4 / 3));
    const canvasHeight = Math.max(job.height, Math.ceil(width * 3 / 4));
    await sharp(frame).resize(canvasWidth, canvasHeight, { fit: "contain", background: "#080a0e" })
      .webp({ quality: 90 }).toFile(path.join(output, job.id, `${frameName}.webp`));
  }
}
console.log(`Preparadas ${jobs.length} ilustraciones generadas, con dos posiciones cada una.`);

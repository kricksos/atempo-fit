import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import { extendedBrightEdges } from "./illustration-geometry.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const library = path.join(root, "data", "illustration-library");
const prepared = path.join(library, "prepared");
const catalog = JSON.parse(await readFile(path.join(library, "catalog.json"), "utf8"));
const candidates = JSON.parse(await readFile(path.join(library, "candidate-mapping.json"), "utf8"));
const provenance = JSON.parse(await readFile(path.join(library, "provenance.json"), "utf8"));
const byId = new Map(catalog.exercises.map((exercise) => [exercise.id, exercise]));
const allIds = [...new Set(Object.values(candidates.assignments))].sort();
const requestedIds = process.argv.slice(2);
if (requestedIds.some((id) => !allIds.includes(id))) throw new Error("Indica únicamente identificadores de ilustraciones asignadas.");
const ids = requestedIds.length ? [...new Set(requestedIds)].sort() : allIds;
const reviewedFloorStrips = new Set(["push-up/start", "dead-bug/start"]);
const reviewedEdgeFades = new Map([
  ["leg-press", ["left", "right"]],
  ["leg-press-calf-raise", ["left", "right"]],
  ["machine-triceps-extension", ["left", "right"]],
  ["seated-calf-raise-machine", ["left"]],
  ["standing-calf-raise-machine", ["left"]],
  ["standing-leg-curl-machine", ["left", "right"]],
]);
const scales = requestedIds.length ? JSON.parse(await readFile(path.join(library, "preview-scales.json"), "utf8")) : {};
await mkdir(prepared, { recursive: true });

for (const id of ids) {
  const exercise = byId.get(id);
  if (!exercise || exercise.frames.includes("mid")) throw new Error(`Ejercicio sin fotogramas compatibles: ${id}`);
  const frames = [];
  for (const frame of exercise.frames) {
    const relative = exercise.images[frame];
    if (relative !== `images/${id}/${frame}.webp`) throw new Error(`Ruta inesperada: ${id}/${frame}`);
    const source = await readFile(path.join(library, "images", id, `${frame}.webp`));
    const hash = createHash("sha256").update(source).digest("hex");
    if (hash !== provenance.imageSha256[relative]) throw new Error(`El original no coincide con su hash: ${relative}`);
    const metadata = await sharp(source).metadata();
    if (!metadata.width || !metadata.height || metadata.hasAlpha) throw new Error(`Imagen no compatible: ${relative}`);
    frames.push({ frame, source, width: metadata.width, height: metadata.height });
  }
  const { width, height } = frames[0];
  if (frames.some((frame) => frame.width !== width || frame.height !== height)) throw new Error(`Los fotogramas tienen tamaños distintos: ${id}`);
  const canvasWidth = Math.max(width, Math.ceil(height * 4 / 3));
  const canvasHeight = Math.max(height, Math.ceil(width * 3 / 4));
  const left = Math.floor((canvasWidth - width) / 2);
  const top = Math.floor((canvasHeight - height) / 2);
  let distanceX = 0;
  let distanceY = 0;
  await mkdir(path.join(prepared, id), { recursive: true });

  for (const { frame, source } of frames) {
    const { data: thumbnail, info } = await sharp(source).resize({ width: 200 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const unsafeEdges = extendedBrightEdges(thumbnail, info, width, height, canvasWidth, canvasHeight);
    const fadeEdges = reviewedEdgeFades.get(id) ?? [];
    if (unsafeEdges.some((edge) => !fadeEdges.includes(edge))) throw new Error(`Posible figura o material cortado en el borde: ${id}/${frame}/${unsafeEdges.join(",")}`);
    for (let y = 0; y < info.height; y++) {
      for (let x = 0; x < info.width; x++) {
        const index = (y * info.width + x) * 3;
        if (Math.max(thumbnail[index], thumbnail[index + 1], thumbnail[index + 2]) < 55) continue;
        distanceX = Math.max(distanceX, Math.abs((left + (x + 0.5) * width / info.width) / canvasWidth - 0.5));
        distanceY = Math.max(distanceY, Math.abs((top + (y + 0.5) * height / info.height) / canvasHeight - 0.5));
      }
    }

    const originalPixels = await sharp(source).removeAlpha().raw().toBuffer();
    const rowStats = (y) => {
      let sum = 0;
      let max = 0;
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 3;
        const value = Math.max(originalPixels[index], originalPixels[index + 1], originalPixels[index + 2]);
        sum += value;
        max = Math.max(max, value);
      }
      return { average: sum / width, max };
    };
    const bottomRow = rowStats(height - 1);
    let trim = 0;
    if (reviewedFloorStrips.has(`${id}/${frame}`) && bottomRow.average <= 15 && bottomRow.max <= 25) {
      for (let offset = 1; offset <= Math.min(32, Math.floor(height * 0.05)); offset++) {
        const row = rowStats(height - 1 - offset);
        if (row.average >= bottomRow.average + 8) {
          trim = offset;
          break;
        }
        if (row.max > 30) break;
      }
    }
    const retainedHeight = height - trim;
    const original = await sharp(source).extract({ left: 0, top: 0, width, height: retainedHeight }).png().toBuffer();
    const fadeWidth = fadeEdges.length ? Math.min(32, Math.floor(width * 0.05)) : 0;
    let foreground = original;
    if (fadeWidth) {
      const gradient = (edge) => `<linearGradient id="${edge}"><stop offset="0" stop-color="${edge === "left" ? "black" : "white"}"/><stop offset="1" stop-color="${edge === "left" ? "white" : "black"}"/></linearGradient>`;
      const strip = (edge) => `<rect x="${edge === "left" ? 0 : width - fadeWidth}" width="${fadeWidth}" height="${retainedHeight}" fill="url(#${edge})"/>`;
      const mask = Buffer.from(`<svg width="${width}" height="${retainedHeight}" xmlns="http://www.w3.org/2000/svg"><defs>${fadeEdges.map(gradient).join("")}<mask id="fade" maskUnits="userSpaceOnUse"><rect width="${width}" height="${retainedHeight}" fill="white"/>${fadeEdges.map(strip).join("")}</mask></defs><rect width="${width}" height="${retainedHeight}" fill="white" mask="url(#fade)"/></svg>`);
      foreground = await sharp(original).ensureAlpha().composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
    }
    let background;
    if (fadeWidth) {
      if (top !== 0 || canvasHeight !== retainedHeight) throw new Error(`Encuadre con bordes revisados no compatible: ${id}/${frame}`);
      const rows = Buffer.alloc(retainedHeight * 3);
      for (let y = 0; y < retainedHeight; y++) {
        const colors = [0, width - 1].map((x) => {
          const index = (y * width + x) * 3;
          return [...originalPixels.subarray(index, index + 3)];
        });
        const color = colors.reduce((darkest, current) => Math.max(...current) < Math.max(...darkest) ? current : darkest);
        const factor = Math.min(1, 32 / (Math.max(...color) || 1));
        for (let channel = 0; channel < 3; channel++) rows[y * 3 + channel] = Math.round(color[channel] * factor);
      }
      background = sharp(rows, { raw: { width: 1, height: retainedHeight, channels: 3 } }).resize(canvasWidth, canvasHeight, { kernel: "nearest" }).blur(20);
    } else {
      background = sharp(original).extend({
        left, right: canvasWidth - width - left, top, bottom: canvasHeight - retainedHeight - top, extendWith: "copy",
      }).blur(20);
    }
    const result = await background.composite([{ input: foreground, left, top }]).webp({ lossless: true, effort: 3 }).toBuffer();
    const insetLeft = fadeEdges.includes("left") ? fadeWidth : 0;
    const insetRight = fadeEdges.includes("right") ? fadeWidth : 0;
    const innerWidth = width - insetLeft - insetRight;
    const restoredPixels = await sharp(result).extract({ left: left + insetLeft, top, width: innerWidth, height: retainedHeight }).removeAlpha().raw().toBuffer();
    const expectedPixels = await sharp(original).extract({ left: insetLeft, top: 0, width: innerWidth, height: retainedHeight }).removeAlpha().raw().toBuffer();
    if (!expectedPixels.equals(restoredPixels)) throw new Error(`Los píxeles interiores cambiaron: ${id}/${frame}`);
    await writeFile(path.join(prepared, id, `${frame}.webp`), result);
  }
  const scale = Math.max(1, Math.min(2.15, 0.46 / (distanceX || 1), 0.46 / (distanceY || 1)));
  scales[id] = Math.floor(scale * 100) / 100;
  console.log(`${id}: ${frames.length} fotogramas, escala ${scales[id]}`);
}

await writeFile(path.join(library, "preview-scales.json"), JSON.stringify(scales, null, 2) + "\n");
console.log(`Preparadas ${ids.length} ilustraciones para la vista previa; pendientes de revisión visual y técnica.`);

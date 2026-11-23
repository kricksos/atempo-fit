import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

import { extendedBrightEdges } from "./illustration-geometry.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const images = path.join(root, "data", "illustration-library", "images");
const fixtures = JSON.parse(await readFile(path.join(root, "data", "illustration-library", "geometry-fixtures.json"), "utf8"));
for (const [id, frame, edge] of fixtures) {
  const source = await readFile(path.join(images, id, `${frame}.webp`));
  const { width, height } = await sharp(source).metadata();
  const { data, info } = await sharp(source).resize({ width: 200 }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const edges = extendedBrightEdges(data, info, width, height, Math.max(width, Math.ceil(height * 4 / 3)), Math.max(height, Math.ceil(width * 3 / 4)));
  assert.ok(edges.includes(edge), `${id}/${frame}: no se detectó el borde ${edge}`);
}

const blank = Buffer.alloc(100 * 100 * 3);
assert.deepEqual(extendedBrightEdges(blank, { width: 100, height: 100 }, 100, 100, 150, 100), []);
console.log("Detección de bordes: pruebas correctas.");

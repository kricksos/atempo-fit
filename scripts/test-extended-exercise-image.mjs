import assert from "node:assert/strict";
import { drawExtendedExerciseImage } from "../src/components/extended-exercise-image.tsx";

const image = { naturalWidth: 400, naturalHeight: 300 };

function draw(width, height) {
  const calls = [];
  drawExtendedExerciseImage({ drawImage: (...args) => calls.push(args) }, image, width, height);
  return calls;
}

const wide = draw(800, 300);
assert.deepEqual(wide[0], [image, 0, 0, 1, 300, 0, 0, 200, 300]);
assert.deepEqual(wide[1], [image, 399, 0, 1, 300, 600, 0, 200, 300]);
assert.deepEqual(wide[2], [image, 200, 0, 400, 300]);

const tall = draw(400, 500);
assert.deepEqual(tall[0], [image, 0, 0, 400, 1, 0, 0, 400, 100]);
assert.deepEqual(tall[1], [image, 0, 299, 400, 1, 0, 400, 400, 100]);
assert.deepEqual(tall[2], [image, 0, 100, 400, 300]);

assert.deepEqual(draw(400, 300), [[image, 0, 0, 400, 300]]);
console.log("Fondos prolongados: pruebas correctas.");

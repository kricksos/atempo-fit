import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { OrbitCompletion, OrbitSession } from "../src/components/workout-orbit-session";
import type { WorkoutExercise } from "../src/components/workout-player-rebuilt";

const exercise: WorkoutExercise = { id: "squat", name: "Sentadilla", sets: 1, repetitions: "8-12", restSeconds: 90, media: null, illustration: false };
const common = {
  workoutName: "Ejemplo",
  exercise,
  activeIndex: 0,
  exerciseCount: 2,
  progress: 50,
  prescription: "8-12",
  timed: false,
  previousLogs: [{ exerciseId: "squat", setNumber: 1, weightKg: 20, repetitions: 10, durationSeconds: null }],
  sets: [{ weightKg: 25, repetitions: 8, durationSeconds: null }],
  media: null,
  onUpdateSet: () => {},
  onPrevious: () => {},
  onNext: () => {},
  onComplete: () => {},
  isBusy: false,
  savedMessage: null,
  error: null,
};

const strength = renderToStaticMarkup(<OrbitSession {...common} />);
assert.match(strength, /Peso en kg, serie 1/);
assert.match(strength, /Repeticiones, serie 1/);
assert.match(strength, /20 kg × 10/);
assert.match(strength, /Descanso: 90 s/);
assert.match(strength, /Iniciar descanso/);
assert.match(strength, /Siguiente ejercicio/);

const timed = renderToStaticMarkup(<OrbitSession {...common} exercise={{ ...exercise, name: "Plancha", repetitions: "30 segundos" }} activeIndex={1} timed previousLogs={[]} prescription="30 segundos" error="Revisa los segundos." />);
assert.match(timed, /Iniciar ejercicio/);
assert.match(timed, /Tiempo objetivo: 30 s/);
assert.match(timed, /Segundos realizados, serie 1/);
assert.match(timed, /aria-label="Iniciar ejercicio, serie 1"/);
assert.doesNotMatch(timed, /Temporizador de descanso/);
assert.doesNotMatch(timed, /Peso en kg, serie 1/);
assert.match(timed, /role="alert"[^>]*>Revisa los segundos\./);
assert.match(timed, /Finalizar entrenamiento/);

const lateralPlank = renderToStaticMarkup(<OrbitSession {...common} exercise={{ ...exercise, name: "Plancha lateral", repetitions: "30 segundos" }} timed />);
assert.match(lateralPlank, /Temporizador del ejercicio/);
assert.doesNotMatch(lateralPlank, /Temporizador de descanso/);
const otherTimed = renderToStaticMarkup(<OrbitSession {...common} exercise={{ ...exercise, name: "Otro ejercicio", repetitions: "30 segundos" }} timed />);
assert.match(otherTimed, /Temporizador del ejercicio/);
assert.match(otherTimed, /Temporizador de descanso/);

const noRest = renderToStaticMarkup(<OrbitSession {...common} exercise={{ ...exercise, restSeconds: 0 }} />);
assert.match(noRest, /Este ejercicio no tiene descanso programado/);
assert.doesNotMatch(noRest, /Iniciar descanso/);
assert.doesNotMatch(noRest, /Inícialo manualmente/);

const completion = renderToStaticMarkup(<OrbitCompletion duration={12} exerciseCount={2} preview recordNames={[]} streak={0} />);
assert.match(completion, /no se ha guardado ningún dato/);
assert.match(completion, /12/);
assert.match(completion, /href="\/preview-entrenamiento-completo"/);
const realCompletion = renderToStaticMarkup(<OrbitCompletion duration={12} exerciseCount={2} preview={false} recordNames={["Sentadilla"]} streak={2} />);
assert.match(realCompletion, /datos registrados han quedado guardados/);
assert.match(realCompletion, /récord personal/);
assert.match(realCompletion, /mejor peso en Sentadilla/);
assert.match(realCompletion, /Racha actual: 2 días/);
assert.match(realCompletion, /href="\/dashboard"/);
assert.doesNotMatch(realCompletion, /preview-entrenamiento-completo/);
console.log("Entrenamiento Órbita: pruebas correctas.");

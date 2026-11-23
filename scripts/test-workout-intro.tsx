import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { WorkoutIntro } from "../src/components/workout-intro";
import { WorkoutPlayerRebuilt } from "../src/components/workout-player-rebuilt";

const intro = renderToStaticMarkup(<WorkoutPlayerRebuilt workoutDayId="test" workoutName="Fuerza · ejemplo" lastPerformance={[]} exercises={[
  { id: "plancha", name: "Plancha", sets: 2, repetitions: "20-30", restSeconds: 45, media: null, illustration: false },
]} />);
assert.match(intro, /Fuerza · ejemplo/);
assert.match(intro, /1 ejercicio/);
assert.match(intro, /Plancha/);
assert.match(intro, /2 series · 20-30 segundos/);
assert.match(intro, /Descanso entre series: 45 s/);
assert.match(intro, /Demostración no disponible para este ejercicio/);
assert.match(intro, /Antes de empezar: calienta/);
assert.doesNotMatch(intro, /Ejercicio siguiente/);

const empty = renderToStaticMarkup(<WorkoutIntro workoutName="Sin ejercicios" exercises={[]} onStart={() => {}} navigation={null} />);
assert.match(empty, /Este entrenamiento no tiene ejercicios/);
assert.match(empty, /disabled=""/);
console.log("Inicio de entrenamiento: pruebas correctas.");

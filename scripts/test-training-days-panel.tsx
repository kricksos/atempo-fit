import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { TrainingDaysPanel } from "../src/components/training-days-panel";

const router = { back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {}, bfcacheId: "test" };
const markup = renderToStaticMarkup(<AppRouterContext.Provider value={router}><TrainingDaysPanel
  days={[
    { id: "one", name: "Fuerza adaptada 1", exerciseCount: 2, muscleSummary: "Pectoral · Tríceps" },
    { id: "two", name: "Fuerza adaptada 2", exerciseCount: null, muscleSummary: "No se pudieron cargar los músculos" },
  ]}
  scheduledId="one"
  scheduledIndex={0}
  completedToday={false}
  nameFor={(name) => name}
  variantFor={() => "Fuerza"}
  cardioPreferences={[]}
  additionalSuggestions={[]}
  defaultCardio={null}
  preview
/></AppRouterContext.Provider>);

assert.match(markup, /Músculos principales/);
assert.match(markup, /Pectoral/);
assert.match(markup, /Tríceps/);
assert.match(markup, /Ejercicios no disponibles/);
assert.match(markup, /No se pudieron cargar los músculos/);
assert.doesNotMatch(markup, /Cuerpo completo/);

const statesMarkup = renderToStaticMarkup(<AppRouterContext.Provider value={router}><TrainingDaysPanel
  days={[
    { id: "one", name: "Día 1", exerciseCount: 2, muscleSummary: "Pectoral" },
    { id: "two", name: "Día 2", exerciseCount: 2, muscleSummary: "Dorsal" },
    { id: "three", name: "Día 3", exerciseCount: 2, muscleSummary: "Piernas" },
  ]}
  scheduledId="two"
  scheduledIndex={1}
  completedToday={false}
  nameFor={(name) => name}
  variantFor={() => "Fuerza"}
  cardioPreferences={[]}
  additionalSuggestions={[]}
  defaultCardio={null}
  preview
/></AppRouterContext.Provider>);
const cards = [...statesMarkup.matchAll(/<article\b[^>]*>[\s\S]*?<\/article>/g)].map((match) => match[0]);
assert.equal(cards.length, 3);
assert.match(cards[0], /Completado/);
assert.match(cards[1], /href="\/workout\/two"[^>]*>Comenzar/);
assert.match(cards[2], /En cola/);
const cardBackgrounds = cards.map((card) => card.match(/^<article[^>]*\b(bg-(?:\[[^\]]+\]|white))(?=\s|")/)?.[1]);
assert.ok(cardBackgrounds.every(Boolean));
assert.equal(new Set(cardBackgrounds).size, 3);
const completedBadge = cards[0].match(/class="([^"]*)"[^>]*>Completado<\/span>/)?.[1];
const startButton = cards[1].match(/<a[^>]*class="([^"]*)"[^>]*>Comenzar<\/a>/)?.[1];
assert.ok(completedBadge);
assert.ok(startButton);
assert.notEqual(completedBadge.match(/bg-\[[^\]]+\]/)?.[0], startButton.match(/bg-\[[^\]]+\]/)?.[0]);
console.log("Tarjetas de entrenamiento: músculos reales y errores de carga correctos.");

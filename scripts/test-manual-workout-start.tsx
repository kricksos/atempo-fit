import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { ManualWorkoutStart } from "../src/components/manual-workout-start";

const callbacks = { onCreate: () => {}, onOpenDraft: () => {}, onDelete: () => {}, onGenerateAutomatic: () => {}, onBrowseTemplates: () => {}, onOpenManual: () => {}, onBack: () => {} };
const props = {
  ...callbacks,
  activeRoutine: { name: "Rutina automática actual", automatic: true, days: [{ id: "current", name: "Torso", muscles: ["Pectoral"], exerciseCount: 3, incomplete: false, estimatedMinutes: 35 }] },
  routines: [
    { id: "manual", name: "Rutina manual anterior", updatedAt: "2026-02-01T00:00:00Z", active: false, days: [{ id: "day-1", name: "Pierna", muscles: ["Cuádriceps", "Glúteos"], exerciseCount: 2, incomplete: false, estimatedMinutes: 32 }] },
    { id: "active", name: "Rutina activa", updatedAt: "2026-01-01T00:00:00Z", active: true, days: [] },
  ],
  drafts: [{ id: "draft", name: "Borrador de fuerza", updatedAt: "2026-03-01T00:00:00Z", days: [
    { id: "draft-day-1", name: "Día superior", muscles: ["Pectoral", "Tríceps"], exerciseCount: 2, incomplete: true, estimatedMinutes: 25 },
    { id: "draft-day-2", name: "Día sin ejercicios", muscles: [], exerciseCount: 0, incomplete: false, estimatedMinutes: null },
    { id: "draft-day-3", name: "Día sin metadatos", muscles: [], exerciseCount: 1, incomplete: true, estimatedMinutes: 15 },
  ] }],
  busy: false,
  message: null,
  notice: null,
};
const chooser = renderToStaticMarkup(React.createElement(ManualWorkoutStart, { ...props, manualWorkspace: false }));
assert.match(chooser, /Gestiona tus rutinas/);
assert.match(chooser, /Rutinas preparadas/);
assert.match(chooser, /Empezar desde cero/);
assert.match(chooser, /Generar rutina automática/);
assert.doesNotMatch(chooser, /Copiar mi rutina actual/);
assert.doesNotMatch(chooser, /Tu entrenamiento actual/);
assert.doesNotMatch(chooser, /Borrador de fuerza/);

const manual = renderToStaticMarkup(React.createElement(ManualWorkoutStart, { ...props, manualWorkspace: true }));
assert.match(manual, /Volver a gestionar rutinas/);
assert.match(manual, /Crear rutina desde cero/);
assert.match(manual, /Copiar mi rutina actual/);
assert.match(manual, /Mis rutinas manuales/);
assert.match(manual, /Rutina manual anterior/);
assert.equal((manual.match(/Editar rutina/g) ?? []).length, 3);
assert.match(manual, /Eliminar rutina Rutina manual anterior/);
assert.match(manual, /Para eliminarla, primero activa otra rutina/);
assert.doesNotMatch(manual, /Eliminar rutina Rutina activa/);
assert.match(manual, /Borrador de fuerza/);
assert.match(manual, /Eliminar rutina Borrador de fuerza/);
assert.match(manual, /Al editar una rutina activada se crea una copia/);
assert.match(manual, /3 días/);
assert.match(manual, /Hasta 25 min aprox/);
assert.match(manual, /Hasta 32 min aprox/);
assert.match(manual, /Tiempo no disponible/);
assert.match(manual, /Pectoral · Tríceps/);
assert.match(manual, /Información muscular incompleta/);
assert.match(manual, /Sin ejercicios/);
assert.match(manual, /Músculos principales sin identificar/);
assert.match(manual, /Días no disponibles/);
assert.match(manual, /cardio se suma aparte/);
const list = manual.match(/<section[^>]*aria-labelledby="manual-routines-title"[^>]*>([\s\S]*?)<\/section>/)?.[1];
assert.ok(list);
assert.match(list, /Rutina manual anterior/);
assert.match(list, /Borrador de fuerza/);
assert.ok(list.indexOf("Borrador de fuerza") < list.indexOf("Rutina manual anterior"));
assert.ok(list.indexOf("Rutina manual anterior") < list.indexOf("Rutina activa"));
assert.doesNotMatch(manual, /aria-labelledby="saved-drafts-title"/);
assert.doesNotMatch(list, />Borrador<\/span>|>Guardada<\/span>|>Activa<\/span>/);

const empty = renderToStaticMarkup(React.createElement(ManualWorkoutStart, {
  ...callbacks, activeRoutine: null, routines: [], drafts: [], busy: false, message: null, notice: null, manualWorkspace: true,
}));
assert.match(empty, /Todavía no tienes rutinas manuales con ejercicios/);
assert.doesNotMatch(empty, /Copiar mi rutina actual/);
const manualActive = renderToStaticMarkup(React.createElement(ManualWorkoutStart, { ...props, activeRoutine: { ...props.activeRoutine, automatic: false }, manualWorkspace: true }));
assert.match(manualActive, /Copiar mi rutina actual/);
const busyManual = renderToStaticMarkup(React.createElement(ManualWorkoutStart, { ...props, busy: true, manualWorkspace: true }));
assert.match(busyManual, /<button[^>]*disabled=""[^>]*>[\s\S]*?Copiar mi rutina actual<\/button>/);
const onlyDraft = renderToStaticMarkup(React.createElement(ManualWorkoutStart, { ...props, routines: [], manualWorkspace: true }));
assert.match(onlyDraft, /Borrador de fuerza/);
assert.doesNotMatch(onlyDraft, /Todavía no tienes rutinas manuales/);
const onlyRoutine = renderToStaticMarkup(React.createElement(ManualWorkoutStart, { ...props, drafts: [], manualWorkspace: true }));
assert.match(onlyRoutine, /Rutina manual anterior/);
assert.doesNotMatch(onlyRoutine, /Todavía no tienes rutinas manuales/);
const favorites = renderToStaticMarkup(React.createElement(ManualWorkoutStart, { ...props, routines: [{ ...props.routines[0], favorite: true }], manualWorkspace: true, onFavorite: () => {} }));
assert.match(favorites, /Solo favoritas/);
assert.match(favorites, /aria-pressed="true" aria-label="Quitar de favoritos: Rutina manual anterior"/);
assert.match(favorites, /aria-pressed="false" aria-label="Añadir a favoritos: Borrador de fuerza"/);
console.log("Gestión de rutinas: navegación y tarjetas manuales correctas.");

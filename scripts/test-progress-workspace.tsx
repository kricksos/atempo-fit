import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { ProgressCheckinForm } from "../src/components/progress-checkin-form";
import { ProgressWorkspace } from "../src/components/progress-workspace";

const router = { back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {}, bfcacheId: "test" };
const props = {
  latestCheckin: null, initialTargetWeightKg: null, latestMeasurement: null, previousMeasurement: null,
  primaryGoal: "", activeInjuries: [], activeFoodRestrictions: [],
};
const renderForm = (mode: "measurements" | "wellness" | "combined") => renderToStaticMarkup(<AppRouterContext.Provider value={router}><ProgressCheckinForm {...props} mode={mode} /></AppRouterContext.Provider>);
const measures = renderForm("measurements");
assert.match(measures, /Guardar medidas/);
assert.match(measures, /Peso \(kg\)/);
assert.doesNotMatch(measures, /¿Hay algo más que debamos saber/);
const wellness = renderForm("wellness");
assert.match(wellness, /Guardar revisión/);
assert.match(wellness, /¿Hay algo más que debamos saber/);
assert.doesNotMatch(wellness, /Peso \(kg\)/);
const combined = renderForm("combined");
assert.match(combined, /Peso \(kg\)/);
assert.match(combined, /¿Hay algo más que debamos saber/);
const workspace = renderToStaticMarkup(<ProgressWorkspace entries={[]} checkins={[]} measurementForm={<p>Formulario de medidas</p>} wellnessForm={<p>Formulario de bienestar</p>} analysis={<p>Análisis real</p>} />);
for (const label of ["Cada paso cuenta", "Mis medidas", "Mi bienestar", "Evolución de entrenamiento", "Análisis y ajustes"]) assert.ok(workspace.includes(label));
assert.doesNotMatch(workspace, /Función Premium/);
console.log("Progreso: apartados y formularios de medidas y bienestar separados.");

import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

import { NextStepPanel, PlanReviewNotice } from "../src/components/next-step-panel";
import { NutritionSummaryCard } from "../src/components/nutrition-summary-card";
import { ProgressSummaryCard } from "../src/components/progress-summary-card";
import { WeeklyActivityCard } from "../src/components/weekly-activity-card";

const workout = {
  completedToday: false, workoutLabel: "Cuerpo completo", workoutHref: "/workout/test", hasProfile: true,
  workoutDetails: { day: 2, days: 3, variant: "Variante A", muscles: "Pectoral · Dorsal", exerciseCount: 6, estimatedMinutes: 45 },
};
const ready = renderToStaticMarkup(React.createElement(NextStepPanel, workout));
assert.match(ready, /href="\/workout\/test"/);
assert.match(ready, /Día 2 de 3/);
assert.match(ready, /45 min aprox/);
const completed = renderToStaticMarkup(React.createElement(NextStepPanel, { ...workout, completedToday: true }));
assert.match(completed, /Disponible mañana/);
assert.doesNotMatch(completed, /href="\/workout\/test"/);
const empty = renderToStaticMarkup(React.createElement(NextStepPanel, { ...workout, workoutDetails: null, workoutLabel: null, workoutHref: null, hasProfile: false }));
assert.match(empty, /Aún por generar/);
const compact = renderToStaticMarkup(React.createElement(NextStepPanel, { ...workout, compact: true }));
assert.match(compact, /href="\/workout\/test"/);
assert.match(compact, /Día 2 de 3/);
const compactCompleted = renderToStaticMarkup(React.createElement(NextStepPanel, { ...workout, compact: true, completedToday: true }));
assert.match(compactCompleted, /Disponible mañana/);
assert.doesNotMatch(compactCompleted, /href="\/workout\/test"/);
const notice = renderToStaticMarkup(React.createElement(PlanReviewNotice, { message: "Revisa tu dieta", href: "/checkin?mode=nutrition", action: "Revisar mi plan" }));
assert.match(notice, /Revisa tu dieta/);
assert.match(notice, /href="\/checkin\?mode=nutrition"/);
assert.doesNotMatch(notice, /Comenzar sesión|\/workout\//);
const week = renderToStaticMarkup(React.createElement(WeeklyActivityCard, { activeDays: 5, targetDays: 3, completed: true, currentStreak: 1 }));
assert.match(week, /5<span[^>]*> \/ 3/);
assert.match(week, /aria-valuenow="3"/);
assert.match(week, /1 día/);
const router = { back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {}, bfcacheId: "test" };
const nutrition = renderToStaticMarkup(<AppRouterContext.Provider value={router}><NutritionSummaryCard calories={2000} proteinGrams={100} carbsGrams={200} fatsGrams={60} mealIds={[]} todayCompletedMealIds={[]} completedDates={[]} /></AppRouterContext.Provider>);
assert.match(nutrition, /Genera tu dieta/);
assert.doesNotMatch(nutrition, /Completar día/);
const progress = renderToStaticMarkup(React.createElement(ProgressSummaryCard, { currentWeightKg: null, startingWeightKg: null, targetWeightKg: null, weightDeltaKg: null, daysSinceLastMeasurement: null, primaryGoal: "" }));
assert.match(progress, /Sin datos/);
assert.match(progress, /Sin registros todavía/);
console.log("Resumen: estados de revisión, sesión, actividad y datos ausentes correctos.");

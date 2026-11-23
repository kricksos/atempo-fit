import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { AccountPanel, type GamificationSummary, type PersonalNotice } from "../src/components/account-status";
import { GamificationPanel } from "../src/components/gamification-status";

const summary: GamificationSummary = {
  level: 10, xp: 5000, xpIntoLevel: 0, xpForNextLevel: null, progressPercent: 100, isMaxLevel: true,
  currentStreak: 1, bestStreak: 5, weeklyGoal: { activeDays: 3, targetDays: 3, completed: true }, achievements: [],
};
const close = () => {};
const max = renderToStaticMarkup(<GamificationPanel summary={summary} onClose={close} />);
assert.match(max, /Nivel máximo/);
assert.match(max, /5000 XP/);
assert.match(max, /Objetivo cumplido/);
assert.match(max, /Todavía no tienes logros/);
assert.doesNotMatch(max, /Siguiente objetivo/);

function account(notices?: PersonalNotice[]) {
  return renderToStaticMarkup(<AccountPanel name="Alex" notices={notices} onClose={close} onSignOut={close} signOutError="" />);
}
assert.match(account(), /Consulta tus avisos en el dashboard/);
assert.doesNotMatch(account(), /No tienes avisos pendientes/);
assert.match(account([]), /No tienes avisos pendientes/);
const notices = Array.from({ length: 4 }, (_, i) => ({ id: `${i}`, title: `Aviso ${i}`, message: "Detalle", href: `/dashboard?item=${i}` }));
const many = account(notices);
assert.match(many, /Ver los 4 avisos/);
assert.match(many, /Aviso 1/);
assert.doesNotMatch(many, /Aviso 2/);
assert.match(many, /href="\/dashboard\?item=1"/);
console.log("Menús: estados de progreso, avisos y enlaces comprobados.");

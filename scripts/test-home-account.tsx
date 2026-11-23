import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

import type { GamificationSummary } from "../src/components/account-status";
import { HeaderAccount } from "../src/components/header-account";

const router = { back() {}, forward() {}, refresh() {}, push() {}, replace() {}, prefetch() {}, bfcacheId: "test" };
const summary: GamificationSummary = {
  level: 7,
  xp: 100,
  xpIntoLevel: 20,
  xpForNextLevel: 50,
  progressPercent: 40,
  isMaxLevel: false,
  currentStreak: 2,
  bestStreak: 3,
  weeklyGoal: { activeDays: 2, targetDays: 3, completed: false },
  achievements: [
    { id: "one", title: "Primer paso", xp: 10, unlocked: true, category: "entrenamiento" },
    { id: "two", title: "Siguiente paso", xp: 20, unlocked: false, category: "constancia" },
  ],
};

function render(initialUser: { email: string; name: string } | null) {
  return renderToStaticMarkup(<AppRouterContext.Provider value={router}><HeaderAccount initialUser={initialUser} gamification={summary} appearance="dark" /></AppRouterContext.Provider>);
}

const visitor = render(null);
assert.match(visitor, /href="\/login"/);
assert.match(visitor, /href="\/onboarding"/);
assert.doesNotMatch(visitor, /Ver logros/);

const signedIn = render({ email: "example@example.test", name: "Alex" });
assert.match(signedIn, /Nivel 7\. Ver logros/);
assert.match(signedIn, /1 logros/);
assert.match(signedIn, /Abrir espacio personal de Alex/);
assert.doesNotMatch(signedIn, /href="\/login"/);
console.log("Cabecera de portada: accesos de visitante y datos reales de cuenta y logros.");

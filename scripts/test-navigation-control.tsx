import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { NavigationAnchor, NavigationButton, NavigationLink } from "../src/components/navigation-control";

const back = renderToStaticMarkup(<NavigationLink href="/nutrition/builder">Volver al gestor</NavigationLink>);
const dashboard = renderToStaticMarkup(<NavigationLink href="/dashboard?tab=training" kind="dashboard">Ir al dashboard</NavigationLink>);
const directDashboard = renderToStaticMarkup(<NavigationAnchor href="/dashboard" kind="dashboard">Volver a mi panel</NavigationAnchor>);
const disabled = renderToStaticMarkup(<NavigationButton disabled>Volver a mis rutinas</NavigationButton>);

assert.match(back, /href="\/nutrition\/builder"/);
assert.match(back, /lucide-arrow-left/);
assert.match(dashboard, /href="\/dashboard\?tab=training"/);
assert.match(dashboard, /lucide-layout-dashboard/);
assert.match(directDashboard, /<a[^>]*href="\/dashboard"/);
assert.match(directDashboard, /lucide-layout-dashboard/);
assert.match(disabled, /<button[^>]*disabled/);
assert.match(disabled, /type="button"/);
for (const markup of [back, dashboard, directDashboard, disabled]) {
  assert.match(markup, /min-h-10/);
  assert.match(markup, /text-\[#526052\]/);
  assert.match(markup, /focus-visible:outline-2/);
  assert.match(markup, /aria-hidden="true"/);
}

console.log("Controles de navegación: pruebas correctas.");

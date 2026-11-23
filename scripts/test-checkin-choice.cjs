/* eslint-disable @typescript-eslint/no-require-imports -- The page uses synthetic server dependencies. */
const assert = require("node:assert/strict");
const Module = require("node:module");
const React = require("react");
const { renderToStaticMarkup } = require("react-dom/server");

const originalLoad = Module._load;
Module._load = function(request, parent, isMain) {
  if (request === "@/lib/supabase/server") return { createClient: async () => ({ auth: { getUser: async () => ({ data: { user: { id: "fixture", email: "fixture@example.invalid" } } }) } }) };
  if (request === "@/lib/supabase/admin") return { createAdminClient: () => ({ from: () => ({ select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: {
    name: "Fixture", primary_goal: "Mantener peso", days_per_week: 3, session_duration_minutes: 60,
    training_place: "Casa", training_equipment: [], restrictions: [], food_restrictions: [],
  }, error: null }) }) }) };
  if (request === "@/components/app-header") return { AppHeader: () => React.createElement("header", null, "Atempo") };
  if (request === "@/components/navigation-control") return { NavigationLink: ({ href, children }) => React.createElement("a", { href }, children) };
  if (request === "@/components/checkin-wizard") return { CheckinWizard: ({ mode }) => React.createElement("div", { "data-mode": mode }) };
  return originalLoad.call(this, request, parent, isMain);
};
const Page = require("../src/app/checkin/page.tsx").default;
Module._load = originalLoad;

async function main() {
  const chooser = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({}) }));
  for (const [mode, title] of [["workout", "Solo entrenamiento"], ["nutrition", "Solo alimentación"], ["general", "Entrenamiento y alimentación"]]) {
    assert.ok(chooser.includes(`/checkin?mode=${mode}`), mode);
    assert.ok(chooser.includes(title), mode);
    const markup = renderToStaticMarkup(await Page({ searchParams: Promise.resolve({ mode }) }));
    assert.ok(markup.includes(`data-mode="${mode}"`), mode);
  }
  assert.ok(chooser.includes("objetivo") && chooser.includes("/dashboard"));
  console.log("Pantalla de revisión: selector y accesos directos por modo correctos.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });

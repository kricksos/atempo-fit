import assert from "node:assert/strict";

import { saveNutritionCompletions } from "../src/features/planning/nutrition-completion-client";
import { requestAssistantResponse } from "../src/lib/assistant-client";

async function main() {
  const originalFetch = globalThis.fetch;
  try {
    const calls: Array<{ url: string; body: Record<string, unknown> }> = [];
    globalThis.fetch = async (input, init) => {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      calls.push({ url: String(input), body });
      if (body.mealId === "failed") return new Response("error", { status: 500 });
      if (body.mealId === "offline") throw new Error("offline");
      return Response.json({ saved: true });
    };
    const result = await saveNutritionCompletions(["ok", "failed", "offline"], true, "2026-01-01");
    assert.deepEqual(result, { savedIds: ["ok"], failed: true });
    assert.equal(calls.length, 3);
    assert.deepEqual(calls[0].body, { mealId: "ok", completed: true, date: "2026-01-01" });

    globalThis.fetch = async (input, init) => {
      calls.push({ url: String(input), body: JSON.parse(String(init?.body)) as Record<string, unknown> });
      return Response.json({ answer: "Respuesta de prueba" });
    };
    const history = Array.from({ length: 11 }, (_, index) => ({ role: "assistant" as const, content: `${index}${"x".repeat(2200)}` }));
    assert.equal(await requestAssistantResponse("Consulta", history), "Respuesta de prueba");
    const payload = calls[calls.length - 1].body;
    assert.equal(payload.message, "Consulta");
    const sentHistory = payload.history as typeof history;
    assert.equal(sentHistory.length, 10);
    assert.equal(sentHistory[0].content.length, 2000);
    assert.ok(sentHistory[0].content.startsWith("1"));

    globalThis.fetch = async () => Response.json({ error: "Asistente no configurado" }, { status: 503 });
    await assert.rejects(requestAssistantResponse("Consulta", []), /Asistente no configurado/);
    globalThis.fetch = async () => Response.json({ answer: "" });
    await assert.rejects(requestAssistantResponse("Consulta", []), /respuesta válida/);
    globalThis.fetch = async () => { throw new Error("offline"); };
    await assert.rejects(requestAssistantResponse("Consulta", []), /conectar con el asistente/);
  } finally {
    globalThis.fetch = originalFetch;
  }
  console.log("Nutrición: guardado parcial, errores y consultas del asistente correctos.");
}

void main();

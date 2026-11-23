export type AssistantMessage = { role: "user" | "assistant"; content: string };

export async function requestAssistantResponse(message: string, history: AssistantMessage[]) {
  let response: Response;
  try {
    response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history: history.slice(-10).map((entry) => ({ ...entry, content: entry.content.slice(0, 2000) })) }),
    });
  } catch {
    throw new Error("No hemos podido conectar con el asistente. Revisa tu conexión e inténtalo de nuevo.");
  }
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : "No he podido responder ahora. Inténtalo de nuevo.";
    throw new Error(error);
  }
  if (!data || typeof data !== "object" || !("answer" in data) || typeof data.answer !== "string" || !data.answer.trim()) {
    throw new Error("No he recibido una respuesta válida. Inténtalo de nuevo.");
  }
  return data.answer;
}

"use client";

import { ArrowRight, Bot, LoaderCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { requestAssistantResponse, type AssistantMessage } from "@/lib/assistant-client";

type Props = {
  mealName: string;
  foods: { name: string; quantityGrams: number }[];
  onClose: () => void;
};

export function NutritionAssistantDialog({ mealName, foods, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const [input, setInput] = useState(() => `¿Cómo puedo preparar ${mealName.toLowerCase()} con ${foods.map((food) => `${food.name} (${food.quantityGrams} g)`).join(", ")}? Dame ideas sencillas respetando las cantidades de mi plan.`.slice(0, 1200));
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    questionRef.current?.focus();
    return () => { if (dialog?.open) dialog.close(); };
  }, []);

  function close() {
    dialogRef.current?.close();
    onClose();
  }

  async function send() {
    const question = input.trim();
    if (!question || loading) return;
    setLoading(true);
    setError(null);
    try {
      const answer = await requestAssistantResponse(question, messages);
      setMessages((current) => [...current, { role: "user", content: question }, { role: "assistant", content: answer }]);
      setInput("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "No he podido responder ahora. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return <dialog ref={dialogRef} onCancel={(event) => { event.preventDefault(); close(); }} onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); close(); } }} aria-labelledby="nutrition-assistant-title" className="m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-[1.75rem] border border-[#e7d8d2] bg-white p-0 text-[#17343d] shadow-2xl backdrop:bg-[#102a35]/60">
    <header className="flex items-center justify-between gap-4 border-b border-[#edf0f1] p-5"><div className="flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-[#fff1ed] text-[#b6503c]"><Bot size={21} aria-hidden="true" /></span><div><h2 id="nutrition-assistant-title" className="font-bold">Pregunta al asistente</h2><p className="mt-1 text-xs text-[#647b82]">{mealName}</p></div></div><button type="button" onClick={close} aria-label="Cerrar asistente" className="grid size-11 place-items-center rounded-full text-[#526e75] hover:bg-[#f1f5f5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6503c]"><X size={20} aria-hidden="true" /></button></header>
    <div className="p-5">
      <p className="text-sm leading-6 text-[#526e75]">Revisa la pregunta y pide ideas para preparar los alimentos de esta comida.</p>
      {messages.length > 0 && <div aria-live="polite" className="mt-4 max-h-60 space-y-3 overflow-y-auto">{messages.map((message, index) => <div key={`${message.role}-${index}`} className={`whitespace-pre-wrap rounded-2xl p-3 text-sm leading-6 ${message.role === "user" ? "ml-6 bg-[#173b44] text-white" : "mr-6 bg-[#f7f9f9] text-[#17343d]"}`}><span className="mb-1 block text-xs font-bold">{message.role === "user" ? "Tu consulta" : "Asistente"}</span>{message.content}</div>)}</div>}
      <label htmlFor="nutrition-assistant-question" className="mt-5 block text-xs font-bold uppercase tracking-[0.12em] text-[#647b82]">{messages.length ? "Continuar la conversación" : "Tu pregunta"}</label>
      <textarea ref={questionRef} id="nutrition-assistant-question" maxLength={1200} value={input} onChange={(event) => setInput(event.target.value)} rows={messages.length ? 3 : 5} className="mt-2 w-full resize-y rounded-2xl border border-[#d7e2e4] bg-[#f7f9f9] p-3 text-sm leading-6 text-[#17343d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6503c]" />
      {error && <p role="alert" className="mt-3 rounded-xl bg-[#fff1ed] p-3 text-sm text-[#9f4b39]">{error}</p>}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-[#647b82]">{loading ? "Preparando respuesta..." : "La consulta no modifica tu dieta."}</p><button type="button" disabled={!input.trim() || loading} onClick={send} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#b6503c] px-4 text-sm font-semibold text-white hover:bg-[#963e2f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b6503c] disabled:opacity-40">{loading ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />} Enviar consulta</button></div>
    </div>
  </dialog>;
}

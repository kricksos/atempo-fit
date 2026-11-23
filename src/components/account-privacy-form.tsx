"use client";

import { LoaderCircle, ShieldCheck, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#375dac]";

export function AccountPrivacyForm({ initialAnalytics, initialHealthData }: { initialAnalytics: boolean; initialHealthData: boolean }) {
  const router = useRouter();
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [healthData, setHealthData] = useState(initialHealthData);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(false);

  async function updateConsent(consentType: "analytics" | "health_data", accepted: boolean) {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/account/consents", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ consentType, accepted }) });
      if (!response.ok) throw new Error("No hemos podido actualizar tus preferencias.");
      if (consentType === "analytics") setAnalytics(accepted);
      else setHealthData(accepted);
      setMessage({ text: "Preferencias actualizadas.", error: false });
    } catch (error) { setMessage({ text: error instanceof Error ? error.message : "No hemos podido actualizar tus preferencias.", error: true }); }
    finally { setSaving(false); }
  }

  async function deleteAccount() {
    setDeleting(true);
    setDeleteMessage("");
    try {
      const response = await fetch("/api/account/delete", { method: "DELETE" });
      if (!response.ok) throw new Error("No hemos podido eliminar la cuenta.");
      setDeleted(true);
      const { error } = await createClient().auth.signOut({ scope: "local" });
      if (error) throw new Error("La cuenta se ha eliminado, pero no hemos podido cerrar la sesión local. Cierra sesión manualmente.");
      router.push("/");
      router.refresh();
    } catch (error) { setDeleteMessage(error instanceof Error ? error.message : "No hemos podido completar la eliminación. Comprueba tu cuenta antes de reintentar."); }
    finally { setDeleting(false); }
  }

  return <div className="space-y-4">
    <section className="rounded-[1.5rem] border border-[#e1e9eb] bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#f1eef9] text-[#7550a4]"><ShieldCheck size={20} aria-hidden="true" /></span><div><h2 className="font-semibold">Tus permisos</h2><p className="mt-1 text-sm leading-6 text-[#71858c]">Puedes retirar estos consentimientos cuando quieras. La personalización puede verse limitada si retiras el uso de datos de salud.</p></div></div>
      <div className="mt-4 divide-y divide-[#eaf0f1]">
        <label className="flex min-h-20 items-center justify-between gap-4 py-4"><span><strong className="block text-sm">Analítica no esencial</strong><span className="mt-1 block text-xs leading-5 text-[#71858c]">Ayuda a mejorar el producto con métricas agregadas.</span></span><input type="checkbox" checked={analytics} disabled={saving} onChange={(event) => updateConsent("analytics", event.target.checked)} className={`size-5 shrink-0 accent-[#08786f] ${focus}`} /></label>
        <label className="flex min-h-20 items-center justify-between gap-4 py-4"><span><strong className="block text-sm">Datos de salud</strong><span className="mt-1 block text-xs leading-5 text-[#71858c]">Permite adaptar recomendaciones a lesiones y restricciones.</span></span><input type="checkbox" checked={healthData} disabled={saving} onChange={(event) => updateConsent("health_data", event.target.checked)} className={`size-5 shrink-0 accent-[#08786f] ${focus}`} /></label>
      </div>{message && <p role={message.error ? "alert" : "status"} className={`text-sm ${message.error ? "text-[#a64e3c]" : "text-[#08786f]"}`}>{message.text}</p>}
    </section>
    <section className="rounded-[1.5rem] border border-[#f0d9d4] bg-white p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#fdf0ed] text-[#b6503c]"><Trash2 size={20} aria-hidden="true" /></span><div className="min-w-0"><h2 className="font-semibold">Eliminar cuenta</h2><p className="mt-1 text-sm leading-6 text-[#71858c]">Elimina tu cuenta y los datos asociados de Atempo Fit. Esta acción no se puede deshacer.</p><p className="mt-2 text-sm leading-6 text-[#8f4434]">Eliminar la cuenta no cancela automáticamente una suscripción de pago. Si tienes una, cancela su renovación antes de continuar.</p>
      {!confirmDelete && !deleted ? <button type="button" onClick={() => setConfirmDelete(true)} className={`mt-4 min-h-11 rounded-full border border-[#e6c6bf] px-4 text-sm font-semibold text-[#a64e3c] hover:bg-[#fff5f2] ${focus}`}>Eliminar mi cuenta</button> : !deleted && <div className="mt-4 rounded-2xl border border-[#efd2c9] bg-[#fff7f4] p-4"><p className="text-sm font-semibold text-[#8f4434]">¿Confirmas que quieres eliminar tu cuenta?</p><p className="mt-1 text-xs leading-5 text-[#91685e]">La eliminación es permanente y no cancela una suscripción de pago.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" disabled={deleting} onClick={deleteAccount} className={`inline-flex min-h-11 items-center gap-2 rounded-full bg-[#a64e3c] px-4 text-sm font-semibold text-white disabled:opacity-60 ${focus}`}>{deleting && <LoaderCircle size={15} className="animate-spin" />}{deleting ? "Eliminando..." : "Confirmar eliminación"}</button><button type="button" disabled={deleting} onClick={() => setConfirmDelete(false)} className={`min-h-11 rounded-full border border-[#e6c6bf] px-4 text-sm font-semibold text-[#8f4434] ${focus}`}>Cancelar</button></div></div>}
      {deleteMessage && <p role="alert" className="mt-3 text-sm text-[#a64e3c]">{deleteMessage}</p>}</div></div></section>
  </div>;
}

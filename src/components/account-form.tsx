"use client";

import { LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useState } from "react";

import { createClient } from "@/lib/supabase/client";

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#375dac]";
const field = `mt-2 min-h-11 w-full rounded-xl border border-[#dce6e8] bg-white px-3 text-base text-[#173b44] ${focus}`;
const button = `inline-flex min-h-11 items-center gap-2 rounded-full bg-[#173b44] px-5 text-sm font-semibold text-white disabled:opacity-60 ${focus}`;

export function AccountNameForm({ initialName, initialEmail, hasProfile, onSaved }: { initialName: string; initialEmail: string; hasProfile: boolean; onSaved: (name: string) => void }) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);

  async function saveName() {
    const trimmed = name.trim();
    if (!trimmed) { setMessage({ text: "El nombre no puede estar vacío.", error: true }); return; }
    setSaving(true);
    setMessage(null);
    try {
      const supabase = createClient();
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("No hemos podido comprobar tu sesión. Inicia sesión de nuevo.");
      const { error: metadataError } = await supabase.auth.updateUser({ data: { name: trimmed } });
      if (metadataError) throw new Error("No hemos podido guardar tu nombre. Inténtalo de nuevo.");
      if (hasProfile) {
        const { data, error } = await supabase.from("profiles").update({ name: trimmed }).eq("user_id", auth.user.id).select("user_id").maybeSingle();
        if (error || !data) throw new Error("El nombre de acceso se ha actualizado, pero no hemos podido actualizar tu perfil. Inténtalo de nuevo.");
      }
      onSaved(trimmed);
      setMessage({ text: "Nombre actualizado.", error: false });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "No hemos podido guardar tu nombre. Inténtalo de nuevo.", error: true });
    } finally { setSaving(false); }
  }

  return <div className="space-y-4">
    <section className="rounded-[1.5rem] border border-[#e1e9eb] bg-white p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e7f6f3] text-[#08786f]"><UserRound size={20} aria-hidden="true" /></span><div><h2 className="font-semibold">Tu nombre</h2><p className="mt-1 text-sm leading-6 text-[#71858c]">Así te llamaremos en tu espacio personal.</p></div></div><label className="mt-5 block text-sm font-semibold text-[#526e75]">Nombre<input className={field} value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label><button type="button" disabled={saving} onClick={saveName} className={`mt-4 ${button}`}>{saving ? <><LoaderCircle size={16} className="animate-spin" /> Guardando...</> : "Guardar nombre"}</button>{message && <p role={message.error ? "alert" : "status"} className={`mt-3 text-sm ${message.error ? "text-[#a64e3c]" : "text-[#08786f]"}`}>{message.text}</p>}</section>
    <section className="rounded-[1.5rem] border border-[#e1e9eb] bg-white p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#edf2ff] text-[#375dac]"><Mail size={20} aria-hidden="true" /></span><div className="min-w-0"><h2 className="font-semibold">Correo de acceso</h2><p className="mt-1 text-sm leading-6 text-[#71858c]">Utilizas este correo para acceder a tu cuenta. No se puede modificar desde aquí.</p><p className="mt-4 break-all text-sm font-semibold text-[#315d5a]">{initialEmail || "Sin correo"}</p></div></div></section>
  </div>;
}

export function AccountPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null);
  async function savePassword() {
    if (password.length < 8) { setMessage({ text: "La contraseña debe tener al menos 8 caracteres.", error: true }); return; }
    if (password !== confirmation) { setMessage({ text: "Las contraseñas no coinciden.", error: true }); return; }
    setSaving(true);
    setMessage(null);
    try {
      const { error } = await createClient().auth.updateUser({ password });
      if (error) throw new Error("No hemos podido actualizar tu contraseña. Inténtalo de nuevo.");
      setPassword("");
      setConfirmation("");
      setMessage({ text: "Contraseña actualizada.", error: false });
    } catch (error) { setMessage({ text: error instanceof Error ? error.message : "No hemos podido actualizar tu contraseña. Inténtalo de nuevo.", error: true }); }
    finally { setSaving(false); }
  }
  return <section className="rounded-[1.5rem] border border-[#e1e9eb] bg-white p-5 sm:p-6"><div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#edf2ff] text-[#375dac]"><LockKeyhole size={20} aria-hidden="true" /></span><div><h2 className="font-semibold">Contraseña</h2><p className="mt-1 text-sm leading-6 text-[#71858c]">Mantén protegido el acceso a tu cuenta.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-sm font-semibold text-[#526e75]">Nueva contraseña<input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Al menos 8 caracteres" className={field} /></label><label className="text-sm font-semibold text-[#526e75]">Confirmar contraseña<input type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className={field} /></label></div><button type="button" disabled={saving} onClick={savePassword} className={`mt-4 ${button}`}>{saving ? <><LoaderCircle size={16} className="animate-spin" /> Guardando...</> : "Actualizar contraseña"}</button>{message && <p role={message.error ? "alert" : "status"} className={`mt-3 text-sm ${message.error ? "text-[#a64e3c]" : "text-[#08786f]"}`}>{message.text}</p>}</section>;
}

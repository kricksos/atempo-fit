"use client";

import { Download, LoaderCircle } from "lucide-react";
import { useState } from "react";

export function AccountDataExport() {
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function exportData() {
    setExporting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/account/export", { cache: "no-store" });
      if (!response.ok) throw new Error("Export failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "atempo-fit-datos.json";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage("Tus datos se han descargado.");
    } catch {
      setMessage("No hemos podido preparar tus datos. Inténtalo de nuevo.");
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="rounded-[1.5rem] border border-[#e1e9eb] bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <Download className="mt-0.5 text-[#08786f]" size={20} />
        <div>
          <h2 className="font-semibold">Descargar mis datos</h2>
          <p className="mt-2 text-sm leading-6 text-[#71858c]">Descarga una copia en JSON de tu perfil, objetivos, medidas, planes, entrenamientos, nutrición, consentimientos y actividad.</p>
        </div>
      </div>
      <button type="button" disabled={exporting} onClick={exportData} className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#173b44] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#375dac]">
        {exporting ? <LoaderCircle size={15} className="animate-spin" /> : <Download size={15} />}
        {exporting ? "Preparando..." : "Descargar mis datos"}
      </button>
      {message ? <p role="status" className="mt-4 text-sm font-semibold text-[#526e75]">{message}</p> : null}
    </section>
  );
}

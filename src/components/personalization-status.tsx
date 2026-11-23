"use client";

import { ShieldCheck, Utensils } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useEffectEvent, useRef, useState } from "react";

import { foodRestrictionOptions } from "@/lib/food-restrictions";
import { injuryOptions } from "@/lib/injuries";

type PersonalizationStatusProps = { initialInjuries: string[]; initialFoodRestrictions: string[]; readOnly?: boolean };

function withoutNone(values: string[]) {
  return values.filter((value) => value !== "Ninguna");
}

export function PersonalizationStatus({ initialInjuries, initialFoodRestrictions, readOnly = false }: PersonalizationStatusProps) {
  const router = useRouter();
  const [injuries, setInjuries] = useState(withoutNone(initialInjuries));
  const [foodRestrictions, setFoodRestrictions] = useState(withoutNone(initialFoodRestrictions));
  const [message, setMessage] = useState<string | null>(null);
  const hasLoadedInitialValues = useRef(false);

  function toggle(value: string, values: string[], setValues: (nextValues: string[]) => void) {
    setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  }

  const save = useEffectEvent(async () => {
    setMessage(null);
    const response = await fetch("/api/profile/restrictions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ foodRestrictions, injuries }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.error ?? "No hemos podido guardar los cambios. Inténtalo de nuevo.");
      return;
    }
    router.refresh();
  });

  useEffect(() => {
    if (readOnly) return;
    if (!hasLoadedInitialValues.current) {
      hasLoadedInitialValues.current = true;
      return;
    }

    const saveTimer = window.setTimeout(() => {
      void save();
    }, 500);
    return () => window.clearTimeout(saveTimer);
  }, [foodRestrictions, injuries, readOnly]);

  return (
    <div className="mt-8 grid gap-3 md:grid-cols-2">
      <section className="rounded-2xl border border-[#c7e1dc] bg-[#f0f9f7] p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-[#145257] text-[#a6eee0]"><ShieldCheck size={18} /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#526e69]">Entrenamiento</p>
            <p className="mt-1 text-sm font-semibold text-[#172d32]">{injuries.length ? "Adaptado por lesiones activas" : "Sin lesiones activas"}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {injuryOptions.filter((option) => option !== "Ninguna").map((option) => <button type="button" key={option} disabled={readOnly} onClick={() => toggle(option, injuries, setInjuries)} className={`rounded-full border px-3 py-1 text-xs font-semibold ${injuries.includes(option) ? "border-[#458f86] bg-[#d5f1eb] text-[#145257]" : "border-[#c7e1dc] bg-white/70 text-[#526e69]"}`}>{option}</button>)}
        </div>
      </section>
      <section className="rounded-2xl border border-[#d8e6d9] bg-[#f5faf4] p-4">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-xl bg-[#3d604c] text-[#d0e9c1]"><Utensils size={18} /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#526e69]">Nutrición</p>
            <p className="mt-1 text-sm font-semibold text-[#172d32]">{foodRestrictions.length ? "Filtrada por intolerancias activas" : "Sin intolerancias activas"}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {foodRestrictionOptions.filter((option) => option !== "Ninguna").map((option) => <button type="button" key={option} disabled={readOnly} onClick={() => toggle(option, foodRestrictions, setFoodRestrictions)} className={`rounded-full border px-3 py-1 text-xs font-semibold ${foodRestrictions.includes(option) ? "border-[#86ad8a] bg-[#e4f2df] text-[#3d604c]" : "border-[#c9ddcd] bg-white/70 text-[#526e69]"}`}>{option}</button>)}
        </div>
      </section>
      <div className="md:col-span-2">
        {message && <p className="text-sm font-semibold text-[#a64e3c]">{message}</p>}
      </div>
    </div>
  );
}
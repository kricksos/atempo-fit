"use client";

import { Check } from "lucide-react";

import { homeEquipmentOptions } from "@/lib/exercise-equipment";

type EquipmentSelectorProps = {
  selected: string[];
  onSelect: (label: string) => void;
};

export function EquipmentSelector({ selected, onSelect }: EquipmentSelectorProps) {
  const options = ["Sin material", ...homeEquipmentOptions.map((option) => option.label)];

  function optionButton(label: string) {
    const active = selected.includes(label);
    return <button type="button" key={label} aria-pressed={active} onClick={() => onSelect(label)} className={`flex min-h-16 items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition ${active ? "border-[#72873f] bg-[#e7f5b4]" : "border-[#d3dbcf] bg-[#f8f7f1] hover:border-[#9aaa89]"}`}><span className="font-medium">{label}</span>{active && <Check size={19} className="shrink-0 text-[#60703d]" />}</button>;
  }

  return <><div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-2">{options.map(optionButton)}</div>{selected.includes("Mochila resistente con carga") && <p className="mt-3 max-w-2xl text-sm leading-6 text-[#68736b]">Utiliza una mochila resistente con asas firmes y una carga bien asegurada. Empieza con poco peso.</p>}</>;
}

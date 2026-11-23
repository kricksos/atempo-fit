import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

export function FavoriteButton({ name, favorite, disabled, onClick, className }: { name: string; favorite: boolean; disabled?: boolean; onClick: () => void; className?: string }) {
  return <button type="button" aria-pressed={favorite} aria-label={`${favorite ? "Quitar de favoritos" : "Añadir a favoritos"}: ${name}`} disabled={disabled} onClick={onClick} className={cn("relative z-10 grid size-11 shrink-0 place-items-center rounded-full border border-[#d7e3d3] bg-white text-[#52682f] shadow-sm transition-colors hover:bg-[#eff6e7] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#72873f] disabled:cursor-wait disabled:opacity-50", className)}>
    <Heart size={19} fill={favorite ? "currentColor" : "none"} aria-hidden="true" />
  </button>;
}

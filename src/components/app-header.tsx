import Link from "next/link";
import { Sparkles } from "lucide-react";

import type { GamificationSummary, PersonalNotice } from "@/components/account-status";
import { HeaderMenus } from "@/components/header-menus";

type AppHeaderProps = { email: string; name: string; gamification?: GamificationSummary; notices?: PersonalNotice[]; variant?: "default" | "dashboard"; [key: string]: unknown };

export function AppHeader({ email, name, gamification, notices, variant = "default" }: AppHeaderProps) {
  return (
    <header className={variant === "dashboard" ? "flex flex-wrap items-center justify-between gap-3 border-b border-[#d6e5e2] pb-5" : "flex items-center justify-between gap-3 rounded-2xl border border-white/70 bg-white/70 px-4 py-3 shadow-[0_8px_30px_rgba(29,48,40,0.06)] backdrop-blur-md sm:px-5"}>
      <Link href="/" className="flex items-center gap-3" aria-label="Volver a la portada de Atempo Fit">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${variant === "dashboard" ? "bg-[#163e49] text-[#a6eee0]" : "bg-[#18231f] text-[#d7f36b]"}`}><Sparkles size={18} /></span>
        <span><span className="block font-semibold tracking-tight">Atempo Fit</span>{variant === "dashboard" && <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#607d79]">Tu espacio personal</span>}</span>
      </Link>
      <HeaderMenus email={email} name={name} gamification={gamification} notices={notices} />
    </header>
  );
}

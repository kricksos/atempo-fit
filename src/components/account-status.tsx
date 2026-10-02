"use client";

import { ArrowRight, Bell, LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export type GamificationSummary = {
  level: number;
  xp: number;
  xpIntoLevel: number;
  xpForNextLevel: number | null;
  progressPercent: number;
  isMaxLevel: boolean;
  currentStreak: number;
  bestStreak: number;
  weeklyGoal: { activeDays: number; targetDays: number; completed: boolean };
  achievements: Array<{
    id: string;
    title: string;
    xp: number;
    unlocked: boolean;
    category: "entrenamiento" | "nutrición" | "seguimiento" | "constancia" | "objetivos" | "progreso";
  }>;
};

export type PersonalNotice = {
  id: string;
  title: string;
  message: string;
  href?: string;
  actionLabel?: string;
};

type AccountStatusProps = {
  email: string;
  name: string;
  notices?: PersonalNotice[];
};

export function AccountStatus({ email, name, notices = [] }: AccountStatusProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [seenSignature, setSeenSignature] = useState<string | null>(null);
  const noticeSignature = notices.map((notice) => notice.id).join("|");

  useEffect(() => {
    // localStorage is external state; hydrate it after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeenSignature(window.localStorage.getItem(`momentum_seen_personal_space:${email}`));
  }, [email]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  function toggleOpen() {
    setIsOpen((current) => !current);
    if (!isOpen && noticeSignature) {
      window.localStorage.setItem(`momentum_seen_personal_space:${email}`, noticeSignature);
      setSeenSignature(noticeSignature);
    }
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="relative">
        <button type="button" onClick={toggleOpen} aria-expanded={isOpen} aria-label={`Abrir espacio personal de ${name}`} className="relative flex items-center gap-2 rounded-full border border-[#aeb9a2] bg-white px-3 py-2 text-left transition-colors hover:border-[#18231f]">
          <span className="grid size-7 place-items-center rounded-full bg-[#e7f5b4] text-[#60703d]"><UserRound size={14} /></span>
          <span className="hidden sm:block"><span className="block text-xs font-semibold text-[#60703d]">Online</span><span className="block max-w-32 truncate text-xs text-[#59645e]" title={email}>{name}</span></span>
          {notices.length > 0 && seenSignature !== noticeSignature ? <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#c0492f] text-[9px] font-bold text-white" aria-label="Tienes avisos nuevos">{Math.min(notices.length, 9)}</span> : null}
        </button>
        {isOpen ? <>
          <button type="button" aria-label="Cerrar espacio personal" onClick={() => setIsOpen(false)} className="fixed inset-0 z-10 cursor-default" />
          <section className="absolute right-0 top-14 z-20 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-[#d3dbcf] bg-[#f8f7f1] p-5 text-left shadow-[0_20px_50px_rgba(24,35,31,0.16)]">
            <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#819078]">Tu espacio</p><h2 className="mt-1 text-xl font-semibold">Hola, {name}</h2></div><Bell size={18} className="text-[#72873f]" /></div>
            <div className="mt-4 space-y-2">
              {notices.length > 0 ? notices.slice(0, 3).map((notice) => <div key={notice.id} className="rounded-xl border border-[#d3dbcf] bg-white p-3"><p className="text-sm font-semibold text-[#18231f]">{notice.title}</p><p className="mt-1 text-xs leading-5 text-[#68736b]">{notice.message}</p>{notice.href ? <Link href={notice.href} onClick={() => setIsOpen(false)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#60703d]">{notice.actionLabel ?? "Ver"} <ArrowRight size={13} /></Link> : null}</div>) : <p className="rounded-xl border border-[#d3dbcf] bg-white p-3 text-sm text-[#68736b]">Ahora mismo no tienes avisos pendientes.</p>}
            </div>
            <div className="mt-4 border-t border-[#d9ddd3] pt-4"><Link href="/account" onClick={() => setIsOpen(false)} className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-[#18231f] hover:bg-white">Mi cuenta <ArrowRight size={15} /></Link><button type="button" onClick={signOut} className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#68736b] hover:bg-white">Cerrar sesión <LogOut size={15} /></button></div>
          </section>
        </> : null}
      </div>
    </div>
  );
}

"use client";

import { ArrowRight, Bell, ChevronDown, LogOut, UserRound, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type RefObject } from "react";

import { HeaderMenuPopover } from "@/components/header-menu-popover";
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

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#375dac]";

type AccountStatusProps = {
  email: string;
  name: string;
  notices?: PersonalNotice[];
  appearance?: "default" | "dark";
  isOpen: boolean;
  onToggle: () => void;
  onClose: (restoreFocus: boolean) => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
  anchorRef: RefObject<HTMLDivElement | null>;
};

export function AccountStatus({ email, name, notices, appearance = "default", isOpen, onToggle, onClose, buttonRef, anchorRef }: AccountStatusProps) {
  const router = useRouter();
  const [seenSignature, setSeenSignature] = useState<string | null>(null);
  const [signOutError, setSignOutError] = useState("");
  const noticeSignature = notices?.map((notice) => notice.id).join("|") ?? "";

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSeenSignature(window.localStorage.getItem(`momentum_seen_personal_space:${email}`));
  }, [email]);

  async function signOut() {
    setSignOutError("");
    try {
      const { error } = await createClient().auth.signOut();
      if (error) {
        setSignOutError("No se ha podido cerrar la sesión. Inténtalo de nuevo.");
        return;
      }
      onClose(false);
      router.refresh();
    } catch {
      setSignOutError("No se ha podido cerrar la sesión. Inténtalo de nuevo.");
    }
  }

  function toggle() {
    if (!isOpen && noticeSignature) {
      window.localStorage.setItem(`momentum_seen_personal_space:${email}`, noticeSignature);
      setSeenSignature(noticeSignature);
    }
    onToggle();
  }

  return <>
    <button ref={buttonRef} type="button" onClick={toggle} aria-expanded={isOpen} aria-controls="header-account-menu" aria-label={`Abrir espacio personal de ${name}`} className={`relative flex min-h-11 items-center gap-2 rounded-full border py-1 pl-1.5 pr-2.5 text-left shadow-sm transition-colors ${appearance === "dark" ? "border-white/20 bg-white/5 text-white hover:bg-white/10" : "border-[#dfe5ec] bg-white hover:border-[#a9c9c4]"} ${focus}`}>
      <span className="grid size-8 place-items-center rounded-full bg-[#e7f6f3] text-[#08786f]"><UserRound size={16} aria-hidden="true" /></span>
      <span className={`hidden text-xs font-bold sm:block ${appearance === "dark" ? "text-white" : "text-[#315d5a]"}`}>Mi espacio<span className={`mt-0.5 block max-w-32 truncate font-normal ${appearance === "dark" ? "text-[#c5d8da]" : "text-[#71858c]"}`} title={email}>{name}</span></span>
      <ChevronDown size={15} aria-hidden="true" className={`${appearance === "dark" ? "text-[#c5d8da]" : "text-[#526e75]"} ${isOpen ? "rotate-180" : ""}`} />
      {notices && notices.length > 0 && seenSignature !== noticeSignature && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border-2 border-white bg-[#b6503c] text-[10px] font-bold text-white" aria-label="Tienes avisos nuevos">{Math.min(notices.length, 9)}</span>}
    </button>
    {isOpen && <HeaderMenuPopover anchorRef={anchorRef} id="header-account-menu" titleId="header-account-title" onClose={onClose}><AccountPanel name={name} notices={notices} onClose={onClose} onSignOut={signOut} signOutError={signOutError} /></HeaderMenuPopover>}
  </>;
}

export function AccountPanel({ name, notices, onClose, onSignOut, signOutError }: { name: string; notices?: PersonalNotice[]; onClose: (restoreFocus: boolean) => void; onSignOut: () => void; signOutError: string }) {
  const [showAll, setShowAll] = useState(false);
  return <>
    <div className="flex items-start gap-3"><span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-[#e7f6f3] text-[#08786f]"><UserRound size={20} aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#08786f]">Tu espacio</p><h2 id="header-account-title" className="mt-1 text-xl font-bold tracking-tight">Hola, {name}</h2><p className="mt-1 text-xs text-[#71858c]">Tu cuenta y avisos en un lugar.</p></div><button type="button" onClick={() => onClose(true)} aria-label="Cerrar mi espacio" className={`grid size-10 shrink-0 place-items-center rounded-full text-[#71858c] hover:bg-[#f1f5f5] ${focus}`}><X size={18} aria-hidden="true" /></button></div>
    <div className="mt-5 flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-bold"><Bell size={16} className="text-[#b6503c]" aria-hidden="true" /> Tus avisos</h3>{notices && <span className="rounded-full bg-[#f2f5f6] px-2.5 py-1 text-xs font-semibold text-[#71858c]">{notices.length}</span>}</div>
    {notices === undefined ? <p className="mt-3 rounded-2xl bg-[#f7f9f9] p-4 text-sm leading-6 text-[#647b82]">Consulta tus avisos en el dashboard. <Link href="/dashboard" onClick={() => onClose(false)} className={`font-semibold text-[#08786f] ${focus}`}>Ir al dashboard <ArrowRight size={13} className="inline" aria-hidden="true" /></Link></p> : notices.length === 0 ? <p className="mt-3 rounded-2xl bg-[#f7f9f9] p-4 text-sm leading-6 text-[#647b82]">No tienes avisos pendientes. Todo está al día.</p> : <>
      <div className="mt-3 space-y-2">{(showAll ? notices : notices.slice(0, 2)).map((notice) => <article key={notice.id} className="flex gap-3 rounded-2xl border border-[#e8edef] bg-[#fafcfc] p-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#e7f6f3] text-[#08786f]"><Bell size={16} aria-hidden="true" /></span><div className="min-w-0"><h4 className="text-sm font-semibold">{notice.title}</h4><p className="mt-1 text-xs leading-5 text-[#647b82]">{notice.message}</p>{notice.href && <Link href={notice.href} onClick={() => onClose(false)} className={`mt-1 inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-[#08786f] ${focus}`}>{notice.actionLabel ?? "Ver"} <ArrowRight size={13} aria-hidden="true" /></Link>}</div></article>)}</div>
      {notices.length > 2 && <button type="button" onClick={() => setShowAll(!showAll)} aria-expanded={showAll} className={`mt-2 flex min-h-10 w-full items-center justify-center gap-1 text-xs font-semibold text-[#526e75] hover:text-[#173b44] ${focus}`}>{showAll ? "Mostrar menos" : `Ver los ${notices.length} avisos`} <ChevronDown size={14} aria-hidden="true" className={showAll ? "rotate-180" : ""} /></button>}
    </>}
    <div className="mt-3 space-y-1 border-t border-[#edf1f2] pt-3"><Link href="/account" onClick={() => onClose(false)} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold hover:bg-[#f1f7f6] ${focus}`}><UserRound size={17} className="text-[#08786f]" aria-hidden="true" /><span className="flex-1">Mi cuenta</span><ArrowRight size={16} aria-hidden="true" /></Link><button type="button" onClick={onSignOut} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold text-[#647b82] hover:bg-[#f7f9f9] ${focus}`}><LogOut size={17} aria-hidden="true" /> Cerrar sesión</button>{signOutError && <p role="alert" className="px-3 text-sm text-[#b6503c]">{signOutError}</p>}</div>
  </>;
}

"use client";

import { Apple, ArrowRight, Check, ChevronDown, Flame, LineChart, Dumbbell, Sparkles, Target, Trophy, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type RefObject } from "react";

import type { GamificationSummary } from "@/components/account-status";
import { HeaderMenuPopover } from "@/components/header-menu-popover";

const categoryMeta = {
  entrenamiento: { label: "Entrenamiento", icon: Dumbbell },
  nutrición: { label: "Nutrición", icon: Apple },
  seguimiento: { label: "Seguimiento", icon: LineChart },
  constancia: { label: "Constancia", icon: Flame },
  objetivos: { label: "Objetivos", icon: Target },
  progreso: { label: "Progreso", icon: LineChart },
} as const;

const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#375dac]";

type GamificationStatusProps = {
  email: string;
  summary: GamificationSummary;
  appearance?: "default" | "dark";
  isOpen: boolean;
  onToggle: () => void;
  onClose: (restoreFocus: boolean) => void;
  buttonRef: RefObject<HTMLButtonElement | null>;
  anchorRef: RefObject<HTMLDivElement | null>;
};

export function GamificationStatus({ email, summary, appearance = "default", isOpen, onToggle, onClose, buttonRef, anchorRef }: GamificationStatusProps) {
  const [newAchievementIds, setNewAchievementIds] = useState<string[]>([]);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const storageKey = `momentum_seen_achievements:${email}`;
  const unlocked = summary.achievements.filter((achievement) => achievement.unlocked);
  const unlockedSignature = unlocked.map((achievement) => achievement.id).join("|");

  useEffect(() => {
    const unlockedIds = summary.achievements.filter((achievement) => achievement.unlocked).map((achievement) => achievement.id);
    const storedIds = window.localStorage.getItem(storageKey);
    if (!storedIds) {
      window.localStorage.setItem(storageKey, JSON.stringify(unlockedIds));
      return;
    }
    try {
      const seenIds = JSON.parse(storedIds) as string[];
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNewAchievementIds(unlockedIds.filter((id) => !seenIds.includes(id)));
    } catch {
      window.localStorage.setItem(storageKey, JSON.stringify(unlockedIds));
    }
  }, [storageKey, unlockedSignature, summary.achievements]);

  function toggle() {
    if (!isOpen) {
      setHighlightId(newAchievementIds[0] ?? null);
      if (newAchievementIds.length > 0) {
        window.localStorage.setItem(storageKey, JSON.stringify(unlocked.map((achievement) => achievement.id)));
        setNewAchievementIds([]);
      }
    }
    onToggle();
  }

  return <>
    <button ref={buttonRef} type="button" onClick={toggle} aria-expanded={isOpen} aria-controls="header-progress-menu" aria-label={`Nivel ${summary.level}. Ver logros`} className={`relative flex min-h-11 items-center gap-2 rounded-full border py-1 pl-1.5 pr-2.5 text-left shadow-sm transition-colors ${appearance === "dark" ? "border-white/20 bg-white/5 text-white hover:bg-white/10" : "border-[#dfe5ec] bg-white text-[#375dac] hover:border-[#9fb5de]"} ${focus}`}>
      <span className="grid size-8 place-items-center rounded-full bg-[#edf2ff] text-xs font-bold text-[#375dac]">{summary.level}</span><span className={`hidden text-xs font-bold sm:block ${appearance === "dark" ? "text-white" : "text-[#375dac]"}`}>Nivel {summary.level}<span className={`mt-0.5 block font-normal ${appearance === "dark" ? "text-[#c5d8da]" : "text-[#71858c]"}`}>{unlocked.length} logros</span></span><ChevronDown size={15} aria-hidden="true" className={isOpen ? "rotate-180" : ""} />
      {newAchievementIds.length > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full border-2 border-white bg-[#b6503c] text-[10px] font-bold text-white" aria-label="Tienes logros nuevos">{Math.min(newAchievementIds.length, 9)}</span>}
    </button>
    {isOpen && <HeaderMenuPopover anchorRef={anchorRef} id="header-progress-menu" titleId="header-progress-title" onClose={onClose}><GamificationPanel summary={summary} highlightId={highlightId} onClose={onClose} /></HeaderMenuPopover>}
  </>;
}

export function GamificationPanel({ summary, highlightId, onClose }: { summary: GamificationSummary; highlightId?: string | null; onClose: (restoreFocus: boolean) => void }) {
  const unlocked = summary.achievements.filter((achievement) => achievement.unlocked);
  const featured = unlocked.find((achievement) => achievement.id === highlightId) ?? unlocked[unlocked.length - 1];
  return <>
    <div className="flex items-start justify-between gap-3"><div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#375dac]">Tu progreso</p><h2 id="header-progress-title" className="mt-1 text-xl font-bold tracking-tight">Cada paso cuenta.</h2><p className="mt-1 text-xs leading-5 text-[#71858c]">Un vistazo a tu recorrido.</p></div><button type="button" onClick={() => onClose(true)} aria-label="Cerrar progreso" className={`grid size-10 shrink-0 place-items-center rounded-full text-[#71858c] hover:bg-[#f1f5f5] ${focus}`}><X size={18} aria-hidden="true" /></button></div>
    <div className="mt-4 rounded-2xl border border-[#dce5f9] bg-[#f2f6ff] p-4"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-semibold text-[#526e8d]">Tu nivel actual</p><p className="mt-1 text-2xl font-bold tracking-tight text-[#233e79]">Nivel {summary.level}</p></div><span className="grid size-11 place-items-center rounded-2xl bg-white text-[#375dac]"><Sparkles size={20} aria-hidden="true" /></span></div><div className="mt-3 flex justify-between gap-2 text-xs text-[#526e8d]"><span>{summary.isMaxLevel ? "Nivel máximo" : `Progreso al nivel ${summary.level + 1}`}</span><span className="font-semibold">{summary.isMaxLevel ? `${summary.xp} XP` : `${summary.xpIntoLevel} / ${summary.xpForNextLevel} XP`}</span></div><div role="progressbar" aria-label={summary.isMaxLevel ? "Nivel máximo alcanzado" : `Progreso al nivel ${summary.level + 1}`} aria-valuenow={summary.progressPercent} aria-valuemin={0} aria-valuemax={100} className="mt-2 h-2 overflow-hidden rounded-full bg-[#dce5f6]"><div className="h-full rounded-full bg-[#5277c6]" style={{ width: `${summary.progressPercent}%` }} /></div></div>
    <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-2xl border border-[#e8e5f1] bg-[#f8f6fc] p-3"><p className="flex items-center gap-1.5 text-xs font-semibold text-[#7550a4]"><Flame size={14} aria-hidden="true" /> Esta semana</p><p className="mt-2 text-lg font-bold">{summary.weeklyGoal.activeDays} <span className="text-sm font-medium text-[#71858c]">/ {summary.weeklyGoal.targetDays} días</span></p><p className="mt-1 text-[11px] leading-4 text-[#71858c]">{summary.weeklyGoal.completed ? "Objetivo cumplido" : "Días activos"}</p></div><div className="rounded-2xl border border-[#e6edf1] bg-[#f7f9fa] p-3"><p className="flex items-center gap-1.5 text-xs font-semibold text-[#526e75]"><Trophy size={14} aria-hidden="true" /> Tus logros</p><p className="mt-2 text-lg font-bold">{unlocked.length} <span className="text-sm font-medium text-[#71858c]">/ {summary.achievements.length}</span></p><p className="mt-1 text-[11px] leading-4 text-[#71858c]">Conseguidos</p></div></div>
    <p className="mt-3 text-xs text-[#647b82]">Racha actual: {summary.currentStreak} días · Mejor racha: {summary.bestStreak} días</p>
    {featured ? <div className="mt-4 flex items-center gap-3 rounded-2xl border border-[#d9eae2] bg-[#f3faf6] p-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#e2f4eb] text-[#34785f]"><Check size={18} aria-hidden="true" /></span><div className="min-w-0 flex-1"><p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#50836c]">{featured.id === highlightId ? "Nuevo logro" : "Un logro conseguido"}</p><p className="mt-1 text-sm font-semibold">{featured.title}</p></div><span className="shrink-0 text-xs font-semibold text-[#50836c]">+{featured.xp} XP</span></div> : <p className="mt-4 rounded-2xl bg-[#f7f9f9] p-4 text-sm text-[#647b82]">Todavía no tienes logros. Cada paso cuenta.</p>}
    <Link href="/achievements" onClick={() => onClose(false)} className={`mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#173b44] px-4 text-sm font-semibold text-white hover:bg-[#24535a] ${focus}`}>Ver todos los logros <ArrowRight size={16} aria-hidden="true" /></Link>
  </>;
}

export function GamificationOverview({ summary }: { summary: GamificationSummary }) {
  return (
    <div className="grid gap-5 md:grid-cols-3">
      {(Object.keys(categoryMeta) as Array<keyof typeof categoryMeta>).map((category) => {
        const CategoryIcon = categoryMeta[category].icon;
        const achievements = summary.achievements.filter((achievement) => achievement.category === category);
        return <section key={category} className="rounded-2xl border border-[#d3dbcf] bg-white/70 p-4"><h2 className="flex items-center gap-2 text-sm font-semibold text-[#59645e]"><CategoryIcon size={16} className="text-[#72873f]" />{categoryMeta[category].label}</h2><div className="mt-3 space-y-2">{achievements.map((achievement) => <div key={achievement.id} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm ${achievement.unlocked ? "border-[#b6c77b] bg-[#e7f5b4] text-[#3d4a24]" : "border-[#d3dbcf] bg-white text-[#a7b09c]"}`}><span className="flex min-w-0 items-center gap-2">{achievement.unlocked ? <Check size={14} className="shrink-0" /> : <Trophy size={14} className="shrink-0" />}<span className="truncate">{achievement.title}</span></span><span className="shrink-0 text-xs">{achievement.xp} XP</span></div>)}</div></section>;
      })}
    </div>
  );
}

"use client";

import { Apple, Check, ChevronDown, Flame, LineChart, Dumbbell, Target, Trophy } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { GamificationSummary } from "@/components/account-status";

const categoryMeta = {
  entrenamiento: { label: "Entrenamiento", icon: Dumbbell },
  nutrición: { label: "Nutrición", icon: Apple },
  seguimiento: { label: "Seguimiento", icon: LineChart },
  constancia: { label: "Constancia", icon: Flame },
  objetivos: { label: "Objetivos", icon: Target },
  progreso: { label: "Progreso", icon: LineChart },
} as const;

type GamificationStatusProps = { email: string; summary: GamificationSummary };

export function GamificationStatus({ email, summary }: GamificationStatusProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newAchievementIds, setNewAchievementIds] = useState<string[]>([]);
  const storageKey = `momentum_seen_achievements:${email}`;
  const unlockedAchievements = summary.achievements.filter((achievement) => achievement.unlocked);
  const nextAchievement = summary.achievements.find((achievement) => !achievement.unlocked) ?? null;
  const recentUnlockedAchievements = unlockedAchievements.slice(-4);
  const unlockedSignature = unlockedAchievements.map((achievement) => achievement.id).join("|");

  useEffect(() => {
    const unlockedIds = summary.achievements.filter((achievement) => achievement.unlocked).map((achievement) => achievement.id);
    const storedIds = window.localStorage.getItem(storageKey);
    if (!storedIds) {
      window.localStorage.setItem(storageKey, JSON.stringify(unlockedIds));
      return;
    }

    try {
      const seenIds = JSON.parse(storedIds) as string[];
      // localStorage is external state; hydrate the notification marker after mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNewAchievementIds(unlockedIds.filter((id) => !seenIds.includes(id)));
    } catch {
      window.localStorage.setItem(storageKey, JSON.stringify(unlockedIds));
    }
  }, [storageKey, unlockedSignature, summary.achievements]);

  function togglePanel() {
    if (isOpen) {
      setIsOpen(false);
      setNewAchievementIds([]);
      return;
    }

    setIsOpen(true);
    if (newAchievementIds.length > 0) {
      window.localStorage.setItem(storageKey, JSON.stringify(unlockedAchievements.map((achievement) => achievement.id)));
    }
  }

  function closePanel() {
    setIsOpen(false);
    setNewAchievementIds([]);
  }

  return (
    <div className="relative">
      <button type="button" onClick={togglePanel} aria-expanded={isOpen} aria-label={`Nivel ${summary.level}. Ver logros`} className="relative flex items-center gap-2 rounded-full border border-[#aeb9a2] bg-white px-3 py-2 text-left transition-colors hover:border-[#18231f]">
        <span className="grid size-7 place-items-center rounded-full bg-[#e7f5b4] text-xs font-bold text-[#60703d]">{summary.level}</span>
        <span className="hidden sm:block"><span className="block text-xs font-semibold text-[#60703d]">Nivel {summary.level}</span><span className="block text-xs text-[#59645e]">{unlockedAchievements.length} logros</span></span>
        <ChevronDown size={14} className={`text-[#60703d] transition-transform ${isOpen ? "rotate-180" : ""}`} />
        {newAchievementIds.length > 0 ? <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#c0492f] text-[9px] font-bold text-white" aria-label="Tienes logros nuevos">{newAchievementIds.length}</span> : null}
      </button>
      {isOpen ? (
        <>
          <button type="button" aria-label="Cerrar panel de logros" onClick={closePanel} className="fixed inset-0 z-10 cursor-default" />
          <section className="absolute right-0 top-14 z-20 w-[min(380px,calc(100vw-2rem))] rounded-2xl border border-[#d3dbcf] bg-[#f8f7f1] p-5 text-left shadow-[0_20px_50px_rgba(24,35,31,0.16)]">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#819078]">Tu progreso</p><h2 className="mt-1 text-2xl font-semibold">Nivel {summary.level}</h2><p className="mt-1 text-sm text-[#68736b]">{summary.isMaxLevel ? `${summary.xp} XP · nivel máximo` : `${summary.xpIntoLevel} / ${summary.xpForNextLevel} XP`}</p></div>
              <div className="flex items-center gap-1.5 rounded-xl border border-[#e3e7dd] bg-white px-3 py-2 text-xs font-semibold text-[#60703d]"><Flame size={15} className="text-[#c0492f]" /> {summary.currentStreak} días</div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#dfe4d8]"><div className="h-full rounded-full bg-[#72873f] transition-all" style={{ width: `${summary.progressPercent}%` }} /></div>
            <div className={`mt-3 rounded-xl border px-3 py-2 text-xs ${summary.weeklyGoal.completed ? "border-[#b6c77b] bg-[#e7f5b4] text-[#3d4a24]" : "border-[#d3dbcf] bg-white text-[#68736b]"}`}><span className="font-semibold">Objetivo semanal:</span> {summary.weeklyGoal.completed ? "completado" : `${summary.weeklyGoal.activeDays} / ${summary.weeklyGoal.targetDays} días activos`}</div>
            <div className="mt-5 flex items-center justify-between"><h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-[#819078]">Logros</h3><span className="text-xs text-[#819078]"><Trophy size={12} className="mr-1 inline" />{unlockedAchievements.length} / {summary.achievements.length}</span></div>
            <div className="mt-3 space-y-1.5">
              {recentUnlockedAchievements.map((achievement) => <div key={achievement.id} className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm ${newAchievementIds.includes(achievement.id) ? "border-[#d39a42] bg-[#fff1c6]" : "border-[#b6c77b] bg-[#e7f5b4]"}`}><span className="flex min-w-0 items-center gap-2"><Check size={14} className="shrink-0 text-[#60703d]" /><span className="truncate font-medium text-[#3d4a24]">{achievement.title}</span></span><span className="shrink-0 text-xs font-semibold text-[#60703d]">+{achievement.xp} XP</span></div>)}
              {unlockedAchievements.length > recentUnlockedAchievements.length ? <p className="px-1 pt-1 text-xs text-[#819078]">+ {unlockedAchievements.length - recentUnlockedAchievements.length} logros conseguidos anteriormente</p> : null}
              {nextAchievement ? <div className="mt-3 rounded-xl border border-[#d3dbcf] bg-white px-3 py-2.5"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#819078]">Siguiente objetivo</p><div className="mt-1 flex items-center justify-between gap-3 text-sm text-[#68736b]"><span className="truncate font-medium">{nextAchievement.title}</span><span className="shrink-0 text-xs">+{nextAchievement.xp} XP</span></div></div> : null}
            </div>
            <Link href="/achievements" className="mt-4 inline-flex w-full items-center justify-center rounded-full bg-[#18231f] px-4 py-2.5 text-sm font-semibold text-white">Ver todos los logros</Link>
          </section>
        </>
      ) : null}
    </div>
  );
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

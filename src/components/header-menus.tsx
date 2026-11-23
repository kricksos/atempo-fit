"use client";

import { useCallback, useRef, useState } from "react";

import { AccountStatus, type GamificationSummary, type PersonalNotice } from "@/components/account-status";
import { GamificationStatus } from "@/components/gamification-status";

export function HeaderMenus({ email, name, gamification, notices, appearance = "default" }: { email: string; name: string; gamification?: GamificationSummary; notices?: PersonalNotice[]; appearance?: "default" | "dark" }) {
  const [open, setOpen] = useState<"progress" | "account" | null>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const progressButton = useRef<HTMLButtonElement>(null);
  const accountButton = useRef<HTMLButtonElement>(null);

  const close = useCallback((restoreFocus: boolean) => {
    if (restoreFocus) (open === "progress" ? progressButton : accountButton).current?.focus();
    setOpen(null);
  }, [open]);

  return <div ref={anchor} className={`flex items-center gap-2 sm:gap-3 ${appearance === "dark" ? "ml-auto" : ""}`}>
    {gamification && <GamificationStatus email={email} summary={gamification} appearance={appearance} isOpen={open === "progress"} onToggle={() => setOpen(open === "progress" ? null : "progress")} onClose={close} buttonRef={progressButton} anchorRef={anchor} />}
    <AccountStatus email={email} name={name} notices={notices} appearance={appearance} isOpen={open === "account"} onToggle={() => setOpen(open === "account" ? null : "account")} onClose={close} buttonRef={accountButton} anchorRef={anchor} />
  </div>;
}

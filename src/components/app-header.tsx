import Link from "next/link";
import { Sparkles } from "lucide-react";

import { AccountStatus, type GamificationSummary, type PersonalNotice } from "@/components/account-status";
import { GamificationStatus } from "@/components/gamification-status";

type AppHeaderProps = { email: string; name: string; gamification?: GamificationSummary; notices?: PersonalNotice[]; [key: string]: unknown };

export function AppHeader({ email, name, gamification, notices }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <Link href="/" className="flex items-center gap-3" aria-label="Volver a la portada de Atempo Fit">
        <span className="grid size-10 place-items-center rounded-xl bg-[#18231f] text-[#d7f36b]"><Sparkles size={18} /></span>
        <span className="font-semibold">Atempo Fit</span>
      </Link>
      <div className="flex items-center gap-3">
        {gamification ? <GamificationStatus email={email} summary={gamification} /> : null}
        <AccountStatus email={email} name={name} notices={notices} />
      </div>
    </header>
  );
}

"use client";

import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";

import type { GamificationSummary } from "@/components/account-status";
import { HeaderMenus } from "@/components/header-menus";
import { createClient } from "@/lib/supabase/client";

type HeaderAccountProps = {
  initialUser: { email: string; name: string } | null;
  gamification?: GamificationSummary;
  appearance?: "default" | "dark";
};

export function HeaderAccount({ initialUser, gamification, appearance = "default" }: HeaderAccountProps) {
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        setUser(null);
        return;
      }
      const name = typeof data.user.user_metadata?.name === "string" ? data.user.user_metadata.name : "Mi cuenta";
      setUser({ email: data.user.email ?? "", name });
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        return;
      }

      const name = typeof session.user.user_metadata?.name === "string" ? session.user.user_metadata.name : "Mi cuenta";
      setUser({ email: session.user.email ?? "", name });
    });

    return () => data.subscription.unsubscribe();
  }, []);

  if (user) return <HeaderMenus email={user.email} name={user.name} gamification={gamification} appearance={appearance} />;

  return <div className={`flex items-center gap-2 sm:gap-3 ${appearance === "dark" ? "ml-auto" : ""}`}><Link href="/login" className={`inline-flex items-center rounded-full border px-3.5 py-2.5 text-sm font-semibold transition-colors sm:px-4 ${appearance === "dark" ? "border-white/25 text-white hover:bg-white/10" : "border-[#aeb9a2] text-[#59645e] hover:border-[#18231f] hover:text-[#18231f]"}`}><span className="sm:hidden">Entrar</span><span className="hidden sm:inline">Iniciar sesión</span></Link><Link href="/onboarding" className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 sm:px-4 ${appearance === "dark" ? "bg-[#a6eee0] text-[#103c3d]" : "bg-[#d7f36b] text-[#18231f]"}`}>Comenzar mi plan <ArrowUpRight size={16} /></Link></div>;
}

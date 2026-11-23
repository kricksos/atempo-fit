import { ArrowLeft, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

type NavigationKind = "back" | "dashboard";

const navigationStyle = "inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d3dfd1] bg-white/80 px-4 text-sm font-semibold text-[#526052] shadow-sm transition-colors hover:border-[#91a75e] hover:bg-white hover:text-[#18231f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#72873f] disabled:opacity-50";

function NavigationIcon({ kind }: { kind: NavigationKind }) {
  const Icon = kind === "dashboard" ? LayoutDashboard : ArrowLeft;
  return <Icon size={16} aria-hidden="true" />;
}

export function NavigationLink({ kind = "back", className, children, ...props }: ComponentProps<typeof Link> & { kind?: NavigationKind }) {
  return <Link {...props} className={cn(navigationStyle, className)}><NavigationIcon kind={kind} />{children}</Link>;
}

export function NavigationAnchor({ kind = "back", className, children, ...props }: ComponentProps<"a"> & { kind?: NavigationKind }) {
  return <a {...props} className={cn(navigationStyle, className)}><NavigationIcon kind={kind} />{children}</a>;
}

export function NavigationButton({ kind = "back", type = "button", className, children, ...props }: ComponentProps<"button"> & { kind?: NavigationKind }) {
  return <button {...props} type={type} className={cn(navigationStyle, className)}><NavigationIcon kind={kind} />{children}</button>;
}

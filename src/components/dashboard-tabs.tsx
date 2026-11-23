"use client";

import { Apple, ChartNoAxesCombined, Dumbbell, LayoutDashboard } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { type ReactNode, useState } from "react";

import { TrainingManagementCard } from "@/components/training-management-card";

type DashboardTabsProps = {
  overview: ReactNode;
  training: ReactNode;
  nutrition: ReactNode;
  progress: ReactNode;
  trainingStep?: ReactNode;
  reviewNotice?: ReactNode;
  trainingManagement?: ReactNode;
};

const tabs = [
  { id: "overview", label: "Resumen", icon: LayoutDashboard, color: "#163e49", light: "#edf4f5" },
  { id: "training", label: "Entrenamiento", icon: Dumbbell, color: "#08786f", light: "#e7f6f3" },
  { id: "nutrition", label: "Nutrición", icon: Apple, color: "#b6503c", light: "#fff1ed" },
  { id: "progress", label: "Progreso", icon: ChartNoAxesCombined, color: "#375dac", light: "#edf2ff" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function DashboardTabs({ overview, training, nutrition, progress, trainingStep, reviewNotice, trainingManagement }: DashboardTabsProps) {
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<TabId>(() => tabs.some((tab) => tab.id === requestedTab) ? requestedTab as TabId : "overview");
  const content = { overview, training, nutrition, progress };

  function selectTab(tabId: TabId) {
    setActiveTab(tabId);
  }

  return (
    <div className="mt-7">
      <nav className="grid grid-cols-2 gap-2 rounded-2xl border border-[#e0e7eb] bg-white p-1.5 shadow-[0_8px_24px_rgba(20,54,57,0.04)] sm:grid-cols-4" aria-label="Secciones del dashboard">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return <button key={tab.id} type="button" aria-label={tab.label} aria-pressed={isActive} onClick={() => selectTab(tab.id)} className="flex min-h-12 items-center justify-center gap-2 rounded-xl border px-2 text-xs font-semibold transition-colors hover:bg-[#f7f9fa] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#08786f] sm:text-sm" style={{ backgroundColor: isActive ? tab.light : undefined, borderColor: isActive ? tab.color : "transparent", color: isActive ? tab.color : "#5b707b" }}><Icon size={17} style={{ color: tab.color }} aria-hidden="true" /><span>{tab.label}</span></button>;
        })}
      </nav>
      {reviewNotice && <div className="mt-5">{reviewNotice}</div>}
      {activeTab === "training" && trainingStep && <div className="mt-5">{trainingStep}</div>}
      {activeTab === "training" && <div className="mt-5">{trainingManagement ?? <TrainingManagementCard />}</div>}
      <div className="mt-7">{content[activeTab]}</div>
    </div>
  );
}

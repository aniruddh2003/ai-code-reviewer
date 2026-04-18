import React from "react";
import { cn } from "@/lib/utils";
import {
  FileText,
  BookOpen,
  FlaskConical,
  History,
  Terminal,
} from "lucide-react";

export type LeftTabType = "description" | "editorial" | "solutions" | "submissions" | "testcases";

interface TabNavigationProps {
  leftTab: LeftTabType;
  setLeftTab: (tab: LeftTabType) => void;
  theme: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  leftTab,
  setLeftTab,
  theme,
}) => {
  const tabs = [
    { id: "description", label: "Description", icon: FileText, color: "text-blue-500" },
    { id: "editorial", label: "Editorial", icon: BookOpen, color: "text-amber-500" },
    { id: "solutions", label: "Solutions", icon: FlaskConical, color: "text-blue-500" },
    { id: "submissions", label: "Submissions", icon: History, color: "text-blue-500" },
    { id: "testcases", label: "Testcases", icon: Terminal, color: "text-emerald-500" },
  ] as const;

  return (
    <div className={cn(
      "flex flex-col items-center gap-4 py-4 border-r shrink-0 w-12 h-full",
      theme === "dark" ? "border-white/5 bg-[#1a1a1b]" : "border-slate-200 bg-slate-50/80"
    )}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setLeftTab(tab.id)}
          title={tab.label}
          className={cn(
            "flex items-center justify-center p-2 rounded-lg transition-all relative group",
            leftTab === tab.id
              ? theme === "dark" ? "text-white bg-white/10" : "text-slate-900 bg-white shadow-sm border border-slate-200/50"
              : theme === "dark" ? "text-white/40 hover:text-white/60 hover:bg-white/5" : "text-slate-400 hover:text-slate-600 hover:bg-white"
          )}
        >
          {leftTab === tab.id && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
          )}
          <tab.icon className={cn("h-5 w-5", leftTab === tab.id ? tab.color : "text-muted-foreground/60 group-hover:text-muted-foreground")} />
          
          {/* Simple Tooltip on Hover */}
          <div className={cn(
            "absolute left-full ml-2 px-2 py-1 rounded bg-slate-900 text-white text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl border border-white/10",
            theme === "dark" ? "" : "bg-slate-800"
          )}>
            {tab.label}
          </div>
        </button>
      ))}
    </div>
  );
};

import React from "react";
import { cn } from "@/lib/utils";
import { Problem } from "@/types/problem";
import {
  BookText,
  Clock,
  Zap,
} from "lucide-react";

interface EditorialPanelProps {
  problem: Problem;
  theme: string;
}

export const EditorialPanel: React.FC<EditorialPanelProps> = ({
  problem,
  theme,
}) => {
  const [activeLang, setActiveLang] = React.useState<"javascript" | "python" | "cpp">("javascript");

  if (!problem.editorial) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center opacity-40">
        <BookText className="h-10 w-10 mb-2" />
        <h3 className="text-sm font-bold uppercase tracking-widest">No Editorial Available</h3>
        <p className="text-xs mt-2 max-w-[200px]">This problem doesn't have an official editorial yet.</p>
      </div>
    );
  }

  const { approach, complexity, solutionCode } = problem.editorial;

  const languages = [
    { id: "javascript", label: "JAVASCRIPT" },
    { id: "python", label: "PYTHON" },
    { id: "cpp", label: "C++" },
  ];

  return (
    <div className="flex flex-col gap-6 px-5 py-6 animation-fade-in">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold tracking-tight mb-1 flex items-center gap-2">
          <BookText className="h-5 w-5 text-primary" />
          Official Editorial
        </h2>
        <p className="text-xs text-muted-foreground">
          Step-by-step approach and complexity analysis for this problem.
        </p>
      </div>

      {/* Approach Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <span className="flex items-center justify-center h-5 w-5 rounded-md bg-primary/10 text-primary text-[10px]">1</span>
          Our Approach
        </h3>
        <div className={cn(
          "text-sm leading-relaxed whitespace-pre-wrap p-4 rounded-xl border border-dashed",
          theme === "dark" 
            ? "text-muted-foreground border-white/10 bg-white/5" 
            : "text-slate-600 border-slate-200 bg-slate-50/50"
        )}>
          {approach}
        </div>
      </div>

      {/* Complexity Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          Complexity Analysis
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <div className={cn(
            "p-3 rounded-lg border",
            theme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
          )}>
            <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1 flex items-center gap-1">
              <Clock className="h-3 w-3" /> Time Complexity
            </div>
            <code className="text-xs font-mono font-bold text-primary">{complexity.time}</code>
          </div>
          <div className={cn(
            "p-3 rounded-lg border",
            theme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
          )}>
            <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1 flex items-center gap-1">
              <Zap className="h-3 w-3" /> Space Complexity
            </div>
            <code className="text-xs font-mono font-bold text-primary">{complexity.space}</code>
          </div>
        </div>
      </div>

      {/* Solution Code Section */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <span className="flex items-center justify-center h-5 w-5 rounded-md bg-emerald-500/10 text-emerald-500 text-[10px]">#</span>
          Suggested Solution
        </h3>
        <div className={cn(
          "rounded-xl border overflow-hidden",
          theme === "dark" ? "border-white/10" : "border-slate-200"
        )}>
          {/* Language Tabs */}
          <div className={cn(
            "px-2 pt-2 border-b flex items-center gap-1",
            theme === "dark" ? "bg-white/5 border-white/10" : "bg-slate-50/50 border-slate-200"
          )}>
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setActiveLang(lang.id as any)}
                className={cn(
                  "px-4 py-2 text-[10px] font-bold rounded-t-lg transition-all duration-200 border-t-2 border-transparent",
                  activeLang === lang.id
                    ? (theme === "dark" 
                        ? "bg-[#1e1e1e] text-primary border-white/10 border-t-primary" 
                        : "bg-white text-primary border-slate-200 border-t-primary shadow-[0_-2px_10px_rgba(0,0,0,0.02)] translate-y-[1px]")
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {lang.label}
              </button>
            ))}
            <div className="flex-1" />
            <span className="text-[10px] font-bold text-muted-foreground opacity-50 uppercase tracking-tighter px-3 mb-2">Optimal Solution</span>
          </div>
          
          <pre className={cn(
            "p-5 text-xs font-mono overflow-x-auto min-h-[150px] transition-all duration-300",
            theme === "dark" ? "bg-[#1e1e1e] text-blue-300" : "bg-[#0f172a] text-blue-200"
          )}>
            <code>{solutionCode[activeLang]}</code>
          </pre>
        </div>
      </div>
    </div>
  );
};

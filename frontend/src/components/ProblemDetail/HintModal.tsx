import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2 } from "lucide-react";

interface HintModalProps {
  showHint: boolean;
  setShowHint: (val: boolean) => void;
  hintLoading: boolean;
  hints: { level: string; text: string }[];
  problemTitle: string;
  language: string;
  theme: string;
}

export const HintModal: React.FC<HintModalProps> = ({
  showHint,
  setShowHint,
  hintLoading,
  hints,
  problemTitle,
  language,
  theme,
}) => {
  if (!showHint) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
      onClick={() => setShowHint(false)}
    >
      <div
        className={cn(
          "w-full max-w-md rounded-2xl border shadow-2xl flex flex-col gap-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200",
          theme === "dark"
            ? "bg-[#1a1a2e]/95 backdrop-blur-xl border-amber-500/20"
            : "bg-white/95 backdrop-blur-xl border-amber-200 shadow-amber-100",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-5 py-4 border-b",
          theme === "dark" ? "border-amber-500/15 bg-amber-500/5" : "border-amber-100 bg-amber-50",
        )}>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-full bg-amber-500/15 flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold">AI Hint</h3>
              <p className={cn("text-[10px]", theme === "dark" ? "text-white/40" : "text-slate-400")}>
                {language} · {problemTitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {hintLoading ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
              <p className="text-xs text-muted-foreground">Consulting the AI mentor...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {hints.map((hint, i) => (
                <div key={i} className="relative pl-6 space-y-1">
                  <div className="absolute left-0 top-1 bottom-0 w-0.5 bg-amber-500/20 rounded-full" />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/60">
                      {hint.level}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed">{hint.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex justify-end">
          <Button
            variant="default"
            size="sm"
            onClick={() => setShowHint(false)}
            className="bg-amber-500 hover:bg-amber-600 text-white border-0"
          >
            Got it, thanks!
          </Button>
        </div>
      </div>
    </div>
  );
};

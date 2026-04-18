import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  XCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Submission } from "@/types/submission";

interface AIReviewOverlayProps {
  showResults: boolean;
  setShowResults: (val: boolean) => void;
  submitting: boolean;
  submission: Submission | null;
  theme: string;
}

export const AIReviewOverlay: React.FC<AIReviewOverlayProps> = ({
  showResults,
  setShowResults,
  submitting,
  submission,
  theme,
}) => {
  if (!showResults) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-[45%] z-30 flex animate-in slide-in-from-right duration-300">
      <div className={cn(
        "flex-1 border-l p-6 flex flex-col gap-5 overflow-hidden",
        theme === "dark"
          ? "border-primary/20 bg-[#1a1a2e]/95 backdrop-blur-xl shadow-[-10px_0_40px_rgba(0,0,0,0.4)]"
          : "border-slate-200 bg-white/95 backdrop-blur-xl shadow-[-8px_0_30px_rgba(0,0,0,0.08)]",
      )}>
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <h3 className="font-bold uppercase tracking-[0.2em] text-xs">AI Code Review</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowResults(false)}
            className="h-8 w-8 rounded-full"
          >
            <XCircle className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>

        {submitting ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
            <div className="relative">
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse" />
            </div>
            <div>
              <p className="font-semibold text-foreground">Analyzing Code...</p>
              <p className="text-sm text-muted-foreground max-w-[200px] mt-2">
                Our AI-Antigravity reviewer is checking your implementation.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-6 pr-1">
            {/* Score Card */}
            <div className={cn(
              "p-4 rounded-xl border flex items-center justify-between",
              theme === "dark" ? "bg-primary/10 border-primary/20" : "bg-primary/5 border-primary/10 shadow-sm",
            )}>
              <div>
                <p className="text-xs text-primary font-bold uppercase tracking-wider">Review Score</p>
                <p className="text-3xl font-black text-primary">{submission?.feedback?.score}%</p>
              </div>
              {submission?.status === "accepted" ? (
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              ) : (
                <AlertCircle className="h-10 w-10 text-rose-500" />
              )}
            </div>

            {/* Summary */}
            <div>
              <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Summary</h4>
              <p className="text-sm leading-relaxed">
                {submission?.feedback?.summary || "Submission processed. No feedback available yet."}
              </p>
            </div>

            {/* Issues */}
            {submission?.feedback?.criticalIssues && submission.feedback.criticalIssues.length > 0 && (
              <div>
                <h4 className="text-[10px] font-bold text-rose-500/80 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <XCircle className="h-3 w-3" /> Critical Issues
                </h4>
                <ul className="space-y-2">
                  {submission.feedback.criticalIssues.map((issue, i) => (
                    <li key={i} className="text-xs bg-rose-500/5 border border-rose-500/10 p-2 rounded-lg list-none flex gap-2">
                      <span className="text-rose-500">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Optimizations */}
            {submission?.feedback?.performanceOptimizations && (
              <div>
                <h4 className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3" /> Optimizations
                </h4>
                <ul className="space-y-2">
                  {submission.feedback.performanceOptimizations.map((opt, i) => (
                    <li key={i} className="text-xs bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-lg list-none flex gap-2">
                      <span className="text-emerald-500">•</span>
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

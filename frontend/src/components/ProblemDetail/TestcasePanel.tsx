import React from "react";
import { cn, formatMemory, formatRuntime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Play,
} from "lucide-react";
import { Submission } from "@/types/submission";
import { Problem } from "@/types/problem";

interface TestcasePanelProps {
  submission: Submission | null;
  problem: Problem;
  hasSubmissionResult: boolean;
  hasRunResults: boolean;
  theme: string;
  setHasRunResults: (val: boolean) => void;
  setHasSubmissionResult: (val: boolean) => void;
}

export const TestcasePanel: React.FC<TestcasePanelProps> = ({
  submission,
  problem,
  hasSubmissionResult,
  hasRunResults,
  theme,
  setHasRunResults,
  setHasSubmissionResult,
}) => {
  const isAccepted = submission?.status === "accepted";
  const results = submission?.testResults || [];

  return (
    <div className="flex flex-col gap-4 p-5">
      {/* Submission Result Banner */}
      {hasSubmissionResult && submission && (
        <div className={cn(
          "rounded-xl border p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300",
          isAccepted
            ? theme === "dark" ? "border-emerald-500/30 bg-emerald-500/10" : "border-emerald-200 bg-emerald-50"
            : theme === "dark" ? "border-rose-500/30 bg-rose-500/10" : "border-rose-200 bg-rose-50",
        )}>
          <div className="flex items-center gap-3">
            {isAccepted ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
            ) : (
              <XCircle className="h-6 w-6 text-rose-500 shrink-0" />
            )}
            <div>
              <p className={cn("text-sm font-bold", isAccepted ? "text-emerald-500" : "text-rose-500")}>
                {isAccepted ? "Accepted" : (submission.status.replace(/_/g, " ").charAt(0).toUpperCase() + submission.status.replace(/_/g, " ").slice(1))}
              </p>
              <p className={cn("text-xs mt-0.5", theme === "dark" ? "text-white/50" : "text-slate-500")}>
                {results.filter(r => r.status === "PASS").length} / {results.length || "?"} test cases passed
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={cn("text-sm font-black", isAccepted ? "text-emerald-500" : "text-rose-500")}>
              {results.filter(r => r.status === "PASS").length}/{results.length || "?"}
            </p>
            <p className={cn("text-[10px] mt-0.5", theme === "dark" ? "text-white/30" : "text-slate-400")}>
              {formatRuntime(submission.runtime)} · {formatMemory(submission.memory)}
            </p>
          </div>
        </div>
      )}

      {/* Run Result Banner */}
      {hasRunResults && !hasSubmissionResult && submission && (
        <div className={cn(
          "rounded-xl border p-3 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200",
          theme === "dark" ? "border-blue-500/20 bg-blue-500/5" : "border-blue-200 bg-blue-50",
        )}>
          <div className="h-7 w-7 rounded-full bg-blue-500/15 flex items-center justify-center">
            <Play className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <span className="text-sm font-bold text-blue-500">
            {results.filter(r => r.status === "PASS").length} / {results.length} Sample Tests Passed
          </span>
        </div>
      )}

      {/* Main Content: Results or Case Definitions */}
      {(hasRunResults || hasSubmissionResult) && results.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Test Results</h4>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[10px] font-bold uppercase"
              onClick={() => {
                setHasRunResults(false);
                setHasSubmissionResult(false);
              }}
            >
              Reset
            </Button>
          </div>
          {results.map((tc, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-xl border p-4 font-mono text-xs space-y-2.5 transition-all",
                tc.status === "PASS"
                  ? theme === "dark" ? "border-emerald-500/10 bg-emerald-500/[0.02]" : "border-emerald-200 bg-emerald-50/30"
                  : theme === "dark" ? "border-rose-500/10 bg-rose-500/[0.02]" : "border-rose-200 bg-rose-50/30",
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                  theme === "dark" ? "bg-white/10 text-white/50" : "bg-slate-200 text-slate-500"
                )}>
                  Case {idx + 1}
                </span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                  tc.status === "PASS" ? "text-emerald-500" : "text-rose-500"
                )}>
                  {tc.status === "PASS" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {tc.status}
                </span>
              </div>
              <div className="grid gap-2">
                <div className="flex items-start gap-2">
                  <span className="w-16 shrink-0 font-bold opacity-40">Input</span>
                  <span className={theme === "dark" ? "text-white/80" : "text-slate-700"}>{tc.input}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-16 shrink-0 font-bold opacity-40">Expected</span>
                  <span className="text-emerald-500">{tc.expected}</span>
                </div>
                {tc.status !== "TLE" && tc.status !== "MLE" && (
                  <div className="flex items-start gap-2">
                    <span className="w-16 shrink-0 font-bold opacity-40">Got</span>
                    <span className={tc.status === "PASS" ? "text-emerald-500" : "text-rose-500"}>{tc.actual}</span>
                  </div>
                )}
              </div>
              {(tc.runtime !== undefined || tc.memory !== undefined) && (
                <div className={cn(
                  "flex gap-4 pt-2 border-t text-[10px]",
                  theme === "dark" ? "border-white/5 text-white/20" : "border-slate-200 text-slate-400"
                )}>
                  {tc.runtime !== undefined && <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {formatRuntime(tc.runtime)}</span>}
                  {tc.memory !== undefined && <span className="flex items-center gap-1"><Zap className="h-2.5 w-2.5" /> {formatMemory(tc.memory)}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Test Cases</h4>
          </div>
          {problem.examples && problem.examples.map((tc, idx) => (
            <div
              key={idx}
              className={cn(
                "rounded-xl border p-4 font-mono text-xs space-y-2.5 transition-all group hover:border-primary/30",
                theme === "dark" ? "border-white/5 bg-white/[0.02]" : "border-slate-200 bg-white shadow-sm"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full transition-colors",
                  theme === "dark" ? "bg-white/5 text-white/30 group-hover:bg-primary/20 group-hover:text-primary" : "bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
                )}>
                  Case {idx + 1}
                </span>
              </div>
              <div className="grid gap-2">
                <div className="flex items-start gap-2">
                  <span className="w-16 shrink-0 font-bold opacity-30">Input</span>
                  <code className={theme === "dark" ? "text-emerald-400/80" : "text-emerald-700/80"}>{tc.input}</code>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-16 shrink-0 font-bold opacity-30">Output</span>
                  <code className={theme === "dark" ? "text-blue-400/80" : "text-blue-700/80"}>{tc.output}</code>
                </div>
              </div>
            </div>
          ))}
          <Button
            variant="ghost"
            size="sm"
            className="w-full border border-dashed text-xs text-muted-foreground hover:border-primary/50 hover:text-primary"
          >
            + Add Test Case
          </Button>
        </div>
      )}
    </div>
  );
};

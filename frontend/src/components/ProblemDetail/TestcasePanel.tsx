import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  Play,
} from "lucide-react";

interface TestcasePanelProps {
  hasSubmissionResult: boolean;
  hasRunResults: boolean;
  theme: string;
  setHasRunResults: (val: boolean) => void;
  setHasSubmissionResult: (val: boolean) => void;
}

export const TestcasePanel: React.FC<TestcasePanelProps> = ({
  hasSubmissionResult,
  hasRunResults,
  theme,
  setHasRunResults,
  setHasSubmissionResult,
}) => {
  return (
    <div className="flex flex-col gap-4 p-5">
      {/* Submission Result Banner */}
      {hasSubmissionResult && (
        <div className={cn(
          "rounded-xl border p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300",
          theme === "dark" ? "border-emerald-500/30 bg-emerald-500/10" : "border-emerald-200 bg-emerald-50",
        )}>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
            <div>
              <p className="text-sm font-bold text-emerald-500">Accepted</p>
              <p className={cn("text-xs mt-0.5", theme === "dark" ? "text-white/50" : "text-slate-500")}>
                76 / 76 test cases passed
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-black text-emerald-500">76/76</p>
            <p className={cn("text-[10px] mt-0.5", theme === "dark" ? "text-white/30" : "text-slate-400")}>
              68 ms · 42.5 MB
            </p>
          </div>
        </div>
      )}

      {/* Run Result Banner */}
      {hasRunResults && !hasSubmissionResult && (
        <div className={cn(
          "rounded-xl border p-3 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200",
          theme === "dark" ? "border-blue-500/20 bg-blue-500/5" : "border-blue-200 bg-blue-50",
        )}>
          <div className="h-7 w-7 rounded-full bg-blue-500/15 flex items-center justify-center">
            <Play className="h-3.5 w-3.5 text-blue-500" />
          </div>
          <span className="text-sm font-bold text-blue-500">3 / 3 Sample Tests Passed</span>
        </div>
      )}

      {/* Main Content: Results or Case Definitions */}
      {hasRunResults || hasSubmissionResult ? (
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
          {[
            { id: 1, input: "nums = [2,7,11,15], target = 9", expected: "[0,1]", got: "[0,1]", pass: true, time: "1 ms", mem: "42.3 MB" },
            { id: 2, input: "nums = [3,2,4], target = 6", expected: "[1,2]", got: "[1,2]", pass: true, time: "0 ms", mem: "41.9 MB" },
            { id: 3, input: "nums = [3,3], target = 6", expected: "[0,1]", got: "[0,1]", pass: true, time: "0 ms", mem: "42.1 MB" },
          ].map((tc) => (
            <div
              key={tc.id}
              className={cn(
                "rounded-xl border p-4 font-mono text-xs space-y-2.5 transition-all",
                tc.pass
                  ? theme === "dark" ? "border-emerald-500/10 bg-emerald-500/[0.02]" : "border-emerald-200 bg-emerald-50/30"
                  : theme === "dark" ? "border-rose-500/10 bg-rose-500/[0.02]" : "border-rose-200 bg-rose-50/30",
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                  theme === "dark" ? "bg-white/10 text-white/50" : "bg-slate-200 text-slate-500"
                )}>
                  Case {tc.id}
                </span>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                  tc.pass ? "text-emerald-500" : "text-rose-500"
                )}>
                  {tc.pass ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {tc.pass ? "Passed" : "Failed"}
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
                <div className="flex items-start gap-2">
                  <span className="w-16 shrink-0 font-bold opacity-40">Got</span>
                  <span className={tc.pass ? "text-emerald-500" : "text-rose-500"}>{tc.got}</span>
                </div>
              </div>
              <div className={cn(
                "flex gap-4 pt-2 border-t text-[10px]",
                theme === "dark" ? "border-white/5 text-white/20" : "border-slate-200 text-slate-400"
              )}>
                <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {tc.time}</span>
                <span className="flex items-center gap-1"><Zap className="h-2.5 w-2.5" /> {tc.mem}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Test Cases</h4>
          </div>
          {[
            { id: 1, input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
            { id: 2, input: "nums = [3,2,4], target = 6", output: "[1,2]" },
            { id: 3, input: "nums = [3,3], target = 6", output: "[0,1]" },
          ].map((tc) => (
            <div
              key={tc.id}
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
                  Case {tc.id}
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

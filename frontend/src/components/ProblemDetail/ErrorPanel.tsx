import React from "react";
import { cn } from "@/lib/utils";
import { Submission } from "@/types/submission";
import { AlertCircle, Terminal, Info, Clock, Cpu } from "lucide-react";

interface ErrorPanelProps {
  submission: Submission | null;
  theme: string;
}

export const ErrorPanel: React.FC<ErrorPanelProps> = ({
  submission,
  theme,
}) => {
  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-10 text-center opacity-40">
        <Terminal className="h-10 w-10 mb-4" />
        <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Console</h3>
        <p className="text-xs mt-2 max-w-[200px]">No execution data available yet. Run your code to see results.</p>
      </div>
    );
  }

  const isError = ["wrong_answer", "time_limit_exceeded", "memory_limit_exceeded", "runtime_error", "error"].includes(submission.status);
  
  // Find the first failed test case if any
  const failedTestCase = submission.testResults?.find(tc => tc.status !== "PASS");

  return (
    <div className="flex flex-col h-full p-5 space-y-6 overflow-y-auto custom-scrollbar">
      {/* Status Header */}
      <div className={cn(
        "rounded-xl border p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300",
        isError 
          ? theme === "dark" ? "border-rose-500/30 bg-rose-500/10" : "border-rose-200 bg-rose-50"
          : theme === "dark" ? "border-emerald-500/30 bg-emerald-500/10" : "border-emerald-200 bg-emerald-50"
      )}>
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
          isError ? "bg-rose-500/20 text-rose-500" : "bg-emerald-500/20 text-emerald-500"
        )}>
          {isError ? <AlertCircle className="h-6 w-6" /> : <Info className="h-6 w-6" />}
        </div>
        <div>
          <h3 className={cn(
            "text-sm font-bold uppercase tracking-wider",
            isError ? "text-rose-500" : "text-emerald-500"
          )}>
            {submission.status.replace(/_/g, " ")}
          </h3>
          <p className={cn("text-xs mt-0.5", theme === "dark" ? "text-white/50" : "text-slate-500")}>
            {submission.output || "Execution completed."}
          </p>
        </div>
      </div>

      {/* Test Case Context (if failed) */}
      {failedTestCase && (
        <div className="space-y-3">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Context</h4>
          <div className={cn(
            "rounded-xl border p-4 font-mono text-xs space-y-3",
            theme === "dark" ? "bg-white/[0.02] border-white/5" : "bg-slate-50 border-slate-200"
          )}>
            <div className="flex items-start gap-4">
              <span className="w-16 shrink-0 font-bold opacity-40">Input</span>
              <code className={theme === "dark" ? "text-blue-300/80" : "text-blue-700/80 font-bold"}>
                {failedTestCase.input}
              </code>
            </div>
            {failedTestCase.expected && (
              <div className="flex items-start gap-4">
                <span className="w-16 shrink-0 font-bold opacity-40">Expected</span>
                <code className="text-emerald-500/80 font-bold">
                  {failedTestCase.expected}
                </code>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Raw Output / Console */}
      <div className="flex-1 flex flex-col space-y-3 min-h-[200px]">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Console Artifacts</h4>
        <div className={cn(
          "flex-1 rounded-xl border p-5 font-mono text-xs leading-relaxed overflow-auto relative group",
          theme === "dark" ? "bg-[#020617] border-white/5" : "bg-slate-900 border-slate-800"
        )}>
          {/* Subtle Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <pre className="relative z-10 text-rose-400 whitespace-pre-wrap break-all">
            {failedTestCase?.actual || submission.output || "No console output recorded."}
          </pre>

          {/* Prompt Symbol */}
          <div className="mt-4 flex items-center gap-2 opacity-30 group-hover:opacity-50 transition-opacity">
            <span className="text-emerald-500 font-bold">$</span>
            <span className="animate-pulse w-1.5 h-3 bg-white/50" />
          </div>
        </div>
      </div>

      {/* Metrics (if available) */}
      {(submission.runtime || submission.memory) && (
        <div className={cn(
          "flex gap-6 py-3 px-5 rounded-xl border border-dashed",
          theme === "dark" ? "border-white/10 bg-white/[0.02]" : "border-slate-200 bg-slate-50/50"
        )}>
           <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Time</span>
            <span className="text-xs font-mono font-bold">{submission.runtime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-bold opacity-40 uppercase tracking-wider">Memory</span>
            <span className="text-xs font-mono font-bold">{submission.memory}</span>
          </div>
        </div>
      )}
    </div>
  );
};

import React from "react";
import { cn } from "@/lib/utils";
import { Submission } from "@/types/submission";
import { X, Clock, Cpu, Copy, Check, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SubmissionModalProps {
  submission: Submission | null;
  isOpen: boolean;
  onClose: () => void;
  theme: string;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({
  submission,
  isOpen,
  onClose,
  theme,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !submission) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(submission.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isAccepted = submission.status === "accepted";
  const dateObj = submission.createdAt?.toDate ? submission.createdAt.toDate() : new Date();
  const dateStr = new Intl.DateTimeFormat('en-US', { 
    month: 'short', 
    day: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(dateObj).replace(',', ' ·');

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className={cn(
          "w-full max-w-4xl max-h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200",
          theme === "dark" 
            ? "bg-[#0f172a] border-white/10" 
            : "bg-white border-slate-200"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={cn(
          "flex items-center justify-between px-6 py-4 border-b",
          theme === "dark" ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center shadow-lg",
              isAccepted 
                ? "bg-green-500/20 text-green-500 shadow-green-500/10" 
                : "bg-red-500/20 text-red-500 shadow-red-500/10"
            )}>
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className={cn(
                  "text-base font-bold",
                  isAccepted ? "text-green-500" : "text-red-500"
                )}>
                  {submission.status.charAt(0).toUpperCase() + submission.status.slice(1).replace("_", " ")}
                </h3>
                <span className={cn(
                  "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                  theme === "dark" ? "bg-white/10 text-white/60" : "bg-slate-200 text-slate-500"
                )}>
                  {submission.language}
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground opacity-70 mt-0.5">
                Submitted on {dateStr}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className={cn(
          "px-6 py-3 border-b flex items-center gap-8",
          theme === "dark" ? "bg-white/[0.02] border-white/5" : "bg-white border-slate-100"
        )}>
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50 flex items-center gap-1.5">
              <Clock className="h-3 w-3" /> Runtime
            </span>
            <span className="text-sm font-mono font-bold text-foreground">
              {submission.runtime || "N/A"}
            </span>
          </div>
          <div className="w-px h-8 bg-muted opacity-50" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50 flex items-center gap-1.5">
              <Cpu className="h-3 w-3" /> Memory
            </span>
            <span className="text-sm font-mono font-bold text-foreground">
              {submission.memory || "N/A"}
            </span>
          </div>
        </div>

        {/* Code Content */}
        <div className={cn(
          "flex-1 overflow-auto p-6 custom-scrollbar",
          theme === "dark" ? "bg-[#020617]" : "bg-slate-50"
        )}>
          <pre className="text-xs font-mono leading-relaxed">
            <code className={theme === "dark" ? "text-blue-200" : "text-slate-800"}>
              {submission.code}
            </code>
          </pre>
        </div>

        {/* Footer */}
        <div className={cn(
          "px-6 py-4 border-t flex items-center justify-between",
          theme === "dark" ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
        )}>
          <p className="text-[10px] text-muted-foreground italic">
            This code was successfully judged and analyzed by AI-Antigravity.
          </p>
          <Button
            variant="default"
            size="sm"
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-700 text-white border-0 px-6 font-bold"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

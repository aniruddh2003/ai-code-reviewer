import React from "react";
import { cn } from "@/lib/utils";
import { Submission } from "@/types/submission";
import { Clock, Cpu, ChevronRight } from "lucide-react";

interface SubmissionsPanelProps {
  submissions: Submission[];
  onSelectSubmission: (submission: Submission) => void;
  theme: string;
}

export const SubmissionsPanel: React.FC<SubmissionsPanelProps> = ({
  submissions,
  onSelectSubmission,
  theme,
}) => {
  if (submissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground opacity-50 p-10 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <Clock className="h-8 w-8" />
        </div>
        <h3 className="text-sm font-bold text-foreground mb-1">No submissions yet</h3>
        <p className="text-[10px]">Your past attempts for this problem will appear here.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Table Header */}
      <div className={cn(
        "grid grid-cols-[60px_1fr_100px_120px_120px] items-center px-4 py-3 border-b text-[10px] font-bold uppercase tracking-wider text-muted-foreground",
        theme === "dark" ? "bg-white/5 border-white/5" : "bg-slate-50 border-slate-200"
      )}>
        <div className="px-2">#</div>
        <div>Status</div>
        <div className="text-center">Language</div>
        <div className="flex items-center gap-1.5 px-4"><Clock className="h-3 w-3" /> Runtime</div>
        <div className="flex items-center gap-1.5 px-4"><Cpu className="h-3 w-3" /> Memory</div>
      </div>

      {/* Table Body */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {submissions.map((sub, index) => {
          const isAccepted = sub.status === "accepted";
          const dateObj = sub.createdAt?.toDate ? sub.createdAt.toDate() : new Date();
          const dateStr = new Intl.DateTimeFormat('en-US', { 
            month: 'short', 
            day: '2-digit', 
            year: 'numeric' 
          }).format(dateObj);

          return (
            <div
              key={sub.id}
              onClick={() => onSelectSubmission(sub)}
              className={cn(
                "grid grid-cols-[60px_1fr_100px_120px_120px] items-center px-4 py-4 border-b cursor-pointer transition-all group",
                theme === "dark" 
                  ? "border-white/5 hover:bg-white/5" 
                  : "border-slate-100 hover:bg-slate-50"
              )}
            >
              {/* ID */}
              <div className="px-2 text-[10px] font-mono text-muted-foreground opacity-50">
                {submissions.length - index}
              </div>

              {/* Status */}
              <div className="flex flex-col gap-0.5">
                <span className={cn(
                  "text-xs font-bold",
                  isAccepted ? "text-green-500" : "text-red-500"
                )}>
                  {sub.status.charAt(0).toUpperCase() + sub.status.slice(1).replace("_", " ")}
                </span>
                <span className="text-[10px] text-muted-foreground opacity-60">
                  {dateStr}
                </span>
              </div>

              {/* Language */}
              <div className="flex justify-center">
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap",
                  theme === "dark" ? "bg-white/10 text-white/80" : "bg-slate-100 text-slate-600"
                )}>
                  {sub.language}
                </span>
              </div>

              {/* Runtime */}
              <div className="flex items-center gap-2 px-4">
                <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                  {sub.runtime || "--"}
                </span>
              </div>

              {/* Memory */}
              <div className="flex items-center gap-2 px-4">
                <span className="text-xs font-mono text-muted-foreground group-hover:text-foreground transition-colors">
                  {sub.memory || "--"}
                </span>
                <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all ml-auto translate-x-1" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

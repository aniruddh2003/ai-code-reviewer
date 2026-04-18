import React from "react";
import { cn } from "@/lib/utils";
import { Problem } from "@/types/problem";
import {
  ChevronDown,
  Tag,
  Zap,
  Clock,
  BarChart2,
} from "lucide-react";

interface ProblemDescriptionProps {
  problem: Problem;
  theme: string;
  expandedComplexity: boolean;
  setExpandedComplexity: (val: boolean | ((prev: boolean) => boolean)) => void;
  expandedTags: boolean;
  setExpandedTags: (val: boolean | ((prev: boolean) => boolean)) => void;
}

export const ProblemDescription: React.FC<ProblemDescriptionProps> = ({
  problem,
  theme,
  expandedComplexity,
  setExpandedComplexity,
  expandedTags,
  setExpandedTags,
}) => {
  return (
    <div className="flex flex-col gap-5 px-5 py-6">
      {/* Title & Metadata */}
      <div>
        <h2 className="text-lg font-bold tracking-tight mb-2">
          {problem.title}
        </h2>
        <div className={cn(
          "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs border-b pb-3",
          theme === "dark" ? "border-white/10" : "border-slate-200",
        )}>
          <span className={cn(
            "font-bold",
            problem.difficulty === "Easy" && "text-emerald-500",
            problem.difficulty === "Medium" && "text-amber-500",
            problem.difficulty === "Hard" && "text-rose-500",
          )}>
            {problem.difficulty}
          </span>
          {problem.accuracy && (
            <span className="text-muted-foreground">
              Accuracy: <span className="font-semibold text-foreground">{problem.accuracy}</span>
            </span>
          )}
          {problem.submissions && (
            <span className="text-muted-foreground">
              Submissions: <span className="font-semibold text-foreground">{problem.submissions}</span>
            </span>
          )}
          {problem.points && (
            <span className="text-muted-foreground">
              Points: <span className="font-semibold text-foreground">{problem.points}</span>
            </span>
          )}
        </div>
      </div>

      {/* Description Text */}
      <p className={cn(
        "text-sm leading-relaxed whitespace-pre-wrap",
        theme === "dark" ? "text-muted-foreground" : "text-slate-600",
      )}>
        {problem.description}
      </p>

      {/* Examples */}
      {problem.examples && problem.examples.length > 0 && (
        <div className="flex flex-col gap-3">
          <h4 className="text-sm font-bold">Examples:</h4>
          {problem.examples.map((ex, i) => (
            <div
              key={i}
              className={cn(
                "rounded-lg border p-3 text-xs font-mono space-y-1",
                theme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50",
              )}
            >
              <div>
                <span className="font-bold">Input:</span>{" "}
                <span className="text-muted-foreground">{ex.input}</span>
              </div>
              <div>
                <span className="font-bold">Output:</span>{" "}
                <span className="text-muted-foreground">{ex.output}</span>
              </div>
              {ex.explanation && (
                <div className="font-sans">
                  <span className="font-bold">Explanation:</span>{" "}
                  <span className="text-muted-foreground">{ex.explanation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Complexity Accordion */}
      {problem.expectedComplexity && (
        <div className={cn(
          "rounded-lg border",
          theme === "dark" ? "border-white/10" : "border-slate-200",
        )}>
          <button
            type="button"
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors rounded-lg",
              theme === "dark" ? "hover:bg-white/5" : "hover:bg-slate-50",
            )}
            onClick={() => setExpandedComplexity((prev) => !prev)}
          >
            <span className="flex items-center gap-2">
              <Zap className="h-3.5 w-3.5 text-amber-500" /> Expected Complexities
            </span>
            <ChevronDown
              className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", expandedComplexity && "rotate-180")}
            />
          </button>
          {expandedComplexity && (
            <div className={cn(
              "px-4 pb-3 text-xs space-y-1 border-t",
              theme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50",
            )}>
              <div className="pt-2 flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" /> Time:{" "}
                <code className="font-mono font-bold">{problem.expectedComplexity.time}</code>
              </div>
              <div className="flex items-center gap-2">
                <BarChart2 className="h-3 w-3 text-muted-foreground" /> Space:{" "}
                <code className="font-mono font-bold">{problem.expectedComplexity.space}</code>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Topic Tags Accordion */}
      {problem.tags && problem.tags.length > 0 && (
        <div className={cn(
          "rounded-lg border",
          theme === "dark" ? "border-white/10" : "border-slate-200",
        )}>
          <button
            type="button"
            className={cn(
              "w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors rounded-lg",
              theme === "dark" ? "hover:bg-white/5" : "hover:bg-slate-50",
            )}
            onClick={() => setExpandedTags((prev) => !prev)}
          >
            <span className="flex items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-blue-500" /> Topic Tags
            </span>
            <ChevronDown
              className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", expandedTags && "rotate-180")}
            />
          </button>
          {expandedTags && (
            <div className={cn(
              "px-4 pb-3 pt-2 flex flex-wrap gap-2 border-t",
              theme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50",
            )}>
              {problem.tags.map((tag) => (
                <span
                  key={tag}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-xs font-semibold",
                    theme === "dark" ? "bg-primary/10 text-primary" : "bg-blue-50 text-blue-700 border border-blue-200",
                  )}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

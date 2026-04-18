import React from "react";
import Editor from "@monaco-editor/react";
import { cn } from "@/lib/utils";
import { Code2, Settings } from "lucide-react";

interface EditorPanelProps {
  code: string;
  setCode: (val: string) => void;
  language: string;
  theme: string;
  submitting: boolean;
}

export const EditorPanel: React.FC<EditorPanelProps> = ({
  code,
  setCode,
  language,
  theme,
  submitting,
}) => {
  return (
    <div className={cn(
      "flex flex-col flex-1 rounded-xl border overflow-hidden relative",
      theme === "dark" ? "border-white/5 bg-[#1e1e1e] shadow-2xl" : "border-slate-200 bg-white shadow-sm",
    )}>
      {/* Editor Header */}
      <div className={cn(
        "flex items-center justify-between px-4 py-2 border-b",
        theme === "dark" ? "bg-[#252526] border-white/5" : "bg-slate-100 border-slate-200",
      )}>
        <div className="flex items-center gap-2">
          <Code2 className={cn("h-4 w-4", theme === "dark" ? "text-blue-400" : "text-blue-600")} />
          <span className={cn(
            "text-[11px] font-bold uppercase tracking-widest",
            theme === "dark" ? "text-white/60" : "text-slate-500",
          )}>
            solution.{language === "javascript" ? "js" : language === "python" ? "py" : "cpp"}
          </span>
        </div>
        <Settings className={cn(
          "h-4 w-4 cursor-pointer transition-colors",
          theme === "dark" ? "text-white/30 hover:text-white/60" : "text-slate-400 hover:text-slate-600",
        )} />
      </div>

      {/* Monaco Editor Wrapper */}
      <div className="flex-1 min-h-0 relative">
        <Editor
          height="100%"
          language={language === "cpp" ? "cpp" : language}
          theme={theme === "dark" ? "vs-dark" : "vs-light"}
          value={code}
          onChange={(val) => setCode(val || "")}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            padding: { top: 20 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            readOnly: submitting,
            fontFamily: "'Fira Code', 'Fira Mono', monospace",
            fontLigatures: true,
          }}
        />
      </div>
    </div>
  );
};

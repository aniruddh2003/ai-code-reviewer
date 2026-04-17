import React from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Lightbulb,
  Play,
  Send,
  Loader2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkspaceHeaderProps {
  title: string;
  language: string;
  onLanguageChange: (lang: string) => void;
  onBack: () => void;
  onRun: () => void;
  onSubmit: () => void;
  onGetHint: () => void;
  submitting: boolean;
}

export const WorkspaceHeader: React.FC<WorkspaceHeaderProps> = ({
  title,
  language,
  onLanguageChange,
  onBack,
  onRun,
  onSubmit,
  onGetHint,
  submitting,
}) => {
  return (
    <div className="flex items-center justify-between px-4 pb-3 border-b border-border/40 shrink-0">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="-ml-2 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back
        </Button>
        <div className="h-4 w-px bg-border/40" />
        <h2 className="text-lg font-bold tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Select value={language} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-[130px] h-9 bg-muted/30 border-border/40">
            <SelectValue placeholder="Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="cpp">C++</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 border-amber-500/40 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
          onClick={onGetHint}
        >
          <Lightbulb className="h-4 w-4" />
          Hint
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2"
          onClick={onRun}
        >
          <Play className="h-4 w-4 fill-current" />
          Run
        </Button>
        <Button
          variant="default"
          size="sm"
          className="h-9 gap-2"
          onClick={onSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Submit
        </Button>
      </div>
    </div>
  );
};

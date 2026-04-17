import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/firebase/config"
import { Problem } from "@/types/problem"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Play, Send, Settings, BookOpen, Code2 } from "lucide-react"
import Editor from "@monaco-editor/react"
import { useThemeStore } from "@/stores/themeStore"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

export const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { theme } = useThemeStore()
  
  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")

  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) return
      const docRef = doc(db, "problems", id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Problem
        setProblem(data)
        setCode(data.starterCode[language as keyof typeof data.starterCode] || "")
      }
      setLoading(false)
    }

    fetchProblem()
  }, [id])

  // Handle language change
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang)
    if (problem) {
      setCode(problem.starterCode[newLang as keyof typeof problem.starterCode] || "")
    }
  }

  if (loading) return <div className="text-center p-12 text-muted-foreground animate-pulse">Loading problem...</div>
  if (!problem) return <div className="text-center p-12 text-destructive">Problem not found.</div>

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] overflow-hidden">
      {/* Action Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate("/")}
            className="-ml-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <div className="h-4 w-px bg-border/40" />
          <h2 className="text-lg font-bold tracking-tight">{problem.title}</h2>
        </div>

        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-[130px] h-9 bg-muted/30 border-border/40">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="javascript">JavaScript</SelectItem>
              <SelectItem value="python">Python</SelectItem>
              <SelectItem value="cpp">C++</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" className="h-9 gap-2">
            <Play className="h-4 w-4 fill-current" />
            Run
          </Button>
          <Button variant="default" size="sm" className="h-9 gap-2">
            <Send className="h-4 w-4" />
            Submit
          </Button>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left: Description */}
        <div className="w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
          <div className="rounded-xl border border-border/40 bg-card/30 p-6 backdrop-blur-sm min-h-full">
            <div className="flex items-center gap-2 mb-4 text-primary">
              <BookOpen className="h-5 w-5" />
              <h3 className="font-bold uppercase tracking-wider text-xs">Description</h3>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {problem.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Editor */}
        <div className="flex-1 flex flex-col rounded-xl border border-border/40 bg-[#1e1e1e] overflow-hidden shadow-2xl relative">
          <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-white/5">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-blue-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-white/60">Solution.tsx</span>
            </div>
            <Settings className="h-4 w-4 text-white/30 hover:text-white/60 cursor-pointer transition-colors" />
          </div>
          
          <Editor
            height="100%"
            language={language === "cpp" ? "cpp" : language}
            theme={theme === "dark" ? "vs-dark" : "light"}
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              padding: { top: 20 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              fontFamily: "'Fira Code', 'Fira Mono', monospace",
              fontLigatures: true,
              cursorBlinking: "smooth",
              smoothScrolling: true,
              lineNumbersMinChars: 3,
            }}
          />
        </div>
      </div>
    </div>
  )
}

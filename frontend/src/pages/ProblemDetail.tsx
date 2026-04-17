import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, collection, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore"
import { db, auth, isDemoMode } from "@/firebase/config"
import { Problem } from "@/types/problem"
import { Submission } from "@/types/submission"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Play, Send, Settings, BookOpen, Code2, Loader2, CheckCircle2, XCircle, AlertCircle, Sparkles } from "lucide-react"
import Editor from "@monaco-editor/react"
import { useThemeStore } from "@/stores/themeStore"
import { useAuthStore } from "@/stores/authStore"
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
  const { user } = useAuthStore()

  const [problem, setProblem] = useState<Problem | null>(null)
  const [loading, setLoading] = useState(true)
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("javascript")
  const [submitting, setSubmitting] = useState(false)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) return

      if (isDemoMode) {
        // Mock Problem Data Store
        const mockProblems: Record<string, Problem> = {
          "two-sum": {
            id: "two-sum",
            title: "Two Sum",
            description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
            difficulty: "Easy",
            category: "Arrays",
            order: 1,
            starterCode: {
              javascript: "function twoSum(nums, target) {\n  // Write your code here\n};",
              python: "def twoSum(nums, target):\n    # Write your code here\n    pass",
              cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};"
            }
          },
          "reverse-int": {
            id: "reverse-int",
            title: "Reverse Integer",
            description: "Given a signed 32-bit integer `x`, return `x` with its digits reversed. If reversing `x` causes the value to go outside the signed 32-bit integer range [-2^31, 2^31 - 1], then return 0.",
            difficulty: "Medium",
            category: "Math",
            order: 2,
            starterCode: {
              javascript: "/**\n * @param {number} x\n * @return {number}\n */\nvar reverse = function(x) {\n    \n};",
              python: "class Solution:\n    def reverse(self, x: int) -> int:\n        pass",
              cpp: "class Solution {\npublic:\n    int reverse(int x) {\n        \n    }\n};"
            }
          }
        }

        const found = mockProblems[id as string] || mockProblems["two-sum"]
        setProblem(found)
        setLoading(false)
        return
      }

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

  // Sync code with problem starter code on load or language change
  useEffect(() => {
    if (problem && !code) {
      setCode(problem.starterCode[language as keyof typeof problem.starterCode] || "")
    }
  }, [problem, language, code])

  // Handle submission
  const handleSubmit = async () => {
    if (!problem || !id) return

    // Check for user in store instead of auth.currentUser
    if (!user && !isDemoMode) {
      alert("Please login to submit your solution!")
      return
    }

    setSubmitting(true)
    setShowResults(true)

    if (isDemoMode) {
      // Simulation for Demo Mode
      setTimeout(() => {
        setSubmission({
          id: "mock-sub-" + Date.now(),
          userId: "demo-user",
          problemId: id,
          code,
          language,
          status: "accepted",
          createdAt: new Date(),
          feedback: {
            score: 92,
            summary: "Excellent implementation! Your solution uses a Hash Map to achieve O(n) time complexity, which is the most optimal approach for this problem.",
            criticalIssues: [],
            performanceOptimizations: [
              "Consider adding input validation for empty arrays as a best practice.",
              "Documentation: Adding JSDoc comments would improve code maintainability."
            ],
            reviewedBy: "AI-Antigravity"
          }
        } as Submission)
        setSubmitting(false)
      }, 3000)
      return
    }

    try {
      const subRef = await addDoc(collection(db, "submissions"), {
        userId: user.uid,
        problemId: id,
        code,
        language,
        status: "pending",
        createdAt: serverTimestamp(),
      })

      // Listen for updates to this submission (T013)
      const unsubscribe = onSnapshot(doc(db, "submissions", subRef.id), (snapshot) => {
        const data = { id: snapshot.id, ...snapshot.data() } as Submission
        if (data.status !== "pending") {
          setSubmission(data)
          setSubmitting(false)
        }
      })

      return () => unsubscribe()
    } catch (error) {
      console.error("Submission failed:", error)
      setSubmitting(false)
    }
  }

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
          <Button
            variant="default"
            size="sm"
            className="h-9 gap-2"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Submit
          </Button>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="flex-1 flex gap-4 overflow-hidden relative">
        {/* Left: Description */}
        <div className={cn(
          "flex flex-col gap-4 overflow-y-auto pr-1 custom-scrollbar transition-all duration-500 ease-in-out",
          showResults ? "w-1/5 opacity-60" : "w-1/3"
        )}>
          <div className={cn(
            "rounded-xl border p-6 backdrop-blur-sm min-h-full transition-colors",
            theme === "dark" ? "border-border/40 bg-card/30" : "border-slate-200 bg-slate-50/50 shadow-sm"
          )}>
            <div className={cn("flex items-center gap-2 mb-4", theme === "dark" ? "text-primary" : "text-slate-900")}>
              <BookOpen className="h-5 w-5" />
              <h3 className="font-bold uppercase tracking-wider text-xs">Description</h3>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <p className={cn(
                "whitespace-pre-wrap text-sm leading-relaxed",
                theme === "dark" ? "text-muted-foreground" : "text-slate-600 font-medium"
              )}>
                {problem.description}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Editor */}
        <div className={cn(
          "flex flex-col rounded-xl border overflow-hidden relative transition-all duration-500 ease-in-out",
          theme === "dark" 
            ? "border-white/5 bg-[#1e1e1e] shadow-2xl" 
            : "border-slate-200 bg-white shadow-sm",
          showResults ? "flex-[2]" : "flex-1"
        )}>
          <div className={cn(
            "flex items-center justify-between px-4 py-2 border-b",
            theme === "dark" ? "bg-[#252526] border-white/5" : "bg-slate-100 border-slate-200"
          )}>
            <div className="flex items-center gap-2">
              <Code2 className={cn("h-4 w-4", theme === "dark" ? "text-blue-400" : "text-blue-600")} />
              <span className={cn(
                "text-[11px] font-bold uppercase tracking-widest",
                theme === "dark" ? "text-white/60" : "text-slate-500"
              )}>
                solution.{language === "javascript" ? "js" : language === "python" ? "py" : "cpp"}
              </span>
            </div>
            <Settings className={cn("h-4 w-4 cursor-pointer transition-colors", 
              theme === "dark" ? "text-white/30 hover:text-white/60" : "text-slate-400 hover:text-slate-600")} />
          </div>

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

        {/* Right: Integrated Review Sidebar (T014) */}
        {showResults && (
          <div className="w-[30%] h-full animate-in slide-in-from-right duration-500 transition-all">
            <div className={cn(
              "h-full rounded-xl border p-6 flex flex-col gap-6 transition-colors",
              theme === "dark" 
                ? "border-primary/20 bg-card/50 backdrop-blur-xl shadow-[-10px_0_30px_rgba(0,0,0,0.2)]" 
                : "border-slate-200 bg-white shadow-sm"
            )}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  <h3 className="font-bold uppercase tracking-wider text-xs tracking-[0.2em]">AI Code Review</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowResults(false)}
                  className="h-8 w-8 rounded-full hover:bg-white/5"
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
                      Our AI-Antigravity reviewer is checking your implementation for logic and performance.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                  {/* Score Card */}
                  <div className={cn(
                    "p-4 rounded-xl border flex items-center justify-between",
                    theme === "dark" ? "bg-primary/10 border-primary/20" : "bg-primary/5 border-primary/10 shadow-sm"
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
                  {submission?.feedback?.criticalIssues && (
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
        )}
      </div>
    </div>
  )
}

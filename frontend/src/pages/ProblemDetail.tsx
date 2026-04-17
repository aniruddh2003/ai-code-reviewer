import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, collection, addDoc, serverTimestamp, onSnapshot } from "firebase/firestore"
import { db, auth, isDemoMode } from "@/firebase/config"
import { Problem } from "@/types/problem"
import { Submission } from "@/types/submission"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Play, Send, Settings, BookOpen, Code2, Loader2, CheckCircle2, XCircle, AlertCircle, Sparkles, ChevronDown, Tag, Zap, Clock, BarChart2 } from "lucide-react"
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
  const [expandedComplexity, setExpandedComplexity] = useState(false)
  const [expandedTags, setExpandedTags] = useState(false)
  const [showConsole, setShowConsole] = useState(false)
  const [showDescription, setShowDescription] = useState(true)

  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) return

      if (isDemoMode) {
        // Mock Problem Data Store
        const mockProblems: Record<string, Problem> = {
          "two-sum": {
            id: "two-sum",
            title: "Two Sum",
            description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
            difficulty: "Easy",
            category: "Arrays",
            order: 1,
            accuracy: "45.2%",
            submissions: "12M+",
            points: 2,
            examples: [
              { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "Because nums[0] + nums[1] == 9, we return [0, 1]." },
              { input: "nums = [3,2,4], target = 6", output: "[1,2]", explanation: "Because nums[1] + nums[2] == 6, we return [1, 2]." },
              { input: "nums = [3,3], target = 6", output: "[0,1]" }
            ],
            expectedComplexity: { time: "O(n)", space: "O(n)" },
            tags: ["Array", "Hash Table"],
            starterCode: {
              javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};",
              python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass",
              cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};"
            }
          },
          "reverse-int": {
            id: "reverse-int",
            title: "Reverse Integer",
            description: "Given a signed 32-bit integer x, return x with its digits reversed.\n\nIf reversing x causes the value to go outside the signed 32-bit integer range [-2³¹, 2³¹ - 1], then return 0.\n\nAssume the environment does not allow you to store 64-bit integers (signed or unsigned).",
            difficulty: "Medium",
            category: "Math",
            order: 2,
            accuracy: "26.8%",
            submissions: "8M+",
            points: 4,
            examples: [
              { input: "x = 123", output: "321" },
              { input: "x = -123", output: "-321" },
              { input: "x = 120", output: "21", explanation: "Trailing zero is dropped after reversing." }
            ],
            expectedComplexity: { time: "O(log x)", space: "O(1)" },
            tags: ["Math"],
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
    setShowConsole(true)

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
        userId: user?.uid,
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

          <Button variant="outline" size="sm" className="h-9 gap-2" onClick={() => setShowConsole(true)}>
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
        {/* Left: Description — collapsible */}
        <div
          className="flex shrink-0 transition-all duration-300 ease-in-out relative"
          style={{ width: showDescription ? "33.333%" : "2rem" }}
        >
          {/* Toggle Strip */}
          <button
            type="button"
            onClick={() => setShowDescription(prev => !prev)}
            title={showDescription ? "Collapse description" : "Expand description"}
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center h-12 w-6 rounded-l-md border border-r-0 transition-colors",
              theme === "dark"
                ? "bg-[#252526] border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                : "bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-200"
            )}
          >
            <ChevronDown
              className="h-4 w-4 transition-transform duration-300"
              style={{ transform: showDescription ? "rotate(90deg)" : "rotate(-90deg)" }}
            />
          </button>

          {/* Content */}
          <div
            className="flex flex-col gap-4 overflow-y-auto overflow-x-hidden w-full pr-7"
            style={{ opacity: showDescription ? 1 : 0, pointerEvents: showDescription ? "auto" : "none", transition: "opacity 0.2s" }}
          >
          <div className={cn(
            "rounded-xl border p-5 backdrop-blur-sm min-h-full transition-colors flex flex-col gap-5",
            theme === "dark" ? "border-border/40 bg-card/30" : "border-slate-200 bg-white shadow-sm"
          )}>
            {/* Title */}
            <div>
              <h2 className="text-lg font-bold tracking-tight mb-2">{problem.title}</h2>
              {/* Metadata Bar */}
              <div className={cn(
                "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs border-b pb-3",
                theme === "dark" ? "border-white/10" : "border-slate-200"
              )}>
                <span className={cn(
                  "font-bold",
                  problem.difficulty === "Easy" && "text-emerald-500",
                  problem.difficulty === "Medium" && "text-amber-500",
                  problem.difficulty === "Hard" && "text-rose-500"
                )}>{problem.difficulty}</span>
                {problem.accuracy && (
                  <span className="text-muted-foreground">Accuracy: <span className="font-semibold text-foreground">{problem.accuracy}</span></span>
                )}
                {problem.submissions && (
                  <span className="text-muted-foreground">Submissions: <span className="font-semibold text-foreground">{problem.submissions}</span></span>
                )}
                {problem.points && (
                  <span className="text-muted-foreground">Points: <span className="font-semibold text-foreground">{problem.points}</span></span>
                )}
              </div>
            </div>

            {/* Description Text */}
            <p className={cn(
              "text-sm leading-relaxed whitespace-pre-wrap",
              theme === "dark" ? "text-muted-foreground" : "text-slate-600"
            )}>
              {problem.description}
            </p>

            {/* Examples */}
            {problem.examples && problem.examples.length > 0 && (
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-bold">Examples:</h4>
                {problem.examples.map((ex, i) => (
                  <div key={i} className={cn(
                    "rounded-lg border p-3 text-xs font-mono space-y-1",
                    theme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                  )}>
                    <div><span className="font-bold">Input:</span> <span className="text-muted-foreground">{ex.input}</span></div>
                    <div><span className="font-bold">Output:</span> <span className="text-muted-foreground">{ex.output}</span></div>
                    {ex.explanation && (
                      <div className="font-sans"><span className="font-bold font-sans">Explanation:</span> <span className="text-muted-foreground">{ex.explanation}</span></div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Expected Complexity Accordion */}
            {problem.expectedComplexity && (
              <div className={cn("rounded-lg border", theme === "dark" ? "border-white/10" : "border-slate-200")}>
                <button
                  type="button"
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors rounded-lg",
                    theme === "dark" ? "hover:bg-white/5" : "hover:bg-slate-50"
                  )}
                  onClick={() => setExpandedComplexity(prev => !prev)}
                >
                  <span className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-amber-500" /> Expected Complexities</span>
                  <ChevronDown
                    className="h-4 w-4 text-muted-foreground transition-transform duration-200"
                    style={{ transform: expandedComplexity ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                {expandedComplexity && (
                  <div className={cn("px-4 pb-3 text-xs space-y-1 border-t", theme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
                    <div className="pt-2 flex items-center gap-2"><Clock className="h-3 w-3 text-muted-foreground" /> Time: <code className="font-mono font-bold">{problem.expectedComplexity.time}</code></div>
                    <div className="flex items-center gap-2"><BarChart2 className="h-3 w-3 text-muted-foreground" /> Space: <code className="font-mono font-bold">{problem.expectedComplexity.space}</code></div>
                  </div>
                )}
              </div>
            )}

            {/* Topic Tags Accordion */}
            {problem.tags && problem.tags.length > 0 && (
              <div className={cn("rounded-lg border", theme === "dark" ? "border-white/10" : "border-slate-200")}>
                <button
                  type="button"
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors rounded-lg",
                    theme === "dark" ? "hover:bg-white/5" : "hover:bg-slate-50"
                  )}
                  onClick={() => setExpandedTags(prev => !prev)}
                >
                  <span className="flex items-center gap-2"><Tag className="h-3.5 w-3.5 text-blue-500" /> Topic Tags</span>
                  <ChevronDown
                    className="h-4 w-4 text-muted-foreground transition-transform duration-200"
                    style={{ transform: expandedTags ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>
                {expandedTags && (
                  <div className={cn("px-4 pb-3 pt-2 flex flex-wrap gap-2 border-t", theme === "dark" ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50")}>
                    {problem.tags.map((tag) => (
                      <span key={tag} className={cn(
                        "px-2.5 py-1 rounded-full text-xs font-semibold",
                        theme === "dark" ? "bg-primary/10 text-primary" : "bg-blue-50 text-blue-700 border border-blue-200"
                      )}>{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* /card */}
        </div>
        {/* /content wrapper */}
        </div>
        {/* /collapsible outer */}

        {/* Center: Editor (+ overlay AI Review) */}
        <div className={cn(
          "flex flex-col flex-1 rounded-xl border overflow-hidden relative",
          theme === "dark"
            ? "border-white/5 bg-[#1e1e1e] shadow-2xl"
            : "border-slate-200 bg-white shadow-sm"
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

          {/* Console / Test Cases — collapsed by default, opens on Run/Submit */}
          <div
            className={cn(
              "shrink-0 border-t flex flex-col transition-all duration-300 ease-in-out overflow-hidden",
              theme === "dark" ? "border-white/10 bg-[#1e1e1e]" : "border-slate-200 bg-slate-50",
              showConsole ? "h-48" : "h-9"
            )}
          >
            {/* Header — always visible, clicking toggles panel */}
            <div
              className={cn(
                "flex items-center gap-4 px-4 h-9 border-b cursor-pointer select-none shrink-0",
                theme === "dark" ? "border-white/5 bg-[#252526] hover:bg-white/5" : "border-slate-200 bg-slate-100 hover:bg-slate-200"
              )}
              onClick={() => setShowConsole(prev => !prev)}
            >
              <button type="button" className={cn(
                "text-xs font-bold uppercase tracking-wider transition-colors",
                theme === "dark" ? "text-white" : "text-slate-900"
              )}>
                Testcases
              </button>
              <button type="button" className={cn(
                "text-xs font-bold uppercase tracking-wider transition-colors",
                theme === "dark" ? "text-white/40" : "text-slate-400"
              )}>
                Test Result
              </button>
              <div className="flex-1" />
              <ChevronDown
                className="h-4 w-4 text-muted-foreground transition-transform duration-200"
                style={{ transform: showConsole ? "rotate(0deg)" : "rotate(180deg)" }}
              />
            </div>

            {/* Body — only visible when open */}
            {showConsole && (
              <div className="flex-1 p-4 overflow-y-auto">
                <div className={cn(
                  "rounded-md border p-4 font-mono text-sm",
                  theme === "dark" ? "border-white/10 bg-black/20 text-white/60" : "border-slate-200 bg-white text-slate-500"
                )}>
                  <div className="flex items-center gap-2 mb-2 text-primary">
                    <Play className="h-4 w-4" />
                    <span className="font-bold">Ready</span>
                  </div>
                  Click "Run" to execute your code against the sample testcases.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Review Overlay — slides in over the editor, description untouched */}
        {showResults && (
          <div className="absolute inset-y-0 right-0 w-[45%] z-30 flex animate-in slide-in-from-right duration-300">
            <div className={cn(
              "flex-1 border-l p-6 flex flex-col gap-5 overflow-hidden",
              theme === "dark"
                ? "border-primary/20 bg-[#1a1a2e]/95 backdrop-blur-xl shadow-[-10px_0_40px_rgba(0,0,0,0.4)]"
                : "border-slate-200 bg-white/95 backdrop-blur-xl shadow-[-8px_0_30px_rgba(0,0,0,0.08)]"
            )}>
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                  <h3 className="font-bold uppercase tracking-[0.2em] text-xs">AI Code Review</h3>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowResults(false)}
                  className="h-8 w-8 rounded-full"
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
                      Our AI-Antigravity reviewer is checking your implementation.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto space-y-6">
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
                  {submission?.feedback?.criticalIssues && submission.feedback.criticalIssues.length > 0 && (
                    <div>
                      <h4 className="text-[10px] font-bold text-rose-500/80 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <XCircle className="h-3 w-3" /> Critical Issues
                      </h4>
                      <ul className="space-y-2">
                        {submission.feedback.criticalIssues.map((issue, i) => (
                          <li key={i} className="text-xs bg-rose-500/5 border border-rose-500/10 p-2 rounded-lg list-none flex gap-2">
                            <span className="text-rose-500">•</span>{issue}
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
                            <span className="text-emerald-500">•</span>{opt}
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


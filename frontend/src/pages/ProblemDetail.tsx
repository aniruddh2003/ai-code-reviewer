import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db, auth, isDemoMode } from "@/firebase/config";
import { Problem } from "@/types/problem";
import { Submission } from "@/types/submission";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Play,
  Send,
  Settings,
  BookOpen,
  Code2,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  ChevronDown,
  Tag,
  Zap,
  Clock,
  BarChart2,
  Lightbulb,
  History,
  FlaskConical,
  Terminal,
  FileText,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export const ProblemDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = useThemeStore();
  const { user } = useAuthStore();

  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [expandedComplexity, setExpandedComplexity] = useState(false);
  const [expandedTags, setExpandedTags] = useState(false);
  const [hasRunResults, setHasRunResults] = useState(false);
  const [hasSubmissionResult, setHasSubmissionResult] = useState(false);
  const [showDescription, setShowDescription] = useState(true);
  const [leftTab, setLeftTab] = useState<
    "description" | "editorial" | "solutions" | "submissions" | "testcases"
  >("description");
  // Hint feature
  const [showHint, setShowHint] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [hints, setHints] = useState<{ level: string; text: string }[]>([]);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) return;

      if (isDemoMode) {
        // Mock Problem Data Store
        const mockProblems: Record<string, Problem> = {
          "two-sum": {
            id: "two-sum",
            title: "Two Sum",
            description:
              "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.",
            difficulty: "Easy",
            category: "Arrays",
            order: 1,
            accuracy: "45.2%",
            submissions: "12M+",
            points: 2,
            examples: [
              {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0,1]",
                explanation:
                  "Because nums[0] + nums[1] == 9, we return [0, 1].",
              },
              {
                input: "nums = [3,2,4], target = 6",
                output: "[1,2]",
                explanation:
                  "Because nums[1] + nums[2] == 6, we return [1, 2].",
              },
              { input: "nums = [3,3], target = 6", output: "[0,1]" },
            ],
            expectedComplexity: { time: "O(n)", space: "O(n)" },
            tags: ["Array", "Hash Table"],
            starterCode: {
              javascript:
                "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};",
              python:
                "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass",
              cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        \n    }\n};",
            },
          },
          "reverse-int": {
            id: "reverse-int",
            title: "Reverse Integer",
            description:
              "Given a signed 32-bit integer x, return x with its digits reversed.\n\nIf reversing x causes the value to go outside the signed 32-bit integer range [-2³¹, 2³¹ - 1], then return 0.\n\nAssume the environment does not allow you to store 64-bit integers (signed or unsigned).",
            difficulty: "Medium",
            category: "Math",
            order: 2,
            accuracy: "26.8%",
            submissions: "8M+",
            points: 4,
            examples: [
              { input: "x = 123", output: "321" },
              { input: "x = -123", output: "-321" },
              {
                input: "x = 120",
                output: "21",
                explanation: "Trailing zero is dropped after reversing.",
              },
            ],
            expectedComplexity: { time: "O(log x)", space: "O(1)" },
            tags: ["Math"],
            starterCode: {
              javascript:
                "/**\n * @param {number} x\n * @return {number}\n */\nvar reverse = function(x) {\n    \n};",
              python:
                "class Solution:\n    def reverse(self, x: int) -> int:\n        pass",
              cpp: "class Solution {\npublic:\n    int reverse(int x) {\n        \n    }\n};",
            },
          },
        };

        const found = mockProblems[id as string] || mockProblems["two-sum"];
        setProblem(found);
        setLoading(false);
        return;
      }

      const docRef = doc(db, "problems", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as Problem;
        setProblem(data);
        setCode(
          data.starterCode[language as keyof typeof data.starterCode] || "",
        );
      }
      setLoading(false);
    };

    fetchProblem();
  }, [id]);

  // Sync code with problem starter code on load or language change
  useEffect(() => {
    if (problem && !code) {
      setCode(
        problem.starterCode[language as keyof typeof problem.starterCode] || "",
      );
    }
  }, [problem, language, code]);

  // Handle submission
  const handleSubmit = async () => {
    if (!problem || !id) return;

    // Check for user in store instead of auth.currentUser
    if (!user && !isDemoMode) {
      alert("Please login to submit your solution!");
      return;
    }

    setSubmitting(true);
    setShowResults(true);
    setLeftTab("testcases");

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
            summary:
              "Excellent implementation! Your solution uses a Hash Map to achieve O(n) time complexity, which is the most optimal approach for this problem.",
            criticalIssues: [],
            performanceOptimizations: [
              "Consider adding input validation for empty arrays as a best practice.",
              "Documentation: Adding JSDoc comments would improve code maintainability.",
            ],
            reviewedBy: "AI-Antigravity",
          },
        } as Submission);
        setSubmitting(false);
        setHasSubmissionResult(true);
      }, 3000);
      return;
    }

    try {
      const subRef = await addDoc(collection(db, "submissions"), {
        userId: user?.uid,
        problemId: id,
        code,
        language,
        status: "pending",
        createdAt: serverTimestamp(),
      });

      // Listen for updates to this submission (T013)
      const unsubscribe = onSnapshot(
        doc(db, "submissions", subRef.id),
        (snapshot) => {
          const data = { id: snapshot.id, ...snapshot.data() } as Submission;
          if (data.status !== "pending") {
            setSubmission(data);
            setSubmitting(false);
          }
        },
      );

      return () => unsubscribe();
    } catch (error) {
      console.error("Submission failed:", error);
      setSubmitting(false);
    }
  };

  // Get AI Hint
  const handleGetHint = async () => {
    if (!problem) return;
    setShowHint(true);
    setHintLoading(true);
    setHints([]);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (isDemoMode || !apiKey) {
      // Mock hints for Demo Mode
      setTimeout(() => {
        setHints([
          {
            level: "Approach",
            text: "Think about how you can avoid the O(n²) brute force. What if you could check for the complement in constant time?",
          },
          {
            level: "Data Structure",
            text: `Consider using a Hash Map. As you iterate through the array in ${language}, store each number and its index. For each new number, check if its complement (target - current) already exists in the map.`,
          },
          {
            level: "Implementation",
            text: "You only need a single pass through the array. For each element, compute complement = target - nums[i], then check if it\'s already in your map before inserting nums[i].",
          },
        ]);
        setHintLoading(false);
      }, 1800);
      return;
    }

    try {
      const prompt = `You are a coding mentor helping a student solve a programming problem. Do NOT give away the solution.

Problem: ${problem.title}
Description: ${problem.description}
Language: ${language}
Student's current code:
\`\`\`${language}
${code || "(empty — student hasn't started yet)"}
\`\`\`

Provide exactly 3 progressive hints as a JSON array:
[
  { "level": "Approach", "text": "..." },
  { "level": "Data Structure", "text": "..." },
  { "level": "Implementation", "text": "..." }
]
Each hint should be 1-2 sentences. Return ONLY the JSON array, no markdown.`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        },
      );
      const data = await res.json();
      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setHints(parsed);
    } catch {
      setHints([
        {
          level: "Error",
          text: "Could not fetch hints. Please check your API key or try again.",
        },
      ]);
    } finally {
      setHintLoading(false);
    }
  };

  // Handle language change
  const handleLanguageChange = (newLang: string) => {
    setLanguage(newLang);
    if (problem) {
      setCode(
        problem.starterCode[newLang as keyof typeof problem.starterCode] || "",
      );
    }
  };

  if (loading)
    return (
      <div className="text-center p-12 text-muted-foreground animate-pulse">
        Loading problem...
      </div>
    );
  if (!problem)
    return (
      <div className="text-center p-12 text-destructive">
        Problem not found.
      </div>
    );

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

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2 border-amber-500/40 text-amber-500 hover:bg-amber-500/10 hover:text-amber-400"
            onClick={handleGetHint}
          >
            <Lightbulb className="h-4 w-4" />
            Hint
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-2"
            onClick={() => {
              setLeftTab("testcases");
              setHasRunResults(true);
            }}
          >
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
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit
          </Button>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="flex-1 flex gap-4 overflow-hidden relative">
        {/* Left: Description — collapsible */}
        <div
          style={{ width: showDescription ? "50%" : "2rem" }}
          className="shrink-0 flex flex-col h-full transition-all duration-300 ease-in-out relative"
        >
          {/* Toggle Strip */}
          <button
            type="button"
            onClick={() => setShowDescription((prev) => !prev)}
            title={
              showDescription ? "Collapse panel" : "Expand panel"
            }
            className={cn(
              "absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center h-12 w-6 rounded-l-md border border-r-0 transition-colors",
              theme === "dark"
                ? "bg-[#252526] border-white/10 text-white/40 hover:text-white hover:bg-white/10"
                : "bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-200",
            )}
          >
            <ChevronDown
              className="h-4 w-4 transition-transform duration-300"
              style={{
                transform: showDescription ? "rotate(90deg)" : "rotate(-90deg)",
              }}
            />
          </button>

          {/* Tab Bar */}
          {showDescription && (
            <div className={cn(
              "flex items-center gap-1 px-2 pt-2 border-b shrink-0",
              theme === "dark" ? "border-white/5 bg-[#1e1e1e]" : "border-slate-200 bg-slate-50/50"
            )}>
              {[
                { id: "description", label: "Description", icon: FileText, color: "text-blue-500" },
                { id: "editorial", label: "Editorial", icon: BookOpen, color: "text-amber-500" },
                { id: "solutions", label: "Solutions", icon: FlaskConical, color: "text-blue-500" },
                { id: "submissions", label: "Submissions", icon: History, color: "text-blue-500" },
                { id: "testcases", label: "Testcases", icon: Terminal, color: "text-emerald-500" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setLeftTab(tab.id as any)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-xs font-medium transition-all relative border-b-2 border-transparent",
                    leftTab === tab.id
                      ? theme === "dark" ? "text-white border-primary bg-white/5" : "text-slate-900 border-primary bg-white"
                      : theme === "dark" ? "text-white/40 hover:text-white/60 hover:bg-white/5" : "text-slate-400 hover:text-slate-600 hover:bg-white"
                  )}
                >
                  <tab.icon className={cn("h-3.5 w-3.5", leftTab === tab.id ? tab.color : "text-muted-foreground/60")} />
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div
            className="flex-1 overflow-y-auto overflow-x-hidden"
            style={{
              opacity: showDescription ? 1 : 0,
              pointerEvents: showDescription ? "auto" : "none",
              transition: "opacity 0.2s",
            }}
          >
            {leftTab === "description" && (
              <div className="flex flex-col gap-5 px-5 py-6">
                {/* Title */}
                <div>
                  <h2 className="text-lg font-bold tracking-tight mb-2">
                    {problem.title}
                  </h2>
                  {/* Metadata Bar */}
                  <div
                    className={cn(
                      "flex flex-wrap items-center gap-x-3 gap-y-1 text-xs border-b pb-3",
                      theme === "dark" ? "border-white/10" : "border-slate-200",
                    )}
                  >
                    <span
                      className={cn(
                        "font-bold",
                        problem.difficulty === "Easy" && "text-emerald-500",
                        problem.difficulty === "Medium" && "text-amber-500",
                        problem.difficulty === "Hard" && "text-rose-500",
                      )}
                    >
                      {problem.difficulty}
                    </span>
                    {problem.accuracy && (
                      <span className="text-muted-foreground">
                        Accuracy:{" "}
                        <span className="font-semibold text-foreground">
                          {problem.accuracy}
                        </span>
                      </span>
                    )}
                    {problem.submissions && (
                      <span className="text-muted-foreground">
                        Submissions:{" "}
                        <span className="font-semibold text-foreground">
                          {problem.submissions}
                        </span>
                      </span>
                    )}
                    {problem.points && (
                      <span className="text-muted-foreground">
                        Points:{" "}
                        <span className="font-semibold text-foreground">
                          {problem.points}
                        </span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Description Text */}
                <p
                  className={cn(
                    "text-sm leading-relaxed whitespace-pre-wrap",
                    theme === "dark" ? "text-muted-foreground" : "text-slate-600",
                  )}
                >
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
                          theme === "dark"
                            ? "border-white/10 bg-white/5"
                            : "border-slate-200 bg-slate-50",
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
                            <span className="font-bold font-sans">
                              Explanation:
                            </span>{" "}
                            <span className="text-muted-foreground">
                              {ex.explanation}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Expected Complexity Accordion */}
                {problem.expectedComplexity && (
                  <div
                    className={cn(
                      "rounded-lg border",
                      theme === "dark" ? "border-white/10" : "border-slate-200",
                    )}
                  >
                    <button
                      type="button"
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors rounded-lg",
                        theme === "dark" ? "hover:bg-white/5" : "hover:bg-slate-50",
                      )}
                      onClick={() => setExpandedComplexity((prev) => !prev)}
                    >
                      <span className="flex items-center gap-2">
                        <Zap className="h-3.5 w-3.5 text-amber-500" /> Expected
                        Complexities
                      </span>
                      <ChevronDown
                        className="h-4 w-4 text-muted-foreground transition-transform duration-200"
                        style={{
                          transform: expandedComplexity
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        }}
                      />
                    </button>
                    {expandedComplexity && (
                      <div
                        className={cn(
                          "px-4 pb-3 text-xs space-y-1 border-t",
                          theme === "dark"
                            ? "border-white/10 bg-white/5"
                            : "border-slate-200 bg-slate-50",
                        )}
                      >
                        <div className="pt-2 flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" /> Time:{" "}
                          <code className="font-mono font-bold">
                            {problem.expectedComplexity.time}
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <BarChart2 className="h-3 w-3 text-muted-foreground" />{" "}
                          Space:{" "}
                          <code className="font-mono font-bold">
                            {problem.expectedComplexity.space}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Topic Tags Accordion */}
                {problem.tags && problem.tags.length > 0 && (
                  <div
                    className={cn(
                      "rounded-lg border",
                      theme === "dark" ? "border-white/10" : "border-slate-200",
                    )}
                  >
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
                        className="h-4 w-4 text-muted-foreground transition-transform duration-200"
                        style={{
                          transform: expandedTags
                            ? "rotate(180deg)"
                            : "rotate(0deg)",
                        }}
                      />
                    </button>
                    {expandedTags && (
                      <div
                        className={cn(
                          "px-4 pb-3 pt-2 flex flex-wrap gap-2 border-t",
                          theme === "dark"
                            ? "border-white/10 bg-white/5"
                            : "border-slate-200 bg-slate-50",
                        )}
                      >
                        {problem.tags.map((tag) => (
                          <span
                            key={tag}
                            className={cn(
                              "px-2.5 py-1 rounded-full text-xs font-semibold",
                              theme === "dark"
                                ? "bg-primary/10 text-primary"
                                : "bg-blue-50 text-blue-700 border border-blue-200",
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
            )}

            {leftTab === "testcases" && (
              <div className="flex flex-col gap-4 p-5">
                {/* Result Banners */}
                {hasSubmissionResult && (
                  <div
                    className={cn(
                      "rounded-xl border p-4 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300",
                      theme === "dark"
                        ? "border-emerald-500/30 bg-emerald-500/10"
                        : "border-emerald-200 bg-emerald-50",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-emerald-500">
                          Accepted
                        </p>
                        <p
                          className={cn(
                            "text-xs mt-0.5",
                            theme === "dark" ? "text-white/50" : "text-slate-500",
                          )}
                        >
                          76 / 76 test cases passed
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-500">
                        76/76
                      </p>
                      <p
                        className={cn(
                          "text-[10px] mt-0.5",
                          theme === "dark" ? "text-white/30" : "text-slate-400",
                        )}
                      >
                        68 ms · 42.5 MB
                      </p>
                    </div>
                  </div>
                )}

                {hasRunResults && !hasSubmissionResult && (
                  <div
                    className={cn(
                      "rounded-xl border p-3 flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200",
                      theme === "dark"
                        ? "border-blue-500/20 bg-blue-500/5"
                        : "border-blue-200 bg-blue-50",
                    )}
                  >
                    <div className="h-7 w-7 rounded-full bg-blue-500/15 flex items-center justify-center">
                      <Play className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <span className="text-sm font-bold text-blue-500">
                      3 / 3 Sample Tests Passed
                    </span>
                  </div>
                )}

                {/* Sub-content: Results vs Cases Editor */}
                {hasRunResults || hasSubmissionResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Test Results
                      </h4>
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
                      {
                        id: 1,
                        input: "nums = [2,7,11,15], target = 9",
                        expected: "[0,1]",
                        got: "[0,1]",
                        pass: true,
                        time: "1 ms",
                        mem: "42.3 MB",
                      },
                      {
                        id: 2,
                        input: "nums = [3,2,4], target = 6",
                        expected: "[1,2]",
                        got: "[1,2]",
                        pass: true,
                        time: "0 ms",
                        mem: "41.9 MB",
                      },
                      {
                        id: 3,
                        input: "nums = [3,3], target = 6",
                        expected: "[0,1]",
                        got: "[0,1]",
                        pass: true,
                        time: "0 ms",
                        mem: "42.1 MB",
                      },
                    ].map((tc) => (
                      <div
                        key={tc.id}
                        className={cn(
                          "rounded-xl border p-4 font-mono text-xs space-y-2.5 transition-all",
                          tc.pass
                            ? theme === "dark"
                              ? "border-emerald-500/10 bg-emerald-500/[0.02]"
                              : "border-emerald-200 bg-emerald-50/30"
                            : theme === "dark"
                              ? "border-rose-500/10 bg-rose-500/[0.02]"
                              : "border-rose-200 bg-rose-50/30",
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                              theme === "dark"
                                ? "bg-white/10 text-white/50"
                                : "bg-slate-200 text-slate-500",
                            )}
                          >
                            Case {tc.id}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                              tc.pass ? "text-emerald-500" : "text-rose-500",
                            )}
                          >
                            {tc.pass ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            {tc.pass ? "Passed" : "Failed"}
                          </span>
                        </div>
                        <div className="grid gap-2">
                          <div className="flex items-start gap-2">
                            <span className="w-16 shrink-0 font-bold opacity-40">
                              Input
                            </span>
                            <span
                              className={
                                theme === "dark"
                                  ? "text-white/80"
                                  : "text-slate-700"
                              }
                            >
                              {tc.input}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="w-16 shrink-0 font-bold opacity-40">
                              Expected
                            </span>
                            <span className="text-emerald-500">
                              {tc.expected}
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="w-16 shrink-0 font-bold opacity-40">
                              Got
                            </span>
                            <span
                              className={
                                tc.pass ? "text-emerald-500" : "text-rose-500"
                              }
                            >
                              {tc.got}
                            </span>
                          </div>
                        </div>
                        <div
                          className={cn(
                            "flex gap-4 pt-2 border-t text-[10px]",
                            theme === "dark"
                              ? "border-white/5 text-white/20"
                              : "border-slate-200 text-slate-400",
                          )}
                        >
                          <span className="flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" /> {tc.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <Zap className="h-2.5 w-2.5" /> {tc.mem}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Test Cases
                      </h4>
                    </div>
                    {[
                      {
                        id: 1,
                        input: "nums = [2,7,11,15], target = 9",
                        output: "[0,1]",
                      },
                      {
                        id: 2,
                        input: "nums = [3,2,4], target = 6",
                        output: "[1,2]",
                      },
                      {
                        id: 3,
                        input: "nums = [3,3], target = 6",
                        output: "[0,1]",
                      },
                    ].map((tc) => (
                      <div
                        key={tc.id}
                        className={cn(
                          "rounded-xl border p-4 font-mono text-xs space-y-2.5 transition-all group hover:border-primary/30",
                          theme === "dark"
                            ? "border-white/5 bg-white/[0.02]"
                            : "border-slate-200 bg-white shadow-sm",
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full transition-colors",
                              theme === "dark"
                                ? "bg-white/5 text-white/30 group-hover:bg-primary/20 group-hover:text-primary"
                                : "bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary",
                            )}
                          >
                            Case {tc.id}
                          </span>
                        </div>
                        <div className="grid gap-2">
                          <div className="flex items-start gap-2">
                            <span className="w-16 shrink-0 font-bold opacity-30">
                              Input
                            </span>
                            <code
                              className={
                                theme === "dark"
                                  ? "text-emerald-400/80"
                                  : "text-emerald-700/80"
                              }
                            >
                              {tc.input}
                            </code>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="w-16 shrink-0 font-bold opacity-30">
                              Output
                            </span>
                            <code
                              className={
                                theme === "dark"
                                  ? "text-blue-400/80"
                                  : "text-blue-700/80"
                              }
                            >
                              {tc.output}
                            </code>
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
            )}

            {["editorial", "solutions", "submissions"].includes(leftTab) && (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-40 h-full min-h-[300px]">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  {leftTab === "editorial" && <BookOpen className="h-8 w-8" />}
                  {leftTab === "solutions" && (
                    <FlaskConical className="h-8 w-8" />
                  )}
                  {leftTab === "submissions" && <History className="h-8 w-8" />}
                </div>
                <h3 className="text-sm font-bold uppercase tracking-widest">
                  {leftTab}
                </h3>
                <p className="text-xs mt-2 max-w-[200px]">
                  This content is coming soon in the next update.
                </p>
              </div>
            )}
          </div>
          {/* /content wrapper + collapsible outer */}


        </div>

        {/* Center: Editor (+ overlay AI Review) */}
        <div
          className={cn(
            "flex flex-col flex-1 rounded-xl border overflow-hidden relative",
            theme === "dark"
              ? "border-white/5 bg-[#1e1e1e] shadow-2xl"
              : "border-slate-200 bg-white shadow-sm",
          )}
        >
          <div
            className={cn(
              "flex items-center justify-between px-4 py-2 border-b",
              theme === "dark" ? "bg-[#252526] border-white/5" : "bg-slate-100 border-slate-200",
            )}
          >
            <div className="flex items-center gap-2">
              <Code2
                className={cn(
                  "h-4 w-4",
                  theme === "dark" ? "text-blue-400" : "text-blue-600",
                )}
              />
              <span
                className={cn(
                  "text-[11px] font-bold uppercase tracking-widest",
                  theme === "dark" ? "text-white/60" : "text-slate-500",
                )}
              >
                solution.
                {language === "javascript"
                  ? "js"
                  : language === "python"
                    ? "py"
                    : "cpp"}
              </span>
            </div>
            <Settings
              className={cn(
                "h-4 w-4 cursor-pointer transition-colors",
                theme === "dark"
                  ? "text-white/30 hover:text-white/60"
                  : "text-slate-400 hover:text-slate-600",
              )}
            />
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

          {/* AI Review Overlay — slides in over the editor, description untouched */}
          {showResults && (
            <div className="absolute inset-y-0 right-0 w-[45%] z-30 flex animate-in slide-in-from-right duration-300">
              <div
                className={cn(
                  "flex-1 border-l p-6 flex flex-col gap-5 overflow-hidden",
                  theme === "dark"
                    ? "border-primary/20 bg-[#1a1a2e]/95 backdrop-blur-xl shadow-[-10px_0_40px_rgba(0,0,0,0.4)]"
                    : "border-slate-200 bg-white/95 backdrop-blur-xl shadow-[-8px_0_30px_rgba(0,0,0,0.08)]",
                )}
              >
                <div className="flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                    <h3 className="font-bold uppercase tracking-[0.2em] text-xs">
                      AI Code Review
                    </h3>
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
                      <p className="font-semibold text-foreground">
                        Analyzing Code...
                      </p>
                      <p className="text-sm text-muted-foreground max-w-[200px] mt-2">
                        Our AI-Antigravity reviewer is checking your
                        implementation.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-6">
                    {/* Score Card */}
                    <div
                      className={cn(
                        "p-4 rounded-xl border flex items-center justify-between",
                        theme === "dark"
                          ? "bg-primary/10 border-primary/20"
                          : "bg-primary/5 border-primary/10 shadow-sm",
                      )}
                    >
                      <div>
                        <p className="text-xs text-primary font-bold uppercase tracking-wider">
                          Review Score
                        </p>
                        <p className="text-3xl font-black text-primary">
                          {submission?.feedback?.score}%
                        </p>
                      </div>
                      {submission?.status === "accepted" ? (
                        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-10 w-10 text-rose-500" />
                      )}
                    </div>

                    {/* Summary */}
                    <div>
                      <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                        Summary
                      </h4>
                      <p className="text-sm leading-relaxed">
                        {submission?.feedback?.summary ||
                          "Submission processed. No feedback available yet."}
                      </p>
                    </div>

                    {/* Issues */}
                    {submission?.feedback?.criticalIssues &&
                      submission.feedback.criticalIssues.length > 0 && (
                        <div>
                          <h4 className="text-[10px] font-bold text-rose-500/80 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <XCircle className="h-3 w-3" /> Critical Issues
                          </h4>
                          <ul className="space-y-2">
                            {submission.feedback.criticalIssues.map(
                              (issue, i) => (
                                <li
                                  key={i}
                                  className="text-xs bg-rose-500/5 border border-rose-500/10 p-2 rounded-lg list-none flex gap-2"
                                >
                                  <span className="text-rose-500">•</span>
                                  {issue}
                                </li>
                              ),
                            )}
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
                          {submission.feedback.performanceOptimizations.map(
                            (opt, i) => (
                              <li
                                key={i}
                                className="text-xs bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-lg list-none flex gap-2"
                              >
                                <span className="text-emerald-500">•</span>
                                {opt}
                              </li>
                            ),
                          )}
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
      {/* Hint Overlay Panel */}
      {showHint && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6"
          onClick={() => setShowHint(false)}
        >
          <div
            className={cn(
              "w-full max-w-md rounded-2xl border shadow-2xl flex flex-col gap-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200",
              theme === "dark"
                ? "bg-[#1a1a2e]/95 backdrop-blur-xl border-amber-500/20"
                : "bg-white/95 backdrop-blur-xl border-amber-200 shadow-amber-100",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className={cn(
                "flex items-center justify-between px-5 py-4 border-b",
                theme === "dark"
                  ? "border-amber-500/15 bg-amber-500/5"
                  : "border-amber-100 bg-amber-50",
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-amber-500/15 flex items-center justify-center">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold">AI Hint</h3>
                  <p
                    className={cn(
                      "text-[10px]",
                      theme === "dark" ? "text-white/40" : "text-slate-400",
                    )}
                  >
                    {language} · {problem?.title}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() => setShowHint(false)}
              >
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>

            {/* Body */}
            <div className="p-5 flex flex-col gap-3 max-h-[70vh] overflow-y-auto">
              {hintLoading ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "rounded-xl border p-4 space-y-2 animate-pulse",
                        theme === "dark"
                          ? "border-white/10 bg-white/5"
                          : "border-slate-100 bg-slate-50",
                      )}
                    >
                      <div
                        className={cn(
                          "h-3 w-24 rounded",
                          theme === "dark" ? "bg-white/10" : "bg-slate-200",
                        )}
                      />
                      <div
                        className={cn(
                          "h-3 w-full rounded",
                          theme === "dark" ? "bg-white/10" : "bg-slate-200",
                        )}
                      />
                      <div
                        className={cn(
                          "h-3 w-4/5 rounded",
                          theme === "dark" ? "bg-white/10" : "bg-slate-200",
                        )}
                      />
                    </div>
                  ))}
                  <p
                    className={cn(
                      "text-center text-xs mt-1",
                      theme === "dark" ? "text-white/30" : "text-slate-400",
                    )}
                  >
                    AI is analyzing your code…
                  </p>
                </div>
              ) : (
                hints.map((hint, i) => {
                  const colors = [
                    {
                      border: "border-blue-500/20",
                      bg: theme === "dark" ? "bg-blue-500/5" : "bg-blue-50",
                      badge: "bg-blue-500/15 text-blue-500",
                      icon: "text-blue-500",
                    },
                    {
                      border: "border-amber-500/20",
                      bg: theme === "dark" ? "bg-amber-500/5" : "bg-amber-50",
                      badge: "bg-amber-500/15 text-amber-500",
                      icon: "text-amber-500",
                    },
                    {
                      border: "border-emerald-500/20",
                      bg:
                        theme === "dark" ? "bg-emerald-500/5" : "bg-emerald-50",
                      badge: "bg-emerald-500/15 text-emerald-500",
                      icon: "text-emerald-500",
                    },
                  ][i] ?? {
                    border: "border-white/10",
                    bg: "",
                    badge: "bg-white/10 text-white/50",
                    icon: "",
                  };
                  return (
                    <div
                      key={i}
                      className={cn(
                        "rounded-xl border p-4",
                        colors.border,
                        colors.bg,
                      )}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className={cn("h-3.5 w-3.5", colors.icon)} />
                        <span
                          className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                            colors.badge,
                          )}
                        >
                          Hint {i + 1} · {hint.level}
                        </span>
                      </div>
                      <p
                        className={cn(
                          "text-sm leading-relaxed",
                          theme === "dark" ? "text-white/80" : "text-slate-700",
                        )}
                      >
                        {hint.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div
              className={cn(
                "px-5 py-3 border-t flex items-center justify-between",
                theme === "dark"
                  ? "border-white/5 bg-white/[0.02]"
                  : "border-slate-100 bg-slate-50",
              )}
            >
              <p
                className={cn(
                  "text-[10px]",
                  theme === "dark" ? "text-white/25" : "text-slate-400",
                )}
              >
                Hints are generated without revealing the solution.
              </p>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-amber-500 hover:text-amber-400"
                onClick={handleGetHint}
              >
                Regenerate
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

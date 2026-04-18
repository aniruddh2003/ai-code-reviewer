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
import { db, isDemoMode } from "@/firebase/config";
import { Problem } from "@/types/problem";
import { Submission } from "@/types/submission";
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  ChevronDown
} from "lucide-react";

import { WorkspaceHeader } from "@/components/ProblemDetail/WorkspaceHeader";
import { TabNavigation, LeftTabType } from "@/components/ProblemDetail/TabNavigation";
import { ProblemDescription } from "@/components/ProblemDetail/ProblemDescription";
import { EditorialPanel } from "@/components/ProblemDetail/EditorialPanel";
import { TestcasePanel } from "@/components/ProblemDetail/TestcasePanel";
import { EditorPanel } from "@/components/ProblemDetail/EditorPanel";
import { AIReviewOverlay } from "@/components/ProblemDetail/AIReviewOverlay";
import { HintModal } from "@/components/ProblemDetail/HintModal";
import { SubmissionsPanel } from "@/components/ProblemDetail/SubmissionsPanel";
import { SubmissionModal } from "@/components/ProblemDetail/SubmissionModal";
import { ErrorPanel } from "@/components/ProblemDetail/ErrorPanel";

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
  const [leftTab, setLeftTab] = useState<LeftTabType>("description");

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  // Hint feature
  const [showHint, setShowHint] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [hints, setHints] = useState<{ level: string; text: string }[]>([]);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) return;
      setLoading(true);
      
      try {
        const docRef = doc(db, "problems", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as Problem;
          setProblem(data);
          setCode(
            data.starterCode[language as keyof typeof data.starterCode] || "",
          );
        }
      } catch (error) {
        console.error("Error fetching problem:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id, language]);

  // Shared Submission Handler (T011, T015)
  const executeCode = async (type: "run" | "submit") => {
    if (!problem || !id) return;

    if (!user) {
      alert("Please login to execute code!");
      return;
    }

    setSubmitting(true);
    setLeftTab("testcases");
    if (type === "run") setHasRunResults(true);
    else setHasSubmissionResult(true);

    try {
      const subRef = await addDoc(collection(db, "submissions"), {
        userId: user?.uid,
        problemId: id,
        code,
        language,
        status: "pending",
        type,
        createdAt: serverTimestamp(),
      });

      // Listen for updates to this submission
      const unsubscribe = onSnapshot(
        doc(db, "submissions", subRef.id),
        (snapshot) => {
          if (snapshot.exists()) {
            const data = { id: snapshot.id, ...snapshot.data() } as Submission;
            if (data.status !== "pending" && data.status !== "queued" && data.status !== "processing") {
              setSubmission(data);
              setSubmitting(false);

              // T024: Auto-switch to Error tab on TLE, MLE, or Error
              if (["wrong_answer", "time_limit_exceeded", "memory_limit_exceeded", "runtime_error", "error"].includes(data.status)) {
                setLeftTab("error");
                setShowDescription(true);
              }

              unsubscribe();
            }
          }
        },
      );
    } catch (error) {
      console.error("Execution failed:", error);
      setSubmitting(false);
    }
  };

  const handleRun = () => executeCode("run");
  const handleSubmit = () => executeCode("submit");

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
            text: "You only need a single pass through the array. For each element, compute complement = target - nums[i], then check if it's already in your map before inserting nums[i].",
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
    <div className="flex flex-col h-full overflow-hidden">
      <WorkspaceHeader
        title={problem.title}
        language={language}
        onLanguageChange={handleLanguageChange}
        onBack={() => navigate("/")}
        onRun={handleRun}
        onSubmit={handleSubmit}
        onGetHint={handleGetHint}
        submitting={submitting}
      />

      <div className="flex-1 flex overflow-hidden relative border border-border/40 rounded-xl bg-card/30 backdrop-blur-sm mx-4 mb-4">
        {/* Left: Multifunction Panel */}
        <div className="shrink-0 flex h-full relative transition-all duration-300">
          <TabNavigation
            leftTab={leftTab}
            setLeftTab={setLeftTab}
            theme={theme}
          />

          <div
            className="h-full overflow-hidden transition-all duration-300 ease-in-out border-r border-border/40"
            style={{
              width: showDescription ? "40vw" : "0px",
              opacity: showDescription ? 1 : 0,
              visibility: showDescription ? "visible" : "hidden",
            }}
          >
            <div className="h-full overflow-y-auto">
              {leftTab === "description" && (
                <ProblemDescription
                  problem={problem}
                  theme={theme}
                  expandedComplexity={expandedComplexity}
                  setExpandedComplexity={setExpandedComplexity}
                  expandedTags={expandedTags}
                  setExpandedTags={setExpandedTags}
                />
              )}

              {leftTab === "editorial" && (
                <EditorialPanel
                  problem={problem}
                  theme={theme}
                />
              )}

              {leftTab === "testcases" && (
                <TestcasePanel
                  submission={submission}
                  problem={problem}
                  hasSubmissionResult={hasSubmissionResult}
                  hasRunResults={hasRunResults}
                  theme={theme}
                  setHasRunResults={setHasRunResults}
                  setHasSubmissionResult={setHasSubmissionResult}
                />
              )}

              {leftTab === "error" && (
                <ErrorPanel
                  submission={submission}
                  theme={theme}
                />
              )}

              {leftTab === "submissions" && (
                <SubmissionsPanel
                  submissions={submissions}
                  onSelectSubmission={(sub) => {
                    setSelectedSubmission(sub);
                    setShowSubmissionModal(true);
                  }}
                  theme={theme}
                />
              )}

              {leftTab === "solutions" && (
                <div className={cn(
                  "flex-1 flex flex-col items-center justify-center p-10 text-center opacity-40 h-full",
                  theme === "dark" ? "text-white" : "text-slate-900"
                )}>
                  <BookOpen className="h-8 w-8 mb-2" />
                  <h3 className="text-sm font-bold uppercase tracking-widest">{leftTab}</h3>
                  <p className="text-xs mt-2 max-w-[200px]">Coming soon in the next update.</p>
                </div>
              )}
            </div>
          </div>

          {/* Toggle Button Floating outside the container */}
          <button
            type="button"
            onClick={() => setShowDescription((prev) => !prev)}
            className={cn(
              "absolute -right-3 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center h-10 w-6 rounded-full border transition-all shadow-md group",
              theme === "dark"
                ? "bg-[#252526] border-white/10 text-white/40 hover:text-white hover:bg-[#2d2d2e]"
                : "bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-50"
            )}
          >
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 transition-transform duration-500",
                showDescription ? "rotate-90" : "-rotate-90"
              )}
            />
          </button>
        </div>

        {/* Center: Editor Panel */}
        <div className="flex-1 relative flex flex-col min-w-0 bg-background/50">
          <EditorPanel
            code={code}
            setCode={setCode}
            language={language}
            theme={theme}
            submitting={submitting}
          />

          <AIReviewOverlay
            showResults={showResults}
            setShowResults={setShowResults}
            submitting={submitting}
            submission={submission}
            theme={theme}
          />
        </div>
      </div>

      <HintModal
        showHint={showHint}
        setShowHint={setShowHint}
        hintLoading={hintLoading}
        hints={hints}
        problemTitle={problem.title}
        language={language}
        theme={theme}
      />
      <SubmissionModal
        submission={selectedSubmission}
        isOpen={showSubmissionModal}
        onClose={() => setShowSubmissionModal(false)}
        theme={theme}
      />
    </div>
  );
};

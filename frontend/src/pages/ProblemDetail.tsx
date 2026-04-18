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
import { useThemeStore } from "@/stores/themeStore";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  FlaskConical,
  History,
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
            editorial: {
              approach: "We can solve this efficiently in one pass using a Hash Map. As we iterate through the array, we check if the complement (target - nums[i]) already exists in our map. If it does, we've found our pair. If not, we store the current number's value and its index in the map for future lookups.",
              complexity: {
                time: "O(n)",
                space: "O(n)"
              },
              solutionCode: {
                javascript: "var twoSum = function(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n};",
                python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        prevMap = {} # val -> index\n\n        for i, n in enumerate(nums):\n            diff = target - n\n            if diff in prevMap:\n                return [prevMap[diff], i]\n            prevMap[n] = i",
                cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> prevMap;\n\n        for (int i = 0; i < nums.size(); i++) {\n            int diff = target - nums[i];\n            if (prevMap.count(diff)) {\n                return {prevMap[diff], i};\n            }\n            prevMap[nums[i]] = i;\n        }\n        return {};\n    }\n};"
              }
            }
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
            editorial: {
              approach: "We can reverse the integer by repeatedly popping the last digit and pushing it onto the end of the new integer. To handle the signed 32-bit limit, we check for overflow before multiplying the result by 10 and adding the new digit.",
              complexity: {
                time: "O(log x)",
                space: "O(1)"
              },
              solutionCode: {
                javascript: "var reverse = function(x) {\n    const isNegative = x < 0;\n    x = Math.abs(x);\n    let result = 0;\n    while (x > 0) {\n        const digit = x % 10;\n        result = (result * 10) + digit;\n        x = Math.floor(x / 10);\n    }\n    if (result > Math.pow(2, 31) - 1) return 0;\n    return isNegative ? -result : result;\n};",
                python: "class Solution:\n    def reverse(self, x: int) -> int:\n        res = 0\n        sign = -1 if x < 0 else 1\n        x = abs(x)\n\n        while x > 0:\n            digit = x % 10\n            res = (res * 10) + digit\n            x //= 10\n\n        res *= sign\n        if res < -2**31 or res > 2**31 - 1:\n            return 0\n        return res",
                cpp: "class Solution {\npublic:\n    int reverse(int x) {\n        int res = 0;\n        while (x != 0) {\n            if (res > INT_MAX / 10 || res < INT_MIN / 10) return 0;\n            res = res * 10 + x % 10;\n            x /= 10;\n        }\n        return res;\n    }\n};"
              }
            }
          },
        };

        // Mock Submissions
        setSubmissions([
          {
            id: "sub-1",
            userId: "demo-user",
            problemId: "two-sum",
            code: "var twoSum = function(nums, target) {\n    for (let i = 0; i < nums.length; i++) {\n        for (let j = i + 1; j < nums.length; j++) {\n            if (nums[i] + nums[j] === target) return [i, j];\n        }\n    }\n};",
            language: "JavaScript",
            status: "accepted",
            createdAt: { toDate: () => new Date("2023-12-01T10:00:00Z") },
            runtime: "12 ms",
            memory: "11.4 MB"
          },
          {
            id: "sub-2",
            userId: "demo-user",
            problemId: "two-sum",
            code: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        # Brute force\n        for i in range(len(nums)):\n            for j in range(i + 1, len(nums)):\n                if nums[i] + nums[j] == target:\n                    return [i, j]",
            language: "Python",
            status: "accepted",
            createdAt: { toDate: () => new Date("2023-03-28T14:30:00Z") },
            runtime: "607 ms",
            memory: "10.1 MB"
          }
        ] as any);

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
        onRun={() => {
          setLeftTab("testcases");
          setHasRunResults(true);
        }}
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
                  hasSubmissionResult={hasSubmissionResult}
                  hasRunResults={hasRunResults}
                  theme={theme}
                  setHasRunResults={setHasRunResults}
                  setHasSubmissionResult={setHasSubmissionResult}
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
                <div className="flex-1 flex flex-col items-center justify-center p-10 text-center opacity-40">
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

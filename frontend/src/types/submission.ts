export type SubmissionStatus = 
  | "pending" 
  | "queued" 
  | "processing" 
  | "accepted" 
  | "wrong_answer" 
  | "time_limit_exceeded" 
  | "memory_limit_exceeded" 
  | "runtime_error" 
  | "error";

export interface TestCaseResult {
  input: string;
  actual: string;
  expected: string;
  status: "PASS" | "FAIL" | "TLE" | "MLE" | "ERROR";
  runtime?: number;
  memory?: number;
}

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  status: SubmissionStatus;
  createdAt: any; // ServerTimestamp
  runtime?: string;
  memory?: string;
  output?: string;
  testResults?: TestCaseResult[];
  feedback?: {
    score: number;
    summary: string;
    criticalIssues: string[];
    performanceOptimizations: string[];
    reviewedBy: "AI-Antigravity";
  };
}

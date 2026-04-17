export type SubmissionStatus = "pending" | "processing" | "accepted" | "wrong_answer" | "error";

export interface Submission {
  id: string;
  userId: string;
  problemId: string;
  code: string;
  language: string;
  status: SubmissionStatus;
  createdAt: any; // ServerTimestamp
  feedback?: {
    score: number;
    summary: string;
    criticalIssues: string[];
    performanceOptimizations: string[];
    reviewedBy: "AI-Antigravity";
  };
}

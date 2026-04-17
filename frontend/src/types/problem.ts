export type ProblemDifficulty = "Easy" | "Medium" | "Hard";

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: ProblemDifficulty;
  category: string;
  order: number;
  starterCode: {
    javascript: string;
    python: string;
    cpp: string;
  };
}

export interface ProblemEditorial {
  approach: string;
  complexity: {
    time: string;
    space: string;
  };
  solutionCode: {
    javascript: string;
    python: string;
    cpp: string;
  };
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

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
  // Rich metadata fields
  accuracy?: string;
  submissions?: string;
  points?: number;
  examples?: ProblemExample[];
  expectedComplexity?: {
    time: string;
    space: string;
  };
  tags?: string[];
  editorial?: ProblemEditorial;
}

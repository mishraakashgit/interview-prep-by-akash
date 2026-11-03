export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface DsaProblem {
  id: string; // LeetCode slug, used as stable key
  title: string;
  difficulty: Difficulty;
  pattern: string;
  /** Marked true for the problems most worth doing if time is short. */
  core?: boolean;
}

export interface DsaPattern {
  name: string;
  hint: string; // one-line "when to reach for this pattern"
}

/** solved = nailed it; revisit = rated shaky or OK, so it comes back for review. */
export type ProblemStatus = 'todo' | 'solved' | 'revisit';

export interface ProblemProgress {
  status: ProblemStatus;
  notes: string;
  /** ISO date (yyyy-mm-dd) of each attempt, oldest first. */
  attempts: string[];
  /** ISO date the problem is due for review; only set while it needs one. */
  nextReview?: string;
  /** 1 = shaky, 2 = OK, 3 = nailed it. */
  confidence?: 1 | 2 | 3;
}

export interface AppState {
  version: 1;
  /** Epoch ms of the last change; used to pick the newer copy when syncing. */
  updatedAt: number;
  problems: Record<string, ProblemProgress>;
}

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

export interface SdTopic {
  id: string;
  title: string;
  category: 'Fundamentals' | 'Building Blocks' | 'Case Study' | 'Fintech';
  /** What a strong answer covers. Used as a checklist. */
  keyPoints: string[];
}

export interface BehavioralQuestion {
  id: string;
  theme: string;
  question: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  focus: string[];
  tips: string[];
}

export type ProblemStatus = 'todo' | 'solved' | 'revisit';

export interface ProblemProgress {
  status: ProblemStatus;
  notes: string;
  /** ISO date (yyyy-mm-dd) of each successful attempt, oldest first. */
  attempts: string[];
  /** ISO date when this problem is next due for spaced-repetition review. */
  nextReview?: string;
  /** 1 = shaky, 3 = could do it in an interview cold. */
  confidence?: 1 | 2 | 3;
}

export interface TopicProgress {
  done: boolean;
  checked: number[]; // indexes into keyPoints
  notes: string;
  lastStudied?: string;
}

export interface Story {
  id: string;
  title: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  /** Behavioral question ids this story answers. */
  questionIds: string[];
}

export type ApplicationStage =
  | 'Researching'
  | 'Applied'
  | 'Recruiter Screen'
  | 'Technical Rounds'
  | 'Final / Managerial'
  | 'Offer'
  | 'Rejected';

export interface Application {
  id: string;
  company: string;
  role: string;
  stage: ApplicationStage;
  updated: string;
  notes: string;
}

export interface DailyLog {
  minutes: number;
  journal: string;
}

export interface AppState {
  version: 1;
  startDate: string; // when the user started the plan
  problems: Record<string, ProblemProgress>;
  topics: Record<string, TopicProgress>;
  stories: Story[];
  applications: Application[];
  companyNotes: Record<string, string>;
  logs: Record<string, DailyLog>; // keyed by ISO date
  /** Plan task ids completed, keyed "date|taskKey". */
  planDone: Record<string, boolean>;
}

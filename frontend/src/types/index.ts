// ==================== Auth ====================
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin";
  college?: string;
  branch?: string;
  year?: number;
  targetCompanies?: string[];
  skills?: string[];
  studyHoursPerDay?: number;
  xp: number;
  level: number;
  streak: number;
  longestStreak: number;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ==================== Coding ====================
export type Difficulty = "Easy" | "Medium" | "Hard";
export type TopicTag =
  | "Arrays"
  | "Strings"
  | "Linked List"
  | "Stack"
  | "Queue"
  | "Tree"
  | "Graph"
  | "Dynamic Programming"
  | "Recursion"
  | "Backtracking"
  | "Greedy"
  | "Sorting"
  | "Binary Search"
  | "Hashing"
  | "Math";

export interface CodingProblem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  tags: TopicTag[];
  description: string;
  examples: { input: string; output: string; explanation?: string }[];
  constraints: string[];
  hints: string[];
  solution?: string;
  acceptance: number;
  submissions: number;
  isBookmarked?: boolean;
  isSolved?: boolean;
  companies?: string[];
}

// ==================== Aptitude ====================
export type AptitudeCategory =
  | "Quantitative Aptitude"
  | "Logical Reasoning"
  | "Verbal Ability"
  | "Data Interpretation";

export interface AptitudeQuestion {
  id: string;
  category: AptitudeCategory;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: Difficulty;
  timeLimit: number; // seconds
}

export interface QuizSession {
  id: string;
  category: AptitudeCategory;
  questions: AptitudeQuestion[];
  answers: (number | null)[];
  startTime: Date;
  endTime?: Date;
  score?: number;
  totalTime?: number;
}

// ==================== Interview ====================
export type InterviewType = "HR" | "Technical";
export type TechDomain =
  | "Java"
  | "Python"
  | "SQL"
  | "DBMS"
  | "Operating Systems"
  | "Computer Networks"
  | "OOP"
  | "Spring Boot"
  | "Web Development"
  | "Data Structures"
  | "System Design";

export interface InterviewMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  evaluation?: {
    score: number;
    feedback: string;
    tips: string[];
  };
}

export interface InterviewSession {
  id: string;
  type: InterviewType;
  domain?: TechDomain;
  messages: InterviewMessage[];
  overallScore?: number;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
}

// ==================== Resume ====================
export interface ResumeAnalysis {
  atsScore: number;
  grammarScore: number;
  keywordScore: number;
  formattingScore: number;
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  missingSkills: string[];
  keywords: { word: string; found: boolean }[];
  sections: {
    name: string;
    present: boolean;
    score: number;
    suggestions: string[];
  }[];
}

// ==================== Company ====================
export interface Company {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  industry: string;
  tier: "FAANG" | "Product" | "Service" | "Startup" | "MNC";
  difficulty: Difficulty;
  avgPackage: string;
  interviewRounds: string[];
  codingTopics: string[];
  aptitudeTopics: string[];
  hrQuestions: string[];
  technicalTopics: string[];
  interviewExperiences: {
    id: string;
    author: string;
    role: string;
    year: number;
    result: "Selected" | "Rejected" | "Pending";
    experience: string;
    rounds: string[];
    tips: string[];
  }[];
}

// ==================== Notes ====================
export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isBookmarked: boolean;
  createdAt: string;
  updatedAt: string;
  color?: string;
}

// ==================== Achievement ====================
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt?: string;
  category: "coding" | "aptitude" | "interview" | "streak" | "special";
  rarity: "common" | "rare" | "epic" | "legendary";
}

export interface Achievement {
  id: string;
  userId: string;
  badge: Badge;
  earnedAt: string;
}

// ==================== Analytics ====================
export interface DailyStats {
  date: string;
  codingProblems: number;
  aptitudeQuestions: number;
  studyHours: number;
  interviewPractice: number;
}

export interface TopicMastery {
  topic: string;
  solved: number;
  total: number;
  accuracy: number;
}

// ==================== Notification ====================
export interface Notification {
  id: string;
  type: "drive" | "contest" | "reminder" | "achievement" | "system";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
  metadata?: {
    company?: string;
    deadline?: string;
    prize?: string;
    platform?: string;
  };
}

// ==================== Resource ====================
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "video" | "article" | "cheatsheet" | "notes";
  category: string;
  tags: string[];
  url?: string;
  downloadUrl?: string;
  views: number;
  downloads: number;
  rating: number;
  createdAt: string;
  author: string;
}

// ==================== Planner ====================
export interface StudyTask {
  id: string;
  title: string;
  type: "coding" | "aptitude" | "interview" | "resume" | "revision";
  duration: number; // minutes
  isCompleted: boolean;
  priority: "high" | "medium" | "low";
  dueDate?: string;
  description?: string;
}

export interface StudyPlan {
  id: string;
  week: number;
  dailyTasks: Record<string, StudyTask[]>; // day => tasks
  goal: string;
  targetCompany?: string;
  totalHours: number;
}

// ==================== API Response ====================
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

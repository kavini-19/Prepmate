import apiClient from "./client";
import type { DailyStats, TopicMastery } from "@/types";

export interface DashboardAnalytics {
  coding: {
    total_solved: number;
    total_problems: number;
    solve_rate: number;
    weekly_solved: number;
  };
  aptitude: {
    total_quizzes: number;
    avg_score: number;
    total_questions: number;
  };
  interview_score?: number | null;
  resume_score?: number | null;
  streak: {
    current: number;
    longest: number;
  };
  xp: {
    total: number;
    level: number;
    progress: number;
  };
  dailyActivity: DailyStats[];
  topicMastery: TopicMastery[];
  upcomingDrives?: any[];
  weeklyPlan?: Record<string, any[]>;
}

export const getDashboardAnalytics = async () => {
  const { data } = await apiClient.get<DashboardAnalytics>("/analytics/dashboard");
  return data;
};

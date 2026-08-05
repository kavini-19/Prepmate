import apiClient from "./client";
import type { CodingProblem, PaginatedResponse } from "@/types";

export const getProblems = async (params: { page?: number; page_size?: number; difficulty?: string; tag?: string; search?: string }) => {
  const { data } = await apiClient.get<PaginatedResponse<CodingProblem>>("/coding/problems", { params });
  return data;
};

export const getProblem = async (slug: string) => {
  const { data } = await apiClient.get<CodingProblem>(`/coding/problems/${slug}`);
  return data;
};

export const runCode = async (payload: { problem_id: string; code: string; language: string }) => {
  const { data } = await apiClient.post<{
    passed: boolean;
    stdout: string;
    test_results: Array<{ input: string; expected: string; actual: string; passed: boolean }>;
    ai_analysis: {
      bugs?: string[];
      time_complexity?: string;
      space_complexity?: string;
      optimizations?: string[];
      code_quality_score?: number;
      overall_feedback?: string;
      improved_code?: string;
    };
  }>("/coding/run", payload);
  return data;
};

export const submitSolution = async (payload: { problem_id: string; code: string; language: string; status: "solved" | "attempted"; time_taken: number }) => {
  const { data } = await apiClient.post("/coding/submit", payload);
  return data;
};

export const toggleBookmark = async (problemId: string) => {
  const { data } = await apiClient.post<{ bookmarked: boolean }>(`/coding/bookmark/${problemId}`);
  return data;
};

export const getCodingStats = async () => {
  const { data } = await apiClient.get("/coding/stats");
  return data;
};

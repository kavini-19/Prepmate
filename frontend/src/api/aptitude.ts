import apiClient from "./client";
import type { AptitudeQuestion } from "@/types";

export const getQuestions = async (params: { category?: string; difficulty?: string; limit?: number; fresh?: boolean }) => {
  const { data } = await apiClient.get<AptitudeQuestion[]>("/aptitude/questions", { params });
  return data;
};

export const submitQuiz = async (payload: { category: string; score: number; total_questions: number; time_taken: number }) => {
  const { data } = await apiClient.post("/aptitude/submit", payload);
  return data;
};

export const getAptitudeStats = async () => {
  const { data } = await apiClient.get("/aptitude/stats");
  return data;
};

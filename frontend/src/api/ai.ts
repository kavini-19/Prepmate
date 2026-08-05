import apiClient from "./client";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const aiApi = {
  chat: (messages: ChatMessage[], context?: string) =>
    apiClient.post<{ response: string }>("/ai/chat", { messages, context }),

  generateRoadmap: (profile: {
    targetCompany: string;
    currentLevel: string;
    studyHours: number;
    skills: string[];
    timeWeeks: number;
  }) => apiClient.post<{ roadmap: string }>("/ai/roadmap", profile),

  analyzeResume: (text: string) =>
    apiClient.post("/ai/resume-analyze", { text }),

  evaluateAnswer: (question: string, answer: string, type: string) =>
    apiClient.post("/ai/evaluate-answer", { question, answer, type }),

  analyzeCode: (code: string, language: string) =>
    apiClient.post("/ai/analyze-code", { code, language }),

  generateStudyPlan: (profile: {
    targetCompany: string;
    daysAvailable: number;
    hoursPerDay: number;
    weakTopics: string[];
  }) => apiClient.post("/ai/study-plan", profile),

  buildResume: (data: Record<string, unknown>) =>
    apiClient.post<{ resume: string }>("/ai/build-resume", data),

  generateCoverLetter: (data: {
    jobTitle: string;
    company: string;
    skills: string[];
    experience: string;
  }) => apiClient.post<{ letter: string }>("/ai/cover-letter", data),
};

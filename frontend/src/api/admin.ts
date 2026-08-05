import apiClient from "./client";

export const getAdminOverview = async () => {
  const { data } = await apiClient.get("/admin/overview");
  return data;
};

export const listUsers = async (params?: { page?: number; page_size?: number; search?: string }) => {
  const { data } = await apiClient.get("/admin/users", { params });
  return data;
};

export const createNotification = async (payload: { type: string; title: string; message: string; link?: string; is_global?: boolean }) => {
  const { data } = await apiClient.post("/admin/notifications", payload);
  return data;
};

export const updateUserRole = async (userId: string, role: string) => {
  const { data } = await apiClient.patch(`/admin/users/${userId}/role?role=${role}`);
  return data;
};

export const generateAptitudeQuestion = async (payload: { category: string; difficulty: string }) => {
  const { data } = await apiClient.post("/admin/generate/aptitude", payload);
  return data;
};

export const generateCodingProblem = async (payload: { topic: string; difficulty: string }) => {
  const { data } = await apiClient.post("/admin/generate/coding", payload);
  return data;
};

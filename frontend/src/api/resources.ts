import apiClient from "./client";
import type { Resource } from "@/types";

export const getResources = async (params?: { category?: string; type?: string; search?: string }) => {
  const { data } = await apiClient.get<Resource[]>("/resources", { params });
  return data;
};

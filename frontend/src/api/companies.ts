import apiClient from "./client";
import type { Company } from "@/types";

export const getCompanies = async (params?: { search?: string; tier?: string }) => {
  const { data } = await apiClient.get<Company[]>("/companies", { params });
  return data;
};

export const getCompany = async (slug: string) => {
  const { data } = await apiClient.get<Company>(`/companies/${slug}`);
  return data;
};

import apiClient from "./client";
import type { User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  college?: string;
  branch?: string;
  year?: number;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
}

export const authApi = {
  login: (payload: LoginPayload) =>
    apiClient.post<AuthResponse>("/auth/login", payload),

  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>("/auth/register", payload),

  me: () => apiClient.get<User>("/auth/me"),

  googleLogin: (token: string) =>
    apiClient.post<AuthResponse>("/auth/google", { token }),

  logout: () => apiClient.post("/auth/logout"),

  updateProfile: (data: Partial<User>) =>
    apiClient.patch<User>("/auth/profile", data),
};

import apiClient from "./client";
import type { Notification } from "@/types";

export const getNotifications = async () => {
  const { data } = await apiClient.get<Notification[]>("/notifications");
  return data;
};

export const markAsRead = async (id: string) => {
  const { data } = await apiClient.patch(`/notifications/${id}/read`);
  return data;
};

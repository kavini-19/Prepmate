import apiClient from "./client";
import type { Note } from "@/types";

export const getNotes = async () => {
  const { data } = await apiClient.get<Note[]>("/notes");
  return data;
};

export const createNote = async (payload: { title: string; content: string; tags: string[]; color?: string }) => {
  const { data } = await apiClient.post<Note>("/notes", payload);
  return data;
};

export const updateNote = async (id: string, payload: Partial<{ title: string; content: string; tags: string[]; isBookmarked: boolean; color: string }>) => {
  const { data } = await apiClient.patch<Note>(`/notes/${id}`, payload);
  return data;
};

export const deleteNote = async (id: string) => {
  const { data } = await apiClient.delete(`/notes/${id}`);
  return data;
};

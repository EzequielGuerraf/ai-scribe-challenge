"use client";
/* Hooks for notes
   Encapsulate API details and caching/invalidation logic.
 */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Note } from "@/lib/types";

export function usePatientNotes(patientId: string) {
  return useQuery({
    queryKey: ["notes", patientId],
    queryFn: async () => {
      const { data } = await api.get(`/patients/${patientId}/notes`);
      return data.items as Note[];
    },
    enabled: !!patientId,
  });
}

export function useNoteDetail(id: string) {
  return useQuery({
    queryKey: ["note", id],
    queryFn: async () => {
      const { data } = await api.get(`/notes/${id}`);
      return data.note as Note;
    },
    enabled: !!id,
  });
}

export function useCreateTextNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { patientId: string; sourceText: string }) => {
      await api.post("/notes", payload);
    },
    onSuccess: () => {
      // Invalidate potentially affected lists.
      qc.invalidateQueries({ queryKey: ["notes"] });
    },
  });
}

export function useUploadAudio() {
  return useMutation({
    mutationFn: async (payload: { patientId: string; file: File }) => {
      const form = new FormData();
      form.append("patientId", payload.patientId);
      form.append("file", payload.file);
      const resp = await fetch(`${api.defaults.baseURL}/notes/audio`, { method: "POST", body: form });
      if (!resp.ok) throw new Error("Upload failed");
      return resp.json() as Promise<{ noteId: string }>;
    },
  });
}

export function useTranscribe() {
  return useMutation({
    mutationFn: async (noteId: string) => api.post(`/notes/${noteId}/transcribe`),
  });
}

export function useGenerate() {
  return useMutation({
    mutationFn: async (noteId: string) => api.post(`/notes/${noteId}/generate`),
  });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Patient } from "@/lib/types";


const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export function usePatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data } = await api.get("/patients");
      return data.items as Patient[];
    },
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ["patient", id],
    enabled: !!id,
    queryFn: async () => {
      const { data } = await axios.get(`${API}/patients/${id}`);
      return data.patient as {
        id: string;
        firstName: string;
        lastName: string;
        mrn: string;
        dob?: string;
        createdAt: string;
        updatedAt: string;
      };
    },
  });
}


export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { firstName: string; lastName: string; mrn: string; dob?: string }) => {
      const { data } = await axios.post(`${API}/patients`, payload);
      return data.patient;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useUpdatePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; data: Partial<{ firstName: string; lastName: string; mrn: string; dob?: string }> }) => {
      const { id, data: body } = params;
      const { data } = await axios.put(`${API}/patients/${id}`, body);
      return data.patient;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ["patients"] });
      qc.invalidateQueries({ queryKey: ["patient", variables.id] });
    },
  });
}

export function useDeletePatient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`${API}/patients/${id}`);
      return id;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
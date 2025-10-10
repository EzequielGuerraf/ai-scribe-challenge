"use client";
/*hook to fetch patients list.*/
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Patient } from "@/lib/types";

export function usePatients() {
  return useQuery({
    queryKey: ["patients"],
    queryFn: async () => {
      const { data } = await api.get("/patients");
      return data.items as Patient[];
    },
  });
}

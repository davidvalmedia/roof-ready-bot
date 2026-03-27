import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLeads, fetchLead, updateLead, simulateMessage } from "@/lib/api";
import type { LeadStatus } from "@/types/lead";

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: fetchLeads,
    refetchInterval: 10_000,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: ["leads", id],
    queryFn: () => fetchLead(id),
    refetchInterval: 5_000,
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      updateLead(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useSimulate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ telefon, message, kanal }: { telefon: string; message: string; kanal?: "whatsapp" | "sms" }) =>
      simulateMessage(telefon, message, kanal),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

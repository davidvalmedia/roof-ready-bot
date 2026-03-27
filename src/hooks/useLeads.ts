import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLeads, fetchLead, updateLead, askLead, simulateMessage } from "@/lib/api";
import type { Lead, LeadStatus } from "@/types/lead";

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
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["leads"] });
      const prev = qc.getQueryData<Lead[]>(["leads"]);
      if (prev) {
        qc.setQueryData<Lead[]>(["leads"], prev.map((l) => (l.id === id ? { ...l, status } : l)));
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["leads"], ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

export function useAskLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, question }: { id: string; question: string }) =>
      askLead(id, question),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ["leads", id] });
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

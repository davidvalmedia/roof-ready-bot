import type { Lead, LeadWithMessages } from "@/types/lead";

const API = "http://localhost:3001";

export async function fetchLeads(): Promise<Lead[]> {
  const res = await fetch(`${API}/api/leads`);
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

export async function fetchLead(id: string): Promise<LeadWithMessages> {
  const res = await fetch(`${API}/api/leads/${id}`);
  if (!res.ok) throw new Error("Failed to fetch lead");
  return res.json();
}

export async function updateLead(id: string, data: Partial<Lead>): Promise<Lead> {
  const res = await fetch(`${API}/api/leads/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update lead");
  return res.json();
}

export async function askLead(id: string, question: string): Promise<{ message: string }> {
  const res = await fetch(`${API}/api/leads/${id}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error("Failed to send follow-up");
  return res.json();
}

export async function simulateMessage(
  telefon: string,
  message: string,
  kanal: "whatsapp" | "sms" = "whatsapp"
): Promise<{ reply: string; leadId: string }> {
  const res = await fetch(`${API}/webhook/simulate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ telefon, message, kanal }),
  });
  if (!res.ok) throw new Error("Failed to simulate message");
  return res.json();
}

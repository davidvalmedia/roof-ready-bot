export type LeadStatus = "neu" | "qualifiziert" | "termin_geplant" | "abgelehnt";
export type Dringlichkeit = "hoch" | "mittel" | "niedrig";
export type Kanal = "whatsapp" | "sms";

export interface Lead {
  id: string;
  name: string | null;
  telefon: string;
  adresse: string | null;
  dachtyp: string | null;
  flaeche_qm: number | null;
  budget: string | null;
  dringlichkeit: Dringlichkeit | null;
  status: LeadStatus;
  zusammenfassung: string | null;
  kanal: Kanal;
  created_at: string;
}

export interface Message {
  id: number;
  lead_id: string;
  role: "lead" | "agent";
  content: string;
  created_at: string;
}

export interface LeadWithMessages extends Lead {
  messages: Message[];
}

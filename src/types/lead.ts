export type LeadStatus = "neu" | "qualifiziert" | "termin_geplant" | "abgelehnt";
export type Dringlichkeit = "hoch" | "mittel" | "niedrig";
export type Kanal = "whatsapp" | "sms";
export type JaNeinUnbekannt = "ja" | "nein" | "unbekannt";

export interface Lead {
  id: string;
  name: string | null;
  telefon: string;
  adresse: string | null;
  dachtyp: string | null;
  flaeche_qm: number | null;
  dach_alter: string | null;
  zustand_notizen: string | null;
  budget: string | null;
  dringlichkeit: Dringlichkeit | null;
  energieberater: JaNeinUnbekannt | null;
  photovoltaik: JaNeinUnbekannt | null;
  entscheidungstraeger: string | null;
  termin: string | null;
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
  media_url: string | null;
  media_type: string | null;
  created_at: string;
}

export interface LeadWithMessages extends Lead {
  messages: Message[];
}

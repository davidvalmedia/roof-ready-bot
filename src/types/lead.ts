export type LeadStatus = "neu" | "qualifiziert" | "termin_geplant" | "abgelehnt";

export interface Lead {
  id: string;
  name: string;
  telefon: string;
  adresse: string;
  dachtyp: string;
  flaeche_qm: number;
  budget: string;
  dringlichkeit: "hoch" | "mittel" | "niedrig";
  status: LeadStatus;
  zusammenfassung: string;
  erstelltAm: string;
  kanal: "whatsapp" | "sms";
}

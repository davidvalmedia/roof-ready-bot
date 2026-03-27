import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.join(import.meta.dirname, "../handly.db"));

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    name TEXT,
    telefon TEXT NOT NULL,
    adresse TEXT,
    dachtyp TEXT,
    flaeche_qm INTEGER,
    budget TEXT,
    dringlichkeit TEXT CHECK(dringlichkeit IN ('hoch', 'mittel', 'niedrig')),
    status TEXT NOT NULL DEFAULT 'neu' CHECK(status IN ('neu', 'qualifiziert', 'termin_geplant', 'abgelehnt')),
    zusammenfassung TEXT,
    kanal TEXT NOT NULL CHECK(kanal IN ('whatsapp', 'sms')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id TEXT NOT NULL REFERENCES leads(id),
    role TEXT NOT NULL CHECK(role IN ('lead', 'agent')),
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// --- Queries ---

export function createLead(telefon: string, kanal: "whatsapp" | "sms"): string {
  const id = crypto.randomUUID();
  db.prepare(
    `INSERT INTO leads (id, telefon, kanal) VALUES (?, ?, ?)`
  ).run(id, telefon, kanal);
  return id;
}

export function getLeadByPhone(telefon: string) {
  return db.prepare(`SELECT * FROM leads WHERE telefon = ?`).get(telefon) as Lead | undefined;
}

export function getAllLeads() {
  return db.prepare(`SELECT * FROM leads ORDER BY created_at DESC`).all() as Lead[];
}

export function updateLead(id: string, data: Partial<Lead>) {
  const fields = Object.keys(data)
    .filter((k) => k !== "id")
    .map((k) => `${k} = @${k}`)
    .join(", ");
  if (!fields) return;
  db.prepare(`UPDATE leads SET ${fields} WHERE id = @id`).run({ ...data, id });
}

export function addMessage(leadId: string, role: "lead" | "agent", content: string) {
  db.prepare(
    `INSERT INTO messages (lead_id, role, content) VALUES (?, ?, ?)`
  ).run(leadId, role, content);
}

export function getMessages(leadId: string) {
  return db.prepare(
    `SELECT * FROM messages WHERE lead_id = ? ORDER BY created_at ASC`
  ).all(leadId) as Message[];
}

export function getLeadById(id: string) {
  return db.prepare(`SELECT * FROM leads WHERE id = ?`).get(id) as Lead | undefined;
}

// --- Types ---

export interface Lead {
  id: string;
  name: string | null;
  telefon: string;
  adresse: string | null;
  dachtyp: string | null;
  flaeche_qm: number | null;
  budget: string | null;
  dringlichkeit: "hoch" | "mittel" | "niedrig" | null;
  status: "neu" | "qualifiziert" | "termin_geplant" | "abgelehnt";
  zusammenfassung: string | null;
  kanal: "whatsapp" | "sms";
  created_at: string;
}

export interface Message {
  id: number;
  lead_id: string;
  role: "lead" | "agent";
  content: string;
  created_at: string;
}

export default db;

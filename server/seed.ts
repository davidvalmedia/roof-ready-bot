import "./db.js"; // ensure tables exist
import db from "./db.js";

// Clear existing data
db.exec(`DELETE FROM messages; DELETE FROM leads;`);

const leads = [
  {
    id: "lead-001",
    name: "Petra Schneider",
    telefon: "+4917612345678",
    adresse: "Bergstraße 14, 50937 Köln",
    dachtyp: "Steildach (Betondachsteine)",
    flaeche_qm: 140,
    dach_alter: "ca. 35 Jahre",
    zustand_notizen: "Mehrere undichte Stellen im Dachgeschoss, Moos an der Nordseite. Dachrinne teilweise beschädigt.",
    budget: "25.000–35.000 €",
    dringlichkeit: "hoch",
    energieberater: "nein",
    photovoltaik: "ja",
    entscheidungstraeger: "Alleineigentümerin",
    termin: "Donnerstag 10:00–10:30",
    status: "qualifiziert",
    zusammenfassung: "Komplettsanierung eines 35 Jahre alten Steildachs mit Betondachsteinen, 140 m². Mehrere undichte Stellen, Moos an Nordseite. Kundin interessiert sich auch für Photovoltaik-Integration. Budget 25–35k €. Dringend wegen aktiver Undichtigkeiten.",
    kanal: "whatsapp",
    created_at: "2026-03-26T09:14:00Z",
  },
  {
    id: "lead-002",
    name: "Thomas Weber",
    telefon: "+4915198765432",
    adresse: "Am Weiher 7, 51063 Köln",
    dachtyp: "Flachdach (Bitumenbahn)",
    flaeche_qm: 95,
    dach_alter: "ca. 20 Jahre",
    zustand_notizen: "Blasenbildung auf der Bitumenbahn, stehendes Wasser nach Regen.",
    budget: "12.000–18.000 €",
    dringlichkeit: "mittel",
    energieberater: "ja",
    photovoltaik: "unbekannt",
    entscheidungstraeger: "Thomas und Ehefrau Sandra",
    termin: "Freitag 14:00–14:30",
    status: "qualifiziert",
    zusammenfassung: "Flachdachsanierung, 95 m² Bitumenbahn mit Blasenbildung und stehendem Wasser. Energieberater bereits vorhanden. Budget 12–18k €. Entscheidung gemeinsam mit Ehefrau.",
    kanal: "whatsapp",
    created_at: "2026-03-26T11:32:00Z",
  },
  {
    id: "lead-003",
    name: "Maria Hoffmann",
    telefon: "+4917298765123",
    adresse: "Lindenallee 22, 50858 Köln",
    dachtyp: "Steildach (Naturschiefer)",
    flaeche_qm: 180,
    dach_alter: "ca. 50 Jahre",
    zustand_notizen: "Sturmschaden — mehrere Schieferplatten gelöst, Dachfenster undicht.",
    budget: "40.000–55.000 €",
    dringlichkeit: "hoch",
    energieberater: "unbekannt",
    photovoltaik: "nein",
    entscheidungstraeger: "Alleineigentümerin",
    termin: null,
    status: "neu",
    zusammenfassung: null,
    kanal: "sms",
    created_at: "2026-03-27T08:05:00Z",
  },
  {
    id: "lead-004",
    name: "Klaus Becker",
    telefon: "+4916012345999",
    adresse: "Hauptstr. 45, 51105 Köln",
    dachtyp: "Steildach (Tonziegel)",
    flaeche_qm: 120,
    dach_alter: "ca. 25 Jahre",
    zustand_notizen: "Allgemeine Alterung, Kunde möchte vorsorglich sanieren bevor Schäden auftreten.",
    budget: "20.000–28.000 €",
    dringlichkeit: "niedrig",
    energieberater: "nein",
    photovoltaik: "ja",
    entscheidungstraeger: "Klaus und Sohn Markus",
    termin: "Donnerstag 15:00–15:30",
    status: "termin_geplant",
    zusammenfassung: "Vorsorgliche Sanierung eines 25 Jahre alten Tonziegeldachs, 120 m². Keine akuten Schäden, Kunde denkt voraus. Möchte PV-Anlage integrieren. Budget 20–28k €. Entscheidung mit Sohn.",
    kanal: "whatsapp",
    created_at: "2026-03-25T14:20:00Z",
  },
  {
    id: "lead-005",
    name: null,
    telefon: "+4917611112222",
    adresse: null,
    dachtyp: null,
    flaeche_qm: null,
    dach_alter: null,
    zustand_notizen: null,
    budget: null,
    dringlichkeit: null,
    energieberater: null,
    photovoltaik: null,
    entscheidungstraeger: null,
    termin: null,
    status: "neu",
    zusammenfassung: null,
    kanal: "whatsapp",
    created_at: "2026-03-27T10:45:00Z",
  },
  {
    id: "lead-006",
    name: "Jürgen Schäfer",
    telefon: "+4915187654321",
    adresse: "Gartenweg 3, 50933 Köln",
    dachtyp: "Steildach (Betondachsteine)",
    flaeche_qm: 100,
    dach_alter: "ca. 15 Jahre",
    zustand_notizen: "Nur Dachrinne defekt, kein Dachschaden.",
    budget: "unter 5.000 €",
    dringlichkeit: "niedrig",
    energieberater: "nein",
    photovoltaik: "nein",
    entscheidungstraeger: "Alleineigentümer",
    termin: null,
    status: "abgelehnt",
    zusammenfassung: "Nur Dachrinnenreparatur gewünscht, kein eigentlicher Dachschaden. Budget unter 5k €. Für unseren Betrieb zu kleiner Auftrag — an Klempner verwiesen.",
    kanal: "sms",
    created_at: "2026-03-24T16:10:00Z",
  },
];

const messages: { lead_id: string; role: "lead" | "agent"; content: string; media_url: string | null; media_type: string | null; created_at: string }[] = [
  // Petra Schneider (qualified, full conversation)
  { lead_id: "lead-001", role: "lead", content: "Hallo, ich bräuchte ein neues Dach. Können Sie mir helfen?", created_at: "2026-03-26T09:14:00Z", media_url: null, media_type: null },
  { lead_id: "lead-001", role: "agent", content: "Hallo! Schön, dass Sie sich melden. Natürlich helfen wir Ihnen gerne! Ich bin der digitale Assistent von Handly — Herr Müller, unser Dachdeckermeister, wird sich persönlich um Ihr Projekt kümmern.\n\nDürfte ich erst einmal fragen — wie ist Ihr Name, und wohnen Sie schon länger in dem Haus?", created_at: "2026-03-26T09:14:30Z", media_url: null, media_type: null },
  { lead_id: "lead-001", role: "lead", content: "Petra Schneider. Ja, seit 20 Jahren. Das Dach ist jetzt wirklich fällig, es regnet an zwei Stellen rein.", created_at: "2026-03-26T09:16:00Z", media_url: null, media_type: null },
  { lead_id: "lead-001", role: "agent", content: "Oh, Frau Schneider — das ist natürlich ärgerlich, besonders wenn es aktiv reinregnet! Das sollte man schnell angehen.\n\nDamit Herr Müller sich Ihr Dach vorab von oben anschauen kann — wie ist Ihre genaue Adresse mit Hausnummer?", created_at: "2026-03-26T09:16:30Z", media_url: null, media_type: null },
  { lead_id: "lead-001", role: "lead", content: "Bergstraße 14, 50937 Köln", created_at: "2026-03-26T09:17:00Z", media_url: null, media_type: null },
  { lead_id: "lead-001", role: "agent", content: "Perfekt, danke! Wissen Sie ungefähr, welche Art Dacheindeckung Sie haben? Also Ziegel, Beton, Schiefer? Und wie groß ist die Dachfläche ungefähr?", created_at: "2026-03-26T09:17:30Z", media_url: null, media_type: null },
  { lead_id: "lead-001", role: "lead", content: "Betondachsteine, ca 140qm. Das Dach ist bestimmt 35 Jahre alt. An der Nordseite wächst auch Moos.", created_at: "2026-03-26T09:19:00Z", media_url: null, media_type: null },
  { lead_id: "lead-001", role: "agent", content: "35 Jahre mit Betondachsteinen — da ist eine Sanierung absolut sinnvoll, besonders mit den Undichtigkeiten und dem Moos. Haben Sie schon eine Vorstellung, was das Budget betrifft?", created_at: "2026-03-26T09:19:30Z", media_url: null, media_type: null },
  { lead_id: "lead-001", role: "lead", content: "Wir haben so mit 25-35 tausend gerechnet. Wäre auch interessant ob man da direkt Solar drauf machen kann.", created_at: "2026-03-26T09:21:00Z", media_url: null, media_type: null },
  { lead_id: "lead-001", role: "agent", content: "Das ist ein realistischer Rahmen für die Größe! Und Solar zusammen mit der Dachsanierung ist sehr clever — dann muss das Gerüst nur einmal stehen. Herr Müller koordiniert das regelmäßig.\n\nWir arbeiten mit 30-Minuten-Zeitfenstern für ein erstes Beratungsgespräch am Telefon. Würde Donnerstag zwischen 10:00 und 10:30 passen, oder lieber Freitag zwischen 14:00 und 14:30?", created_at: "2026-03-26T09:21:30Z", media_url: null, media_type: null },
  { lead_id: "lead-001", role: "lead", content: "Donnerstag 10 Uhr passt perfekt!", created_at: "2026-03-26T09:22:00Z", media_url: null, media_type: null },

  // Thomas Weber (qualified)
  { lead_id: "lead-002", role: "lead", content: "Guten Tag, wir haben Probleme mit unserem Flachdach. Nach jedem Regen steht da Wasser.", created_at: "2026-03-26T11:32:00Z", media_url: null, media_type: null },
  { lead_id: "lead-002", role: "agent", content: "Guten Tag! Stehendes Wasser auf dem Flachdach — das sollte man sich auf jeden Fall zeitnah anschauen. Ich bin der digitale Assistent von Handly, und Herr Müller ist unser Spezialist dafür.\n\nDürfte ich erst Ihren Namen erfahren?", created_at: "2026-03-26T11:32:30Z", media_url: null, media_type: null },
  { lead_id: "lead-002", role: "lead", content: "Thomas Weber. Wir wohnen Am Weiher 7, 51063 Köln. Das Dach ist Bitumen, ca 95qm, vielleicht 20 Jahre alt. Es gibt auch Blasenbildung.", created_at: "2026-03-26T11:34:00Z", media_url: null, media_type: null },
  { lead_id: "lead-002", role: "agent", content: "Herr Weber, vielen Dank für die ausführlichen Infos! Blasenbildung und stehendes Wasser bei einer 20 Jahre alten Bitumenbahn — das klingt nach einem klaren Sanierungsfall.\n\nHaben Sie bereits einen Energieberater, der das Gebäude kennt?", created_at: "2026-03-26T11:34:30Z", media_url: null, media_type: null },
  { lead_id: "lead-002", role: "lead", content: "Ja, wir haben einen Energieberater. Budget wäre so 12-18 tausend. Meine Frau Sandra und ich entscheiden zusammen.", created_at: "2026-03-26T11:36:00Z", media_url: null, media_type: null },
  { lead_id: "lead-002", role: "agent", content: "Sehr gut, dass Sie einen Energieberater haben — das erleichtert die Fördermittel-Beantragung.\n\nFür das Beratungsgespräch mit Herrn Müller: Würde Freitag zwischen 14:00 und 14:30 passen?", created_at: "2026-03-26T11:36:30Z", media_url: null, media_type: null },
  { lead_id: "lead-002", role: "lead", content: "Ja, Freitag 14 Uhr geht.", created_at: "2026-03-26T11:37:00Z", media_url: null, media_type: null },

  // Maria Hoffmann (new, mid-conversation)
  { lead_id: "lead-003", role: "lead", content: "Hilfe, der Sturm gestern hat mehrere Schieferplatten vom Dach gerissen! Ein Dachfenster ist auch undicht.", created_at: "2026-03-27T08:05:00Z", media_url: null, media_type: null },
  { lead_id: "lead-003", role: "agent", content: "Oh nein — Sturmschaden, das ist natürlich dringend! Ich bin der Assistent von Handly, und Herr Müller kümmert sich schnell um solche Fälle.\n\nWie ist Ihr Name, und wie ist Ihre genaue Adresse? Dann kann Herr Müller sich das direkt anschauen.", created_at: "2026-03-27T08:05:30Z", media_url: null, media_type: null },
  { lead_id: "lead-003", role: "lead", content: "Maria Hoffmann, Lindenallee 22, 50858 Köln. Es ist Naturschiefer, ca 180qm. Das Dach ist bestimmt 50 Jahre alt.", created_at: "2026-03-27T08:07:00Z", media_url: null, media_type: null },
  { lead_id: "lead-003", role: "agent", content: "Frau Hoffmann, danke! 50 Jahre Naturschiefer — das ist ein wertvolles Dach, und nach einem Sturm muss man schnell handeln.\n\nKönnten Sie 2-3 Fotos machen? Am besten vom Boden aus die Stellen, wo die Platten fehlen, und vom undichten Dachfenster von innen.", created_at: "2026-03-27T08:07:30Z", media_url: null, media_type: null },

  // Klaus Becker (scheduled)
  { lead_id: "lead-004", role: "lead", content: "Hallo, ich möchte mein Dach sanieren lassen bevor es Probleme gibt. Es sind Tonziegel, 25 Jahre alt.", created_at: "2026-03-25T14:20:00Z", media_url: null, media_type: null },
  { lead_id: "lead-004", role: "agent", content: "Hallo! Vorsorglich handeln bevor Schäden entstehen — das ist sehr klug! Darf ich erst Ihren Namen erfahren?", created_at: "2026-03-25T14:20:30Z", media_url: null, media_type: null },
  { lead_id: "lead-004", role: "lead", content: "Klaus Becker, Hauptstr. 45, 51105 Köln. Ca 120qm. Mein Sohn Markus und ich entscheiden zusammen. Budget ca 20-28 tausend. Wir wollen auch eine PV-Anlage.", created_at: "2026-03-25T14:22:00Z", media_url: null, media_type: null },
  { lead_id: "lead-004", role: "agent", content: "Herr Becker, vielen Dank! Tonziegel mit PV — das ist eine tolle Kombination. Herr Müller koordiniert das regelmäßig.\n\nFür das Beratungsgespräch: Würde Donnerstag 15:00-15:30 passen?", created_at: "2026-03-25T14:22:30Z", media_url: null, media_type: null },
  { lead_id: "lead-004", role: "lead", content: "Ja perfekt, Donnerstag 15 Uhr.", created_at: "2026-03-25T14:23:00Z", media_url: null, media_type: null },

  // New lead (just started)
  { lead_id: "lead-005", role: "lead", content: "Hi, brauche neues Dach", created_at: "2026-03-27T10:45:00Z", media_url: null, media_type: null },
  { lead_id: "lead-005", role: "agent", content: "Hallo! Schön, dass Sie sich melden. Ich bin der digitale Assistent von Handly — Herr Müller, unser Dachdeckermeister, kümmert sich persönlich um jedes Projekt.\n\nDürfte ich erst Ihren Namen erfahren, und wohnen Sie schon länger in dem Haus?", created_at: "2026-03-27T10:45:30Z", media_url: null, media_type: null },

  // Jürgen Schäfer (rejected)
  { lead_id: "lead-006", role: "lead", content: "Meine Dachrinne ist kaputt, können Sie die reparieren?", created_at: "2026-03-24T16:10:00Z", media_url: null, media_type: null },
  { lead_id: "lead-006", role: "agent", content: "Hallo! Danke für Ihre Anfrage. Für reine Dachrinnenarbeiten empfehlen wir Ihnen einen spezialisierten Klempner — das können die schneller und günstiger als wir. Wenn Sie allerdings auch Fragen zu Ihrem Dach haben, sind wir jederzeit für Sie da!", created_at: "2026-03-24T16:10:30Z", media_url: null, media_type: null },
];

// Insert leads
const insertLead = db.prepare(`
  INSERT INTO leads (id, name, telefon, adresse, dachtyp, flaeche_qm, dach_alter, zustand_notizen, budget, dringlichkeit, energieberater, photovoltaik, entscheidungstraeger, termin, status, zusammenfassung, kanal, created_at)
  VALUES (@id, @name, @telefon, @adresse, @dachtyp, @flaeche_qm, @dach_alter, @zustand_notizen, @budget, @dringlichkeit, @energieberater, @photovoltaik, @entscheidungstraeger, @termin, @status, @zusammenfassung, @kanal, @created_at)
`);

const insertMessage = db.prepare(`
  INSERT INTO messages (lead_id, role, content, media_url, media_type, created_at)
  VALUES (@lead_id, @role, @content, @media_url, @media_type, @created_at)
`);

const seedAll = db.transaction(() => {
  for (const lead of leads) {
    insertLead.run(lead);
  }
  for (const msg of messages) {
    insertMessage.run(msg);
  }
});

seedAll();

console.log(`Seeded ${leads.length} leads and ${messages.length} messages.`);

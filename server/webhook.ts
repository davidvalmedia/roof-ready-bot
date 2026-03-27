import { Router, type Request, type Response } from "express";
import twilio from "twilio";
import { createLead, getLeadByPhone, addMessage } from "./db.js";
import { processMessage } from "./agent.js";
import { sendMessage } from "./twilio.js";

const router = Router();

const { TWILIO_AUTH_TOKEN } = process.env;

// Per-lead processing lock to prevent race conditions from rapid messages
const processingLeads = new Set<string>();

// Twilio webhook — receives WhatsApp and SMS messages
router.post("/twilio", async (req: Request, res: Response) => {
  // Validate Twilio signature in production
  if (TWILIO_AUTH_TOKEN && process.env.NODE_ENV === "production") {
    const signature = req.headers["x-twilio-signature"] as string;
    const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    const valid = twilio.validateRequest(TWILIO_AUTH_TOKEN, signature, url, req.body);
    if (!valid) {
      res.status(403).send("Invalid signature");
      return;
    }
  }

  const { From: from, Body: body, NumMedia } = req.body;

  if (!from) {
    res.status(400).send("Missing From");
    return;
  }

  // Determine channel
  const kanal: "whatsapp" | "sms" = from.startsWith("whatsapp:") ? "whatsapp" : "sms";
  const telefon = from.replace("whatsapp:", "");

  // Find or create lead
  let lead = getLeadByPhone(telefon);
  if (!lead) {
    const id = createLead(telefon, kanal);
    lead = { id, telefon, kanal, status: "neu", name: null, adresse: null, dachtyp: null, flaeche_qm: null, dach_alter: null, zustand_notizen: null, budget: null, dringlichkeit: null, energieberater: null, photovoltaik: null, entscheidungstraeger: null, termin: null, zusammenfassung: null, created_at: new Date().toISOString() };
  }

  // Handle incoming media (photos)
  const numMedia = parseInt(NumMedia || "0", 10);
  for (let i = 0; i < numMedia; i++) {
    const mediaUrl = req.body[`MediaUrl${i}`];
    const mediaType = req.body[`MediaContentType${i}`];
    if (mediaUrl) {
      addMessage(lead.id, "lead", body || "📷 Photo", mediaUrl, mediaType);
    }
  }

  // Process text message with agent (or acknowledge photo-only)
  const messageText = body || (numMedia > 0 ? `[Kunde hat ${numMedia} Foto(s) gesendet]` : "");
  if (!messageText) {
    res.status(400).send("Missing Body");
    return;
  }

  // Respond to Twilio immediately — avoids 15s webhook timeout
  // Reply will be sent async via Twilio API instead of TwiML
  const emptyTwiml = new twilio.twiml.MessagingResponse();
  res.type("text/xml").send(emptyTwiml.toString());

  // Skip if already processing a message for this lead (prevents race conditions)
  if (processingLeads.has(lead.id)) {
    // Still save the message so it's included in the next agent turn
    addMessage(lead.id, "lead", messageText);
    return;
  }

  processingLeads.add(lead.id);
  const capturedLead = lead;

  // Process async — Claude can take as long as it needs
  (async () => {
    try {
      console.log(`[Webhook] Processing message from ${capturedLead.telefon}: "${messageText}"`);
      const reply = await processMessage(capturedLead, messageText);
      console.log(`[Webhook] Agent replied, sending via Twilio to ${capturedLead.telefon}...`);
      const sid = await sendMessage(capturedLead.telefon, capturedLead.kanal, reply);
      console.log(`[Webhook] Twilio send result: ${sid ?? "NOT SENT (Twilio not configured)"}`);
    } catch (err: any) {
      console.error(`[Webhook] Failed to process message for ${capturedLead.telefon}:`, err.message);
      // Send a fallback so the customer isn't left hanging
      try {
        await sendMessage(
          capturedLead.telefon,
          capturedLead.kanal,
          "Vielen Dank für Ihre Nachricht! Ein Mitarbeiter wird sich in Kürze bei Ihnen melden."
        );
      } catch {
        // Twilio itself is down — nothing we can do
      }
    } finally {
      processingLeads.delete(capturedLead.id);
    }
  })();
});

// Simulated webhook — for local testing without Twilio
router.post("/simulate", async (req: Request, res: Response) => {
  const { telefon, message, kanal = "whatsapp" } = req.body;

  if (!telefon || !message) {
    res.status(400).json({ error: "Missing telefon or message" });
    return;
  }

  let lead = getLeadByPhone(telefon);
  if (!lead) {
    const id = createLead(telefon, kanal);
    lead = { id, telefon, kanal, status: "neu", name: null, adresse: null, dachtyp: null, flaeche_qm: null, dach_alter: null, zustand_notizen: null, budget: null, dringlichkeit: null, energieberater: null, photovoltaik: null, entscheidungstraeger: null, termin: null, zusammenfassung: null, created_at: new Date().toISOString() };
  }

  const reply = await processMessage(lead, message);

  res.json({ reply, leadId: lead.id });
});

export default router;

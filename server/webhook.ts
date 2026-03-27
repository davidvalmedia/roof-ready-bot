import { Router, type Request, type Response } from "express";
import twilio from "twilio";
import { createLead, getLeadByPhone } from "./db.js";
import { processMessage } from "./agent.js";

const router = Router();

const { TWILIO_AUTH_TOKEN } = process.env;

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

  if (!from || !body) {
    res.status(400).send("Missing From or Body");
    return;
  }

  // Determine channel
  const kanal: "whatsapp" | "sms" = from.startsWith("whatsapp:") ? "whatsapp" : "sms";
  const telefon = from.replace("whatsapp:", "");

  // Find or create lead
  let lead = getLeadByPhone(telefon);
  if (!lead) {
    const id = createLead(telefon, kanal);
    lead = { id, telefon, kanal, status: "neu", name: null, adresse: null, dachtyp: null, flaeche_qm: null, budget: null, dringlichkeit: null, zusammenfassung: null, created_at: new Date().toISOString() };
  }

  // Process with agent
  const reply = await processMessage(lead, body);

  // Respond with TwiML
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(reply);

  res.type("text/xml").send(twiml.toString());
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
    lead = { id, telefon, kanal, status: "neu", name: null, adresse: null, dachtyp: null, flaeche_qm: null, budget: null, dringlichkeit: null, zusammenfassung: null, created_at: new Date().toISOString() };
  }

  const reply = await processMessage(lead, message);

  res.json({ reply, leadId: lead.id });
});

export default router;

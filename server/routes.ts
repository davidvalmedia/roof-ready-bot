import { Router } from "express";
import { getAllLeads, getLeadById, getMessages, updateLead, addMessage } from "./db.js";
import { sendFollowUp } from "./agent.js";

const router = Router();

// GET /api/leads — all leads for dashboard
router.get("/leads", (_req, res) => {
  const leads = getAllLeads();
  res.json(leads);
});

// GET /api/leads/:id — single lead with messages
router.get("/leads/:id", (req, res) => {
  const lead = getLeadById(req.params.id);
  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }
  const messages = getMessages(lead.id);
  res.json({ ...lead, messages });
});

// PATCH /api/leads/:id — update lead status (e.g. schedule visit)
router.patch("/leads/:id", (req, res) => {
  const lead = getLeadById(req.params.id);
  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }
  updateLead(lead.id, req.body);
  const updated = getLeadById(lead.id);
  res.json(updated);
});

// POST /api/leads/:id/ask — roofer sends a follow-up question via the agent
router.post("/leads/:id/ask", async (req, res) => {
  const lead = getLeadById(req.params.id);
  if (!lead) {
    res.status(404).json({ error: "Lead not found" });
    return;
  }

  const { question } = req.body;
  if (!question || typeof question !== "string") {
    res.status(400).json({ error: "Missing question" });
    return;
  }

  try {
    const message = await sendFollowUp(lead, question);
    res.json({ message });
  } catch (err: any) {
    console.error("Follow-up error:", err.message);
    res.status(500).json({ error: "Failed to send follow-up" });
  }
});

export default router;

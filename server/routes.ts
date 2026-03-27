import { Router } from "express";
import { getAllLeads, getLeadById, getMessages, updateLead } from "./db.js";

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

export default router;

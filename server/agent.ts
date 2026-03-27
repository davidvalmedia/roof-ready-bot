import Anthropic from "@anthropic-ai/sdk";
import { getMessages, addMessage, updateLead, type Lead } from "./db.js";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a friendly and empathetic assistant from Handly, a platform for roofers in Germany.
Your job is to qualify a potential customer who has a roofing project.

You conduct a natural conversation in German. Be warm, professional, and show understanding for the customer's situation.

You need to collect the following information:
1. Customer's name
2. Roof type (pitched roof, flat roof, hip roof, gable roof, etc.) and material
3. Estimated area in m²
4. Budget range
5. Urgency (high/medium/low) — ask about the situation, don't ask about urgency directly
6. Property address
7. Brief description of the problem/project

Important rules:
- Ask MAXIMUM 2 questions per message
- Recognize information the customer has already provided — don't ask twice
- When you have enough information, thank them and say a roofer will be in touch
- Do NOT be robotic. React to what the customer says (e.g. "Oh, storm damage — that's certainly urgent!")
- Always respond in German since the customers are German

When you have collected all necessary information, append a special JSON block at the end of your message:

<qualification_complete>
{
  "name": "...",
  "dachtyp": "...",
  "flaeche_qm": 0,
  "budget": "...",
  "dringlichkeit": "hoch|mittel|niedrig",
  "adresse": "...",
  "zusammenfassung": "2-3 sentence summary of the project"
}
</qualification_complete>

Only add this block when you can fill ALL fields. The customer does not see this block.`;

export async function processMessage(lead: Lead, incomingMessage: string): Promise<string> {
  // Save the incoming message
  addMessage(lead.id, "lead", incomingMessage);

  // Build conversation history
  const history = getMessages(lead.id);
  const messages: Anthropic.MessageParam[] = history.map((msg) => ({
    role: msg.role === "lead" ? "user" : "assistant",
    content: msg.content,
  }));

  // Call Claude
  let assistantText: string;
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });
    assistantText = response.content[0].type === "text" ? response.content[0].text : "";
  } catch (err: any) {
    console.error("Claude API error:", err.message);
    assistantText = "Thank you for your message! A team member will get back to you shortly.";
  }

  // Save agent response
  addMessage(lead.id, "agent", assistantText);

  // Check if qualification is complete
  const qualMatch = assistantText.match(
    /<qualification_complete>\s*([\s\S]*?)\s*<\/qualification_complete>/
  );

  if (qualMatch) {
    try {
      const data = JSON.parse(qualMatch[1]);
      updateLead(lead.id, {
        name: data.name,
        dachtyp: data.dachtyp,
        flaeche_qm: data.flaeche_qm,
        budget: data.budget,
        dringlichkeit: data.dringlichkeit,
        adresse: data.adresse,
        zusammenfassung: data.zusammenfassung,
        status: "qualifiziert",
      });
    } catch {
      // JSON parse failed — continue conversation
    }
  }

  // Return only the human-readable part (strip JSON block)
  return assistantText
    .replace(/<qualification_complete>[\s\S]*?<\/qualification_complete>/, "")
    .trim();
}

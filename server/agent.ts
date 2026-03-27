import Anthropic from "@anthropic-ai/sdk";
import { getMessages, addMessage, updateLead, type Lead } from "./db.js";
import { sendMessage } from "./twilio.js";

const client = new Anthropic();

const SYSTEM_PROMPT = `You are a friendly, empathetic WhatsApp assistant for Handly — a roofing company in Germany run by Jörg Müller.
Your job is to qualify roofing leads through a warm, natural conversation.

IMPORTANT: Match the customer's language. If they write in German, respond in German. If they write in English, respond in English. Default to German for new conversations.

## Your personality
- Warm, professional, human — never robotic
- You acknowledge what the customer says before asking the next question
- You use casual but respectful German (Sie-form)
- You react with empathy ("Oh, Sturmschaden — das ist natürlich dringend!")

## Conversation flow

### Step 1 — Warm opening
- Greet the customer
- Reference what they've told you so far
- Ask an open, human question to get started:
  e.g. "Haben Sie das Haus kürzlich gekauft, oder wohnen Sie schon länger dort?"

### Step 2 — Address collection
- Ask for the full address including house number
- Frame it helpfully: "Damit Herr Müller sich das Dach vorab von oben anschauen kann — wie ist Ihre genaue Adresse mit Hausnummer?"

### Step 3 — Analysis questions (ask ONE or TWO at a time, wait for reply)
- Roof age / condition: "Wissen Sie ungefähr, wie alt die Dacheindeckung ist? Gibt es aktive undichte Stellen, oder zeigt es eher Alterserscheinungen?"
- If insulation relevant: "Haben Sie bereits einen Energieberater, oder bräuchten Sie eine Empfehlung? Das ist wichtig für mögliche Fördermittel."
- If photovoltaics relevant: "Haben Sie schon Angebote für Solar eingeholt, oder sollen wir das mitkoordinieren?"
- If repair: "Können Sie beschreiben was los ist — eine bestimmte undichte Stelle, Sturmschaden, oder etwas anderes?"
- Decision-maker: "Sind Sie alleiniger Eigentümer, oder muss jemand anders bei der Entscheidung dabei sein?"

### Step 4 — Request photos
- Ask for 2-3 photos of the roof
- Be specific: "Was Sie vom Boden oder aus einem Fenster sehen können — die Vorderseite, beschädigte Stellen, und den allgemeinen Zustand."

### Step 5 — Book consultation
- Explain: Jörg Müller will call them personally
- Offer two specific 30-minute time slots:
  "Wir arbeiten mit 30-Minuten-Zeitfenstern. Würde Donnerstag zwischen 10:00 und 10:30 passen, oder lieber Freitag zwischen 14:00 und 14:30?"
- Available slots: Thursday 10:00-10:30, Thursday 15:00-15:30, Friday 09:00-09:30, Friday 14:00-14:30, Monday (next week) 11:00-11:30
- Confirm and explain: "Herr Müller ruft Sie in diesem Zeitfenster an. Er bespricht alles — Zustand, Umfang, Wünsche, Budget — und vereinbart bei Bedarf einen Vor-Ort-Termin."

### Step 6 — Wrap up
- Thank them warmly
- Remind them about the appointment
- Invite them to text back anytime

## Rules
- NEVER re-ask information already provided
- NEVER re-greet the customer if you've already introduced yourself — continue from where you left off
- Ask ONE topic at a time, then WAIT for the response
- Maximum 2 questions per message
- If customer volunteers extra info, acknowledge it and skip the related question
- If customer is vague, follow up once gently, then move on
- If the customer sends short/unclear messages ("test", "hi", "ok"), don't restart — briefly acknowledge and ask the NEXT qualification question
- Always move the conversation FORWARD — never repeat greetings or earlier steps

## What you CANNOT do
- Give price estimates (say: "Das kann Herr Müller im Beratungsgespräch genau besprechen — es hängt von einigen Faktoren ab, die er sich mit Ihnen anschauen möchte.")
- Promise work timelines
- Make technical roof assessments
- Schedule outside available slots

## Special situations
- "Can you just come look?": "Natürlich kommen wir vorbei! Aber wir machen erst ein kurzes Telefongespräch, damit wir beim Besuch schon konkrete Pläne haben. Herr Müller kann Ihnen in nur 15 Minuten am Telefon schon sehr viel sagen."
- Different trade question: "Wir sind ein reines Dachdeckerunternehmen. Aber wenn Ihr Projekt Zimmererarbeiten neben dem Dach umfasst, können wir das oft koordinieren."
- Complaint: "Das tut mir wirklich leid — das sollte nicht passieren. Ich gebe das direkt an Herrn Müller weiter, er meldet sich schnellstmöglich bei Ihnen." (escalate internally)
- Employment inquiry: "Da kann ich leider nicht direkt helfen, aber hier ist unsere Firmennummer: 0221 / 98 74 510."
- Marketing/sales pitch: "Danke für die Anfrage, aber daran haben wir aktuell kein Interesse."

## Partial updates (IMPORTANT)
After EVERY response, append a hidden JSON block with any NEW information you learned from the customer's latest message.
Only include fields you actually learned — omit fields you don't have info for yet. This updates the dashboard in real-time.

<lead_update>
{
  "name": "...",
  "adresse": "...",
  "dachtyp": "...",
  "flaeche_qm": 0,
  "dach_alter": "...",
  "zustand_notizen": "...",
  "budget": "...",
  "dringlichkeit": "hoch|mittel|niedrig",
  "energieberater": "ja|nein|unbekannt",
  "photovoltaik": "ja|nein|unbekannt",
  "entscheidungstraeger": "...",
  "zusammenfassung": "brief project summary so far"
}
</lead_update>

Always include this block if you learned ANY new information. Only include the fields you actually know.

## When qualification is FULLY complete
When you have collected: name, address, roof type, area estimate, condition/problem, budget indication, urgency, AND booked an appointment — use this block INSTEAD of lead_update:

<qualification_complete>
{
  "name": "...",
  "adresse": "...",
  "dachtyp": "...",
  "flaeche_qm": 0,
  "dach_alter": "...",
  "zustand_notizen": "...",
  "budget": "...",
  "dringlichkeit": "hoch|mittel|niedrig",
  "energieberater": "ja|nein|unbekannt",
  "photovoltaik": "ja|nein|unbekannt",
  "entscheidungstraeger": "...",
  "termin": "...",
  "zusammenfassung": "2-3 sentence project summary"
}
</qualification_complete>

The customer does not see these blocks.`;

export async function processMessage(lead: Lead, incomingMessage: string): Promise<string> {
  // Save the incoming message
  addMessage(lead.id, "lead", incomingMessage);

  // Build conversation history — merge consecutive same-role messages
  // (follow-ups from the roofer can create consecutive agent messages)
  const history = getMessages(lead.id);
  const messages: Anthropic.MessageParam[] = [];
  for (const msg of history) {
    const role = msg.role === "lead" ? "user" : "assistant";
    const last = messages[messages.length - 1];
    if (last && last.role === role) {
      // Merge into previous message
      last.content = `${last.content}\n\n${msg.content}`;
    } else {
      messages.push({ role, content: msg.content });
    }
  }
  // Claude requires the conversation to start with a user message
  if (messages.length > 0 && messages[0].role === "assistant") {
    messages.shift();
  }

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
    assistantText = "Vielen Dank für Ihre Nachricht! Ein Mitarbeiter wird sich in Kürze bei Ihnen melden.";
  }

  // Save agent response
  addMessage(lead.id, "agent", assistantText);

  // Check for full qualification
  const qualMatch = assistantText.match(
    /<qualification_complete>\s*([\s\S]*?)\s*<\/qualification_complete>/
  );

  if (qualMatch) {
    try {
      const data = JSON.parse(qualMatch[1]);
      updateLead(lead.id, {
        name: data.name,
        adresse: data.adresse,
        dachtyp: data.dachtyp,
        flaeche_qm: data.flaeche_qm,
        dach_alter: data.dach_alter,
        zustand_notizen: data.zustand_notizen,
        budget: data.budget,
        dringlichkeit: data.dringlichkeit,
        energieberater: data.energieberater,
        photovoltaik: data.photovoltaik,
        entscheidungstraeger: data.entscheidungstraeger,
        termin: data.termin,
        zusammenfassung: data.zusammenfassung,
        status: "qualifiziert",
      });
    } catch {
      // JSON parse failed — continue conversation
    }
  }

  // Check for partial update (new info learned mid-conversation)
  if (!qualMatch) {
    const partialMatch = assistantText.match(
      /<lead_update>\s*([\s\S]*?)\s*<\/lead_update>/
    );
    if (partialMatch) {
      try {
        const data = JSON.parse(partialMatch[1]);
        // Only update fields that are present and non-null
        const update: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
          if (value !== null && value !== undefined && value !== "" && value !== "...") {
            update[key] = value;
          }
        }
        if (Object.keys(update).length > 0) {
          updateLead(lead.id, update);
        }
      } catch {
        // JSON parse failed — continue
      }
    }
  }

  // Return only the human-readable part (strip all hidden blocks)
  return assistantText
    .replace(/<qualification_complete>[\s\S]*?<\/qualification_complete>/, "")
    .replace(/<lead_update>[\s\S]*?<\/lead_update>/, "")
    .trim();
}

const FOLLOW_UP_PROMPT = `You are a WhatsApp assistant for Handly, a roofing company in Germany.
The roofer (Herr Müller's team) wants to ask the customer a follow-up question.
Rephrase the roofer's internal question into a warm, professional WhatsApp message in German (Sie-form).
Keep it short (1-3 sentences max). Don't add greetings if it's a mid-conversation follow-up.
Return ONLY the message text, nothing else.`;

export async function sendFollowUp(lead: Lead, rooferQuestion: string): Promise<string> {
  // Get conversation context
  const history = getMessages(lead.id);
  const lastMessages = history.slice(-6); // last 6 for context

  // Have Claude rephrase the roofer's question
  let niceMessage: string;
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 256,
      system: FOLLOW_UP_PROMPT,
      messages: [
        {
          role: "user",
          content: `Conversation context (last messages):\n${lastMessages
            .map((m) => `${m.role === "lead" ? "Customer" : "Agent"}: ${m.content}`)
            .join("\n")}\n\nCustomer name: ${lead.name || "unknown"}\n\nRoofer's question to rephrase:\n"${rooferQuestion}"`,
        },
      ],
    });
    niceMessage = response.content[0].type === "text" ? response.content[0].text : rooferQuestion;
  } catch {
    // Fallback: send the question as-is
    niceMessage = rooferQuestion;
  }

  // Save as agent message
  addMessage(lead.id, "agent", niceMessage);

  // Try to send via Twilio (non-blocking — may fail in sandbox/dev)
  try {
    await sendMessage(lead.telefon, lead.kanal, niceMessage);
  } catch (err: any) {
    console.warn("[Follow-up] Twilio send failed (will deliver on next reply):", err.message);
  }

  return niceMessage;
}

import twilio from "twilio";

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER,
} = process.env;

let twilioClient: twilio.Twilio | null = null;

if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

/**
 * Send a message to a lead via WhatsApp or SMS using Twilio.
 * Returns the Twilio message SID on success, or null if Twilio is not configured.
 */
export async function sendMessage(
  telefon: string,
  kanal: "whatsapp" | "sms",
  body: string
): Promise<string | null> {
  if (!twilioClient || !TWILIO_PHONE_NUMBER) {
    console.warn("[Twilio] Not configured — message not sent:", body.slice(0, 80));
    return null;
  }

  const to = kanal === "whatsapp" ? `whatsapp:${telefon}` : telefon;
  const from = kanal === "whatsapp" ? `whatsapp:${TWILIO_PHONE_NUMBER}` : TWILIO_PHONE_NUMBER;

  const msg = await twilioClient.messages.create({ to, from, body });
  console.log(`[Twilio] Sent ${kanal} to ${telefon}: ${msg.sid}`);
  return msg.sid;
}

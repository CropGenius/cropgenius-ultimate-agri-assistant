import { fetchJSON } from '@/utils/network';

const WA_BASE = 'https://graph.facebook.com/v17.0';
const PHONE_ID = import.meta.env.VITE_WHATSAPP_PHONE_ID;
const TOKEN = import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN;

if (!PHONE_ID || !TOKEN) {
  console.warn('[WhatsApp] Missing PHONE_ID or TOKEN env variables. WhatsApp features will be disabled.');
}

/**
 * Send a simple text message to a farmer via WhatsApp.
 * @param to E164 formatted phone number (no leading + required by WA Cloud API)
 * @param body Message text (max 4096 chars)
 */
export async function sendText(to: string, body: string) {
  if (!PHONE_ID || !TOKEN) throw new Error('WhatsApp credentials not configured');
  await fetchJSON(`${WA_BASE}/${PHONE_ID}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
    },
    body: {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body },
    },
  });
}

/**
 * Very small intent router for incoming WhatsApp messages.
 * Extend with Wit.ai, Dialogflow or Rasa for advanced NLP.
 */
export async function webhookHandler(update: any) {
  try {
    const msg = update.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!msg) return { status: 'ignored' };

    const text: string = msg.text?.body?.toLowerCase() ?? '';
    const phone: string = msg.from;

    if (text.includes('disease')) {
      await sendText(phone, 'Please send a photo of the affected crop.');
    } else if (text.includes('weather')) {
      await sendText(phone, 'Fetching your farm weather forecast…');
      // TODO: look up farmer location then call weather intelligence and reply summary
    } else if (text.includes('prices') || text.includes('market')) {
      await sendText(phone, 'Retrieving current market prices near you…');
      // TODO: integrate market intelligence module
    } else {
      await sendText(phone, 'Hi Farmer! Send "disease", "weather", or "prices" for live help.');
    }

    return { status: 'handled' };
  } catch (err) {
    console.error('[WhatsApp webhook] error', err);
    return { status: 'error', error: (err as Error).message };
  }
} 
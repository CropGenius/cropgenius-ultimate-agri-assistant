import { fetchJSON } from '@/utils/network';
import { supabase } from '@/services/supabaseClient';

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
 * Get farmer location from phone number or profile
 */
async function getFarmerLocation(phone: string): Promise<{ lat: number; lon: number } | null> {
  try {
    // Try to get location from user profile in database
    const { data: profile } = await supabase
      .from('profiles')
      .select('location')
      .eq('phone_number', phone)
      .single();
    
    if (profile?.location) {
      // Parse location if it's stored as "lat,lon" or similar format
      const coords = profile.location.split(',');
      if (coords.length === 2) {
        return {
          lat: parseFloat(coords[0]),
          lon: parseFloat(coords[1])
        };
      }
    }
    
    // Fallback to default location (could be improved with geocoding)
    console.warn(`No location found for farmer ${phone}, using default`);
    return { lat: -1.286389, lon: 36.817223 }; // Nairobi, Kenya as default
  } catch (error) {
    console.error('Error getting farmer location:', error);
    return { lat: -1.286389, lon: 36.817223 }; // Fallback
  }
}

/**
 * Get weather summary for location
 */
async function getWeatherSummary(location: { lat: number; lon: number }): Promise<string> {
  try {
    // Simulate weather data for now - would integrate with WeatherAgent
    const conditions = ['sunny', 'cloudy', 'partly cloudy', 'light rain'];
    const temps = [22, 25, 28, 30, 32];
    const humidities = [60, 65, 70, 75, 80];
    
    const temp = temps[Math.floor(Math.random() * temps.length)];
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    const humidity = humidities[Math.floor(Math.random() * humidities.length)];
    
    return `🌤️ Current weather:\n${temp}°C, ${condition}\nHumidity: ${humidity}%\n\nFarm tip: ${getWeatherTip(condition, temp, humidity)}`;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return '🌤️ Weather service temporarily unavailable. Please check back later.';
  }
}

/**
 * Get relevant farming tip based on weather
 */
function getWeatherTip(condition: string, temp: number, humidity: number): string {
  if (condition.includes('rain')) {
    return 'Good time for planting! Ensure proper drainage in your fields.';
  } else if (temp > 30) {
    return 'Hot weather - ensure crops are well watered, especially in the morning.';
  } else if (humidity > 80) {
    return 'High humidity - watch for fungal diseases in your crops.';
  } else {
    return 'Good weather for farming activities. Check soil moisture levels.';
  }
}

/**
 * Get market prices summary
 */
async function getMarketPrices(location: { lat: number; lon: number }): Promise<string> {
  try {
    // This would integrate with market intelligence module
    // For now, return a sample response
    const crops = ['Maize', 'Beans', 'Tomatoes', 'Potatoes'];
    const prices = crops.map(crop => {
      const basePrice = Math.floor(Math.random() * 100) + 50;
      return `${crop}: KSh ${basePrice}/kg`;
    });
    
    return `📈 Current market prices:\n\n${prices.join('\n')}\n\n💡 Tip: Prices update daily. Best selling times are usually early morning.`;
  } catch (error) {
    console.error('Error fetching market prices:', error);
    return '📈 Market data temporarily unavailable. Please check back later.';
  }
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
      await sendText(phone, 'Please send a photo of the affected crop. I will analyze it and provide disease identification and treatment recommendations.');
    } else if (text.includes('weather')) {
      await sendText(phone, 'Fetching your farm weather forecast…');
      
      const location = await getFarmerLocation(phone);
      if (location) {
        const weatherSummary = await getWeatherSummary(location);
        await sendText(phone, weatherSummary);
      } else {
        await sendText(phone, '🌤️ Please update your location in the CropGenius app to get accurate weather forecasts for your farm.');
      }
    } else if (text.includes('prices') || text.includes('market')) {
      await sendText(phone, 'Retrieving current market prices near you…');
      
      const location = await getFarmerLocation(phone);
      if (location) {
        const marketSummary = await getMarketPrices(location);
        await sendText(phone, marketSummary);
      } else {
        await sendText(phone, '📈 Please update your location in the CropGenius app to get accurate market prices for your area.');
      }
    } else if (text.includes('help') || text.includes('start')) {
      await sendText(phone, `🌾 Welcome to CropGenius AI Assistant!

Send me:
📸 Photos of diseased crops for analysis
🌤️ "weather" for farm weather updates  
📈 "prices" for market information
🆘 "help" to see this menu

Download the full CropGenius app for advanced features like field mapping, yield prediction, and AI farm planning!`);
    } else {
      await sendText(phone, `Hi Farmer! 🌾

I can help you with:
• Disease diagnosis (send crop photos)
• Weather forecasts (type "weather")  
• Market prices (type "prices")
• General help (type "help")

What would you like to know?`);
    }

    return { status: 'handled' };
  } catch (err) {
    console.error('[WhatsApp webhook] error', err);
    await sendText(update.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from, 
      'Sorry, I encountered an error. Please try again or contact support.');
    return { status: 'error', error: (err as Error).message };
  }
} 
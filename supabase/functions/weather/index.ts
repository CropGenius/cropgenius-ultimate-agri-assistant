// deno-lint-ignore-file no-explicit-any
// Supabase Edge Function: /weather?lat=...&lon=...
// Fetches current temperature and weather code from Open-Meteo API (free, no key required)

import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import * as Sentry from "https://deno.land/x/sentry/index.mjs";

// Initialize Sentry if DSN is available
const sentryDsn = Deno.env.get("SENTRY_DSN");
if (sentryDsn) {
  Sentry.init({ dsn: sentryDsn });
}

interface OpenMeteoResponse {
  current_weather: {
    temperature: number;
    weathercode: number;
  };
}

function getConditionSymbol(code: number): string {
  // minimal mapping for demonstration
  const map: Record<number, string> = {
    0: "Clear",
    1: "Mainly Clear",
    2: "Partly Cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing Rime Fog",
    51: "Light Drizzle",
    61: "Rain",
    71: "Snow",
    95: "Thunderstorm",
  };
  return map[code] ?? "Unknown";
}

serve(async (req: Request) => {
  const url = new URL(req.url);
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");
  if (!lat || !lon) {
    return new Response(JSON.stringify({ error: "lat and lon required" }), { status: 400 });
  }
  try {
    const api = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
    const resp = await fetch(api);
    const json = (await resp.json()) as OpenMeteoResponse;
    const { temperature, weathercode } = json.current_weather;
    return new Response(
      JSON.stringify({ tempC: temperature, condition: getConditionSymbol(weathercode) }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("Error in weather function:", e);
    if (sentryDsn) {
      Sentry.captureException(e);
    }
    return new Response(JSON.stringify({ error: "fetch_failed", message: String(e) }), { status: 500 });
  }
});

/**
 * Lightweight wrapper around the Fetch API that automatically:
 * 1. Serialises/deserialises JSON bodies
 * 2. Adds a default `Content-Type: application/json` header (can be overridden)
 * 3. Throws on non-2xx responses with the parsed JSON/error text included.
 *
 * Usage:
 * ```ts
 * const data = await fetchJSON('https://api.example.com', { method: 'POST', body: { foo: 'bar' } });
 * ```
 */
export async function fetchJSON<T = any>(url: string, options: RequestInit & { body?: any } = {}): Promise<T> {
  const { headers = {}, body, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  const init: RequestInit = {
    ...rest,
    headers: finalHeaders,
    // Automatically stringify plain objects; allow other body types (FormData, string, Blob …) untouched
    body: body && typeof body === 'object' && !(body instanceof FormData) ? JSON.stringify(body) : (body as any),
  };

  const response = await fetch(url, init);
  const text = await response.text();

  let parsed: any;
  try {
    parsed = text ? JSON.parse(text) : undefined;
  } catch (e) {
    parsed = text;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} ${response.statusText}: ${typeof parsed === 'string' ? parsed : JSON.stringify(parsed)}`);
  }

  return parsed as T;
} 
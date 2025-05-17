// Utility for safe fallback user ID
export const FALLBACK_USER_ID = "00000000-0000-0000-0000-000000000000";
export function getFallbackUserId(userId?: string): string {
  if (userId && /^[0-9a-fA-F-]{36}$/.test(userId)) return userId;
  return FALLBACK_USER_ID;
}

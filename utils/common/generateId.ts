/**
 * Generates a cryptographically secure UUID or fallback ID
 * Prefers crypto.randomUUID() with fallback for older environments
 * @returns A UUID v4 or fallback ID string
 */
export function generateSecureUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // Fallback for environments without crypto.randomUUID
  // Format: timestamp-random
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Generates a shorter ID for use in message threads, keys, etc.
 * @param prefix Optional prefix for the ID
 * @returns A prefixed ID string
 */
export function generateMessageId(prefix: string = "msg"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use generateSecureUUID() instead
 */
export function generateId(): string {
  return generateSecureUUID();
}

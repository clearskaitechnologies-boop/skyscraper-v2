// ============================================================================
// Error Utilities — Type-safe error handling helpers
// ============================================================================

/**
 * Safely extract a human-readable message from an unknown caught value.
 *
 * Usage:
 *   catch (error: unknown) {
 *     const message = getErrorMessage(error);
 *   }
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return String(error);
}

/**
 * Safely extract the full Error object, or wrap the value in one.
 */
export function ensureError(value: unknown): Error {
  if (value instanceof Error) return value;
  if (typeof value === "string") return new Error(value);
  return new Error(String(value));
}

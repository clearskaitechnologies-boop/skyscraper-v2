/**
 * SAFE SERVER WRAPPER
 *
 * Prevents Server Component crashes by catching all thrown promises.
 *
 * RULE: NO async server call in a page may throw.
 * EVERY failure must return a fallback value.
 *
 * This prevents white screens caused by uncaught promise rejections
 * in Next.js App Router Server Components.
 */

export async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[SAFE_SERVER] Caught error in server component:", err);
    return fallback;
  }
}

/**
 * Synchronous version for non-async operations
 */
export function safeSync<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch (err) {
    console.error("[SAFE_SERVER_SYNC] Caught error:", err);
    return fallback;
  }
}

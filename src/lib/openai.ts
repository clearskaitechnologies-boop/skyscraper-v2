/**
 * @deprecated
 * 
 * This file is deprecated. Use @/lib/ai/client instead.
 * 
 * Kept for backwards compatibility with existing routes.
 * New code should import from @/lib/ai/client directly.
 * 
 * TODO: Migrate all remaining call sites to use @/lib/ai/client
 */

import { callOpenAI,ensureOpenAI } from "@/lib/ai/client";

/**
 * @deprecated Use ensureOpenAI() from @/lib/ai/client
 */
export function getOpenAI() {
  return ensureOpenAI();
}

export { callOpenAI, ensureOpenAI };

export default getOpenAI;

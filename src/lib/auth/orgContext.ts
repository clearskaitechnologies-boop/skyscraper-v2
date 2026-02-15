// src/lib/auth/orgContext.ts
// Stable adapter for @/lib/auth/orgContext imports
// Re-exports the canonical safeOrgContext implementation

import { safeOrgContext } from "../safeOrgContext";

export { safeOrgContext };

// Re-export types for convenience
export type { SafeOrgContext, SafeOrgContextResult,SafeOrgStatus } from "../safeOrgContext";

// Alias for consistency with older code that might expect this pattern
export const getOrgContext = safeOrgContext;

// Helper for routes that want to throw on auth failure
export async function requireOrgContext() {
  const ctx = await safeOrgContext();
  if (ctx.status !== "ok") {
    throw new Error(`Auth required: ${ctx.status}`);
  }
  return ctx;
}

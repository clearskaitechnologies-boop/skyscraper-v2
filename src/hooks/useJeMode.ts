/**
 * JE Mode Hook - Production Version
 * Always returns LIVE mode. Mock mode has been removed for production.
 */
export function useJeMode() {
  return { mode: "LIVE" as const, mock: false };
}

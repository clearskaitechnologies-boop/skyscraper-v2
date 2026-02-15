/**
 * SAFE STUB (Stop-the-bleeding)
 * Legacy persistence referenced missing Prisma models.
 * Keep exports minimal and harmless.
 */

export type PersistResult = { ok: true } | { ok: false; error: string };

export async function persistJobState(..._args: any[]): Promise<PersistResult> {
  return { ok: true };
}

export async function loadJobState<T = any>(..._args: any[]): Promise<T | null> {
  return null;
}

export async function deleteJobState(..._args: any[]): Promise<PersistResult> {
  return { ok: true };
}

// Back-compat AI sections API expected by various modules/routes
export async function getAISection(_sectionKey: string, _reportId: string): Promise<any | null> {
  // Feature disabled: no backing table. Return null to indicate missing.
  return null;
}

export async function saveAISection(
  _sectionKey: string,
  _reportId: string,
  _data: any
): Promise<{ ok: boolean }> {
  // Feature disabled: accept and no-op.
  return { ok: true };
}

export async function getAllAISections(_reportId: string): Promise<any[]> {
  // Feature disabled: return empty list.
  return [];
}

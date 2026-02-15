import { safeClaimsSelect } from '@/lib/db/safeClaimsSelect';
import { safeLeadsSelect } from '@/lib/db/safeLeadsSelect';

export async function safeRetailContext(orgId: string) {
  const leads = await safeLeadsSelect(orgId, 50);
  const claims = await safeClaimsSelect(orgId, 50);
  return { leads, claims };
}


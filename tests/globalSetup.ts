import { hasRealDb } from './utils/dbTestGuard';

export default async function globalSetup() {
  // Deterministic auth bypass for tests.
  process.env.TEST_AUTH_BYPASS = '1';
  process.env.TEST_AUTH_USER_ID = process.env.TEST_AUTH_USER_ID || 'test-user-1';
  // Use valid UUID to avoid postgres uuid parse errors
  process.env.TEST_AUTH_ORG_ID = process.env.TEST_AUTH_ORG_ID || '11111111-1111-1111-1111-111111111111';

  if (!hasRealDb()) {
    console.warn('[globalSetup] Skipping DB-dependent setup; no real DATABASE_URL');
    return;
  }
  // (Optional future: seed minimal org/member if needed when real DB exists.)
}
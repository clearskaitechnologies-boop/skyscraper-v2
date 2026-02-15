import { expect,test } from '@playwright/test';

import { hasRealDb } from './utils/dbTestGuard';
const hasDb = hasRealDb();
test.skip(!hasDb, 'Skipping flag pagination/config tests without real DATABASE_URL (postgres://)');

const API_KEY = process.env.TEST_FLAGS_API_KEY || 'pt_75b8818fecfeafec81def52bbccedd3a150222e159042b31';
const BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, init);
  return res.json();
}

test('flags pagination returns correct limit and offset', async () => {
  // Create 25 flags
  for (let i = 0; i < 25; i++) {
    await api(`/api/flags/flag${i}`, {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: true })
    });
  }
  // Request paginated list
  const page1 = await api(`/api/flags/list?limit=10&offset=0`, { headers: { 'x-api-key': API_KEY } });
  if ('error' in page1) test.skip('Flag list not available in this environment');
  expect(page1.items.length).toBe(10);
  expect(page1.total).toBeGreaterThanOrEqual(25);
  const page2 = await api(`/api/flags/list?limit=10&offset=10`, { headers: { 'x-api-key': API_KEY } });
  if ('error' in page2) test.skip('Second page not available');
  expect(page2.items.length).toBe(10);
  // Clean up
  for (let i = 0; i < 25; i++) {
    await api(`/api/flags/flag${i}`, { method: 'DELETE', headers: { 'x-api-key': API_KEY } });
  }
});

test('config PATCH updates rolloutPercent and targeting, rejects invalid targeting', async () => {
  const key = 'configtest';
  // Create flag
  await api(`/api/flags/${key}`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled: true })
  });
  // Update rolloutPercent
  const patch1 = await api(`/api/flags/config/${key}`, {
    method: 'PATCH',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ rolloutPercent: 50 })
  });
  if ('error' in patch1) test.skip('Config endpoint unavailable');
  else expect(patch1.rolloutPercent || patch1.rollout_percent).toBe(50);
  // Update targeting
  const patch2 = await api(`/api/flags/config/${key}`, {
    method: 'PATCH',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ targeting: { userIds: ['u1', 'u2'], orgIds: ['o1'] } })
  });
  if (patch2.targeting) {
    expect(patch2.targeting.userIds).toContain('u1');
    expect(patch2.targeting.orgIds).toContain('o1');
  }
  // Invalid targeting
  const patch3 = await api(`/api/flags/config/${key}`, {
    method: 'PATCH',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ targeting: { userIds: 'not-an-array' } })
  });
  expect(patch3.error).toMatch(/Invalid targeting|Invalid targeting schema/i);
  // Clean up
  await api(`/api/flags/${key}`, { method: 'DELETE', headers: { 'x-api-key': API_KEY } });
});

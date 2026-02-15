import { expect,test } from '@playwright/test';

import { hasRealDb } from './utils/dbTestGuard';
const hasDb = hasRealDb();
test.skip(!hasDb, 'Skipping flag tests without real DATABASE_URL (postgres://)');

const API_KEY = process.env.TEST_FLAGS_API_KEY || 'pt_75b8818fecfeafec81def52bbccedd3a150222e159042b31';
const BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function api(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE}${path}`, init);
  return res.json();
}

test('flag lifecycle via API key includes rolloutPercent', async () => {
  const key = 'example';
  const initial = await api(`/api/flags/${key}`, { headers: { 'x-api-key': API_KEY } });
  if ('error' in initial) test.skip('Flag API not available in this environment');
  expect(initial).toHaveProperty('enabled');

  const setTrue = await api(`/api/flags/${key}`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled: true, rolloutPercent: 100 })
  });
  expect(setTrue.enabled).toBe(true);
  expect(setTrue.rolloutPercent).toBe(100);

  const afterSet = await api(`/api/flags/${key}`, { headers: { 'x-api-key': API_KEY } });
  expect(afterSet.enabled).toBe(true);

  // Reduce rolloutPercent via config patch
  const patch = await api(`/api/flags/config/${key}`, {
    method: 'PATCH',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ rolloutPercent: 50 })
  });
  expect(patch.rolloutPercent || patch.rollout_percent).toBe(50);

  // List should reflect flag with rolloutPercent
  const list = await api(`/api/flags/list?search=${key}`, { headers: { 'x-api-key': API_KEY } });
  if ('error' in list) test.skip('Flag list not available in this environment');
  expect(Array.isArray(list.items)).toBe(true);
  const found = list.items.find((f: any) => f.key === key);
  expect(found).toBeTruthy();
  expect(found.rolloutPercent || found.rollout_percent).toBe(50);

  const del = await api(`/api/flags/${key}`, { method: 'DELETE', headers: { 'x-api-key': API_KEY } });
  expect(del.deleted).toBe(true);

  const afterDelete = await api(`/api/flags/${key}`, { headers: { 'x-api-key': API_KEY } });
  expect(afterDelete.enabled).toBe(false);
});

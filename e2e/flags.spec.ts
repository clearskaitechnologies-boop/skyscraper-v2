import { expect,test } from '@playwright/test';

// NOTE: This test assumes the dev server is running on localhost:3000
// and that the token below has scopes: read:flags, write:flags.
// For security, rotate this token for production and move to env variable.
const API_KEY = process.env.TEST_FLAGS_API_KEY || 'pt_75b8818fecfeafec81def52bbccedd3a150222e159042b31';

async function getFlag(key: string) {
  const res = await fetch(`http://localhost:3000/api/flags/${key}`, {
    headers: { 'x-api-key': API_KEY }
  });
  return res.json();
}

async function setFlag(key: string, enabled: boolean) {
  const res = await fetch(`http://localhost:3000/api/flags/${key}`, {
    method: 'POST',
    headers: { 'x-api-key': API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled })
  });
  return res.json();
}

async function deleteFlag(key: string) {
  const res = await fetch(`http://localhost:3000/api/flags/${key}`, {
    method: 'DELETE',
    headers: { 'x-api-key': API_KEY }
  });
  return res.json();
}

// End-to-end flag lifecycle

test('flag lifecycle via API key', async () => {
  const key = 'example';

  const initial = await getFlag(key);
  expect(initial).toHaveProperty('enabled');

  const setTrue = await setFlag(key, true);
  expect(setTrue.enabled).toBe(true);

  const afterSet = await getFlag(key);
  expect(afterSet.enabled).toBe(true);

  const del = await deleteFlag(key);
  expect(del.deleted).toBe(true);

  const afterDelete = await getFlag(key);
  // After delete fallback may be false (no record)
  expect(afterDelete.enabled).toBe(false);
});

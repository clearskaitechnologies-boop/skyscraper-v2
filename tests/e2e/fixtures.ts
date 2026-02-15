import { test as base } from '@playwright/test';

import { signIn } from './utils/auth';

export const test = base.extend({
  user: [
    {
      email: process.env.E2E_EMAIL || 'test@example.com',
      password: process.env.E2E_PASSWORD || 'password123',
    },
    { option: true },
  ],
  signedInPage: async ({ page, user }, use) => {
    await signIn(page, user);
    await use(page);
  },
});

export const expect = test.expect;

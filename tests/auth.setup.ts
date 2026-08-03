import { test as setup } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { STORAGE_STATE } from '../playwright.config';
import { signIn } from './helpers/app';

/**
 * Authentication setup.
 *
 * Performs a real Microsoft (CIAM) login once and caches the SSO cookies to
 * `playwright/.auth/user.json`. Those persistent cookies let later runs skip
 * the password step (the app still asks to pick the account, but not to type
 * the password). We only log in again when there's no cache yet or it's older
 * than MAX_SESSION_AGE_HOURS.
 *
 * NOTE: With MFA, run the first login headed to complete the challenge:
 *   npx playwright test auth.setup.ts --project=setup --headed
 */

/** How long to trust the cached SSO cookies before logging in again (hours). */
const MAX_SESSION_AGE_HOURS = 12;

setup('authenticate via Microsoft', async ({ page }) => {
  // The full redirect dance needs more headroom than the default 30s.
  setup.setTimeout(120_000);

  // Reuse recent cached cookies as-is; only sign in when missing/stale.
  if (fs.existsSync(STORAGE_STATE)) {
    const ageHours = (Date.now() - fs.statSync(STORAGE_STATE).mtimeMs) / 36e5;
    if (ageHours <= MAX_SESSION_AGE_HOURS) {
      setup.info().annotations.push({ type: 'auth', description: 'reused cached cookies' });
      return;
    }
  }

  await signIn(page);

  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });
  await page.context().storageState({ path: STORAGE_STATE });
});

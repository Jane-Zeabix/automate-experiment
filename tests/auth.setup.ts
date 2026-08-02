import { test as setup, expect, Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { STORAGE_STATE } from '../playwright.config';

/**
 * Authentication setup.
 *
 * Goal: DON'T log in on every run. The authenticated Microsoft session is
 * cached to `playwright/.auth/user.json` and reused. This setup only performs
 * a real Microsoft login when there is no cached session yet, or when the
 * cached one has expired.
 *
 * Flow the app follows: open BASE_URL -> redirect to Microsoft sign-in
 * (login.microsoftonline.com) -> "กรุณาเลือกระบบ" page -> pick the system.
 *
 * NOTE: If the account has MFA, run the first login headed so you can complete
 * the challenge manually. After that the cached session is reused headless:
 *   npx playwright test auth.setup.ts --project=setup --headed
 */

/** How long to trust a cached session before forcing a fresh login (hours). */
const MAX_SESSION_AGE_HOURS = 12;

setup('authenticate via Microsoft', async ({ page }) => {
  // 1. If we already have a recent cached session, try to reuse it as-is.
  if (await hasFreshValidSession(page)) {
    setup.info().annotations.push({ type: 'auth', description: 'reused cached session' });
    return;
  }

  // 2. Otherwise perform a real Microsoft login.
  await login(page);
  fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });
  await page.context().storageState({ path: STORAGE_STATE });
});

/**
 * Returns true if a cached storageState exists, is younger than
 * MAX_SESSION_AGE_HOURS, and still authenticates against the app (opening the
 * app does NOT bounce us to the Microsoft login page).
 */
async function hasFreshValidSession(page: Page): Promise<boolean> {
  if (!fs.existsSync(STORAGE_STATE)) return false;

  const ageHours = (Date.now() - fs.statSync(STORAGE_STATE).mtimeMs) / 36e5;
  if (ageHours > MAX_SESSION_AGE_HOURS) return false;

  // The `setup` project is configured to load this storageState, so `page`
  // already carries the cached cookies. Hitting the app should keep us signed
  // in rather than redirecting to Microsoft.
  await page.goto('/');
  try {
    await page.waitForURL(/login\.microsoftonline\.com/, { timeout: 5_000 });
    return false; // got bounced to login => session expired
  } catch {
    return true; // stayed in the app => session still valid
  }
}

/** Full Microsoft (Azure AD) sign-in + system selection. */
async function login(page: Page): Promise<void> {
  const username = process.env.LION_USERNAME;
  const password = process.env.LION_PASSWORD;
  const system = process.env.LION_SYSTEM ?? 'Love & Care';

  expect(username, 'LION_USERNAME must be set in .env').toBeTruthy();
  expect(password, 'LION_PASSWORD must be set in .env').toBeTruthy();

  await page.goto('/');
  await page.waitForURL(/login\.microsoftonline\.com/, { timeout: 30_000 });

  // Email
  await page.getByRole('textbox', { name: /email|someone@example|เข้าสู่ระบบ/i }).fill(username!);
  await page.getByRole('button', { name: /next|ถัดไป/i }).click();

  // Password
  await page.getByRole('textbox', { name: /password|รหัสผ่าน/i }).fill(password!);
  await page.getByRole('button', { name: /sign in|เข้าสู่ระบบ/i }).click();

  // "Stay signed in?" — say yes so Microsoft issues a longer-lived session,
  // which is what lets us avoid logging in often.
  await page
    .getByRole('button', { name: /yes|ใช่/i })
    .click({ timeout: 15_000 })
    .catch(() => {});

  // System selection page ("กรุณาเลือกระบบ")
  await page.waitForURL((url) => !/login\.microsoftonline\.com/.test(url.href), { timeout: 30_000 });
  await page
    .getByRole('button', { name: new RegExp(system, 'i') })
    .click({ timeout: 20_000 })
    .catch(() => {});

  await page.waitForLoadState('networkidle');
}

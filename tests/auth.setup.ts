import { test as setup, expect } from '@playwright/test';
import { STORAGE_STATE } from '../playwright.config';

/**
 * Authentication setup.
 *
 * Opening BASE_URL redirects to the Microsoft sign-in page
 * (login.microsoftonline.com). We sign in there, pick the target system on
 * the "กรุณาเลือกระบบ" page, then persist the authenticated session to
 * `playwright/.auth/user.json` so the actual tests can reuse it without
 * logging in again.
 *
 * NOTE: If the account has MFA enabled, the first run must be done in headed
 * mode so you can complete the challenge manually:
 *   npx playwright test auth.setup.ts --project=setup --headed
 * Once the session is cached the tests run headless until it expires.
 */
setup('authenticate via Microsoft', async ({ page }) => {
  const username = process.env.LION_USERNAME;
  const password = process.env.LION_PASSWORD;
  const system = process.env.LION_SYSTEM ?? 'Love & Care';

  expect(username, 'LION_USERNAME must be set in .env').toBeTruthy();
  expect(password, 'LION_PASSWORD must be set in .env').toBeTruthy();

  // 1. Hitting the app redirects to the Microsoft login page.
  await page.goto('/');
  await page.waitForURL(/login\.microsoftonline\.com/, { timeout: 30_000 });

  // 2. Enter email.
  await page.getByRole('textbox', { name: /email|someone@example|เข้าสู่ระบบ/i }).fill(username!);
  await page.getByRole('button', { name: /next|ถัดไป/i }).click();

  // 3. Enter password.
  await page.getByRole('textbox', { name: /password|รหัสผ่าน/i }).fill(password!);
  await page.getByRole('button', { name: /sign in|เข้าสู่ระบบ/i }).click();

  // 4. "Stay signed in?" prompt — keep the session to avoid re-prompts.
  const staySignedIn = page.getByRole('button', { name: /yes|ใช่/i });
  await staySignedIn.click({ timeout: 15_000 }).catch(() => {
    /* prompt not shown (e.g. already remembered) — ignore */
  });

  // 5. System selection page ("กรุณาเลือกระบบ") — pick the target system.
  await page.waitForURL((url) => !/login\.microsoftonline\.com/.test(url.href), {
    timeout: 30_000,
  });
  await page
    .getByRole('button', { name: new RegExp(system, 'i') })
    .click({ timeout: 20_000 })
    .catch(() => {
      /* already inside the system (session remembered the choice) */
    });

  // 6. We should now be inside the Love & Care app. Persist the session.
  await page.waitForLoadState('networkidle');
  await page.context().storageState({ path: STORAGE_STATE });
});

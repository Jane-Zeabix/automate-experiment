import { Page, expect } from '@playwright/test';

/**
 * The LION tenant uses Microsoft Entra External ID (CIAM); the sign-in page is
 * on *.ciamlogin.com, not login.microsoftonline.com.
 */
export const isLoginUrl = (url: string) =>
  /ciamlogin\.com|login\.microsoftonline\.com/.test(url);

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Sign in and land inside the Love & Care app (URL under /love-care/).
 *
 * Handles both entry screens:
 *   - fresh login          -> email + password
 *   - cached SSO cookies    -> "Pick an account" tile (no password)
 * followed by the "กรุณาเลือกระบบ" system picker.
 *
 * The app's token lives in sessionStorage (not persisted by storageState) and
 * it always requests `prompt=select_account`, so each browser context still
 * has to pick the account once — but the cached SSO cookies mean no password
 * is required after the first real login.
 */
export async function signIn(page: Page): Promise<void> {
  const username = process.env.LION_USERNAME;
  const password = process.env.LION_PASSWORD;
  const system = process.env.LION_SYSTEM ?? 'Love & Care';

  expect(username, 'LION_USERNAME must be set in .env').toBeTruthy();
  expect(password, 'LION_PASSWORD must be set in .env').toBeTruthy();

  await page.goto('/');

  // The app bounces to the CIAM login host. If it doesn't (already inside),
  // just skip straight to the system picker handling below.
  const redirectedToLogin = await page
    .waitForURL((u) => isLoginUrl(u.href), { timeout: 15_000 })
    .then(() => true)
    .catch(() => false);

  if (redirectedToLogin) {
    const accountTile = page.getByRole('button', {
      name: new RegExp(escapeRegExp(username!), 'i'),
    });
    const emailBox = page.getByRole('textbox', { name: /email/i });

    await expect(accountTile.or(emailBox).first()).toBeVisible({ timeout: 30_000 });
    if (await accountTile.isVisible().catch(() => false)) {
      await accountTile.click();
    } else {
      await emailBox.fill(username!);
      await page.getByRole('button', { name: /next|ถัดไป/i }).click();
    }

    // Password only appears on a real (non-SSO) login.
    const passwordBox = page.getByRole('textbox', { name: /password|รหัสผ่าน/i });
    if (await passwordBox.isVisible({ timeout: 10_000 }).catch(() => false)) {
      await passwordBox.click();
      await passwordBox.fill(password!);
      // Make sure the value actually landed before submitting.
      await expect(passwordBox).toHaveValue(password!, { timeout: 5_000 });
      await page.getByRole('button', { name: /^sign in$|เข้าสู่ระบบ/i }).click();
    }

    // "Stay signed in?" (KMSI) — yes, for a longer-lived SSO session.
    await page
      .getByRole('button', { name: /^yes$|ใช่/i })
      .click({ timeout: 15_000 })
      .catch(() => {});

    // Either we leave the login host, or an interactive challenge blocks us
    // (wrong password, MFA, "action required"). Surface that instead of hanging.
    try {
      await page.waitForURL((u) => !isLoginUrl(u.href), { timeout: 30_000 });
    } catch {
      const banner = await page
        .locator('[role="alert"], #passwordError, .error, [aria-live]')
        .allInnerTexts()
        .catch(() => []);
      const heading = await page.getByRole('heading').first().innerText().catch(() => '');
      throw new Error(
        `Interactive sign-in did not complete. Current page heading: "${heading}". ` +
          `Messages: ${JSON.stringify(banner)}. ` +
          `If this is MFA or a password prompt, run the first login headed:\n` +
          `  npx playwright test auth.setup.ts --project=setup --headed`,
      );
    }
  }

  // System selection page ("กรุณาเลือกระบบ") — systems are links.
  const systemLink = page
    .getByRole('link', { name: new RegExp(escapeRegExp(system), 'i') })
    .or(page.getByRole('button', { name: new RegExp(escapeRegExp(system), 'i') }))
    .first();
  if (await systemLink.isVisible({ timeout: 15_000 }).catch(() => false)) {
    await systemLink.click();
  }

  await page.waitForURL(/\/love-care(\/|$)/, { timeout: 30_000 });
}

/** Navigate directly to the company list (must already be signed in). */
export async function gotoCompanies(page: Page): Promise<void> {
  await page.goto('/love-care/setting/companies');
  await expect(page.getByRole('heading', { name: 'รายการบริษัท' })).toBeVisible({
    timeout: 30_000,
  });
}

/** Navigate directly to the branch list (must already be signed in). */
export async function gotoBranches(page: Page): Promise<void> {
  await page.goto('/love-care/setting/branches');
  await expect(page.getByRole('heading', { name: 'รายการสาขา' })).toBeVisible({
    timeout: 30_000,
  });
}

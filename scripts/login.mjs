/**
 * Manual login helper.
 *
 * Opens a real browser window at the Dev URL and lets YOU sign in by hand
 * (type the password, complete MFA if asked). As soon as you reach the
 * "กรุณาเลือกระบบ" service picker (or the Love & Care app), it saves the
 * session to playwright/.auth/user.json so the automated tests can reuse it
 * without logging in again.
 *
 * Usage:
 *   npm run login
 */
import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(root, '.env') });

const STORAGE_STATE = path.join(root, 'playwright/.auth/user.json');
const BASE_URL = process.env.BASE_URL || 'https://salesportal-dev.lion.co.th/';

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

console.log(`\nOpening ${BASE_URL}`);
console.log('👉 Please sign in manually in the browser window (password + MFA if asked).');
console.log('   Waiting until you reach the service picker / the app...\n');

await page.goto(BASE_URL);

// Wait (up to 5 min) until the user has signed in and is back on the app host,
// i.e. off the ciamlogin sign-in host.
await page.waitForURL(
  (url) =>
    /salesportal-dev\.lion\.co\.th\/(service-picker|love-care)/.test(url.href) ||
    (/salesportal-dev\.lion\.co\.th/.test(url.href) && !/ciamlogin\.com/.test(url.href)),
  { timeout: 300_000 },
);

fs.mkdirSync(path.dirname(STORAGE_STATE), { recursive: true });
await context.storageState({ path: STORAGE_STATE });
console.log(`\n✅ Signed in. Session saved to ${path.relative(root, STORAGE_STATE)}`);
console.log('   You can close nothing — this window will close automatically.\n');

await browser.close();

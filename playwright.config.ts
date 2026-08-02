import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

/**
 * Read environment variables from `.env`.
 * See `.env.example` for the expected keys.
 */
dotenv.config({ path: path.resolve(__dirname, '.env') });

/** Path where the authenticated Microsoft session (storageState) is cached. */
export const STORAGE_STATE = path.resolve(__dirname, 'playwright/.auth/user.json');

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL,
    /* Collect trace when retrying the failed test. */
    trace: 'on-first-retry',
    /* Capture screenshot on failure. */
    screenshot: 'only-on-failure',
  },

  projects: [
    /* Logs in via Microsoft once and stores the session for the other projects.
     * Reuses the previously cached session if it still exists, so it only has
     * to actually log in again when the token has expired. */
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        storageState: fs.existsSync(STORAGE_STATE) ? STORAGE_STATE : undefined,
      },
    },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        /* Reuse the authenticated Microsoft session captured by `setup`. */
        storageState: STORAGE_STATE,
      },
      dependencies: ['setup'],
    },
  ],
});

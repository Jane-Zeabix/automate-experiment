import { test as base, expect } from '@playwright/test';
import { signIn } from './helpers/app';

/**
 * Extended `test` whose `page` is already signed in and inside the Love & Care
 * app. Import { test, expect } from this file instead of '@playwright/test'.
 *
 * Sign-in happens once per test because the app keeps its token in
 * sessionStorage (not carried by storageState). The cached SSO cookies from
 * the `setup` project mean this costs an account-pick click, not a password.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await signIn(page);
    await use(page);
  },
});

export { expect };

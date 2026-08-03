# Automate Experiment

Playwright-based end-to-end test automation project.

This repo is an experiment/workspace for building automated E2E tests with
[Playwright](https://playwright.dev/). The longer-term goal is to convert manual
test cases (documented in an external spreadsheet) into runnable Playwright tests.

> Note: the source test-case spreadsheet (`*.xlsx`) is intentionally excluded from
> git via `.gitignore` because of its large size.

## Tech stack

- [Playwright Test](https://playwright.dev/docs/test-intro) (`@playwright/test`)
- TypeScript
- Node.js

## Getting started

Install dependencies and browsers:

```bash
npm install
npx playwright install
```

Then create your local env file from the template and fill in credentials:

```bash
cp .env.example .env
```

`.env` (gitignored) holds the target environment and Microsoft credentials:

| Key             | Meaning                                              |
| --------------- | ---------------------------------------------------- |
| `BASE_URL`      | App URL (Dev: `https://salesportal-dev.lion.co.th/`) |
| `LION_USERNAME` | Microsoft (Azure AD) email                           |
| `LION_PASSWORD` | Microsoft password                                   |
| `LION_SYSTEM`   | System to select after login (e.g. `Love & Care`)    |

## Authentication

The app uses **Microsoft Entra External ID (CIAM)** — the sign-in page is on
`lionexternal.ciamlogin.com`, and after login a "กรุณาเลือกระบบ" page lets you
pick the **Love & Care** system. The shared helper `signIn()`
(`tests/helpers/app.ts`) drives that whole flow, and the `fixtures.ts` `test`
runs it automatically before each test.

**You don't type your password every run.** The `setup` project logs in once
and caches the persistent SSO cookies to `playwright/.auth/user.json`. After
that, each run only needs a one-click "Pick an account" (no password). Setup
re-authenticates only when there's no cache yet or it's older than
`MAX_SESSION_AGE_HOURS` (default 12h — tune it in `tests/auth.setup.ts`). To
force a fresh login, delete `playwright/.auth/`.

> The app keeps its access token in `sessionStorage` (which Playwright's
> `storageState` does not persist) and always requests `prompt=select_account`,
> so each browser context still does one account-pick — hence sign-in runs
> per test via the fixture, but without a password.

If the account has **MFA**, run the first login headed so you can complete the
challenge manually — the cached session is reused afterwards:

```bash
npx playwright test auth.setup.ts --project=setup --headed
```

## Running tests

```bash
# Run all tests (runs the auth setup first automatically)
npx playwright test

# Run a single feature
npx playwright test company.spec.ts
npx playwright test branch.spec.ts

# Interactive UI mode
npx playwright test --ui

# Show the HTML report from the last run
npx playwright show-report
```

## Project structure

```
.
├── tests/
│   ├── auth.setup.ts       # CIAM login once → cached SSO cookies
│   ├── fixtures.ts         # `test` that auto-signs-in before each test
│   ├── helpers/
│   │   └── app.ts          # signIn() + gotoCompanies()/gotoBranches()
│   ├── company.spec.ts     # จัดการบริษัท (UC8.3) — LSP-SC-TC-FT-*
│   ├── branch.spec.ts      # จัดการสาขา (UC8.4)   — LSP-SR-TC-FT-*
│   └── pages/              # Page Objects
│       ├── CompanyPage.ts  # /love-care/setting/companies
│       └── BranchPage.ts   # /love-care/setting/branches
├── playwright.config.ts    # Config: baseURL, dotenv, setup + chromium projects
├── .env.example            # Template for .env (real .env is gitignored)
└── package.json
```

> The current specs are **templates** covering a representative subset of the
> บริษัท (53) and สาขา (38) test cases, wired to the real Dev DOM (routes,
> headers, search box, buttons). Extend them to the full case list following
> the same pattern.

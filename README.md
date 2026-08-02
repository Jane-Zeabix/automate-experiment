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

The app redirects to Microsoft sign-in (`login.microsoftonline.com`). A
dedicated `setup` project (`tests/auth.setup.ts`) logs in once, picks the
system on the "กรุณาเลือกระบบ" page, and caches the session to
`playwright/.auth/user.json`. All other tests reuse that session.

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
│   ├── auth.setup.ts       # Microsoft login → cached storageState
│   ├── company.spec.ts     # จัดการบริษัท (UC8.3) — LSP-SC-TC-FT-*
│   ├── branch.spec.ts      # จัดการสาขา (UC8.4)   — LSP-SR-TC-FT-*
│   └── pages/              # Page Objects
│       ├── CompanyPage.ts
│       └── BranchPage.ts
├── playwright.config.ts    # Config: baseURL, dotenv, setup + chromium projects
├── .env.example            # Template for .env (real .env is gitignored)
└── package.json
```

> The current specs are **templates** covering a representative subset of the
> บริษัท (53) and สาขา (38) test cases. Selectors are best-effort from the Thai
> UI labels in the source document — refine them against the real Dev DOM
> (prefer `data-testid` where available), then extend to the full case list.

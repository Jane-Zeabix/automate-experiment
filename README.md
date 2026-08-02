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

## Running tests

```bash
# Run all tests
npx playwright test

# Run in interactive UI mode
npx playwright test --ui

# Show the HTML report from the last run
npx playwright show-report
```

## Project structure

```
.
├── tests/                # Test specs
│   └── example.spec.ts   # Starter example test
├── playwright.config.ts  # Playwright configuration
└── package.json
```

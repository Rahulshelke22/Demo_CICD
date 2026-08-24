# Demo Web Shop — Playwright + TypeScript Automation Framework

Automation framework for [https://demowebshop.tricentis.com](https://demowebshop.tricentis.com) using
Playwright + TypeScript with the Page Object Model, plus a separate API test suite.

## What's covered

**UI (Page Object Model)** — `tests/ui/`
- `login.spec.ts` — successful login, invalid credentials, empty fields, logout
- `register.spec.ts` — successful registration, password mismatch, invalid email, blank fields, duplicate email
- `search.spec.ts` — valid keyword search, no-results case, search from any page, result count sanity check
- `addToCart.spec.ts` — add single product, verify in cart page, add multiple products, remove from cart

**API** — `tests/api/`
- `products-api.spec.ts` — GET list, GET by id, GET invalid id, GET categories, POST cart, DELETE product

> Demo Web Shop itself is a server-rendered site with no public JSON API, so the API suite runs
> against a public REST API (fakestoreapi.com) under a separate Playwright **project** (`api`) in
> `playwright.config.ts`. This keeps the same framework, config, reporting, and CI pipeline
> demonstrating both UI and API testing side by side. Point `API_BASE_URL` at your own service
> when you have a real one to test.

## Project structure

```
├── pages/                  # Page Object Model classes
│   ├── BasePage.ts
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   ├── HomePage.ts
│   ├── SearchPage.ts
│   ├── ProductPage.ts
│   └── CartPage.ts
├── tests/
│   ├── ui/                 # Browser-driven tests (chromium/firefox/webkit/mobile)
│   └── api/                 # API tests (no browser)
├── utils/
│   └── test-data.ts         # Random user/email generators
├── .github/workflows/
│   └── playwright-windows.yml
├── playwright.config.ts
├── tsconfig.json
└── package.json
```

## Setup

```bash
npm install
npx playwright install --with-deps
cp .env.example .env    # adjust values if needed
```

## Running tests

```bash
npm test                    # everything (all UI browsers + API)
npm run test:ui             # UI tests only, all browsers
npm run test:api            # API tests only
npm run test:chromium       # UI tests, Chromium only
npm run test:headed         # UI tests with a visible browser
npm run test:ui-mode        # Playwright's interactive UI mode
npm run report               # open the last HTML report
```

Run a single spec file:
```bash
npx playwright test tests/ui/login.spec.ts
```

## CI/CD

`.github/workflows/playwright-windows.yml` runs on **`windows-latest`** GitHub-hosted runners:
- A matrix job runs UI tests across chromium/firefox/webkit in parallel
- A separate job runs the API suite
- Playwright browsers are cached between runs (keyed on `@playwright/test` version) to speed up CI
- HTML and JUnit reports are uploaded as build artifacts on every run (pass or fail)
- Triggers on push/PR to `main`/`master`/`develop`, and supports manual runs via
  **Actions → Playwright Tests (Windows) → Run workflow**, where you can pick a single project

To wire it up:
1. Push this repo to GitHub.
2. (Optional) Add repository secrets `BASE_URL` and `API_BASE_URL` under
   **Settings → Secrets and variables → Actions** if you want to override the defaults.
3. Push to `main`/`master`/`develop` or open a PR — the workflow runs automatically.

## Notes on the Add-to-Cart tests

Rather than hardcoding a specific product URL slug (which can drift if the demo catalog changes),
the add-to-cart tests act on category **listing pages** (`/books`, `/computers`) and click the first
available "Add to cart" button there — this keeps the tests resilient to catalog content changes.

## Notes on Login/Register tests

Demo Web Shop has no stable seeded login account, so `login.spec.ts` registers a fresh throwaway
user via the UI first, then logs in with those same credentials — making the test fully
self-contained and safe to re-run. `utils/test-data.ts` generates unique emails per run so repeat
runs never collide with previous test data.

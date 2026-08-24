import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Central config for both UI tests (against Demo Web Shop) and
 * API tests (against a REST API, run via the `api` project below).
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: process.env.CI
    ? [['html', { open: 'never' }], ['github'], ['list'], ['junit', { outputFile: 'test-results/junit.xml' }]]
    : [['html'], ['list']],

  use: {
    baseURL: process.env.BASE_URL || 'https://demowebshop.tricentis.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
    ignoreHTTPSErrors: true,
  },

  projects: [
    // ---------- UI test projects ----------
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   testDir: './tests/ui',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   testDir: './tests/ui',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'Mobile Chrome',
    //   testDir: './tests/ui',
    //   use: { ...devices['Pixel 5'] },
    // },

    // ---------- API test project (no browser needed) ----------
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.API_BASE_URL || 'https://fakestoreapi.com',
      },
    },
  ],
});

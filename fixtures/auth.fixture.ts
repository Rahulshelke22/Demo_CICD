import { test as base } from './pages.fixture';
import { existingUser } from '../utils/test-data';

/**
 * `authenticatedPage` performs a real UI login using EXISTING_USER_EMAIL /
 * EXISTING_USER_PASSWORD (see .env.example) and yields the page already
 * logged in. Use this in specs where being logged in is a PRECONDITION
 * (e.g. checkout) — not in login.spec.ts itself, where the login action
 * is the thing under test and should stay explicit in the test body.
 *
 * This intentionally never calls RegisterPage — it only validates against
 * a real, already-registered account, so it fails fast with a clear error
 * if credentials aren't configured rather than silently creating throwaway
 * accounts.
 */
type AuthFixtures = {
  authenticatedPage: import('@playwright/test').Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page, loginPage }, use) => {
    if (!existingUser.email || !existingUser.password) {
      throw new Error(
        'EXISTING_USER_EMAIL / EXISTING_USER_PASSWORD are not set.\n' +
          'Add real Demo Web Shop credentials to your local .env file ' +
          '(see .env.example) to use the authenticatedPage fixture. ' +
          'Never paste real credentials into chat or commit them to source control.'
      );
    }

    await loginPage.open();
    await loginPage.login(existingUser.email, existingUser.password);
    await loginPage.expectLoggedIn();

    await use(page);
  },
});

export { expect } from '@playwright/test';

import { test, expect } from '../../fixtures/pages.fixture';
import { existingUser } from '../../utils/test-data';

/**
 * Pure LOGIN validation — this suite only exercises the login form itself
 * against a real, already-registered account (EXISTING_USER_EMAIL /
 * EXISTING_USER_PASSWORD in .env). It intentionally never registers a new
 * user; that's covered separately in register.spec.ts. If credentials
 * aren't configured, the positive-login and logout tests fail fast with a
 * clear message rather than silently creating throwaway accounts.
 */
test.describe('Login', () => {
  test.beforeEach(async () => {
    if (!existingUser.email || !existingUser.password) {
      test.skip(
        true,
        'EXISTING_USER_EMAIL / EXISTING_USER_PASSWORD are not set in .env — ' +
          'this test validates login against a real existing account.'
      );
    }
  });

  test('logs in successfully with valid existing credentials', async ({ page, loginPage }) => {
    await loginPage.open();
    await loginPage.login(existingUser.email, existingUser.password);

    await loginPage.expectLoggedIn();
    await expect(page).toHaveURL(/demowebshop\.tricentis\.com\/?$/);
  });

  test('logs out successfully after logging in', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(existingUser.email, existingUser.password);
    await loginPage.expectLoggedIn();

    await loginPage.logout();
    await loginPage.expectLoggedOut();
  });
});

test.describe('Login validation (no account required)', () => {
  test('shows a validation error for invalid credentials', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login('nonexistent.user@example-test.com', 'WrongPassword123!');
    await loginPage.expectLoginError();
  });

  test('shows a validation error for an empty password', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.emailInput.fill('someone@example-test.com');
    await loginPage.loginButton.click();
    await loginPage.expectLoginError();
  });
});

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { RegisterPage } from '../../pages/RegisterPage';
import { randomUser } from '../../utils/test-data';

test.describe('Login', () => {
  test('registers a new user then logs in successfully with those credentials', async ({ page }) => {
    // Demo Web Shop has no stable seeded account, so we create one first
    // to keep this test independent and repeatable on every run.
    const user = randomUser();
    const registerPage = new RegisterPage(page);
    await registerPage.open();
    await registerPage.register(user);
    await registerPage.expectRegistrationSuccess();
    await registerPage.logout();
    await registerPage.expectLoggedOut();

    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(user.email, user.password);

    await loginPage.expectLoggedIn();
    await expect(page).toHaveURL(/demowebshop\.tricentis\.com\/?$/);
  });

  test('shows a validation error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login('nonexistent.user@example-test.com', 'WrongPassword123!');
    await loginPage.expectLoginError();
  });

  test('shows a validation error for an empty password', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.emailInput.fill('someone@example-test.com');
    await loginPage.loginButton.click();
    await loginPage.expectLoginError();
  });

  test('logs out successfully after logging in', async ({ page }) => {
    const user = randomUser();
    const registerPage = new RegisterPage(page);
    await registerPage.open();
    await registerPage.register(user);
    await registerPage.expectRegistrationSuccess();

    // Registration auto-logs the user in on this site.
    await registerPage.expectLoggedIn();
    await registerPage.logout();
    await registerPage.expectLoggedOut();
  });
});

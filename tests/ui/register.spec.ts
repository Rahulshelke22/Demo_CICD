import { test, expect } from '@playwright/test';
import { RegisterPage } from '../../pages/RegisterPage';
import { randomUser, randomEmail } from '../../utils/test-data';

test.describe('Registration', () => {
  test('registers a new user successfully with valid details', async ({ page }) => {
    const user = randomUser();
    const registerPage = new RegisterPage(page);

    await registerPage.open();
    await registerPage.register({ ...user, gender: 'M' });

    await registerPage.expectRegistrationSuccess();
    await registerPage.expectLoggedIn();
  });

  test('rejects registration when passwords do not match', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    const email = randomEmail();

    await registerPage.open();
    await registerPage.firstNameInput.fill('Jane');
    await registerPage.lastNameInput.fill('Doe');
    await registerPage.emailInput.fill(email);
    await registerPage.passwordInput.fill('Password123!');
    await registerPage.confirmPasswordInput.fill('DifferentPassword123!');
    await registerPage.registerButton.click();

    await registerPage.expectValidationError();
  });

  test('rejects registration with an invalid email format', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.open();
    await registerPage.firstNameInput.fill('Jane');
    await registerPage.lastNameInput.fill('Doe');
    await registerPage.emailInput.fill('not-a-valid-email');
    await registerPage.passwordInput.fill('Password123!');
    await registerPage.confirmPasswordInput.fill('Password123!');
    await registerPage.registerButton.click();

    await registerPage.expectValidationError();
  });

  test('rejects registration with required fields left blank', async ({ page }) => {
    const registerPage = new RegisterPage(page);

    await registerPage.open();
    await registerPage.registerButton.click();

    await registerPage.expectValidationError();
  });

  test('does not allow registering the same email twice', async ({ page }) => {
    const user = randomUser();
    const registerPage = new RegisterPage(page);

    await registerPage.open();
    await registerPage.register(user);
    await registerPage.expectRegistrationSuccess();
    await registerPage.logout();

    // Attempt to register again with the same email
    await registerPage.open();
    await registerPage.register(user);
    await registerPage.expectValidationError();
  });
});

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface NewUser {
  gender?: 'M' | 'F';
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export class RegisterPage extends BasePage {
  readonly genderMaleRadio: Locator;
  readonly genderFemaleRadio: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly registerButton: Locator;
  readonly registerResultMessage: Locator;
  readonly validationSummary: Locator;

  constructor(page: Page) {
    super(page);
    this.genderMaleRadio = page.locator('#gender-male');
    this.genderFemaleRadio = page.locator('#gender-female');
    this.firstNameInput = page.locator('#FirstName');
    this.lastNameInput = page.locator('#LastName');
    this.emailInput = page.locator('#Email');
    this.passwordInput = page.locator('#Password');
    this.confirmPasswordInput = page.locator('#ConfirmPassword');
    this.registerButton = page.locator('#register-button');
    this.registerResultMessage = page.locator('.result');
    // The register form uses client-side jQuery Unobtrusive Validation for
    // password-mismatch, invalid-email-format, and blank-required-field cases —
    // those never hit the server, so only inline .field-validation-error spans
    // appear (no .validation-summary-errors, which is server-rendered and only
    // shows up for checks the server itself performs, e.g. duplicate email).
    this.validationSummary = page.locator('.validation-summary-errors, .field-validation-error').first();
  }

  async open() {
    await this.goto('/register');
  }

  async register(user: NewUser) {
    if (user.gender === 'F') {
      await this.genderFemaleRadio.check();
    } else if (user.gender === 'M') {
      await this.genderMaleRadio.check();
    }
    await this.firstNameInput.fill(user.firstName);
    await this.lastNameInput.fill(user.lastName);
    await this.emailInput.fill(user.email);
    await this.passwordInput.fill(user.password);
    await this.confirmPasswordInput.fill(user.password);
    await this.registerButton.click();
  }

  async expectRegistrationSuccess() {
    await expect(this.registerResultMessage).toContainText('Your registration completed');
  }

  async expectValidationError() {
    await expect(this.validationSummary).toBeVisible();
  }
}

import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly loginButton: Locator;
  readonly validationSummary: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#Email');
    this.passwordInput = page.locator('#Password');
    this.rememberMeCheckbox = page.locator('#RememberMe');
    this.loginButton = page.locator('input.button-1.login-button');
    this.validationSummary = page.locator('.message-error, .validation-summary-errors');
  }

  async open() {
    await this.goto('/login');
  }

  async login(email: string, password: string, rememberMe = false) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }
    await this.loginButton.click();
  }

  async expectLoginError() {
    await expect(this.validationSummary).toBeVisible();
  }
}

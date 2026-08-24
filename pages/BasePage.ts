import { Page, Locator, expect } from '@playwright/test';

/**
 * BasePage holds elements/actions common to every page of the shop:
 * the header nav (login/register/logout links), search box, and cart quantity.
 */
export class BasePage {
  readonly page: Page;

  readonly loginLink: Locator;
  readonly registerLink: Locator;
  readonly logoutLink: Locator;
  readonly myAccountLink: Locator;
  readonly searchBox: Locator;
  readonly searchButton: Locator;
  readonly cartQuantityLabel: Locator;
  readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginLink = page.locator('.ico-login');
    this.registerLink = page.locator('.ico-register');
    this.logoutLink = page.locator('.ico-logout');
    this.myAccountLink = page.locator('.account');
    this.searchBox = page.locator('#small-searchterms');
    this.searchButton = page.locator('.search-box-button');
    this.cartQuantityLabel = page.locator('.cart-qty');
    this.cartLink = page.locator('.ico-cart');
  }

  async goto(path = '/') {
    await this.page.goto(path);
  }

  async search(term: string) {
    await this.searchBox.fill(term);
    await this.searchButton.click();
  }

  async goToCart() {
    await this.cartLink.click();
  }

  async isLoggedIn(): Promise<boolean> {
    return this.logoutLink.isVisible();
  }

  async expectLoggedIn() {
    await expect(this.logoutLink).toBeVisible();
  }

  async expectLoggedOut() {
    await expect(this.loginLink).toBeVisible();
  }

  async logout() {
    await this.logoutLink.click();
  }
}

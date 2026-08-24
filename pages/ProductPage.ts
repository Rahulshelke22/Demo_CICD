import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class ProductPage extends BasePage {
  readonly productTitle: Locator;
  readonly quantityInput: Locator;
  readonly addToCartButton: Locator;
  readonly barNotification: Locator;

  constructor(page: Page) {
    super(page);
    this.productTitle = page.locator('.product-name h1');
    this.quantityInput = page.locator('.qty-input, #product_enteredQuantity_1');
    this.addToCartButton = page.locator('button[id^="add-to-cart-button-"]');
    // The "Product has been added to your cart" toast/banner
    this.barNotification = page.locator('#bar-notification.success');
  }

  async open(productSlug: string) {
    await this.goto(`/${productSlug}`);
  }

  async setQuantity(qty: number) {
    await this.quantityInput.fill(String(qty));
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  async expectAddedToCartNotification() {
    await expect(this.barNotification).toBeVisible({ timeout: 10000 });
    await expect(this.barNotification).toContainText('has been added to your shopping cart');
  }
}

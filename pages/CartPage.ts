import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly cartRows: Locator;
  readonly termsCheckbox: Locator;
  readonly checkoutButton: Locator;
  readonly emptyCartMessage: Locator;
  readonly updateCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartRows = page.locator('.cart-item-row');
    this.termsCheckbox = page.locator('#termsofservice');
    this.checkoutButton = page.locator('#checkout');
    this.emptyCartMessage = page.getByText('Your Shopping Cart is empty!');
    this.updateCartButton = page.locator('input[name="updatecart"]');
  }

  async open() {
    await this.goto('/cart');
  }

  async expectItemCount(count: number) {
    await expect(this.cartRows).toHaveCount(count);
  }

  async removeItem(rowIndex: number) {
    const row = this.cartRows.nth(rowIndex);
    await row.locator('.remove-from-cart input[type="checkbox"]').check();
    await this.updateCartButton.click();
  }

  itemNameInRow(rowIndex: number): Locator {
    return this.cartRows.nth(rowIndex).locator('.product-name');
  }
}

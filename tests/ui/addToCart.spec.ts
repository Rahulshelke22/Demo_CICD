import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { CartPage } from '../../pages/CartPage';

/**
 * These tests add products from category LISTING pages (rather than
 * hardcoding a specific product URL slug), which keeps them resilient
 * to catalog changes on the demo site.
 */
test.describe('Add to cart', () => {
  test('adds a single product from the Books category and updates the mini-cart count', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.openCategory('books');

    await expect(homePage.cartQuantityLabel).toHaveText('(0)');

    await homePage.addToCartButtons.first().click();
    await expect(page.locator('#bar-notification.success')).toBeVisible({ timeout: 10000 });

    await expect(homePage.cartQuantityLabel).toHaveText('(1)');
  });

  test('adds a product from Computers and verifies it appears in the cart page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.openCategory('computers');

    const firstProductName = await homePage.featuredProducts.first().locator('h2.product-title, .product-title').innerText();
    await homePage.addToCartButtons.first().click();
    await expect(page.locator('#bar-notification.success')).toBeVisible({ timeout: 10000 });

    const cartPage = new CartPage(page);
    await cartPage.open();
    await cartPage.expectItemCount(1);
    await expect(cartPage.itemNameInRow(0)).toContainText(firstProductName.trim());
  });

  test('adding two different products results in two cart line items', async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.openCategory('books');
    await homePage.addToCartButtons.first().click();
    await expect(page.locator('#bar-notification.success')).toBeVisible({ timeout: 10000 });

    await homePage.openCategory('computers');
    await homePage.addToCartButtons.first().click();
    await expect(page.locator('#bar-notification.success')).toBeVisible({ timeout: 10000 });

    const cartPage = new CartPage(page);
    await cartPage.open();
    await cartPage.expectItemCount(2);
  });

  test('removing an item from the cart empties it', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.openCategory('books');
    await homePage.addToCartButtons.first().click();
    await expect(page.locator('#bar-notification.success')).toBeVisible({ timeout: 10000 });

    const cartPage = new CartPage(page);
    await cartPage.open();
    await cartPage.expectItemCount(1);

    await cartPage.removeItem(0);
    await expect(cartPage.emptyCartMessage).toBeVisible();
  });
});

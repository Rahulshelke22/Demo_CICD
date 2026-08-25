import { test, expect } from '../../fixtures/auth.fixture';
import { existingUser, randomBillingDetails } from '../../utils/test-data';

/**
 * End-to-end checkout: log in (real existing account, via the
 * `authenticatedPage` fixture -- no registration involved) -> add product
 * to cart -> Checkout button -> billing address -> shipping address ->
 * shipping method -> payment method (Check/Money Order, no live payment
 * gateway needed) -> payment info -> confirm order -> "order successfully
 * processed" message.
 */
test.describe('Checkout', () => {
  test.beforeEach(async () => {
    if (!existingUser.email || !existingUser.password) {
      test.skip(
        true,
        'EXISTING_USER_EMAIL / EXISTING_USER_PASSWORD are not set in .env — ' +
          'checkout requires a logged-in real account.'
      );
    }
  });

  test('completes checkout from the cart through to the order confirmation message', async ({
    authenticatedPage: page,
    homePage,
    cartPage,
    checkoutPage,
  }) => {
    // authenticatedPage fixture has already logged in by this point.

    // 1. Start from a known-empty cart. This account is a REAL, persistent
    // account (not a throwaway), so previous test runs may have left items
    // in it -- clear them first rather than assuming an empty cart.
    await cartPage.clearCart();

    // 2. Add a product to the cart.
    await homePage.openCategory('books');
    await homePage.addToCartButtons.first().click();
    await expect(page.locator('#bar-notification.success')).toBeVisible({ timeout: 10000 });

    // 3. Go to cart, accept terms, click Checkout.
    await cartPage.open();
    await cartPage.expectItemCount(1);
    await cartPage.proceedToCheckout();

    // 4. Run the full multi-step checkout wizard through to confirmation.
    const billingDetails = randomBillingDetails(existingUser.email);
    await checkoutPage.completeCheckout(billingDetails);

    // 5. Final assertion: order confirmation message is visible.
    await checkoutPage.expectOrderConfirmed();
  });
});

test.describe('Checkout (no account required)', () => {
  test('checkout is blocked with an empty cart (Checkout button not reachable)', async ({ cartPage }) => {
    await cartPage.open();
    await cartPage.expectItemCount(0);
    await expect(cartPage.emptyCartMessage).toBeVisible();
  });
});

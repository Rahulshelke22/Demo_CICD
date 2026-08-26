import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface BillingDetails {
  firstName: string;
  lastName: string;
  email: string;
  country: string;   // visible option text, e.g. 'United States'
  city: string;
  address1: string;
  zipPostalCode: string;
  phoneNumber: string;
}

/**
 * Demo Web Shop uses NopCommerce's classic multi-step checkout wizard
 * (not the "one page checkout" option), so each step is its own panel
 * that expands after the previous step's "Continue" button is clicked.
 */
export class CheckoutPage extends BasePage {
  // Guest checkout interstitial (only appears if not logged in)
  readonly checkoutAsGuestButton: Locator;

  // Step 1: Billing Address
  readonly billingAddressDropdown: Locator;
  readonly billingFirstName: Locator;
  readonly billingLastName: Locator;
  readonly billingEmail: Locator;
  readonly billingCountry: Locator;
  readonly billingCity: Locator;
  readonly billingAddress1: Locator;
  readonly billingZipPostalCode: Locator;
  readonly billingPhoneNumber: Locator;
  readonly billingContinueButton: Locator;

  // Step 2: Shipping Address
  readonly shipToSameAddressCheckbox: Locator;
  readonly shippingContinueButton: Locator;

  // Step 3: Shipping Method
  readonly shippingMethodRadios: Locator;
  readonly shippingMethodContinueButton: Locator;

  // Step 4: Payment Method
  readonly paymentMethodRadios: Locator;
  readonly paymentMethodContinueButton: Locator;

  // Step 5: Payment Information (fields vary by method; Check/Money Order has none)
  readonly paymentInfoContinueButton: Locator;

  // Step 6: Confirm Order
  readonly confirmOrderButton: Locator;

  // Step 7: Order Completed
  readonly orderCompletedTitle: Locator;
  readonly orderNumberText: Locator;
  readonly orderCompletedContinueButton: Locator;

  constructor(page: Page) {
    super(page);

    this.checkoutAsGuestButton = page.locator('#checkout-as-guest-button');

    this.billingAddressDropdown = page.locator('#billing-address-select');
    this.billingFirstName = page.locator('#BillingNewAddress_FirstName');
    this.billingLastName = page.locator('#BillingNewAddress_LastName');
    this.billingEmail = page.locator('#BillingNewAddress_Email');
    this.billingCountry = page.locator('#BillingNewAddress_CountryId');
    this.billingCity = page.locator('#BillingNewAddress_City');
    this.billingAddress1 = page.locator('#BillingNewAddress_Address1');
    this.billingZipPostalCode = page.locator('#BillingNewAddress_ZipPostalCode');
    this.billingPhoneNumber = page.locator('#BillingNewAddress_PhoneNumber');
    this.billingContinueButton = page.locator('#billing-buttons-container input.new-address-next-step-button');

    this.shipToSameAddressCheckbox = page.locator('#ShipToSameAddress');
    this.shippingContinueButton = page.locator('#shipping-buttons-container input.new-address-next-step-button');

    this.shippingMethodRadios = page.locator('input[name="shippingoption"]');
    this.shippingMethodContinueButton = page.locator('.shipping-method-next-step-button');

    this.paymentMethodRadios = page.locator('input[name="paymentmethod"]');
    this.paymentMethodContinueButton = page.locator('.payment-method-next-step-button');

    this.paymentInfoContinueButton = page.locator('.payment-info-next-step-button');

    this.confirmOrderButton = page.locator('.confirm-order-next-step-button');

    this.orderCompletedTitle = page.locator('.order-completed .title');
    this.orderNumberText = page.locator('.order-completed .details a, .order-completed .order-number');
    this.orderCompletedContinueButton = page.locator('.order-completed-continue-button');
  }

  /** Only appears if the user is not logged in; skip calling this for logged-in flows. */
  async continueAsGuest() {
    await this.checkoutAsGuestButton.click();
  }

  async fillNewBillingAddress(details: BillingDetails) {
    // If the account already has a saved address (e.g. from an earlier
    // successful checkout run, or from manual registration), NopCommerce
    // pre-selects that saved address in this dropdown -- which hides the
    // blank "new address" fields below it. Rather than fighting to reveal
    // those hidden fields (which proved unreliable), just USE the already-
    // selected existing address: the server uses whatever the dropdown
    // points to on submit regardless of what's typed into the hidden
    // fields, so there's nothing to gain by forcing them visible.
    // This site's one-page checkout loads the billing step's HTML --
    // including this dropdown, when the account has a saved address --
    // via an AJAX call that fires AFTER the page navigates here. It is
    // NOT present in the initial page HTML. A synchronous count() check
    // run immediately after navigation can return 0 in the brief window
    // before that AJAX call resolves, sending us straight to the
    // "fill new address" path below -- whose fields then stay hidden
    // forever (because a saved address really is selected once the AJAX
    // content lands), causing a .fill() timeout. Waiting for the dropdown
    // to ATTACH (not just checking count() once) avoids the race.
    const dropdownAppeared = await this.billingAddressDropdown
      .waitFor({ state: 'attached', timeout: 8000 })
      .then(() => true)
      .catch(() => false);

    if (dropdownAppeared) {
      const selectedValue = await this.billingAddressDropdown.inputValue().catch(() => '');
      if (selectedValue && selectedValue.trim() !== '') {
        // An existing saved address is selected -- proceed with it as-is.
        return;
      }
      // Dropdown present but "New Address" (empty value) is already
      // selected -- fall through and fill the new-address fields below,
      // which should already be visible in this case.
    }

    await this.billingFirstName.waitFor({ state: 'visible', timeout: 8000 });
    await this.billingFirstName.fill(details.firstName);
    await this.billingLastName.fill(details.lastName);
    await this.billingEmail.fill(details.email);
    await this.billingCountry.selectOption({ label: details.country });
    await this.billingCity.fill(details.city);
    await this.billingAddress1.fill(details.address1);
    await this.billingZipPostalCode.fill(details.zipPostalCode);
    await this.billingPhoneNumber.fill(details.phoneNumber);
  }

  async continueFromBilling() {
    await this.billingContinueButton.click();
  }

  async continueFromShipping() {
    // "Ship to the same address" is checked by default on a fresh billing
    // submission, so usually just clicking Continue is enough.
    if (await this.shipToSameAddressCheckbox.isVisible().catch(() => false)) {
      const isChecked = await this.shipToSameAddressCheckbox.isChecked().catch(() => true);
      if (!isChecked) {
        await this.shipToSameAddressCheckbox.check();
      }
    }
    await this.shippingContinueButton.click();
  }

  async selectShippingMethod(index = 0) {
    await this.shippingMethodRadios.nth(index).check();
    await this.shippingMethodContinueButton.click();
  }

  async selectPaymentMethod(value: 'CheckMoneyOrder' | 'Manual' | 'CashOnDelivery' | 'PurchaseOrder' = 'CheckMoneyOrder') {
    // paymentMethodRadios ("input[name=\"paymentmethod\"]") already resolves
    // to the <input> elements themselves -- leaf nodes with no children.
    // Chaining .locator('[value*="..."]') onto it searches INSIDE each
    // matched input for a descendant, which can never exist, so this
    // always resolved to 0 elements, burned the full action timeout
    // retrying, then silently fell back to whichever radio is first in
    // the DOM (Cash On Delivery here) instead of the intended method.
    // Live values confirmed on the site: "Payments.CashOnDelivery",
    // "Payments.CheckMoneyOrder", "Payments.Manual", "Payments.PurchaseOrder".
    const radio = this.page.locator(`input[name="paymentmethod"][value*="${value}"]`);
    await radio.waitFor({ state: 'visible', timeout: 8000 });
    await radio.check();
    await this.paymentMethodContinueButton.click();
  }

  async continueFromPaymentInfo() {
    await this.paymentInfoContinueButton.click();
  }

  async confirmOrder() {
    await this.confirmOrderButton.click();
  }

  async expectOrderConfirmed() {
    await expect(this.orderCompletedTitle).toBeVisible({ timeout: 15000 });
    await expect(this.orderCompletedTitle).toContainText('Your order has been successfully processed!');
  }

  /**
   * Runs the entire checkout wizard end to end using the given billing
   * details, Check/Money Order as payment, and the first available
   * shipping method. Assumes the cart's "Checkout" button was already
   * clicked and, if applicable, guest checkout was already handled.
   */
  async completeCheckout(details: BillingDetails) {
    await this.fillNewBillingAddress(details);
    await this.continueFromBilling();
    await this.continueFromShipping();
    await this.selectShippingMethod(0);
    await this.selectPaymentMethod('CheckMoneyOrder');
    await this.continueFromPaymentInfo();
    await this.confirmOrder();
    await this.expectOrderConfirmed();
  }
}
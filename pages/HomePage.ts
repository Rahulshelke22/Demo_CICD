import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  readonly booksCategoryLink: Locator;
  readonly computersCategoryLink: Locator;
  readonly electronicsCategoryLink: Locator;
  readonly featuredProducts: Locator;
  readonly addToCartButtons: Locator;
  readonly digitalDownloadsCategoryLink: Locator;
  readonly jewelryCategoryLink:Locator
  readonly giftcardsCategorylink:Locator

  constructor(page: Page) {
    super(page);
    this.booksCategoryLink = page.locator('.top-menu a[href="/books"]');
    this.computersCategoryLink = page.locator('.top-menu a[href="/computers"]');
    this.electronicsCategoryLink = page.locator('.top-menu a[href="/electronics"]');
    this.featuredProducts = page.locator('.item-box');
    // NOTE: this site renders the add-to-cart button with a per-product id,
    // e.g. #add-to-cart-button-{productId}. Prefer ProductPage.addToCartById()
    // for a specific product; this locator is for "first visible" cases.
    this.addToCartButtons = page.locator('.product-box-add-to-cart-button');
    this.digitalDownloadsCategoryLink = page.locator('.top-menu a[href="/digital-downloads"]');
    this.jewelryCategoryLink = page.locator('.top-menu a[href="/jewelry"]');
    this.giftcardsCategorylink=page.locator('.top-menu a[href="/gift-cards"]')

  }

  async open() {
    await this.goto('/');
  }

  async openCategory(category: 'books' | 'computers' | 'electronics') {
    await this.goto(`/${category}`);
  }

  productByName(name: string): Locator {
    return this.featuredProducts.filter({ hasText: name });
  }

  async addFirstFeaturedProductToCart() {
    await this.addToCartButtons.first().click();
  }

  //

  
}

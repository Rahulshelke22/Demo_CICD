import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class SearchPage extends BasePage {
  readonly advancedSearchCheckbox: Locator;
  readonly searchButtonOnPage: Locator;
  readonly productItems: Locator;
  readonly noResultsMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.advancedSearchCheckbox = page.locator('#adv');
    this.searchButtonOnPage = page.locator('#search button, input[value="Search"]').first();
    this.productItems = page.locator('.product-item');
    this.noResultsMessage = page.getByText('No products were found that matched your criteria');
  }

  async open() {
    await this.goto('/search');
  }

  async searchFor(term: string) {
    await this.searchBox.fill(term);
    await this.searchButton.click();
  }

  async expectResultsContain(term: string) {
    await expect(this.productItems.first()).toBeVisible();
    const count = await this.productItems.count();
    expect(count).toBeGreaterThan(0);
  }

  async expectNoResults() {
    await expect(this.noResultsMessage).toBeVisible();
  }

  getResultCount(): Promise<number> {
    return this.productItems.count();
  }
}

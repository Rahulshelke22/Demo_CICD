import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { SearchPage } from '../../pages/SearchPage';

test.describe('Product search', () => {
  test('finds results for a valid keyword', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await homePage.search('computer');

    const searchPage = new SearchPage(page);
    await expect(page).toHaveURL(/\/search/);
    await searchPage.expectResultsContain('computer');
  });

  test('shows "no results" message for a nonsense keyword', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await homePage.search('zzzznonexistentproductzzzz');

    const searchPage = new SearchPage(page);
    await searchPage.expectNoResults();
  });

  test('search box is available from every page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await homePage.openCategory('books');
    await expect(homePage.searchBox).toBeVisible();

    await homePage.search('book');
    await expect(page).toHaveURL(/\/search/);
  });

  test('returns a plausible number of results for a broad term', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await homePage.search('laptop');

    const searchPage = new SearchPage(page);
    const count = await searchPage.getResultCount();
    expect(count).toBeGreaterThan(0);
  });
});

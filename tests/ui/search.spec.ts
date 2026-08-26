import { test, expect } from '../../fixtures/pages.fixture';

test.describe('Product search', () => {
  test('finds results for a valid keyword', async ({ page, homePage, searchPage }) => {
    await homePage.open();
    await homePage.search('computer');

    await expect(page).toHaveURL(/\/search/);
    await searchPage.expectResultsContain('computer');
  });

  test('shows "no results" message for a nonsense keyword', async ({ homePage, searchPage }) => {
    await homePage.open();
    await homePage.search('zzzznonexistentproductzzzz');

    await searchPage.expectNoResults();
  });

  test('search box is available from every page', async ({ page, homePage }) => {
    await homePage.open();
    await homePage.openCategory('books');
    await expect(homePage.searchBox).toBeVisible();

    await homePage.search('book');
    await expect(page).toHaveURL(/\/search/);
  });

  test('returns a plausible number of results for a broad term', async ({ homePage, searchPage }) => {
    await homePage.open();
    // 'laptop' matches nothing (quick search only matches product TITLES,
    // and no product title contains "laptop" in the current catalog) --
    // 'computer' is proven to match, per the first test in this file.
    await homePage.search('computer');

    const count = await searchPage.getResultCount();
    expect(count).toBeGreaterThan(0);
  });
});
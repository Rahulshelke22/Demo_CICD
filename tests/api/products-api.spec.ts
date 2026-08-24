import { test, expect } from '@playwright/test';

/**
 * API-LEVEL tests using Playwright's built-in `request` fixture.
 *
 * NOTE: Demo Web Shop (demowebshop.tricentis.com) is a server-rendered
 * NopCommerce site with no public JSON API, so there's nothing to
 * exercise at the API layer there. To still demonstrate API testing
 * inside this same framework (same config, same CI pipeline, same
 * reporting), these tests run against a public REST API instead.
 * Swap the `baseURL` in playwright.config.ts (the `api` project) for
 * your own service's API when you have one.
 *
 * These run under the `api` project, which has no browser attached —
 * see playwright.config.ts.
 */

test.describe('Products API', () => {
  test('GET /products returns a list of products', async ({ request }) => {
    const response = await request.get('/products');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const products = await response.json();
    expect(Array.isArray(products)).toBeTruthy();
    expect(products.length).toBeGreaterThan(0);
    expect(products[0]).toHaveProperty('id');
    expect(products[0]).toHaveProperty('title');
    expect(products[0]).toHaveProperty('price');
  });

  test('GET /products/{id} returns a single product', async ({ request }) => {
    const response = await request.get('/products/1');
    expect(response.status()).toBe(200);

    const product = await response.json();
    expect(product.id).toBe(1);
    expect(product).toHaveProperty('title');
    expect(product).toHaveProperty('category');
  });

  test('GET /products/{id} with an invalid id returns an empty/null result', async ({ request }) => {
    const response = await request.get('/products/999999');
    expect(response.status()).toBe(200);

    // fakestoreapi.com returns an EMPTY body (not the literal JSON "null")
    // for an id that doesn't exist, so response.json() would throw a
    // SyntaxError here. Read as text first and only parse if non-empty.
    const bodyText = await response.text();
    const product = bodyText.trim().length > 0 ? JSON.parse(bodyText) : null;
    expect(product).toBeNull();
  });

  test('GET /products/categories returns available categories', async ({ request }) => {
    const response = await request.get('/products/categories');
    expect(response.ok()).toBeTruthy();

    const categories = await response.json();
    expect(Array.isArray(categories)).toBeTruthy();
    expect(categories.length).toBeGreaterThan(0);
  });

  test('POST /carts creates a new cart', async ({ request }) => {
    const response = await request.post('/carts', {
      data: {
        userId: 1,
        date: new Date().toISOString(),
        products: [{ productId: 1, quantity: 2 }],
      },
    });
    expect(response.ok()).toBeTruthy();

    const cart = await response.json();
    expect(cart).toHaveProperty('id');
    expect(cart.products[0].productId).toBe(1);
  });

  test('DELETE /products/{id} removes a product', async ({ request }) => {
    const response = await request.delete('/products/1');
    expect(response.ok()).toBeTruthy();

    const deleted = await response.json();
    expect(deleted.id).toBe(1);
  });
});

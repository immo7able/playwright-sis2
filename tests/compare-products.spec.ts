import { test, expect } from '../fixtures/pages.fixture';

test.describe('TC-04 Compare two products', () => {
  test('Hammer is cheaper than Combination Pliers, and the comparison page shows both', async ({
    productPage, comparisonPage, page,
  }) => {
    // Open two products and capture name + price from each detail page.
    await productPage.openByName('Combination Pliers');
    const pliers = await productPage.readSummary();
    await productPage.addToComparison();

    await productPage.openByName('Hammer');
    const hammer = await productPage.readSummary();
    await productPage.addToComparison();

    await expect(productPage.comparisonBar).toContainText('2 product(s) selected');

    // The comparison we state: the Hammer costs less than the Combination Pliers.
    expect(hammer.price).toBeLessThan(pliers.price);

    // The comparison page must agree with what the product pages said.
    await productPage.openComparison();
    await expect(page).toHaveURL(/\/comparison/);
    await expect(comparisonPage.title).toHaveText('Product Comparison');
    await expect(comparisonPage.productNames).toHaveText([pliers.name, hammer.name]);
    await expect(comparisonPage.prices).toHaveText([
      `$${pliers.price.toFixed(2)}`,
      `$${hammer.price.toFixed(2)}`,
    ]);
  });
});

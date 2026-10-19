import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export interface ProductSummary {
  name: string;
  price: number;
}

/** The home page catalogue plus the product detail screen it leads to. */
export class ProductPage extends BasePage {
  readonly name: Locator;
  readonly unitPrice: Locator;
  readonly quantity: Locator;
  readonly addedToCartToast: Locator;
  readonly comparisonBar: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.quantity = page.getByTestId('quantity');
    this.addedToCartToast = page.getByRole('alert').filter({ hasText: 'Product added to shopping cart' });
    this.comparisonBar = page.getByTestId('comparison-bar');
  }

  /** Search the catalogue for a product and open its detail page. */
  async openByName(productName: string) {
    await this.page.goto('/');
    await this.page.getByTestId('search-query').fill(productName);
    await this.page.getByTestId('search-submit').click();
    // Exact heading match: searching "Hammer" also returns "Claw Hammer", "Thor Hammer"...
    await this.page
      .getByTestId('product-name')
      .and(this.page.getByRole('heading', { name: productName, exact: true }))
      .click();
    await this.page.getByRole('heading', { level: 1, name: productName, exact: true }).waitFor();
  }

  /**
   * Open the first product on the home page that is not marked "Out of stock".
   * Stock is shared by everyone using the public site, so a buying test must
   * not depend on one hard-coded product still being available.
   */
  async openFirstInStockProduct() {
    await this.page.goto('/');
    const productCards = this.page.getByTestId(/^product-[0-9A-Z]{26}$/);
    await productCards
      .filter({ hasNot: this.page.getByTestId('out-of-stock') })
      .first()
      .click();
    await this.name.waitFor();
  }

  /** Query: read name and price of the product currently open. */
  async readSummary(): Promise<ProductSummary> {
    return {
      name: (await this.name.innerText()).trim(),
      price: Number(await this.unitPrice.innerText()),
    };
  }

  async setQuantity(quantity: number) {
    await this.quantity.fill(String(quantity));
  }

  async addToCart() {
    await this.page.getByTestId('add-to-cart').click();
  }

  async addToComparison() {
    await this.page.getByTestId('add-to-compare').click();
  }

  async openComparison() {
    await this.page.getByTestId('compare-link').click();
  }
}

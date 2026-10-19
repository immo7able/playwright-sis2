import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Step 1 of /checkout: the cart contents. */
export class CartPage extends BasePage {
  readonly itemTitles: Locator;
  readonly itemQuantities: Locator;
  readonly linePrices: Locator;
  readonly total: Locator;

  constructor(page: Page) {
    super(page);
    this.itemTitles = page.getByTestId('product-title');
    this.itemQuantities = page.getByTestId('product-quantity');
    this.linePrices = page.getByTestId('line-price');
    this.total = page.getByTestId('cart-total');
  }

  async proceedToCheckout() {
    await this.page.getByTestId('proceed-1').click();
  }
}

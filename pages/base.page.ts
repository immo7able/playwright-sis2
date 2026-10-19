import { Page, Locator } from '@playwright/test';

/** Things every screen has: the top navigation bar. */
export abstract class BasePage {
  readonly userMenu: Locator;
  readonly cartBadge: Locator;

  constructor(protected readonly page: Page) {
    this.userMenu = page.getByTestId('nav-menu');
    this.cartBadge = page.getByTestId('cart-quantity');
  }

  async openCart() {
    await this.page.getByTestId('nav-cart').click();
  }
}

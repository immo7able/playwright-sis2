import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ComparisonPage extends BasePage {
  readonly title: Locator;
  readonly productNames: Locator;
  readonly prices: Locator;

  constructor(page: Page) {
    super(page);
    const table = page.getByTestId('comparison-table');
    this.title = page.getByTestId('comparison-title');
    this.productNames = table.getByTestId('product-name');
    this.prices = table.getByTestId('compare-price');
  }
}

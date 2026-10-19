import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ForgotPasswordPage extends BasePage {
  private readonly email: Locator;
  private readonly submit: Locator;
  /** The confirmation or error box shown under the form after submitting. */
  readonly resultMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.getByTestId('email');
    this.submit = page.getByTestId('forgot-password-submit');
    this.resultMessage = page.getByTestId('forgot-password-form').getByRole('alert');
  }

  async open() {
    await this.page.goto('/auth/forgot-password');
  }

  async requestReset(email: string) {
    await this.email.fill(email);
    await this.submit.click();
  }
}

import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { User } from '../data/user.factory';

export class LoginPage extends BasePage {
  private readonly email: Locator;
  private readonly password: Locator;
  private readonly submit: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.getByTestId('email');
    this.password = page.getByTestId('password');
    this.submit = page.getByTestId('login-submit');
    this.errorMessage = page.getByTestId('login-error');
  }

  async open() {
    await this.page.goto('/auth/login');
  }

  async signIn(credentials: Pick<User, 'email' | 'password'>) {
    await this.email.fill(credentials.email);
    await this.password.fill(credentials.password);
    await this.submit.click();
  }
}

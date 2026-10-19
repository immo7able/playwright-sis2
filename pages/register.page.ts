import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { AddressForm } from './address.form';
import { User } from '../data/user.factory';

export class RegisterPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open() {
    await this.page.goto('/auth/register');
  }

  async register(user: User) {
    const field = (testId: string) => this.page.getByTestId(testId);

    await field('first-name').fill(user.firstName);
    await field('last-name').fill(user.lastName);
    await field('dob').fill(user.dob);
    await new AddressForm(this.page).fill(user.address);
    await field('phone').fill(user.phone);
    await field('email').fill(user.email);
    await field('password').fill(user.password);
    await field('register-submit').click();
  }
}

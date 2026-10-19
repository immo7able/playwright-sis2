import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';
import { AddressForm } from './address.form';
import { Address } from '../data/user.factory';

export type PaymentMethod =
  | 'Bank Transfer'
  | 'Cash on Delivery'
  | 'Credit Card'
  | 'Buy Now Pay Later'
  | 'Gift Card';

/** Steps 2-4 of /checkout: sign-in check, billing address, payment. */
export class CheckoutPage extends BasePage {
  readonly alreadyLoggedInMessage: Locator;
  readonly paymentSuccessMessage: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    super(page);
    this.alreadyLoggedInMessage = page.getByText(/you are already logged in/i);
    this.paymentSuccessMessage = page.getByTestId('payment-success-message');
    this.orderConfirmation = page.getByText(/Thanks for your order!/);
  }

  /** Step 2 - for a signed-in customer this is just a "continue" button. */
  async continueAsSignedInCustomer() {
    await this.page.getByTestId('proceed-2').click();
  }

  /** Step 3 - billing address. Fill every field explicitly instead of trusting the prefill. */
  async enterBillingAddress(address: Address) {
    await new AddressForm(this.page).fill(address);
    await this.page.getByTestId('proceed-3').click();
  }

  /** Step 4 - choose payment and press "Check payment". */
  async pay(method: PaymentMethod) {
    await this.page.getByTestId('payment-method').selectOption({ label: method });
    await this.page.getByTestId('finish').click();
  }

  /** After a successful payment check the same button turns into "Confirm". */
  async confirmOrder() {
    await this.page.getByTestId('finish').click();
  }
}

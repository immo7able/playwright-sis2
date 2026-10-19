import { Page, expect } from '@playwright/test';
import { Address } from '../data/user.factory';

/**
 * The address block used on both the registration form and checkout step 3.
 *
 * Entering country + postcode + house number fires GET /postcode-lookup, which
 * asynchronously overwrites street, city and state. If we type those fields
 * while the lookup is still in flight, the lookup can overwrite part of them and
 * the server later rejects the mixed address (422: "The state does not belong
 * to the selected country"). The server also validates street/city/state against
 * that same lookup data, so - like a real user - we keep what the lookup filled in
 * and type the remaining fields ourselves only if the lookup found nothing.
 */
export class AddressForm {
  constructor(private readonly page: Page) {}

  async fill(address: Address) {
    const field = (testId: string) => this.page.getByTestId(testId);

    await field('country').selectOption({ label: address.countryName });
    await field('postal_code').fill(address.postalCode);

    const lookup = this.page.waitForResponse(
      (r) => r.url().includes('/postcode-lookup') && r.request().method() === 'GET',
    );
    await field('house_number').fill(address.houseNumber);
    const found = await (await lookup).json().catch(() => ({}));

    if (found.street && found.city && found.state) {
      // Web-first wait until Angular has applied the lookup result to the form.
      await expect(field('street')).toHaveValue(found.street);
      await expect(field('city')).toHaveValue(found.city);
      await expect(field('state')).toHaveValue(found.state);
    } else {
      await field('street').fill(address.street);
      await field('city').fill(address.city);
      await field('state').fill(address.state);
    }
  }
}

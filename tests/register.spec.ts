import { test, expect } from '../fixtures/pages.fixture';
import { createUser } from '../data/user.factory';

test.describe('TC-01 Register a new customer', () => {
  test('a new customer can register and then sign in with the new account', async ({
    registerPage, loginPage, accountPage, page,
  }) => {
    const newCustomer = createUser();

    await registerPage.open();
    await registerPage.register(newCustomer);

    // Successful registration sends the user to the login page.
    await expect(page).toHaveURL(/\/auth\/login/);

    // Prove the account really exists: sign in with it.
    await loginPage.signIn(newCustomer);
    await expect(page).toHaveURL(/\/account/);
    await expect(accountPage.title).toHaveText('My account');
    await expect(accountPage.userMenu).toContainText(`${newCustomer.firstName} ${newCustomer.lastName}`);
  });
});

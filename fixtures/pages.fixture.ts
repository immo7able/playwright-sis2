import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { AccountPage } from '../pages/account.page';
import { ForgotPasswordPage } from '../pages/forgot-password.page';
import { ProductPage } from '../pages/product.page';
import { ComparisonPage } from '../pages/comparison.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { API_URL, User, createUser, toRegisterPayload } from '../data/user.factory';

type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  accountPage: AccountPage;
  forgotPasswordPage: ForgotPasswordPage;
  productPage: ProductPage;
  comparisonPage: ComparisonPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  /** A customer that already exists - created through the API, unique to this test. */
  registeredUser: User;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  registerPage: async ({ page }, use) => { await use(new RegisterPage(page)); },
  accountPage: async ({ page }, use) => { await use(new AccountPage(page)); },
  forgotPasswordPage: async ({ page }, use) => { await use(new ForgotPasswordPage(page)); },
  productPage: async ({ page }, use) => { await use(new ProductPage(page)); },
  comparisonPage: async ({ page }, use) => { await use(new ComparisonPage(page)); },
  cartPage: async ({ page }, use) => { await use(new CartPage(page)); },
  checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); },

  registeredUser: async ({ request }, use) => {
    const user = await registerViaApi(request);
    await use(user);
  },
});

/** Register a fresh customer through the REST API (fast; no UI involved). */
export async function registerViaApi(request: import('@playwright/test').APIRequestContext): Promise<User> {
  const user = createUser();
  const response = await request.post(`${API_URL}/users/register`, { data: toRegisterPayload(user) });
  expect(response.status(), `API registration failed: ${await response.text()}`).toBe(201);
  return user;
}

export { expect };

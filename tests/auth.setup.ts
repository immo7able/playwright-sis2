import { test as setup, expect, registerViaApi } from '../fixtures/pages.fixture';
import { AUTH_FILE } from '../playwright.config';

// Runs once before the suite: creates a throwaway customer, signs in through
// the UI and saves the session (auth token in localStorage) for reuse.
setup('authenticate', async ({ request, loginPage, accountPage, page }) => {
  const customer = await registerViaApi(request);

  await loginPage.open();
  await loginPage.signIn(customer);
  await expect(accountPage.title).toHaveText('My account');

  await page.context().storageState({ path: AUTH_FILE });
});

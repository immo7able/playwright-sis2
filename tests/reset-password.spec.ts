import { test, expect } from '../fixtures/pages.fixture';
import { unknownEmail } from '../data/user.factory';

// Uses a freshly registered customer, never the shared seeded accounts:
// resetting a seeded account's password would break everyone else using it.
test.describe('TC-05 Reset a password', () => {
  test('a known email gets a confirmation', async ({ forgotPasswordPage, registeredUser }) => {
    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset(registeredUser.email);

    await expect(forgotPasswordPage.resultMessage).toBeVisible();
    // Success and error share the same alert box; only the styling tells them apart.
    await expect(forgotPasswordPage.resultMessage).toHaveClass(/alert-success/);
    await expect(forgotPasswordPage.resultMessage).not.toContainText(/invalid/i);
  });

  test('an unknown email gets an error', async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset(unknownEmail());

    await expect(forgotPasswordPage.resultMessage).toHaveText('The selected email is invalid.');
    await expect(forgotPasswordPage.resultMessage).toHaveClass(/alert-danger/);
  });
});

import { test, expect } from '../fixtures/pages.fixture';
import { createUser } from '../data/user.factory';
import { AUTH_FILE } from '../playwright.config';

// Start already signed in - the session saved once by auth.setup.ts.
test.use({ storageState: AUTH_FILE });

test.describe('TC-03 Buy a product', () => {
  test('a signed-in customer can buy two units of an in-stock product', async ({
    productPage, cartPage, checkoutPage,
  }) => {
    const quantity = 2;
    const billingAddress = createUser().address;

    await productPage.openFirstInStockProduct();
    const { name: productName, price } = await productPage.readSummary();
    await productPage.setQuantity(quantity);
    await productPage.addToCart();

    await expect(productPage.addedToCartToast).toBeVisible();
    await expect(productPage.cartBadge).toHaveText(String(quantity));

    // Cart shows the right item, quantity and line price.
    await productPage.openCart();
    await expect(cartPage.itemTitles).toHaveCount(1);
    await expect(cartPage.itemTitles.first()).toContainText(productName);
    await expect(cartPage.itemQuantities.first()).toHaveValue(String(quantity));
    await expect(cartPage.linePrices.first()).toHaveText(`$${(price * quantity).toFixed(2)}`);

    // Checkout completes.
    await cartPage.proceedToCheckout();
    await expect(checkoutPage.alreadyLoggedInMessage).toBeVisible();
    await checkoutPage.continueAsSignedInCustomer();
    await checkoutPage.enterBillingAddress(billingAddress);
    await checkoutPage.pay('Cash on Delivery');
    await expect(checkoutPage.paymentSuccessMessage).toHaveText('Payment was successful');

    await checkoutPage.confirmOrder();
    await expect(checkoutPage.orderConfirmation).toContainText(/invoice number is INV-\d+/);
  });
});

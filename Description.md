# SIS 2 — Description

## What this project does

An automated end-to-end test suite for the **Practice Software Testing – Toolshop**
(<https://practicesoftwaretesting.com>), written in **TypeScript** with **Playwright Test**.

The goal is to cover the five business flows from the Week 6 brief with tests that:

- run from a clean clone with `npm install` + `npx playwright test`;
- are **independent** — each test creates the data it needs and can run in any order and in parallel;
- are **structured** — Page Object Model, a fixture layer, a data factory, no locators in spec files;
- **assert** something that could actually fail, using web-first (auto-retrying) assertions;
- contain no `waitForTimeout`, no CSS-class locators and no positional XPath.

## Test cases to be automated

| ID | Test case | Spec file | Preconditions / data | Steps | Expected result (what is asserted) |
|----|-----------|-----------|----------------------|-------|------------------------------------|
| TC-01 | Register a new customer | `tests/register.spec.ts` | Unique user from `createUser()` (new email every run) | Open `/auth/register` → fill personal data + address + email + password → **Register** | Redirect to `/auth/login`; signing in with the new credentials reaches `/account`, page title is **My account**, user menu shows the new customer's full name |
| TC-02a | Log in — valid credentials | `tests/login.spec.ts` | Fresh customer created via API (`registeredUser` fixture) | Open `/auth/login` → enter valid email + password → **Login** | URL is `/account`, title **My account**, user menu shows first name |
| TC-02b | Log in — invalid credentials | `tests/login.spec.ts` | Fresh customer created via API | Open `/auth/login` → valid email + wrong password → **Login** | Error **"Invalid email or password"**, URL stays `/auth/login`, user menu not shown |
| TC-03 | Buy a product | `tests/buy-product.spec.ts` | Signed in once by `auth.setup.ts` (saved storage state) | Open first in-stock product → set quantity 2 → **Add to cart** → cart → proceed → billing address → **Cash on Delivery** → **Confirm** | Toast "Product added to shopping cart"; cart badge = 2; cart has exactly 1 line with the right product, quantity 2 and line price = 2 × unit price; "Payment was successful"; "Thanks for your order! … invoice number is INV-…" |
| TC-04 | Compare two products | `tests/compare-products.spec.ts` | None | Open *Combination Pliers*, capture name + price, **Compare** → open *Hammer*, capture name + price, **Compare** → **Compare Now** | Comparison bar shows "2 product(s) selected"; **stated comparison: Hammer is cheaper than Combination Pliers**; comparison page lists both names in order and the same prices captured from the product pages |
| TC-05a | Reset password — known email | `tests/reset-password.spec.ts` | Fresh customer created via API | Open `/auth/forgot-password` → enter the customer's email → **Set New Password** | A success alert is shown (not an error), and it does not mention "invalid" |
| TC-05b | Reset password — unknown email | `tests/reset-password.spec.ts` | Random never-registered email | Same as above with the unknown email | Error alert **"The selected email is invalid."** |

## Out of scope (deliberately not automated)

- Payment methods other than *Cash on Delivery* (card / bank / gift card validation is its own feature).
- Actually completing a password reset via email — the app does not send real e-mails.
- Cross-browser runs (Firefox / WebKit) — the config has only Chromium, to keep the run fast for grading; adding a project is one line.
- The `with-bugs` build — it is an older version of the app with different markup, so this suite is not compatible with it.

# SIS 2 — Playwright test automation for the Toolshop

End-to-end tests for <https://practicesoftwaretesting.com> written in TypeScript with Playwright Test.

## How to run

Requirements: Node.js 18+ and internet access (the tests run against the public site).

```bash
npm install
npx playwright install chromium
npx playwright test            # run everything (headless)
npx playwright test --ui       # UI mode: pick tests, time-travel through steps
npx playwright show-report     # open the HTML report of the last run
```

Optional: `BASE_URL` / `API_URL` environment variables override the front-end and API addresses.

## What it covers

| ID | Test case | File |
|----|-----------|------|
| TC-01 | Register a new customer | `tests/register.spec.ts` |
| TC-02 | Log in (valid + invalid) | `tests/login.spec.ts` |
| TC-03 | Buy a product | `tests/buy-product.spec.ts` |
| TC-04 | Compare two products | `tests/compare-products.spec.ts` |
| TC-05 | Reset a password (known + unknown email) | `tests/reset-password.spec.ts` |

Full test-case table (steps, data, expected results): see [Description.md](Description.md).

## Project structure

```
tests/          one spec per test case + auth.setup.ts (log in once)
pages/          one page object per screen (+ address.form.ts, a shared component)
fixtures/       pages.fixture.ts - hands page objects and a fresh registered user to every test
data/           user.factory.ts - unique user data per call
playwright.config.ts
```

## Design decisions

1. **Page Object Model, no locators in specs.** Specs say *what* (business steps and assertions);
   page objects say *how*. Page objects expose a few read-only locators (e.g. `loginPage.errorMessage`)
   so that the **assertions stay visible in the spec**, where the test's intent lives.
2. **Fixtures instead of `new XxxPage(page)`.** `fixtures/pages.fixture.ts` extends Playwright's `test`
   with every page object plus a `registeredUser` fixture.
3. **`data-test` attributes only.** `testIdAttribute: 'data-test'` in the config makes `getByTestId`
   work with the app's attributes. Elements without a test id use roles/text (`getByRole('alert')`,
   `getByRole('heading', { exact: true })`). No CSS classes, no XPath.
4. **Unique data on every run.** `createUser()` builds an email from timestamp + random number,
   so parallel workers never collide and re-runs never hit "email already exists".
5. **No shared seeded accounts.** The brief offers `customer@` / `customer2@` with `welcome01`, but the
   site is public: anyone running *forgot password* or changing the password breaks them
   (during development `customer2@` really did stop accepting `welcome01`). So tests that need an existing
   account get a **brand-new one created through the REST API** (`POST /users/register`) — fast, isolated, reliable.
6. **Log in once.** `tests/auth.setup.ts` (a `setup` project the `chromium` project depends on) registers a
   customer, logs in through the UI once and saves the session to `playwright/.auth/user.json`.
   The buy test reuses it with `test.use({ storageState })`. The login test still logs in through the UI —
   login is its subject.
7. **Buy whatever is in stock.** Stock is shared by everyone on the public site (it really ran out for
   *Combination Pliers* during development), so TC-03 opens the first product **not** marked "Out of stock"
   and reads its name/price at run time instead of hard-coding one.
8. **Address lookup race handled explicitly.** Entering postcode + house number fires an async
   `GET /postcode-lookup` that overwrites street/city/state. Typing those fields while it is in flight
   produced a mixed address and a `422` from `POST /invoices` (~1 run in 3). `pages/address.form.ts` waits
   for that response and for the form to show the result (web-first `toHaveValue`), and keeps the
   looked-up values, which the server validates against.
9. **No `waitForTimeout`.** All waiting is done by actionability checks, web-first assertions and
   `waitForResponse`.
10. **Config:** `baseURL`, `testIdAttribute`, `trace: 'on-first-retry'`, `retries` only on CI,
    screenshots on failure, 60 s test timeout (the public site can be slow).

## Defects / observations found while testing

- **Untranslated text on password reset:** for a known email the success message is the raw i18n key
  `page.forgot-password.confirm` instead of human-readable text. TC-05a therefore checks that a *success*
  alert is shown (and it is not the error) rather than an exact sentence.
- **Postcode lookup returns implausible addresses** (Berlin 10115 → "Heidenheim an der Brenz, Rheinland-Pfalz")
  and the server rejects a real Berlin address for that postcode at checkout.

## AI usage (Level 1)

AI was used. See [Prompt.md](Prompt.md) (exact prompts and tool) and [Review.md](Review.md)
(what the AI produced, how it was reviewed, what was changed and why). Screenshots are in `screenshots/`.

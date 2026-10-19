# Review.md — reviewing the AI output

## What the AI produced

From the lecture slides and the assignment sheet, Claude Code:

1. Read the brief and grading rules (5 test cases, page objects, ≥1 fixture, unique data, no locators in specs,
   no `waitForTimeout`, no CSS/XPath locators, tests independent and parallel-safe).
2. Explored the live site with small Playwright scripts to collect the **real** `data-test` attribute names
   (the slides warn not to copy them from tutorials), the real messages, and the API calls behind each flow.
3. Generated the project: `playwright.config.ts`, a data factory, 10 page objects/components, a fixture file,
   a login-once setup, and 5 spec files (7 tests).
4. Ran the suite, found failures, diagnosed them with traces and fixed them.

## How the output was reviewed

- **Ran it**, not just read it: full suite green (8/8 incl. setup), then repeated runs
  (`--repeat-each`) to look for flaky tests.
- **Checked each test against the brief's "what it must prove" column** — does each test have an assertion that
  could fail? (e.g. TC-04 compares the prices captured on the product pages with those on the comparison page,
  and states which product is cheaper.)
- **Checked the grading rules by searching the code:** no `waitForTimeout`, no CSS-class / XPath locators,
  no `getByTestId`/`locator(` in `tests/*.spec.ts`.
- **Opened failing traces** (`--trace=retain-on-failure`) and read the network requests/responses.

## Problems found and what was changed (with justification)

| # | Problem found during review | Change | Why |
|---|-----------------------------|--------|-----|
| 1 | The slides suggest seeded accounts `customer@` / `customer2@` + `welcome01`. While exploring, a forgot-password request was sent for `customer2@`, and after that `customer2@` could no longer log in with `welcome01`. | Tests that need an existing account use a **new account created via the API** (`registeredUser` fixture). Forgot-password is never run against seeded accounts. | The site is shared and public; anyone can break seeded accounts, which would make our tests fail for reasons unrelated to our code. |
| 2 | **Flaky TC-03 (~1 in 3 runs):** order confirmation never appeared. Trace showed `POST /invoices → 422 "state/city does not belong to the selected country"`. Cause: the async `/postcode-lookup` overwrote street/city/state *while* the test was typing them, mixing two addresses. | Added `pages/address.form.ts`, shared by registration and checkout: start `waitForResponse('/postcode-lookup')` before typing the house number, wait until the form shows the lookup result (web-first `toHaveValue`), and keep those values. | Deterministic synchronisation on the real event instead of a sleep (sleeps are forbidden and would still be flaky). The server validates the address against the same lookup data, so keeping it is also what a real user would do. |
| 3 | After many repeated runs TC-03 failed with "Add to cart" disabled: the repeated test runs had bought all *Combination Pliers* — the product was **Out of stock**. | TC-03 now opens the **first in-stock product** and reads its name and price at run time. Stopped stress-running the buy test. | Shared stock on a public site is test data we do not control; a hard-coded product would eventually break the suite for the grader. |
| 4 | The forgot-password success text is the raw key `page.forgot-password.confirm` (an app defect). | TC-05a asserts that a **success** alert is shown and that it is not the "invalid" error, instead of asserting an exact sentence. Documented as a defect in the README. | Asserting the broken text would bake a bug into the test; asserting human text would make the suite permanently red for a known defect. |
| 5 | Searching "Hammer" returns *Claw Hammer*, *Thor Hammer*, etc. | Product opened by **exact heading name** (`getByRole('heading', { name, exact: true })` combined with `getByTestId('product-name')`). | `.first()` / `.nth()` would pick whatever happens to be first today. |
| 6 | Hard-coded URLs. | `BASE_URL` / `API_URL` environment overrides. | Lets the suite run against another environment without code changes. |

## Decisions kept from the AI output

- One spec per test case, one page object per screen, page objects expose read-only locators so
  **assertions live in the specs**.
- `auth.setup.ts` + storage state for the buy test ("log in once"), while the login test still logs in via UI.
- Unique email = timestamp + random number (safe for parallel workers).

## My own review notes

I made the prompts in [Prompt.md](Prompt.md) shorter so they are easier to reuse. The details I removed
are listed below. I checked each of them in the generated code myself instead of writing them into the prompts.

**Setup**
- Config values: parallel runs, 2 retries only on CI, 60 s test timeout, 10 s expect timeout,
  trace on first retry, screenshot on failure.
- `BASE_URL` / `API_URL` environment variables, so the suite can run against another environment.
- `.gitignore` for `node_modules`, `test-results`, `playwright-report` and `playwright/.auth`.

**Exploring the site**
- Don't copy selectors from tutorials; check them on the real site.
- Don't run forgot-password against the seeded accounts (`customer@` / `customer2@`), because that can lock them.
- Note the API calls behind each flow, not only the UI.

**Page objects and test data**
- Unique email = timestamp + random number, so parallel workers never get the same user.
- No CSS-class or XPath locators, and no `.first()` / `.nth()` to pick a product.
- Locators only in page objects; assertions only in the spec files.

**Tests (exact expected results)**
- TC-01: after registering, the app redirects to `/auth/login`; after logging in, the title is "My account" and the user menu shows the full name.
- TC-02: invalid password shows "Invalid email or password" and stays on `/auth/login`.
- TC-03: buy the **first in-stock** product (not a fixed one, since stock runs out); quantity 2, badge = 2,
  line price = 2 × unit price, Cash on Delivery, invoice number `INV-…`.
- TC-04: Combination Pliers vs Hammer by exact name; prices on the comparison page match the product pages; Hammer is cheaper.
- TC-05: known email shows a success alert (not the "invalid" error); unknown email shows "The selected email is invalid."

**Flaky tests**
- Don't stress-run the buy test, because it uses up shared stock on the public site.
- The real cause of the TC-03 flakiness was the postcode lookup overwriting the address while it was being typed.
  It was fixed by waiting for the `/postcode-lookup` response in `address.form.ts`.

**Documentation**
- The exact contents of each document: coverage table, test-case table with steps and expected results,
  out-of-scope list, known app defects, and the run output in `screenshots/`.

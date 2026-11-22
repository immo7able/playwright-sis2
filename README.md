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

## CI

[![Playwright Tests](https://github.com/immo7able/playwright-sis2/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/immo7able/playwright-sis2/actions/workflows/playwright.yml)

**CI system:** GitHub Actions. The repository already lives on GitHub, so Actions is built in: no server
of our own, free minutes for public repositories, matrices for sharding, artefacts and a status badge out of the box.

**Pipeline** ([`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)):

- runs on **every push** (any branch) and **every pull request**, plus manually via *Run workflow* (`workflow_dispatch`);
- `actions/setup-node` with `cache: npm` → `npm ci` (dependencies restored from the npm cache, keyed on `package-lock.json`);
- `npx playwright install --with-deps chromium` (browser + Linux system libraries);
- the **full suite**, no `--grep` / `--project` filters, split into **4 shards** (`--shard=i/4`) that run in parallel;
- the **Merge reports** job downloads the 4 blob reports and builds one HTML report and one JUnit file (`merge.config.ts`);
- artefacts, kept **14 days**: `playwright-report` (merged HTML), `test-results-1…4` (traces, screenshots,
  videos of failed/retried tests + per-shard JUnit), `junit-report` (merged JUnit);
- reports are uploaded even when tests fail (`if: ${{ !cancelled() }}`), `fail-fast: false` keeps the other shards running,
  `concurrency` cancels an outdated run when a new push arrives on the same branch.

**CI settings** ([`playwright.config.ts`](playwright.config.ts), active when `CI` is set — GitHub sets `CI=true` itself):

| Setting | CI | Local | Why |
|---|---|---|---|
| `forbidOnly` | `true` | `false` | a forgotten `test.only` fails the run instead of silently running one test |
| `retries` | `2` | `0` | a flaky test is reported as *flaky*, not red |
| `workers` | `2` | auto | GitHub runners have 2–4 vCPUs |
| `reporter` | `list`, `blob`, `junit` (`reports/junit.xml`) | `list`, `html` | blob = per-shard result for merging; JUnit = machine-readable |
| `trace` | `on-first-retry` | same | a trace of exactly the failed attempt |
| `video` / `screenshot` | kept on failure | same | evidence in `test-results-N` |

`fullyParallel: true` lets `--shard` split single tests rather than whole files. The `setup` project (log in once)
is a dependency of `chromium`, so **each shard runs it for itself** — that is why the merged report shows the
`authenticate` test once per shard.

`BASE_URL` can be overridden with a repository variable (*Settings → Secrets and variables → Actions → Variables*);
if it is not set, the config falls back to `https://practicesoftwaretesting.com`. No passwords are stored:
every test registers its own throwaway user through the API.

To open a trace: download `playwright-report` or `test-results-N` from the run page and run
`npx playwright show-trace <trace.zip>`, or drop the zip onto <https://trace.playwright.dev>.

### Runtime: before / after sharding

Both numbers come from GitHub Actions (`ubuntu-latest`), median of 3 runs started with *Run workflow*.
"Before" = the same workflow with the matrix set to `shardIndex: [1]`, `shardTotal: [1]`.

| Configuration | Total run time | *Run Playwright tests* step (slowest shard) | Run |
| --- | --- | --- | --- |
| 1 job, no sharding | TODO | TODO | [run](TODO) |
| 4 shards + merge | TODO | TODO | [run](TODO) |

**Conclusion:** TODO — one sentence. The suite is small (7 tests, ~30 s of test time on one runner), while every shard
spends roughly a minute on checkout, `npm ci` and the Chromium install, and each shard also repeats the `setup` login,
and the merge job adds its own setup. So sharding cuts the *test step* but barely changes (or can even increase) the
*total* time; it would pay off with a larger suite.

### Running in CI mode locally

```bash
npm ci
npx playwright install --with-deps chromium
CI=true npx playwright test                       # PowerShell: $env:CI="true"; npx playwright test; Remove-Item Env:CI

# shards + merge, as in CI
mkdir -p all-blob-reports
CI=true npx playwright test --shard=1/2 && cp blob-report/report.zip all-blob-reports/report-1.zip
CI=true npx playwright test --shard=2/2 && cp blob-report/report.zip all-blob-reports/report-2.zip
npx playwright merge-reports --config merge.config.ts ./all-blob-reports
npx playwright show-report
```

Checked locally before the first push: the CI run produces `blob-report/` and `reports/junit.xml`; two shards merge
into one HTML report and `reports/junit-merged.xml`; changing a `test(` to `test.only(` makes the CI-mode run fail.

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
merge.config.ts      merges the CI shards' blob reports into one HTML + JUnit report
.github/workflows/   playwright.yml - the GitHub Actions pipeline
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

AI was also used for the CI pipeline part — see [AI_USAGE.md](AI_USAGE.md).

# Prompt.md

## AI tool used

- **Tool:** Claude Code (Anthropic), VS Code extension, agent mode (the AI can read files, run commands and run the tests)
- **Model:** Claude Opus 5.5 (`claude-opus-5-5`)
- **Date:** 2026-10-19

## Prompt 1 (exact text)

The two course files were attached by path:

```
"C:\Users\ABUALLAA\Downloads\Week_6_Masters_ST.pptx"  "C:\Users\ABUALLAA\Downloads\SIS 2 .docx" help me with this homework please
```

- `Week_6_Masters_ST.pptx` — the Week 6 lecture (Playwright, page objects, fixtures, SIS 2 brief, grading rules).
- `SIS 2 .docx` — the assignment sheet (5 test suites, Description.md, Prompt.md, Review.md, screenshots, public GitHub repo).

## Prompts to recreate the project (simplified)

Run them one at a time in an empty folder and run the tests after each step.

**Prompt 2: Setup**
```
Create a Playwright + TypeScript project for testing https://practicesoftwaretesting.com.
Add a config with baseURL, data-test as the test id attribute, an HTML report,
and a setup project that runs before the tests.
```

**Prompt 3: Explore the site**
```
Explore the live site and find the real data-test attributes and messages for:
register, login, add to cart, checkout, compare products and forgot password.
```

**Prompt 4: Page objects and test data**
```
Create a page object for each screen, a shared address form, and a factory that makes
a unique user every time. Use getByTestId or getByRole only. No waitForTimeout.
```

**Prompt 5: Fixtures**
```
Create a fixture that gives every test its page objects and a new registered user
created through the API. Add a setup file that logs in once and saves the session.
```

**Prompt 6: Tests**
```
Write one spec file for each test case: register, login (valid and invalid),
buy a product, compare two products, reset password (known and unknown email).
Then run the tests and fix any failures.
```

**Prompt 7: Check for flaky tests**
```
Run the tests several times. If a test is flaky, use the trace to find the cause and fix it
with a proper wait, not a sleep.
```

**Prompt 8: Documentation**
```
Write README.md, Description.md, Prompt.md and Review.md, and save a screenshot of the report.
```

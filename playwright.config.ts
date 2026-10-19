import { defineConfig, devices } from '@playwright/test';

export const AUTH_FILE = 'playwright/.auth/user.json';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,                    // 4. retry in CI only
  timeout: 60_000,                                    // public shared site - can be slow
  expect: { timeout: 10_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ?? 'https://practicesoftwaretesting.com', // 1. relative goto()
    testIdAttribute: 'data-test',                     // 2. getByTestId maps here
    trace: 'on-first-retry',                          // 3. a recording when it fails
    screenshot: 'only-on-failure',
  },
  projects: [
    // Registers a throwaway customer and logs in once; saves the session to AUTH_FILE.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

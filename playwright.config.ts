import { defineConfig, devices } from '@playwright/test';

export const AUTH_FILE = 'playwright/.auth/user.json';

// GitHub Actions sets CI=true automatically; locally it is unset unless you set it.
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,                                // shards split single tests, not whole files
  forbidOnly: isCI,                                   // a forgotten test.only fails the CI run
  retries: isCI ? 2 : 0,                              // CI: a flaky test is reported as "flaky", not red
  workers: isCI ? 2 : undefined,                      // GitHub-hosted runners have 2-4 vCPUs
  timeout: 60_000,                                    // public shared site - can be slow
  expect: { timeout: 10_000 },
  reporter: isCI
    ? [
        ['list'],                                     // readable log in the Actions UI
        ['blob'],                                     // per-shard result, merged later into one HTML report
        ['junit', { outputFile: 'reports/junit.xml' }],
      ]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL || 'https://practicesoftwaretesting.com', // 1. relative goto()
    testIdAttribute: 'data-test',                     // 2. getByTestId maps here
    trace: 'on-first-retry',                          // 3. a recording of the failed attempt
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Registers a throwaway customer and logs in once; saves the session to AUTH_FILE.
    // With --shard, every shard that needs it runs this setup for itself.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});

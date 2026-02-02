import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for Repstack E2E tests
 * Tests run against the local dev server or deployed GitHub Pages site
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Disable parallel execution for test stability
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1, // Use single worker for stable test execution
  reporter: [['html', { open: 'never' }], ['list']],
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run preview',
        url: 'http://localhost:4173',
        reuseExistingServer: !process.env.CI,
        timeout: 120000,
      },
});

import { defineConfig, devices } from '@playwright/test';

// Tests run against the production build served by `astro preview` (build first: npm run build).
// Locally on macOS 13 Playwright cannot install its own browsers, so use installed Chrome:  PW_CHANNEL=chrome npx playwright test --project=chromium
// CI installs chromium, firefox and webkit (see .github/workflows/ci.yml) and runs all three.
const channel = process.env.PW_CHANNEL;
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: process.env.BASE_URL ?? 'http://localhost:4322' },
  webServer: process.env.BASE_URL ? undefined : { command: 'npx astro preview --port 4322', url: 'http://localhost:4322', reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], ...(channel ? { channel } : {}) } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});

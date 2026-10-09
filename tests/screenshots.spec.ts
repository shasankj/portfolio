import { test } from '@playwright/test';

// Screenshot matrix: 375 / 768 / 1440 px, light + dark. Run with SHOTS=1; output goes to shots/matrix/ (git-ignored).
const pages: Record<string, string> = { home: '/', projects: '/projects/', 'care-bot': '/projects/care-bot/', kenzo: '/projects/kenzo-pawsitive-academy/', experience: '/experience/', about: '/about/', how: '/how-this-site-was-built/' };
test.skip(!process.env.SHOTS, 'set SHOTS=1 to capture screenshots');

for (const scheme of ['light', 'dark'] as const)
  for (const width of [375, 768, 1440])
    test(`screenshots ${scheme} ${width}`, async ({ page, browserName }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.setViewportSize({ width, height: 900 });
      for (const [name, path] of Object.entries(pages)) {
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => document.querySelectorAll('.section h1, .section h2, .cs-section > h2, .role').forEach((e) => e.classList.add('in')));
        await page.waitForTimeout(300);
        await page.screenshot({ path: `shots/matrix/${browserName}-${name}-${scheme}-${width}.png`, fullPage: true });
      }
    });

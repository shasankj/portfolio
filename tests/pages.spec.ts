import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = ['/', '/projects/', '/projects/care-bot/', '/projects/kenzo-pawsitive-academy/', '/experience/', '/about/', '/how-this-site-was-built/', '/notes/', '/work/event-correlation/', '/work/vendor-routing-orchestration/'];

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} theme`, () => {
    test.use({ colorScheme: scheme });
    for (const path of pages) {
      test(`${path}: loads cleanly, no overflow at 375px, no serious a11y violations`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(e.message));
        page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
        await page.setViewportSize({ width: 375, height: 800 });
        await page.goto(path);
        await page.waitForLoadState('networkidle');
        expect(errors).toEqual([]);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        expect(overflow).toBeLessThanOrEqual(0);
        await page.setViewportSize({ width: 1440, height: 900 });
        // Finish reveal animations so contrast is measured on final colors.
        await page.evaluate(() => document.querySelectorAll('.section h1, .section h2, .cs-section > h2, .role').forEach((e) => e.classList.add('in')));
        await page.waitForTimeout(500);
        const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
        expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`)).toEqual([]);
      });
    }
  });
}

test('404 page renders in the site style', async ({ page }) => {
  const res = await page.goto('/this-page-does-not-exist/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toContainText('Message dropped');
});

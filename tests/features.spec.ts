import { test, expect } from '@playwright/test';

test('client-side navigation, theme persistence and command palette', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => ((window as any).__marker = 1));
  await page.click('.grid-cards a.card >> nth=0');
  await page.waitForURL('**/projects/care-bot/');
  expect(await page.evaluate(() => (window as any).__marker)).toBe(1); // no full reload

  await page.click('#theme-toggle');
  const theme = await page.evaluate(() => document.documentElement.dataset.theme);
  await page.click('nav >> text=Experience');
  await page.waitForURL('**/experience/');
  expect(await page.evaluate(() => document.documentElement.dataset.theme)).toBe(theme);

  await page.keyboard.press('ControlOrMeta+k');
  await expect(page.locator('#palette')).toHaveJSProperty('open', true);
  await page.keyboard.type('kenzo');
  await expect(page.locator('.pal-opt')).toHaveCount(1);
  await page.keyboard.press('Enter');
  await page.waitForURL('**/projects/kenzo-pawsitive-academy/');
  await expect(page.locator('#palette')).toHaveJSProperty('open', false);
});

test('architecture diagram follows the walkthrough', async ({ page }) => {
  await page.goto('/projects/care-bot/');
  await page.locator('.steps li').nth(3).scrollIntoViewIfNeeded();
  await page.evaluate(() => document.querySelectorAll('.steps li')[3].scrollIntoView({ block: 'center' }));
  await expect(page.locator('.steps li.active')).toHaveCount(1);
  expect(await page.locator('svg [data-step].now').count()).toBeGreaterThan(0);
});

test('reduced motion: nothing hidden, no packets', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/projects/care-bot/');
  const hidden = await page.evaluate(() => [...document.querySelectorAll('h2, .role')].filter((e) => parseFloat(getComputedStyle(e).opacity) < 1).length);
  expect(hidden).toBe(0);
  await page.evaluate(() => document.querySelectorAll('.steps li')[3].scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(400);
  expect(await page.locator('.packet').count()).toBe(0);
  await ctx.close();
});

test('manual reduce-motion toggle persists', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-motion-toggle]');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduce');
});

test('project filter works and degrades without JS', async ({ page, browser }) => {
  await page.goto('/projects/');
  await page.click('button[data-tag="RAG"]');
  await expect(page.locator('[data-count]')).toHaveText('1 of 2 projects');
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const p2 = await ctx.newPage();
  await p2.goto('/projects/');
  await expect(p2.locator('.card')).toHaveCount(2);
  await expect(p2.locator('h1')).toBeVisible();
  await ctx.close();
});

test('SEO basics on a case study', async ({ page }) => {
  await page.goto('/projects/care-bot/');
  await expect(page.locator('link[rel=canonical]')).toHaveCount(1);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /og\/projects-care-bot\.png$/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);
  expect((await page.request.get('/og/projects-care-bot.png')).headers()['content-type']).toBe('image/png');
  await page.goto('/');
  const ld = await page.locator('script[type="application/ld+json"]').textContent();
  expect(JSON.parse(ld!)['@type']).toBe('Person');
});

import { test, expect } from '@playwright/test';
import { hasMargin, hasNoMargin } from '../../validators';

test.use({ baseURL: 'http://127.0.0.1:8081' });

test('v4 Vite dev: no console errors, inside scoping works', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // No console errors
  expect(consoleErrors).toEqual([]);

  // Inside .twp: preflight applied (margin reset)
  await hasNoMargin(page.locator('p.twp'));

  // Outside .twp: no preflight (browser default margin)
  await hasMargin(page.locator('body>p:not(.twp)'));
});

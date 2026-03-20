import { test } from '@playwright/test';
import { testTheScenario } from '../utils';
import { hasMargin, hasNoMargin } from '../validators';

test('v4 Vite build: inside scoping works', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './vite/dist/',
      rules: {
        'p.twp': hasNoMargin,
        'body>p:not(.twp)': hasMargin,
      },
    },
    page,
    testInfo,
  );
});

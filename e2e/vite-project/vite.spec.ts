import { test } from '@playwright/test';
import { testTheScenario } from '../utils';
import { hasMargin, hasNoMargin } from '../validators';

test('v3 Vite build: scoped preflight works (#69)', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './vite-project/dist/',
      rules: {
        body: hasMargin,
        'p.tw': hasNoMargin,
        'p.tw~p': hasMargin,
      },
    },
    page,
    testInfo,
  );
});

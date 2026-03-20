import { test } from '@playwright/test';
import { testTheScenario } from '../utils';
import { hasMargin, hasNoMargin } from '../validators';

test('v4 Selector with double colon (stacked Tailwind modifiers)', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './doubleColonSelector/',
      rules: {
        // body keeps default margin (outside container)
        body: hasMargin,
        // inside container: preflight resets margin
        'p.md\\:xl\\:twp-container': hasNoMargin,
        // outside container: margin preserved
        'p.md\\:xl\\:twp-container~p': hasMargin,
      },
    },
    page,
    testInfo,
  );
});

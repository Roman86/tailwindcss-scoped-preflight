import { test } from '@playwright/test';
import { testTheScenario } from '../../utils';
import { hasMargin, hasNoMargin } from '../../validators';

test('v4 Selector with colon (Tailwind modifier syntax)', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './v4/colonSelector/',
      rules: {
        // body keeps default margin (outside container)
        body: hasMargin,
        // inside container: preflight resets margin
        'p.xl\\:twp-container': hasNoMargin,
        // outside container: margin preserved
        'p.xl\\:twp-container~p': hasMargin,
      },
    },
    page,
    testInfo,
  );
});

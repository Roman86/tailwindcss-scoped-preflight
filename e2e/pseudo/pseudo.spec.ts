import { test } from '@playwright/test';
import { testTheScenario } from '../utils';
import { hasHeight, hasMargin } from '../validators';

test('v4 Pseudo-elements, inside strategy', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './pseudo/',
      rules: {
        body: hasMargin,
        '#somecontainer div[data-has-height]': hasHeight,
      },
    },
    page,
    testInfo,
  );
});

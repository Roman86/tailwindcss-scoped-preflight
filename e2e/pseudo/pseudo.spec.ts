import { test } from '@playwright/test';
import { testTheScenario } from '../utils';
import { hasHeight, hasMargin, hasNoHeight } from '../validators';

test('Pseudo-elements', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './pseudo/',
      rules: {
        body: hasMargin,
        '.no-tw div[data-no-height]': hasNoHeight,
        '#somecontainer div[data-has-height]': hasHeight,
      },
    },
    page,
    testInfo,
  );
});

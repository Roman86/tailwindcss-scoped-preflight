import { test } from '@playwright/test';
import { testTheScenario } from '../../utils';
import { coloredBg, hasHeight, hasNoMargin, transparentBg } from '../../validators';

test('v4 Outside of container with pseudo elements', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './v4/pseudoOutside/',
      rules: {
        body: hasNoMargin,
        'div[data-has-height]': hasHeight,
        '.no-twp button': coloredBg,
        'button[data-tw]': transparentBg,
      },
    },
    page,
    testInfo,
  );
});

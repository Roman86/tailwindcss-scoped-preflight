import { test } from '@playwright/test';
import { testTheScenario } from '../utils';
import {
  coloredBg,
  hasHeight,
  hasMargin,
  hasNoHeight,
  hasNoMargin,
  transparentBg,
} from '../validators';

test('Outside of container with pseudo elements', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './pseudoOutside/',
      rules: {
        body: hasNoMargin,
        '.no-tw div[data-no-height]': hasNoHeight,
        'div[data-has-height]': hasHeight,
        '.no-tw button': coloredBg,
        'button[data-tw]': transparentBg,
      },
    },
    page,
    testInfo,
  );
});

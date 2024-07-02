import { test } from '@playwright/test';
import { testTheScenario } from '../utils';
import { coloredBg, hasMargin, hasNoMargin, transparentBg } from '../validators';

test('Outside of container', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './outside/',
      rules: {
        body: hasNoMargin,
        'p.no-tw': hasMargin,
        'p.no-tw+p': hasNoMargin,
        '.no-tw button.tw': transparentBg,
        '.no-tw .tw+button': coloredBg,
      },
    },
    page,
    testInfo,
  );
});

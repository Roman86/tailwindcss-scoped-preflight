import { test } from '@playwright/test';
import { testTheScenario } from '../utils';
import { coloredBg, hasMargin, hasNoMargin, transparentBg } from '../validators';

test('Inside of container', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './inside/',
      rules: {
        body: hasMargin,
        'p.tw': hasNoMargin,
        'p.tw+p': hasMargin,
        'p.tw button.no-tw': coloredBg,
        'p.tw .no-tw+button': transparentBg,
      },
    },
    page,
    testInfo,
  );
});

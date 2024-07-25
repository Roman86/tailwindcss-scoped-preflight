import { test } from '@playwright/test';
import { testTheScenario } from '../utils';
import { coloredBg, hasMargin, hasNoMargin, transparentBg } from '../validators';

test('Inside of container, 2 custom selectors specified', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './inside2/',
      rules: {
        body: hasMargin,
        'p.tw': hasNoMargin,
        'p.tw2': hasNoMargin,
        'p.tw~p:not(.tw,.tw2)': hasMargin,
        'p.tw button.no-tw': coloredBg,
        'p.tw2 button.no-tw': coloredBg,
        'p.tw .no-tw+button': transparentBg,
        'p.tw2 .no-tw+button': transparentBg,
      },
    },
    page,
    testInfo,
  );
});

import { test } from '@playwright/test';
import { testTheScenario } from '../utils';
import { coloredBg, hasMargin, hasNoMargin, transparentBg } from '../validators';

test('Outside of container, 2 selectors', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './outside2/',
      rules: {
        body: hasNoMargin,
        'p.no-tw': hasMargin,
        'p.no-tw-2': hasMargin,
        'p.no-tw~p:not(.no-tw,.no-tw-2)': hasNoMargin,
        '.no-tw button.tw': transparentBg,
        '.no-tw-2 button.tw': transparentBg,
        '.no-tw .tw+button': coloredBg,
        '.no-tw-2 .tw+button': coloredBg,
      },
    },
    page,
    testInfo,
  );
});

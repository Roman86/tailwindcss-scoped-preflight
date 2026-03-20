import { test } from '@playwright/test';
import { testTheScenario } from '../utils';
import { coloredBg, hasMargin, hasNoMargin, transparentBg } from '../validators';

test('v4 Outside of container, 2 selectors', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './outside2/',
      rules: {
        body: hasNoMargin,
        'p.no-twp': hasMargin,
        'p.no-twp-2': hasMargin,
        'p.no-twp~p:not(.no-twp,.no-twp-2)': hasNoMargin,
        '.no-twp button.twp': transparentBg,
        '.no-twp-2 button.twp': transparentBg,
        '.no-twp .twp+button': coloredBg,
        '.no-twp-2 .twp+button': coloredBg,
      },
    },
    page,
    testInfo,
  );
});

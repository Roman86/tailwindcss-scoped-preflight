import { test } from '@playwright/test';
import { testTheScenario } from '../utils';
import { coloredBg, hasLineHeight, hasMargin, hasNoMargin, transparentBg } from '../validators';

test('v4 Outside of container (JS config bridge)', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './outsideJsConfig/',
      rules: {
        body: hasNoMargin,
        'body>button': transparentBg,
        'p.no-twp': hasMargin,
        'body>p:not(.no-twp)': hasNoMargin,
        '.no-twp button.twp': transparentBg,
        '.no-twp .twp+button': coloredBg,
        html: hasLineHeight,
      },
    },
    page,
    testInfo,
  );
});

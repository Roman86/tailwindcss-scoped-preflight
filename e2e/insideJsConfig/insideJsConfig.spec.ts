import { test } from '@playwright/test';
import { testTheScenario } from '../utils';
import { coloredBg, hasHeight, hasLineHeight, hasMargin, hasNoMargin, transparentBg } from '../validators';

test('v4 Inside of container (JS config bridge)', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './insideJsConfig/',
      rules: {
        body: hasMargin,
        'p.twp': hasNoMargin,
        'p.twp~p:not(.twp)': hasMargin,
        'p.twp button.no-twp': coloredBg,
        'p.twp .no-twp+button': transparentBg,
        'body > p.twp': hasLineHeight,
        '.twp div[data-has-height]': hasHeight,
      },
    },
    page,
    testInfo,
  );
});

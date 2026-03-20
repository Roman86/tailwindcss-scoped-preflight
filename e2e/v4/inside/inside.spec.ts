import { test } from '@playwright/test';
import { testTheScenario } from '../../utils';
import { coloredBg, hasHeight, hasLineHeight, hasMargin, hasNoMargin, transparentBg } from '../../validators';

test('v4 Inside of container', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './v4/inside/',
      rules: {
        // ISOL-01: basic inside scoping
        body: hasMargin,
        'p.twp': hasNoMargin,
        'p.twp~p:not(.twp)': hasMargin,
        'p.twp button.no-twp': coloredBg,
        'p.twp .no-twp+button': transparentBg,
        // ISOL-03: root-selector styles moved to container
        'body > p.twp': hasLineHeight,
        // ISOL-04: pseudo-element scoping — visible inside container
        '.twp div[data-has-height]': hasHeight,
      },
    },
    page,
    testInfo,
  );
});

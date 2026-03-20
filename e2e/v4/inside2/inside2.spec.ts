import { test } from '@playwright/test';
import { testTheScenario } from '../../utils';
import { coloredBg, hasMargin, hasNoMargin, transparentBg } from '../../validators';

test('v4 Inside of container, 2 custom selectors specified', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './v4/inside2/',
      rules: {
        body: hasMargin,
        'p.twp': hasNoMargin,
        'p.twp2': hasNoMargin,
        'p.twp~p:not(.twp,.twp2)': hasMargin,
        'p.twp button.no-twp': coloredBg,
        'p.twp2 button.no-twp': coloredBg,
        'p.twp .no-twp+button': transparentBg,
        'p.twp2 .no-twp+button': transparentBg,
      },
    },
    page,
    testInfo,
  );
});

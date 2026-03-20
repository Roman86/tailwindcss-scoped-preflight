import { test } from '@playwright/test';
import { testTheScenario } from '../../utils';
import { coloredBg, hasLineHeight, hasMargin, hasNoMargin, transparentBg } from '../../validators';

test('v4 Outside of container', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './v4/outside/',
      rules: {
        // ISOL-02: basic outside scoping
        body: hasNoMargin,
        'body>button': transparentBg,
        'p.no-twp': hasMargin,
        'body>p:not(.no-twp)': hasNoMargin,
        // plus option: .twp inside .no-twp gets preflight
        '.no-twp button.twp': transparentBg,
        '.no-twp .twp+button': coloredBg,
        // ISOL-03: outside strategy keeps html root styles global
        html: hasLineHeight,
      },
    },
    page,
    testInfo,
  );
});

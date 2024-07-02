import { test } from '@playwright/test';
import { testTheScenario } from '../utils';
import { coloredBg, hasMargin, hasNoMargin, transparentBg } from '../validators';

test('Components', async ({ page }, testInfo) => {
  await testTheScenario(
    {
      url: './components/',
      rules: {
        body: hasMargin,
        'p.comp': hasNoMargin,
        'p.comp~p': hasMargin,
        'p.comp~button': coloredBg,
        'p.comp button': transparentBg,
      },
    },
    page,
    testInfo,
  );
});

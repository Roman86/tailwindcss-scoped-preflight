import { test } from "@playwright/test";
import { testTheScenario } from "../utils";
import {
  coloredBg,
  hasHeight,
  hasLineHeight,
  hasMargin,
  hasNoMargin,
  transparentBg,
} from "../validators";

// Regression test: kebab-case option keys (isolation-strategy) must produce
// the same output as camelCase (isolationStrategy). CSS formatters like
// Prettier lowercase property names, so kebab-case is the formatter-safe form.
test("v4 Inside of container (kebab-case options)", async ({
  page,
}, testInfo) => {
  await testTheScenario(
    {
      url: "./insideKebab/",
      rules: {
        body: hasMargin,
        "p.twp": hasNoMargin,
        "p.twp~p:not(.twp)": hasMargin,
        "p.twp button.no-twp": coloredBg,
        "p.twp .no-twp+button": transparentBg,
        "body > p.twp": hasLineHeight,
        ".twp div[data-has-height]": hasHeight,
      },
    },
    page,
    testInfo,
  );
});

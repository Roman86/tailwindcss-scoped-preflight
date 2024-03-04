import { withOptions } from "tailwindcss/plugin.js";
import postcss from "postcss";
import { type CSSRuleObject } from "tailwindcss/types/config.js";
import { readFileSync } from "fs";
import { booleanFilter } from "./booleanFilter.js";

interface PropsFilterInput {
  selectorSet: Set<string>;
  property: string;
  value: any;
}

export type CustomCssSelector = (ruleSelector: string) => string;

interface PluginOptions {
  cssSelector: CustomCssSelector;
  cssRulePropsFilter?: (input: PropsFilterInput) => boolean | undefined;
}

export const scopedPreflightStyles = withOptions<PluginOptions>(
  ({ cssSelector, cssRulePropsFilter }) =>
    ({ addBase, corePlugins }) => {
      const baseCssPath = require.resolve("tailwindcss/lib/css/preflight.css");
      const baseCssStyles = postcss.parse(
        readFileSync(baseCssPath, "utf8") as string,
      );

      if (typeof cssSelector !== "function") {
        throw new Error(
          "TailwindCssScopedPreflightPlugin: cssSelector option must be a function - custom one or pre-bundled - import { exceptMatched, matchedOnly } from 'tailwindcss-scoped-preflight-plugin')",
        );
      }

      if (corePlugins("preflight")) {
        throw new Error(
          `TailwindCssScopedPreflightPlugin: TailwindCSS corePlugins.preflight config option must be set to false`,
        );
      }

      baseCssStyles.walkRules((rule) => {
        if (cssRulePropsFilter) {
          const selectorSet = new Set(rule.selectors);

          rule.nodes = rule.nodes?.filter((node) => {
            if (node instanceof postcss.Declaration) {
              return (
                cssRulePropsFilter({
                  selectorSet,
                  property: node.prop,
                  value: node.value,
                }) !== false
              );
            }
            return true;
          });
        }
        rule.selectors = rule.selectors
          .map((s) => cssSelector(s))
          .filter(booleanFilter);
        rule.selector = rule.selectors.join(",\n");
        if (!rule.nodes.some((n) => n instanceof postcss.Declaration)) {
          rule.nodes = [];
        }
      });

      addBase(
        baseCssStyles.nodes.filter((node) =>
          node instanceof postcss.Rule
            ? node.nodes.length > 0 && node.selector
            : true,
        ) as unknown as CSSRuleObject[],
      );
    },
  () => ({
    corePlugins: {
      preflight: false,
    },
  }),
);

export * from "./selectors.js";

import { withOptions } from 'tailwindcss/plugin.js';
import postcss from 'postcss';
import { type CSSRuleObject } from 'tailwindcss/types/config.js';
import { readFileSync } from 'fs';

interface PropsFilterInput {
  selectorSet: Set<string>;
  property: string;
  value: any;
}

export type CSSRuleSelectorTransformer = (info: { ruleSelector: string }) => string;

interface PluginOptions {
  isolationStrategy: CSSRuleSelectorTransformer;
  propsFilter?: (input: PropsFilterInput) => boolean | undefined;
}

/**
 * TailwindCSS plugin to scope the preflight styles
 * @param isolationStrategy - function to transform the preflight CSS selectors,
 *  import {@link https://www.npmjs.com/package/tailwindcss-scoped-preflight#isolate-inside-of-container isolateInsideOfContainer},
 *  {@link https://www.npmjs.com/package/tailwindcss-scoped-preflight#isolate-outside-of-container isolateOutsideOfContainer},
 *  {@link https://www.npmjs.com/package/tailwindcss-scoped-preflight#update-your-tailwind-css-configuration isolateForComponents} or write {@link https://www.npmjs.com/package/tailwindcss-scoped-preflight#your-owncustom-isolation-strategy your own}
 * @param propsFilter - function to filter the preflight CSS properties and values, return false to remove the property. Any other value (including true and undefined) will leave the prop intact
 * @link https://www.npmjs.com/package/tailwindcss-scoped-preflight (documentation)
 */
export const scopedPreflightStyles = withOptions<PluginOptions>(
  ({ isolationStrategy, propsFilter }) =>
    ({ addBase, corePlugins }) => {
      const baseCssPath = require.resolve('tailwindcss/lib/css/preflight.css');
      const baseCssStyles = postcss.parse(readFileSync(baseCssPath, 'utf8'));

      if (typeof isolationStrategy !== 'function') {
        throw new Error(
          "TailwindCssScopedPreflightPlugin: isolationStrategy option must be a function - custom one or pre-bundled - import { isolateInsideOfContainer, isolateOutsideOfContainer, isolateForComponents } from 'tailwindcss-scoped-preflight-plugin')",
        );
      }

      if (corePlugins('preflight')) {
        throw new Error(
          `TailwindCssScopedPreflightPlugin: TailwindCSS corePlugins.preflight config option must be set to false`,
        );
      }

      baseCssStyles.walkRules((rule) => {
        if (propsFilter) {
          const selectorSet = new Set(rule.selectors);

          rule.nodes = rule.nodes?.map((node) => {
            if (node instanceof postcss.Declaration) {
              if (
                propsFilter({
                  selectorSet,
                  property: node.prop,
                  value: node.value,
                }) === false
              ) {
                return postcss.comment({
                  text: node.toString(),
                });
              }
            }
            return node;
          });
        }
        rule.selectors = rule.selectors
          .map((s) => isolationStrategy({ ruleSelector: s }))
          .filter((value, index, array) => value && array.indexOf(value) === index);
        rule.selector = rule.selectors.join(',\n');
        if (!rule.nodes.some((n) => n instanceof postcss.Declaration)) {
          rule.nodes = [];
        }
      });

      addBase(
        baseCssStyles.nodes.filter((node, i, all) => {
          const next = all[i + 1];
          return node instanceof postcss.Rule
            ? node.nodes.length > 0 && node.selector
            : node instanceof postcss.Comment
              ? next instanceof postcss.Rule && next.selector && next.nodes.length > 0
              : true;
        }) as unknown as CSSRuleObject[],
      );
    },
  () => ({
    corePlugins: {
      preflight: false,
    },
  }),
);

export * from './strategies.js';

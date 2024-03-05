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

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

type ModifyResult = string | null | undefined;

type ModifyStylesHook = (input: PropsFilterInput) => ModifyResult;

interface PluginOptions {
  isolationStrategy: CSSRuleSelectorTransformer;
  /** @deprecated prefer using modifyPreflightStyles */
  propsFilter?: (input: PropsFilterInput) => boolean | undefined;
  modifyPreflightStyles?: Record<string, Record<string, ModifyResult>> | ModifyStylesHook;
}

/**
 * TailwindCSS plugin to scope the preflight styles
 * @param isolationStrategy - function to transform the preflight CSS selectors,
 *  import {@link https://www.npmjs.com/package/tailwindcss-scoped-preflight#isolate-inside-of-container isolateInsideOfContainer},
 *  {@link https://www.npmjs.com/package/tailwindcss-scoped-preflight#isolate-outside-of-container isolateOutsideOfContainer},
 *  {@link https://www.npmjs.com/package/tailwindcss-scoped-preflight#update-your-tailwind-css-configuration isolateForComponents} or write {@link https://www.npmjs.com/package/tailwindcss-scoped-preflight#your-owncustom-isolation-strategy your own}
 * @deprecated prefer using modifyPreflightStyles
 * @param propsFilter - function to filter the preflight CSS properties and values, return false to remove the property. Any other value (including true and undefined) will leave the prop intact
 * @param modifyPreflightStyles - function to modify the preflight CSS properties and their values, return null to remove the property. Any other returned value will be used as a new value for the property. If you don't want to change it - return the old value (provided in argument object as `value`).
 * @link https://www.npmjs.com/package/tailwindcss-scoped-preflight (documentation)
 */
export const scopedPreflightStyles = withOptions<PluginOptions>(
  ({ isolationStrategy, propsFilter, modifyPreflightStyles }) =>
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

      let modifyStylesHook: ModifyStylesHook | undefined;
      if (typeof modifyPreflightStyles === 'function') {
        modifyStylesHook = modifyPreflightStyles;
      } else if (modifyPreflightStyles) {
        const configEntries = Object.entries(modifyPreflightStyles);
        modifyStylesHook = ({ selectorSet, property, value }) => {
          const matchingEntry = configEntries.find(([sel]) => selectorSet.has(sel));
          return matchingEntry?.[1]?.[property];
        };
      }

      baseCssStyles.walkRules((rule) => {
        if (propsFilter || modifyPreflightStyles) {
          const selectorSet = new Set(rule.selectors);
          rule.nodes = rule.nodes?.map((node) => {
            if (node instanceof postcss.Declaration) {
              const newValue = modifyStylesHook
                ? modifyStylesHook({
                    selectorSet,
                    property: node.prop,
                    value: node.value,
                  })
                : node.value;

              const filterValue = propsFilter
                ? propsFilter({
                    selectorSet,
                    property: node.prop,
                    value: node.value,
                  })
                : true;
              if (filterValue === false || newValue === null) {
                return postcss.comment({
                  text: node.toString(),
                });
              } else if (typeof newValue !== 'undefined' && newValue !== node.value) {
                node.value = newValue;
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

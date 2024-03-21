import { type CSSRuleSelectorTransformer } from './index.js';

interface Options {
  ignore?: string[];
  remove?: string[];
}

type SelectorBasedStrategy = (
  selectors: string | string[],
  options?: Options,
) => CSSRuleSelectorTransformer;

const defaultHandler = (selector: string, { ignore, remove }: Options = {}): string | null => {
  if (remove?.some((s) => selector.includes(s)) === true) {
    return '';
  }
  if (ignore?.some((s) => selector.includes(s)) === true) {
    return selector;
  }
  return null;
};

/**
 * Isolates the TailwindCSS preflight styles inside of the container (assuming all the TailwindCSS is inside of this container)
 *
 * @param containerSelectors
 * @param options
 * @param options.ignore - list of preflight CSS selectors to ignore (don't isolate) - these will not be affected by the transformation
 * @param options.remove - list of preflight CSS selectors to remove from the final CSS - use it if you have any specific conflicts and really want to remove some preflight rules
 *
 * @link https://www.npmjs.com/package/tailwindcss-scoped-preflight#isolate-inside-of-container (example)
 */
export const isolateInsideOfContainer: SelectorBasedStrategy =
  (containerSelectors, options) =>
  ({ ruleSelector }) =>
    defaultHandler(ruleSelector, options) ??
    ([
      'html',
      'body',
      ':host',
    ].includes(ruleSelector)
      ? [containerSelectors].flat().join(',')
      : [containerSelectors]
          .flat()
          .map((s) => `${ruleSelector}:where(${s},${s} *)`)
          .join(','));

/**
 * Isolates the TailwindCSS preflight styles outside of the container (assuming no TailwindCSS inside of it)
 * @param containerSelectors
 * @param options
 * @param options.ignore - list of preflight CSS selectors to ignore (don't isolate) - these will not be affected by the transformation
 * @param options.remove - list of preflight CSS selectors to remove from the final CSS - use it if you have any specific conflicts and really want to remove some preflight rules
 *
 * @link https://www.npmjs.com/package/tailwindcss-scoped-preflight#isolate-outside-of-container (example)
 */
export const isolateOutsideOfContainer: SelectorBasedStrategy =
  (containerSelectors, options) =>
  ({ ruleSelector }) =>
    defaultHandler(ruleSelector, options) ??
    ([
      'html',
      'body',
      ':host',
    ].includes(ruleSelector)
      ? ruleSelector
      : `${ruleSelector}:where(:not(${[containerSelectors]
          .flat()
          .map((s) => `${s},${s} *`)
          .join(',')}))`);

/**
 * Isolates the TailwindCSS preflight styles within the component selector (not inside of the container, but immediately)
 * @param componentSelectors
 * @param options
 * @param options.ignore - list of preflight CSS selectors to ignore (don't isolate) - these will not be affected by the transformation
 * @param options.remove - list of preflight CSS selectors to remove from the final CSS - use it if you have any specific conflicts and really want to remove some preflight rules
 *
 * @link https://www.npmjs.com/package/tailwindcss-scoped-preflight#update-your-tailwind-css-configuration (example)
 */
export const isolateForComponents: SelectorBasedStrategy =
  (componentSelectors, options): CSSRuleSelectorTransformer =>
  ({ ruleSelector }) =>
    defaultHandler(ruleSelector, options) ??
    ([
      'html',
      'body',
      ':host',
    ].includes(ruleSelector)
      ? `${ruleSelector} :where(${[componentSelectors].flat().join(',')})`
      : `${ruleSelector}:where(${[componentSelectors]
          .flat()
          .map((s) => `${s},${s} *`)
          .join(',')})`);

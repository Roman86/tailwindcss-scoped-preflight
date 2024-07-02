import { type CSSRuleSelectorTransformer } from './index';

interface Options {
  ignore?: string[];
  remove?: string[];
}

type SelectorBasedStrategy<ExtraOptions = unknown> = (
  selectors: string | string[],
  options?: Options & ExtraOptions,
) => CSSRuleSelectorTransformer;

const optionsHandlerForIgnoreAndRemove = (
  selector: string,
  { ignore, remove }: Options = {},
): string | null => {
  if (remove?.some((s) => selector.includes(s)) === true) {
    return '';
  }
  if (ignore?.some((s) => selector.includes(s)) === true) {
    return selector;
  }
  return null;
};

const roots = new Set([
  'html',
  'body',
  ':host',
]);

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
export const isolateInsideOfContainer: SelectorBasedStrategy<{ except?: string }> = (
  containerSelectors,
  options,
) => {
  const whereNotExcept =
    typeof options?.except === 'string' && options.except
      ? `:where(:not(${options.except},${options.except} *))`
      : '';
  return ({ ruleSelector }) =>
    optionsHandlerForIgnoreAndRemove(ruleSelector, options) ??
    (roots.has(ruleSelector)
      ? [containerSelectors]
          .flat()
          .map((cont) => `${cont}${whereNotExcept}`)
          .join(',')
      : [containerSelectors]
          .flat()
          .map((s) => `${ruleSelector}:where(${s},${s} *)${whereNotExcept}`)
          .join(','));
};

/**
 * Isolates the TailwindCSS preflight styles outside of the container (assuming no TailwindCSS inside of it)
 * @param containerSelectors
 * @param options
 * @param options.ignore - list of preflight CSS selectors to ignore (don't isolate) - these will not be affected by the transformation
 * @param options.remove - list of preflight CSS selectors to remove from the final CSS - use it if you have any specific conflicts and really want to remove some preflight rules
 *
 * @link https://www.npmjs.com/package/tailwindcss-scoped-preflight#isolate-outside-of-container (example)
 */
export const isolateOutsideOfContainer: SelectorBasedStrategy<{ plus?: string }> = (
  containerSelectors,
  options,
) => {
  const whereNotContainerSelector = `:where(:not(${[containerSelectors]
    .flat()
    .map((s) => `${s},${s} *`)
    .join(',')}))`;

  const insideOfContainerLogic =
    typeof options?.plus === 'string' && options.plus
      ? isolateInsideOfContainer(options.plus)
      : null;

  return ({ ruleSelector }) => {
    const ignoreOrRemove = optionsHandlerForIgnoreAndRemove(ruleSelector, options);
    if (ignoreOrRemove != null) {
      return ignoreOrRemove;
    }

    if (roots.has(ruleSelector)) {
      return ruleSelector;
    }

    return [
      `${ruleSelector}${whereNotContainerSelector}`,
      insideOfContainerLogic?.({ ruleSelector }),
    ]
      .filter(Boolean)
      .join(',');
  };
};

/**
 * Isolates the TailwindCSS preflight styles within the component selector (not inside of the container, but immediately)
 * @param componentSelectors
 * @param options
 * @param options.ignore - list of preflight CSS selectors to ignore (don't isolate) - these will not be affected by the transformation
 * @param options.remove - list of preflight CSS selectors to remove from the final CSS - use it if you have any specific conflicts and really want to remove some preflight rules
 *
 * @link https://www.npmjs.com/package/tailwindcss-scoped-preflight#update-your-tailwind-css-configuration (example)
 */
export const isolateForComponents: SelectorBasedStrategy = (
  componentSelectors,
  options,
): CSSRuleSelectorTransformer => {
  const componentSelectorsArray = [componentSelectors].flat();
  const whereComponentSelectorsDirect = `:where(${componentSelectorsArray.join(',')})`;
  const whereComponentSelectorsWithSubs = `:where(${componentSelectorsArray
    .map((s) => `${s},${s} *`)
    .join(',')})`;

  return ({ ruleSelector }) =>
    optionsHandlerForIgnoreAndRemove(ruleSelector, options) ??
    (roots.has(ruleSelector)
      ? `${ruleSelector} ${whereComponentSelectorsDirect}`
      : `${ruleSelector}${whereComponentSelectorsWithSubs}`);
};

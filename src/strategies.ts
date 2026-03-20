export type CSSRuleSelectorTransformer = (info: { ruleSelector: string }) => string;

export interface StrategyBaseOptions {
  ignore?: string[];
  remove?: string[];
}

export interface InsideStrategyOptions extends StrategyBaseOptions {
  except?: string;
  rootStyles?: 'move to container' | 'add :where';
}

export interface OutsideStrategyOptions extends StrategyBaseOptions {
  plus?: string;
}

const optionsHandlerForIgnoreAndRemove = (
  selector: string,
  { ignore, remove }: StrategyBaseOptions = {},
): string | null => {
  if (remove?.some((s) => selector.includes(s)) === true) {
    return '';
  }
  if (ignore?.some((s) => selector.includes(s)) === true) {
    return selector;
  }
  return null;
};

const roots = new Set(['html', 'body', ':host']);
function isRootSelector(selector: string) {
  return roots.has(selector);
}

function isBeforeOrAfter(ruleSelector: string) {
  return ruleSelector.includes('::before') || ruleSelector.includes('::after');
}
function isPseudoElementSelector(ruleSelector: string) {
  return ruleSelector.includes('::');
}

/**
 * Isolates the TailwindCSS preflight styles inside of the container (assuming all the TailwindCSS is inside of this container)
 *
 * @param containerSelectors
 * @param options
 * @param options.ignore - list of preflight CSS selectors to ignore (don't isolate) - these will not be affected by the transformation
 * @param options.remove - list of preflight CSS selectors to remove from the final CSS - use it if you have any specific conflicts and really want to remove some preflight rules
 * @param options.rootStyles - 'move to container' (default) - moves the root styles to the container styles (by simply replacing the selector), 'add :where' - adds ` :where` to the root selector so styles are still in roots, but only matching items would be affected
 *
 * @link https://www.npmjs.com/package/tailwindcss-scoped-preflight#isolate-inside-of-container (example)
 */
export function isolateInsideOfContainer(
  containerSelectors: string | string[],
  options?: InsideStrategyOptions,
): CSSRuleSelectorTransformer {
  const whereNotExcept =
    typeof options?.except === 'string' && options.except
      ? `:where(:not(${options.except},${options.except} *))`
      : '';

  const selectorsArray = [containerSelectors].flat();
  const whereDirect = `:where(${selectorsArray.join(',')})`;
  const whereWithSubs = `:where(${selectorsArray.map((s) => `${s},${s} *`).join(',')})`;

  return ({ ruleSelector }) => {
    const handled = optionsHandlerForIgnoreAndRemove(ruleSelector, options);
    if (handled != null) {
      return handled;
    }

    if (isRootSelector(ruleSelector)) {
      if (options?.rootStyles === 'add :where') {
        return `${ruleSelector}${whereNotExcept} ${whereDirect}`;
      }
      return selectorsArray.map((s) => `${s}${whereNotExcept}`).join(',');
    } else if (isBeforeOrAfter(ruleSelector)) {
      return `${whereWithSubs}${whereNotExcept}${ruleSelector}`;
    } else if (isPseudoElementSelector(ruleSelector)) {
      return `${whereWithSubs}${whereNotExcept} ${ruleSelector}`;
    } else {
      return `${ruleSelector}${whereWithSubs}${whereNotExcept}`;
    }
  };
}

/**
 * Isolates the TailwindCSS preflight styles outside of the container (assuming no TailwindCSS inside of it)
 * @param containerSelectors
 * @param options
 * @param options.ignore - list of preflight CSS selectors to ignore (don't isolate) - these will not be affected by the transformation
 * @param options.remove - list of preflight CSS selectors to remove from the final CSS - use it if you have any specific conflicts and really want to remove some preflight rules
 *
 * @link https://www.npmjs.com/package/tailwindcss-scoped-preflight#isolate-outside-of-container (example)
 */
export function isolateOutsideOfContainer(
  containerSelectors: string | string[],
  options?: OutsideStrategyOptions,
): CSSRuleSelectorTransformer {
  const whereNotContainerSelector = `:where(:not(${[containerSelectors]
    .flat()
    .map((s) => `${s},${s} *`)
    .join(',')}))`;

  const insideOfContainerLogic =
    typeof options?.plus === 'string' && options.plus
      ? isolateInsideOfContainer(options.plus)
      : null;

  return ({ ruleSelector, ...rest }) => {
    const ignoreOrRemove = optionsHandlerForIgnoreAndRemove(ruleSelector, options);
    if (ignoreOrRemove != null) {
      return ignoreOrRemove;
    }

    if (isRootSelector(ruleSelector)) {
      return ruleSelector;
    }

    return [
      isBeforeOrAfter(ruleSelector)
        ? `${whereNotContainerSelector}${ruleSelector}`
        : isPseudoElementSelector(ruleSelector)
          ? `${whereNotContainerSelector} ${ruleSelector}`
          : `${ruleSelector}${whereNotContainerSelector}`,
      insideOfContainerLogic?.({ ruleSelector, ...rest }),
    ]
      .filter(Boolean)
      .join(',');
  };
}

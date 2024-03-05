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
          .map((s) => `${s} ${ruleSelector}`)
          .join(','));

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

export const isolateForComponents =
  (componentSelectors: string | string[], options: Options): CSSRuleSelectorTransformer =>
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

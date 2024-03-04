import { type CustomCssSelector } from "./index.js";

interface Options {
  ignore?: string[];
  remove?: string[];
}

type PreBundledCssSelector = (
  customSelector: string,
  options?: Options,
) => CustomCssSelector;

const defaultHandler = (
  selector: string,
  { ignore, remove }: Options = {},
): string | null => {
  if (remove?.some((s) => selector.includes(s)) === true) {
    return "";
  }
  if (ignore?.some((s) => selector.includes(s)) === true) {
    return selector;
  }
  return null;
};

const exceptMatched: PreBundledCssSelector =
  (customSelector, options) => (ruleSelector) =>
    defaultHandler(ruleSelector, options) ??
    `${ruleSelector}:where(:not(${customSelector} *))`;
const matchedOnly: PreBundledCssSelector =
  (customSelector, options) => (ruleSelector) =>
    defaultHandler(ruleSelector, options) ??
    `${ruleSelector}:where(${customSelector},${customSelector} *)`;

export { exceptMatched, matchedOnly };

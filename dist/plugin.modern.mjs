import { withOptions } from 'tailwindcss/plugin.js';
import postcss from 'postcss';
import { readFileSync } from 'fs';

const optionsHandlerForIgnoreAndRemove = (selector, {
  ignore,
  remove
} = {}) => {
  if ((remove == null ? void 0 : remove.some(s => selector.includes(s))) === true) {
    return '';
  }
  if ((ignore == null ? void 0 : ignore.some(s => selector.includes(s))) === true) {
    return selector;
  }
  return null;
};
const roots = new Set(['html', 'body', ':host']);
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
const isolateInsideOfContainer = (containerSelectors, options) => {
  const whereNotExcept = typeof (options == null ? void 0 : options.except) === 'string' && options.except ? `:where(:not(${options.except},${options.except} *))` : '';
  return ({
    ruleSelector
  }) => {
    var _optionsHandlerForIgn;
    return (_optionsHandlerForIgn = optionsHandlerForIgnoreAndRemove(ruleSelector, options)) != null ? _optionsHandlerForIgn : roots.has(ruleSelector) ? [containerSelectors].flat().map(cont => `${cont}${whereNotExcept}`).join(',') : [containerSelectors].flat().map(s => `${ruleSelector}:where(${s},${s} *)${whereNotExcept}`).join(',');
  };
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
const isolateOutsideOfContainer = (containerSelectors, options) => {
  const whereNotContainerSelector = `:where(:not(${[containerSelectors].flat().map(s => `${s},${s} *`).join(',')}))`;
  const insideOfContainerLogic = typeof (options == null ? void 0 : options.plus) === 'string' && options.plus ? isolateInsideOfContainer(options.plus) : null;
  return ({
    ruleSelector
  }) => {
    const ignoreOrRemove = optionsHandlerForIgnoreAndRemove(ruleSelector, options);
    if (ignoreOrRemove != null) {
      return ignoreOrRemove;
    }
    if (roots.has(ruleSelector)) {
      return ruleSelector;
    }
    return [`${ruleSelector}${whereNotContainerSelector}`, insideOfContainerLogic == null ? void 0 : insideOfContainerLogic({
      ruleSelector
    })].filter(Boolean).join(',');
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
const isolateForComponents = (componentSelectors, options) => {
  const componentSelectorsArray = [componentSelectors].flat();
  const whereComponentSelectorsDirect = `:where(${componentSelectorsArray.join(',')})`;
  const whereComponentSelectorsWithSubs = `:where(${componentSelectorsArray.map(s => `${s},${s} *`).join(',')})`;
  return ({
    ruleSelector
  }) => {
    var _optionsHandlerForIgn2;
    return (_optionsHandlerForIgn2 = optionsHandlerForIgnoreAndRemove(ruleSelector, options)) != null ? _optionsHandlerForIgn2 : roots.has(ruleSelector) ? `${ruleSelector} ${whereComponentSelectorsDirect}` : `${ruleSelector}${whereComponentSelectorsWithSubs}`;
  };
};

/**
 * TailwindCSS plugin to scope the preflight styles
 * @param isolationStrategy - function to transform the preflight CSS selectors,
 *  import {@link https://www.npmjs.com/package/tailwindcss-scoped-preflight#isolate-inside-of-container isolateInsideOfContainer},
 *  {@link https://www.npmjs.com/package/tailwindcss-scoped-preflight#isolate-outside-of-container isolateOutsideOfContainer},
 *  {@link https://www.npmjs.com/package/tailwindcss-scoped-preflight#update-your-tailwind-css-configuration isolateForComponents} or write {@link https://www.npmjs.com/package/tailwindcss-scoped-preflight#your-owncustom-isolation-strategy your own}
 * @param propsFilter - function to filter the preflight CSS properties and values, return false to remove the property. Any other value (including true and undefined) will leave the prop intact
 * @param modifyPreflightStyles - function to modify the preflight CSS properties and their values, return null to remove the property. Any other returned value will be used as a new value for the property. If you don't want to change it - return the old value (provided in argument object as `value`).
 * @link https://www.npmjs.com/package/tailwindcss-scoped-preflight (documentation)
 */
const scopedPreflightStyles = withOptions(({
  isolationStrategy,
  propsFilter,
  modifyPreflightStyles
}) => ({
  addBase,
  corePlugins
}) => {
  const baseCssPath = require.resolve('tailwindcss/lib/css/preflight.css');
  const baseCssStyles = postcss.parse(readFileSync(baseCssPath, 'utf8'));
  if (typeof isolationStrategy !== 'function') {
    throw new Error("TailwindCssScopedPreflightPlugin: isolationStrategy option must be a function - custom one or pre-bundled - import { isolateInsideOfContainer, isolateOutsideOfContainer, isolateForComponents } from 'tailwindcss-scoped-preflight-plugin')");
  }
  if (corePlugins('preflight')) {
    throw new Error(`TailwindCssScopedPreflightPlugin: TailwindCSS corePlugins.preflight config option must be set to false`);
  }
  let modifyStylesHook;
  if (typeof modifyPreflightStyles === 'function') {
    modifyStylesHook = modifyPreflightStyles;
  } else if (modifyPreflightStyles) {
    const configEntries = Object.entries(modifyPreflightStyles);
    modifyStylesHook = ({
      selectorSet,
      property,
      value
    }) => {
      var _matchingEntry$;
      const matchingEntry = configEntries.find(([sel]) => selectorSet.has(sel));
      return matchingEntry == null || (_matchingEntry$ = matchingEntry[1]) == null ? void 0 : _matchingEntry$[property];
    };
  }
  baseCssStyles.walkRules(rule => {
    if (propsFilter || modifyPreflightStyles) {
      var _rule$nodes;
      const selectorSet = new Set(rule.selectors);
      rule.nodes = (_rule$nodes = rule.nodes) == null ? void 0 : _rule$nodes.map(node => {
        if (node instanceof postcss.Declaration) {
          const newValue = modifyStylesHook ? modifyStylesHook({
            selectorSet,
            property: node.prop,
            value: node.value
          }) : node.value;
          const filterValue = propsFilter ? propsFilter({
            selectorSet,
            property: node.prop,
            value: node.value
          }) : true;
          if (filterValue === false || newValue === null) {
            return postcss.comment({
              text: node.toString()
            });
          } else if (typeof newValue !== 'undefined' && newValue !== node.value) {
            node.value = newValue;
          }
        }
        return node;
      });
    }
    rule.selectors = rule.selectors.map(s => isolationStrategy({
      ruleSelector: s
    })).filter((value, index, array) => value && array.indexOf(value) === index);
    rule.selector = rule.selectors.join(',\n');
    if (!rule.nodes.some(n => n instanceof postcss.Declaration)) {
      rule.nodes = [];
    }
  });
  addBase(baseCssStyles.nodes.filter((node, i, all) => {
    const next = all[i + 1];
    return node instanceof postcss.Rule ? node.nodes.length > 0 && node.selector : node instanceof postcss.Comment ? next instanceof postcss.Rule && next.selector && next.nodes.length > 0 : true;
  }));
}, () => ({
  corePlugins: {
    preflight: false
  }
}));

export { isolateForComponents, isolateInsideOfContainer, isolateOutsideOfContainer, scopedPreflightStyles };
//# sourceMappingURL=plugin.modern.mjs.map

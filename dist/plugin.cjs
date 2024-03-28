var plugin_js = require('tailwindcss/plugin.js');
var postcss = require('postcss');
var fs = require('fs');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var postcss__default = /*#__PURE__*/_interopDefaultLegacy(postcss);

const defaultHandler = (selector, {
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
const isolateInsideOfContainer = (containerSelectors, options) => ({
  ruleSelector
}) => {
  var _defaultHandler;
  return (_defaultHandler = defaultHandler(ruleSelector, options)) != null ? _defaultHandler : ['html', 'body', ':host'].includes(ruleSelector) ? [containerSelectors].flat().join(',') : [containerSelectors].flat().map(s => `${ruleSelector}:where(${s},${s} *)`).join(',');
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
const isolateOutsideOfContainer = (containerSelectors, options) => ({
  ruleSelector
}) => {
  var _defaultHandler2;
  return (_defaultHandler2 = defaultHandler(ruleSelector, options)) != null ? _defaultHandler2 : ['html', 'body', ':host'].includes(ruleSelector) ? ruleSelector : `${ruleSelector}:where(:not(${[containerSelectors].flat().map(s => `${s},${s} *`).join(',')}))`;
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
const isolateForComponents = (componentSelectors, options) => ({
  ruleSelector
}) => {
  var _defaultHandler3;
  return (_defaultHandler3 = defaultHandler(ruleSelector, options)) != null ? _defaultHandler3 : ['html', 'body', ':host'].includes(ruleSelector) ? `${ruleSelector} :where(${[componentSelectors].flat().join(',')})` : `${ruleSelector}:where(${[componentSelectors].flat().map(s => `${s},${s} *`).join(',')})`;
};

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
const scopedPreflightStyles = plugin_js.withOptions(({
  isolationStrategy,
  propsFilter,
  modifyPreflightStyles
}) => ({
  addBase,
  corePlugins
}) => {
  const baseCssPath = require.resolve('tailwindcss/lib/css/preflight.css');
  const baseCssStyles = postcss__default["default"].parse(fs.readFileSync(baseCssPath, 'utf8'));
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
        if (node instanceof postcss__default["default"].Declaration) {
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
            return postcss__default["default"].comment({
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
    if (!rule.nodes.some(n => n instanceof postcss__default["default"].Declaration)) {
      rule.nodes = [];
    }
  });
  addBase(baseCssStyles.nodes.filter((node, i, all) => {
    const next = all[i + 1];
    return node instanceof postcss__default["default"].Rule ? node.nodes.length > 0 && node.selector : node instanceof postcss__default["default"].Comment ? next instanceof postcss__default["default"].Rule && next.selector && next.nodes.length > 0 : true;
  }));
}, () => ({
  corePlugins: {
    preflight: false
  }
}));

exports.isolateForComponents = isolateForComponents;
exports.isolateInsideOfContainer = isolateInsideOfContainer;
exports.isolateOutsideOfContainer = isolateOutsideOfContainer;
exports.scopedPreflightStyles = scopedPreflightStyles;
//# sourceMappingURL=plugin.cjs.map

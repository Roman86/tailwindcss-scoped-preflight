var plugin_js = require('tailwindcss/plugin.js');
var fs = require('fs');
var postcss = require('postcss');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var postcss__default = /*#__PURE__*/_interopDefaultLegacy(postcss);

const scopedPreflightStyles = plugin_js.withOptions(({
  enable = true,
  preflightSelector: preflightSelector
}) => ({
  addBase,
  corePlugins
}) => {
  if (!enable) {
    return () => undefined;
  }
  const preflightCssPath = require.resolve('tailwindcss/lib/css/preflight.css');
  if (!preflightSelector) {
    throw new Error('TailwindCssScopedPreflightPlugin: selector to manually enable the TailwindCss preflight styles is not provided');
  }
  if (corePlugins('preflight')) {
    throw new Error(`TailwindCssScopedPreflightPlugin: set corePlugins.preflight config option (TailwindCSS) to false or explicitly tell tailwindcss-scoped-preflight plugin to do so by using the disableCorePreflight option`);
  }
  const preflightStyles = postcss__default["default"].parse(fs.readFileSync(preflightCssPath, 'utf8'));
  // Scope the selectors to specific components
  preflightStyles.walkRules(rule => {
    rule.selectors = rule.selectors.map(s => `${s}:where(${preflightSelector},${preflightSelector} *)`);
    rule.selector = rule.selectors.join(',\n');
  });
  addBase(preflightStyles.nodes);
}, ({
  enable = true,
  disableCorePreflight
}) => enable && disableCorePreflight ? {
  corePlugins: {
    preflight: false
  }
} : {});

exports.scopedPreflightStyles = scopedPreflightStyles;
//# sourceMappingURL=plugin.cjs.map

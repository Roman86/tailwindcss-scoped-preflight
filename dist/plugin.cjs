var plugin_js = require('tailwindcss/plugin.js');
var fs = require('fs');
var postcss = require('postcss');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var postcss__default = /*#__PURE__*/_interopDefaultLegacy(postcss);

const scopedPreflightStyles = plugin_js.withOptions(({
  mode,
  cssSelector
}) => ({
  addBase,
  corePlugins
}) => {
  const baseCssPath = require.resolve('tailwindcss/lib/css/preflight.css');
  const baseCssStyles = postcss__default["default"].parse(fs.readFileSync(baseCssPath, 'utf8'));
  if (!cssSelector) {
    throw new Error('TailwindCssScopedPreflightPlugin: cssSelector options is not provided');
  }
  if (corePlugins('preflight')) {
    throw new Error(`TailwindCssScopedPreflightPlugin: TailwindCSS corePlugins.preflight config option must be set to false`);
  }
  baseCssStyles.walkRules(rule => {
    rule.selectors = rule.selectors.map(s => {
      if (mode === 'except matched') {
        return `${s}:where(:not(${cssSelector} *))`;
      } else if (mode === 'under matched' && ['html', ':host', 'body'].includes(s)) {
        return cssSelector;
      } else {
        // matched only
        return `${s}:where(${cssSelector},${cssSelector} *)`;
      }
    });
    rule.selector = rule.selectors.filter((value, index, array) => array.indexOf(value) === index).join(',\n');
  });
  addBase(baseCssStyles.nodes);
}, () => ({
  corePlugins: {
    preflight: false
  }
}));

exports.scopedPreflightStyles = scopedPreflightStyles;
//# sourceMappingURL=plugin.cjs.map

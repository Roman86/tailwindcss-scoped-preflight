import { withOptions } from 'tailwindcss/plugin.js';
import { readFileSync } from 'fs';
import postcss from 'postcss';

const scopedPreflightStyles = withOptions(({
  mode,
  cssSelector
}) => ({
  addBase,
  corePlugins
}) => {
  const baseCssPath = require.resolve('tailwindcss/lib/css/preflight.css');
  const baseCssStyles = postcss.parse(readFileSync(baseCssPath, 'utf8'));
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

export { scopedPreflightStyles };
//# sourceMappingURL=plugin.esm.js.map

import { withOptions } from 'tailwindcss/plugin.js';
import { readFileSync } from 'fs';
import postcss from 'postcss';

const scopedPreflightStyles = withOptions(({
  enable: _enable = true,
  preflightSelector: preflightSelector
}) => ({
  addBase,
  corePlugins
}) => {
  if (!_enable) {
    return () => undefined;
  }
  const preflightCssPath = require.resolve('tailwindcss/lib/css/preflight.css');
  if (!preflightSelector) {
    throw new Error('TailwindCssScopedPreflightPlugin: selector to manually enable the TailwindCss preflight styles is not provided');
  }
  if (corePlugins('preflight')) {
    throw new Error(`TailwindCssScopedPreflightPlugin: set corePlugins.preflight config option (TailwindCSS) to false or explicitly tell tailwindcss-scoped-preflight plugin to do so by using the disableCorePreflight option`);
  }
  const preflightStyles = postcss.parse(readFileSync(preflightCssPath, 'utf8'));
  // Scope the selectors to specific components
  preflightStyles.walkRules(rule => {
    rule.selectors = rule.selectors.map(s => `${s}:where(${preflightSelector},${preflightSelector} *)`);
    rule.selector = rule.selectors.join(',\n');
  });
  addBase(preflightStyles.nodes);
}, ({
  enable: _enable2 = true,
  disableCorePreflight
}) => _enable2 && disableCorePreflight ? {
  corePlugins: {
    preflight: false
  }
} : {});

export { scopedPreflightStyles };
//# sourceMappingURL=plugin.mjs.map
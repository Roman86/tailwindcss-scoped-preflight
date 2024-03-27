import { isolateForComponents, scopedPreflightStyles } from '../dist/plugin';

module.exports = {
  content: ['**/*.html'],
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateForComponents(
        [
          '.twp',
          '.comp',
        ], // selector or array of selectors
        {
          // ignore: ["html", ":host", "*"], // these will not be affected by the transformation
          // remove: [":before", ":after"], // this will remove mentioned rules completely
        },
      ),

      // or make your own rules transformation
      // isolationStrategy: ({ ruleSelector }) =>
      //   ruleSelector === "*"
      //     ? "" // removes the rule (specified selector only)
      //     : ["html", ":host"].includes(ruleSelector)
      //       ? ruleSelector // keeps the original selector
      //       : enableForSelector(".twp")(ruleSelector), // otherwise, transforms selector as per selected behaviour (scoped to .twp)

      // it's also possible to filter out some properties
      // (deprecated - prefer using modifyPreflightStyles instead of propFilter)
      propsFilter: ({ selectorSet, property, value }) =>
        // return false to remove the property. Any other value (including true and undefined) will leave the prop intact
        ![
          // removes the margin reset from a body rule
          selectorSet.has('body') && ['margin'].includes(property),
          // removes the box-sizing: border-box whenever it's found
          property === 'box-sizing' && value === 'border-box',
          // removes the font-family (except inherit) from all the rules
          property === 'font-family' && value !== 'inherit',
        ].some(Boolean),
      // preferred way to modify the preflight styles
      modifyPreflightStyles: ({ selectorSet, property, value }) => {
        // let's say you want to override the font family
        if (property === 'font-family' && value !== 'inherit') {
          return '"Open Sans", sans-serif';
        }
        // or body margin
        if (selectorSet.has('body') && property === 'margin') {
          return '0 4px';
        }
        // if you want to remove some property - return null
        if (selectorSet.has('html') && property === 'line-height') {
          return null;
        }
        // to keep the property as it is - you may return the original value;
        // but returning undefined would have the same effect,
        // so you may just omit such default return
        return value;
      },
    }),
  ],
};

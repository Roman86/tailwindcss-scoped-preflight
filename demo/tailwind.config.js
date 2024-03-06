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
      propsFilter: ({ selectorSet, property, value }) =>
        ![
          // removes the margin reset from a body rule
          selectorSet.has('body') && ['margin'].includes(property),
          // removes the box-sizing: border-box whenever it's found
          property === 'box-sizing' && value === 'border-box',
          // removes the font-family (except inherit) from all the rules
          property === 'font-family' && value !== 'inherit',
        ].some(Boolean), // yep, "some" approach is a bit slower because it will evaluate all array conditions anyway, but it's more readable without || operators
    }),
  ],
};

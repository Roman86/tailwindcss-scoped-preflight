import { isolateForComponents, scopedPreflightStyles } from '../dist/plugin';

module.exports = {
  content: ['**/*.html'],
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: ({ ruleSelector, ...rest }) => {
        if (ruleSelector === '*') {
          // returning an empty string or null removes the CSS rule
          return '';
        }

        // some selector transformation for html, :host and body rules
        if (
          [
            'html',
            ':host',
            'body',
          ].includes(ruleSelector)
        ) {
          return `${ruleSelector} .twp`;
        }

        // and by default - transform it as per components strategy (just for example),
        return isolateForComponents('.twp')({ ruleSelector, ...rest });
      },

      // preferred way to modify the preflight styles
      modifyPreflightStyles: {
        html: {
          'line-height': null,
        },
        body: {
          margin: '0 4px',
          color: 'red',
        },
      },
    }),
  ],
};

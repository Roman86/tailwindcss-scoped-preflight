import { isolateOutsideOfContainer, scopedPreflightStyles } from '../../dist/index.js';

module.exports = {
  content: ['**/*.html'],
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateOutsideOfContainer(
        [
          '.no-tw',
          '.no-tw-2',
        ],
        {
          plus: '.tw',
        },
      ),
    }),
  ],
};

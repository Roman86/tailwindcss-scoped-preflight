import { isolateInsideOfContainer, scopedPreflightStyles } from '../../dist/index.js';

module.exports = {
  content: ['**/*.html'],
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateInsideOfContainer('.tw', {
        except: '.no-tw',
      }),
    }),
  ],
};

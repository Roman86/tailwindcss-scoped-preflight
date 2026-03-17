import { isolateInsideOfContainer, scopedPreflightStyles } from '../../dist/index.js';

module.exports = {
  content: ['**/*.html'],
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateInsideOfContainer(['.tw', '.tw2'], {
        except: '.no-tw',
      }),
    }),
  ],
};

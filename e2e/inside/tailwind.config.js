import { isolateInsideOfContainer, scopedPreflightStyles } from '../../dist/plugin.esm';

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

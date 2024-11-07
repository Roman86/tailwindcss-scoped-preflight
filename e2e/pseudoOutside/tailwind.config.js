import { isolateOutsideOfContainer, scopedPreflightStyles } from '../../dist/plugin.esm';

module.exports = {
  content: ['**/*.html'],
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateOutsideOfContainer('.no-tw'),
    }),
  ],
};

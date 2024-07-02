import { isolateForComponents, scopedPreflightStyles } from '../../dist/plugin.esm';

module.exports = {
  content: ['**/*.html'],
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateForComponents('.comp'),
    }),
  ],
};

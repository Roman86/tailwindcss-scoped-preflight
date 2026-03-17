import { isolateForComponents, scopedPreflightStyles } from '../../dist/index.js';

module.exports = {
  content: ['**/*.html'],
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateForComponents('.comp'),
    }),
  ],
};

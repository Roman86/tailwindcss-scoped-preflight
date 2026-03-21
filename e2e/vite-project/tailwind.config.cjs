const { isolateInsideOfContainer, scopedPreflightStyles } = require('tailwindcss-scoped-preflight');

module.exports = {
  content: ['**/*.html'],
  plugins: [
    scopedPreflightStyles({
      isolationStrategy: isolateInsideOfContainer('.tw'),
    }),
  ],
};

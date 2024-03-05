module.exports = {
  plugins: [
    // relative paths are usually required so Prettier can find the plugin
    './node_modules/prettier-plugin-multiline-arrays/dist/index.js', // plugin added here
  ],
  printWidth: 100,
  trailingComma: 'all',
  semi: true,
  bracketSpacing: true,
  singleQuote: true,
  useTabs: false,
  tabWidth: 2,
  endOfLine: 'lf',
  multilineArraysWrapThreshold: 1,
  // overrides: [
  //   {
  //     files: "*.json",
  //     options: {
  //       tabWidth: 2
  //     }
  //   }
  // ]
};

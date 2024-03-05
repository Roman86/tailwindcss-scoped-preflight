const jsRules = {
  semi: 'off',
  'import/no-webpack-loader-syntax': 'warn',
  'comma-dangle': [
    1,
    'always-multiline',
  ],
};

const extendsList = (isTs) =>
  [
    'eslint:recommended',
    isTs && 'standard-with-typescript',
    'prettier',
  ].filter(Boolean);

export default {
  env: {
    browser: true,
    es2021: true,
  },
  root: true, // for @typescript-eslint
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      arrowFunctions: true,
    },
  },
  plugins: [
    '@typescript-eslint',
    'promise',
  ],
  extends: extendsList(false),
  settings: {},
  globals: {
    google: 'readonly',
  },
  ignorePatterns: [
    '**/*.d.ts',
    'node_modules',
  ],
  rules: jsRules,
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: [
        '*.ts',
        '*.mts',
        '*.cts',
        '*.tsx',
      ],
      extends: extendsList(true),
      rules: {
        ...jsRules,
        '@typescript-eslint/explicit-function-return-type': [
          'error',
          {
            allowFunctionsWithoutTypeParameters: true,
          },
        ],
        '@typescript-eslint/no-invalid-void-type': [
          'warn',
          {
            allowInGenericTypeArguments: true, // it's a default, actually. Doesn't work
          },
        ],
        '@typescript-eslint/strict-boolean-expressions': [
          'warn',
          {
            allowNullableObject: true,
          },
        ],
      },
    },
  ],
};

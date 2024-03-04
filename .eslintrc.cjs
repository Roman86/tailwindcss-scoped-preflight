module.exports = {
  env: {
    jest: true,
    browser: true,
    es2021: true,
  },
  root: true, // for @typescript-eslint
  plugins: [
    '@typescript-eslint',
    'promise',
    'react',
  ],
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'standard-with-typescript',
    'prettier',
  ],
  settings: {
    react: {
      version: 'detect',
    },
  },
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
  rules: {
    // 'semi': 'off', // using react rules
    'import/no-webpack-loader-syntax': 'warn',
    'comma-dangle': [
      1,
      'always-multiline',
    ],
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
  },
  overrides: [
    {
      // enable the rule specifically for TypeScript files
      files: [
        '*.ts',
        '*.mts',
        '*.cts',
        '*.tsx',
      ],
      rules: {
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

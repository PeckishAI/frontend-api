/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  extends: ['airbnb', 'airbnb-typescript', 'prettier'],
  plugins: ['@typescript-eslint', 'react', 'prettier'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2021,
    project: 'tsconfig.json',
  },
  rules: {
    'prettier/prettier': 'error',
    'import/order': 'off',
    'import/no-absolute-path': 'off',
    'react/react-in-jsx-scope': 'off',
    'react/function-component-definition': 'off',
    'no-console': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
  },
  ignorePatterns: ['vite.config.ts', '.eslintrc.js'],
};

/**
 * ESLint config for the whole project (root level, legacy "eslintrc" format, ESLint v8).
 * ESLint finds bugs and bad patterns; Prettier (see .prettierrc) owns formatting.
 */
module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    // No `project` option on purpose: no type-aware rules, so linting stays fast.
  },
  // Order matters: later entries override earlier ones, so `prettier` goes last.
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  settings: {
    react: { version: 'detect' },
    // `@/` is a Vite/TypeScript alias for src/; TypeScript already checks it, so the import plugin skips it.
    'import/ignore': ['^@/'],
  },
  rules: {
    // TypeScript
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',

    // React
    'react/react-in-jsx-scope': 'off', // new JSX transform: no `import React` needed
    'react/prop-types': 'off', // props are typed with TypeScript
    'react/no-unescaped-entities': 'warn',
    'react/self-closing-comp': 'warn',
    'react/jsx-key': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Imports
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
      },
    ],
    'import/no-unresolved': ['error', { ignore: ['^@/'] }],
    'import/no-duplicates': 'error',

    // Accessibility
    'jsx-a11y/alt-text': 'error',
    'jsx-a11y/anchor-is-valid': 'warn',

    // General quality
    'no-console': 'error',
    eqeqeq: ['error', 'always', { null: 'ignore' }],
    curly: ['error', 'all'],
  },
  ignorePatterns: ['dist', 'build', 'coverage', '.vite', 'node_modules', '**/*.cjs', '**/*.config.js', '**/*.config.ts', '**/*.config.mjs'],
};

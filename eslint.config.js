import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      'dist',
      'node_modules',
      'public/build',
      '.wrangler',
      'vite.config.ts.timestamp-*',
    ],
  }, // Added common ignores

  // Base configurations
  js.configs.recommended, // From @eslint/js
  ...tseslint.configs.recommendedTypeChecked, // From typescript-eslint, provides type-aware linting
  // Configuration for React specific linting
  {
    files: ['**/*.{ts,tsx}'], // Target TypeScript and TSX files
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname, // Ensures project paths are resolved correctly
      },
      globals: {
        ...globals.browser, // Standard browser globals
        ...globals.node, // Add node globals for config files etc.
      },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ], // Warn on unused vars, allow underscore prefix
    },
  },

  // Prettier configuration - MUST BE LAST to override other formatting rules
  eslintConfigPrettier
);

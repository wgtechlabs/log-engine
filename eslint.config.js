import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import securityPlugin from 'eslint-plugin-security';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['**/*.test.ts', '**/__tests__/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'security': securityPlugin,
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      
      // General ESLint rules
      'no-console': 'off', // Allow console for logging library
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'brace-style': ['error', '1tbs'],
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
      
      // Security-conscious rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      
      // Security plugin rules - disabled here (run separately in lint:security)
      // but included so eslint-disable comments are recognized
      'security/detect-object-injection': 'off',
      'security/detect-non-literal-regexp': 'off',
      'security/detect-unsafe-regex': 'off',
      'security/detect-buffer-noassert': 'off',
      'security/detect-child-process': 'off',
      'security/detect-disable-mustache-escape': 'off',
      'security/detect-eval-with-expression': 'off',
      'security/detect-no-csrf-before-method-override': 'off',
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-non-literal-require': 'off',
      'security/detect-possible-timing-attacks': 'off',
      'security/detect-pseudoRandomBytes': 'off',
      'security/detect-bidi-characters': 'off',
    },
  },
  {
    files: ['**/*.test.ts', '**/__tests__/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        // Don't use project for test files to avoid TypeScript config issues
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'security': securityPlugin,
    },
    rules: {
      // Relax some rules for test files
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      'no-console': 'off',
      'no-debugger': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'eqeqeq': ['error', 'always'],
      'curly': ['error', 'all'],
      'brace-style': ['error', '1tbs'],
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-trailing-spaces': 'error',
      'eol-last': 'error',
    },
  },
  {
    ignores: ['dist/', 'coverage/', 'node_modules/', '*.config.js'],
  },
];

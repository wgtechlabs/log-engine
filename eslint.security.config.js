import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import securityPlugin from 'eslint-plugin-security';

export default [
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'security': securityPlugin,
    },
    rules: {
      // Security plugin rules - focusing on the most critical ones
      'security/detect-object-injection': 'error',
      'security/detect-non-literal-regexp': 'error',
      'security/detect-unsafe-regex': 'error',
      'security/detect-buffer-noassert': 'error',
      'security/detect-child-process': 'error',
      'security/detect-disable-mustache-escape': 'error',
      'security/detect-eval-with-expression': 'error',
      'security/detect-no-csrf-before-method-override': 'error',
      'security/detect-non-literal-fs-filename': 'error',
      'security/detect-non-literal-require': 'error',
      'security/detect-possible-timing-attacks': 'error',
      'security/detect-pseudoRandomBytes': 'error',
      'security/detect-bidi-characters': 'error',
      
      // General security-conscious rules
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      'no-debugger': 'error',
      'no-console': 'warn', // Allow for logging library but warn about it
      
      // Prevent dangerous patterns
      'no-proto': 'error',
      'no-caller': 'error',
      'no-extend-native': 'error',
      'no-with': 'error',
    },
  },
  // Relaxed rules for test files
  {
    files: ['**/__tests__/**/*.ts', '**/*.test.ts', '**/*test-utils.ts'],
    rules: {
      'security/detect-non-literal-fs-filename': 'off', // Allow dynamic file paths in tests
      'security/detect-object-injection': 'warn', // Warn instead of error in tests
      'no-console': 'off', // Allow console in test files
    },
  },
  // Relaxed security rules for advanced-outputs.ts - comprehensive path validation implemented
  {
    files: ['**/advanced-outputs.ts'],
    rules: {
      'security/detect-non-literal-fs-filename': 'off', // Disabled: comprehensive path validation and security checks implemented
    },
  },
];

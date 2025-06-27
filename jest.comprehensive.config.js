/**
 * Jest configuration specifically for comprehensive CI tests with coverage
 * Used for main branch testing with full coverage collection
 * 
 * Environment Variables:
 * - EXCLUDE_PROBLEMATIC_TESTS=true: Excludes tests that cause hanging in CI environments
 *   (specifically advanced-outputs.test.ts with file I/O operations)
 */
const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  // Longer timeout for comprehensive tests
  testTimeout: 15000,
  // Single worker to avoid race conditions
  maxWorkers: 1,
  // Force exit to prevent hanging
  forceExit: true,
  // Disable handle detection to prevent false positives
  detectOpenHandles: false,
  // Minimal output for CI
  verbose: false,
  silent: false,
  // Don't bail early - run all tests for complete feedback
  bail: false,
  // Serial execution
  maxConcurrency: 1,
  // No watch modes
  watchAll: false,
  watchman: false,
  // No caching in CI
  cache: false,
  // Enable coverage collection for comprehensive tests
  collectCoverage: true,
  // Coverage configuration
  coverageReporters: ['text', 'lcov', 'clover', 'json'],
  coverageDirectory: 'coverage',
  // Coverage thresholds adjusted for excluded problematic tests
  coverageThreshold: {
    global: {
      statements: 75,
      branches: 60,
      functions: 80,
      lines: 75
    }
  },
  // Aggressive cleanup
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,
  resetModules: false,
  // Standard ignore patterns
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    // Conditionally exclude problematic tests based on environment variable
    // Set EXCLUDE_PROBLEMATIC_TESTS=true to skip tests that cause CI hanging
    ...(process.env.EXCLUDE_PROBLEMATIC_TESTS === 'true' 
      ? ['advanced-outputs.test.ts'] 
      : []
    )
  ]
};

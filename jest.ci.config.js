/**
 * Jest configuration specifically for CI environments
 * Optimized for reliability and speed in automated environments
 */
const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  // Much shorter timeout for CI - fail fast
  testTimeout: 5000,
  // Single worker to avoid race conditions and resource conflicts
  maxWorkers: 1,
  // Force exit to prevent hanging
  forceExit: true,
  // Disable handle detection in CI to prevent false positives
  detectOpenHandles: false,
  // Minimal output in CI for cleaner logs
  verbose: false,
  silent: false,
  // Don't bail early - run all tests for complete feedback
  bail: false,
  // Serial execution prevents resource conflicts
  maxConcurrency: 1,
  // Explicitly disable watch mode
  watchAll: false,
  watchman: false,
  // Prevent Jest from caching between runs in CI
  cache: false,
  // Reduce memory usage
  logHeapUsage: false,
  // Override coverage thresholds for CI (slightly lower for stability)
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    }
  },
  // Optimize for CI environment
  clearMocks: true,
  restoreMocks: true,
  resetMocks: false,
  resetModules: false,
  // More aggressive CI settings
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  // Standard ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ]
};

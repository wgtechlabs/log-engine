/**
 * Jest configuration specifically for CI environments
 * More aggressive timeouts and cleanup to prevent hanging
 */
const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  // More aggressive settings for CI
  testTimeout: 20000,
  maxWorkers: 1,
  forceExit: true, // Force exit in CI to prevent hanging
  detectOpenHandles: false, // Disable in CI as it can cause issues
  verbose: true,
  // Add bail to stop on first failure in CI
  bail: 1,
};

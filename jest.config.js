/**
 * Jest configuration for Log Engine testing
 * Provides comprehensive test coverage with TypeScript support
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/__tests__/**',
  ],
  // Coverage configuration for Codecov
  coverageReporters: ['text', 'lcov', 'clover', 'json'],
  coverageDirectory: 'coverage',
  // Coverage thresholds
  coverageThreshold: {
    global: {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85
    }
  },
  // Enable parallel test execution for better performance - reduced for stability
  maxWorkers: 1,
  // Timeout for individual tests
  testTimeout: 30000,
  // Don't force exit - let Jest handle cleanup properly
  forceExit: false,
  // Detect open handles for debugging
  detectOpenHandles: true,
  // Exit gracefully when all tests are complete
  clearMocks: true,
  restoreMocks: true,
  // Ensure proper cleanup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // Verbose output for debugging
  verbose: process.env.CI === 'true'
};

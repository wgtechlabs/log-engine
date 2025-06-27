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
      statements: 90,
      branches: 85,
      functions: 90,
      lines: 90
    }
  },
  // Enable parallel test execution for better performance
  maxWorkers: '50%',
  // Timeout for individual tests
  testTimeout: 10000,
  // Force exit to prevent hanging workers
  forceExit: true,
  // Detect open handles for debugging
  detectOpenHandles: false
};

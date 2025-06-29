/**
 * Jest configuration for Log Engine - Local Development
 * Simple configuration for local testing and development
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
  // Coverage output
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  // Basic coverage thresholds for local development
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80
    }
  },
  // Use available CPU cores for better local performance
  maxWorkers: '50%',
  // Reasonable timeout for local development
  testTimeout: 15000,
  // Clean up between tests
  clearMocks: true,
  restoreMocks: true
};

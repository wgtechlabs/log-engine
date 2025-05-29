/**
 * Shared test utilities for log-engine tests
 * Provides consistent console mocking and cleanup functionality across all test suites
 */

/**
 * Interface for managing console method mocks during testing
 * Groups all console spy instances for easy setup and cleanup
 */
export interface ConsoleMocks {
  /** Mock for console.log (used by debug and info methods) */
  mockConsoleLog: jest.SpyInstance;
  /** Mock for console.warn (used by warn method) */
  mockConsoleWarn: jest.SpyInstance;
  /** Mock for console.error (used by error method) */
  mockConsoleError: jest.SpyInstance;
}

/**
 * Sets up console mocks for testing log output
 * Replaces console methods with Jest spies to capture and verify log calls
 * @returns ConsoleMocks object containing all spy instances
 */
export const setupConsoleMocks = (): ConsoleMocks => {
  const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
  const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
  
  return { mockConsoleLog, mockConsoleWarn, mockConsoleError };
};

/**
 * Restores console mocks after testing
 * Cleans up Jest spies and restores original console functionality
 * @param mocks - The ConsoleMocks object from setupConsoleMocks
 */
export const restoreConsoleMocks = (mocks: ConsoleMocks): void => {
  mocks.mockConsoleLog.mockRestore();
  mocks.mockConsoleWarn.mockRestore();
  mocks.mockConsoleError.mockRestore();
};

/**
 * Convenience function for setting up console mocks in beforeEach hooks
 * Identical to setupConsoleMocks but with a more descriptive name for test setup
 * @returns ConsoleMocks object containing all spy instances
 */
export const setupConsoleBeforeEach = (): ConsoleMocks => {
  return setupConsoleMocks();
};

/**
 * Convenience function for restoring console mocks in afterEach hooks
 * Identical to restoreConsoleMocks but with a more descriptive name for test cleanup
 * @param mocks - The ConsoleMocks object to restore
 */
export const restoreConsoleAfterEach = (mocks: ConsoleMocks): void => {
  restoreConsoleMocks(mocks);
};

/**
 * Shared test utilities for log-engine tests
 */

export interface ConsoleMocks {
  mockConsoleLog: jest.SpyInstance;
  mockConsoleWarn: jest.SpyInstance;
  mockConsoleError: jest.SpyInstance;
}

/**
 * Sets up console mocks for testing
 */
export const setupConsoleMocks = (): ConsoleMocks => {
  const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
  const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
  const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
  
  return { mockConsoleLog, mockConsoleWarn, mockConsoleError };
};

/**
 * Restores console mocks after testing
 */
export const restoreConsoleMocks = (mocks: ConsoleMocks): void => {
  mocks.mockConsoleLog.mockRestore();
  mocks.mockConsoleWarn.mockRestore();
  mocks.mockConsoleError.mockRestore();
};

/**
 * Sets up console mocks for beforeEach hook
 */
export const setupConsoleBeforeEach = (): ConsoleMocks => {
  return setupConsoleMocks();
};

/**
 * Restores console mocks for afterEach hook
 */
export const restoreConsoleAfterEach = (mocks: ConsoleMocks): void => {
  restoreConsoleMocks(mocks);
};

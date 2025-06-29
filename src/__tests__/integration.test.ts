/**
 * Integration tests for the complete LogEngine system
 * Tests end-to-end functionality, configuration changes, and real-world usage patterns
 */

import { LogEngine, LogLevel, LogMode } from '../index';
import { setupConsoleMocks, restoreConsoleMocks, ConsoleMocks } from './test-utils';

describe('Integration tests', () => {
  let mocks: ConsoleMocks;

  beforeEach(() => {
    // Set up console mocks to capture all output
    mocks = setupConsoleMocks();
  });

  afterEach(() => {
    // Clean up console mocks after each test
    restoreConsoleMocks(mocks);
  });

  it('should work end-to-end with multiple log levels', () => {
    // Test complete workflow with mixed log levels and INFO threshold
    LogEngine.configure({ level: LogLevel.INFO });

    LogEngine.debug('Debug message');    // Should be filtered
    LogEngine.info('Info message');      // Should show
    LogEngine.warn('Warning message');   // Should show
    LogEngine.error('Error message');    // Should show

    // Verify correct number of calls to each console method
    expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);    // info only
    expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(1);   // warn only
    expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);  // error only
  });

  it('should handle rapid configuration changes', () => {
    // Test that configuration changes take effect immediately
    LogEngine.configure({ mode: LogMode.DEBUG });
    LogEngine.debug('Debug 1');          // Should show with DEBUG mode

    LogEngine.configure({ mode: LogMode.ERROR });
    LogEngine.debug('Debug 2');          // Should be filtered with ERROR mode
    LogEngine.error('Error 1');          // Should show with ERROR mode

    // Verify only first debug and the error were logged
    expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
    expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);
  });

  it('should maintain state across multiple method calls', () => {
    // Test that configuration persists across many logging calls
    LogEngine.configure({ level: LogLevel.WARN });

    // Simulate burst logging with mixed levels
    for (let i = 0; i < 5; i++) {
      LogEngine.info(`Info ${i}`);      // All should be filtered
      LogEngine.warn(`Warning ${i}`);   // All should show
    }

    // Verify filtering consistency across multiple calls
    expect(mocks.mockConsoleLog).not.toHaveBeenCalled();      // No info messages
    expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(5);   // All warning messages
  });
});

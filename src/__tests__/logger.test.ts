/**
 * Tests for the Logger class
 * Verifies core logging functionality, configuration, and level-based filtering
 */

import { Logger } from '../logger';
import { LogLevel, LogMode } from '../types';
import { setupConsoleMocks, restoreConsoleMocks, ConsoleMocks } from './test-utils';

describe('Logger class', () => {
  let logger: Logger;
  let mocks: ConsoleMocks;

  beforeEach(() => {
    // Create fresh Logger instance for each test to avoid state pollution
    logger = new Logger();
    // Set up console mocks to capture and verify log output
    mocks = setupConsoleMocks();
  });

  afterEach(() => {
    // Clean up console mocks to restore normal console behavior
    restoreConsoleMocks(mocks);
  });

  it('should have default log level of INFO', () => {
    // Test that default behavior shows INFO but filters DEBUG
    logger.info('Info message');
    logger.debug('Debug message');
    
    // Only INFO should be logged with default settings
    expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Info message')
    );
  });

  it('should allow configuration changes', () => {
    // Test that logger configuration updates work correctly
    logger.configure({ mode: LogMode.DEBUG });
    logger.debug('Debug message');
    
    // DEBUG should now be visible after configuration change
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Debug message')
    );
  });

  it('should filter messages based on configured mode', () => {
    // Test log mode filtering - only WARN and ERROR should show
    logger.configure({ mode: LogMode.WARN });
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    
    // DEBUG and INFO should be filtered out
    expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
    // Only WARN and ERROR should be logged
    expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(1);
    expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);
  });

  it('should always log LOG level messages regardless of mode configuration', () => {
    // Test that LOG level always outputs regardless of configured mode
    logger.configure({ mode: LogMode.SILENT });
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    logger.log('LOG level message');
    
    // Only LOG should be visible even with SILENT mode
    expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('LOG level message')
    );
    expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
    expect(mocks.mockConsoleError).not.toHaveBeenCalled();
  });

  it('should log LOG level messages with different log configurations', () => {
    // Test LOG level with various configurations
    const testCases = [
      LogMode.DEBUG,
      LogMode.INFO,
      LogMode.WARN,
      LogMode.ERROR,
      LogMode.SILENT
    ];

    testCases.forEach((mode, index) => {
      // Reset mocks
      mocks.mockConsoleLog.mockClear();
      
      logger.configure({ mode });
      logger.log(`LOG message ${index}`);
      
      // LOG should always be visible regardless of configured mode (except OFF)
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining(`LOG message ${index}`)
      );
    });
  });

  it('should not log any messages when mode is OFF including LOG level', () => {
    // Test that OFF mode completely disables all logging including LOG
    logger.configure({ mode: LogMode.OFF });
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    logger.log('LOG level message');
    
    // No console methods should be called with OFF mode (including LOG)
    expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
    expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
    expect(mocks.mockConsoleError).not.toHaveBeenCalled();
  });
});

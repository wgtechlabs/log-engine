/**
 * Tests for the Logger class
 * Verifies core logging functionality, configuration, and level-based filtering
 */

import { Logger } from '../logger';
import { LogLevel } from '../types';
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
    logger.configure({ level: LogLevel.DEBUG });
    logger.debug('Debug message');
    
    // DEBUG should now be visible after configuration change
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Debug message')
    );
  });

  it('should filter messages based on configured level', () => {
    // Test log level filtering - only WARN and ERROR should show
    logger.configure({ level: LogLevel.WARN });
    
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

  it('should always log LOG level messages regardless of configuration', () => {
    // Test that LOG level always outputs regardless of configured level
    logger.configure({ level: LogLevel.SILENT });
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    logger.log('LOG level message');
    
    // Only LOG should be visible even with SILENT level
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
      LogLevel.DEBUG,
      LogLevel.INFO,
      LogLevel.WARN,
      LogLevel.ERROR,
      LogLevel.SILENT
    ];

    testCases.forEach((level, index) => {
      // Reset mocks
      mocks.mockConsoleLog.mockClear();
      
      logger.configure({ level });
      logger.log(`LOG message ${index}`);
      
      // LOG should always be visible regardless of configured level
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining(`LOG message ${index}`)
      );
    });
  });
});

/**
 * Tests for the Logger class
 * Verifies core logging functionality, configuration, and level-based filtering
 */

import { Logger } from '../logger';
import { LogLevel, LogMode } from '../types';
import { LogFilter } from '../logger/filtering';
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

  it('should have default log mode based on environment', () => {
    // Test that default behavior uses environment-based configuration
    // In test environment (NODE_ENV=test), the default mode is ERROR
    logger.info('Info message');
    logger.debug('Debug message');
    logger.error('Error message');
    
    // In test environment, only ERROR and above should be logged by default
    expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(0); // INFO filtered out
    expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1); // ERROR shown
    expect(mocks.mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('Error message')
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

  it('should return current configuration', () => {
    // Test the getConfig method
    const config = logger.getConfig();
    expect(config).toBeDefined();
    expect(config.mode).toBeDefined();
    
    // Test configuration change is reflected in getConfig
    logger.configure({ mode: LogMode.WARN });
    const updatedConfig = logger.getConfig();
    expect(updatedConfig.mode).toBe(LogMode.WARN);
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

  describe('Backwards compatibility and deprecation warnings', () => {
    let originalNodeEnv: string | undefined;
    let mockConsoleWarn: jest.SpyInstance;

    beforeEach(() => {
      originalNodeEnv = process.env.NODE_ENV;
      mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    });

    afterEach(() => {
      process.env.NODE_ENV = originalNodeEnv;
      mockConsoleWarn.mockRestore();
    });

    it('should show deprecation warning for legacy level configuration in non-test environment', () => {
      // Test deprecation warning (covers lines 64-66)
      process.env.NODE_ENV = 'development';
      
      logger.configure({ level: LogLevel.DEBUG } as any);
      
      // Should show deprecation warning
      expect(mockConsoleWarn).toHaveBeenCalledTimes(3);
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('DEPRECATION WARNING')
      );
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Migration:')
      );
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('See:')
      );
    });

    it('should not show deprecation warning in test environment', () => {
      // Test that deprecation warning is suppressed in test environment
      process.env.NODE_ENV = 'test';
      
      logger.configure({ level: LogLevel.DEBUG } as any);
      
      // Should not show deprecation warning in test environment
      expect(mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should throw error for invalid legacy level values', () => {
      // Test error handling for invalid level values (covers line 84)
      expect(() => {
        logger.configure({ level: 999 } as any);
      }).toThrow('Invalid LogLevel value: 999');
    });

    it('should map legacy level values correctly', () => {
      // Test that legacy level values map to correct LogMode values
      logger.configure({ level: LogLevel.DEBUG } as any);
      logger.debug('Debug message');
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Debug message')
      );

      mocks.mockConsoleLog.mockClear();
      logger.configure({ level: LogLevel.INFO } as any);
      logger.debug('Debug message');
      logger.info('Info message');
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1); // Only info should show
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Info message')
      );
    });

    it('should handle legacy SILENT and OFF values', () => {
      // Test mapping of legacy numeric values 4 (SILENT) and 5 (OFF)
      logger.configure({ level: 4 } as any); // Legacy SILENT
      logger.info('Info message');
      logger.log('LOG message');
      
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1); // Only LOG should show
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('LOG message')
      );

      mocks.mockConsoleLog.mockClear();
      logger.configure({ level: 5 } as any); // Legacy OFF
      logger.log('LOG message');
      
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled(); // Nothing should show
    });
  });

  describe('Edge cases and internal logic', () => {
    it('should handle undefined mode configuration', () => {
      // Test to cover undefined mode fallback behavior
      const freshLogger = new Logger();
      // Configure with undefined mode to test fallback to INFO
      freshLogger.configure({ mode: undefined as any });
      
      // Should fall back to INFO mode behavior
      freshLogger.debug('Debug message');
      freshLogger.info('Info message');
      
      // With INFO mode fallback, DEBUG should be filtered, INFO should show
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Info message')
      );
    });
  });

  describe('LogFilter utility functions', () => {
    it('should return correct severity ranks for all log levels', () => {
      expect(LogFilter.getSeverityRank(LogLevel.DEBUG)).toBe(0);
      expect(LogFilter.getSeverityRank(LogLevel.INFO)).toBe(1);
      expect(LogFilter.getSeverityRank(LogLevel.WARN)).toBe(2);
      expect(LogFilter.getSeverityRank(LogLevel.ERROR)).toBe(3);
      expect(LogFilter.getSeverityRank(LogLevel.LOG)).toBe(99);
    });

    it('should return correct mode thresholds for all log modes', () => {
      expect(LogFilter.getModeThreshold(LogMode.DEBUG)).toBe(0);
      expect(LogFilter.getModeThreshold(LogMode.INFO)).toBe(1);
      expect(LogFilter.getModeThreshold(LogMode.WARN)).toBe(2);
      expect(LogFilter.getModeThreshold(LogMode.ERROR)).toBe(3);
      expect(LogFilter.getModeThreshold(LogMode.SILENT)).toBe(99);
      expect(LogFilter.getModeThreshold(LogMode.OFF)).toBe(100);
    });

    it('should correctly determine if message should be logged', () => {
      // Test DEBUG mode - should allow all levels
      expect(LogFilter.shouldLog(LogLevel.DEBUG, LogMode.DEBUG)).toBe(true);
      expect(LogFilter.shouldLog(LogLevel.INFO, LogMode.DEBUG)).toBe(true);
      expect(LogFilter.shouldLog(LogLevel.WARN, LogMode.DEBUG)).toBe(true);
      expect(LogFilter.shouldLog(LogLevel.ERROR, LogMode.DEBUG)).toBe(true);
      expect(LogFilter.shouldLog(LogLevel.LOG, LogMode.DEBUG)).toBe(true);

      // Test INFO mode - should filter out DEBUG
      expect(LogFilter.shouldLog(LogLevel.DEBUG, LogMode.INFO)).toBe(false);
      expect(LogFilter.shouldLog(LogLevel.INFO, LogMode.INFO)).toBe(true);
      expect(LogFilter.shouldLog(LogLevel.WARN, LogMode.INFO)).toBe(true);
      expect(LogFilter.shouldLog(LogLevel.ERROR, LogMode.INFO)).toBe(true);
      expect(LogFilter.shouldLog(LogLevel.LOG, LogMode.INFO)).toBe(true);

      // Test WARN mode - should filter out DEBUG and INFO
      expect(LogFilter.shouldLog(LogLevel.DEBUG, LogMode.WARN)).toBe(false);
      expect(LogFilter.shouldLog(LogLevel.INFO, LogMode.WARN)).toBe(false);
      expect(LogFilter.shouldLog(LogLevel.WARN, LogMode.WARN)).toBe(true);
      expect(LogFilter.shouldLog(LogLevel.ERROR, LogMode.WARN)).toBe(true);
      expect(LogFilter.shouldLog(LogLevel.LOG, LogMode.WARN)).toBe(true);

      // Test ERROR mode - should only allow ERROR and LOG
      expect(LogFilter.shouldLog(LogLevel.DEBUG, LogMode.ERROR)).toBe(false);
      expect(LogFilter.shouldLog(LogLevel.INFO, LogMode.ERROR)).toBe(false);
      expect(LogFilter.shouldLog(LogLevel.WARN, LogMode.ERROR)).toBe(false);
      expect(LogFilter.shouldLog(LogLevel.ERROR, LogMode.ERROR)).toBe(true);
      expect(LogFilter.shouldLog(LogLevel.LOG, LogMode.ERROR)).toBe(true);

      // Test SILENT mode - should only allow LOG
      expect(LogFilter.shouldLog(LogLevel.DEBUG, LogMode.SILENT)).toBe(false);
      expect(LogFilter.shouldLog(LogLevel.INFO, LogMode.SILENT)).toBe(false);
      expect(LogFilter.shouldLog(LogLevel.WARN, LogMode.SILENT)).toBe(false);
      expect(LogFilter.shouldLog(LogLevel.ERROR, LogMode.SILENT)).toBe(false);
      expect(LogFilter.shouldLog(LogLevel.LOG, LogMode.SILENT)).toBe(true);

      // Test OFF mode - should block everything
      expect(LogFilter.shouldLog(LogLevel.DEBUG, LogMode.OFF)).toBe(false);
      expect(LogFilter.shouldLog(LogLevel.INFO, LogMode.OFF)).toBe(false);
      expect(LogFilter.shouldLog(LogLevel.WARN, LogMode.OFF)).toBe(false);
      expect(LogFilter.shouldLog(LogLevel.ERROR, LogMode.OFF)).toBe(false);
      expect(LogFilter.shouldLog(LogLevel.LOG, LogMode.OFF)).toBe(false);
    });
  });
});

describe('Logger module exports', () => {
  it('should export all logger classes', () => {
    const logger = require('../logger');
    
    // Test that all expected exports are available
    expect(logger.Logger).toBeDefined();
    expect(logger.CoreLogger).toBeDefined(); // Backward compatibility
    expect(logger.LoggerConfigManager).toBeDefined();
    expect(logger.LogFilter).toBeDefined();
    expect(logger.EnvironmentDetector).toBeDefined();
    
    // Test that CoreLogger is alias for Logger
    expect(logger.CoreLogger).toBe(logger.Logger);
    
    // Test that classes are constructible/callable
    expect(typeof logger.Logger).toBe('function');
    expect(typeof logger.LoggerConfigManager).toBe('function');
    expect(typeof logger.LogFilter).toBe('function');
    expect(typeof logger.EnvironmentDetector).toBe('function');
  });
});

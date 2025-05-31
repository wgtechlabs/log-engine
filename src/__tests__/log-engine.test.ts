/**
 * Integration tests for the LogEngine main API
 * Tests the complete public interface and log level filtering behavior
 */

import { LogEngine, LogLevel, LogMode } from '../index';
import { setupConsoleMocks, restoreConsoleMocks, ConsoleMocks } from './test-utils';

describe('LogEngine', () => {
  let mocks: ConsoleMocks;

  beforeEach(() => {
    // Set up console mocks to capture log output
    mocks = setupConsoleMocks();
    
    // Reset LogEngine to consistent default state for each test using new mode API
    LogEngine.configure({ mode: LogMode.INFO });
  });

  afterEach(() => {
    // Clean up console mocks after each test
    restoreConsoleMocks(mocks);
  });

  describe('Basic logging functionality', () => {
    it('should log debug messages when mode is DEBUG', () => {
      // Test that DEBUG mode enables debug message output
      LogEngine.configure({ mode: LogMode.DEBUG });
      LogEngine.debug('Debug message');
      
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Debug message')
      );
    });

    it('should log info messages when level is INFO or lower', () => {
      // Test that INFO level shows info messages
      LogEngine.configure({ level: LogLevel.INFO });
      LogEngine.info('Info message');
      
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Info message')
      );
    });

    it('should log warn messages when level is WARN or lower', () => {
      // Test that WARN level shows warning messages using console.warn
      LogEngine.configure({ level: LogLevel.WARN });
      LogEngine.warn('Warning message');
      
      expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Warning message')
      );
    });

    it('should log error messages when level is ERROR or lower', () => {
      // Test that ERROR level shows error messages using console.error
      LogEngine.configure({ level: LogLevel.ERROR });
      LogEngine.error('Error message');
      
      expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error message')
      );
    });

    it('should log LOG level messages regardless of configuration', () => {
      // Test that LOG level always outputs with console.log
      LogEngine.configure({ level: LogLevel.ERROR });
      LogEngine.log('LOG level message');
      
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('LOG level message')
      );
    });
  });

  describe('Log level filtering', () => {
    it('should not log debug messages when level is INFO', () => {
      // Test that higher log levels filter out lower priority messages
      LogEngine.configure({ level: LogLevel.INFO });
      LogEngine.debug('Debug message');
      
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should not log info messages when level is WARN', () => {
      // Test that WARN level filters out INFO messages
      LogEngine.configure({ level: LogLevel.WARN });
      LogEngine.info('Info message');
      
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should not log warn messages when level is ERROR', () => {
      // Test that ERROR level filters out WARN messages
      LogEngine.configure({ level: LogLevel.ERROR });
      LogEngine.warn('Warning message');
      
      expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should not log any messages when mode is SILENT', () => {
      // Test that SILENT mode completely disables all logging except LOG
      LogEngine.configure({ mode: LogMode.SILENT });
      LogEngine.debug('Debug message');
      LogEngine.info('Info message');
      LogEngine.warn('Warning message');
      LogEngine.error('Error message');
      
      // No console methods should be called with SILENT mode (except LOG)
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
      expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
      expect(mocks.mockConsoleError).not.toHaveBeenCalled();
    });

    it('should always log LOG level messages even when mode is SILENT', () => {
      // Test that LOG level bypasses SILENT configuration
      LogEngine.configure({ mode: LogMode.SILENT });
      LogEngine.debug('Debug message');
      LogEngine.info('Info message');  
      LogEngine.warn('Warning message');
      LogEngine.error('Error message');
      LogEngine.log('LOG level message');
      
      // Only LOG should be visible
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('LOG level message')
      );
      expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
      expect(mocks.mockConsoleError).not.toHaveBeenCalled();
    });

    it('should not log any messages when mode is OFF including LOG level', () => {
      // Test that OFF mode completely disables all logging including LOG
      LogEngine.configure({ mode: LogMode.OFF });
      LogEngine.debug('Debug message');
      LogEngine.info('Info message');  
      LogEngine.warn('Warning message');
      LogEngine.error('Error message');
      LogEngine.log('LOG level message');
      
      // No console methods should be called with OFF level (including LOG)
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
      expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
      expect(mocks.mockConsoleError).not.toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    it('should accept partial configuration', () => {
      // Test that partial config updates work (only changing mode)
      LogEngine.configure({ mode: LogMode.DEBUG });
      LogEngine.debug('Debug message');
      
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Debug message')
      );
    });

    it('should maintain configuration between calls', () => {
      // Test that configuration persists across multiple logging calls
      LogEngine.configure({ mode: LogMode.ERROR });
      LogEngine.info('Should not appear');
      LogEngine.error('Should appear');
      
      // Only ERROR should be logged based on configuration
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
      expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);
    });
  });

  describe('Backwards Compatibility', () => {
    beforeEach(() => {
      mocks = setupConsoleMocks();
    });

    afterEach(() => {
      restoreConsoleMocks(mocks);
    });

    it('should support legacy level-based configuration', () => {
      // Test that old level-based API still works with backwards compatibility
      LogEngine.configure({ level: LogLevel.WARN });
      LogEngine.debug('Debug message');
      LogEngine.info('Info message');
      LogEngine.warn('Warning message');
      LogEngine.error('Error message');
      
      // Only WARN and ERROR should be logged when level is WARN
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
      expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);
    });

    it('should map legacy SILENT value to LogMode.SILENT', () => {
      // Test backwards compatibility for legacy SILENT value (4)
      LogEngine.configure({ level: 4 as any }); // Old LogLevel.SILENT
      LogEngine.debug('Debug message');
      LogEngine.info('Info message');
      LogEngine.warn('Warning message');
      LogEngine.error('Error message');
      LogEngine.log('LOG level message');
      
      // Only LOG should be visible with SILENT mode
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('LOG level message')
      );
      expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
      expect(mocks.mockConsoleError).not.toHaveBeenCalled();
    });

    it('should map legacy OFF value to LogMode.OFF', () => {
      // Test backwards compatibility for legacy OFF value (5)
      LogEngine.configure({ level: 5 as any }); // Old LogLevel.OFF
      LogEngine.debug('Debug message');
      LogEngine.info('Info message');
      LogEngine.warn('Warning message');
      LogEngine.error('Error message');
      LogEngine.log('LOG level message');
      
      // No messages should be visible with OFF mode
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
      expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
      expect(mocks.mockConsoleError).not.toHaveBeenCalled();
    });
  });
});



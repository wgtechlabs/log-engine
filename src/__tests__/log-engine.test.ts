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
    // Clear any output handler and console suppression from previous tests
    LogEngine.configure({ 
      mode: LogMode.INFO,
      outputHandler: undefined,
      suppressConsoleOutput: undefined
    });
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

    it('should log info messages when mode is INFO or lower', () => {
      // Test that INFO mode shows info messages
      LogEngine.configure({ mode: LogMode.INFO });
       LogEngine.info('Info message');
       
       expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
       expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
         expect.stringContaining('Info message')
       );
     });

    it('should log warn messages when mode is WARN or lower', () => {
      // Test that WARN mode shows warning messages using console.warn
      LogEngine.configure({ mode: LogMode.WARN });
       LogEngine.warn('Warning message');
       
       expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(1);
       expect(mocks.mockConsoleWarn).toHaveBeenCalledWith(
         expect.stringContaining('Warning message')
       );
     });

    it('should log error messages when mode is ERROR or lower', () => {
      // Test that ERROR mode shows error messages using console.error
      LogEngine.configure({ mode: LogMode.ERROR });
       LogEngine.error('Error message');
       
       expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);
       expect(mocks.mockConsoleError).toHaveBeenCalledWith(
         expect.stringContaining('Error message')
       );
     });

it('should log LOG level messages regardless of configuration', () => {
       // Test that LOG level always outputs with console.log
      LogEngine.configure({ mode: LogMode.ERROR });
       LogEngine.log('LOG level message');
       
       expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
       expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
         expect.stringContaining('LOG level message')
       );
     });
  });

  describe('Log level filtering', () => {
    it('should not log debug messages when mode is INFO', () => {
       // Test that higher log levels filter out lower priority messages
      LogEngine.configure({ mode: LogMode.INFO });
       LogEngine.debug('Debug message');
       
       expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
     });

    it('should not log info messages when mode is WARN', () => {
      // Test that WARN mode filters out INFO messages
      LogEngine.configure({ mode: LogMode.WARN });
       LogEngine.info('Info message');
       
       expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
     });

    it('should not log warn messages when mode is ERROR', () => {
      // Test that ERROR mode filters out WARN messages
      LogEngine.configure({ mode: LogMode.ERROR });
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

  describe('Main module exports', () => {
    it('should export LogEngine and all types', () => {
      const main = require('../index');
      
      // Test that main exports are available
      expect(main.LogEngine).toBeDefined();
      expect(main.LogLevel).toBeDefined();
      expect(main.LogMode).toBeDefined();
      
      // Test that LogEngine has expected methods
      expect(typeof main.LogEngine.debug).toBe('function');
      expect(typeof main.LogEngine.info).toBe('function');
      expect(typeof main.LogEngine.warn).toBe('function');
      expect(typeof main.LogEngine.error).toBe('function');
      expect(typeof main.LogEngine.log).toBe('function');
    });

    it('should test withoutRedaction method', () => {
      const main = require('../index');
      const withoutRedaction = main.LogEngine.withoutRedaction();
      
      // Test that withoutRedaction returns an object with logging methods
      expect(withoutRedaction).toBeDefined();
      expect(typeof withoutRedaction.debug).toBe('function');
      expect(typeof withoutRedaction.info).toBe('function');
      expect(typeof withoutRedaction.warn).toBe('function');
      expect(typeof withoutRedaction.error).toBe('function');
      expect(typeof withoutRedaction.log).toBe('function');
    });
  });

  describe('Output Handler API (Phase 1)', () => {
    it('should support custom output handler configuration', () => {
      const capturedLogs: Array<{ level: string; message: string }> = [];
      
      LogEngine.configure({
        mode: LogMode.DEBUG,
        outputHandler: (level, message) => {
          capturedLogs.push({ level, message });
        }
      });

      LogEngine.info('Test message');
      LogEngine.error('Error message');

      expect(capturedLogs).toHaveLength(2);
      expect(capturedLogs[0]).toMatchObject({
        level: 'info',
        message: expect.stringContaining('Test message')
      });
      expect(capturedLogs[1]).toMatchObject({
        level: 'error',
        message: expect.stringContaining('Error message')
      });

      // Console should not be called
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
      expect(mocks.mockConsoleError).not.toHaveBeenCalled();
    });

    it('should support console suppression', () => {
      LogEngine.configure({
        mode: LogMode.DEBUG,
        suppressConsoleOutput: true
      });

      LogEngine.info('Suppressed message');
      LogEngine.error('Suppressed error');

      // Nothing should be logged to console
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
      expect(mocks.mockConsoleError).not.toHaveBeenCalled();
      expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should maintain backward compatibility when no output options are used', () => {
      LogEngine.configure({ mode: LogMode.DEBUG });

      LogEngine.info('Regular message');

      // Should work exactly as before
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Regular message')
      );
    });
  });

  describe('Multiple Outputs API (Phase 2)', () => {
    it('should support multiple output targets', () => {
      const capturedLogs1: Array<{ level: string; message: string }> = [];
      const capturedLogs2: Array<{ level: string; message: string }> = [];
      
      LogEngine.configure({
        mode: LogMode.DEBUG,
        outputs: [
          'console',
          (level, message) => capturedLogs1.push({ level, message }),
          (level, message) => capturedLogs2.push({ level, message })
        ]
      });

      LogEngine.info('Multi-output test');
      LogEngine.error('Multi-output error');

      // Console should be called
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);

      // Both custom handlers should capture logs
      expect(capturedLogs1).toHaveLength(2);
      expect(capturedLogs2).toHaveLength(2);
      
      expect(capturedLogs1[0]).toMatchObject({
        level: 'info',
        message: expect.stringContaining('Multi-output test')
      });
      expect(capturedLogs1[1]).toMatchObject({
        level: 'error',
        message: expect.stringContaining('Multi-output error')
      });
    });

    it('should support built-in handlers', () => {
      LogEngine.configure({
        mode: LogMode.DEBUG,
        outputs: ['console', 'silent']
      });

      LogEngine.info('Built-in test');

      // Console should work, silent should do nothing
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Built-in test')
      );
    });

    it('should prioritize outputs over single outputHandler', () => {
      const singleHandler = jest.fn();
      const multiHandler = jest.fn();

      LogEngine.configure({
        mode: LogMode.DEBUG,
        outputHandler: singleHandler,
        outputs: [multiHandler]
      });

      LogEngine.info('Priority test');

      // Only outputs array should be used
      expect(multiHandler).toHaveBeenCalledTimes(1);
      expect(singleHandler).not.toHaveBeenCalled();
    });

    it('should maintain compatibility with console + file + network pattern', () => {
      const fileLogs: string[] = [];
      const networkCalls: number[] = [];

      LogEngine.configure({
        mode: LogMode.DEBUG,
        outputs: [
          'console',
          (level, message) => fileLogs.push(`${level}: ${message}`),
          (level) => networkCalls.push(Date.now())
        ]
      });

      LogEngine.info('Pattern test');
      LogEngine.warn('Pattern warning');

      // All three outputs should work
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(1);
      expect(fileLogs).toHaveLength(2);
      expect(networkCalls).toHaveLength(2);
    });
  });
});



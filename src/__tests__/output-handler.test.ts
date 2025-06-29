/**
 * Tests for Output Handler functionality
 * Verifies custom output handlers, console suppression, and backward compatibility
 */

import { Logger } from '../logger';
import { LogMode } from '../types';
import type { LogOutputHandler } from '../types';
import { setupConsoleMocks, restoreConsoleMocks, ConsoleMocks } from './test-utils';

describe('Output Handler functionality', () => {
  let logger: Logger;
  let mocks: ConsoleMocks;
  let capturedLogs: Array<{ level: string; message: string; data?: any }>;
  let mockOutputHandler: jest.MockedFunction<LogOutputHandler>;

  beforeEach(() => {
    logger = new Logger();
    mocks = setupConsoleMocks();
    capturedLogs = [];
    mockOutputHandler = jest.fn((level: string, message: string, data?: any) => {
      capturedLogs.push({ level, message, data });
    });
  });

  afterEach(() => {
    restoreConsoleMocks(mocks);
  });

  describe('Custom Output Handler', () => {
    it('should use custom output handler when configured', () => {
      // Configure with custom output handler
      logger.configure({
        mode: LogMode.DEBUG,
        outputHandler: mockOutputHandler
      });

      logger.info('Test message', { key: 'value' });

      // Verify custom handler was called
      expect(mockOutputHandler).toHaveBeenCalledTimes(1);
      expect(mockOutputHandler).toHaveBeenCalledWith(
        'info',
        expect.stringContaining('Test message'),
        { key: 'value' }
      );

      // Verify console was not called
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
      expect(mocks.mockConsoleError).not.toHaveBeenCalled();
      expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should pass correct log levels to output handler', () => {
      logger.configure({
        mode: LogMode.DEBUG,
        outputHandler: mockOutputHandler
      });

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');
      logger.error('Error message');
      logger.log('Log message');

      expect(mockOutputHandler).toHaveBeenCalledTimes(5);
      expect(mockOutputHandler).toHaveBeenNthCalledWith(1, 'debug', expect.any(String), undefined);
      expect(mockOutputHandler).toHaveBeenNthCalledWith(2, 'info', expect.any(String), undefined);
      expect(mockOutputHandler).toHaveBeenNthCalledWith(3, 'warn', expect.any(String), undefined);
      expect(mockOutputHandler).toHaveBeenNthCalledWith(4, 'error', expect.any(String), undefined);
      expect(mockOutputHandler).toHaveBeenNthCalledWith(5, 'log', expect.any(String), undefined);
    });

    it('should work with raw logging methods', () => {
      logger.configure({
        mode: LogMode.DEBUG,
        outputHandler: mockOutputHandler
      });

      const testData = { sensitive: 'data' };
      logger.infoRaw('Raw message', testData);

      expect(mockOutputHandler).toHaveBeenCalledTimes(1);
      expect(mockOutputHandler).toHaveBeenCalledWith(
        'info',
        expect.stringContaining('Raw message'),
        testData
      );
    });

    it('should still respect log level filtering', () => {
      logger.configure({
        mode: LogMode.ERROR,
        outputHandler: mockOutputHandler
      });

      logger.debug('Debug message');
      logger.info('Info message');
      logger.error('Error message');

      // Only error should be logged due to ERROR mode
      expect(mockOutputHandler).toHaveBeenCalledTimes(1);
      expect(mockOutputHandler).toHaveBeenCalledWith(
        'error',
        expect.stringContaining('Error message'),
        undefined
      );
    });
  });

  describe('Console Suppression', () => {
    it('should suppress console output when suppressConsoleOutput is true', () => {
      logger.configure({
        mode: LogMode.DEBUG,
        suppressConsoleOutput: true
      });

      logger.info('Test message');
      logger.error('Error message');

      // Verify console was not called
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
      expect(mocks.mockConsoleError).not.toHaveBeenCalled();
      expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should work with custom handler and console suppression', () => {
      logger.configure({
        mode: LogMode.DEBUG,
        outputHandler: mockOutputHandler,
        suppressConsoleOutput: true
      });

      logger.info('Test message');

      // Custom handler should be called
      expect(mockOutputHandler).toHaveBeenCalledTimes(1);
      // Console should not be called
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should go completely silent with suppressConsoleOutput=true and no handler', () => {
      logger.configure({
        mode: LogMode.DEBUG,
        suppressConsoleOutput: true
        // No outputHandler
      });

      logger.info('Test message');
      logger.error('Error message');

      // Nothing should be logged anywhere
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
      expect(mocks.mockConsoleError).not.toHaveBeenCalled();
      expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
    });
  });

  describe('Backward Compatibility', () => {
    it('should work exactly as before when no new options are provided', () => {
      logger.configure({
        mode: LogMode.DEBUG
      });

      logger.info('Test message');
      logger.error('Error message');

      // Should use console as before
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      );
      expect(mocks.mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error message')
      );
    });

    it('should maintain console behavior when suppressConsoleOutput is false', () => {
      logger.configure({
        mode: LogMode.DEBUG,
        suppressConsoleOutput: false
      });

      logger.info('Test message');

      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
    });

    it('should maintain console behavior when suppressConsoleOutput is undefined', () => {
      logger.configure({
        mode: LogMode.DEBUG,
        suppressConsoleOutput: undefined
      });

      logger.warn('Warning message');

      expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Data Redaction with Output Handlers', () => {
    it('should pass redacted data to output handler for regular methods', () => {
      logger.configure({
        mode: LogMode.DEBUG,
        outputHandler: mockOutputHandler
      });

      logger.info('User login', { username: 'john', password: 'secret123' });

      expect(mockOutputHandler).toHaveBeenCalledTimes(1);
      const [level, message, data] = mockOutputHandler.mock.calls[0];

      expect(level).toBe('info');
      expect(message).toContain('User login');
      expect(data).toEqual({ username: 'john', password: '[REDACTED]' });
    });

    it('should pass unredacted data to output handler for raw methods', () => {
      logger.configure({
        mode: LogMode.DEBUG,
        outputHandler: mockOutputHandler
      });

      const originalData = { username: 'john', password: 'secret123' };
      logger.infoRaw('User login', originalData);

      expect(mockOutputHandler).toHaveBeenCalledTimes(1);
      const [level, message, data] = mockOutputHandler.mock.calls[0];

      expect(level).toBe('info');
      expect(message).toContain('User login');
      expect(data).toEqual(originalData);
    });
  });

  describe('Error Handling', () => {
    it('should handle output handler errors gracefully and fallback to console', () => {
      const faultyHandler: LogOutputHandler = jest.fn(() => {
        throw new Error('Handler error');
      });

      logger.configure({
        mode: LogMode.DEBUG,
        outputHandler: faultyHandler
      });

      // This should not throw and should fallback to console
      expect(() => {
        logger.info('Test message');
      }).not.toThrow();

      // Should have called the faulty handler
      expect(faultyHandler).toHaveBeenCalledTimes(1);

      // Should have fallen back to console
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1); // Error message about handler failure
    });
  });

  describe('Real-world Use Cases', () => {
    it('should support GUI application log capture', () => {
      const uiLogs: Array<{ level: string; message: string; timestamp: Date }> = [];

      logger.configure({
        mode: LogMode.DEBUG,
        suppressConsoleOutput: true,
        outputHandler: (level, message) => {
          uiLogs.push({ level, message, timestamp: new Date() });
        }
      });

      logger.info('Application started');
      logger.warn('Configuration warning');
      logger.error('Connection failed');

      expect(uiLogs).toHaveLength(3);
      expect(uiLogs[0]).toMatchObject({ level: 'info', message: expect.stringContaining('Application started') });
      expect(uiLogs[1]).toMatchObject({ level: 'warn', message: expect.stringContaining('Configuration warning') });
      expect(uiLogs[2]).toMatchObject({ level: 'error', message: expect.stringContaining('Connection failed') });
    });

    it('should support testing framework log capture', () => {
      const testLogs: Array<{ level: string; message: string }> = [];

      logger.configure({
        mode: LogMode.DEBUG,
        suppressConsoleOutput: true,
        outputHandler: (level, message) => {
          testLogs.push({ level, message });
        }
      });

      // Simulate application code
      logger.info('User logged in');
      logger.error('Expected error for testing');

      // Test assertions
      expect(testLogs).toHaveLength(2);
      expect(testLogs).toContainEqual({
        level: 'info',
        message: expect.stringContaining('User logged in')
      });
      expect(testLogs).toContainEqual({
        level: 'error',
        message: expect.stringContaining('Expected error for testing')
      });
    });
  });
});

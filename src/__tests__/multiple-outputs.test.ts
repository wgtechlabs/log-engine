/**
 * Tests for Multiple Output functionality
 * Verifies multiple output targets, built-in handlers, and mixed configurations
 */

import { Logger } from '../logger';
import { LogMode } from '../types';
import type { LogOutputHandler, OutputTarget } from '../types';
import { setupConsoleMocks, restoreConsoleMocks, ConsoleMocks } from './test-utils';

describe('Multiple Output functionality', () => {
  let logger: Logger;
  let mocks: ConsoleMocks;
  let capturedLogs1: Array<{ level: string; message: string; data?: any }>;
  let capturedLogs2: Array<{ level: string; message: string; data?: any }>;
  let mockHandler1: jest.MockedFunction<LogOutputHandler>;
  let mockHandler2: jest.MockedFunction<LogOutputHandler>;

  beforeEach(() => {
    logger = new Logger();
    mocks = setupConsoleMocks();
    capturedLogs1 = [];
    capturedLogs2 = [];

    mockHandler1 = jest.fn((level: string, message: string, data?: any) => {
      capturedLogs1.push({ level, message, data });
    });

    mockHandler2 = jest.fn((level: string, message: string, data?: any) => {
      capturedLogs2.push({ level, message, data });
    });
  });

  afterEach(() => {
    restoreConsoleMocks(mocks);
  });

  describe('Built-in Output Handlers', () => {
    it('should support console built-in handler', () => {
      logger.configure({
        mode: LogMode.DEBUG,
        outputs: ['console']
      });

      logger.info('Test message');
      logger.warn('Warning message');
      logger.error('Error message');

      // Should use appropriate console methods
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);

      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Test message')
      );
      expect(mocks.mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Warning message')
      );
      expect(mocks.mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error message')
      );
    });

    it('should support silent built-in handler', () => {
      logger.configure({
        mode: LogMode.DEBUG,
        outputs: ['silent']
      });

      logger.info('Silent message');
      logger.error('Silent error');

      // Nothing should be logged
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
      expect(mocks.mockConsoleError).not.toHaveBeenCalled();
      expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should handle unknown built-in handler gracefully', () => {
      logger.configure({
        mode: LogMode.DEBUG,
        outputs: ['unknown' as any]
      });

      logger.info('Test message');

      // Should log error about unknown handler
      expect(mocks.mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Unknown built-in output handler: unknown')
      );
    });
  });

  describe('Multiple Custom Handlers', () => {
    it('should send logs to multiple custom handlers', () => {
      logger.configure({
        mode: LogMode.DEBUG,
        outputs: [mockHandler1, mockHandler2]
      });

      logger.info('Test message', { key: 'value' });

      // Both handlers should be called
      expect(mockHandler1).toHaveBeenCalledTimes(1);
      expect(mockHandler2).toHaveBeenCalledTimes(1);

      expect(mockHandler1).toHaveBeenCalledWith(
        'info',
        expect.stringContaining('Test message'),
        { key: 'value' }
      );
      expect(mockHandler2).toHaveBeenCalledWith(
        'info',
        expect.stringContaining('Test message'),
        { key: 'value' }
      );

      expect(capturedLogs1).toHaveLength(1);
      expect(capturedLogs2).toHaveLength(1);
    });

    it('should continue processing outputs even if one fails', () => {
      const faultyHandler = jest.fn(() => {
        throw new Error('Handler failed');
      });

      logger.configure({
        mode: LogMode.DEBUG,
        outputs: [faultyHandler, mockHandler1, mockHandler2]
      });

      logger.info('Test message');

      // Faulty handler should be called but fail
      expect(faultyHandler).toHaveBeenCalledTimes(1);
      // Other handlers should still work
      expect(mockHandler1).toHaveBeenCalledTimes(1);
      expect(mockHandler2).toHaveBeenCalledTimes(1);
      // Error should be logged
      expect(mocks.mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Output handler failed')
      );
    });
  });

  describe('Mixed Output Types', () => {
    it('should support mixed array of built-in and custom handlers', () => {
      logger.configure({
        mode: LogMode.DEBUG,
        outputs: ['console', mockHandler1, 'silent', mockHandler2]
      });

      logger.info('Mixed output test');

      // Console should be called
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      // Custom handlers should be called
      expect(mockHandler1).toHaveBeenCalledTimes(1);
      expect(mockHandler2).toHaveBeenCalledTimes(1);
      // Silent does nothing (no additional verification needed)
    });

    it('should handle empty outputs array', () => {
      logger.configure({
        mode: LogMode.DEBUG,
        outputs: []
      });

      logger.info('Empty outputs test');

      // Nothing should be logged
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
      expect(mocks.mockConsoleError).not.toHaveBeenCalled();
      expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should handle invalid output types gracefully', () => {
      logger.configure({
        mode: LogMode.DEBUG,
        outputs: [mockHandler1, null as any, 123 as any, mockHandler2]
      });

      logger.info('Invalid outputs test');

      // Valid handlers should work
      expect(mockHandler1).toHaveBeenCalledTimes(1);
      expect(mockHandler2).toHaveBeenCalledTimes(1);
      // Errors should be logged for invalid outputs
      expect(mocks.mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Invalid output target'),
        null
      );
      expect(mocks.mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Invalid output target'),
        123
      );
    });
  });

  describe('Backward Compatibility', () => {
    it('should prioritize outputs over outputHandler when both are provided', () => {
      const legacyHandler = jest.fn();

      logger.configure({
        mode: LogMode.DEBUG,
        outputHandler: legacyHandler,
        outputs: [mockHandler1]
      });

      logger.info('Compatibility test');

      // Only outputs should be used, not legacy outputHandler
      expect(mockHandler1).toHaveBeenCalledTimes(1);
      expect(legacyHandler).not.toHaveBeenCalled();
    });

    it('should fall back to outputHandler when outputs is not configured', () => {
      const legacyHandler = jest.fn();

      logger.configure({
        mode: LogMode.DEBUG,
        outputHandler: legacyHandler
        // No outputs property at all
      });

      logger.info('Fallback test');

      // Should use legacy outputHandler when outputs is undefined
      expect(legacyHandler).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should work with outputHandler when no outputs configured', () => {
      const legacyHandler = jest.fn();

      logger.configure({
        mode: LogMode.DEBUG,
        outputHandler: legacyHandler
        // No outputs property
      });

      logger.info('Legacy test');

      // Should use legacy outputHandler
      expect(legacyHandler).toHaveBeenCalledTimes(1);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should support console + file + network logging pattern', () => {
      const fileLogs: string[] = [];
      const networkLogs: Array<{ level: string; message: string; timestamp: string }> = [];

      const fileHandler: LogOutputHandler = (level, message) => {
        fileLogs.push(`[${level.toUpperCase()}] ${message}`);
      };

      const networkHandler: LogOutputHandler = (level, message) => {
        networkLogs.push({
          level,
          message: message.replace(/\x1b\[[0-9;]*m/g, ''), // Strip ANSI colors
          timestamp: new Date().toISOString()
        });
      };

      logger.configure({
        mode: LogMode.DEBUG,
        outputs: ['console', fileHandler, networkHandler]
      });

      logger.info('Application started');
      logger.warn('Memory usage high');
      logger.error('Database connection failed');

      // Console output
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);

      // File output
      expect(fileLogs).toHaveLength(3);
      expect(fileLogs[0]).toContain('[INFO]');
      expect(fileLogs[1]).toContain('[WARN]');
      expect(fileLogs[2]).toContain('[ERROR]');

      // Network output
      expect(networkLogs).toHaveLength(3);
      expect(networkLogs[0].level).toBe('info');
      expect(networkLogs[1].level).toBe('warn');
      expect(networkLogs[2].level).toBe('error');
    });

    it('should support development vs production output configurations', () => {
      // Development: Console + detailed file logging
      const devLogs: Array<{ level: string; message: string; data: any; stack?: string }> = [];
      const devHandler: LogOutputHandler = (level, message, data) => {
        devLogs.push({ level, message, data, stack: new Error().stack });
      };

      logger.configure({
        mode: LogMode.DEBUG,
        outputs: ['console', devHandler]
      });

      logger.debug('Debug info for development');
      logger.info('App started in dev mode');

      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(2);
      expect(devLogs).toHaveLength(2);

      // Reset for production test
      jest.clearAllMocks();
      capturedLogs1.length = 0;
      devLogs.length = 0;

      // Production: Structured logging only (no console)
      const prodLogs: Array<{ timestamp: string; level: string; message: string }> = [];
      const prodHandler: LogOutputHandler = (level, message) => {
        prodLogs.push({
          timestamp: new Date().toISOString(),
          level,
          message: message.replace(/\x1b\[[0-9;]*m/g, '')
        });
      };

      logger.configure({
        mode: LogMode.WARN, // Less verbose in production
        outputs: [prodHandler] // No console output
      });

      logger.debug('Debug ignored in prod');
      logger.info('Info ignored in prod');
      logger.warn('Warning in prod');
      logger.error('Error in prod');

      // No console output in production
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
      expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
      expect(mocks.mockConsoleError).not.toHaveBeenCalled();

      // Only WARN and ERROR should be logged
      expect(prodLogs).toHaveLength(2);
      expect(prodLogs[0].level).toBe('warn');
      expect(prodLogs[1].level).toBe('error');
    });
  });

  describe('Performance and Filtering', () => {
    it('should respect log level filtering with multiple outputs', () => {
      logger.configure({
        mode: LogMode.ERROR, // Only ERROR and LOG levels
        outputs: [mockHandler1, mockHandler2, 'console']
      });

      logger.debug('Debug filtered');
      logger.info('Info filtered');
      logger.warn('Warn filtered');
      logger.error('Error shown');

      // Only error should reach any output
      expect(mockHandler1).toHaveBeenCalledTimes(1);
      expect(mockHandler2).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);

      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
      expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should process outputs efficiently', () => {
      const start = process.hrtime.bigint();

      logger.configure({
        mode: LogMode.DEBUG,
        outputs: [mockHandler1, mockHandler2, 'console', 'silent']
      });

      // Log multiple messages
      for (let i = 0; i < 100; i++) {
        logger.info(`Message ${i}`);
      }

      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // Convert to milliseconds

      // Should complete reasonably fast (less than 100ms for 100 messages)
      expect(duration).toBeLessThan(100);

      // All outputs should be called
      expect(mockHandler1).toHaveBeenCalledTimes(100);
      expect(mockHandler2).toHaveBeenCalledTimes(100);
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(100);
    });
  });
});

/**
 * Tests for log element customization features
 * Verifies that users can customize which elements are included in log output
 * while ensuring log levels remain mandatory
 */

import { LogEngine, LogMode, LogLevel } from '../index';
import { MessageFormatter } from '../formatter';

// Helper function to remove ANSI color codes from strings for easier testing
const cleanAnsiCodes = (str: string): string => str.replace(/\x1b\[[0-9;]*m/g, '');

describe('Log Format Customization', () => {
  beforeEach(() => {
    // Reset to default configuration before each test
    LogEngine.configure({
      mode: LogMode.DEBUG,
      format: undefined // Explicitly reset format configuration
    });
  });

  describe('MessageFormatter.format with format configuration', () => {
    it('should include both timestamps by default (backward compatibility)', () => {
      const formatted = MessageFormatter.format(LogLevel.INFO, 'Test message');
      const clean = cleanAnsiCodes(formatted);

      // Should match the pattern: [ISO_TIMESTAMP][LOCAL_TIME][INFO]: Test message
      expect(clean).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]\[\d{1,2}:\d{2}[AP]M\]\[INFO\]: Test message$/);
    });

    it('should include both timestamps when explicitly configured', () => {
      const formatConfig = {
        includeIsoTimestamp: true,
        includeLocalTime: true
      };
      const formatted = MessageFormatter.format(LogLevel.INFO, 'Test message', undefined, formatConfig);
      const clean = cleanAnsiCodes(formatted);

      expect(clean).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]\[\d{1,2}:\d{2}[AP]M\]\[INFO\]: Test message$/);
    });

    it('should exclude ISO timestamp when configured', () => {
      const formatConfig = {
        includeIsoTimestamp: false,
        includeLocalTime: true
      };
      const formatted = MessageFormatter.format(LogLevel.INFO, 'Test message', undefined, formatConfig);
      const clean = cleanAnsiCodes(formatted);

      // Should only have local time, not ISO timestamp
      expect(clean).toMatch(/^\[\d{1,2}:\d{2}[AP]M\]\[INFO\]: Test message$/);
      expect(clean).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    });

    it('should exclude local time when configured', () => {
      const formatConfig = {
        includeIsoTimestamp: true,
        includeLocalTime: false
      };
      const formatted = MessageFormatter.format(LogLevel.INFO, 'Test message', undefined, formatConfig);
      const clean = cleanAnsiCodes(formatted);

      // Should only have ISO timestamp, not local time
      expect(clean).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]\[INFO\]: Test message$/);
      expect(clean).not.toMatch(/\[\d{1,2}:\d{2}[AP]M\]/);
    });

    it('should exclude both timestamps when configured', () => {
      const formatConfig = {
        includeIsoTimestamp: false,
        includeLocalTime: false
      };
      const formatted = MessageFormatter.format(LogLevel.INFO, 'Test message', undefined, formatConfig);
      const clean = cleanAnsiCodes(formatted);

      // Should only have level and message, no timestamps
      expect(clean).toBe('[INFO]: Test message');
      expect(clean).not.toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/);
      expect(clean).not.toMatch(/\[\d{1,2}:\d{2}[AP]M\]/);
    });

    it('should always include log level regardless of configuration', () => {
      // Test with different log levels
      const formatConfig = {
        includeIsoTimestamp: false,
        includeLocalTime: false
      };

      const levels = [
        { level: LogLevel.DEBUG, name: 'DEBUG' },
        { level: LogLevel.INFO, name: 'INFO' },
        { level: LogLevel.WARN, name: 'WARN' },
        { level: LogLevel.ERROR, name: 'ERROR' },
        { level: LogLevel.LOG, name: 'LOG' }
      ];

      levels.forEach(({ level, name }) => {
        const formatted = MessageFormatter.format(level, 'Test message', undefined, formatConfig);
        const clean = cleanAnsiCodes(formatted);
        expect(clean).toContain(`[${name}]`);
        expect(clean).toBe(`[${name}]: Test message`);
      });
    });

    it('should handle data parameter with format configuration', () => {
      const formatConfig = {
        includeIsoTimestamp: false,
        includeLocalTime: false
      };
      const data = { key: 'value' };
      const formatted = MessageFormatter.format(LogLevel.INFO, 'Test message', data, formatConfig);
      const clean = cleanAnsiCodes(formatted);

      expect(clean).toMatch(/^\[INFO\]: Test message \{"key":"value"\}$/);
    });
  });

  describe('MessageFormatter.formatSystemMessage with format configuration', () => {
    it('should support format configuration for system messages', () => {
      const formatConfig = {
        includeIsoTimestamp: false,
        includeLocalTime: true
      };
      const formatted = MessageFormatter.formatSystemMessage('System message', formatConfig);
      const clean = cleanAnsiCodes(formatted);

      expect(clean).toMatch(/^\[\d{1,2}:\d{2}[AP]M\]\[LOG ENGINE\]: System message$/);
      expect(clean).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    });

    it('should use default format when no configuration provided', () => {
      const formatted = MessageFormatter.formatSystemMessage('System message');
      const clean = cleanAnsiCodes(formatted);

      expect(clean).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]\[\d{1,2}:\d{2}[AP]M\]\[LOG ENGINE\]: System message$/);
    });
  });

  describe('LogEngine integration with format configuration', () => {
    let consoleOutput: string[] = [];
    let originalConsoleLog: typeof console.log;
    let originalConsoleWarn: typeof console.warn;
    let originalConsoleError: typeof console.error;

    beforeEach(() => {
      consoleOutput = [];
      originalConsoleLog = console.log;
      originalConsoleWarn = console.warn;
      originalConsoleError = console.error;

      // Mock console methods to capture output
      console.log = (...args: any[]) => {
        consoleOutput.push(args.join(' '));
      };
      console.warn = (...args: any[]) => {
        consoleOutput.push(args.join(' '));
      };
      console.error = (...args: any[]) => {
        consoleOutput.push(args.join(' '));
      };
    });

    afterEach(() => {
      // Restore original console methods
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    });

    it('should apply format configuration through LogEngine.configure', () => {
      LogEngine.configure({
        mode: LogMode.DEBUG,
        format: {
          includeIsoTimestamp: false,
          includeLocalTime: true
        }
      });

      LogEngine.info('Test message');

      expect(consoleOutput).toHaveLength(1);
      const clean = cleanAnsiCodes(consoleOutput[0]);
      expect(clean).toMatch(/^\[\d{1,2}:\d{2}[AP]M\]\[INFO\]: Test message$/);
      expect(clean).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    });

    it('should work with all log levels and custom format', () => {
      LogEngine.configure({
        mode: LogMode.DEBUG,
        format: {
          includeIsoTimestamp: false,
          includeLocalTime: false
        }
      });

      LogEngine.debug('Debug message');
      LogEngine.info('Info message');
      LogEngine.warn('Warn message');
      LogEngine.error('Error message');
      LogEngine.log('Log message');

      expect(consoleOutput).toHaveLength(5);

      const cleanOutput = consoleOutput.map(cleanAnsiCodes);
      expect(cleanOutput[0]).toBe('[DEBUG]: Debug message');
      expect(cleanOutput[1]).toBe('[INFO]: Info message');
      expect(cleanOutput[2]).toBe('[WARN]: Warn message');
      expect(cleanOutput[3]).toBe('[ERROR]: Error message');
      expect(cleanOutput[4]).toBe('[LOG]: Log message');
    });

    it('should work with raw logging methods and custom format', () => {
      LogEngine.configure({
        mode: LogMode.DEBUG,
        format: {
          includeIsoTimestamp: true,
          includeLocalTime: false
        }
      });

      LogEngine.debugRaw('Debug raw message');
      LogEngine.infoRaw('Info raw message');

      expect(consoleOutput).toHaveLength(2);

      const cleanOutput = consoleOutput.map(cleanAnsiCodes);
      expect(cleanOutput[0]).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]\[DEBUG\]: Debug raw message$/);
      expect(cleanOutput[1]).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]\[INFO\]: Info raw message$/);
    });

    it('should maintain backward compatibility when no format configuration is provided', () => {
      LogEngine.configure({
        mode: LogMode.DEBUG
        // No format configuration provided
      });

      LogEngine.info('Test message');

      expect(consoleOutput).toHaveLength(1);
      const clean = cleanAnsiCodes(consoleOutput[0]);
      expect(clean).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]\[\d{1,2}:\d{2}[AP]M\]\[INFO\]: Test message$/);
    });

    it('should handle partial format configuration', () => {
      LogEngine.configure({
        mode: LogMode.DEBUG,
        format: {
          includeIsoTimestamp: false
          // includeLocalTime not specified - should default to true
        }
      });

      LogEngine.info('Test message');

      expect(consoleOutput).toHaveLength(1);
      const clean = cleanAnsiCodes(consoleOutput[0]);
      expect(clean).toMatch(/^\[\d{1,2}:\d{2}[AP]M\]\[INFO\]: Test message$/);
      expect(clean).not.toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/);
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle undefined format configuration gracefully', () => {
      const formatted = MessageFormatter.format(LogLevel.INFO, 'Test message', undefined, undefined);
      const clean = cleanAnsiCodes(formatted);

      // Should use defaults when undefined is passed
      expect(clean).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]\[\d{1,2}:\d{2}[AP]M\]\[INFO\]: Test message$/);
    });

    it('should handle empty format configuration object', () => {
      const formatted = MessageFormatter.format(LogLevel.INFO, 'Test message', undefined, {});
      const clean = cleanAnsiCodes(formatted);

      // Should use defaults when empty object is passed
      expect(clean).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]\[\d{1,2}:\d{2}[AP]M\]\[INFO\]: Test message$/);
    });

    it('should preserve ANSI color codes when timestamps are excluded', () => {
      const formatConfig = {
        includeIsoTimestamp: false,
        includeLocalTime: false
      };
      const formatted = MessageFormatter.format(LogLevel.ERROR, 'Error message', undefined, formatConfig);

      // Should still contain color codes for the level
      expect(formatted).toContain('\x1b['); // ANSI escape sequence
      expect(formatted).toContain('\x1b[31m'); // Red color for ERROR level
      expect(formatted).toContain('\x1b[0m'); // Reset color
    });
  });
});
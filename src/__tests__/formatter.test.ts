/**
 * Tests for the LogFormatter class
 * Verifies message formatting, timestamp generation, and level-specific formatting
 */

import { LogFormatter } from '../formatter';
import { LogLevel } from '../types';
import { styleData } from '../formatter/data-formatter';

describe('LogFormatter', () => {
  it('should format messages with timestamp and level', () => {
    // Test complete message formatting with all components
    const formatted = LogFormatter.format(LogLevel.INFO, 'Test message');
    
    // Remove ANSI color codes for pattern matching
    const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');
    
    // Verify format: [ISO_TIMESTAMP][LOCAL_TIME][LEVEL]: message
    expect(cleanFormatted).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]\[\d{1,2}:\d{2}[AP]M\]\[INFO\]: Test message$/);
  });

  it('should format different log levels correctly', () => {
    // Test that each log level gets properly formatted with correct level name
    const debugFormatted = LogFormatter.format(LogLevel.DEBUG, 'Debug test');
    const infoFormatted = LogFormatter.format(LogLevel.INFO, 'Info test');
    const warnFormatted = LogFormatter.format(LogLevel.WARN, 'Warn test');
    const errorFormatted = LogFormatter.format(LogLevel.ERROR, 'Error test');
    const logFormatted = LogFormatter.format(LogLevel.LOG, 'LOG test');
    
    // Remove ANSI color codes and verify each level appears correctly
    expect(debugFormatted.replace(/\x1b\[[0-9;]*m/g, '')).toContain('[DEBUG]');
    expect(infoFormatted.replace(/\x1b\[[0-9;]*m/g, '')).toContain('[INFO]');
    expect(warnFormatted.replace(/\x1b\[[0-9;]*m/g, '')).toContain('[WARN]');
    expect(errorFormatted.replace(/\x1b\[[0-9;]*m/g, '')).toContain('[ERROR]');
    expect(logFormatted.replace(/\x1b\[[0-9;]*m/g, '')).toContain('[LOG]');
  });

  it('should include the message in the formatted output', () => {
    // Test that custom messages are preserved in formatted output
    const message = 'Custom test message';
    const formatted = LogFormatter.format(LogLevel.INFO, message);
    
    expect(formatted).toContain(message);
  });

  it('should handle empty messages', () => {
    // Test edge case: empty message should still produce valid format
    const formatted = LogFormatter.format(LogLevel.INFO, '');
    
    // Remove ANSI color codes for pattern matching
    const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');
    
    // Should have timestamps and level but empty message at end
    expect(cleanFormatted).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]\[\d{1,2}:\d{2}[AP]M\]\[INFO\]: $/);
  });

  it('should handle special characters in messages', () => {
    // Test that special characters don't break formatting
    const message = 'Test with special chars: !@#$%^&*()';
    const formatted = LogFormatter.format(LogLevel.INFO, message);
    
    expect(formatted).toContain(message);
  });

  it('should format LOG level correctly with green color', () => {
    // Test LOG level formatting with specific color
    const formatted = LogFormatter.format(LogLevel.LOG, 'LOG level message');
    const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');
    
    expect(cleanFormatted).toContain('[LOG]');
    expect(cleanFormatted).toContain('LOG level message');
    // Verify green color code is applied (ANSI code 32)
    expect(formatted).toContain('\x1b[32m');
  });

  it('should handle unknown log levels with default case', () => {
    // Test default case for unknown log levels (covers missing branch)
    // @ts-ignore - intentionally passing invalid enum value for testing
    const formatted = LogFormatter.format(999 as LogLevel, 'Unknown level message');
    const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');
    
    expect(cleanFormatted).toContain('[UNKNOWN]');
    expect(cleanFormatted).toContain('Unknown level message');
  });

  describe('formatSystemMessage', () => {
    it('should format system messages with [LOG ENGINE] prefix', () => {
      const message = 'This is a system message';
      const formatted = LogFormatter.formatSystemMessage(message);
      
      // Should contain the LOG ENGINE prefix
      expect(formatted).toContain('[LOG ENGINE]');
      
      // Should contain the message content
      expect(formatted).toContain(message);
      
      // Should contain timestamp components
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanFormatted).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/); // ISO timestamp
      expect(cleanFormatted).toMatch(/\[\d{1,2}:\d{2}[AP]M\]/); // Local time
    });

    it('should format system messages with colors', () => {
      const message = 'Colored system message';
      const formatted = LogFormatter.formatSystemMessage(message);
      
      // Should contain ANSI color codes
      expect(formatted).toContain('\x1b['); // ANSI escape sequence start
      expect(formatted).toContain('\x1b[0m'); // Reset color code
      
      // Should contain yellow color for LOG ENGINE prefix
      expect(formatted).toContain('\x1b[33m'); // Yellow color code
    });

    it('should maintain consistent format structure', () => {
      const message = 'Test message';
      const formatted = LogFormatter.formatSystemMessage(message);
      
      // Remove ANSI color codes for pattern matching
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');
      
      // Should follow the format: [TIMESTAMP][TIME][LOG ENGINE]: message
      const formatPattern = /\[.*?\]\[.*?\]\[LOG ENGINE\]: Test message/;
      expect(cleanFormatted).toMatch(formatPattern);
    });
  });

  describe('formatData edge cases', () => {
    it('should handle null values', () => {
      // Test null handling (covers line 98)
      const formatted = LogFormatter.format(LogLevel.INFO, 'Message', null);
      expect(formatted).toContain('null');
    });

    it('should handle undefined values', () => {
      // Test undefined handling (covers line 102)
      const formatted = LogFormatter.format(LogLevel.INFO, 'Message', undefined);
      expect(formatted).toContain('Message');
      // The formatted message should not contain 'undefined'
      // Remove ANSI color codes before pattern matching
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanFormatted).toMatch(/Message$/);
    });

    it('should handle number values', () => {
      // Test number handling (covers line 106)
      const formatted = LogFormatter.format(LogLevel.INFO, 'Message', 42);
      expect(formatted).toContain('42');
    });

    it('should handle boolean values', () => {
      // Test boolean handling (covers line 110)
      const formatted = LogFormatter.format(LogLevel.INFO, 'Message', true);
      expect(formatted).toContain('true');
      
      const formatted2 = LogFormatter.format(LogLevel.INFO, 'Message', false);
      expect(formatted2).toContain('false');
    });

    it('should handle objects that cannot be stringified', () => {
      // Test JSON.stringify error handling (covers line 117)
      const circularObj: any = {};
      circularObj.self = circularObj; // Create circular reference
      
      const formatted = LogFormatter.format(LogLevel.INFO, 'Message', circularObj);
      expect(formatted).toContain('[Object]');
    });

    it('should handle string data types', () => {
      // Test to cover line 106 - string handling
      const formatted = LogFormatter.format(LogLevel.INFO, 'Message', 'test string');
      expect(formatted).toContain('test string');
    });

    it('should handle undefined values in formatData', () => {
      // Test to cover line 102 - undefined returns empty string
      // Import the formatData function from the new modular structure
      const { formatData } = require('../formatter/data-formatter');
      const result = formatData(undefined);
      expect(result).toBe('');
    });
  });

  describe('styleData function', () => {
    const mockColors = { data: '\x1b[36m', reset: '\x1b[0m' };

    it('should return empty string for empty dataString', () => {
      // Test to cover line 45 - empty string case
      expect(styleData('', mockColors)).toBe('');
    });

    it('should return empty string for null/undefined dataString', () => {
      // Test to cover line 45 - falsy values
      expect(styleData(null as any, mockColors)).toBe('');
      expect(styleData(undefined as any, mockColors)).toBe('');
    });

    it('should style non-empty data string correctly', () => {
      // Test normal case
      const result = styleData('test data', mockColors);
      expect(result).toBe(` ${mockColors.data}test data${mockColors.reset}`);
    });
  });

  describe('Module exports', () => {
    it('should export all formatter functions and classes', () => {
      const formatter = require('../formatter');
      
      // Test that all expected exports are available
      expect(formatter.MessageFormatter).toBeDefined();
      expect(formatter.LogFormatter).toBeDefined(); // Backward compatibility
      expect(formatter.colors).toBeDefined();
      expect(formatter.colorScheme).toBeDefined();
      expect(formatter.getTimestampComponents).toBeDefined();
      expect(formatter.formatTimestamp).toBeDefined();
      expect(formatter.formatData).toBeDefined();
      expect(formatter.styleData).toBeDefined();
      
      // Test that LogFormatter is alias for MessageFormatter
      expect(formatter.LogFormatter).toBe(formatter.MessageFormatter);
      
      // Test that functions are callable
      expect(typeof formatter.getTimestampComponents).toBe('function');
      expect(typeof formatter.formatTimestamp).toBe('function');
      expect(typeof formatter.formatData).toBe('function');
      expect(typeof formatter.styleData).toBe('function');
    });
  });
});

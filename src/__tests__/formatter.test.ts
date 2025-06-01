/**
 * Tests for the LogFormatter class
 * Verifies message formatting, timestamp generation, and level-specific formatting
 */

import { LogFormatter } from '../formatter';
import { LogLevel } from '../types';

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
      expect(formatted).toMatch(/\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]/); // ISO timestamp
      expect(formatted).toMatch(/\[\d{1,2}:\d{2}[AP]M\]/); // Local time
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
});

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
    
    // Verify format: [ISO_TIMESTAMP] [LOCAL_TIME] [LEVEL] message
    expect(formatted).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[\d{1,2}:\d{2} [AP]M\] \[INFO\] Test message$/);
  });

  it('should format different log levels correctly', () => {
    // Test that each log level gets properly formatted with correct level name
    const debugFormatted = LogFormatter.format(LogLevel.DEBUG, 'Debug test');
    const infoFormatted = LogFormatter.format(LogLevel.INFO, 'Info test');
    const warnFormatted = LogFormatter.format(LogLevel.WARN, 'Warn test');
    const errorFormatted = LogFormatter.format(LogLevel.ERROR, 'Error test');
    
    // Verify each level appears correctly in formatted output
    expect(debugFormatted).toContain('[DEBUG]');
    expect(infoFormatted).toContain('[INFO]');
    expect(warnFormatted).toContain('[WARN]');
    expect(errorFormatted).toContain('[ERROR]');
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
    
    // Should have timestamps and level but empty message at end
    expect(formatted).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[\d{1,2}:\d{2} [AP]M\] \[INFO\] $/);
  });

  it('should handle special characters in messages', () => {
    // Test that special characters don't break formatting
    const message = 'Test with special chars: !@#$%^&*()';
    const formatted = LogFormatter.format(LogLevel.INFO, message);
    
    expect(formatted).toContain(message);
  });
});

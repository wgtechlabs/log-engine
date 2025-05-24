import { LogFormatter } from '../formatter';
import { LogLevel } from '../types';

describe('LogFormatter', () => {
  it('should format messages with timestamp and level', () => {
    const formatted = LogFormatter.format(LogLevel.INFO, 'Test message');
    
    expect(formatted).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[\d{1,2}:\d{2} [AP]M\] \[INFO\] Test message$/);
  });

  it('should format different log levels correctly', () => {
    const debugFormatted = LogFormatter.format(LogLevel.DEBUG, 'Debug test');
    const infoFormatted = LogFormatter.format(LogLevel.INFO, 'Info test');
    const warnFormatted = LogFormatter.format(LogLevel.WARN, 'Warn test');
    const errorFormatted = LogFormatter.format(LogLevel.ERROR, 'Error test');
    
    expect(debugFormatted).toContain('[DEBUG]');
    expect(infoFormatted).toContain('[INFO]');
    expect(warnFormatted).toContain('[WARN]');
    expect(errorFormatted).toContain('[ERROR]');
  });

  it('should include the message in the formatted output', () => {
    const message = 'Custom test message';
    const formatted = LogFormatter.format(LogLevel.INFO, message);
    
    expect(formatted).toContain(message);
  });

  it('should handle empty messages', () => {
    const formatted = LogFormatter.format(LogLevel.INFO, '');
    
    expect(formatted).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[\d{1,2}:\d{2} [AP]M\] \[INFO\] $/);
  });

  it('should handle special characters in messages', () => {
    const message = 'Test with special chars: !@#$%^&*()';
    const formatted = LogFormatter.format(LogLevel.INFO, message);
    
    expect(formatted).toContain(message);
  });
});

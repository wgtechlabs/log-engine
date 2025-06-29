/**
 * Basic smoke test for redaction core functionality
 */

import { DataRedactor, defaultRedactionConfig } from '../../redaction';

describe('Redaction - Basic Smoke Test', () => {
  beforeEach(() => {
    DataRedactor.updateConfig(defaultRedactionConfig);
  });

  test('should redact password field', () => {
    const testData = { password: 'secret123' };
    const result = DataRedactor.redactData(testData);
    expect(result.password).toBe('[REDACTED]');
  });

  test('should not redact non-sensitive field', () => {
    const testData = { username: 'john_doe' };
    const result = DataRedactor.redactData(testData);
    expect(result.username).toBe('john_doe');
  });

  test('should handle null input', () => {
    const result = DataRedactor.redactData(null);
    expect(result).toBeNull();
  });
});

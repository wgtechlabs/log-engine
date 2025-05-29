/**
 * Tests for the LogLevel enum
 * Verifies enum values and ordering for proper level-based filtering
 */

import { LogLevel } from '../types';

describe('LogLevel enum', () => {
  it('should have correct numeric values', () => {
    // Test that enum values match expected numeric priorities
    // Lower numbers = lower priority (more verbose)
    // Higher numbers = higher priority (less verbose)
    expect(LogLevel.DEBUG).toBe(0);
    expect(LogLevel.INFO).toBe(1);
    expect(LogLevel.WARN).toBe(2);
    expect(LogLevel.ERROR).toBe(3);
    expect(LogLevel.SILENT).toBe(4);
  });

  it('should maintain proper ordering for filtering', () => {
    // Test that enum ordering supports level-based filtering logic
    // When level >= configured minimum, message should be shown
    expect(LogLevel.DEBUG).toBeLessThan(LogLevel.INFO);
    expect(LogLevel.INFO).toBeLessThan(LogLevel.WARN);
    expect(LogLevel.WARN).toBeLessThan(LogLevel.ERROR);
    expect(LogLevel.ERROR).toBeLessThan(LogLevel.SILENT);
  });
});

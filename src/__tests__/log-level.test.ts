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
    // LOG level is special with value 99 for always-on behavior
    expect(LogLevel.DEBUG).toBe(0);
    expect(LogLevel.INFO).toBe(1);
    expect(LogLevel.WARN).toBe(2);
    expect(LogLevel.ERROR).toBe(3);
    expect(LogLevel.SILENT).toBe(4);
    expect(LogLevel.OFF).toBe(5);
    expect(LogLevel.LOG).toBe(99);
  });

  it('should maintain proper ordering for filtering', () => {
    // Test that enum ordering supports level-based filtering logic
    // When level >= configured minimum, message should be shown
    // LOG level is special and doesn't follow normal ordering
    expect(LogLevel.DEBUG).toBeLessThan(LogLevel.INFO);
    expect(LogLevel.INFO).toBeLessThan(LogLevel.WARN);
    expect(LogLevel.WARN).toBeLessThan(LogLevel.ERROR);
    expect(LogLevel.ERROR).toBeLessThan(LogLevel.SILENT);
    expect(LogLevel.SILENT).toBeLessThan(LogLevel.OFF);
    expect(LogLevel.LOG).toBeGreaterThan(LogLevel.OFF);
  });

  it('should have LOG level as special always-on level', () => {
    // Test that LOG level has a special high value for always-on behavior
    expect(LogLevel.LOG).toBe(99);
    expect(LogLevel.LOG).toBeGreaterThan(LogLevel.ERROR);
    expect(LogLevel.LOG).toBeGreaterThan(LogLevel.SILENT);
    expect(LogLevel.LOG).toBeGreaterThan(LogLevel.OFF);
  });
});

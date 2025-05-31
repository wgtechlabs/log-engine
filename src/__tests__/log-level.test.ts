/**
 * Tests for the LogLevel and LogMode enums
 * Verifies enum values and ordering for proper level-based filtering
 */

import { LogLevel, LogMode } from '../types';

describe('LogLevel enum', () => {
  it('should have correct numeric values for severity levels', () => {
    // Test that enum values match expected numeric priorities
    // Lower numbers = lower priority (more verbose)
    // Higher numbers = higher priority (less verbose)
    // LOG level is special with value 99 for always-on behavior
    expect(LogLevel.DEBUG).toBe(0);
    expect(LogLevel.INFO).toBe(1);
    expect(LogLevel.WARN).toBe(2);
    expect(LogLevel.ERROR).toBe(3);
    expect(LogLevel.LOG).toBe(99);
  });

  it('should maintain proper ordering for severity levels', () => {
    // Test that enum ordering supports level-based filtering logic
    // When level >= configured minimum, message should be shown
    // LOG level is special and doesn't follow normal ordering
    expect(LogLevel.DEBUG).toBeLessThan(LogLevel.INFO);
    expect(LogLevel.INFO).toBeLessThan(LogLevel.WARN);
    expect(LogLevel.WARN).toBeLessThan(LogLevel.ERROR);
    expect(LogLevel.LOG).toBeGreaterThan(LogLevel.ERROR);
  });

  it('should have LOG level as special always-on level', () => {
    // Test that LOG level has a special high value for always-on behavior
    expect(LogLevel.LOG).toBe(99);
    expect(LogLevel.LOG).toBeGreaterThan(LogLevel.ERROR);
  });
});

describe('LogMode enum', () => {
  it('should have correct numeric values for output modes', () => {
    // Test that LogMode values match expected numeric priorities
    // These control what messages are displayed
    expect(LogMode.DEBUG).toBe(0);
    expect(LogMode.INFO).toBe(1);
    expect(LogMode.WARN).toBe(2);
    expect(LogMode.ERROR).toBe(3);
    expect(LogMode.SILENT).toBe(4);
    expect(LogMode.OFF).toBe(5);
  });

  it('should maintain proper ordering for mode filtering', () => {
    // Test that LogMode ordering supports filtering logic
    expect(LogMode.DEBUG).toBeLessThan(LogMode.INFO);
    expect(LogMode.INFO).toBeLessThan(LogMode.WARN);
    expect(LogMode.WARN).toBeLessThan(LogMode.ERROR);
    expect(LogMode.ERROR).toBeLessThan(LogMode.SILENT);
    expect(LogMode.SILENT).toBeLessThan(LogMode.OFF);
  });
});

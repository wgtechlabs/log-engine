/**
 * LogEngine API tests for Phase 4 - comprehensive interface coverage
 * Tests all public API methods with TypeScript type safety
 */

import LogEngine from '../index';
import { LogMode, RedactionConfig } from '../types';

// Mock console methods
const mockConsoleLog = jest.fn();
const mockConsoleInfo = jest.fn();
const mockConsoleWarn = jest.fn();
const mockConsoleError = jest.fn();

describe('LogEngine API Interface (Phase 4)', () => {
  const originalConsole = console;
  const originalEnv = process.env;

  beforeEach(() => {
    // Mock console methods
    console.log = mockConsoleLog;
    console.info = mockConsoleInfo;
    console.warn = mockConsoleWarn;
    console.error = mockConsoleError;

    // Clear all mocks
    jest.clearAllMocks();

    // Reset environment
    process.env = { ...originalEnv };

    // Reset LogEngine to default state
    LogEngine.configure({ mode: LogMode.DEBUG });
    LogEngine.resetRedactionConfig();
  });

  afterAll(() => {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    process.env = originalEnv;
  });

  describe('Configuration API', () => {
    test('should configure logger mode', () => {
      LogEngine.configure({ mode: LogMode.ERROR });

      // Test that only error level shows
      LogEngine.info('info message');
      LogEngine.warn('warn message');
      LogEngine.error('error message');

      expect(mockConsoleInfo).not.toHaveBeenCalled();
      expect(mockConsoleWarn).not.toHaveBeenCalled();
      expect(mockConsoleError).toHaveBeenCalledTimes(1);
    });

    test('should configure environment', () => {
      LogEngine.configure({ environment: 'test', mode: LogMode.DEBUG });

      LogEngine.info('test message');

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('test message')
      );
    });
  });

  describe('Standard Logging Methods', () => {
    test('should log debug messages with redaction', () => {
      LogEngine.configure({ mode: LogMode.DEBUG });

      LogEngine.debug('Debug message', { password: 'secret123', username: 'user' });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Debug message')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[REDACTED]')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('user')
      );
    });

    test('should log info messages with redaction', () => {
      LogEngine.info('Info message', { email: 'user@example.com', id: 123 });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Info message')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[REDACTED]')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('123')
      );
    });

    test('should log warn messages with redaction', () => {
      LogEngine.warn('Warning message', { apiKey: 'sk-123', status: 'failed' });

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Warning message')
      );
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('[REDACTED]')
      );
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('failed')
      );
    });

    test('should log error messages with redaction', () => {
      LogEngine.error('Error message', { token: 'jwt-token', code: 500 });

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error message')
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('[REDACTED]')
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('500')
      );
    });

    test('should log general messages with redaction', () => {
      LogEngine.log('General message', { secret: 'hidden', visible: 'shown' });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('General message')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[REDACTED]')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('shown')
      );
    });
  });

  describe('Raw Logging Methods', () => {
    test('should log debug messages without redaction', () => {
      LogEngine.debugRaw('Debug raw', { password: 'secret123', username: 'user' });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Debug raw')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('secret123')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('user')
      );
    });

    test('should log info messages without redaction', () => {
      LogEngine.infoRaw('Info raw', { email: 'user@example.com', id: 123 });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Info raw')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('user@example.com')
      );
    });

    test('should log warn messages without redaction', () => {
      LogEngine.warnRaw('Warn raw', { apiKey: 'sk-123', status: 'failed' });

      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('Warn raw')
      );
      expect(mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('sk-123')
      );
    });

    test('should log error messages without redaction', () => {
      LogEngine.errorRaw('Error raw', { token: 'jwt-token', code: 500 });

      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('Error raw')
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('jwt-token')
      );
    });

    test('should log general messages without redaction', () => {
      LogEngine.logRaw('Log raw', { secret: 'hidden', visible: 'shown' });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('Log raw')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('hidden')
      );
    });
  });

  describe('Redaction Configuration API', () => {
    test('should configure redaction settings', () => {
      const customConfig: Partial<RedactionConfig> = {
        redactionText: '***HIDDEN***',
        sensitiveFields: ['customField']
      };

      LogEngine.configureRedaction(customConfig);

      const config = LogEngine.getRedactionConfig();
      expect(config.redactionText).toBe('***HIDDEN***');
      expect(config.sensitiveFields).toContain('customField');
    });

    test('should reset redaction configuration', () => {
      // Modify configuration
      LogEngine.configureRedaction({ redactionText: '***CUSTOM***' });
      expect(LogEngine.getRedactionConfig().redactionText).toBe('***CUSTOM***');

      // Reset configuration
      LogEngine.resetRedactionConfig();
      expect(LogEngine.getRedactionConfig().redactionText).toBe('[REDACTED]');
    });

    test('should refresh redaction configuration from environment', () => {
      process.env.LOG_REDACTION_TEXT = '***ENV***';
      process.env.LOG_SENSITIVE_FIELDS = 'envField1,envField2';

      LogEngine.refreshRedactionConfig();

      const config = LogEngine.getRedactionConfig();
      expect(config.redactionText).toBe('***ENV***');
      expect(config.sensitiveFields).toContain('envField1');
      expect(config.sensitiveFields).toContain('envField2');
    });

    test('should get current redaction configuration', () => {
      const config = LogEngine.getRedactionConfig();

      expect(config).toHaveProperty('enabled');
      expect(config).toHaveProperty('sensitiveFields');
      expect(config).toHaveProperty('redactionText');
      expect(config).toHaveProperty('deepRedaction');
      expect(typeof config.enabled).toBe('boolean');
      expect(Array.isArray(config.sensitiveFields)).toBe(true);
    });
  });

  describe('Advanced Redaction API', () => {
    test('should add custom redaction patterns', () => {
      const patterns = [/custom.*/i, /special.*/i];
      LogEngine.addCustomRedactionPatterns(patterns);

      expect(LogEngine.testFieldRedaction('customField')).toBe(true);
      expect(LogEngine.testFieldRedaction('specialData')).toBe(true);
      expect(LogEngine.testFieldRedaction('normalField')).toBe(false);
    });

    test('should clear custom redaction patterns', () => {
      LogEngine.addCustomRedactionPatterns([/test.*/i]);
      expect(LogEngine.testFieldRedaction('testField')).toBe(true);

      LogEngine.clearCustomRedactionPatterns();
      expect(LogEngine.testFieldRedaction('testField')).toBe(false);
    });

    test('should add sensitive fields', () => {
      LogEngine.addSensitiveFields(['companySecret', 'internalKey']);

      expect(LogEngine.testFieldRedaction('companySecret')).toBe(true);
      expect(LogEngine.testFieldRedaction('internalKey')).toBe(true);
    });

    test('should test field redaction accurately', () => {
      // Test default sensitive fields
      expect(LogEngine.testFieldRedaction('password')).toBe(true);
      expect(LogEngine.testFieldRedaction('email')).toBe(true);
      expect(LogEngine.testFieldRedaction('username')).toBe(false);
      expect(LogEngine.testFieldRedaction('id')).toBe(false);

      // Test custom fields
      LogEngine.addSensitiveFields(['myCustomField']);
      expect(LogEngine.testFieldRedaction('myCustomField')).toBe(true);
    });
  });

  describe('withoutRedaction() Method', () => {
    test('should return object with raw logging methods', () => {
      const rawLogger = LogEngine.withoutRedaction();

      expect(rawLogger).toHaveProperty('debug');
      expect(rawLogger).toHaveProperty('info');
      expect(rawLogger).toHaveProperty('warn');
      expect(rawLogger).toHaveProperty('error');
      expect(rawLogger).toHaveProperty('log');

      expect(typeof rawLogger.debug).toBe('function');
      expect(typeof rawLogger.info).toBe('function');
      expect(typeof rawLogger.warn).toBe('function');
      expect(typeof rawLogger.error).toBe('function');
      expect(typeof rawLogger.log).toBe('function');
    });

    test('should bypass redaction when using withoutRedaction', () => {
      const rawLogger = LogEngine.withoutRedaction();

      rawLogger.info('Raw info', { password: 'secret123', email: 'user@example.com' });

      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('secret123')
      );
      expect(mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('user@example.com')
      );
      expect(mockConsoleLog).not.toHaveBeenCalledWith(
        expect.stringContaining('[REDACTED]')
      );
    });

    test('should support all log levels without redaction', () => {
      const rawLogger = LogEngine.withoutRedaction();

      rawLogger.debug('Debug', { secret: 'debug-secret' });
      rawLogger.info('Info', { secret: 'info-secret' });
      rawLogger.warn('Warn', { secret: 'warn-secret' });
      rawLogger.error('Error', { secret: 'error-secret' });
      rawLogger.log('Log', { secret: 'log-secret' });

      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('debug-secret'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('info-secret'));
      expect(mockConsoleWarn).toHaveBeenCalledWith(expect.stringContaining('warn-secret'));
      expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('error-secret'));
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('log-secret'));
    });
  });

  describe('Integration Testing', () => {
    test('should maintain consistent behavior across configuration changes', () => {
      // Initial test
      LogEngine.info('Test 1', { password: 'secret1' });
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('[REDACTED]'));

      jest.clearAllMocks();

      // Change redaction text
      LogEngine.configureRedaction({ redactionText: '***HIDDEN***' });
      LogEngine.info('Test 2', { password: 'secret2' });
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('***HIDDEN***'));

      jest.clearAllMocks();

      // Add custom sensitive field and test with multiple sensitive fields
      LogEngine.addSensitiveFields(['customSensitive']);
      LogEngine.info('Test 3', { customSensitive: 'value', email: 'test@example.com' });

      // Should contain redaction text for both fields
      const calls = mockConsoleLog.mock.calls.flat();
      const logOutput = calls.join(' ');

      // Count occurrences of redaction text
      const redactionMatches = logOutput.match(/\*\*\*HIDDEN\*\*\*/g);
      expect(redactionMatches).toBeTruthy();
      expect(redactionMatches!.length).toBeGreaterThanOrEqual(2);
    });

    test('should handle complex configuration scenarios', () => {
      // First, reset to known state
      LogEngine.resetRedactionConfig();
      LogEngine.clearCustomRedactionPatterns();

      // Configure multiple aspects
      LogEngine.configureRedaction({
        redactionText: '###SECRET###',
        sensitiveFields: ['baseField'] // This will be merged with defaults
      });
      LogEngine.addCustomRedactionPatterns([/^custom.*/i]);
      LogEngine.addSensitiveFields(['additionalField']);

      const testData = {
        normalPassword: 'default-sensitive', // This will be redacted (password is default sensitive)
        baseField: 'base-sensitive',
        customField: 'pattern-sensitive',
        additionalField: 'added-sensitive',
        publicField: 'not-sensitive'
      };

      LogEngine.info('Complex test', testData);

      const logOutput = mockConsoleLog.mock.calls.flat().join(' ');
      expect(logOutput).toContain('###SECRET###');
      expect(logOutput).toContain('not-sensitive');

      // These should NOT appear because they should be redacted
      expect(logOutput).not.toContain('base-sensitive');
      expect(logOutput).not.toContain('pattern-sensitive');
      expect(logOutput).not.toContain('added-sensitive');

      // Note: normalPassword containing 'password' will be redacted by default rules
    });
  });
});

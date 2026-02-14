/**
 * Main LogEngine module - provides a comprehensive logging solution
 * with mode-based filtering, colorized output, and automatic data redaction
 *
 * Features a modular architecture with separate modules for:
 * - Logger: Core logging functionality with environment-based configuration
 * - Formatter: Message formatting with ANSI colors and timestamps
 * - Redaction: Automatic sensitive data protection with customizable patterns
 *
 * @example
 * ```typescript
 * import { LogEngine, LogMode } from '@wgtechlabs/log-engine';
 *
 * // Configure logging mode
 * LogEngine.configure({ mode: LogMode.DEBUG });
 *
 * // Log with automatic redaction
 * LogEngine.info('User login', { username: 'john', password: 'secret123' });
 * // Output: [2025-06-18T...][3:45PM][INFO]: User login { username: 'john', password: '[REDACTED]' }
 * ```
 */

import { Logger } from './logger';
import type { LoggerConfig, RedactionConfig, ILogEngineWithoutRedaction, LogData, LogCallOptions } from './types';
import { DataRedactor, defaultRedactionConfig } from './redaction';

// Create a singleton logger instance
const logger = new Logger();

/**
 * LogEngine - The main interface for logging operations
 * Provides a simple, intuitive API for all logging needs with security-first design
 */
export const LogEngine = {
  /**
     * Configure the logger with new settings
     * @param config - Configuration object containing logger settings
     * @example
     * ```typescript
     * LogEngine.configure({ mode: LogMode.PRODUCTION });
     * ```
     */
  configure: (config: Partial<LoggerConfig>): void => logger.configure(config),

  // Standard logging methods with automatic redaction
  /**
     * Log a debug message with automatic data redaction
     * Only shown in DEVELOPMENT mode
     * @param message - The debug message to log
     * @param data - Optional data object to log (sensitive data will be redacted)
     * @param options - Optional per-call options (e.g., emoji override)
     * @example
     * ```typescript
     * LogEngine.debug('Processing user data', { userId: 123, email: 'user@example.com' });
     * LogEngine.debug('Starting process', undefined, { emoji: '🔍' });
     * ```
     */
  debug: (message: string, data?: LogData, options?: LogCallOptions): void => logger.debug(message, data, options),

  /**
     * Log an info message with automatic data redaction
     * Shown in DEVELOPMENT and PRODUCTION modes
     * @param message - The info message to log
     * @param data - Optional data object to log (sensitive data will be redacted)
     * @param options - Optional per-call options (e.g., emoji override)
     * @example
     * ```typescript
     * LogEngine.info('User login successful', { username: 'john' });
     * LogEngine.info('Database initialized', undefined, { emoji: '✅' });
     * ```
     */
  info: (message: string, data?: LogData, options?: LogCallOptions): void => logger.info(message, data, options),

  /**
     * Log a warning message with automatic data redaction
     * Shown in DEVELOPMENT and PRODUCTION modes
     * @param message - The warning message to log
     * @param data - Optional data object to log (sensitive data will be redacted)
     * @param options - Optional per-call options (e.g., emoji override)
     * @example
     * ```typescript
     * LogEngine.warn('API rate limit approaching', { requestsRemaining: 10 });
     * LogEngine.warn('Low disk space', undefined, { emoji: '💾' });
     * ```
     */
  warn: (message: string, data?: LogData, options?: LogCallOptions): void => logger.warn(message, data, options),

  /**
     * Log an error message with automatic data redaction
     * Shown in DEVELOPMENT and PRODUCTION modes
     * @param message - The error message to log
     * @param data - Optional data object to log (sensitive data will be redacted)
     * @param options - Optional per-call options (e.g., emoji override)
     * @example
     * ```typescript
     * LogEngine.error('Database connection failed', { host: 'localhost', port: 5432 });
     * LogEngine.error('Critical failure', undefined, { emoji: '💥' });
     * ```
     */
  error: (message: string, data?: LogData, options?: LogCallOptions): void => logger.error(message, data, options),

  /**
     * Log a critical message with automatic data redaction
     * Always shown regardless of mode (except OFF)
     * @param message - The critical log message to log
     * @param data - Optional data object to log (sensitive data will be redacted)
     * @param options - Optional per-call options (e.g., emoji override)
     * @example
     * ```typescript
     * LogEngine.log('Application starting', { version: '1.0.0' });
     * LogEngine.log('System ready', undefined, { emoji: '🚀' });
     * ```
     */
  log: (message: string, data?: LogData, options?: LogCallOptions): void => logger.log(message, data, options),

  // Raw methods that bypass redaction (use with caution)
  /**
     * Log a debug message without redaction (use with caution)
     * Bypasses automatic data redaction for debugging purposes
     * @param message - The debug message to log
     * @param data - Optional data object to log (no redaction applied)
     * @param options - Optional per-call options (e.g., emoji override)
     */
  debugRaw: (message: string, data?: LogData, options?: LogCallOptions): void => logger.debugRaw(message, data, options),

  /**
     * Log an info message without redaction (use with caution)
     * Bypasses automatic data redaction for debugging purposes
     * @param message - The info message to log
     * @param data - Optional data object to log (no redaction applied)
     * @param options - Optional per-call options (e.g., emoji override)
     */
  infoRaw: (message: string, data?: LogData, options?: LogCallOptions): void => logger.infoRaw(message, data, options),

  /**
     * Log a warning message without redaction (use with caution)
     * Bypasses automatic data redaction for debugging purposes
     * @param message - The warning message to log
     * @param data - Optional data object to log (no redaction applied)
     * @param options - Optional per-call options (e.g., emoji override)
     */
  warnRaw: (message: string, data?: LogData, options?: LogCallOptions): void => logger.warnRaw(message, data, options),

  /**
     * Log an error message without redaction (use with caution)
     * Bypasses automatic data redaction for debugging purposes
     * @param message - The error message to log
     * @param data - Optional data object to log (no redaction applied)
     * @param options - Optional per-call options (e.g., emoji override)
     */
  errorRaw: (message: string, data?: LogData, options?: LogCallOptions): void => logger.errorRaw(message, data, options),

  /**
     * Log a critical message without redaction (use with caution)
     * Bypasses automatic data redaction for debugging purposes
     * @param message - The critical log message to log
     * @param data - Optional data object to log (no redaction applied)
     * @param options - Optional per-call options (e.g., emoji override)
     */
  logRaw: (message: string, data?: LogData, options?: LogCallOptions): void => logger.logRaw(message, data, options),

  // Redaction configuration methods
  /**
     * Configure data redaction settings
     * @param config - Partial redaction configuration to apply
     */
  configureRedaction: (config: Partial<RedactionConfig>): void => DataRedactor.updateConfig(config),

  /**
     * Refresh redaction configuration from environment variables
     * Useful for picking up runtime environment changes
     */
  refreshRedactionConfig: (): void => DataRedactor.refreshConfig(),

  /**
     * Reset redaction configuration to defaults
     */
  resetRedactionConfig: (): void => DataRedactor.updateConfig(defaultRedactionConfig),

  /**
     * Get current redaction configuration
     * @returns Current redaction configuration
     */
  getRedactionConfig: (): RedactionConfig => DataRedactor.getConfig(),

  // Advanced redaction methods
  /**
     * Add custom regex patterns for advanced field detection
     * @param patterns - Array of regex patterns to add
     */
  addCustomRedactionPatterns: (patterns: RegExp[]): void => DataRedactor.addCustomPatterns(patterns),

  /**
     * Clear all custom redaction patterns
     */
  clearCustomRedactionPatterns: (): void => DataRedactor.clearCustomPatterns(),

  /**
     * Add custom sensitive field names to the existing list
     * @param fields - Array of field names to add
     */
  addSensitiveFields: (fields: string[]): void => DataRedactor.addSensitiveFields(fields),

  /**
     * Test if a field name would be redacted with current configuration
     * @param fieldName - Field name to test
     * @returns true if field would be redacted, false otherwise
     */
  testFieldRedaction: (fieldName: string): boolean => DataRedactor.testFieldRedaction(fieldName),

  /**
     * Temporarily disable redaction for a specific logging call
     * @returns LogEngine instance with redaction bypassed
     * @example
     * ```typescript
     * LogEngine.withoutRedaction().info('Debug data', sensitiveObject);
     * LogEngine.withoutRedaction().info('Custom emoji', undefined, { emoji: '🔍' });
     * ```
     */
  withoutRedaction: (): ILogEngineWithoutRedaction => ({
    debug: (message: string, data?: LogData, options?: LogCallOptions): void => logger.debugRaw(message, data, options),
    info: (message: string, data?: LogData, options?: LogCallOptions): void => logger.infoRaw(message, data, options),
    warn: (message: string, data?: LogData, options?: LogCallOptions): void => logger.warnRaw(message, data, options),
    error: (message: string, data?: LogData, options?: LogCallOptions): void => logger.errorRaw(message, data, options),
    log: (message: string, data?: LogData, options?: LogCallOptions): void => logger.logRaw(message, data, options)
  })
};

// Re-export types and utilities for external use
export { LogMode, LogLevel } from './types';
export type {
  LoggerConfig,
  LogFormatConfig,
  RedactionConfig,
  LogOutputHandler,
  BuiltInOutputHandler,
  OutputTarget,
  LogCallOptions,
  // Advanced types
  FileOutputConfig,
  HttpOutputConfig,
  AdvancedOutputConfig,
  EnhancedOutputTarget,
  // Emoji types
  EmojiConfig,
  EmojiMapping
} from './types';
export { DataRedactor, defaultRedactionConfig, RedactionController } from './redaction';
export { EmojiSelector, EMOJI_MAPPINGS, FALLBACK_EMOJI } from './formatter';

// Default export for convenience
export default LogEngine;

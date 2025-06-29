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
import { LogMode } from './types';
import type { LoggerConfig, RedactionConfig } from './types';
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
  configure: (config: Partial<LoggerConfig>) => logger.configure(config),

  // Standard logging methods with automatic redaction
  /**
     * Log a debug message with automatic data redaction
     * Only shown in DEVELOPMENT mode
     * @param message - The debug message to log
     * @param data - Optional data object to log (sensitive data will be redacted)
     * @example
     * ```typescript
     * LogEngine.debug('Processing user data', { userId: 123, email: 'user@example.com' });
     * ```
     */
  debug: (message: string, data?: any) => logger.debug(message, data),

  /**
     * Log an info message with automatic data redaction
     * Shown in DEVELOPMENT and PRODUCTION modes
     * @param message - The info message to log
     * @param data - Optional data object to log (sensitive data will be redacted)
     * @example
     * ```typescript
     * LogEngine.info('User login successful', { username: 'john' });
     * ```
     */
  info: (message: string, data?: any) => logger.info(message, data),

  /**
     * Log a warning message with automatic data redaction
     * Shown in DEVELOPMENT and PRODUCTION modes
     * @param message - The warning message to log
     * @param data - Optional data object to log (sensitive data will be redacted)
     * @example
     * ```typescript
     * LogEngine.warn('API rate limit approaching', { requestsRemaining: 10 });
     * ```
     */
  warn: (message: string, data?: any) => logger.warn(message, data),

  /**
     * Log an error message with automatic data redaction
     * Shown in DEVELOPMENT and PRODUCTION modes
     * @param message - The error message to log
     * @param data - Optional data object to log (sensitive data will be redacted)
     * @example
     * ```typescript
     * LogEngine.error('Database connection failed', { host: 'localhost', port: 5432 });
     * ```
     */
  error: (message: string, data?: any) => logger.error(message, data),

  /**
     * Log a critical message with automatic data redaction
     * Always shown regardless of mode (except OFF)
     * @param message - The critical log message to log
     * @param data - Optional data object to log (sensitive data will be redacted)
     * @example
     * ```typescript
     * LogEngine.log('Application starting', { version: '1.0.0' });
     * ```
     */
  log: (message: string, data?: any) => logger.log(message, data),

  // Raw methods that bypass redaction (use with caution)
  /**
     * Log a debug message without redaction (use with caution)
     * Bypasses automatic data redaction for debugging purposes
     * @param message - The debug message to log
     * @param data - Optional data object to log (no redaction applied)
     */
  debugRaw: (message: string, data?: any) => logger.debugRaw(message, data),

  /**
     * Log an info message without redaction (use with caution)
     * Bypasses automatic data redaction for debugging purposes
     * @param message - The info message to log
     * @param data - Optional data object to log (no redaction applied)
     */
  infoRaw: (message: string, data?: any) => logger.infoRaw(message, data),

  /**
     * Log a warning message without redaction (use with caution)
     * Bypasses automatic data redaction for debugging purposes
     * @param message - The warning message to log
     * @param data - Optional data object to log (no redaction applied)
     */
  warnRaw: (message: string, data?: any) => logger.warnRaw(message, data),

  /**
     * Log an error message without redaction (use with caution)
     * Bypasses automatic data redaction for debugging purposes
     * @param message - The error message to log
     * @param data - Optional data object to log (no redaction applied)
     */
  errorRaw: (message: string, data?: any) => logger.errorRaw(message, data),

  /**
     * Log a critical message without redaction (use with caution)
     * Bypasses automatic data redaction for debugging purposes
     * @param message - The critical log message to log
     * @param data - Optional data object to log (no redaction applied)
     */
  logRaw: (message: string, data?: any) => logger.logRaw(message, data),

  // Redaction configuration methods
  /**
     * Configure data redaction settings
     * @param config - Partial redaction configuration to apply
     */
  configureRedaction: (config: Partial<RedactionConfig>) => DataRedactor.updateConfig(config),

  /**
     * Refresh redaction configuration from environment variables
     * Useful for picking up runtime environment changes
     */
  refreshRedactionConfig: () => DataRedactor.refreshConfig(),

  /**
     * Reset redaction configuration to defaults
     */
  resetRedactionConfig: () => DataRedactor.updateConfig(defaultRedactionConfig),

  /**
     * Get current redaction configuration
     * @returns Current redaction configuration
     */
  getRedactionConfig: () => DataRedactor.getConfig(),

  // Advanced redaction methods (Phase 3)
  /**
     * Add custom regex patterns for advanced field detection
     * @param patterns - Array of regex patterns to add
     */
  addCustomRedactionPatterns: (patterns: RegExp[]) => DataRedactor.addCustomPatterns(patterns),

  /**
     * Clear all custom redaction patterns
     */
  clearCustomRedactionPatterns: () => DataRedactor.clearCustomPatterns(),

  /**
     * Add custom sensitive field names to the existing list
     * @param fields - Array of field names to add
     */
  addSensitiveFields: (fields: string[]) => DataRedactor.addSensitiveFields(fields),

  /**
     * Test if a field name would be redacted with current configuration
     * @param fieldName - Field name to test
     * @returns true if field would be redacted, false otherwise
     */
  testFieldRedaction: (fieldName: string) => DataRedactor.testFieldRedaction(fieldName),

  /**
     * Temporarily disable redaction for a specific logging call
     * @returns LogEngine instance with redaction bypassed
     * @example
     * ```typescript
     * LogEngine.withoutRedaction().info('Debug data', sensitiveObject);
     * ```
     */
  withoutRedaction: () => ({
    debug: (message: string, data?: any) => logger.debugRaw(message, data),
    info: (message: string, data?: any) => logger.infoRaw(message, data),
    warn: (message: string, data?: any) => logger.warnRaw(message, data),
    error: (message: string, data?: any) => logger.errorRaw(message, data),
    log: (message: string, data?: any) => logger.logRaw(message, data)
  })
};

// Re-export types and utilities for external use
export { LogMode, LogLevel } from './types';
export type {
  LoggerConfig,
  RedactionConfig,
  LogOutputHandler,
  BuiltInOutputHandler,
  OutputTarget,
  // Phase 3 types
  FileOutputConfig,
  HttpOutputConfig,
  AdvancedOutputConfig,
  EnhancedOutputTarget
} from './types';
export { DataRedactor, defaultRedactionConfig, RedactionController } from './redaction';

// Default export for convenience
export default LogEngine;

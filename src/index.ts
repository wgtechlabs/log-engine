/**
 * Main entry point for the Log Engine library
 * Provides a simple, configurable logging interface with environment-based auto-configuration
 */

import { Logger as LoggerClass } from './logger';
import { LogLevel, LoggerConfig } from './types';

// Create singleton logger instance
const logger = new LoggerClass();

/**
 * Determines the appropriate default log level based on NODE_ENV
 * - production: WARN (reduce noise in production)
 * - development: DEBUG (verbose logging for development)
 * - test: ERROR (minimal logging during tests)
 * - default: INFO (balanced logging for other environments)
 * @returns The appropriate LogLevel for the current environment
 */
const getDefaultLogLevel = (): LogLevel => {
    const nodeEnv = process.env.NODE_ENV;
    switch (nodeEnv) {
        case 'production':
            return LogLevel.WARN;
        case 'development':
            return LogLevel.DEBUG;
        case 'test':
            return LogLevel.ERROR;
        default:
            return LogLevel.INFO;
    }
};

// Initialize logger with environment-appropriate default level
logger.configure({ level: getDefaultLogLevel() });

/**
 * Main LogEngine API - provides all logging functionality with a clean interface
 * Auto-configured based on NODE_ENV, but can be reconfigured at runtime
 */
export const LogEngine = {
    /**
     * Configure the logger with custom settings
     * @param config - Partial configuration object containing level and/or environment
     * @example
     * ```typescript
     * LogEngine.configure({ level: LogLevel.DEBUG });
     * LogEngine.configure({ level: LogLevel.WARN, environment: 'staging' });
     * ```
     */
    configure: (config: Partial<LoggerConfig>) => logger.configure(config),

    /**
     * Log a debug message (lowest priority)
     * Only shown when log level is DEBUG or lower
     * Useful for detailed diagnostic information during development
     * @param message - The debug message to log
     * @example
     * ```typescript
     * LogEngine.debug('User authentication flow started');
     * LogEngine.debug(`Processing ${items.length} items`);
     * ```
     */
    debug: (message: string) => logger.debug(message),

    /**
     * Log an informational message
     * General information about application flow and state
     * Shown when log level is INFO or lower
     * @param message - The info message to log
     * @example
     * ```typescript
     * LogEngine.info('Application started successfully');
     * LogEngine.info('User logged in: john@example.com');
     * ```
     */
    info: (message: string) => logger.info(message),

    /**
     * Log a warning message
     * Indicates potential issues that don't prevent operation
     * Shown when log level is WARN or lower
     * @param message - The warning message to log
     * @example
     * ```typescript
     * LogEngine.warn('API rate limit approaching');
     * LogEngine.warn('Deprecated function called');
     * ```
     */
    warn: (message: string) => logger.warn(message),

    /**
     * Log an error message (highest priority)
     * Indicates serious problems that need attention
     * Always shown unless log level is SILENT
     * @param message - The error message to log
     * @example
     * ```typescript
     * LogEngine.error('Database connection failed');
     * LogEngine.error('Authentication token expired');
     * ```
     */
    error: (message: string) => logger.error(message)
};

export { LogLevel, LoggerConfig } from './types';
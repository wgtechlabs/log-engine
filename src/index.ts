/**
 * Main entry point for the Log Engine library
 * Provides a simple, configurable logging interface with environment-based auto-configuration
 */

import { Logger as LoggerClass } from './logger';
import { LogMode, LoggerConfig } from './types';

// Create singleton logger instance
const logger = new LoggerClass();

/**
 * Determines the appropriate default log mode based on NODE_ENV
 * - development: DEBUG (most verbose - shows all messages)
 * - production: INFO (balanced - shows info, warn, error, log)
 * - staging: WARN (focused - shows warn, error, log only)
 * - test: ERROR (minimal - shows error and log only)
 * - default: INFO (balanced logging for other environments)
 * @returns The appropriate LogMode for the current environment
 */
const getDefaultLogMode = (): LogMode => {
    const nodeEnv = process.env.NODE_ENV;
    switch (nodeEnv) {
        case 'development':
            return LogMode.DEBUG;
        case 'production':
            return LogMode.INFO;
        case 'staging':
            return LogMode.WARN;
        case 'test':
            return LogMode.ERROR;
        default:
            return LogMode.INFO;
    }
};

// Initialize logger with environment-appropriate default mode
logger.configure({ mode: getDefaultLogMode() });

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
    error: (message: string) => logger.error(message),

    /**
     * Log a critical message that always outputs
     * Essential messages that should always be visible regardless of log mode
     * Always shown no matter what log mode is configured (except OFF mode)
     * @param message - The critical log message to log
     * @example
     * ```typescript
     * LogEngine.log('Application starting up');
     * LogEngine.log('Server listening on port 3000');
     * LogEngine.log('Graceful shutdown initiated');
     * ```
     */
    log: (message: string) => logger.log(message)
};

export { LogLevel, LogMode, LoggerConfig } from './types';
/**
 * Type definitions for the Log Engine library
 * Provides strongly-typed interfaces for configuration and log levels
 */

/**
 * Log levels representing message severity (lowest to highest)
 * Used for filtering messages based on importance
 */
export enum LogLevel {
    /** Detailed diagnostic information, typically only of interest during development */
    DEBUG = 0,
    /** General information about application flow and state */
    INFO = 1,
    /** Potentially harmful situations that don't prevent operation */
    WARN = 2,
    /** Error events that might still allow the application to continue */
    ERROR = 3,
    /** Critical messages that always output regardless of configured mode (except when OFF is set) */
    LOG = 99
}

/**
 * Log modes controlling output behavior and filtering
 * Determines what messages are displayed based on verbosity requirements
 */
export enum LogMode {
    /** Most verbose - shows DEBUG, INFO, WARN, ERROR, LOG messages */
    DEBUG = 0,
    /** Balanced - shows INFO, WARN, ERROR, LOG messages */
    INFO = 1,
    /** Focused - shows WARN, ERROR, LOG messages */
    WARN = 2,
    /** Minimal - shows ERROR, LOG messages */
    ERROR = 3,
    /** Critical only - shows LOG messages only */
    SILENT = 4,
    /** Complete silence - shows no messages at all */
    OFF = 5
}

/**
 * Represents a single log entry with timestamp, level, and message
 * Used internally for structured logging operations
 */
export interface LogEntry {
    /** When the log entry was created */
    timestamp: Date;
    /** The severity level of this log entry */
    level: LogLevel;
    /** The actual log message content */
    message: string;
}

/**
 * Configuration options for the logger
 * Supports both legacy level-based and new mode-based configuration
 */
export interface LoggerConfig {
    /** Log mode controlling output behavior (new API) */
    mode?: LogMode;
    /** Legacy: Minimum log level to display (backwards compatibility)
     * Note: If both mode and level are provided, mode takes precedence */
    level?: LogLevel;
    /** Optional environment identifier for context (e.g., 'production', 'staging') */
    environment?: string;
}

/**
 * Configuration options for automatic data redaction
 * Controls how sensitive information is processed in log messages
 */
export interface RedactionConfig {
    /** Whether redaction is enabled globally */
    enabled: boolean;
    /** List of field names that should be redacted (case-insensitive partial matching) */
    sensitiveFields: string[];
    /** List of field names that should be truncated if they exceed maxContentLength */
    contentFields: string[];
    /** Maximum length for content fields before truncation occurs */
    maxContentLength: number;
    /** Text to replace sensitive field values with */
    redactionText: string;
    /** Text to append when content is truncated */
    truncationText: string;
    /** Whether to recursively scan nested objects and arrays */
    deepRedaction: boolean;
    /** Optional custom regex patterns for advanced field detection */
    customPatterns?: RegExp[];
}
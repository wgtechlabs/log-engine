/**
 * Type definitions for the Log Engine library
 * Provides strongly-typed interfaces for configuration and log levels
 */

/**
 * Log levels in order of priority (lowest to highest)
 * Higher numeric values represent higher priority levels
 * When a level is set, only messages at that level or higher are shown
 * LOG level is special - it always outputs regardless of configured level
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
    /** Completely disable all logging output */
    SILENT = 4,
    /** Critical messages that always output regardless of configured level */
    LOG = 99
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
 * All properties are optional to allow partial updates
 */
export interface LoggerConfig {
    /** Minimum log level to display (filters out lower priority messages) */
    level: LogLevel;
    /** Optional environment identifier for context (e.g., 'production', 'staging') */
    environment?: string;
}
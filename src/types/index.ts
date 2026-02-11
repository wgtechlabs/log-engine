/**
 * Type definitions for the Log Engine library
 * Provides strongly-typed interfaces for configuration and log levels
 */

/**
 * Type for log data - accepts any value since logs can contain literally anything
 * This is intentionally `any` rather than `unknown` for maximum usability in a logging context
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LogData = any;

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
 * Output handler function type for custom log output
 * Receives the log level, formatted message, and optional data
 */
export type LogOutputHandler = (level: string, message: string, data?: LogData) => void;

/**
 * Built-in output handler types
 */
export type BuiltInOutputHandler = 'console' | 'silent' | 'file' | 'http';

/**
 * Configuration for file output handler
 */
export interface FileOutputConfig {
    /** File path to write logs to */
    filePath: string;
    /** Whether to append to existing file (default: true) */
    append?: boolean;
    /** Maximum file size before rotation in bytes (optional) */
    maxFileSize?: number;
    /** Number of backup files to keep during rotation (default: 3) */
    maxBackupFiles?: number;
    /** Custom format function for file output */
    formatter?: (level: string, message: string, data?: LogData) => string;
}

/**
 * Configuration for HTTP output handler
 */
export interface HttpOutputConfig {
    /** HTTP endpoint URL to send logs to */
    url: string;
    /** HTTP method (default: 'POST') */
    method?: 'POST' | 'PUT' | 'PATCH';
    /** Custom headers to include with requests */
    headers?: Record<string, string>;
    /** Batch size for sending multiple logs (default: 1) */
    batchSize?: number;
    /** Timeout for HTTP requests in ms (default: 5000) */
    timeout?: number;
    /** Custom format function for HTTP payload */
    formatter?: (logs: Array<{ level: string; message: string; data?: LogData; timestamp: string }>) => LogData;
}

/**
 * Configuration object for advanced built-in handlers
 */
export interface AdvancedOutputConfig {
    file?: FileOutputConfig;
    http?: HttpOutputConfig;
}

/**
 * Enhanced output target - can be built-in handler, custom function, or configured handler object
 */
export type EnhancedOutputTarget = BuiltInOutputHandler | LogOutputHandler | {
    type: 'file';
    config: FileOutputConfig;
} | {
    type: 'http';
    config: HttpOutputConfig;
};

/**
 * Output target - can be a built-in handler string or custom function
 */
export type OutputTarget = BuiltInOutputHandler | LogOutputHandler;

/**
 * Configuration for log message formatting
 * Controls which elements are included in the log output
 */
export interface LogFormatConfig {
    /** Whether to include ISO timestamp (e.g., [2025-05-29T16:57:45.678Z]) */
    includeIsoTimestamp?: boolean;
    /** Whether to include local time (e.g., [4:57PM]) */
    includeLocalTime?: boolean;
    /** Configuration for emoji support in log output */
    emoji?: EmojiConfig;
}

/**
 * Emoji mapping definition for context-aware logging
 */
export interface EmojiMapping {
    /** The emoji character to display */
    emoji: string;
    /** The emoji code (e.g., :bug:) */
    code: string;
    /** Description of when to use this emoji */
    description?: string;
    /** Keywords that trigger this emoji selection */
    keywords: string[];
}

/**
 * Configuration for emoji display in logs
 */
export interface EmojiConfig {
    /** Whether emoji feature is enabled */
    enabled?: boolean;
    /** Custom emoji mappings to use instead of or in addition to defaults */
    customMappings?: EmojiMapping[];
    /** Custom fallback emoji for each level (DEBUG, INFO, WARN, ERROR, LOG) */
    customFallbacks?: Partial<Record<'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'LOG', string>>;
    /** Whether to use custom mappings exclusively (ignore defaults) */
    useCustomOnly?: boolean;
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
    /** Custom output handler function to replace console output (backward compatibility) */
    outputHandler?: LogOutputHandler;
    /** Array of output targets for multiple simultaneous outputs */
    outputs?: OutputTarget[];
    /** Enhanced outputs with advanced configuration support */
    enhancedOutputs?: EnhancedOutputTarget[];
    /** Whether to suppress default console output (useful with custom outputHandler) */
    suppressConsoleOutput?: boolean;
    /** Advanced configuration for built-in handlers */
    advancedOutputConfig?: AdvancedOutputConfig;
    /** Format configuration for customizing log element inclusion */
    format?: LogFormatConfig;
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

/**
 * Interface for the LogEngine singleton object
 * Provides all logging methods with comprehensive TypeScript support
 */
export interface ILogEngine {
    // Configuration methods
    /** Configure the logger with new settings */
    configure(config: Partial<LoggerConfig>): void;

    // Standard logging methods with automatic redaction
    /** Log a debug message with automatic data redaction */
    debug(message: string, data?: LogData): void;
    /** Log an info message with automatic data redaction */
    info(message: string, data?: LogData): void;
    /** Log a warn message with automatic data redaction */
    warn(message: string, data?: LogData): void;
    /** Log an error message with automatic data redaction */
    error(message: string, data?: LogData): void;
    /** Log a message with automatic data redaction */
    log(message: string, data?: LogData): void;

    // Raw logging methods (bypass redaction)
    /** Log a debug message without redaction */
    debugRaw(message: string, data?: LogData): void;
    /** Log an info message without redaction */
    infoRaw(message: string, data?: LogData): void;
    /** Log a warn message without redaction */
    warnRaw(message: string, data?: LogData): void;
    /** Log an error message without redaction */
    errorRaw(message: string, data?: LogData): void;
    /** Log a message without redaction */
    logRaw(message: string, data?: LogData): void;

    // Redaction configuration methods
    /** Configure redaction settings */
    configureRedaction(config: Partial<RedactionConfig>): void;
    /** Reset redaction configuration to defaults */
    resetRedactionConfig(): void;
    /** Refresh redaction configuration from environment variables */
    refreshRedactionConfig(): void;
    /** Get current redaction configuration */
    getRedactionConfig(): RedactionConfig;

    // Advanced redaction methods
    /** Add custom regex patterns for advanced field detection */
    addCustomRedactionPatterns(patterns: RegExp[]): void;
    /** Clear all custom redaction patterns */
    clearCustomRedactionPatterns(): void;
    /** Add custom sensitive field names to the existing list */
    addSensitiveFields(fields: string[]): void;
    /** Test if a field name would be redacted with current configuration */
    testFieldRedaction(fieldName: string): boolean;

    // Utility methods
    /** Temporarily disable redaction for a specific logging call */
    withoutRedaction(): ILogEngineWithoutRedaction;
}

/**
 * Interface for LogEngine methods without redaction
 * Returned by withoutRedaction() method
 */
export interface ILogEngineWithoutRedaction {
    /** Log a debug message without redaction */
    debug(message: string, data?: LogData): void;
    /** Log an info message without redaction */
    info(message: string, data?: LogData): void;
    /** Log a warn message without redaction */
    warn(message: string, data?: LogData): void;
    /** Log an error message without redaction */
    error(message: string, data?: LogData): void;
    /** Log a message without redaction */
    log(message: string, data?: LogData): void;
}

/**
 * Interface for the DataRedactor static class methods
 * Provides type safety for all redaction operations
 */
export interface IDataRedactor {
    /** Update redaction configuration */
    updateConfig(newConfig: Partial<RedactionConfig>): void;
    /** Get current redaction configuration */
    getConfig(): RedactionConfig;
    /** Refresh configuration from environment variables */
    refreshConfig(): void;
    /** Add custom regex patterns for field detection */
    addCustomPatterns(patterns: RegExp[]): void;
    /** Clear all custom regex patterns */
    clearCustomPatterns(): void;
    /** Add sensitive field names to the existing list */
    addSensitiveFields(fields: string[]): void;
    /** Test if a field name would be redacted */
    testFieldRedaction(fieldName: string): boolean;
    /** Redact sensitive data from any value */
    redactData(data: LogData): LogData;
}

/**
 * Interface for the RedactionController methods
 * Provides environment-based configuration management
 */
export interface IRedactionController {
    /** Load configuration from environment variables */
    loadFromEnvironment(): RedactionConfig;
    /** Reset configuration to default values */
    resetToDefaults(): RedactionConfig;
    /** Get currently active configuration */
    getCurrentConfig(): RedactionConfig;
}

/**
 * Options for configuring redaction behavior
 * Used for advanced redaction scenarios
 */
export interface RedactionOptions {
    /** Whether to enable deep scanning of nested objects */
    deep?: boolean;
    /** Custom patterns to use for this operation */
    customPatterns?: RegExp[];
    /** Additional sensitive fields for this operation */
    additionalSensitiveFields?: string[];
    /** Override default redaction text */
    redactionText?: string;
}

/**
 * Result type for field redaction testing
 * Provides detailed information about redaction decisions
 */
export interface FieldRedactionResult {
    /** Whether the field would be redacted */
    wouldRedact: boolean;
    /** Reason for the redaction decision */
    reason: 'sensitive_field' | 'custom_pattern' | 'not_sensitive';
    /** Pattern that matched (if applicable) */
    matchedPattern?: RegExp;
}

/**
 * Environment variable configuration mapping
 * Documents all supported environment variables
 */
export interface EnvironmentConfig {
    /** LOG_REDACTION_DISABLED - Disable all redaction */
    LOG_REDACTION_DISABLED?: string;
    /** LOG_REDACTION_TEXT - Custom redaction text */
    LOG_REDACTION_TEXT?: string;
    /** LOG_REDACTION_SENSITIVE_FIELDS - Comma-separated sensitive field names */
    LOG_REDACTION_SENSITIVE_FIELDS?: string;
    /** LOG_REDACTION_CONTENT_FIELDS - Comma-separated content field names */
    LOG_REDACTION_CONTENT_FIELDS?: string;
    /** LOG_REDACTION_MAX_CONTENT_LENGTH - Maximum length for content fields */
    LOG_REDACTION_MAX_CONTENT_LENGTH?: string;
    /** LOG_REDACTION_TRUNCATION_TEXT - Text for truncated content */
    LOG_REDACTION_TRUNCATION_TEXT?: string;
    /** LOG_REDACTION_DEEP - Enable deep redaction */
    LOG_REDACTION_DEEP?: string;
}

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
    debug(message: string, data?: any): void;
    /** Log an info message with automatic data redaction */
    info(message: string, data?: any): void;
    /** Log a warn message with automatic data redaction */
    warn(message: string, data?: any): void;
    /** Log an error message with automatic data redaction */
    error(message: string, data?: any): void;
    /** Log a message with automatic data redaction */
    log(message: string, data?: any): void;
    
    // Raw logging methods (bypass redaction)
    /** Log a debug message without redaction */
    debugRaw(message: string, data?: any): void;
    /** Log an info message without redaction */
    infoRaw(message: string, data?: any): void;
    /** Log a warn message without redaction */
    warnRaw(message: string, data?: any): void;
    /** Log an error message without redaction */
    errorRaw(message: string, data?: any): void;
    /** Log a message without redaction */
    logRaw(message: string, data?: any): void;
    
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
    debug(message: string, data?: any): void;
    /** Log an info message without redaction */
    info(message: string, data?: any): void;
    /** Log a warn message without redaction */
    warn(message: string, data?: any): void;
    /** Log an error message without redaction */
    error(message: string, data?: any): void;
    /** Log a message without redaction */
    log(message: string, data?: any): void;
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
    redactData(data: any): any;
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
/**
 * Core Logger class that handles log message output with configurable levels
 * Supports DEBUG, INFO, WARN, ERROR, and LOG levels with intelligent filtering
 * LOG level always outputs regardless of configuration
 * Uses colorized console output with timestamps for better readability
 * Includes automatic data redaction for sensitive information
 */

import { LogLevel, LogMode, LoggerConfig } from '../types';
import { LogFormatter } from '../formatter';
import { DataRedactor, RedactionController, defaultRedactionConfig } from '../redaction';
import { LoggerConfigManager } from './config';
import { LogFilter } from './filtering';

/**
 * Logger class responsible for managing log output and configuration
 * Provides mode-based filtering and formatted console output
 */
export class Logger {
    private configManager: LoggerConfigManager;

    /**
     * Logger constructor - sets up environment-based auto-configuration
     */
    constructor() {
        this.configManager = new LoggerConfigManager();
    }

    /**
     * Updates logger configuration with new settings
     * Also updates redaction configuration based on environment
     * @param config - Partial configuration object to apply
     */
    configure(config: Partial<LoggerConfig>): void {
        this.configManager.updateConfig(config);
        
        // Update redaction configuration based on current environment
        DataRedactor.updateConfig({
            ...defaultRedactionConfig,
            ...RedactionController.getEnvironmentConfig()
        });
    }

    /**
     * Get current logger configuration
     * @returns Current logger configuration
     */
    getConfig(): LoggerConfig {
        return this.configManager.getConfig();
    }

    /**
     * Determines if a message should be logged based on current log mode
     * @param level - The log level of the message to check
     * @returns true if message should be logged, false otherwise
     */
    private shouldLog(level: LogLevel): boolean {
        const currentConfig = this.configManager.getConfig();
        const currentMode = currentConfig.mode !== undefined ? currentConfig.mode : LogMode.INFO;
        return LogFilter.shouldLog(level, currentMode);
    }

    /**
     * Log a debug message with DEBUG level formatting
     * Uses console.log for output with purple/magenta coloring
     * Automatically redacts sensitive data when provided
     * @param message - The debug message to log
     * @param data - Optional data object to log (will be redacted)
     */
    debug(message: string, data?: any): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            const processedData = DataRedactor.redactData(data);
            const formatted = LogFormatter.format(LogLevel.DEBUG, message, processedData);
            console.log(formatted);
        }
    }

    /**
     * Log an informational message with INFO level formatting
     * Uses console.log for output with blue coloring
     * Automatically redacts sensitive data when provided
     * @param message - The info message to log
     * @param data - Optional data object to log (will be redacted)
     */
    info(message: string, data?: any): void {
        if (this.shouldLog(LogLevel.INFO)) {
            const processedData = DataRedactor.redactData(data);
            const formatted = LogFormatter.format(LogLevel.INFO, message, processedData);
            console.log(formatted);
        }
    }

    /**
     * Log a warning message with WARN level formatting
     * Uses console.warn for output with yellow coloring
     * Automatically redacts sensitive data when provided
     * @param message - The warning message to log
     * @param data - Optional data object to log (will be redacted)
     */
    warn(message: string, data?: any): void {
        if (this.shouldLog(LogLevel.WARN)) {
            const processedData = DataRedactor.redactData(data);
            const formatted = LogFormatter.format(LogLevel.WARN, message, processedData);
            console.warn(formatted);
        }
    }

    /**
     * Log an error message with ERROR level formatting
     * Uses console.error for output with red coloring
     * Automatically redacts sensitive data when provided
     * @param message - The error message to log
     * @param data - Optional data object to log (will be redacted)
     */
    error(message: string, data?: any): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            const processedData = DataRedactor.redactData(data);
            const formatted = LogFormatter.format(LogLevel.ERROR, message, processedData);
            console.error(formatted);
        }
    }

    /**
     * Log a message with LOG level formatting (always outputs unless mode is OFF)
     * Uses console.log for output with green coloring
     * LOG level bypasses normal filtering and always outputs (except when OFF is set)
     * Automatically redacts sensitive data when provided
     * @param message - The log message to output
     * @param data - Optional data object to log (will be redacted)
     */
    log(message: string, data?: any): void {
        if (this.shouldLog(LogLevel.LOG)) {
            const processedData = DataRedactor.redactData(data);
            const formatted = LogFormatter.format(LogLevel.LOG, message, processedData);
            console.log(formatted);
        }
    }

    // Raw logging methods (bypass redaction for debugging)
    /**
     * Log a debug message without data redaction
     * @param message - The debug message to log
     * @param data - Optional data object to log (no redaction applied)
     */
    debugRaw(message: string, data?: any): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            const formatted = LogFormatter.format(LogLevel.DEBUG, message, data);
            console.log(formatted);
        }
    }

    /**
     * Log an info message without data redaction
     * @param message - The info message to log
     * @param data - Optional data object to log (no redaction applied)
     */
    infoRaw(message: string, data?: any): void {
        if (this.shouldLog(LogLevel.INFO)) {
            const formatted = LogFormatter.format(LogLevel.INFO, message, data);
            console.log(formatted);
        }
    }

    /**
     * Log a warning message without data redaction
     * @param message - The warning message to log
     * @param data - Optional data object to log (no redaction applied)
     */
    warnRaw(message: string, data?: any): void {
        if (this.shouldLog(LogLevel.WARN)) {
            const formatted = LogFormatter.format(LogLevel.WARN, message, data);
            console.warn(formatted);
        }
    }

    /**
     * Log an error message without data redaction
     * @param message - The error message to log
     * @param data - Optional data object to log (no redaction applied)
     */
    errorRaw(message: string, data?: any): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            const formatted = LogFormatter.format(LogLevel.ERROR, message, data);
            console.error(formatted);
        }
    }

    /**
     * Log a message without data redaction (always outputs unless mode is OFF)
     * @param message - The log message to output
     * @param data - Optional data object to log (no redaction applied)
     */
    logRaw(message: string, data?: any): void {
        if (this.shouldLog(LogLevel.LOG)) {
            const formatted = LogFormatter.format(LogLevel.LOG, message, data);
            console.log(formatted);
        }
    }
}

/**
 * Core Logger class that handles log message output with configurable levels
 * Supports DEBUG, INFO, WARN, ERROR, and LOG levels with intelligent filtering
 * LOG level always outputs regardless of configuration
 * Uses colorized console output with timestamps for better readability
 * Includes automatic data redaction for sensitive information
 */

import { LogLevel, LogMode, LoggerConfig } from './types';
import { LogFormatter } from './formatter';
import { DataRedactor, RedactionController, defaultRedactionConfig } from './redaction';

/**
 * Logger class responsible for managing log output and configuration
 * Provides mode-based filtering and formatted console output
 */
export class Logger {
    // Internal configuration state with sensible defaults
    private config: LoggerConfig = {
        mode: LogMode.INFO
    };

    /**
     * Updates logger configuration with new settings
     * Merges provided config with existing settings (partial update)
     * Supports backwards compatibility by mapping level to mode with deprecation warnings
     * Also updates redaction configuration based on environment
     * @param config - Partial configuration object to apply
     */
    configure(config: Partial<LoggerConfig>): void {
        // Handle backwards compatibility - if level is provided but mode is not
        if (config.level !== undefined && config.mode === undefined) {
            // Only show deprecation warning in non-test environments
            if (process.env.NODE_ENV !== 'test') {
                console.warn(LogFormatter.formatSystemMessage('⚠️  DEPRECATION WARNING: The "level" configuration is deprecated and will be removed in v2.0.0. Please use "mode" instead.'));
                console.warn(LogFormatter.formatSystemMessage('   Migration: LogEngine.configure({ level: LogLevel.DEBUG }) → LogEngine.configure({ mode: LogMode.DEBUG })'));
                console.warn(LogFormatter.formatSystemMessage('   See: https://github.com/wgtechlabs/log-engine#migration-guide-loglevel--logmode'));
            }
            
            // Map legacy level values to new LogMode values (including SILENT=4, OFF=5)
            // This provides backwards compatibility for all legacy values
            const levelValue = config.level as number;
            const levelToModeMap: Record<number, LogMode> = {
                [LogLevel.DEBUG]: LogMode.DEBUG,      // 0 -> 0
                [LogLevel.INFO]: LogMode.INFO,        // 1 -> 1
                [LogLevel.WARN]: LogMode.WARN,        // 2 -> 2
                [LogLevel.ERROR]: LogMode.ERROR,      // 3 -> 3
                [LogLevel.LOG]: LogMode.SILENT,       // 99 -> 4 (preserves critical-only behavior)
                4: LogMode.SILENT,                    // Legacy SILENT -> 4
                5: LogMode.OFF                        // Legacy OFF -> 5
            };
            
            const mappedMode = levelToModeMap[levelValue];
            if (mappedMode === undefined) {
                throw new Error(`Invalid LogLevel value: ${config.level}. Valid values are: DEBUG(0), INFO(1), WARN(2), ERROR(3), LOG(99), or use LogMode instead.`);
            }
            
            this.config = { ...this.config, mode: mappedMode };
        } else {
            // Normal configuration update
            this.config = { ...this.config, ...config };
        }

        // Update redaction configuration based on current environment
        DataRedactor.updateConfig({
            ...defaultRedactionConfig,
            ...RedactionController.getEnvironmentConfig()
        });
    }

    /**
     * Maps LogLevel values to severity ranks for consistent comparison
     * This prevents issues if enum numeric values change in the future
     */
    private static readonly SEVERITY_RANKS: Record<LogLevel, number> = {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 1,
        [LogLevel.WARN]: 2,
        [LogLevel.ERROR]: 3,
        [LogLevel.LOG]: 99  // Special case - always outputs (except when OFF)
    };

    /**
     * Maps LogMode values to minimum severity rank required for output
     * This defines the filtering threshold for each mode
     */
    private static readonly MODE_THRESHOLDS: Record<LogMode, number> = {
        [LogMode.DEBUG]: 0,   // Shows DEBUG and above
        [LogMode.INFO]: 1,    // Shows INFO and above
        [LogMode.WARN]: 2,    // Shows WARN and above
        [LogMode.ERROR]: 3,   // Shows ERROR and above
        [LogMode.SILENT]: 99, // Only shows LOG messages
        [LogMode.OFF]: 100    // Shows nothing
    };

    /**
     * Determines if a message should be logged based on current log mode
     * Messages are shown only if their level is appropriate for the configured mode
     * LOG level is special - it always outputs regardless of configured mode (except when OFF is set)
     * OFF mode disables all logging including LOG level messages
     * @param level - The log level of the message to check
     * @returns true if message should be logged, false otherwise
     */
    private shouldLog(level: LogLevel): boolean {
        const currentMode = this.config.mode !== undefined ? this.config.mode : LogMode.INFO;
        
        // Get the severity rank for the message level
        const messageSeverity = Logger.SEVERITY_RANKS[level];
        
        // Get the minimum severity threshold for the current mode
        const modeThreshold = Logger.MODE_THRESHOLDS[currentMode];
        
        // Allow the message if its severity meets or exceeds the mode threshold
        return messageSeverity >= modeThreshold;
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
     * Log a critical message that always outputs (LOG level)
     * Uses console.log for output with green coloring
     * Always shown regardless of configured log level
     * Automatically redacts sensitive data when provided
     * @param message - The critical log message to log
     * @param data - Optional data object to log (will be redacted)
     */
    log(message: string, data?: any): void {
        if (this.shouldLog(LogLevel.LOG)) {
            const processedData = DataRedactor.redactData(data);
            const formatted = LogFormatter.format(LogLevel.LOG, message, processedData);
            console.log(formatted);
        }
    }

    /**
     * Log a debug message without redaction (use with caution)
     * Bypasses automatic data redaction for debugging purposes
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
     * Log an info message without redaction (use with caution)
     * Bypasses automatic data redaction for debugging purposes
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
     * Log a warning message without redaction (use with caution)
     * Bypasses automatic data redaction for debugging purposes
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
     * Log an error message without redaction (use with caution)
     * Bypasses automatic data redaction for debugging purposes
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
     * Log a critical message without redaction (use with caution)
     * Bypasses automatic data redaction for debugging purposes
     * @param message - The critical log message to log
     * @param data - Optional data object to log (no redaction applied)
     */
    logRaw(message: string, data?: any): void {
        if (this.shouldLog(LogLevel.LOG)) {
            const formatted = LogFormatter.format(LogLevel.LOG, message, data);
            console.log(formatted);
        }
    }
}
/**
 * Core Logger class that handles log message output with configurable levels
 * Supports DEBUG, INFO, WARN, ERROR, and LOG levels with intelligent filtering
 * LOG level always outputs regardless of configuration
 * Uses colorized console output with timestamps for better readability
 */

import { LogLevel, LoggerConfig } from './types';
import { LogFormatter } from './formatter';

/**
 * Logger class responsible for managing log output and configuration
 * Provides level-based filtering and formatted console output
 */
export class Logger {
    // Internal configuration state with sensible defaults
    private config: LoggerConfig = {
        level: LogLevel.INFO
    };

    /**
     * Updates logger configuration with new settings
     * Merges provided config with existing settings (partial update)
     * @param config - Partial configuration object to apply
     */
    configure(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
    }

    /**
     * Determines if a message should be logged based on current log level
     * Messages are shown only if their level >= configured minimum level
     * LOG level is special - it always outputs regardless of configured level (except when OFF is set)
     * OFF level disables all logging including LOG level messages
     * @param level - The log level of the message to check
     * @returns true if message should be logged, false otherwise
     */
    private shouldLog(level: LogLevel): boolean {
        // OFF level disables all logging including LOG level
        if (this.config.level === LogLevel.OFF) {
            return false;
        }
        
        // LOG level always outputs regardless of configuration (except when OFF is set)
        if (level === LogLevel.LOG) {
            return true;
        }
        
        return level >= this.config.level;
    }

    /**
     * Log a debug message with DEBUG level formatting
     * Uses console.log for output with purple/magenta coloring
     * @param message - The debug message to log
     */
    debug(message: string): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            const formatted = LogFormatter.format(LogLevel.DEBUG, message);
            console.log(formatted);
        }
    }

    /**
     * Log an informational message with INFO level formatting
     * Uses console.log for output with blue coloring
     * @param message - The info message to log
     */
    info(message: string): void {
        if (this.shouldLog(LogLevel.INFO)) {
            const formatted = LogFormatter.format(LogLevel.INFO, message);
            console.log(formatted);
        }
    }

    /**
     * Log a warning message with WARN level formatting
     * Uses console.warn for output with yellow coloring
     * @param message - The warning message to log
     */
    warn(message: string): void {
        if (this.shouldLog(LogLevel.WARN)) {
            const formatted = LogFormatter.format(LogLevel.WARN, message);
            console.warn(formatted);
        }
    }

    /**
     * Log an error message with ERROR level formatting
     * Uses console.error for output with red coloring
     * @param message - The error message to log
     */
    error(message: string): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            const formatted = LogFormatter.format(LogLevel.ERROR, message);
            console.error(formatted);
        }
    }

    /**
     * Log a critical message that always outputs (LOG level)
     * Uses console.log for output with green coloring
     * Always shown regardless of configured log level
     * @param message - The critical log message to log
     */
    log(message: string): void {
        if (this.shouldLog(LogLevel.LOG)) {
            const formatted = LogFormatter.format(LogLevel.LOG, message);
            console.log(formatted);
        }
    }
}
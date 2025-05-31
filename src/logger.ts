/**
 * Core Logger class that handles log message output with configurable levels
 * Supports DEBUG, INFO, WARN, ERROR, and LOG levels with intelligent filtering
 * LOG level always outputs regardless of configuration
 * Uses colorized console output with timestamps for better readability
 */

import { LogLevel, LogMode, LoggerConfig } from './types';
import { LogFormatter } from './formatter';

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
    }

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
        
        // OFF mode disables all logging including LOG level
        if (currentMode === LogMode.OFF) {
            return false;
        }
        
        // LOG level always outputs regardless of configuration (except when OFF is set)
        if (level === LogLevel.LOG) {
            return true;
        }
        
        // SILENT mode only shows LOG level messages
        if (currentMode === LogMode.SILENT) {
            return false;
        }
        
        // For other modes, check if the message level meets the mode threshold
        // Since LogLevel and LogMode have aligned values (DEBUG=0, INFO=1, WARN=2, ERROR=3),
        // we can directly compare their numeric values
        return level >= currentMode;
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
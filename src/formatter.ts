/**
 * Log message formatter that provides colorized console output with timestamps
 * Handles ANSI color codes and structured log message formatting
 */

import { LogLevel } from './types';

/**
 * LogFormatter class responsible for formatting log messages with colors and timestamps
 * Creates readable, colored console output with ISO timestamps and local time
 */
export class LogFormatter {
    // ANSI color codes for terminal output styling
    private static readonly colors = {
        reset: '\x1b[0m',      // Reset all formatting
        dim: '\x1b[2m',        // Dim/faded text
        red: '\x1b[31m',       // Red text (errors)
        yellow: '\x1b[33m',    // Yellow text (warnings)
        blue: '\x1b[34m',      // Blue text (info)
        magenta: '\x1b[35m',   // Magenta text (debug)
        cyan: '\x1b[36m',      // Cyan text (timestamps)
        white: '\x1b[37m',     // White text (default)
        gray: '\x1b[90m',      // Gray text (timestamps)
        green: '\x1b[32m'      // Green text (log level)
    };

    /**
     * Formats a log message with timestamp, level indicator, and appropriate coloring
     * Creates a structured log entry: [ISO_TIMESTAMP][LOCAL_TIME][LEVEL]: message
     * @param level - The log level to format for
     * @param message - The message content to format
     * @returns Formatted string with ANSI colors and timestamps
     */
    static format(level: LogLevel, message: string): string {
        const now = new Date();
        const isoTimestamp = now.toISOString();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).replace(/\s+/g, '');

        const levelName = this.getLevelName(level);
        const levelColor = this.getLevelColor(level);
        
        // Apply colors to each component for better readability
        const coloredTimestamp = `${this.colors.gray}[${isoTimestamp}]${this.colors.reset}`;
        const coloredTimeString = `${this.colors.cyan}[${timeString}]${this.colors.reset}`;
        const coloredLevel = `${levelColor}[${levelName}]${this.colors.reset}`;
        
        return `${coloredTimestamp}${coloredTimeString}${coloredLevel}: ${message}`;
    }

    /**
     * Formats a Log Engine system message with [LOG ENGINE] prefix instead of log levels
     * Used for internal messages like deprecation warnings that should be distinguished from user logs
     * @param message - The system message content to format
     * @returns Formatted string with ANSI colors, timestamps, and LOG ENGINE prefix
     */
    static formatSystemMessage(message: string): string {
        const now = new Date();
        const isoTimestamp = now.toISOString();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).replace(/\s+/g, '');
        
        // Apply colors to each component for better readability
        const coloredTimestamp = `${LogFormatter.colors.gray}[${isoTimestamp}]${LogFormatter.colors.reset}`;
        const coloredTimeString = `${LogFormatter.colors.cyan}[${timeString}]${LogFormatter.colors.reset}`;
        const coloredLogEngine = `${LogFormatter.colors.yellow}[LOG ENGINE]${LogFormatter.colors.reset}`;
        const coloredMessage = `${LogFormatter.colors.yellow}${message}${LogFormatter.colors.reset}`;
        
        return `${coloredTimestamp}${coloredTimeString}${coloredLogEngine}: ${coloredMessage}`;
    }

    /**
     * Converts LogLevel enum to human-readable string
     * @param level - The LogLevel to convert
     * @returns String representation of the log level
     */
    private static getLevelName(level: LogLevel): string {
        switch (level) {
            case LogLevel.DEBUG: return 'DEBUG';
            case LogLevel.INFO: return 'INFO';
            case LogLevel.WARN: return 'WARN';
            case LogLevel.ERROR: return 'ERROR';
            case LogLevel.LOG: return 'LOG';
            default: return 'UNKNOWN';
        }
    }

    /**
     * Maps LogLevel to appropriate ANSI color code
     * Colors help quickly identify message severity in console output
     * @param level - The LogLevel to get color for
     * @returns ANSI color escape sequence
     */
    private static getLevelColor(level: LogLevel): string {
        switch (level) {
            case LogLevel.DEBUG: return this.colors.magenta;  // Purple for debug info
            case LogLevel.INFO: return this.colors.blue;      // Blue for general info
            case LogLevel.WARN: return this.colors.yellow;    // Yellow for warnings
            case LogLevel.ERROR: return this.colors.red;      // Red for errors
            case LogLevel.LOG: return this.colors.green;      // Green for always-on log messages
            default: return this.colors.white;                // White for unknown levels
        }
    }
}
/**
 * Core message formatting functionality
 * Handles the main log message formatting with colors, timestamps, and levels
 */

import { LogLevel } from '../types';
import { colors, colorScheme } from './colors';
import { getTimestampComponents, formatTimestamp } from './timestamp';
import { formatData, styleData } from './data-formatter';

/**
 * Core message formatter class
 * Provides the main formatting functionality for log messages
 */
export class MessageFormatter {
    /**
     * Formats a log message with timestamp, level indicator, and appropriate coloring
     * Creates a structured log entry: [ISO_TIMESTAMP][LOCAL_TIME][LEVEL]: message [data]
     * @param level - The log level to format for
     * @param message - The message content to format
     * @param data - Optional data object to include in the log output
     * @returns Formatted string with ANSI colors and timestamps
     */
    static format(level: LogLevel, message: string, data?: any): string {
        const { isoTimestamp, timeString } = getTimestampComponents();
        const timestamp = formatTimestamp(isoTimestamp, timeString, colorScheme);
        
        const levelName = this.getLevelName(level);
        const levelColor = this.getLevelColor(level);
        const coloredLevel = `${levelColor}[${levelName}]${colors.reset}`;
        
        // Format the base message
        let formattedMessage = `${timestamp}${coloredLevel}: ${message}`;
        
        // Append data if provided
        if (data !== undefined) {
            const dataString = formatData(data);
            const styledData = styleData(dataString, colorScheme);
            formattedMessage += styledData;
        }
        
        return formattedMessage;
    }

    /**
     * Formats a Log Engine system message with [LOG ENGINE] prefix instead of log levels
     * Used for internal messages like deprecation warnings that should be distinguished from user logs
     * @param message - The system message content to format
     * @returns Formatted string with ANSI colors, timestamps, and LOG ENGINE prefix
     */
    static formatSystemMessage(message: string): string {
        const { isoTimestamp, timeString } = getTimestampComponents();
        const timestamp = formatTimestamp(isoTimestamp, timeString, colorScheme);
        
        const coloredLogEngine = `${colorScheme.system}[LOG ENGINE]${colors.reset}`;
        const coloredMessage = `${colorScheme.system}${message}${colors.reset}`;
        
        return `${timestamp}${coloredLogEngine}: ${coloredMessage}`;
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
            case LogLevel.DEBUG: return colors.magenta;  // Purple for debug info
            case LogLevel.INFO: return colors.blue;      // Blue for general info
            case LogLevel.WARN: return colors.yellow;    // Yellow for warnings
            case LogLevel.ERROR: return colors.red;      // Red for errors
            case LogLevel.LOG: return colors.green;      // Green for always-on log messages
            default: return colors.white;                // White for unknown levels
        }
    }
}

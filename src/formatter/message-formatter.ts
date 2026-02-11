/**
 * Core message formatting functionality
 * Handles the main log message formatting with colors, timestamps, and levels
 */

import { LogLevel, LogData, LogFormatConfig } from '../types';
import { colors, colorScheme } from './colors';
import { getTimestampComponents, formatTimestamp } from './timestamp';
import { formatData, styleData } from './data-formatter';
import { EmojiSelector } from './emoji-selector';

/**
 * Core message formatter class
 * Provides the main formatting functionality for log messages
 */
export class MessageFormatter {
  /**
   * Default format configuration to avoid object recreation on every call
   */
  private static readonly DEFAULT_FORMAT_CONFIG: LogFormatConfig = {
    includeIsoTimestamp: true,
    includeLocalTime: true,
    emoji: {
      enabled: false
    }
  };

  /**
     * Formats a log message with timestamp, level indicator, and appropriate coloring
     * Creates a structured log entry: [ISO_TIMESTAMP][LOCAL_TIME][LEVEL]: message [data]
     * @param level - The log level to format for
     * @param message - The message content to format
     * @param data - Optional data object to include in the log output
     * @param formatConfig - Optional format configuration to control element inclusion
     * @returns Formatted string with ANSI colors and timestamps
     */
  static format(level: LogLevel, message: string, data?: LogData, formatConfig?: LogFormatConfig): string {
    // Merge provided format configuration with the default configuration
    const config: LogFormatConfig = {
      ...MessageFormatter.DEFAULT_FORMAT_CONFIG,
      ...formatConfig,
      emoji: {
        ...MessageFormatter.DEFAULT_FORMAT_CONFIG.emoji,
        ...formatConfig?.emoji
      }
    };

    // Configure emoji selector if emoji config is provided
    if (config.emoji) {
      EmojiSelector.configure(config.emoji);
    }

    // Build timestamp string conditionally
    let timestamp = '';
    if (config.includeIsoTimestamp || config.includeLocalTime) {
      const { isoTimestamp, timeString } = getTimestampComponents();

      if (config.includeIsoTimestamp && config.includeLocalTime) {
        // Both timestamps included
        timestamp = formatTimestamp(isoTimestamp, timeString, colorScheme);
      } else if (config.includeIsoTimestamp) {
        // Only ISO timestamp
        timestamp = `${colorScheme.timestamp}[${isoTimestamp}]${colors.reset}`;
      } else if (config.includeLocalTime) {
        // Only local time
        timestamp = `${colorScheme.timeString}[${timeString}]${colors.reset}`;
      }
    }

    const levelName = MessageFormatter.getLevelName(level);
    const levelColor = MessageFormatter.getLevelColor(level);
    const coloredLevel = `${levelColor}[${levelName}]${colors.reset}`;

    // Select emoji based on context
    const emoji = EmojiSelector.selectEmoji(level, message, data);
    const emojiPart = emoji ? `[${emoji}]` : '';

    // Format the base message (level is always included as per requirements)
    // Format: [TIMESTAMP][LEVEL][EMOJI]: message
    let formattedMessage = `${timestamp}${coloredLevel}${emojiPart}: ${message}`;

    // Append data if provided
    if (data !== undefined) {
      const dataString = formatData(data);
      const styledData = styleData(dataString, colorScheme);
      formattedMessage += styledData;
    }

    // Always reset colors at the end of the entire log line
    return formattedMessage + colors.reset;
  }

  /**
     * Formats a Log Engine system message with [LOG ENGINE] prefix instead of log levels
     * Used for internal messages like deprecation warnings that should be distinguished from user logs
     * @param message - The system message content to format
     * @param formatConfig - Optional format configuration to control element inclusion
     * @returns Formatted string with ANSI colors, timestamps, and LOG ENGINE prefix
     */
  static formatSystemMessage(message: string, formatConfig?: LogFormatConfig): string {
    // Merge provided format configuration with the default configuration
    const config: LogFormatConfig = {
      ...MessageFormatter.DEFAULT_FORMAT_CONFIG,
      ...formatConfig
    };

    // Build timestamp string conditionally
    let timestamp = '';
    if (config.includeIsoTimestamp || config.includeLocalTime) {
      const { isoTimestamp, timeString } = getTimestampComponents();

      if (config.includeIsoTimestamp && config.includeLocalTime) {
        // Both timestamps included
        timestamp = formatTimestamp(isoTimestamp, timeString, colorScheme);
      } else if (config.includeIsoTimestamp) {
        // Only ISO timestamp
        timestamp = `${colorScheme.timestamp}[${isoTimestamp}]${colors.reset}`;
      } else if (config.includeLocalTime) {
        // Only local time
        timestamp = `${colorScheme.timeString}[${timeString}]${colors.reset}`;
      }
    }

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

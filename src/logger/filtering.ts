/**
 * Log level and mode filtering logic
 * Handles the decision logic for whether messages should be logged
 */

import { LogLevel, LogMode } from '../types';

/**
 * Filtering logic for log messages based on levels and modes
 * Determines whether a message should be output based on current configuration
 */
export class LogFilter {
  // Maps LogLevel values to severity ranks for consistent comparison
  private static readonly SEVERITY_RANKS: Record<LogLevel, number> = {
    [LogLevel.DEBUG]: 0,
    [LogLevel.INFO]: 1,
    [LogLevel.WARN]: 2,
    [LogLevel.ERROR]: 3,
    [LogLevel.LOG]: 99  // Special case - always outputs (except when OFF)
  };

  // Maps LogMode values to minimum severity rank required for output
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
     * @param currentMode - The current logging mode
     * @returns true if message should be logged, false otherwise
     */
  static shouldLog(level: LogLevel, currentMode: LogMode): boolean {
    // Get the severity rank for the message level using safe lookup
    const messageSeverity = this.getSeverityRank(level);

    // Get the minimum severity threshold for the current mode using safe lookup
    const modeThreshold = this.getModeThreshold(currentMode);

    // Allow the message if its severity meets or exceeds the mode threshold
    return messageSeverity >= modeThreshold;
  }

  /**
     * Get the severity rank for a log level
     * @param level - The log level to get rank for
     * @returns Numeric severity rank
     */
  static getSeverityRank(level: LogLevel): number {
    switch (level) {
    case LogLevel.DEBUG: return this.SEVERITY_RANKS[LogLevel.DEBUG];
    case LogLevel.INFO: return this.SEVERITY_RANKS[LogLevel.INFO];
    case LogLevel.WARN: return this.SEVERITY_RANKS[LogLevel.WARN];
    case LogLevel.ERROR: return this.SEVERITY_RANKS[LogLevel.ERROR];
    case LogLevel.LOG: return this.SEVERITY_RANKS[LogLevel.LOG];
    default: return 0;
    }
  }

  /**
     * Get the threshold for a log mode
     * @param mode - The log mode to get threshold for
     * @returns Numeric threshold value
     */
  static getModeThreshold(mode: LogMode): number {
    switch (mode) {
    case LogMode.DEBUG: return this.MODE_THRESHOLDS[LogMode.DEBUG];
    case LogMode.INFO: return this.MODE_THRESHOLDS[LogMode.INFO];
    case LogMode.WARN: return this.MODE_THRESHOLDS[LogMode.WARN];
    case LogMode.ERROR: return this.MODE_THRESHOLDS[LogMode.ERROR];
    case LogMode.SILENT: return this.MODE_THRESHOLDS[LogMode.SILENT];
    case LogMode.OFF: return this.MODE_THRESHOLDS[LogMode.OFF];
    default: return 0;
    }
  }
}

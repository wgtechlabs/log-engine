/**
 * ANSI color codes and color management for terminal output
 * Provides consistent color definitions used throughout the formatting system
 */

/**
 * ANSI color codes for terminal output styling
 * Used to create colorized console output with consistent theming
 */
export const colors = {
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
} as const;

/**
 * Color scheme configuration
 * Maps semantic meanings to specific colors for consistent theming
 */
export const colorScheme = {
  timestamp: colors.gray,
  timeString: colors.cyan,
  system: colors.yellow,
  data: colors.dim,
  reset: colors.reset
} as const;

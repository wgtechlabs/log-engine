/**
 * Timestamp formatting utilities
 * Handles ISO timestamp and local time formatting for log messages
 */

/**
 * Generates the current timestamp as both an ISO 8601 string and a compact US English local time string.
 *
 * @returns An object containing `isoTimestamp` (ISO 8601 format) and `timeString` (localized time string without spaces)
 */
export function getTimestampComponents(): {
    isoTimestamp: string;
    timeString: string;
    } {
  const now = new Date();
  const isoTimestamp = now.toISOString();
  const timeString = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).replace(/\s+/g, '');

  return {
    isoTimestamp,
    timeString
  };
}

/**
 * Returns a formatted string combining an ISO timestamp and a local time string, each wrapped with specified color codes for console output.
 *
 * @param isoTimestamp - The ISO 8601 formatted timestamp to display
 * @param timeString - The local time string to display
 * @param colors - An object containing color codes for the timestamp, time string, and reset sequence
 * @returns The combined, colorized timestamp string suitable for log messages
 */
export function formatTimestamp(
  isoTimestamp: string,
  timeString: string,
  colors: { timestamp: string; timeString: string; reset: string }
): string {
  const coloredTimestamp = `${colors.timestamp}[${isoTimestamp}]${colors.reset}`;
  const coloredTimeString = `${colors.timeString}[${timeString}]${colors.reset}`;

  return `${coloredTimestamp}${coloredTimeString}`;
}

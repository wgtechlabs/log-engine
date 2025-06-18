/**
 * Timestamp formatting utilities
 * Handles ISO timestamp and local time formatting for log messages
 */

/**
 * Generate formatted timestamp components for log messages
 * Creates both ISO timestamp and localized time string
 * @returns Object containing formatted timestamp components
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
 * Format timestamp components with colors for console output
 * @param isoTimestamp - ISO formatted timestamp
 * @param timeString - Local time string
 * @param colors - Color scheme to use
 * @returns Formatted and colored timestamp string
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

/**
 * Data formatting utilities for log output
 * Handles serialization and formatting of data objects in log messages
 */

/**
 * Formats data objects for log output
 * Converts objects to readable string format with proper handling of edge cases
 * @param data - Data to format (any type)
 * @returns Formatted string representation of the data
 */
export function formatData(data: any): string {
    if (data === null) {
        return 'null';
    }
    
    if (data === undefined) {
        return '';
    }
    
    if (typeof data === 'string') {
        return data;
    }
    
    if (typeof data === 'number' || typeof data === 'boolean') {
        return String(data);
    }
    
    try {
        return JSON.stringify(data, null, 0);
    } catch (error) {
        // Fallback for objects that can't be stringified (e.g., circular references)
        return '[Object]';
    }
}

/**
 * Apply data styling with colors
 * @param dataString - Formatted data string
 * @param colors - Color scheme for data styling
 * @returns Colored data string
 */
export function styleData(dataString: string, colors: { data: string; reset: string }): string {
    if (!dataString) {
        return '';
    }
    
    return ` ${colors.data}${dataString}${colors.reset}`;
}

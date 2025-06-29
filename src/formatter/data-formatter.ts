/**
 * Data formatting utilities for log output
 * Handles serialization and formatting of data objects in log messages
 */

/**
 * Converts input data to a readable string suitable for log output.
 *
 * Returns 'null' for `null`, an empty string for `undefined`, the value itself for strings, and string representations for numbers and booleans. For other types, attempts JSON serialization; if serialization fails, returns '[Object]'.
 *
 * @param data - The value to format for logging
 * @returns The formatted string representation of the input data
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

  if (typeof data === 'symbol') {
    return data.toString();
  }

  try {
    return JSON.stringify(data, null, 0);
  } catch (error) {
    // Fallback for objects that can't be stringified (e.g., circular references)
    return '[Object]';
  }
}

/**
 * Applies color styling to a formatted data string using the provided color codes.
 *
 * @param dataString - The string to be styled; if falsy, an empty string is returned.
 * @param colors - An object containing `data` (the color code prefix) and `reset` (the color code suffix).
 * @returns The styled data string with color codes applied, or an empty string if `dataString` is falsy.
 */
export function styleData(dataString: string, colors: { data: string; reset: string }): string {
  if (!dataString) {
    return '';
  }

  return ` ${colors.data}${dataString}${colors.reset}`;
}

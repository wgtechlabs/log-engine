/**
 * Core data redaction engine
 * Handles automatic detection and redaction of sensitive information in log data
 */

import { RedactionConfig } from '../types';
import { defaultRedactionConfig, RedactionController } from './config';

/**
 * DataRedactor class - Core redaction logic for processing log data
 * Automatically detects and redacts sensitive information while preserving structure
 */
export class DataRedactor {
  private static config: RedactionConfig = {
    ...defaultRedactionConfig,
    ...RedactionController.getEnvironmentConfig()
  };

  // Maximum recursion depth to prevent stack overflow attacks
  private static readonly MAX_RECURSION_DEPTH = 100;
  // Slightly lower limit for redactObject to ensure it can be reached
  private static readonly MAX_REDACT_OBJECT_DEPTH = 99;

  /**
     * Update the redaction configuration with new settings
     * Merges provided config with existing settings and reloads environment variables
     * @param newConfig - Partial configuration to merge with current settings
     */
  static updateConfig(newConfig: Partial<RedactionConfig>): void {
    // Reload environment configuration to pick up any changes
    const envConfig = RedactionController.getEnvironmentConfig();
    DataRedactor.config = {
      ...defaultRedactionConfig,
      ...envConfig,
      ...newConfig
    };
  }

  /**
     * Get the current redaction configuration
     * @returns Deep copy of current redaction configuration
     */
  static getConfig(): RedactionConfig {
    return {
      ...DataRedactor.config,
      sensitiveFields: [...DataRedactor.config.sensitiveFields],
      contentFields: [...DataRedactor.config.contentFields],
      customPatterns: DataRedactor.config.customPatterns ? [...DataRedactor.config.customPatterns] : undefined
    };
  }

  /**
     * Refresh configuration from environment variables
     * Useful for picking up runtime environment changes
     */
  static refreshConfig(): void {
    const envConfig = RedactionController.getEnvironmentConfig();
    DataRedactor.config = {
      ...defaultRedactionConfig,
      ...envConfig
    };
  }

  /**
     * Add custom regex patterns for advanced field detection
     * @param patterns - Array of regex patterns to add
     */
  static addCustomPatterns(patterns: RegExp[]): void {
    const currentPatterns = DataRedactor.config.customPatterns || [];
    DataRedactor.config = {
      ...DataRedactor.config,
      customPatterns: [...currentPatterns, ...patterns]
    };
  }

  /**
     * Clear all custom regex patterns
     */
  static clearCustomPatterns(): void {
    DataRedactor.config = {
      ...DataRedactor.config,
      customPatterns: []
    };
  }

  /**
     * Add custom sensitive field names to the existing list
     * @param fields - Array of field names to add
     */
  static addSensitiveFields(fields: string[]): void {
    DataRedactor.config = {
      ...DataRedactor.config,
      sensitiveFields: [...DataRedactor.config.sensitiveFields, ...fields]
    };
  }

  /**
     * Test if a field name would be redacted with current configuration
     * @param fieldName - Field name to test
     * @returns true if field would be redacted, false otherwise
     */
  static testFieldRedaction(fieldName: string): boolean {
    const testObj = { [fieldName]: 'test-value' };
    const result = DataRedactor.redactData(testObj);
    // Use safe property access to prevent object injection
    return Object.prototype.hasOwnProperty.call(result, fieldName) && result[fieldName] !== 'test-value';
  }

  /**
     * Main entry point for data redaction
     * Processes any type of data and returns a redacted version
     * @param data - Data to be processed for redaction
     * @returns Redacted version of the data
     */
  static redactData(data: any): any {
    // Skip processing if redaction is disabled or data is null/undefined
    if (!DataRedactor.config.enabled || data === null || data === undefined) {
      return data;
    }

    return DataRedactor.processValue(data, new WeakSet(), 0);
  }

  /**
     * Process a value of any type (primitive, object, array)
     * Recursively handles nested structures when deepRedaction is enabled
     * Includes circular reference protection and recursion depth limiting
     * @param value - Value to process
     * @param visited - Set to track visited objects (prevents circular references)
     * @param depth - Current recursion depth (prevents stack overflow)
     * @returns Processed value with redaction applied
     */
  private static processValue(value: any, visited: WeakSet<object> = new WeakSet(), depth: number = 0): any {
    // Check recursion depth limit to prevent stack overflow
    if (depth >= DataRedactor.MAX_RECURSION_DEPTH) {
      return '[Max Depth Exceeded]';
    }

    // Handle null and undefined
    if (value === null || value === undefined) {
      return value;
    }

    // Handle arrays - process each element
    if (Array.isArray(value)) {
      // Check for circular reference
      if (visited.has(value)) {
        return '[Circular Array]';
      }
      visited.add(value);

      const result = value.map(item => DataRedactor.processValue(item, visited, depth + 1));
      // Keep value in visited set to detect circular references across branches
      return result;
    }

    // Handle objects - process each property
    if (typeof value === 'object') {
      // Check for circular reference
      if (visited.has(value)) {
        return '[Circular Object]';
      }
      visited.add(value);

      const result = DataRedactor.redactObject(value, visited, depth + 1);
      // Keep value in visited set to detect circular references across branches
      return result;
    }

    // Handle primitives (string, number, boolean) - return as-is
    return value;
  }

  /**
     * Process an object and redact sensitive fields
     * Handles field-level redaction and content truncation
     * @param obj - Object to process
     * @param visited - Set to track visited objects (prevents circular references)
     * @param depth - Current recursion depth (prevents stack overflow)
     * @returns Object with sensitive fields redacted
     */
  private static redactObject(obj: Record<string, any>, visited: WeakSet<object> = new WeakSet(), depth: number = 0): Record<string, any> {
    // Check recursion depth limit to prevent stack overflow
    if (depth >= DataRedactor.MAX_REDACT_OBJECT_DEPTH) {
      return { '[Max Depth Exceeded]': '[Max Depth Exceeded]' };
    }

    const redacted: Record<string, any> = {};

    for (const [key, value] of Object.entries(obj)) {
      // Check if this field should be completely redacted
      if (DataRedactor.isSensitiveField(key)) {
        Object.defineProperty(redacted, key, { value: DataRedactor.config.redactionText, enumerable: true, writable: true, configurable: true });
      } else if (DataRedactor.isContentField(key) && typeof value === 'string') {
        // Check if this field should be truncated (for large content)
        Object.defineProperty(redacted, key, { value: DataRedactor.truncateContent(value), enumerable: true, writable: true, configurable: true });
      } else if (DataRedactor.config.deepRedaction && (typeof value === 'object' && value !== null)) {
        // Recursively process nested objects/arrays if deep redaction is enabled
        Object.defineProperty(redacted, key, { value: DataRedactor.processValue(value, visited, depth + 1), enumerable: true, writable: true, configurable: true });
      } else {
        // Keep the value unchanged
        Object.defineProperty(redacted, key, { value: value, enumerable: true, writable: true, configurable: true });
      }
    }

    return redacted;
  }

  /**
     * Check if a field name indicates sensitive information
     * Uses case-insensitive matching with exact and partial matches
     * Includes smart filtering to avoid false positives and custom patterns
     * @param fieldName - Field name to check
     * @returns true if field should be redacted, false otherwise
     */
  private static isSensitiveField(fieldName: string): boolean {
    const lowerField = fieldName.toLowerCase();

    // Check custom regex patterns first (highest priority)
    if (DataRedactor.config.customPatterns && DataRedactor.config.customPatterns.length > 0) {
      for (const pattern of DataRedactor.config.customPatterns) {
        if (pattern.test(fieldName)) {
          return true;
        }
      }
    }

    return DataRedactor.config.sensitiveFields.some(sensitive => {
      const lowerSensitive = sensitive.toLowerCase();

      // Exact match (highest confidence)
      if (lowerField === lowerSensitive) {
        return true;
      }

      // Field ends with sensitive term (e.g., "userPassword" ends with "password")
      if (lowerField.endsWith(lowerSensitive)) {
        return true;
      }

      // Field starts with sensitive term (e.g., "passwordHash" starts with "password")
      if (lowerField.startsWith(lowerSensitive)) {
        return true;
      }

      // Whitelist of short sensitive terms that should always trigger substring matching
      const shortSensitiveWhitelist = ['pin', 'cvv', 'cvc', 'ssn', 'pwd', 'key', 'jwt', 'dob', 'pii', 'auth', 'csrf'];

      // Field contains sensitive term - either from whitelist or length >= 5 to avoid false positives
      if ((shortSensitiveWhitelist.includes(lowerSensitive) || lowerSensitive.length >= 5) &&
                lowerField.includes(lowerSensitive)) {
        return true;
      }

      // Handle compound words with underscores or camelCase
      if (lowerField.includes('_' + lowerSensitive) || lowerField.includes(lowerSensitive + '_')) {
        return true;
      }

      return false;
    });
  }

  /**
     * Check if a field name indicates content that should be truncated
     * Uses exact case-insensitive matching for content fields
     * @param fieldName - Field name to check
     * @returns true if field is a content field, false otherwise
     */
  private static isContentField(fieldName: string): boolean {
    const lowerField = fieldName.toLowerCase();
    return DataRedactor.config.contentFields.some(content => content.toLowerCase() === lowerField);
  }

  /**
     * Truncate content that exceeds the maximum length
     * Preserves readability while preventing log bloat
     * @param content - Content string to potentially truncate
     * @returns Original content or truncated version with indicator
     */
  private static truncateContent(content: string): string {
    if (content.length <= DataRedactor.config.maxContentLength) {
      return content;
    }
    return content.substring(0, DataRedactor.config.maxContentLength) + DataRedactor.config.truncationText;
  }
}

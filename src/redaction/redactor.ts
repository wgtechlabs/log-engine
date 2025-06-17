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

    /**
     * Update the redaction configuration with new settings
     * Merges provided config with existing settings and reloads environment variables
     * @param newConfig - Partial configuration to merge with current settings
     */
    static updateConfig(newConfig: Partial<RedactionConfig>): void {
        // Reload environment configuration to pick up any changes
        const envConfig = RedactionController.getEnvironmentConfig();
        this.config = { 
            ...defaultRedactionConfig, 
            ...envConfig,
            ...newConfig 
        };
    }

    /**
     * Get the current redaction configuration
     * @returns Current redaction configuration
     */
    static getConfig(): RedactionConfig {
        return { ...this.config };
    }

    /**
     * Refresh configuration from environment variables
     * Useful for picking up runtime environment changes
     */
    static refreshConfig(): void {
        const envConfig = RedactionController.getEnvironmentConfig();
        this.config = { 
            ...defaultRedactionConfig, 
            ...envConfig
        };
    }

    /**
     * Main entry point for data redaction
     * Processes any type of data and returns a redacted version
     * @param data - Data to be processed for redaction
     * @returns Redacted version of the data
     */
    static redactData(data: any): any {
        // Skip processing if redaction is disabled or data is null/undefined
        if (!this.config.enabled || data === null || data === undefined) {
            return data;
        }

        return this.processValue(data, new WeakSet());
    }

    /**
     * Process a value of any type (primitive, object, array)
     * Recursively handles nested structures when deepRedaction is enabled
     * Includes circular reference protection
     * @param value - Value to process
     * @param visited - Set to track visited objects (prevents circular references)
     * @returns Processed value with redaction applied
     */
    private static processValue(value: any, visited: WeakSet<object> = new WeakSet()): any {
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
            
            const result = value.map(item => this.processValue(item, visited));
            visited.delete(value);
            return result;
        }

        // Handle objects - process each property
        if (typeof value === 'object') {
            // Check for circular reference
            if (visited.has(value)) {
                return '[Circular Object]';
            }
            visited.add(value);
            
            const result = this.redactObject(value, visited);
            visited.delete(value);
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
     * @returns Object with sensitive fields redacted
     */
    private static redactObject(obj: Record<string, any>, visited: WeakSet<object> = new WeakSet()): Record<string, any> {
        const redacted: Record<string, any> = {};

        for (const [key, value] of Object.entries(obj)) {
            // Check if this field should be completely redacted
            if (this.isSensitiveField(key)) {
                redacted[key] = this.config.redactionText;
            }
            // Check if this field should be truncated (for large content)
            else if (this.isContentField(key) && typeof value === 'string') {
                redacted[key] = this.truncateContent(value);
            }
            // Recursively process nested objects/arrays if deep redaction is enabled
            else if (this.config.deepRedaction && (typeof value === 'object' && value !== null)) {
                redacted[key] = this.processValue(value, visited);
            }
            // Keep the value unchanged
            else {
                redacted[key] = value;
            }
        }

        return redacted;
    }

    /**
     * Check if a field name indicates sensitive information
     * Uses case-insensitive matching with exact and partial matches
     * Includes smart filtering to avoid false positives
     * @param fieldName - Field name to check
     * @returns true if field should be redacted, false otherwise
     */
    private static isSensitiveField(fieldName: string): boolean {
        const lowerField = fieldName.toLowerCase();
        
        return this.config.sensitiveFields.some(sensitive => {
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
            
            // Field contains sensitive term, but only for longer sensitive terms to avoid false positives
            if (lowerSensitive.length >= 5 && lowerField.includes(lowerSensitive)) {
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
        return this.config.contentFields.some(content => content.toLowerCase() === lowerField);
    }

    /**
     * Truncate content that exceeds the maximum length
     * Preserves readability while preventing log bloat
     * @param content - Content string to potentially truncate
     * @returns Original content or truncated version with indicator
     */
    private static truncateContent(content: string): string {
        if (content.length <= this.config.maxContentLength) {
            return content;
        }
        return content.substring(0, this.config.maxContentLength) + this.config.truncationText;
    }
}

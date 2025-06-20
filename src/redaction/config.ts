/**
 * Default configuration and constants for data redaction
 * Provides comprehensive coverage of common sensitive field patterns
 */

import { RedactionConfig } from '../types';

/**
 * Default redaction configuration with comprehensive sensitive field detection
 * Covers authentication, personal information, financial data, and internal systems
 */
export const defaultRedactionConfig: RedactionConfig = {
    enabled: true,
    deepRedaction: true,
    maxContentLength: 100,
    redactionText: '[REDACTED]',
    truncationText: '... [TRUNCATED]',
    
    // Comprehensive list of sensitive field patterns (case-insensitive)
    sensitiveFields: [
        // Authentication & Security
        'password', 'pwd', 'pass', 'passphrase',
        'token', 'accessToken', 'refreshToken', 'bearerToken',
        'apiKey', 'api_key', 'secret', 'secretKey', 'privateKey',
        'auth', 'authorization', 'authToken',
        'jwt', 'sessionId', 'session_id',
        'cookie', 'cookies', 'csrf', 'csrfToken',
        
        // Personal Information (PII)
        'email', 'emailAddress', 'email_address',
        'phone', 'phoneNumber', 'phone_number', 'mobile',
        'ssn', 'socialSecurityNumber', 'social_security_number',
        'address', 'homeAddress', 'workAddress',
        'firstName', 'lastName', 'fullName', 'realName', 'displayName',
        'dateOfBirth', 'dob', 'birthDate',
        
        // Financial Information
        'creditCard', 'credit_card', 'cardNumber', 'card_number',
        'cvv', 'cvc', 'pin', 'expiryDate', 'expiry_date',
        'bankAccount', 'bank_account', 'routingNumber',
        
        // Internal/System Information
        'internalId', 'userId', 'customerId',
        'personalInfo', 'pii', 'sensitive',
        'clientSecret', 'webhookSecret'
    ],
    
    // Fields that should be truncated rather than redacted
    contentFields: [
        'content', 'text', 'message', 'body', 'data',
        'payload', 'response', 'request', 'description'
    ]
};

/**
 * Environment-based redaction controller
 * Determines when redaction should be disabled based on environment variables
 */
export class RedactionController {
    /**
     * Check if redaction should be disabled based on environment variables
     * Development mode and explicit flags can disable redaction for debugging
     * @returns true if redaction should be disabled, false otherwise
     */
    static isRedactionDisabled(): boolean {
        return (
            process.env.NODE_ENV === 'development' ||
            process.env.LOG_REDACTION_DISABLED === 'true' ||
            process.env.DEBUG_FULL_PAYLOADS === 'true' ||
            process.env.LOG_LEVEL === 'debug' ||
            process.env.LOG_REDACTION_ENABLED === 'false'
        );
    }

    /**
     * Get environment-specific configuration overrides
     * Allows customization through environment variables
     * @returns Partial redaction config with environment-based overrides
     */
    static getEnvironmentConfig(): Partial<RedactionConfig> {
        const envConfig: Partial<RedactionConfig> = {
            enabled: !this.isRedactionDisabled()
        };

        // Apply environment variable overrides if they exist
        if (process.env.LOG_MAX_CONTENT_LENGTH) {
            const parsedLength = parseInt(process.env.LOG_MAX_CONTENT_LENGTH, 10);
            if (!isNaN(parsedLength) && parsedLength > 0) {
                envConfig.maxContentLength = parsedLength;
            }
        }

        if (process.env.LOG_REDACTION_TEXT) {
            envConfig.redactionText = process.env.LOG_REDACTION_TEXT;
        }

        if (process.env.LOG_TRUNCATION_TEXT) {
            envConfig.truncationText = process.env.LOG_TRUNCATION_TEXT;
        }

        if (process.env.LOG_SENSITIVE_FIELDS) {
            const customFields = process.env.LOG_SENSITIVE_FIELDS.split(',').map(f => f.trim());
            envConfig.sensitiveFields = [...defaultRedactionConfig.sensitiveFields, ...customFields];
        }

        return envConfig;
    }
}

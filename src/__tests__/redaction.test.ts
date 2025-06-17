/**
 * Comprehensive tests for data redaction functionality
 * Tests core redaction logic, configuration, and integration with LogEngine
 */

import { DataRedactor, defaultRedactionConfig, RedactionController } from '../redaction';
import { RedactionConfig } from '../types';

describe('DataRedactor', () => {
    // Store original environment to restore after tests
    const originalEnv = process.env;

    beforeEach(() => {
        // Reset to default configuration before each test
        DataRedactor.updateConfig(defaultRedactionConfig);
        // Reset environment
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        // Restore original environment
        process.env = originalEnv;
    });

    describe('Basic redaction functionality', () => {
        test('should redact sensitive fields', () => {
            const testData = {
                username: 'john_doe',
                password: 'secret123',
                email: 'john@example.com',
                apiKey: 'sk-1234567890',
                publicInfo: 'this is public'
            };

            const result = DataRedactor.redactData(testData);

            expect(result.username).toBe('john_doe'); // username is not sensitive
            expect(result.password).toBe('[REDACTED]');
            expect(result.email).toBe('[REDACTED]');
            expect(result.apiKey).toBe('[REDACTED]');
            expect(result.publicInfo).toBe('this is public');
        });

        test('should handle nested objects', () => {
            const testData = {
                user: {
                    profile: {
                        username: 'johndoe',
                        email: 'john@example.com',
                        password: 'secret'
                    },
                    settings: {
                        theme: 'dark',
                        apiToken: 'token123'
                    }
                },
                metadata: {
                    timestamp: '2025-01-01'
                }
            };

            const result = DataRedactor.redactData(testData);

            expect(result.user.profile.username).toBe('johndoe'); // username is not sensitive
            expect(result.user.profile.email).toBe('[REDACTED]');
            expect(result.user.profile.password).toBe('[REDACTED]');
            expect(result.user.settings.theme).toBe('dark');
            expect(result.user.settings.apiToken).toBe('[REDACTED]');
            expect(result.metadata.timestamp).toBe('2025-01-01');
        });

        test('should handle arrays', () => {
            const testData = [
                { username: 'User1', password: 'secret1' },
                { username: 'User2', email: 'user2@example.com' }
            ];

            const result = DataRedactor.redactData(testData);

            expect(result[0].username).toBe('User1'); // username is not sensitive
            expect(result[0].password).toBe('[REDACTED]');
            expect(result[1].username).toBe('User2'); // username is not sensitive
            expect(result[1].email).toBe('[REDACTED]');
        });

        test('should truncate content fields', () => {
            const longContent = 'A'.repeat(200);
            const testData = {
                content: longContent,
                message: 'Short message',
                other: 'other data'
            };

            const result = DataRedactor.redactData(testData);

            expect(result.content).toContain('... [TRUNCATED]');
            expect(result.content.length).toBeLessThan(longContent.length);
            expect(result.message).toBe('Short message');
            expect(result.other).toBe('other data');
        });

        test('should handle primitive types', () => {
            expect(DataRedactor.redactData('string')).toBe('string');
            expect(DataRedactor.redactData(123)).toBe(123);
            expect(DataRedactor.redactData(true)).toBe(true);
            expect(DataRedactor.redactData(null)).toBe(null);
            expect(DataRedactor.redactData(undefined)).toBe(undefined);
        });
    });

    describe('Field detection', () => {
        test('should detect case-insensitive field names', () => {
            const testData = {
                Password: 'secret1',
                EMAIL: 'test@example.com',
                ApiKey: 'key123',
                userPassword: 'secret2',
                customerEmail: 'customer@example.com'
            };

            const result = DataRedactor.redactData(testData);

            expect(result.Password).toBe('[REDACTED]');
            expect(result.EMAIL).toBe('[REDACTED]');
            expect(result.ApiKey).toBe('[REDACTED]');
            expect(result.userPassword).toBe('[REDACTED]');
            expect(result.customerEmail).toBe('[REDACTED]');
        });

        test('should detect partial field name matches', () => {
            const testData = {
                userPassword: 'secret1',
                clientSecret: 'secret2',
                bearerToken: 'token123',
                refreshTokenValue: 'refresh123'
            };

            const result = DataRedactor.redactData(testData);

            expect(result.userPassword).toBe('[REDACTED]');
            expect(result.clientSecret).toBe('[REDACTED]');
            expect(result.bearerToken).toBe('[REDACTED]');
            expect(result.refreshTokenValue).toBe('[REDACTED]');
        });
    });

    describe('Configuration', () => {
        test('should respect custom redaction text', () => {
            DataRedactor.updateConfig({
                redactionText: '***HIDDEN***'
            });

            const testData = { password: 'secret' };
            const result = DataRedactor.redactData(testData);

            expect(result.password).toBe('***HIDDEN***');
        });

        test('should respect custom content length', () => {
            DataRedactor.updateConfig({
                maxContentLength: 10
            });

            const testData = { content: 'This is a long content string' };
            const result = DataRedactor.redactData(testData);

            expect(result.content).toBe('This is a ... [TRUNCATED]');
        });

        test('should respect custom sensitive fields', () => {
            DataRedactor.updateConfig({
                sensitiveFields: ['customSecret', 'myPrivateField']
            });

            const testData = {
                customSecret: 'secret',
                myPrivateField: 'private',
                password: 'normalPassword',
                normalField: 'normal'
            };

            const result = DataRedactor.redactData(testData);

            expect(result.customSecret).toBe('[REDACTED]');
            expect(result.myPrivateField).toBe('[REDACTED]');
            expect(result.password).toBe('normalPassword'); // Not in custom list
            expect(result.normalField).toBe('normal');
        });

        test('should disable deep redaction when configured', () => {
            DataRedactor.updateConfig({
                deepRedaction: false
            });

            const testData = {
                topLevel: 'visible',
                user: {
                    password: 'secret'
                }
            };

            const result = DataRedactor.redactData(testData);

            // With deep redaction disabled, nested password should not be redacted
            expect(result.topLevel).toBe('visible');
            expect(result.user.password).toBe('secret');
        });
    });

    describe('Environment-based control', () => {
        test('should disable redaction in development environment', () => {
            process.env.NODE_ENV = 'development';
            
            // Re-initialize with environment config
            DataRedactor.updateConfig({
                ...defaultRedactionConfig,
                ...RedactionController.getEnvironmentConfig()
            });

            const testData = { password: 'secret' };
            const result = DataRedactor.redactData(testData);

            expect(result.password).toBe('secret');
        });

        test('should disable redaction when LOG_REDACTION_DISABLED is true', () => {
            process.env.LOG_REDACTION_DISABLED = 'true';
            
            DataRedactor.updateConfig({
                ...defaultRedactionConfig,
                ...RedactionController.getEnvironmentConfig()
            });

            const testData = { password: 'secret' };
            const result = DataRedactor.redactData(testData);

            expect(result.password).toBe('secret');
        });

        test('should disable redaction when DEBUG_FULL_PAYLOADS is true', () => {
            process.env.DEBUG_FULL_PAYLOADS = 'true';
            
            DataRedactor.updateConfig({
                ...defaultRedactionConfig,
                ...RedactionController.getEnvironmentConfig()
            });

            const testData = { password: 'secret' };
            const result = DataRedactor.redactData(testData);

            expect(result.password).toBe('secret');
        });

        test('should apply environment variable overrides', () => {
            process.env.LOG_REDACTION_TEXT = '***ENV_REDACTED***';
            process.env.LOG_MAX_CONTENT_LENGTH = '50';
            process.env.LOG_SENSITIVE_FIELDS = 'customField,anotherField';

            DataRedactor.updateConfig({
                ...defaultRedactionConfig,
                ...RedactionController.getEnvironmentConfig()
            });

            const testData = {
                password: 'secret',
                customField: 'custom',
                content: 'A'.repeat(100)
            };

            const result = DataRedactor.redactData(testData);

            expect(result.password).toBe('***ENV_REDACTED***');
            expect(result.customField).toBe('***ENV_REDACTED***');
            expect(result.content).toContain('... [TRUNCATED]');
            expect(result.content.length).toBeLessThan(70); // 50 chars + truncation text
        });
    });

    describe('Edge cases', () => {
        test('should handle circular references gracefully', () => {
            const testData: any = { username: 'test', id: 123 };
            testData.self = testData; // Create circular reference

            // Should not throw an error
            const result = DataRedactor.redactData(testData);
            expect(result.username).toBe('test'); // username is not sensitive
            expect(result.id).toBe(123);
            expect(result.self).toBe('[Circular Object]');
        });

        test('should handle when redaction is disabled', () => {
            DataRedactor.updateConfig({ enabled: false });

            const testData = { password: 'secret' };
            const result = DataRedactor.redactData(testData);

            expect(result.password).toBe('secret');
        });

        test('should handle empty and null objects', () => {
            expect(DataRedactor.redactData({})).toEqual({});
            expect(DataRedactor.redactData(null)).toBe(null);
            expect(DataRedactor.redactData(undefined)).toBe(undefined);
            expect(DataRedactor.redactData([])).toEqual([]);
        });
    });
});

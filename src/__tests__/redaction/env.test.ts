/**
 * Tests for environment-based redaction control
 * Covers environment variable configurations and development mode behavior
 */

import { DataRedactor, defaultRedactionConfig, RedactionController } from '../../redaction';

describe('Data Redaction - Environment Control', () => {
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

        test('should apply LOG_TRUNCATION_TEXT environment variable', () => {
            // Test to cover line 95 in config.ts
            process.env.LOG_TRUNCATION_TEXT = '... [CUSTOM_TRUNCATED]';
            process.env.LOG_MAX_CONTENT_LENGTH = '20';

            DataRedactor.updateConfig({
                ...defaultRedactionConfig,
                ...RedactionController.getEnvironmentConfig()
            });

            const testData = {
                content: 'This is a very long content that will be truncated'
            };

            const result = DataRedactor.redactData(testData);

            expect(result.content).toContain('... [CUSTOM_TRUNCATED]');
            expect(result.content.length).toBeLessThan(50);
        });
    });
});

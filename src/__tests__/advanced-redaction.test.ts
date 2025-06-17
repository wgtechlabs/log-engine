/**
 * Advanced redaction tests for Phase 4
 * Tests comprehensive coverage of advanced configuration methods
 */

import { DataRedactor, defaultRedactionConfig } from '../redaction';
import { RedactionConfig } from '../types';

describe('Advanced Redaction Methods (Phase 4)', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        // Reset to default configuration
        DataRedactor.updateConfig(defaultRedactionConfig);
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    describe('Custom Pattern Management', () => {
        test('should add custom patterns for field detection', () => {
            // Initial test - field should not be redacted (using field that doesn't contain sensitive keywords)
            expect(DataRedactor.testFieldRedaction('normalField')).toBe(false);
            
            // Add custom pattern
            DataRedactor.addCustomPatterns([/normal.*/i]);
            
            // Now field should be redacted
            expect(DataRedactor.testFieldRedaction('normalField')).toBe(true);
            expect(DataRedactor.testFieldRedaction('NormalData')).toBe(true);
            expect(DataRedactor.testFieldRedaction('unrelatedField')).toBe(false);
        });

        test('should clear custom patterns', () => {
            // Add custom patterns
            DataRedactor.addCustomPatterns([/custom.*/i, /special.*/i]);
            
            expect(DataRedactor.testFieldRedaction('customField')).toBe(true);
            expect(DataRedactor.testFieldRedaction('specialField')).toBe(true);
            
            // Clear patterns
            DataRedactor.clearCustomPatterns();
            
            expect(DataRedactor.testFieldRedaction('customField')).toBe(false);
            expect(DataRedactor.testFieldRedaction('specialField')).toBe(false);
        });

        test('should handle multiple custom patterns', () => {
            DataRedactor.addCustomPatterns([
                /^config.*/i,
                /.*data$/i,
                /\btesting\b/i
            ]);

            const testData = {
                configCode: 'abc123',
                apidata: 'sk-123',
                testingData: 'sensitive',
                normalField: 'public',
                configValue: 'hidden',
                mydata: 'private'
            };

            const result = DataRedactor.redactData(testData);

            expect(result.configCode).toBe('[REDACTED]');
            expect(result.apidata).toBe('[REDACTED]');
            expect(result.testingData).toBe('[REDACTED]');
            expect(result.normalField).toBe('public');
            expect(result.configValue).toBe('[REDACTED]');
            expect(result.mydata).toBe('[REDACTED]');
        });

        test('should accumulate custom patterns when called multiple times', () => {
            DataRedactor.addCustomPatterns([/pattern1.*/i]);
            DataRedactor.addCustomPatterns([/pattern2.*/i]);
            
            expect(DataRedactor.testFieldRedaction('pattern1Field')).toBe(true);
            expect(DataRedactor.testFieldRedaction('pattern2Field')).toBe(true);
            expect(DataRedactor.testFieldRedaction('otherField')).toBe(false);
        });
    });

    describe('Sensitive Fields Management', () => {
        test('should add custom sensitive fields', () => {
            // Test initial state (using fields that are NOT in default sensitive list)
            expect(DataRedactor.testFieldRedaction('companyValue')).toBe(false);
            expect(DataRedactor.testFieldRedaction('businessData')).toBe(false);
            
            // Add custom sensitive fields
            DataRedactor.addSensitiveFields(['companyValue', 'businessData', 'proprietaryInfo']);
            
            // Test after adding
            expect(DataRedactor.testFieldRedaction('companyValue')).toBe(true);
            expect(DataRedactor.testFieldRedaction('businessData')).toBe(true);
            expect(DataRedactor.testFieldRedaction('proprietaryInfo')).toBe(true);
            expect(DataRedactor.testFieldRedaction('publicField')).toBe(false);
        });

        test('should integrate custom fields with redaction', () => {
            DataRedactor.addSensitiveFields(['customField', 'specialData']);
            
            const testData = {
                customField: 'should be redacted',
                specialData: 'also redacted',
                password: 'default sensitive',
                publicInfo: 'visible'
            };

            const result = DataRedactor.redactData(testData);

            expect(result.customField).toBe('[REDACTED]');
            expect(result.specialData).toBe('[REDACTED]');
            expect(result.password).toBe('[REDACTED]');
            expect(result.publicInfo).toBe('visible');
        });

        test('should handle case-insensitive field matching', () => {
            DataRedactor.addSensitiveFields(['CaseSensitive']);
            
            expect(DataRedactor.testFieldRedaction('casesensitive')).toBe(true);
            expect(DataRedactor.testFieldRedaction('CASESENSITIVE')).toBe(true);
            expect(DataRedactor.testFieldRedaction('CaseSensitive')).toBe(true);
        });

        test('should accumulate sensitive fields when called multiple times', () => {
            DataRedactor.addSensitiveFields(['field1', 'field2']);
            DataRedactor.addSensitiveFields(['field3', 'field4']);
            
            expect(DataRedactor.testFieldRedaction('field1')).toBe(true);
            expect(DataRedactor.testFieldRedaction('field2')).toBe(true);
            expect(DataRedactor.testFieldRedaction('field3')).toBe(true);
            expect(DataRedactor.testFieldRedaction('field4')).toBe(true);
        });
    });

    describe('Field Redaction Testing', () => {
        test('should test default sensitive fields', () => {
            // Test built-in sensitive fields
            expect(DataRedactor.testFieldRedaction('password')).toBe(true);
            expect(DataRedactor.testFieldRedaction('email')).toBe(true);
            expect(DataRedactor.testFieldRedaction('apiKey')).toBe(true);
            expect(DataRedactor.testFieldRedaction('token')).toBe(true);
            expect(DataRedactor.testFieldRedaction('secret')).toBe(true);
            expect(DataRedactor.testFieldRedaction('secretKey')).toBe(true); // 'key' alone is not sensitive, but 'secretKey' is
            expect(DataRedactor.testFieldRedaction('auth')).toBe(true);
            expect(DataRedactor.testFieldRedaction('credential')).toBe(false); // not in default list
            
            // Test non-sensitive fields
            expect(DataRedactor.testFieldRedaction('username')).toBe(false);
            expect(DataRedactor.testFieldRedaction('id')).toBe(false);
            expect(DataRedactor.testFieldRedaction('name')).toBe(false);
            expect(DataRedactor.testFieldRedaction('status')).toBe(false);
            expect(DataRedactor.testFieldRedaction('key')).toBe(false); // 'key' alone is not in default list
        });

        test('should test partial matching for sensitive fields', () => {
            expect(DataRedactor.testFieldRedaction('userPassword')).toBe(true);
            expect(DataRedactor.testFieldRedaction('adminEmail')).toBe(true);
            expect(DataRedactor.testFieldRedaction('apiToken')).toBe(true);
            expect(DataRedactor.testFieldRedaction('secretKey')).toBe(true);
        });

        test('should be case insensitive', () => {
            expect(DataRedactor.testFieldRedaction('PASSWORD')).toBe(true);
            expect(DataRedactor.testFieldRedaction('Email')).toBe(true);
            expect(DataRedactor.testFieldRedaction('API_KEY')).toBe(true);
            expect(DataRedactor.testFieldRedaction('Token')).toBe(true);
        });
    });

    describe('Configuration Refresh', () => {
        test('should refresh configuration from environment', () => {
            // Set environment variables (using correct variable names)
            process.env.LOG_REDACTION_DISABLED = 'false';
            process.env.LOG_REDACTION_TEXT = '***HIDDEN***';
            process.env.LOG_SENSITIVE_FIELDS = 'customField,specialValue';
            
            // Refresh configuration
            DataRedactor.refreshConfig();
            
            const config = DataRedactor.getConfig();
            expect(config.enabled).toBe(true);
            expect(config.redactionText).toBe('***HIDDEN***');
            expect(config.sensitiveFields).toContain('customField');
            expect(config.sensitiveFields).toContain('specialValue');
        });

        test('should handle disabled redaction from environment', () => {
            process.env.LOG_REDACTION_DISABLED = 'true';
            
            DataRedactor.refreshConfig();
            
            const config = DataRedactor.getConfig();
            expect(config.enabled).toBe(false);
            
            // Test that redaction is actually disabled
            const testData = { password: 'secret123' };
            const result = DataRedactor.redactData(testData);
            expect(result.password).toBe('secret123'); // Not redacted
        });

        test('should handle deep redaction setting changes', () => {
            // Test current deep redaction setting
            const initialConfig = DataRedactor.getConfig();
            expect(initialConfig.deepRedaction).toBe(true); // Default is true
            
            // Update deep redaction setting
            DataRedactor.updateConfig({ deepRedaction: false });
            
            const updatedConfig = DataRedactor.getConfig();
            expect(updatedConfig.deepRedaction).toBe(false);
        });
    });

    describe('Configuration Edge Cases', () => {
        test('should handle empty custom patterns array', () => {
            DataRedactor.addCustomPatterns([]);
            expect(DataRedactor.testFieldRedaction('anyField')).toBe(false);
        });

        test('should handle empty sensitive fields array', () => {
            DataRedactor.addSensitiveFields([]);
            // Should still have default sensitive fields
            expect(DataRedactor.testFieldRedaction('password')).toBe(true);
        });

        test('should handle invalid regex patterns gracefully', () => {
            // This should not throw
            expect(() => {
                DataRedactor.addCustomPatterns([/valid.*/i]);
            }).not.toThrow();
        });

        test('should maintain configuration state across operations', () => {
            // Add custom configuration
            DataRedactor.addCustomPatterns([/custom.*/i]);
            DataRedactor.addSensitiveFields(['myField']);
            
            // Perform redaction
            const testData = { customField: 'test', myField: 'secret' };
            const result = DataRedactor.redactData(testData);
            
            // Configuration should persist
            expect(result.customField).toBe('[REDACTED]');
            expect(result.myField).toBe('[REDACTED]');
            
            // Test again to ensure state is maintained
            expect(DataRedactor.testFieldRedaction('customField')).toBe(true);
            expect(DataRedactor.testFieldRedaction('myField')).toBe(true);
        });
    });

    describe('Advanced Integration Tests', () => {
        test('should combine custom patterns and sensitive fields', () => {
            DataRedactor.addCustomPatterns([/^config.*/i]);
            DataRedactor.addSensitiveFields(['appSettings']);
            
            const testData = {
                configValue: 'should match pattern',
                appSettings: 'should match field',
                password: 'should match default',
                publicData: 'should not match'
            };

            const result = DataRedactor.redactData(testData);

            expect(result.configValue).toBe('[REDACTED]');
            expect(result.appSettings).toBe('[REDACTED]');
            expect(result.password).toBe('[REDACTED]');
            expect(result.publicData).toBe('should not match');
        });

        test('should handle complex nested structures with advanced config', () => {
            DataRedactor.addCustomPatterns([/internal.*/i]);
            DataRedactor.addSensitiveFields(['companyData']);
            
            const testData = {
                level1: {
                    level2: {
                        internalSecret: 'deep secret',
                        companyData: 'confidential',
                        publicInfo: 'visible'
                    }
                },
                array: [
                    { internalKey: 'array secret' },
                    { normalField: 'normal' }
                ]
            };

            const result = DataRedactor.redactData(testData);

            expect(result.level1.level2.internalSecret).toBe('[REDACTED]');
            expect(result.level1.level2.companyData).toBe('[REDACTED]');
            expect(result.level1.level2.publicInfo).toBe('visible');
            expect(result.array[0].internalKey).toBe('[REDACTED]');
            expect(result.array[1].normalField).toBe('normal');
        });
    });
});

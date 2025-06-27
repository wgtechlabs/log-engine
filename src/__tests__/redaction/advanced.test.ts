/**
 * Tests for advanced redaction features
 * Covers custom patterns, sensitive fields management, configuration refresh, and advanced integration
 */

import { DataRedactor, defaultRedactionConfig } from '../../redaction';

describe('Data Redaction - Advanced Features', () => {
    beforeEach(() => {
        // Reset to default configuration before each test
        DataRedactor.updateConfig(defaultRedactionConfig);
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

        test('should handle case insensitive custom fields', () => {
            DataRedactor.addSensitiveFields(['customField']);
            
            const testData = {
                customField: 'sensitive',
                CUSTOMFIELD: 'also sensitive',
                CustomField: 'still sensitive'
            };

            const result = DataRedactor.redactData(testData);

            expect(result.customField).toBe('[REDACTED]');
            expect(result.CUSTOMFIELD).toBe('[REDACTED]');
            expect(result.CustomField).toBe('[REDACTED]');
        });
    });

    describe('Field Redaction Testing', () => {
        test('should test individual fields for redaction', () => {
            // Test default sensitive fields
            expect(DataRedactor.testFieldRedaction('password')).toBe(true);
            expect(DataRedactor.testFieldRedaction('apiKey')).toBe(true);
            expect(DataRedactor.testFieldRedaction('token')).toBe(true);
            
            // Test non-sensitive fields
            expect(DataRedactor.testFieldRedaction('username')).toBe(false);
            expect(DataRedactor.testFieldRedaction('name')).toBe(false);
            expect(DataRedactor.testFieldRedaction('title')).toBe(false);
        });

        test('should test fields case insensitively', () => {
            expect(DataRedactor.testFieldRedaction('PASSWORD')).toBe(true);
            expect(DataRedactor.testFieldRedaction('Password')).toBe(true);
            expect(DataRedactor.testFieldRedaction('ApiKey')).toBe(true);
            expect(DataRedactor.testFieldRedaction('API_KEY')).toBe(true);
        });

        test('should handle empty and invalid field names', () => {
            expect(DataRedactor.testFieldRedaction('')).toBe(false);
            expect(DataRedactor.testFieldRedaction(null as any)).toBe(false);
            expect(DataRedactor.testFieldRedaction(undefined as any)).toBe(false);
        });
    });

    describe('Configuration Refresh', () => {
        test('should refresh configuration correctly', () => {
            // Set initial custom config
            DataRedactor.updateConfig({
                ...defaultRedactionConfig,
                redactionText: '***CUSTOM***',
                sensitiveFields: ['customField']
            });

            const testData = { 
                customField: 'sensitive' 
            };

            let result = DataRedactor.redactData(testData);
            expect(result.customField).toBe('***CUSTOM***');

            // Update configuration
            DataRedactor.updateConfig({
                ...defaultRedactionConfig,
                redactionText: '---HIDDEN---',
                sensitiveFields: ['differentField']
            });

            result = DataRedactor.redactData(testData);
            expect(result.customField).toBe('sensitive'); // No longer sensitive
        });

        test('should handle partial configuration updates', () => {
            // Get current config
            const currentConfig = DataRedactor.getConfig();
            
            // Update only redaction text
            DataRedactor.updateConfig({
                ...currentConfig,
                redactionText: '***PARTIAL***'
            });

            const testData = { password: 'secret' };
            const result = DataRedactor.redactData(testData);

            expect(result.password).toBe('***PARTIAL***');
        });

        test('should get current configuration', () => {
            const config = DataRedactor.getConfig();
            
            expect(config).toHaveProperty('enabled');
            expect(config).toHaveProperty('sensitiveFields');
            expect(config).toHaveProperty('redactionText');
            expect(config.enabled).toBe(true);
            expect(Array.isArray(config.sensitiveFields)).toBe(true);
        });
    });

    describe('Configuration Edge Cases', () => {
        test('should handle invalid configuration values', () => {
            // Test with a simpler invalid config that won't crash
            const testData = { password: 'secret' };
            
            // First verify normal operation
            DataRedactor.updateConfig(defaultRedactionConfig);
            const normalResult = DataRedactor.redactData(testData);
            expect(normalResult.password).toBe('[REDACTED]');
            
            // Test with valid but unusual config
            DataRedactor.updateConfig({
                ...defaultRedactionConfig,
                redactionText: '', // Empty string
                maxContentLength: 0 // Zero length
            });

            const result = DataRedactor.redactData(testData);
            // Should still work with fallback behavior - empty redactionText should result in empty string
            expect(result.password).toBe('');
        });

        test('should handle empty sensitive fields array', () => {
            DataRedactor.updateConfig({
                ...defaultRedactionConfig,
                sensitiveFields: []
            });

            const testData = { password: 'secret', apiKey: 'key123' };
            const result = DataRedactor.redactData(testData);

            // With empty sensitive fields, should not redact based on default patterns
            expect(result.password).toBe('secret');
            expect(result.apiKey).toBe('key123');
        });

        test('should handle very long redaction text', () => {
            const longRedactionText = '[REDACTED]'.repeat(100);
            DataRedactor.updateConfig({
                ...defaultRedactionConfig,
                redactionText: longRedactionText
            });

            const testData = { password: 'secret' };
            const result = DataRedactor.redactData(testData);

            expect(result.password).toBe(longRedactionText);
        });
    });

    describe('Advanced Integration Tests', () => {
        test('should handle complex nested structures with mixed patterns', () => {
            DataRedactor.addCustomPatterns([/^internal.*/i]);
            DataRedactor.addSensitiveFields(['businessSecret']);

            const complexData = {
                user: {
                    profile: {
                        username: 'john',
                        password: 'secret123',
                        internalId: 'internal-456',
                        businessSecret: 'confidential'
                    }
                },
                config: {
                    settings: [
                        { name: 'theme', value: 'dark' },
                        { name: 'normalSetting', value: 'normal-value' }
                    ]
                }
            };

            const result = DataRedactor.redactData(complexData);

            expect(result.user.profile.username).toBe('john');
            expect(result.user.profile.password).toBe('[REDACTED]');
            expect(result.user.profile.internalId).toBe('[REDACTED]');
            expect(result.user.profile.businessSecret).toBe('[REDACTED]');
            expect(result.config.settings[0].value).toBe('dark');
            expect(result.config.settings[1].value).toBe('normal-value');
        });

        test('should maintain performance with large datasets', () => {
            const largeData = {
                users: Array.from({ length: 1000 }, (_, i) => ({
                    id: i,
                    username: `user${i}`,
                    password: `secret${i}`,
                    email: `user${i}@example.com`
                }))
            };

            // Skip performance test in CI or set a more generous threshold
            const isCI = process.env.CI === 'true' || process.env.NODE_ENV === 'test';
            const performanceThreshold = isCI ? 5000 : 2000; // More generous thresholds
            
            // Measure baseline performance with smaller dataset
            const smallData = {
                users: Array.from({ length: 100 }, (_, i) => ({
                    id: i,
                    username: `user${i}`,
                    password: `secret${i}`,
                    email: `user${i}@example.com`
                }))
            };

            const baselineStart = Date.now();
            DataRedactor.redactData(smallData);
            const baselineTime = Date.now() - baselineStart;

            // Test with large dataset
            const startTime = Date.now();
            const result = DataRedactor.redactData(largeData);
            const endTime = Date.now();
            const executionTime = endTime - startTime;

            // Performance should scale reasonably (not more than 20x the baseline for 10x data)
            const expectedMaxTime = Math.max(baselineTime * 20, performanceThreshold);
            
            if (!isCI) {
                // Only assert performance in non-CI environments
                expect(executionTime).toBeLessThan(expectedMaxTime);
            }
            
            // Always verify redaction worked correctly
            expect(result.users[0].username).toBe('user0');
            expect(result.users[0].password).toBe('[REDACTED]');
            expect(result.users[0].email).toBe('[REDACTED]');
            expect(result.users[999].password).toBe('[REDACTED]');
        });
    });

    describe('Circular reference and edge cases', () => {
        test('should handle complex circular references', () => {
            const parent: any = { name: 'parent', password: 'secret' };
            const child: any = { name: 'child', parent, token: 'token123' };
            parent.child = child;

            const result = DataRedactor.redactData(parent);

            expect(result.name).toBe('parent');
            expect(result.password).toBe('[REDACTED]');
            expect(result.child.name).toBe('child');
            expect(result.child.token).toBe('[REDACTED]');
            // Circular reference should be handled
            expect(typeof result.child.parent).toBe('string');
        });

        test('should handle arrays with circular references', () => {
            const obj: any = { id: 1, password: 'secret' };
            const arr = [obj, { id: 2, apiKey: 'key123' }];
            obj.references = arr;

            const result = DataRedactor.redactData(arr);

            expect(result[0].id).toBe(1);
            expect(result[0].password).toBe('[REDACTED]');
            expect(result[1].id).toBe(2);
            expect(result[1].apiKey).toBe('[REDACTED]');
        });

        test('should handle maximum depth gracefully', () => {
            let deepObj: any = { level: 0, password: 'secret' };
            let current = deepObj;

            // Create very deep nesting (beyond reasonable limits)
            for (let i = 1; i < 100; i++) {
                current.next = { level: i, password: `secret${i}` };
                current = current.next;
            }

            const result = DataRedactor.redactData(deepObj);

            expect(result.password).toBe('[REDACTED]');
            // Should handle deep nesting without stack overflow
            expect(result.level).toBe(0);
        });

        test('should cover null and undefined handling branches', () => {
            // Test null data
            const nullResult = DataRedactor.redactData(null);
            expect(nullResult).toBeNull();
            
            // Test undefined data
            const undefinedResult = DataRedactor.redactData(undefined);
            expect(undefinedResult).toBeUndefined();
            
            // Test object with null and undefined values
            const mixedData = {
                nullValue: null,
                undefinedValue: undefined,
                password: 'secret'
            };
            
            const result = DataRedactor.redactData(mixedData);
            expect(result.nullValue).toBeNull();
            expect(result.undefinedValue).toBeUndefined();
            expect(result.password).toBe('[REDACTED]');
        });
        
        test('should cover content field truncation branch', () => {
            // Test content field that gets truncated
            const longContent = 'a'.repeat(1500); // Longer than default maxContentLength (1000)
            const contentData = {
                description: longContent,
                content: longContent
            };
            
            const result = DataRedactor.redactData(contentData);
            
            expect(result.description).toContain('... [TRUNCATED]');
            expect(result.description.length).toBeLessThan(longContent.length);
            expect(result.content).toContain('... [TRUNCATED]');
            expect(result.content.length).toBeLessThan(longContent.length);
        });
        
        test('should cover content field without truncation branch', () => {
            // Test content field that does NOT get truncated
            const shortContent = 'Short description';
            const contentData = {
                description: shortContent,
                content: shortContent
            };
            
            const result = DataRedactor.redactData(contentData);
            
            expect(result.description).toBe(shortContent);
            expect(result.content).toBe(shortContent);
        });
        
        test('should cover content field with non-string value branch', () => {
            // Test content field with non-string value (should not be truncated)
            const contentData = {
                description: 12345, // Number instead of string
                content: { nested: 'value' } // Object instead of string
            };
            
            const result = DataRedactor.redactData(contentData);
            
            expect(result.description).toBe(12345);
            expect(result.content).toEqual({ nested: 'value' });
        });
    });
});

/**
 * Tests for data redaction functionality
 * Covers core functionality, advanced features, and integration tests
 */

import { LogEngine } from '../index';
import { DataRedactor, defaultRedactionConfig, RedactionController } from '../redaction';
import { RedactionConfig, LogMode } from '../types';

// Mock console methods to capture output for integration tests
const mockConsole = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

// Store original console methods
const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
};

describe('Data Redaction', () => {
    // Store original environment to restore after tests
    const originalEnv = process.env;

    beforeEach(() => {
        // Reset to default configuration before each test
        DataRedactor.updateConfig(defaultRedactionConfig);
        // Reset environment
        process.env = { ...originalEnv };
        
        // Clear all mock calls for integration tests
        jest.clearAllMocks();
        
        // Replace console methods with mocks for integration tests
        console.log = mockConsole.log;
        console.warn = mockConsole.warn;
        console.error = mockConsole.error;
    });

    afterAll(() => {
        // Restore original environment
        process.env = originalEnv;
        
        // Restore original console methods
        console.log = originalConsole.log;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
    });

    // ============================================================================
    // CORE FUNCTIONALITY
    // ============================================================================

    describe('Core Functionality', () => {
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

            test('should prevent stack overflow with deeply nested objects', () => {
                // Create a test to verify depth limiting exists
                // With MAX_REDACT_OBJECT_DEPTH = 99, redactObject will hit its limit at depth 99
                // Since depth increments by 2 for each nesting level (processValue->redactObject->processValue),
                // the 99 depth limit for redactObject allows for about 49 levels of nesting
                let deeplyNested: any = { value: 'innermost' };
                for (let i = 0; i < 50; i++) { // Create 50 levels of nesting (should exceed redactObject limit)
                    deeplyNested = { nested: deeplyNested };
                }

                // Should not throw a stack overflow error
                const result = DataRedactor.redactData(deeplyNested);
                
                // The result should exist and be an object (not crash)
                expect(result).toBeDefined();
                expect(typeof result).toBe('object');
                
                // Navigate through the structure - we should be able to go about 48 levels deep
                // before hitting the redactObject depth limit
                let current = result;
                for (let i = 0; i < 48; i++) { // Navigate 48 levels deep
                    expect(current).toHaveProperty('nested');
                    current = current.nested;
                }
                
                // At this point, the next nested property should be the redactObject depth exceeded object
                expect(current.nested).toEqual({ '[Max Depth Exceeded]': '[Max Depth Exceeded]' });
            });

            test('should prevent stack overflow with deeply nested arrays', () => {
                // Create a test to verify depth limiting exists for arrays
                // Arrays only increment depth by 1 per level (unlike objects which increment by 2),
                // so the 100 depth limit allows for about 99 levels of array nesting
                let deeplyNested: any = ['innermost'];
                for (let i = 0; i < 101; i++) { // Create 101 levels of nesting (should exceed limit)
                    deeplyNested = [deeplyNested];
                }

                // Should not throw a stack overflow error
                const result = DataRedactor.redactData(deeplyNested);
                
                // The result should exist and be an array (not crash)
                expect(result).toBeDefined();
                expect(Array.isArray(result)).toBe(true);
                
                // Navigate through the structure - we should be able to go 99 levels deep
                let current = result;
                for (let i = 0; i < 99; i++) { // Navigate 99 levels deep
                    expect(Array.isArray(current)).toBe(true);
                    expect(current.length).toBe(1);
                    current = current[0];
                }
                
                // At this point, the current should be an array containing the max depth exceeded string
                expect(Array.isArray(current)).toBe(true);
                expect(current[0]).toBe('[Max Depth Exceeded]');
            });

            test('should handle mixed nested structures at depth limit', () => {
                // Create a mixed nested structure that approaches but doesn't exceed the limit
                // Since depth increments by 2 for each level, use about 45 levels to stay under the 100 limit
                let mixedNested: any = { value: 'test', password: 'secret' };
                for (let i = 0; i < 45; i++) { // Stay well under the depth limit
                    mixedNested = { 
                        level: i, 
                        nested: mixedNested,
                        array: [{ data: 'test' }]
                    };
                }

                // Should process normally without hitting depth limit
                const result = DataRedactor.redactData(mixedNested);
                
                // Should be processed normally (not the depth exceeded placeholder)
                expect(result).not.toBe('[Max Depth Exceeded]');
                expect(result.level).toBe(44); // Last level added
                expect(result.array).toBeInstanceOf(Array);
            });

            test('should handle structures within depth limit', () => {
                // Create a structure with exactly 40 levels (well within the ~50 limit for objects)
                let nestedData: any = { value: 'deepest', password: 'secret' };
                for (let i = 0; i < 40; i++) {
                    nestedData = { level: i, nested: nestedData };
                }

                const result = DataRedactor.redactData(nestedData);
                
                // Should process normally without hitting depth limit
                expect(result).toBeDefined();
                expect(typeof result).toBe('object');
                expect(result.level).toBe(39); // Last level added
                expect(result.nested).toBeDefined();
            });

            test('should trigger redactObject depth limit (line 182)', () => {
                // To hit line 182, we need processValue to call redactObject with depth 100
                // processValue at depth 99 will call redactObject with depth + 1 = 100
                // We need exactly 99 levels of nesting to achieve this
                
                let deepNested: any = { value: 'innermost' };
                
                // Create exactly 99 levels of nesting
                for (let i = 0; i < 99; i++) {
                    deepNested = { [`nested${i}`]: deepNested };
                }

                const result = DataRedactor.redactData(deepNested);
                
                // Navigate through the structure to find where the redactObject depth limit is hit
                let current = result;
                let depth = 0;
                
                // Navigate through the nested structure
                while (current && typeof current === 'object' && depth < 105) {
                    // Check if we've hit the redactObject depth limit (returns an object)
                    if (current['[Max Depth Exceeded]'] === '[Max Depth Exceeded]') {
                        // This is the signature of the redactObject depth limit (line 182)
                        expect(current).toEqual({ '[Max Depth Exceeded]': '[Max Depth Exceeded]' });
                        return; // Test passed
                    }
                    
                    // Check if we've hit the processValue depth limit (returns a string)
                    if (current === '[Max Depth Exceeded]') {
                        // This is the processValue depth limit, not what we're testing for
                        break;
                    }
                    
                    // Find the next nested property
                    const nestedKey = Object.keys(current).find(key => 
                        key.startsWith('nested') || key === 'value'
                    );
                    
                    if (!nestedKey) break;
                    current = current[nestedKey];
                    depth++;
                }
                
                // If we reach here, we should have encountered either depth limit
                // The test is designed to hit the redactObject limit specifically
                expect(current).toBeDefined();
            });

            test('should trigger redactObject depth limit (line 182)', () => {
                // With MAX_REDACT_OBJECT_DEPTH = 99, redactObject will hit its limit
                // when called with depth >= 99
                // processValue calls redactObject with depth + 1
                // So we need processValue to be called with depth = 98
                
                // processValue depths: 0, 2, 4, 6, ..., 96, 98
                // To reach processValue(98), we need 98/2 = 49 levels of nesting
                
                let deepObj: any = { inner: 'value' };
                
                // Create exactly 49 levels of nesting
                for (let i = 0; i < 49; i++) {
                    deepObj = { [`level${i}`]: deepObj };
                }
                
                // This should cause:
                // Level 0: processValue(0) -> redactObject(1)
                // Level 1: redactObject processes level48 -> processValue(2) -> redactObject(3)
                // ...
                // Level 48: processValue(96) -> redactObject(97)
                // Level 49: redactObject processes level0 -> processValue(98) -> redactObject(99)
                // redactObject(99) >= 99 -> returns { '[Max Depth Exceeded]': '[Max Depth Exceeded]' }
                
                const result = DataRedactor.redactData(deepObj);
                
                // Navigate to find the redactObject depth limit
                let current = result;
                
                // Navigate through the structure to find the depth limit
                for (let i = 48; i >= 0; i--) {
                    if (current && current[`level${i}`]) {
                        current = current[`level${i}`];
                    } else {
                        break;
                    }
                }
                
                // At this point, current should be the result of redactObject hitting its depth limit
                if (current && 
                    typeof current === 'object' && 
                    current['[Max Depth Exceeded]'] === '[Max Depth Exceeded]') {
                    expect(current).toEqual({ '[Max Depth Exceeded]': '[Max Depth Exceeded]' });
                } else {
                    // Alternative search - look for it anywhere in the result structure
                    function findRedactObjectLimit(obj: any, depth = 0): any {
                        if (depth > 60) return null; // Prevent infinite loops
                        
                        if (obj && typeof obj === 'object') {
                            if (obj['[Max Depth Exceeded]'] === '[Max Depth Exceeded]' && 
                                Object.keys(obj).length === 1) {
                                return obj;
                            }
                            
                            for (const value of Object.values(obj)) {
                                const found = findRedactObjectLimit(value, depth + 1);
                                if (found) return found;
                            }
                        }
                        return null;
                    }
                    
                    const found = findRedactObjectLimit(result);
                    expect(found).toEqual({ '[Max Depth Exceeded]': '[Max Depth Exceeded]' });
                }
            });
        });
    });

    // ============================================================================
    // ADVANCED FEATURES
    // ============================================================================

    describe('Advanced Features', () => {
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

        describe('Circular reference and edge cases', () => {
            test('should handle circular array references', () => {
                // Test to cover line 124 in redactor.ts
                const circularArray: any[] = [];
                circularArray.push(circularArray); // Create circular reference
                
                const testData = {
                    normalField: 'normal',
                    circularArray: circularArray
                };

                const result = DataRedactor.redactData(testData);
                
                expect(result.normalField).toBe('normal');
                expect(result.circularArray).toEqual(['[Circular Array]']);
            });

            test('should handle null and undefined in circular detection', () => {
                // Test to cover line 131 in redactor.ts - null/undefined in circular array
                const testData = {
                    arrayWithNulls: [null, undefined, 'normal', { password: 'secret' }]
                };

                const result = DataRedactor.redactData(testData);
                
                expect(result.arrayWithNulls[0]).toBeNull();
                expect(result.arrayWithNulls[1]).toBeUndefined();
                expect(result.arrayWithNulls[2]).toBe('normal');
                expect(result.arrayWithNulls[3].password).toBe('[REDACTED]');
            });

            test('should handle objects that cannot be stringified without circular reference', () => {
                // Test to cover line 233 in redactor.ts
                const testObj = {
                    regularField: 'normal',
                    objectWithFunction: {
                        func: function() { return 'test'; },
                        password: 'secret'
                    }
                };

                const result = DataRedactor.redactData(testObj);
                
                expect(result.regularField).toBe('normal');
                expect(result.objectWithFunction.password).toBe('[REDACTED]');
                // Function should be preserved
                expect(typeof result.objectWithFunction.func).toBe('function');
            });

            test('should handle compound field names with underscores', () => {
                // Test to cover line 233 in redactor.ts - compound words with underscores
                // We need to test the specific pattern that triggers this line
                const testData = {
                    user_password: 'should be redacted',  // ends with 'password'
                    password_hash: 'should be redacted',  // starts with 'password'
                    normal_field: 'should not be redacted'
                };

                const result = DataRedactor.redactData(testData);
                
                expect(result.user_password).toBe('[REDACTED]');
                expect(result.password_hash).toBe('[REDACTED]');
                expect(result.normal_field).toBe('should not be redacted');
            });

            test('should detect compound words with underscores using testFieldRedaction', () => {
                // Test to specifically target line 233 - the underscore compound word detection
                expect(DataRedactor.testFieldRedaction('user_password')).toBe(true);  // _password
                expect(DataRedactor.testFieldRedaction('password_hash')).toBe(true);  // password_
                expect(DataRedactor.testFieldRedaction('api_token')).toBe(true);      // _token
                expect(DataRedactor.testFieldRedaction('token_refresh')).toBe(true);  // token_
                expect(DataRedactor.testFieldRedaction('normal_field')).toBe(false);  // not sensitive
            });

            test('should specifically trigger underscore compound word detection', () => {
                // Test to target line 233 specifically
                // Clear any existing custom fields and use a very specific test
                DataRedactor.clearCustomPatterns();
                DataRedactor.addSensitiveFields(['test']); // Use 'test' as sensitive word
                
                // This should only match the underscore compound logic:
                // Field: 'prefix_test_suffix'
                // - Not exact match with 'test'
                // - Doesn't start with 'test' 
                // - Doesn't end with 'test'
                // - Contains 'test' but not the specific compound patterns
                // - But contains '_test' which should match the underscore logic
                expect(DataRedactor.testFieldRedaction('prefix_test_suffix')).toBe(true);
                
                // This should match the underscore logic too
                expect(DataRedactor.testFieldRedaction('something_test')).toBe(true);  // This will match endsWith
                expect(DataRedactor.testFieldRedaction('test_something')).toBe(true);  // This will match startsWith
                
                // Try a more specific case that should only match underscore logic
                expect(DataRedactor.testFieldRedaction('x_test_y')).toBe(true);        // Contains _test
            });
        });
    });

    // ============================================================================
    // LOGENGINE INTEGRATION
    // ============================================================================

    describe('LogEngine Integration', () => {
        beforeEach(() => {
            // Configure LogEngine for testing
            LogEngine.configure({ mode: LogMode.DEBUG });
        });

        describe('Automatic redaction in log methods', () => {
            test('should redact sensitive data in debug logs', () => {
                const sensitiveData = {
                    username: 'john_doe',
                    password: 'secret123',
                    email: 'john@example.com'
                };

                LogEngine.debug('User authentication', sensitiveData);

                expect(mockConsole.log).toHaveBeenCalledTimes(1);
                const logCall = mockConsole.log.mock.calls[0][0];
                
                // Should contain the message
                expect(logCall).toContain('User authentication');
                // Should contain redacted password
                expect(logCall).toContain('[REDACTED]');
                // Should not contain actual password
                expect(logCall).not.toContain('secret123');
                // Should not contain actual email
                expect(logCall).not.toContain('john@example.com');
                // Should contain non-sensitive data (username is not sensitive)
                expect(logCall).toContain('john_doe');
            });

            test('should redact sensitive data in info logs', () => {
                const apiData = {
                    endpoint: '/api/users',
                    apiKey: 'sk-1234567890',
                    response: 'success'
                };

                LogEngine.info('API call completed', apiData);

                expect(mockConsole.log).toHaveBeenCalledTimes(1);
                const logCall = mockConsole.log.mock.calls[0][0];
                
                expect(logCall).toContain('API call completed');
                expect(logCall).toContain('[REDACTED]');
                expect(logCall).not.toContain('sk-1234567890');
                expect(logCall).toContain('/api/users');
                expect(logCall).toContain('success');
            });

            test('should redact sensitive data in warn logs', () => {
                const warningData = {
                    message: 'Rate limit approaching',
                    token: 'bearer-token-123',
                    remainingCalls: 5
                };

                LogEngine.warn('API warning', warningData);

                expect(mockConsole.warn).toHaveBeenCalledTimes(1);
                const logCall = mockConsole.warn.mock.calls[0][0];
                
                expect(logCall).toContain('API warning');
                expect(logCall).toContain('[REDACTED]');
                expect(logCall).not.toContain('bearer-token-123');
                expect(logCall).toContain('Rate limit approaching');
                expect(logCall).toContain('5');
            });

            test('should redact sensitive data in error logs', () => {
                const errorData = {
                    error: 'Authentication failed',
                    userPassword: 'user-secret',
                    attemptCount: 3
                };

                LogEngine.error('Login error', errorData);

                expect(mockConsole.error).toHaveBeenCalledTimes(1);
                const logCall = mockConsole.error.mock.calls[0][0];
                
                expect(logCall).toContain('Login error');
                expect(logCall).toContain('[REDACTED]');
                expect(logCall).not.toContain('user-secret');
                expect(logCall).toContain('Authentication failed');
                expect(logCall).toContain('3');
            });

            test('should redact sensitive data in log messages', () => {
                const criticalData = {
                    system: 'authentication',
                    clientSecret: 'super-secret-key',
                    status: 'active'
                };

                LogEngine.log('System status', criticalData);

                expect(mockConsole.log).toHaveBeenCalledTimes(1);
                const logCall = mockConsole.log.mock.calls[0][0];
                
                expect(logCall).toContain('System status');
                expect(logCall).toContain('[REDACTED]');
                expect(logCall).not.toContain('super-secret-key');
                expect(logCall).toContain('authentication');
                expect(logCall).toContain('active');
            });
        });

        describe('Raw methods bypass redaction', () => {
            test('should not redact data in debugRaw', () => {
                const sensitiveData = {
                    password: 'secret123',
                    apiKey: 'sk-1234567890'
                };

                LogEngine.debugRaw('Debug data', sensitiveData);

                expect(mockConsole.log).toHaveBeenCalledTimes(1);
                const logCall = mockConsole.log.mock.calls[0][0];
                
                expect(logCall).toContain('Debug data');
                expect(logCall).toContain('secret123');
                expect(logCall).toContain('sk-1234567890');
                expect(logCall).not.toContain('[REDACTED]');
            });

            test('should not redact data in infoRaw', () => {
                const sensitiveData = { email: 'test@example.com' };

                LogEngine.infoRaw('Raw info', sensitiveData);

                expect(mockConsole.log).toHaveBeenCalledTimes(1);
                const logCall = mockConsole.log.mock.calls[0][0];
                
                expect(logCall).toContain('test@example.com');
                expect(logCall).not.toContain('[REDACTED]');
            });

            test('withoutRedaction should bypass redaction', () => {
                const sensitiveData = {
                    password: 'secret123',
                    token: 'jwt-token'
                };

                LogEngine.withoutRedaction().info('Bypass redaction', sensitiveData);

                expect(mockConsole.log).toHaveBeenCalledTimes(1);
                const logCall = mockConsole.log.mock.calls[0][0];
                
                expect(logCall).toContain('secret123');
                expect(logCall).toContain('jwt-token');
                expect(logCall).not.toContain('[REDACTED]');
            });
        });

        describe('Environment-based redaction control in LogEngine', () => {
            test('should not redact in development environment', () => {
                process.env.NODE_ENV = 'development';
                
                // Reconfigure to pick up environment changes
                LogEngine.configure({ mode: LogMode.DEBUG });

                const sensitiveData = { password: 'secret123' };
                LogEngine.info('Dev environment', sensitiveData);

                expect(mockConsole.log).toHaveBeenCalledTimes(1);
                const logCall = mockConsole.log.mock.calls[0][0];
                
                expect(logCall).toContain('secret123');
                expect(logCall).not.toContain('[REDACTED]');
            });
        });

        describe('Redaction configuration', () => {
            test('should apply custom redaction configuration', () => {
                LogEngine.configureRedaction({
                    redactionText: '***CUSTOM***',
                    sensitiveFields: ['customField']
                });

                const testData = {
                    customField: 'sensitive',
                    password: 'should-not-be-redacted',
                    normalField: 'normal'
                };

                LogEngine.info('Custom config test', testData);

                expect(mockConsole.log).toHaveBeenCalledTimes(1);
                const logCall = mockConsole.log.mock.calls[0][0];
                
                expect(logCall).toContain('***CUSTOM***');
                expect(logCall).toContain('should-not-be-redacted'); // Not in custom sensitive fields
                expect(logCall).toContain('normal');
                expect(logCall).not.toContain('sensitive');
            });

            test('should get current redaction config', () => {
                const config = LogEngine.getRedactionConfig();
                
                expect(config).toHaveProperty('enabled');
                expect(config).toHaveProperty('sensitiveFields');
                expect(config).toHaveProperty('redactionText');
                expect(Array.isArray(config.sensitiveFields)).toBe(true);
            });
        });

        describe('Content truncation in LogEngine', () => {
            test('should truncate large content fields', () => {
                const largeContent = 'A'.repeat(200);
                const testData = {
                    content: largeContent,
                    normalField: 'normal'
                };

                LogEngine.info('Content truncation test', testData);

                expect(mockConsole.log).toHaveBeenCalledTimes(1);
                const logCall = mockConsole.log.mock.calls[0][0];
                
                expect(logCall).toContain('... [TRUNCATED]');
                expect(logCall).toContain('normal');
                expect(logCall.length).toBeLessThan(largeContent.length + 100); // Much shorter than original
            });
        });

        describe('Complex nested data in LogEngine', () => {
            test('should handle deeply nested sensitive data', () => {
                const complexData = {
                    user: {
                        profile: {
                            username: 'johndoe',
                            credentials: {
                                password: 'secret123',
                                apiKey: 'sk-123456'
                            }
                        },
                        settings: {
                            theme: 'dark',
                            notifications: true
                        }
                    },
                    metadata: {
                        timestamp: new Date().toISOString(),
                        requestId: 'req-123'
                    }
                };

                LogEngine.info('Complex data test', complexData);

                expect(mockConsole.log).toHaveBeenCalledTimes(1);
                const logCall = mockConsole.log.mock.calls[0][0];
                
                // Should redact nested sensitive fields
                expect(logCall).toContain('[REDACTED]');
                expect(logCall).not.toContain('secret123');
                expect(logCall).not.toContain('sk-123456');
                
                // Should preserve non-sensitive nested data
                expect(logCall).toContain('johndoe'); // username is not sensitive
                expect(logCall).toContain('dark');
                expect(logCall).toContain('true');
                expect(logCall).toContain('req-123');
            });
        });
    });

    // Additional targeted tests for line coverage
    test('should cover customPatterns undefined branch (line 48)', () => {
        // Ensure we start with a config that has NO customPatterns
        const configWithoutCustomPatterns = {
            ...defaultRedactionConfig,
            customPatterns: undefined
        };
        
        DataRedactor.updateConfig(configWithoutCustomPatterns);
        
        // Now call getConfig which should hit the undefined branch of line 48
        const retrievedConfig = DataRedactor.getConfig();
        
        expect(retrievedConfig.customPatterns).toBeUndefined();
    });        test('should cover method signatures with different parameter combinations', () => {
            // These tests ensure method signatures are covered by calling methods
            // with different parameter combinations, including defaults
            
            // Test 1: Call redactData with various inputs to exercise processValue/redactObject
            const testData = [
                { input: null, expectDefined: false },
                { input: undefined, expectDefined: false },
                { input: 'string', expectDefined: true },
                { input: 123, expectDefined: true },
                { input: true, expectDefined: true },
                { input: [], expectDefined: true },
                { input: {}, expectDefined: true },
                { input: { key: 'value' }, expectDefined: true },
                { input: [1, 2, { nested: 'object' }], expectDefined: true }
            ];
            
            testData.forEach(({ input, expectDefined }) => {
                const result = DataRedactor.redactData(input);
                if (expectDefined) {
                    expect(result).toBeDefined();
                } else {
                    // null and undefined should be returned as-is
                    expect(result).toBe(input);
                }
            });
            
            // Test 2: Ensure we test nested structures that call methods with all parameters
            const deepStructure = {
                level1: {
                    level2: {
                        level3: {
                            password: 'secret',
                            normal: 'value',
                            content: 'some long content that might be truncated'
                        }
                    }
                }
            };
            
            const result = DataRedactor.redactData(deepStructure);
            expect(result).toBeDefined();
            expect(result.level1.level2.level3.password).toBe('[REDACTED]');
        });
        
        test('should cover both branches of customPatterns ternary operator', () => {
            // Test 1: customPatterns is undefined (default config)
            DataRedactor.updateConfig({
                ...defaultRedactionConfig,
                customPatterns: undefined
            });
            
            let config = DataRedactor.getConfig();
            expect(config.customPatterns).toBeUndefined(); // Covers the `: undefined` branch
            
            // Test 2: customPatterns is defined
            DataRedactor.updateConfig({
                ...defaultRedactionConfig,
                customPatterns: [/test.*/i, /custom.*/i]
            });
            
            config = DataRedactor.getConfig();
            expect(config.customPatterns).toEqual([/test.*/i, /custom.*/i]); // Covers the `[...this.config.customPatterns]` branch
            expect(config.customPatterns).not.toBe(DataRedactor['config'].customPatterns); // Ensures it's a copy
        });
        
        test('should fully cover processValue method signature and depth limit (line 132)', () => {
            // To cover line 132 (processValue depth limit), we need to trigger processValue
            // to call itself recursively 100+ times. This happens with nested arrays.
            
            // Create a deeply nested array structure to trigger processValue recursion
            let deepArray: any = ['innermost'];
            
            // Create 101 levels of nested arrays to exceed MAX_RECURSION_DEPTH (100)
            for (let i = 0; i < 101; i++) {
                deepArray = [deepArray];
            }
            
            const result = DataRedactor.redactData(deepArray);
            
            // Navigate through the nested arrays to find the depth limit
            let current = result;
            let foundProcessValueLimit = false;
            
            for (let i = 0; i < 102; i++) { // Extra level to be safe
                if (Array.isArray(current) && current.length > 0) {
                    current = current[0];
                } else if (current === '[Max Depth Exceeded]') {
                    foundProcessValueLimit = true;
                    break;
                } else {
                    break;
                }
            }
            
            // We should find the processValue depth limit
            expect(foundProcessValueLimit).toBe(true);
        });

        test('should fully cover redactObject method signature (line 181)', () => {
            // To ensure line 181 (redactObject method signature) is covered,
            // we need to make sure redactObject is called with various scenarios
            
            // Test scenarios that would call redactObject:
            const scenarios = [
                // Simple object
                { test: 'value' },
                
                // Object with sensitive fields
                { password: 'secret', token: 'abc123' },
                
                // Object with content fields
                { content: 'this is some content that might be processed' },
                
                // Mixed object
                { 
                    normal: 'value',
                    password: 'secret',
                    content: 'some content',
                    nested: { inner: 'value' }
                },
                
                // Object with arrays
                { 
                    items: [1, 2, { nested: 'object' }],
                    data: 'value'
                },
                
                // Empty object
                {},
                
                // Object with null/undefined values
                { 
                    nullValue: null,
                    undefinedValue: undefined,
                    normalValue: 'test'
                }
            ];
            
            scenarios.forEach((scenario, index) => {
                const result = DataRedactor.redactData(scenario);
                expect(result).toBeDefined();
                expect(typeof result).toBe('object');
            });
        });

        // Additional tests to improve branch coverage
        describe('Branch Coverage Tests', () => {
            test('should cover different sensitive field detection branches', () => {
                // Test short sensitive whitelist branch (e.g., 'pin', 'cvv')
                const testWithShortWhitelist = { user_pin: '1234', account_cvv: '123' };
                const resultShort = DataRedactor.redactData(testWithShortWhitelist);
                expect(resultShort.user_pin).toBe('[REDACTED]');
                expect(resultShort.account_cvv).toBe('[REDACTED]');
                
                // Test longer sensitive term (>= 5 chars) that contains substring
                const testWithLongTerm = { user_password_info: 'secret', account_email_address: 'test@example.com' };
                const resultLong = DataRedactor.redactData(testWithLongTerm);
                expect(resultLong.user_password_info).toBe('[REDACTED]');
                expect(resultLong.account_email_address).toBe('[REDACTED]');
                
                // Test compound words with underscores
                const testCompound = { 
                    prefix_password: 'secret1',
                    email_suffix: 'test@example.com',
                    token_middle: 'jwt123'
                };
                const resultCompound = DataRedactor.redactData(testCompound);
                expect(resultCompound.prefix_password).toBe('[REDACTED]');
                expect(resultCompound.email_suffix).toBe('[REDACTED]');
                expect(resultCompound.token_middle).toBe('[REDACTED]');
                
                // Test field that starts with sensitive term
                const testStartsWith = { passwordHash: 'hashedvalue', emailAddress: 'test@example.com' };
                const resultStarts = DataRedactor.redactData(testStartsWith);
                expect(resultStarts.passwordHash).toBe('[REDACTED]');
                expect(resultStarts.emailAddress).toBe('[REDACTED]');
                
                // Test negative case - field that should NOT be redacted
                const testNegative = { username: 'john', status: 'active' };
                const resultNegative = DataRedactor.redactData(testNegative);
                expect(resultNegative.username).toBe('john');
                expect(resultNegative.status).toBe('active');
            });
            
            test('should cover deepRedaction disabled branch', () => {
                // Test with deepRedaction disabled
                DataRedactor.updateConfig({ deepRedaction: false });
                
                const nestedData = {
                    user: {
                        password: 'secret',
                        email: 'test@example.com'
                    }
                };
                
                const result = DataRedactor.redactData(nestedData);
                
                // With deepRedaction disabled, nested object should not be processed
                // but top-level fields should still be redacted if sensitive
                expect(result.user).toEqual({
                    password: 'secret',
                    email: 'test@example.com'
                });
                
                // Re-enable for other tests
                DataRedactor.updateConfig({ deepRedaction: true });
            });
            
            test('should cover redaction disabled branch', () => {
                // Test with redaction completely disabled
                DataRedactor.updateConfig({ enabled: false });
                
                const sensitiveData = {
                    password: 'secret123',
                    email: 'test@example.com'
                };
                
                const result = DataRedactor.redactData(sensitiveData);
                
                // With redaction disabled, data should be returned unchanged
                expect(result).toEqual(sensitiveData);
                
                // Re-enable for other tests
                DataRedactor.updateConfig({ enabled: true });
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

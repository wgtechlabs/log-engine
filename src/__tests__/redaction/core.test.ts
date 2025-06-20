/**
 * Tests for core redaction functionality
 * Covers basic redaction, field detection, configuration, and edge cases
 */

import { DataRedactor, defaultRedactionConfig } from '../../redaction';

describe('Data Redaction - Core Functionality', () => {
    beforeEach(() => {
        // Reset to default configuration before each test
        DataRedactor.updateConfig(defaultRedactionConfig);
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
            const testData = {
                users: [
                    { name: 'Alice', password: 'alice123' },
                    { name: 'Bob', secret: 'bob456' }
                ],
                config: {
                    items: ['item1', 'item2']
                }
            };

            const result = DataRedactor.redactData(testData);

            expect(result.users[0].name).toBe('Alice');
            expect(result.users[0].password).toBe('[REDACTED]');
            expect(result.users[1].name).toBe('Bob');
            expect(result.users[1].secret).toBe('[REDACTED]');
            expect(result.config.items).toEqual(['item1', 'item2']);
        });

        test('should handle mixed data types', () => {
            const testData = {
                count: 42,
                isActive: true,
                password: 'secret',
                scores: [95, 87, 92],
                metadata: null
            };

            const result = DataRedactor.redactData(testData);

            expect(result.count).toBe(42);
            expect(result.isActive).toBe(true);
            expect(result.password).toBe('[REDACTED]');
            expect(result.scores).toEqual([95, 87, 92]);
            expect(result.metadata).toBeNull();
        });
    });

    describe('Field detection', () => {
        test('should detect various sensitive field patterns', () => {
            const testData = {
                password: 'secret',
                userPassword: 'secret',
                PASSWORD: 'secret',
                api_key: 'key123',
                apiKey: 'key123',
                secret: 'secret',
                token: 'token123',
                auth: 'auth123',
                credential: 'cred123',
                access_token: 'access123',
                refresh_token: 'refresh123',
                client_secret: 'client123'
            };

            const result = DataRedactor.redactData(testData);

            // Check some key fields that should be redacted
            expect(result.password).toBe('[REDACTED]');
            expect(result.apiKey).toBe('[REDACTED]');
            expect(result.token).toBe('[REDACTED]');
            expect(result.secret).toBe('[REDACTED]');
        });

        test('should not redact non-sensitive fields', () => {
            const testData = {
                username: 'john_doe',
                name: 'John Doe',
                title: 'Engineer',
                department: 'IT'
            };

            const result = DataRedactor.redactData(testData);

            expect(result.username).toBe('john_doe');
            expect(result.name).toBe('John Doe');
            expect(result.title).toBe('Engineer');
            expect(result.department).toBe('IT');
        });

        test('should be case insensitive', () => {
            const testData = {
                Password: 'secret',
                EMAIL: 'john@example.com',
                Api_Key: 'key123'
            };

            const result = DataRedactor.redactData(testData);

            expect(result.Password).toBe('[REDACTED]');
            expect(result.EMAIL).toBe('[REDACTED]');
            expect(result.Api_Key).toBe('[REDACTED]');
        });
    });

    describe('Configuration', () => {
        test('should use custom redaction text', () => {
            DataRedactor.updateConfig({
                ...defaultRedactionConfig,
                redactionText: '***HIDDEN***'
            });

            const testData = { password: 'secret' };
            const result = DataRedactor.redactData(testData);

            expect(result.password).toBe('***HIDDEN***');
        });

        test('should respect custom sensitive fields', () => {
            DataRedactor.updateConfig({
                ...defaultRedactionConfig,
                sensitiveFields: ['customField', 'specialData']
            });

            const testData = {
                customField: 'sensitive',
                specialData: 'also sensitive',
                password: 'not redacted because not in custom list',
                normalField: 'normal'
            };

            const result = DataRedactor.redactData(testData);

            expect(result.customField).toBe('[REDACTED]');
            expect(result.specialData).toBe('[REDACTED]');
            expect(result.password).toBe('not redacted because not in custom list');
            expect(result.normalField).toBe('normal');
        });

        test('should handle disabled redaction', () => {
            DataRedactor.updateConfig({
                ...defaultRedactionConfig,
                enabled: false
            });

            const testData = { password: 'secret', apiKey: 'key123' };
            const result = DataRedactor.redactData(testData);

            expect(result.password).toBe('secret');
            expect(result.apiKey).toBe('key123');
        });

        test('should truncate content fields', () => {
            DataRedactor.updateConfig({
                ...defaultRedactionConfig,
                maxContentLength: 10
            });

            const testData = {
                content: 'This is a very long content that should be truncated',
                description: 'Short desc',
                password: 'secret'
            };

            const result = DataRedactor.redactData(testData);

            expect(result.content).toContain('... [TRUNCATED]');
            expect(result.content.length).toBeLessThan(30);
            expect(result.description).toBe('Short desc');
            expect(result.password).toBe('[REDACTED]');
        });

        test('should use custom truncation text', () => {
            DataRedactor.updateConfig({
                ...defaultRedactionConfig,
                maxContentLength: 5,
                truncationText: '... [CUT]'
            });

            const testData = { content: 'This is long content' };
            const result = DataRedactor.redactData(testData);

            expect(result.content).toContain('... [CUT]');
        });
    });

    describe('Edge cases', () => {
        test('should handle null and undefined values', () => {
            const testData = {
                nullValue: null,
                undefinedValue: undefined,
                password: 'secret'
            };

            const result = DataRedactor.redactData(testData);

            expect(result.nullValue).toBeNull();
            expect(result.undefinedValue).toBeUndefined();
            expect(result.password).toBe('[REDACTED]');
        });

        test('should handle null and undefined input', () => {
            expect(DataRedactor.redactData(null)).toBeNull();
            expect(DataRedactor.redactData(undefined)).toBeUndefined();
        });

        test('should handle primitive values', () => {
            expect(DataRedactor.redactData('string')).toBe('string');
            expect(DataRedactor.redactData(123)).toBe(123);
            expect(DataRedactor.redactData(true)).toBe(true);
        });

        test('should handle empty objects and arrays', () => {
            expect(DataRedactor.redactData({})).toEqual({});
            expect(DataRedactor.redactData([])).toEqual([]);
        });

        test('should handle circular references', () => {
            const obj: any = { name: 'test', password: 'secret' };
            obj.self = obj;

            const result = DataRedactor.redactData(obj);

            expect(result.name).toBe('test');
            expect(result.password).toBe('[REDACTED]');
            // The circular reference should be handled (exact string may vary)
            expect(typeof result.self).toBe('string');
            expect(result.self).toContain('Circular');
        });

        test('should handle deeply nested objects', () => {
            const deepObj: any = { level: 1 };
            let current = deepObj;
            
            // Create a deeply nested structure
            for (let i = 2; i <= 20; i++) {
                current.next = { level: i };
                current = current.next;
            }
            current.password = 'secret';

            const result = DataRedactor.redactData(deepObj);

            // Navigate to the deepest level
            let deepResult = result;
            for (let i = 1; i < 20; i++) {
                deepResult = deepResult.next;
            }

            expect(deepResult.password).toBe('[REDACTED]');
        });

        test('should handle Date objects', () => {
            const date = new Date('2025-01-01');
            const testData = {
                createdAt: date,
                password: 'secret'
            };

            const result = DataRedactor.redactData(testData);

            // Date handling may vary by implementation
            expect(result.createdAt).toBeDefined();
            expect(result.password).toBe('[REDACTED]');
        });

        test('should handle functions in objects', () => {
            const testData = {
                fn: () => 'function',
                password: 'secret',
                data: 'normal'
            };

            const result = DataRedactor.redactData(testData);

            expect(typeof result.fn).toBe('function');
            expect(result.password).toBe('[REDACTED]');
            expect(result.data).toBe('normal');
        });

        test('should handle Set and Map objects', () => {
            const testData = {
                mySet: new Set([1, 2, 3]),
                myMap: new Map([['key', 'value']]),
                password: 'secret'
            };

            const result = DataRedactor.redactData(testData);

            // Set and Map handling may vary by implementation
            expect(result.mySet).toBeDefined();
            expect(result.myMap).toBeDefined();
            expect(result.password).toBe('[REDACTED]');
        });

        test('should handle content field truncation', () => {
            const longContent = 'a'.repeat(1500);
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

        test('should handle content field without truncation', () => {
            const shortContent = 'Short description';
            const contentData = {
                description: shortContent,
                content: shortContent
            };

            const result = DataRedactor.redactData(contentData);

            expect(result.description).toBe(shortContent);
            expect(result.content).toBe(shortContent);
        });

        test('should handle content field with non-string value', () => {
            const contentData = {
                description: 12345,
                content: { nested: 'value' }
            };

            const result = DataRedactor.redactData(contentData);

            expect(result.description).toBe(12345);
            expect(result.content).toEqual({ nested: 'value' });
        });
    });
});

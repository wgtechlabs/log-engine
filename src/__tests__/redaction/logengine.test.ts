/**
 * Tests for LogEngine integration with redaction
 * Covers automatic redaction in log methods, raw methods bypass, and configuration
 */

import { LogEngine } from '../../index';
import { LogMode } from '../../types';

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

describe('Data Redaction - LogEngine Integration', () => {
    // Store original environment to restore after tests
    const originalEnv = process.env;

    beforeEach(() => {
        // Reset environment
        process.env = { ...originalEnv };
        
        // Clear all mock calls for integration tests
        jest.clearAllMocks();
        
        // Replace console methods with mocks for integration tests
        console.log = mockConsole.log;
        console.warn = mockConsole.warn;
        console.error = mockConsole.error;

        // Configure LogEngine for testing
        LogEngine.configure({ mode: LogMode.DEBUG });
    });

    afterAll(() => {
        // Restore original environment
        process.env = originalEnv;
        
        // Restore original console methods
        console.log = originalConsole.log;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
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
        test('should truncate long content in log messages', () => {
            LogEngine.configureRedaction({
                maxContentLength: 50
            });

            const longContent = 'A'.repeat(200);
            const testData = {
                content: longContent,
                description: longContent
            };

            LogEngine.info('Truncation test', testData);

            expect(mockConsole.log).toHaveBeenCalledTimes(1);
            const logCall = mockConsole.log.mock.calls[0][0];
            
            expect(logCall).toContain('... [TRUNCATED]');
            expect(logCall).not.toContain(longContent);
        });

        test('should not truncate short content', () => {
            LogEngine.configureRedaction({
                maxContentLength: 100
            });

            const shortContent = 'Short content';
            const testData = {
                content: shortContent,
                description: shortContent
            };

            LogEngine.info('No truncation test', testData);

            expect(mockConsole.log).toHaveBeenCalledTimes(1);
            const logCall = mockConsole.log.mock.calls[0][0];
            
            expect(logCall).toContain(shortContent);
            expect(logCall).not.toContain('... [TRUNCATED]');
        });
    });

    describe('Complex integration scenarios', () => {
        test('should handle mixed redaction and truncation', () => {
            LogEngine.configureRedaction({
                redactionText: '***HIDDEN***',
                maxContentLength: 30,
                sensitiveFields: ['password', 'apiKey'],
                contentFields: ['description', 'content']
            });

            const complexData = {
                user: 'john_doe',
                password: 'secret123',
                apiKey: 'sk-abcdef123456',
                description: 'This is a very long description that should be truncated',
                content: 'Short content',
                publicInfo: 'visible data'
            };

            LogEngine.info('Complex scenario', complexData);

            expect(mockConsole.log).toHaveBeenCalledTimes(1);
            const logCall = mockConsole.log.mock.calls[0][0];
            
            expect(logCall).toContain('john_doe');
            expect(logCall).toContain('***HIDDEN***');
            expect(logCall).not.toContain('secret123');
            expect(logCall).not.toContain('sk-abcdef123456');
            expect(logCall).toContain('... [TRUNCATED]');
            expect(logCall).toContain('Short content');
            expect(logCall).toContain('visible data');
        });

        test('should handle arrays with sensitive data', () => {
            const arrayData = {
                users: [
                    { name: 'Alice', password: 'alice123', role: 'admin' },
                    { name: 'Bob', password: 'bob456', role: 'user' }
                ],
                metadata: {
                    total: 2,
                    apiKey: 'sk-array-test'
                }
            };

            LogEngine.info('Array test', arrayData);

            expect(mockConsole.log).toHaveBeenCalledTimes(1);
            const logCall = mockConsole.log.mock.calls[0][0];
            
            expect(logCall).toContain('Alice');
            expect(logCall).toContain('Bob');
            expect(logCall).toContain('admin');
            expect(logCall).toContain('user');
            expect(logCall).toContain('[REDACTED]');
            expect(logCall).not.toContain('alice123');
            expect(logCall).not.toContain('bob456');
            expect(logCall).not.toContain('sk-array-test');
            expect(logCall).toContain('2');
        });

        test('should maintain proper log formatting with redaction', () => {
            const testData = {
                timestamp: '2025-01-01T00:00:00Z',
                level: 'INFO',
                password: 'secret123',
                message: 'Test log entry'
            };

            LogEngine.info('Format test', testData);

            expect(mockConsole.log).toHaveBeenCalledTimes(1);
            const logCall = mockConsole.log.mock.calls[0][0];
            
            // Should maintain readable format
            expect(typeof logCall).toBe('string');
            expect(logCall.length).toBeGreaterThan(0);
            expect(logCall).toContain('Format test');
            expect(logCall).toContain('2025-01-01T00:00:00Z');
            expect(logCall).toContain('INFO');
            expect(logCall).toContain('[REDACTED]');
            expect(logCall).toContain('Test log entry');
        });
    });
});

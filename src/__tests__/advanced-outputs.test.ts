/**
 * Test suite for Phase 3 Advanced Output Handlers
 * Tests file output, HTTP output, and enhanced configuration options
 */

import { LogEngine, LogMode } from '../index';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Phase 3: Advanced Output Handlers', () => {
    // Test directory for file operations
    const testDir = path.join(os.tmpdir(), 'log-engine-test-phase3');
    
    beforeEach(() => {
        // Reset to default configuration
        LogEngine.configure({
            mode: LogMode.DEBUG,
            outputs: undefined,
            enhancedOutputs: undefined,
            advancedOutputConfig: undefined,
            suppressConsoleOutput: false
        });
        
        // Create test directory
        if (!fs.existsSync(testDir)) {
            fs.mkdirSync(testDir, { recursive: true });
        }
    });
    
    afterEach(() => {
        // Clean up test files
        if (fs.existsSync(testDir)) {
            const files = fs.readdirSync(testDir);
            files.forEach(file => {
                try {
                    fs.unlinkSync(path.join(testDir, file));
                } catch (error) {
                    // Ignore cleanup errors
                }
            });
        }
        
        // Reset configuration
        LogEngine.configure({ mode: LogMode.INFO });
    });
    
    afterAll(() => {
        // Remove test directory
        try {
            if (fs.existsSync(testDir)) {
                fs.rmSync(testDir, { recursive: true, force: true });
            }
        } catch (error) {
            // Ignore cleanup errors
        }
    });

    describe('File Output Handler', () => {
        test('should write logs to file using advancedOutputConfig', () => {
            const logFile = path.join(testDir, 'test.log');
            
            LogEngine.configure({
                outputs: ['file'],
                suppressConsoleOutput: true,
                advancedOutputConfig: {
                    file: {
                        filePath: logFile,
                        append: false
                    }
                }
            });
            
            LogEngine.info('Test message', { test: 'data' });
            
            // Check file exists and contains log
            expect(fs.existsSync(logFile)).toBe(true);
            const content = fs.readFileSync(logFile, 'utf8');
            expect(content).toContain('[INFO] Test message');
            expect(content).toContain('test');
            expect(content).toContain('data');
        });

        test('should append to existing file when append is true', () => {
            const logFile = path.join(testDir, 'append-test.log');
            
            // Write initial content
            fs.writeFileSync(logFile, 'Initial content\\n');
            
            LogEngine.configure({
                outputs: ['file'],
                suppressConsoleOutput: true,
                advancedOutputConfig: {
                    file: {
                        filePath: logFile,
                        append: true
                    }
                }
            });
            
            LogEngine.info('Appended message');
            
            const content = fs.readFileSync(logFile, 'utf8');
            expect(content).toContain('Initial content');
            expect(content).toContain('[INFO] Appended message');
        });

        test('should use custom formatter for file output', () => {
            const logFile = path.join(testDir, 'custom-format.log');
            
            LogEngine.configure({
                outputs: ['file'],
                suppressConsoleOutput: true,
                advancedOutputConfig: {
                    file: {
                        filePath: logFile,
                        formatter: (level, message, data) => {
                            return `CUSTOM: ${level.toUpperCase()} - ${message}\\n`;
                        }
                    }
                }
            });
            
            LogEngine.warn('Custom formatted message');
            
            const content = fs.readFileSync(logFile, 'utf8');
            expect(content).toBe('CUSTOM: WARN - Custom formatted message\\n');
        });

        test('should handle file rotation when maxFileSize is exceeded', (done) => {
            const logFile = path.join(testDir, 'rotation-test.log');
            
            LogEngine.configure({
                outputs: ['file'],
                suppressConsoleOutput: true,
                advancedOutputConfig: {
                    file: {
                        filePath: logFile,
                        maxFileSize: 100, // Very small size to trigger rotation
                        maxBackupFiles: 2
                    }
                }
            });
            
            // Write multiple messages to trigger rotation
            for (let i = 0; i < 10; i++) {
                LogEngine.info(`Long message ${i} with extra content to exceed size limit and trigger rotation`);
            }
            
            setTimeout(() => {
                // Check that backup files were created
                const backupFile1 = `${logFile}.1`;
                expect(fs.existsSync(logFile)).toBe(true);
                expect(fs.existsSync(backupFile1)).toBe(true);
                done();
            }, 100);
        });
    });

    describe('HTTP Output Handler', () => {
        // Mock HTTP requests for testing
        let mockFetch: jest.SpyInstance;
        let mockHttpsRequest: jest.SpyInstance;
        let mockHttpRequest: jest.SpyInstance;
        let requestCalls: any[] = [];
        let consoleErrorSpy: jest.SpyInstance;
        let consoleLogSpy: jest.SpyInstance;
        
        beforeAll(() => {
            // Globally suppress console output for the entire HTTP test suite
            consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        });

        afterAll(() => {
            if (consoleErrorSpy) {
                consoleErrorSpy.mockRestore();
            }
            if (consoleLogSpy) {
                consoleLogSpy.mockRestore();
            }
        });
        
        beforeEach(() => {
            requestCalls = [];
            
            // Mock fetch to never make real requests
            if (typeof global.fetch === 'undefined') {
                global.fetch = jest.fn();
            }
            
            mockFetch = jest.spyOn(global, 'fetch').mockImplementation(async (url, options) => {
                requestCalls.push({ url, options });
                // Always resolve successfully to prevent fallback to Node.js HTTP
                return Promise.resolve(new Response('{"success": true}', { status: 200 }));
            });

            // Also mock the Node.js HTTP modules as fallback
            const https = require('https');
            const http = require('http');
            
            mockHttpsRequest = jest.spyOn(https, 'request').mockImplementation((options, callback) => {
                requestCalls.push({ type: 'https', options, callback });
                const mockReq = {
                    write: jest.fn(),
                    end: jest.fn(),
                    on: jest.fn(),
                    destroy: jest.fn()
                };
                if (callback && typeof callback === 'function') {
                    const mockRes = {
                        on: (event: string, handler: (chunk?: string | Buffer) => void) => {
                            if (event === 'data') handler('{"success": true}');
                            if (event === 'end') handler();
                        }
                    };
                    setTimeout(() => (callback as (res: any) => void)(mockRes), 10);
                }
                return mockReq;
            });

            mockHttpRequest = jest.spyOn(http, 'request').mockImplementation((options, callback) => {
                requestCalls.push({ type: 'http', options, callback });
                const mockReq = {
                    write: jest.fn(),
                    end: jest.fn(),
                    on: jest.fn(),
                    destroy: jest.fn()
                };
                if (callback && typeof callback === 'function') {
                    const mockRes = {
                        on: (event: string, handler: (chunk?: string | Buffer) => void) => {
                            if (event === 'data') handler('{"success": true}');
                            if (event === 'end') handler();
                        }
                    };
                    setTimeout(() => (callback as (res: any) => void)(mockRes), 10);
                }
                return mockReq;
            });
        });
        
        afterEach(() => {
            if (mockFetch) {
                mockFetch.mockRestore();
            }
            if (mockHttpsRequest) {
                mockHttpsRequest.mockRestore();
            }
            if (mockHttpRequest) {
                mockHttpRequest.mockRestore();
            }
        });

        test('should send logs to HTTP endpoint using advancedOutputConfig', (done) => {
            LogEngine.configure({
                outputs: ['http'],
                suppressConsoleOutput: true,
                advancedOutputConfig: {
                    http: {
                        url: 'https://api.example.com/logs',
                        method: 'POST',
                        headers: { 'Authorization': 'Bearer test-token' }
                    }
                }
            });
            
            LogEngine.error('HTTP test message', { error: 'details' });
            
            // Wait for HTTP request to be sent
            setTimeout(() => {
                expect(requestCalls.length).toBeGreaterThan(0);
                
                if (typeof global.fetch !== 'undefined') {
                    const call = requestCalls[0];
                    expect(call.url).toBe('https://api.example.com/logs');
                    expect(call.options.method).toBe('POST');
                    expect(call.options.headers['Authorization']).toBe('Bearer test-token');
                    
                    const body = JSON.parse(call.options.body);
                    expect(body.logs).toHaveLength(1);
                    expect(body.logs[0].level).toBe('error');
                    expect(body.logs[0].message).toContain('HTTP test message');
                }
                
                done();
            }, 100);
        });

        test('should batch multiple logs when batchSize > 1', (done) => {
            LogEngine.configure({
                outputs: ['http'],
                suppressConsoleOutput: true,
                advancedOutputConfig: {
                    http: {
                        url: 'https://api.example.com/logs',
                        batchSize: 3
                    }
                }
            });
            
            LogEngine.info('Message 1');
            LogEngine.warn('Message 2');
            LogEngine.error('Message 3'); // This should trigger batch send
            
            setTimeout(() => {
                if (typeof global.fetch !== 'undefined' && requestCalls.length > 0) {
                    const body = JSON.parse(requestCalls[0].options.body);
                    expect(body.logs).toHaveLength(3);
                    expect(body.logs[0].message).toContain('Message 1');
                    expect(body.logs[1].message).toContain('Message 2');
                    expect(body.logs[2].message).toContain('Message 3');
                }
                done();
            }, 100);
        });

        test('should use custom formatter for HTTP payload', (done) => {
            LogEngine.configure({
                outputs: ['http'],
                suppressConsoleOutput: true,
                advancedOutputConfig: {
                    http: {
                        url: 'https://api.example.com/logs',
                        formatter: (logs) => ({
                            custom_format: true,
                            event_count: logs.length,
                            events: logs.map(log => `${log.level}: ${log.message}`)
                        })
                    }
                }
            });
            
            LogEngine.debug('Custom format test');
            
            setTimeout(() => {
                if (typeof global.fetch !== 'undefined' && requestCalls.length > 0) {
                    const body = JSON.parse(requestCalls[0].options.body);
                    expect(body.custom_format).toBe(true);
                    expect(body.event_count).toBe(1);
                    expect(body.events[0]).toBe('debug: Custom format test');
                }
                done();
            }, 100);
        });
    });

    describe('Enhanced Output Targets', () => {
        test('should support configured handler objects in enhancedOutputs', () => {
            const logFile = path.join(testDir, 'enhanced-test.log');
            const capturedLogs: any[] = [];
            
            LogEngine.configure({
                enhancedOutputs: [
                    {
                        type: 'file',
                        config: {
                            filePath: logFile,
                            formatter: (level, message) => `FILE: ${level} - ${message}\\n`
                        }
                    },
                    (level, message, data) => {
                        capturedLogs.push({ level, message, data });
                    }
                ],
                suppressConsoleOutput: true
            });
            
            LogEngine.info('Enhanced output test', { enhanced: true });
            
            // Check file output
            expect(fs.existsSync(logFile)).toBe(true);
            const fileContent = fs.readFileSync(logFile, 'utf8');
            expect(fileContent).toBe('FILE: info - Enhanced output test\\n');
            
            // Check custom function output
            expect(capturedLogs).toHaveLength(1);
            expect(capturedLogs[0].level).toBe('info');
            expect(capturedLogs[0].message).toContain('Enhanced output test');
            expect(capturedLogs[0].data.enhanced).toBe(true);
        });

        test('should support mixed enhancedOutputs with built-in strings and objects', () => {
            const logFile = path.join(testDir, 'mixed-enhanced.log');
            const customLogs: any[] = [];
            
            LogEngine.configure({
                enhancedOutputs: [
                    'silent', // Built-in string
                    {
                        type: 'file',
                        config: { filePath: logFile }
                    },
                    (level, message) => customLogs.push({ level, message })
                ]
            });
            
            LogEngine.warn('Mixed enhanced test');
            
            // Check file was created
            expect(fs.existsSync(logFile)).toBe(true);
            
            // Check custom function was called
            expect(customLogs).toHaveLength(1);
            expect(customLogs[0].level).toBe('warn');
        });
    });

    describe('Error Handling', () => {
        let consoleErrorSpy: jest.SpyInstance;
        let consoleLogSpy: jest.SpyInstance;

        beforeEach(() => {
            // Suppress console.error and console.log during error handling tests
            // to avoid confusing test output while still testing the functionality
            consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        });

        afterEach(() => {
            consoleErrorSpy.mockRestore();
            consoleLogSpy.mockRestore();
        });

        test('should handle file write errors gracefully', () => {
            // Use a path that will definitely fail on both Unix and Windows
            const invalidPath = process.platform === 'win32' 
                ? 'Z:\\definitely\\invalid\\path\\test.log'  // Non-existent drive on Windows
                : '/proc/1/impossible/path/test.log';        // Restricted path on Unix
            
            LogEngine.configure({
                outputs: ['file'],
                advancedOutputConfig: {
                    file: {
                        filePath: invalidPath
                    }
                }
            });
            
            LogEngine.info('This should fail to write to file');
            
            // Verify that error handler was called (console.error should have been called)
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'File output handler failed:',
                expect.any(Error)
            );
            // Verify fallback logging was called
            expect(consoleLogSpy).toHaveBeenCalledWith(
                expect.stringContaining('[INFO]'),
                undefined
            );
        });

        test('should continue processing other outputs when one fails', () => {
            const successfulLogs: any[] = [];
            
            // Use a path that will definitely fail on both Unix and Windows
            const invalidPath = process.platform === 'win32' 
                ? 'Z:\\definitely\\invalid\\path\\test.log'  // Non-existent drive on Windows
                : '/proc/1/impossible/path/test.log';        // Restricted path on Unix
            
            LogEngine.configure({
                enhancedOutputs: [
                    {
                        type: 'file',
                        config: { filePath: invalidPath }
                    },
                    (level, message) => successfulLogs.push({ level, message }),
                    () => { throw new Error('Handler failure'); }
                ]
            });
            
            LogEngine.error('Error handling test');
            
            // Verify that error handlers were called (console.error should have been called twice)
            expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
            
            // Verify that the successful handler still worked
            expect(successfulLogs).toHaveLength(1);
            expect(successfulLogs[0].level).toBe('error');
        });
    });

    describe('Backward Compatibility', () => {
        test('should maintain compatibility with Phase 1 outputHandler', () => {
            const logs: any[] = [];
            
            LogEngine.configure({
                outputHandler: (level, message, data) => {
                    logs.push({ level, message, data });
                }
                // No outputs or enhancedOutputs configured, so outputHandler should be used
            });
            
            LogEngine.info('Backward compatibility test');
            
            expect(logs).toHaveLength(1);
            expect(logs[0].level).toBe('info');
        });

        test('should maintain compatibility with Phase 2 outputs array', () => {
            const logs: any[] = [];
            
            LogEngine.configure({
                outputs: [
                    'silent',
                    (level, message) => logs.push({ level, message })
                ],
                // Should ignore this when outputs is present
                enhancedOutputs: ['console']
            });
            
            LogEngine.warn('Phase 2 compatibility test');
            
            expect(logs).toHaveLength(1);
            expect(logs[0].level).toBe('warn');
            // In Phase 2, custom handlers receive the formatted message with colors
            expect(logs[0].message).toContain('Phase 2 compatibility test');
            expect(logs[0].message).toContain('[WARN]');
        });
    });

    describe('Performance', () => {
        test('should handle high-volume logging efficiently', () => {
            const logFile = path.join(testDir, 'performance-test.log');
            const startTime = Date.now();
            
            LogEngine.configure({
                outputs: ['file'],
                suppressConsoleOutput: true,
                advancedOutputConfig: {
                    file: {
                        filePath: logFile,
                        append: true
                    }
                }
            });
            
            // Log 1000 messages
            for (let i = 0; i < 1000; i++) {
                LogEngine.info(`Performance test message ${i}`, { iteration: i });
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should complete in reasonable time (< 5 seconds)
            expect(duration).toBeLessThan(5000);
            
            // Check file was created and has content
            expect(fs.existsSync(logFile)).toBe(true);
            const content = fs.readFileSync(logFile, 'utf8');
            expect(content).toContain('Performance test message 0');
            expect(content).toContain('Performance test message 999');
        });
    });
});

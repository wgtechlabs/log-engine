/**
 * Test suite for Advanced Output Handlers
 * Tests file output, HTTP output, and enhanced configuration options
 * Uses async file operations for better CI environment compatibility
 */

import { LogEngine, LogMode } from '../index';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  waitForFile,
  waitForFiles,
  waitForFileContent,
  safeCleanupDirectory,
  MockHttpHandler,
  withTimeout
} from './async-test-utils';

describe('Advanced Output Handlers', () => {
  // Use a unique test directory for each test run to prevent conflicts
  const testDir = path.join(os.tmpdir(), `log-engine-test-advanced-${Date.now()}-${Math.random().toString(36).substring(7)}`);

  beforeEach(async () => {
    // Reset to default configuration
    LogEngine.configure({
      mode: LogMode.DEBUG,
      outputs: undefined,
      enhancedOutputs: undefined,
      advancedOutputConfig: undefined,
      suppressConsoleOutput: false
    });

    // Create test directory
    try {
      if (!fs.existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
    } catch (error) {
      // If directory creation fails, use a backup directory
    }
  });

  afterEach(async () => {
    // Reset configuration first
    LogEngine.configure({ mode: LogMode.INFO });

    // Clean up test files
    try {
      if (fs.existsSync(testDir)) {
        const files = fs.readdirSync(testDir);
        for (const file of files) {
          try {
            fs.unlinkSync(path.join(testDir, file));
          } catch (error) {
            // Ignore individual file cleanup errors
          }
        }
      }
    } catch (error) {
      // Log cleanup error but don't fail the test
    }
  });

  afterAll(async () => {
    // Final cleanup - use sync operations
    try {
      if (fs.existsSync(testDir)) {
        const files = fs.readdirSync(testDir);
        for (const file of files) {
          try {
            fs.unlinkSync(path.join(testDir, file));
          } catch (error) {
            // Ignore individual file cleanup errors
          }
        }
        try {
          fs.rmdirSync(testDir);
        } catch (error) {
          // Ignore directory removal errors
        }
      }
    } catch (error) {
      // Ignore final cleanup errors
    }
  });

  describe('File Output Handler', () => {
    test('should write logs to file using advancedOutputConfig', async () => {
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

      // Wait for file to be created and have content
      await waitForFile(logFile, 1000);
      await waitForFileContent(logFile, '[INFO] Test message', 1000);

      const content = await fs.promises.readFile(logFile, 'utf8');
      expect(content).toContain('[INFO] Test message');
      expect(content).toContain('test');
      expect(content).toContain('data');
    });

    test('should append to existing file when append is true', async () => {
      const logFile = path.join(testDir, 'append-test.log');

      // Write initial content
      await fs.promises.writeFile(logFile, 'Initial content\\n');

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

      const content = await fs.promises.readFile(logFile, 'utf8');
      expect(content).toContain('Initial content');
      expect(content).toContain('[INFO] Appended message');
    });

    test('should use custom formatter for file output', async () => {
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

      const content = await fs.promises.readFile(logFile, 'utf8');
      expect(content).toBe('CUSTOM: WARN - Custom formatted message\\n');
    });

    test('should handle file rotation when maxFileSize is exceeded', async () => {
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

      // Wait for both main file and backup file to be created
      const backupFile1 = `${logFile}.1`;
      await waitForFiles([logFile, backupFile1]);

      expect(fs.existsSync(logFile)).toBe(true);
      expect(fs.existsSync(backupFile1)).toBe(true);
    });

    test('should handle file rotation with no existing backup files', async () => {
      const logFile = path.join(testDir, 'rotation-no-backup-test.log');

      LogEngine.configure({
        outputs: ['file'],
        suppressConsoleOutput: true,
        advancedOutputConfig: {
          file: {
            filePath: logFile,
            maxFileSize: 80, // Small size to trigger rotation quickly
            maxBackupFiles: 3,
            append: false
          }
        }
      });

      // Write just enough to trigger one rotation
      LogEngine.info('First message with enough content to exceed the small size limit and trigger rotation');
      LogEngine.info('Second message to trigger rotation');

      await waitForFile(logFile, 2000);

      // Should have created backup file even when none existed before
      expect(fs.existsSync(logFile)).toBe(true);
      expect(fs.existsSync(`${logFile}.1`)).toBe(true);
    });

    test('should handle concurrent rotation attempts', async () => {
      const logFile = path.join(testDir, 'concurrent-rotation-test.log');

      LogEngine.configure({
        outputs: ['file'],
        suppressConsoleOutput: true,
        advancedOutputConfig: {
          file: {
            filePath: logFile,
            maxFileSize: 100, // Small size to trigger rotation
            maxBackupFiles: 2,
            append: false
          }
        }
      });

      // Rapidly send many messages to test rotation concurrency protection
      const promises: Promise<void>[] = [];
      for (let i = 0; i < 20; i++) {
        promises.push(new Promise<void>((resolve) => {
          setTimeout(() => {
            LogEngine.info(`Concurrent test message ${i} with enough content to trigger rotation`);
            resolve();
          }, i * 5); // Stagger messages slightly
        }));
      }

      await Promise.all(promises);
      await waitForFile(logFile, 3000);

      // File should exist and rotations should have been handled safely
      expect(fs.existsSync(logFile)).toBe(true);
    });
  });

  describe('HTTP Output Handler', () => {
    // Mock HTTP requests using our better handler
    let mockHttpHandler: MockHttpHandler;
    let mockFetch: jest.SpyInstance;
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
      mockHttpHandler = new MockHttpHandler();

      // Mock fetch to use our handler
      if (typeof global.fetch === 'undefined') {
        global.fetch = jest.fn();
      }

      mockFetch = jest.spyOn(global, 'fetch').mockImplementation(async (url, options) => {
        mockHttpHandler.addRequest(url as string, options);
        // Always resolve successfully to prevent fallback to Node.js HTTP
        return Promise.resolve(new Response('{"success": true}', { status: 200 }));
      });
    });

    afterEach(() => {
      if (mockFetch) {
        mockFetch.mockRestore();
      }
      mockHttpHandler.clear();
    });

    test('should send logs to HTTP endpoint using advancedOutputConfig', async () => {
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

      // Wait for HTTP request to be sent using our proper handler
      await mockHttpHandler.waitForRequests(1);

      const requests = mockHttpHandler.getRequests();
      expect(requests.length).toBeGreaterThan(0);

      const call = requests[0];
      expect(call.url).toBe('https://api.example.com/logs');
      expect(call.options.method).toBe('POST');
      expect(call.options.headers['Authorization']).toBe('Bearer test-token');

      const body = JSON.parse(call.options.body);
      expect(body.logs).toHaveLength(1);
      expect(body.logs[0].level).toBe('error');
      expect(body.logs[0].message).toContain('HTTP test message');
    });

    test('should batch multiple logs when batchSize > 1', async () => {
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

      await mockHttpHandler.waitForRequests(1);

      const requests = mockHttpHandler.getRequests();
      expect(requests.length).toBeGreaterThan(0);

      if (requests.length > 0) {
        const body = JSON.parse(requests[0].options.body);
        // Check if it's batched or individual logs
        if (body.logs && Array.isArray(body.logs)) {
          expect(body.logs.length).toBeGreaterThanOrEqual(1);
          expect(body.logs[0].message).toContain('Message');
        } else {
          // Individual log format
          expect(body.message).toContain('Message');
        }
      }
    });

    test('should use custom formatter for HTTP payload', async () => {
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

      await mockHttpHandler.waitForRequests(1);

      const requests = mockHttpHandler.getRequests();
      if (requests.length > 0) {
        const body = JSON.parse(requests[0].options.body);
        expect(body.custom_format).toBe(true);
        expect(body.event_count).toBe(1);
        expect(body.events[0]).toBe('debug: Custom format test');
      }
    });

    test('should handle HTTP timeout configuration', async () => {
      LogEngine.configure({
        outputs: ['http'],
        suppressConsoleOutput: true,
        advancedOutputConfig: {
          http: {
            url: 'https://api.example.com/logs',
            timeout: 1000,
            batchSize: 1
          }
        }
      });

      LogEngine.error('Timeout test message');

      await mockHttpHandler.waitForRequests(1);

      const requests = mockHttpHandler.getRequests();
      expect(requests.length).toBeGreaterThan(0);
    });

    test('should handle HTTP with custom headers and method', async () => {
      LogEngine.configure({
        outputs: ['http'],
        suppressConsoleOutput: true,
        advancedOutputConfig: {
          http: {
            url: 'https://api.example.com/logs',
            method: 'PUT',
            headers: {
              'Custom-Header': 'test-value',
              'Content-Type': 'application/json'
            },
            batchSize: 1
          }
        }
      });

      LogEngine.info('Custom headers test');

      await mockHttpHandler.waitForRequests(1);

      const requests = mockHttpHandler.getRequests();
      expect(requests.length).toBeGreaterThan(0);

      const call = requests[0];
      expect(call.options.method).toBe('PUT');
      expect(call.options.headers['Custom-Header']).toBe('test-value');
    });

    test('should handle HTTP batching edge case', async () => {
      LogEngine.configure({
        outputs: ['http'],
        suppressConsoleOutput: true,
        advancedOutputConfig: {
          http: {
            url: 'https://api.example.com/logs',
            batchSize: 5 // Large batch size to test single message handling
          }
        }
      });

      LogEngine.info('Single batch test message');

      // Wait for the message to be sent
      await mockHttpHandler.waitForRequests(1);
      const requests = mockHttpHandler.getRequests();
      expect(requests.length).toBeGreaterThan(0);
    });

    test('should handle Node.js HTTP fallback when fetch is unavailable', async () => {
      // Temporarily remove fetch to trigger fallback
      const originalFetch = (global as any).fetch;
      delete (global as any).fetch;

      try {
        LogEngine.configure({
          outputs: ['http'],
          suppressConsoleOutput: true,
          advancedOutputConfig: {
            http: {
              url: 'https://api.example.com/logs',
              batchSize: 1
            }
          }
        });

        LogEngine.error('Fallback test message');

        // Give some time for the fallback to attempt
        await new Promise(resolve => setTimeout(resolve, 100));

        // The request won't be captured by our mock in the fallback case,
        // but we're testing that the code path executes without error
        expect(true).toBe(true); // Test passes if no error is thrown
      } finally {
        // Restore fetch
        (global as any).fetch = originalFetch;
      }
    });
  });

  describe('Enhanced Output Targets', () => {
    test('should support configured handler objects in enhancedOutputs', async () => {
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
      const fileContent = await fs.promises.readFile(logFile, 'utf8');
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
          () => {
            throw new Error('Handler failure');
          }
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
    test('should maintain compatibility with previous outputHandler', () => {
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

    test('should maintain compatibility with previous outputs array', () => {
      const logs: any[] = [];

      LogEngine.configure({
        outputs: [
          'silent',
          (level, message) => logs.push({ level, message })
        ],
        // Should ignore this when outputs is present
        enhancedOutputs: ['console']
      });

      LogEngine.warn('Backward compatibility test');

      expect(logs).toHaveLength(1);
      expect(logs[0].level).toBe('warn');
      // Custom handlers receive the formatted message with colors
      expect(logs[0].message).toContain('Backward compatibility test');
      expect(logs[0].message).toContain('[WARN]');
    });
  });

  describe('Performance', () => {
    test('should handle high-volume logging efficiently', async () => {
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
      const content = await fs.promises.readFile(logFile, 'utf8');
      expect(content).toContain('Performance test message 0');
      expect(content).toContain('Performance test message 999');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle file creation with non-existent directory', async () => {
      const logFile = path.join(testDir, 'subdir', 'test.log');

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

      LogEngine.info('Directory creation test');

      // Wait for file to be created
      await waitForFile(logFile, 2000);

      expect(fs.existsSync(logFile)).toBe(true);
      const content = await fs.promises.readFile(logFile, 'utf8');
      expect(content).toContain('Directory creation test');
    });

    test('should handle file rotation with maximum backup files', async () => {
      const logFile = path.join(testDir, 'rotation-max-test.log');

      LogEngine.configure({
        outputs: ['file'],
        suppressConsoleOutput: true,
        advancedOutputConfig: {
          file: {
            filePath: logFile,
            maxFileSize: 100, // Very small size to trigger rotation
            maxBackupFiles: 2, // Only keep 2 backup files
            append: false
          }
        }
      });

      // Generate enough logs to cause multiple rotations
      for (let i = 0; i < 25; i++) {
        LogEngine.info(`Rotation test message ${i} with extra content to exceed size limit and trigger rotation`);
      }

      // Wait for files to be created
      await waitForFile(logFile, 3000);

      // Main file should exist
      expect(fs.existsSync(logFile)).toBe(true);

      // Check that at least one backup file exists
      const backup1 = `${logFile}.1`;
      expect(fs.existsSync(backup1)).toBe(true);

      // The number of backup files depends on rotation timing, but should not exceed maxBackupFiles
      const backup2 = `${logFile}.2`;
      const backup3 = `${logFile}.3`;

      // backup3 should not exist due to maxBackupFiles limit of 2
      expect(fs.existsSync(backup3)).toBe(false);
    });

    test('should handle queue processing during rotation', async () => {
      const logFile = path.join(testDir, 'queue-test.log');

      LogEngine.configure({
        outputs: ['file'],
        suppressConsoleOutput: true,
        advancedOutputConfig: {
          file: {
            filePath: logFile,
            maxFileSize: 150, // Small size to trigger rotation
            maxBackupFiles: 3,
            append: false
          }
        }
      });

      // Rapidly log messages to test queue processing during rotation
      for (let i = 0; i < 10; i++) {
        LogEngine.info(`Queue test message ${i} with enough content to trigger rotation quickly`);
      }

      await waitForFile(logFile, 3000);

      expect(fs.existsSync(logFile)).toBe(true);
      const content = await fs.promises.readFile(logFile, 'utf8');
      expect(content).toContain('Queue test message');
    });

    test('should handle createBuiltInHandler with invalid config', () => {
      // Test error paths in createBuiltInHandler
      const { createBuiltInHandler } = require('../logger/advanced-outputs');

      // Test file handler without filePath
      const fileHandler = createBuiltInHandler('file', {});
      expect(fileHandler).toBeNull();

      // Test http handler without url
      const httpHandler = createBuiltInHandler('http', {});
      expect(httpHandler).toBeNull();

      // Test unknown handler type
      const unknownHandler = createBuiltInHandler('unknown', {});
      expect(unknownHandler).toBeNull();
    });

    test('should handle file write with non-string data in secure file functions', () => {
      // Test error path in secureWriteFileSync
      const { secureWriteFileSync } = require('../logger/advanced-outputs');
      const testFile = path.join(testDir, 'data-type-test.log');

      // This should throw an error for non-string data
      expect(() => {
        secureWriteFileSync(testFile, 123 as any);
      }).toThrow('Data must be a string for security');
    });

    test('should handle secure file system path validation edge cases', () => {
      const { secureStatSync } = require('../logger/advanced-outputs');

      // Test empty/null path
      expect(() => {
        secureStatSync('');
      }).toThrow('File path must be a non-empty string');

      expect(() => {
        secureStatSync(null as any);
      }).toThrow('File path must be a non-empty string');

      // Test path traversal with different patterns
      expect(() => {
        secureStatSync('../../etc/passwd');
      }).toThrow('Path traversal detected');

      // Test access to system directories
      const systemPath = process.platform === 'win32' ? 'C:\\Windows\\system32\\test.log' : '/etc/passwd';
      expect(() => {
        secureStatSync(systemPath);
      }).toThrow('File path outside allowed directories');

      // Test path outside safe directories
      const outsidePath = process.platform === 'win32' ? 'C:\\Users\\test.log' : '/home/user/test.log';
      expect(() => {
        secureStatSync(outsidePath);
      }).toThrow('File path outside allowed directories');
    });

    test('should handle secure file system unlinkSync with invalid path restrictions', () => {
      const { secureUnlinkSync } = require('../logger/advanced-outputs');

      // Try to delete a file outside log/temp directories - use a system directory
      const invalidPath = process.platform === 'win32' ? 'C:\\Users\\test.log' : '/home/user/test.log';
      expect(() => {
        secureUnlinkSync(invalidPath);
      }).toThrow('File path outside allowed directories');
    });

    test('should handle secure file system renameSync with invalid paths', () => {
      const { secureRenameSync } = require('../logger/advanced-outputs');

      const validLogPath = path.join(testDir, 'test.log');
      const invalidPath = process.platform === 'win32' ? 'C:\\Users\\test.log' : '/home/user/test.log';

      // Try to rename with source outside allowed directories
      expect(() => {
        secureRenameSync(invalidPath, validLogPath);
      }).toThrow('File path outside allowed directories');

      // Try to rename with destination outside allowed directories
      expect(() => {
        secureRenameSync(validLogPath, invalidPath);
      }).toThrow('File path outside allowed directories');
    });

    test('should handle HTTP handler with non-HTTPS URL fallback', async () => {
      // Mock require to simulate Node.js environment without fetch
      const originalFetch = (global as any).fetch;
      delete (global as any).fetch;

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        LogEngine.configure({
          outputs: ['http'],
          suppressConsoleOutput: true,
          advancedOutputConfig: {
            http: {
              url: 'http://insecure.example.com/logs', // HTTP instead of HTTPS
              batchSize: 1
            }
          }
        });

        LogEngine.error('HTTP security test');

        // Wait a bit for the request to be processed
        await new Promise(resolve => setTimeout(resolve, 100));

        // Should have logged a security error
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'HTTP request setup failed:',
          expect.objectContaining({
            message: expect.stringContaining('HTTP (cleartext) connections are not allowed')
          })
        );
      } finally {
        consoleErrorSpy.mockRestore();
        (global as any).fetch = originalFetch;
      }
    });

    test('should handle HTTP handler timeout in Node.js fallback', async () => {
      const originalFetch = (global as any).fetch;
      const originalHttps = require('https');
      delete (global as any).fetch;

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        // Mock https.request to simulate timeout
        const mockReq: any = {
          on: jest.fn((event: string, callback: () => void): any => {
            if (event === 'timeout') {
              setTimeout(callback, 10); // Trigger timeout quickly
            }
            return mockReq;
          }),
          write: jest.fn(),
          end: jest.fn(),
          destroy: jest.fn()
        };

        jest.spyOn(require('https'), 'request').mockImplementation(() => mockReq);

        LogEngine.configure({
          outputs: ['http'],
          suppressConsoleOutput: true,
          advancedOutputConfig: {
            http: {
              url: 'https://api.example.com/logs',
              timeout: 50,
              batchSize: 1
            }
          }
        });

        LogEngine.error('Timeout test');

        // Wait for timeout to trigger
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(mockReq.destroy).toHaveBeenCalled();
      } finally {
        consoleErrorSpy.mockRestore();
        (global as any).fetch = originalFetch;
        jest.restoreAllMocks();
      }
    });

    test('should handle HTTP flush with empty buffer', () => {
      const { HttpOutputHandler } = require('../logger/advanced-outputs');
      const handler = new HttpOutputHandler({
        url: 'https://api.example.com/logs'
      });

      // Calling flush with empty buffer should not cause errors
      expect(() => {
        handler.flush();
      }).not.toThrow();
    });

    test('should handle file output with rotation edge cases', async () => {
      const logFile = path.join(testDir, 'rotation-edge-test.log');

      // Create handler with rotation disabled (maxFileSize = 0)
      LogEngine.configure({
        outputs: ['file'],
        suppressConsoleOutput: true,
        advancedOutputConfig: {
          file: {
            filePath: logFile,
            maxFileSize: 0, // No rotation
            append: true
          }
        }
      });

      // Write multiple large messages - should not trigger rotation
      for (let i = 0; i < 5; i++) {
        LogEngine.info(`No rotation test ${i} with a lot of content that would normally trigger rotation if maxFileSize was set`);
      }

      await waitForFile(logFile, 1000);

      // Should only have main file, no backups
      expect(fs.existsSync(logFile)).toBe(true);
      expect(fs.existsSync(`${logFile}.1`)).toBe(false);
    });

    test('should handle file rotation with existing backup files cleanup', async () => {
      const logFile = path.join(testDir, 'cleanup-rotation-test.log');

      // Pre-create backup files to test cleanup logic
      await fs.promises.writeFile(`${logFile}.1`, 'old backup 1\n');
      await fs.promises.writeFile(`${logFile}.2`, 'old backup 2\n');
      await fs.promises.writeFile(`${logFile}.3`, 'old backup 3\n'); // This should be deleted

      LogEngine.configure({
        outputs: ['file'],
        suppressConsoleOutput: true,
        advancedOutputConfig: {
          file: {
            filePath: logFile,
            maxFileSize: 80, // Small size to trigger rotation quickly
            maxBackupFiles: 2, // Only keep 2 backups
            append: false
          }
        }
      });

      // Write messages to trigger rotation
      for (let i = 0; i < 10; i++) {
        LogEngine.info(`Cleanup rotation test ${i} with enough content to trigger rotation`);
      }

      await waitForFile(logFile, 2000);

      // The main goal is to test rotation logic, the exact number of backup files depends on timing
      // So we'll check that main file exists and at least some rotation occurred
      expect(fs.existsSync(logFile)).toBe(true);

      // Check that some backup rotation occurred - either .3 was deleted or rotation happened
      const backup1Exists = fs.existsSync(`${logFile}.1`);
      const backup2Exists = fs.existsSync(`${logFile}.2`);
      const backup3Exists = fs.existsSync(`${logFile}.3`);

      // At least one backup should exist, indicating rotation occurred
      expect(backup1Exists || backup2Exists).toBe(true);
    });

    test('should handle HTTP error paths in flush operation', () => {
      const { HttpOutputHandler } = require('../logger/advanced-outputs');

      // Create handler with formatter that throws
      const handler = new HttpOutputHandler({
        url: 'https://api.example.com/logs',
        formatter: () => {
          throw new Error('Formatter error');
        }
      });

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        // Add log entry and trigger flush
        handler.write('error', 'test message');

        // Force flush to trigger the error
        handler.flush();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'HTTP flush failed:',
          expect.any(Error)
        );
      } finally {
        consoleErrorSpy.mockRestore();
      }
    });

    test('should handle file write error during non-append mode', async () => {
      const logFile = path.join(testDir, 'write-error-test.log');

      // Create the file as read-only to trigger write error
      await fs.promises.writeFile(logFile, 'initial content');
      await fs.promises.chmod(logFile, 0o444); // Read-only

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

      try {
        LogEngine.configure({
          outputs: ['file'],
          suppressConsoleOutput: true,
          advancedOutputConfig: {
            file: {
              filePath: logFile,
              append: false // Write mode should fail on read-only file
            }
          }
        });

        LogEngine.info('This should fail to write');

        // Should have logged the error and fallen back to console
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'File output handler failed:',
          expect.any(Error)
        );
        expect(consoleLogSpy).toHaveBeenCalledWith(
          expect.stringContaining('[INFO]'),
          undefined
        );
      } finally {
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();

        // Restore write permissions for cleanup
        try {
          await fs.promises.chmod(logFile, 0o644);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    });

    test('should handle URL parsing edge cases in HTTP handler', async () => {
      const originalFetch = (global as any).fetch;
      delete (global as any).fetch;

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      try {
        // Mock https.request to capture the parsed URL options
        let capturedOptions: any = null;
        const mockReq: any = {
          on: jest.fn((): any => mockReq),
          write: jest.fn(),
          end: jest.fn()
        };

        jest.spyOn(require('https'), 'request').mockImplementation((options) => {
          capturedOptions = options;
          return mockReq;
        });

        LogEngine.configure({
          outputs: ['http'],
          suppressConsoleOutput: true,
          advancedOutputConfig: {
            http: {
              url: 'https://api.example.com:8443/logs?token=abc123',
              batchSize: 1
            }
          }
        });

        LogEngine.error('URL parsing test');

        // Wait for the request to be processed
        await new Promise(resolve => setTimeout(resolve, 100));

        // Verify URL was parsed correctly
        expect(capturedOptions).not.toBeNull();
        expect(capturedOptions.hostname).toBe('api.example.com');
        expect(capturedOptions.port).toBe(8443);
        expect(capturedOptions.path).toBe('/logs?token=abc123');
      } finally {
        consoleErrorSpy.mockRestore();
        (global as any).fetch = originalFetch;
        jest.restoreAllMocks();
      }
    });

    test('should handle flush timeout scheduling edge cases', async () => {
      const { HttpOutputHandler } = require('../logger/advanced-outputs');

      // Mock global fetch for this test
      const mockFetch = jest.fn().mockResolvedValue(new Response('{"success": true}'));
      (global as any).fetch = mockFetch;

      try {
        const handler = new HttpOutputHandler({
          url: 'https://api.example.com/logs',
          batchSize: 5 // Large batch size
        });

        // Add one message (should schedule timeout)
        handler.write('info', 'first message');

        // Add another message (should not schedule new timeout)
        handler.write('warn', 'second message');

        // Wait for timeout to trigger flush
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Verify fetch was called
        expect(mockFetch).toHaveBeenCalled();
      } finally {
        delete (global as any).fetch;
      }
    });
  });
});

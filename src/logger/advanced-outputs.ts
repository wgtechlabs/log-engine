/**
 * Advanced output handlers for log-engine
 * Provides file, HTTP, and other production-ready output handlers
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { FileOutputConfig, HttpOutputConfig } from '../types';

// Type definitions for HTTP operations
interface LogEntry {
  level: string;
  message: string;
  data?: unknown;
  timestamp: string;
}

interface HttpPayload {
  logs: LogEntry[];
}

interface HttpRequestOptions {
  hostname: string;
  port: number;
  path: string;
  method: string;
  headers: Record<string, string | number>;
  timeout: number;
}

/**
 * Secure filesystem operations for logging operations
 *
 * SECURITY NOTE: These functions implement comprehensive path validation and access controls
 * to prevent path traversal attacks, directory injection, and unauthorized file access.
 * ESLint security rules are disabled for specific fs operations because:
 *
 * 1. All paths are validated through validatePath() which:
 *    - Prevents directory traversal (../)
 *    - Restricts access to predefined safe directories
 *    - Blocks access to system directories
 *    - Normalizes and resolves paths securely
 *
 * 2. The logging library requires dynamic file paths by design (user-configurable log files)
 * 3. All operations are wrapped in try-catch with comprehensive error handling
 * 4. File operations are restricted to log and temp directories only
 */

/**
 * Predefined safe base directories for different operation types
 * Restricted to specific subdirectories to prevent unauthorized access
 */
const SAFE_BASE_DIRS = {
  LOG_FILES: [path.resolve('./logs'), path.resolve('./var/log'), path.resolve('./data/logs')],
  TEMP_FILES: [path.resolve('./temp'), path.resolve('./logs'), path.resolve('./tmp'), os.tmpdir()],
  CONFIG_FILES: [path.resolve('./config'), path.resolve('./etc'), path.resolve('./logs')]
} as const;

/**
 * Validates file path with comprehensive security checks
 * Prevents path traversal, restricts to safe directories, blocks system paths
 */
function validatePath(filePath: string): string {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('File path must be a non-empty string');
  }

  // Resolve and normalize the path to handle relative paths and traversal attempts
  const resolvedPath = path.resolve(filePath);
  const normalizedPath = path.normalize(resolvedPath);

  // Check for path traversal attempts in original path - reject ANY use of '..'
  if (filePath.includes('..')) {
    throw new Error(`Path traversal detected: ${filePath}`);
  }

  // Ensure path is within safe directories (logs, current directory, or temp)
  const safeBaseDirs = [
    ...SAFE_BASE_DIRS.LOG_FILES,
    ...SAFE_BASE_DIRS.TEMP_FILES,
    ...SAFE_BASE_DIRS.CONFIG_FILES
  ];

  const isInSafeDir = safeBaseDirs.some(safeDir => normalizedPath.startsWith(safeDir));
  if (!isInSafeDir) {
    throw new Error(`File path outside allowed directories: ${filePath}`);
  }

  // Block access to dangerous system directories
  const dangerousPaths = [
    '/etc', '/sys', '/proc', '/dev', '/root', '/bin', '/sbin',
    'C:\\Windows', 'C:\\System32', 'C:\\Program Files', 'C:\\Users\\All Users'
  ];

  if (dangerousPaths.some(dangerous => normalizedPath.startsWith(dangerous))) {
    throw new Error(`Access denied to system directory: ${filePath}`);
  }

  return normalizedPath;
}

/**
 * Secure file existence check
 * Uses fs.accessSync instead of fs.existsSync for better security practices
 */
function secureExistsSync(filePath: string): boolean {
  try {
    const safePath = validatePath(filePath);
    // SECURITY: Path has been validated and restricted to safe directories
    fs.accessSync(safePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Secure directory creation with recursive option support
 * Restricted to log and temp directories only
 */
function secureMkdirSync(dirPath: string, options?: { recursive?: boolean }): void {
  const safePath = validatePath(dirPath);

  try {
    const mkdirOptions = { recursive: Boolean(options?.recursive) };
    // SECURITY: Path has been validated and restricted to safe directories
    fs.mkdirSync(safePath, mkdirOptions);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to create directory ${dirPath}: ${errorMessage}`);
  }
}

/**
 * Secure file stat operation
 * Returns file system statistics for validated paths only
 */
function secureStatSync(filePath: string): fs.Stats {
  const safePath = validatePath(filePath);

  try {
    // SECURITY: Path has been validated and restricted to safe directories
    return fs.statSync(safePath);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to stat file ${filePath}: ${errorMessage}`);
  }
}

/**
 * Secure file write operation
 * Validates path and data before writing to prevent injection attacks
 */
function secureWriteFileSync(filePath: string, data: string, options?: { flag?: string }): void {
  const safePath = validatePath(filePath);

  // Validate data parameter
  if (typeof data !== 'string') {
    throw new Error('Data must be a string for security');
  }

  try {
    const writeOptions = options || {};
    // SECURITY: Path has been validated and restricted to safe directories
    fs.writeFileSync(safePath, data, writeOptions);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to write file ${filePath}: ${errorMessage}`);
  }
}

/**
 * Secure file deletion
 * Restricted to log and temp files only for safety
 */
function secureUnlinkSync(filePath: string): void {
  const safePath = validatePath(filePath);

  // Additional safety check: only allow deletion of log and temp files
  const logDirs = [...SAFE_BASE_DIRS.LOG_FILES, ...SAFE_BASE_DIRS.TEMP_FILES];
  const isInLogDir = logDirs.some(logDir => safePath.startsWith(logDir));

  if (!isInLogDir) {
    throw new Error(`File deletion not allowed outside log/temp directories: ${filePath}`);
  }

  try {
    // SECURITY: Path has been validated and restricted to log/temp directories
    fs.unlinkSync(safePath);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to delete file ${filePath}: ${errorMessage}`);
  }
}

/**
 * Secure file rename/move operation
 * Both source and destination must be in safe directories
 */
function secureRenameSync(oldPath: string, newPath: string): void {
  const safeOldPath = validatePath(oldPath);
  const safeNewPath = validatePath(newPath);

  // Ensure both paths are in allowed directories (log/temp only for safety)
  const allowedDirs = [...SAFE_BASE_DIRS.LOG_FILES, ...SAFE_BASE_DIRS.TEMP_FILES];
  const oldInAllowed = allowedDirs.some(dir => safeOldPath.startsWith(dir));
  const newInAllowed = allowedDirs.some(dir => safeNewPath.startsWith(dir));

  if (!oldInAllowed || !newInAllowed) {
    throw new Error(`File rename not allowed outside safe directories: ${oldPath} -> ${newPath}`);
  }

  try {
    // SECURITY: Both paths have been validated and restricted to safe directories
    fs.renameSync(safeOldPath, safeNewPath);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to rename file ${oldPath} to ${newPath}: ${errorMessage}`);
  }
}

/**
 * File output handler with rotation support and concurrency protection
 * Implements atomic file operations and write queuing to prevent corruption
 */
export class FileOutputHandler {
  private config: Required<FileOutputConfig>;
  private currentFileSize: number = 0;
  private rotationInProgress: boolean = false;
  private writeQueue: Array<{ level: string; message: string; data?: unknown }> = [];

  constructor(config: FileOutputConfig) {
    // Set defaults
    this.config = {
      filePath: config.filePath,
      append: config.append ?? true,
      maxFileSize: config.maxFileSize ?? 0, // 0 means no rotation
      maxBackupFiles: config.maxBackupFiles ?? 3,
      formatter: config.formatter ?? this.defaultFormatter
    };

    // Ensure directory exists and validate paths
    try {
      const dir = path.dirname(this.config.filePath);

      if (!secureExistsSync(dir)) {
        secureMkdirSync(dir, { recursive: true });
      }

      // Get current file size if it exists
      if (secureExistsSync(this.config.filePath)) {
        this.currentFileSize = secureStatSync(this.config.filePath).size;
      }
    } catch (error) {
      // Re-throw with context for better error handling
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to initialize file output handler: ${errorMessage}`);
    }
  }

  /**
     * Default formatter for file output
     */
  private defaultFormatter = (level: string, message: string, data?: unknown): string => {
    const timestamp = new Date().toISOString();
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `${timestamp} [${level.toUpperCase()}] ${message}${dataStr}\n`;
  };

  /**
     * Write log to file with rotation support and concurrency protection
     * Queues writes during rotation to prevent file corruption
     */
  public write = (level: string, message: string, data?: unknown): void => {
    // If rotation is in progress, queue the write
    if (this.rotationInProgress) {
      this.writeQueue.push({ level, message, data });
      return;
    }

    try {
      this.writeToFile(level, message, data);
    } catch (error) {
      // Fallback to console if file writing fails
      console.error('File output handler failed:', error);
      console.log(`[${level.toUpperCase()}] ${message}`, data);
    }
  };

  /**
   * Write to file with concurrency protection and rotation check
   * If rotation is in progress, messages are queued to prevent corruption
   */
  private writeToFile(level: string, message: string, data?: unknown): void {
    const formattedMessage = this.config.formatter(level, message, data);

    // Check if rotation is needed
    if (this.config.maxFileSize > 0 &&
      this.currentFileSize + Buffer.byteLength(formattedMessage) > this.config.maxFileSize) {
      this.rotateFile();
    }

    // Write to file using secure filesystem wrapper
    const writeOptions = this.config.append ? { flag: 'a' } : { flag: 'w' };
    secureWriteFileSync(this.config.filePath, formattedMessage, writeOptions);

    this.currentFileSize += Buffer.byteLength(formattedMessage);
  }

  /**
   * Process queued writes after rotation completes
   */
  private processWriteQueue(): void {
    while (this.writeQueue.length > 0) {
      const queuedWrite = this.writeQueue.shift();
      if (queuedWrite) {
        try {
          this.writeToFile(queuedWrite.level, queuedWrite.message, queuedWrite.data);
        } catch (error) {
          console.error('Failed to process queued write:', error);
          console.log(`[${queuedWrite.level.toUpperCase()}] ${queuedWrite.message}`, queuedWrite.data);
        }
      }
    }
  }

  /**
     * Rotate log files when size limit is reached
     * Implements concurrency protection to prevent corruption during rotation
     */
  private rotateFile(): void {
    // Prevent concurrent rotations
    if (this.rotationInProgress) {
      return;
    }

    this.rotationInProgress = true;

    try {
      // Move backup files
      for (let i = this.config.maxBackupFiles - 1; i >= 1; i--) {
        const oldFile = `${this.config.filePath}.${i}`;
        const newFile = `${this.config.filePath}.${i + 1}`;

        if (secureExistsSync(oldFile)) {
          if (i === this.config.maxBackupFiles - 1) {
            // Delete the oldest file
            secureUnlinkSync(oldFile);
          } else {
            secureRenameSync(oldFile, newFile);
          }
        }
      }

      // Move current file to .1
      if (secureExistsSync(this.config.filePath)) {
        const backupFile = `${this.config.filePath}.1`;
        secureRenameSync(this.config.filePath, backupFile);
      }

      this.currentFileSize = 0;
    } catch (error) {
      console.error('File rotation failed:', error);
    } finally {
      // Always reset rotation flag and process queued writes
      this.rotationInProgress = false;
      this.processWriteQueue();
    }
  }

  /**
   * Clean up resources and process any remaining queued writes
   */
  public destroy(): void {
    // Process any remaining queued writes
    if (this.writeQueue.length > 0) {
      this.processWriteQueue();
    }

    // Clear the write queue
    this.writeQueue = [];
    this.rotationInProgress = false;
  }
}

/**
 * HTTP output handler for sending logs to remote endpoints
 */
export class HttpOutputHandler {
  private config: Required<HttpOutputConfig>;
  private logBuffer: LogEntry[] = [];
  private flushTimeout: NodeJS.Timeout | null = null;

  constructor(config: HttpOutputConfig) {
    // Set defaults
    this.config = {
      url: config.url,
      method: config.method ?? 'POST',
      headers: config.headers ?? { 'Content-Type': 'application/json' },
      batchSize: config.batchSize ?? 1,
      timeout: config.timeout ?? 5000,
      formatter: config.formatter ?? this.defaultFormatter
    };
  }

  /**
     * Default formatter for HTTP output
     */
  private defaultFormatter = (logs: LogEntry[]): HttpPayload => {
    return {
      logs: logs.map(log => ({
        timestamp: log.timestamp,
        level: log.level,
        message: log.message,
        data: log.data
      }))
    };
  };

  /**
     * Write log to HTTP endpoint with batching support
     */
  public write = (level: string, message: string, data?: unknown): void => {
    try {
      // Add to buffer
      this.logBuffer.push({
        level,
        message,
        data,
        timestamp: new Date().toISOString()
      });

      // Flush if batch size reached
      if (this.logBuffer.length >= this.config.batchSize) {
        this.flush();
      } else {
        // Schedule a flush if not already scheduled
        if (!this.flushTimeout) {
          this.flushTimeout = setTimeout(() => {
            this.flush();
          }, 1000); // Flush after 1 second if batch isn't full
        }
      }
    } catch (error) {
      // Fallback to console if HTTP fails
      console.error('HTTP output handler failed:', error);
      console.log(`[${level.toUpperCase()}] ${message}`, data);
    }
  };

  /**
     * Flush buffered logs to HTTP endpoint
     */
  private flush(): void {
    if (this.logBuffer.length === 0) {
      return;
    }

    try {
      const payload = this.config.formatter([...this.logBuffer]);
      this.logBuffer = []; // Clear buffer

      if (this.flushTimeout) {
        clearTimeout(this.flushTimeout);
        this.flushTimeout = null;
      }

      // Send HTTP request (using fetch if available, otherwise fall back)
      this.sendHttpRequest(payload);
    } catch (error) {
      console.error('HTTP flush failed:', error);
    }
  }

  /**
     * Send HTTP request with appropriate method based on environment
     */
  private sendHttpRequest(payload: HttpPayload): void {
    // Try to use fetch (Node.js 18+ or browser)
    if (typeof fetch !== 'undefined') {
      fetch(this.config.url, {
        method: this.config.method,
        headers: this.config.headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(this.config.timeout)
      }).catch(error => {
        console.error('HTTP request failed:', error);
      });
    } else {
      // Fallback for older Node.js versions
      this.sendHttpRequestNodeJS(payload);
    }
  }

  /**
     * Fallback HTTP implementation for Node.js environments without fetch
     */
  private sendHttpRequestNodeJS(payload: HttpPayload): void {
    try {
      const https = require('https');

      const parsedUrl = new URL(this.config.url);
      const isHttps = parsedUrl.protocol === 'https:';

      // Security: Block HTTP (cleartext) connections by default
      if (!isHttps) {
        throw new Error('SECURITY ERROR: HTTP (cleartext) connections are not allowed for log transmission. Use HTTPS URLs only.');
      }

      const postData = JSON.stringify(payload);

      const options: HttpRequestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : 443,
        path: parsedUrl.pathname + parsedUrl.search,
        method: this.config.method,
        headers: {
          ...this.config.headers,
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: this.config.timeout
      };

      const req = https.request(options, (res: NodeJS.ReadableStream) => {
        // Handle response (optional: log success/failure)
        res.on('data', () => {}); // Consume response
        res.on('end', () => {});
      });

      req.on('error', (error: Error) => {
        console.error('HTTP request failed:', error);
      });

      req.on('timeout', () => {
        req.destroy();
        console.error('HTTP request timed out');
      });

      req.write(postData);
      req.end();
    } catch (error) {
      console.error('HTTP request setup failed:', error);
    }
  }

  /**
   * Cleanup method to prevent memory leaks
   */
  public destroy(): void {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }
    // Flush any remaining logs
    this.flush();
  }
}

/**
 * Returns a logging handler function based on the specified type and configuration.
 *
 * Supported types are:
 * - `'console'`: Logs to the console using the appropriate method for the log level.
 * - `'silent'`: Returns a no-op handler that discards all logs.
 * - `'file'`: Writes logs to a file with optional rotation; requires `filePath` in config.
 * - `'http'`: Sends logs to a remote HTTP endpoint; requires `url` in config.
 *
 * If required configuration is missing or initialization fails, logs an error and returns either a fallback handler or `null`.
 *
 * @param type - The type of output handler to create (`'console'`, `'silent'`, `'file'`, or `'http'`)
 * @returns A log handler function or `null` if the handler cannot be created
 */
export function createBuiltInHandler(type: string, config?: Record<string, unknown>): ((level: string, message: string, data?: unknown) => void) | null {
  switch (type) {
  case 'console':
    return (level: string, message: string, data?: unknown) => {
      const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      // Use safe method call to prevent object injection
      if (Object.prototype.hasOwnProperty.call(console, method) && typeof console[method as keyof Console] === 'function') {
        (console[method as keyof Console] as (...args: unknown[]) => void)(message, data);
      } else {
        console.log(message, data);
      }
    };

  case 'silent':
    return () => {}; // No-op handler

  case 'file':
    if (config && typeof config.filePath === 'string') {
      try {
        const handler = new FileOutputHandler(config as unknown as FileOutputConfig);
        return handler.write;
      } catch (error) {
        // Return a handler that logs the expected error message and falls back to console
        return (level: string, message: string, data?: unknown) => {
          console.error('File output handler failed:', error);
          console.log(`[${level.toUpperCase()}] ${message}`, data);
        };
      }
    }
    console.error('File output handler requires filePath in config');
    return null;

  case 'http':
    if (config && typeof config.url === 'string') {
      const handler = new HttpOutputHandler(config as unknown as HttpOutputConfig);
      return handler.write;
    }
    console.error('HTTP output handler requires url in config');
    return null;

  default:
    return null;
  }
}

// Export secure filesystem functions for testing
export {
  secureExistsSync,
  secureMkdirSync,
  secureStatSync,
  secureWriteFileSync,
  secureUnlinkSync,
  secureRenameSync,
  validatePath,
  SAFE_BASE_DIRS
};

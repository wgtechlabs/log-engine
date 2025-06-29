/**
 * Advanced output handlers for log-engine
 * Provides file, HTTP, and other production-ready output handlers
 */

import * as fs from 'fs';
import * as path from 'path';
import type { FileOutputConfig, HttpOutputConfig } from '../types';

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

    // Ensure directory exists
    try {
      const dir = path.dirname(this.config.filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Get current file size if it exists
      if (fs.existsSync(this.config.filePath)) {
        this.currentFileSize = fs.statSync(this.config.filePath).size;
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

    // Write to file
    const writeOptions = this.config.append ? { flag: 'a' } : { flag: 'w' };
    fs.writeFileSync(this.config.filePath, formattedMessage, writeOptions);

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

        if (fs.existsSync(oldFile)) {
          if (i === this.config.maxBackupFiles - 1) {
            // Delete the oldest file
            fs.unlinkSync(oldFile);
          } else {
            fs.renameSync(oldFile, newFile);
          }
        }
      }

      // Move current file to .1
      if (fs.existsSync(this.config.filePath)) {
        fs.renameSync(this.config.filePath, `${this.config.filePath}.1`);
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
  private logBuffer: Array<{ level: string; message: string; data?: unknown; timestamp: string }> = [];
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
  private defaultFormatter = (logs: Array<{ level: string; message: string; data?: unknown; timestamp: string }>): any => {
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
  private sendHttpRequest(payload: any): void {
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
  private sendHttpRequestNodeJS(payload: any): void {
    try {
      const https = require('https');
      const http = require('http');

      const parsedUrl = new URL(this.config.url);
      const isHttps = parsedUrl.protocol === 'https:';

      // Security: Warn when using HTTP (cleartext) instead of HTTPS
      if (!isHttps) {
        console.warn('SECURITY WARNING: Using HTTP (cleartext) for log transmission. Consider using HTTPS for production.');
      }

      const httpModule = isHttps ? https : http;

      const postData = JSON.stringify(payload);

      const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: this.config.method,
        headers: {
          ...this.config.headers,
          'Content-Length': Buffer.byteLength(postData)
        },
        timeout: this.config.timeout
      };

      const req = httpModule.request(options, (res: any) => {
        // Handle response (optional: log success/failure)
        res.on('data', () => {}); // Consume response
        res.on('end', () => {});
      });

      req.on('error', (error: any) => {
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
export function createBuiltInHandler(type: string, config?: any): ((level: string, message: string, data?: unknown) => void) | null {
  switch (type) {
  case 'console':
    return (level: string, message: string, data?: unknown) => {
      const method = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      // Use safe method call to prevent object injection
      if (Object.prototype.hasOwnProperty.call(console, method) && typeof console[method as keyof Console] === 'function') {
        (console[method as keyof Console] as (...args: any[]) => void)(message, data);
      } else {
        console.log(message, data);
      }
    };

  case 'silent':
    return () => {}; // No-op handler

  case 'file':
    if (config && config.filePath) {
      try {
        const handler = new FileOutputHandler(config);
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
    if (config && config.url) {
      const handler = new HttpOutputHandler(config);
      return handler.write;
    }
    console.error('HTTP output handler requires url in config');
    return null;

  default:
    return null;
  }
}

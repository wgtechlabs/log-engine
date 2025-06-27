/**
 * Test utilities for handling async file operations properly
 * Replaces arbitrary timeouts with proper Promise-based waiting
 * Optimized for CI environments with faster polling and shorter timeouts
 */
import * as fs from 'fs';
import * as path from 'path';

// Optimized defaults for CI environments
const DEFAULT_TIMEOUT = 3000; // Reduced from 5000ms
const POLL_INTERVAL = 5; // Reduced from 10ms for faster detection

/**
 * Wait for a file to exist with optimized polling
 */
export async function waitForFile(filePath: string, timeoutMs: number = DEFAULT_TIMEOUT): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
        try {
            await fs.promises.access(filePath, fs.constants.F_OK);
            return; // File exists
        } catch (error) {
            // File doesn't exist yet, wait a bit
            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        }
    }
    
    throw new Error(`File ${filePath} did not appear within ${timeoutMs}ms`);
}

/**
 * Wait for multiple files to exist with parallel checking
 */
export async function waitForFiles(filePaths: string[], timeoutMs: number = DEFAULT_TIMEOUT): Promise<void> {
    await Promise.all(filePaths.map(filePath => waitForFile(filePath, timeoutMs)));
}

/**
 * Wait for a file to have specific content with optimized polling
 */
export async function waitForFileContent(filePath: string, expectedContent: string | RegExp, timeoutMs: number = DEFAULT_TIMEOUT): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
        try {
            const content = await fs.promises.readFile(filePath, 'utf8');
            if (typeof expectedContent === 'string') {
                if (content.includes(expectedContent)) {
                    return;
                }
            } else {
                if (expectedContent.test(content)) {
                    return;
                }
            }
        } catch (error) {
            // File might not exist yet or be readable
        }
        
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
    
    throw new Error(`File ${filePath} did not contain expected content within ${timeoutMs}ms`);
}

/**
 * Wait for a directory to be empty with faster polling
 */
export async function waitForDirectoryEmpty(dirPath: string, timeoutMs: number = DEFAULT_TIMEOUT): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
        try {
            const files = await fs.promises.readdir(dirPath);
            if (files.length === 0) {
                return;
            }
        } catch (error) {
            // Directory might not exist, which is also "empty"
            return;
        }
        
        await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    }
    
    throw new Error(`Directory ${dirPath} was not empty within ${timeoutMs}ms`);
}

/**
 * Safely remove a file with optimized retry logic
 */
export async function safeRemoveFile(filePath: string, maxRetries: number = 3): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await fs.promises.unlink(filePath);
            return;
        } catch (error) {
            if (i === maxRetries - 1) {
                // Only throw on last retry if it's not a "file not found" error
                if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                    throw error;
                }
            } else {
                // Wait a bit before retrying (reduced wait time)
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
    }
}

/**
 * Safely clean up a directory with retry logic
 */
export async function safeCleanupDirectory(dirPath: string): Promise<void> {
    try {
        const files = await fs.promises.readdir(dirPath);
        
        // Remove all files with retry logic
        await Promise.all(files.map(file => 
            safeRemoveFile(path.join(dirPath, file))
        ));
        
        // Remove the directory itself
        await fs.promises.rmdir(dirPath);
    } catch (error) {
        // Directory might not exist, which is fine
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
            // Try force removal as fallback
            try {
                await fs.promises.rm(dirPath, { recursive: true, force: true });
            } catch (fallbackError) {
                // Ignore cleanup errors in tests
            }
        }
    }
}

/**
 * Enhanced mock HTTP handler with faster timeouts and better error handling
 */
export class MockHttpHandler {
    private requests: Array<{
        url: string;
        options: any;
        resolve: () => void;
    }> = [];
    
    private pendingPromises: Array<Promise<void>> = [];

    addRequest(url: string, options: any): void {
        let resolveRequest: () => void;
        const promise = new Promise<void>(resolve => {
            resolveRequest = resolve;
        });
        
        this.requests.push({
            url,
            options,
            resolve: resolveRequest!
        });
        
        this.pendingPromises.push(promise);
    }

    getRequests() {
        return this.requests.map(({ url, options }) => ({ url, options }));
    }

    async waitForRequests(count: number = 1, timeoutMs: number = DEFAULT_TIMEOUT): Promise<void> {
        const startTime = Date.now();
        
        while (this.requests.length < count && Date.now() - startTime < timeoutMs) {
            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        }
        
        if (this.requests.length < count) {
            throw new Error(`Expected ${count} requests but got ${this.requests.length} within ${timeoutMs}ms`);
        }

        // Mark all requests as processed
        this.requests.forEach(req => req.resolve());
        
        // Wait for all pending promises to resolve
        await Promise.all(this.pendingPromises);
    }

    clear(): void {
        this.requests = [];
        this.pendingPromises = [];
    }
}

/**
 * Create a test timeout that fails fast instead of hanging
 */
export function createTestTimeout(timeoutMs: number = DEFAULT_TIMEOUT): Promise<never> {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new Error(`Test timed out after ${timeoutMs}ms`));
        }, timeoutMs);
    });
}

/**
 * Race a promise against a timeout for fail-fast behavior
 */
export async function withTimeout<T>(promise: Promise<T>, timeoutMs: number = DEFAULT_TIMEOUT): Promise<T> {
    return Promise.race([
        promise,
        createTestTimeout(timeoutMs)
    ]);
}

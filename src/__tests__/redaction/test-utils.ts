/**
 * Shared test utilities for redaction tests
 * Common setup, mocks, and helper functions
 */

// Mock console methods to capture output for integration tests
export const mockConsole = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
};

// Store original console methods
export const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
};

/**
 * Setup console mocks for testing
 */
export function setupConsoleMocks(): void {
    jest.clearAllMocks();
    console.log = mockConsole.log;
    console.warn = mockConsole.warn;
    console.error = mockConsole.error;
}

/**
 * Restore original console methods
 */
export function restoreConsole(): void {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
}

/**
 * Setup environment for testing
 */
export function setupTestEnvironment(): { originalEnv: NodeJS.ProcessEnv } {
    const originalEnv = { ...process.env };
    return { originalEnv };
}

/**
 * Restore environment after testing
 */
export function restoreEnvironment(originalEnv: NodeJS.ProcessEnv): void {
    // Only remove environment variables that were added during the test
    // (i.e., those not present in the originalEnv)
    for (const key in process.env) {
        if (!(key in originalEnv)) {
            delete process.env[key];
        }
    }
    
    // Restore or update variables that existed originally
    for (const key in originalEnv) {
        process.env[key] = originalEnv[key];
    }
}

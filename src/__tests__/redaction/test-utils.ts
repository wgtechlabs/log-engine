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
  // Create a copy of the keys to avoid mutation during iteration
  const currentEnvKeys = Object.keys(process.env);
  for (const key of currentEnvKeys) {
    if (!Object.prototype.hasOwnProperty.call(originalEnv, key)) {
      // Safe deletion using explicit type assertion
      delete (process.env as Record<string, string | undefined>)[key];
    }
  }

  // Restore or update variables that existed originally
  // Iterate over originalEnv keys safely
  const originalEnvKeys = Object.keys(originalEnv);
  for (const key of originalEnvKeys) {
    if (Object.prototype.hasOwnProperty.call(originalEnv, key)) {
      // Safe assignment using explicit access
      (process.env as Record<string, string | undefined>)[key] = originalEnv[key];
    }
  }
}

/**
 * Global Jest setup for Log Engine testing
 * Optimized for CI environments with better error handling
 */

// Global Jest setup to suppress console output during tests
global.console = {
  ...console,
  // Suppress error logs during tests to avoid confusing output
  error: jest.fn(),
  // Keep other console methods for debugging
  log: console.log,
  warn: console.warn,
  info: console.info
};

// Optimized timeout for faster feedback
jest.setTimeout(10000);

// Handle uncaught promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // In test environment, we want to know about these
  if (process.env.NODE_ENV === 'test') {
    throw reason;
  }
});

// Global cleanup optimized for CI
afterAll(async () => {
  // Clear any remaining timers immediately
  jest.clearAllTimers();
  jest.clearAllMocks();
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});

afterEach(async () => {
  // Fast cleanup after each test
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

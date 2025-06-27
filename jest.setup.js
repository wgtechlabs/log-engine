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

// Increase timeout for async operations
jest.setTimeout(30000);

// Add global teardown to ensure clean test environment
afterAll(async () => {
  // Give time for any pending operations to complete
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Clear any remaining timers
  jest.clearAllTimers();
  jest.clearAllMocks();
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
});

afterEach(async () => {
  // Clean up after each test
  jest.restoreAllMocks();
  jest.clearAllMocks();
  
  // Small delay to ensure cleanup completes
  await new Promise(resolve => setTimeout(resolve, 10));
});

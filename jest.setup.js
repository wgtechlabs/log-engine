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

// Add global teardown to ensure clean test environment
afterAll(async () => {
  // Give a small delay to allow any pending operations to complete
  await new Promise(resolve => setTimeout(resolve, 50));
});

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks();
});

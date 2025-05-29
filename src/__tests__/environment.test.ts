/**
 * Tests for environment-based auto-configuration
 * Verifies that LogEngine automatically sets appropriate log levels based on NODE_ENV
 */

import { setupConsoleMocks, restoreConsoleMocks, ConsoleMocks } from './test-utils';

describe('Environment-based configuration', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  let mocks: ConsoleMocks;

  beforeEach(() => {
    // Set up console mocks for output verification
    mocks = setupConsoleMocks();
  });

  afterEach(() => {
    // Restore original NODE_ENV and clean up mocks
    process.env.NODE_ENV = originalNodeEnv;
    restoreConsoleMocks(mocks);
  });

  it('should set WARN level for production environment', () => {
    // Test production environment auto-configuration (reduce noise in production)
    process.env.NODE_ENV = 'production';
    
    // Re-import to trigger fresh environment-based configuration
    jest.resetModules();
    const { LogEngine: ProdLogEngine } = require('../index');
    
    ProdLogEngine.info('Info message');
    ProdLogEngine.warn('Warning message');
    
    // INFO should be filtered, only WARN and above should show
    expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
    expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(1);
  });

  it('should set DEBUG level for development environment', () => {
    // Test development environment auto-configuration (verbose logging for debugging)
    process.env.NODE_ENV = 'development';
    
    jest.resetModules();
    const { LogEngine: DevLogEngine } = require('../index');
    
    DevLogEngine.debug('Debug message');
    
    // DEBUG should be visible in development
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG] Debug message')
    );
  });

  it('should set ERROR level for test environment', () => {
    // Test environment auto-configuration (minimal logging during tests)
    process.env.NODE_ENV = 'test';
    
    jest.resetModules();
    const { LogEngine: TestLogEngine } = require('../index');
    
    TestLogEngine.warn('Warning message');
    TestLogEngine.error('Error message');
    
    // Only ERROR should show in test environment, WARN filtered out
    expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
    expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);
  });

  it('should set INFO level for unknown environments', () => {
    // Test fallback behavior for unrecognized NODE_ENV values
    process.env.NODE_ENV = 'unknown';
    
    jest.resetModules();
    const { LogEngine: UnknownLogEngine } = require('../index');
    
    UnknownLogEngine.debug('Debug message');
    UnknownLogEngine.info('Info message');
    
    // Should default to INFO level (DEBUG filtered, INFO shown)
    expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] Info message')
    );
  });

  it('should set INFO level when NODE_ENV is undefined', () => {
    // Test fallback behavior when NODE_ENV is not set at all
    delete process.env.NODE_ENV;
    
    jest.resetModules();
    const { LogEngine: DefaultLogEngine } = require('../index');
    
    DefaultLogEngine.debug('Debug message');
    DefaultLogEngine.info('Info message');
    
    // Should default to INFO level when NODE_ENV is undefined
    expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] Info message')
    );
  });
});

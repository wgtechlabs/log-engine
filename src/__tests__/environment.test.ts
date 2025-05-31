/**
 * Tests for environment-based auto-configuration
 * Verifies that LogEngine automatically sets appropriate log modes based on NODE_ENV
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

  it('should set INFO mode for production environment', () => {
    // Test production environment auto-configuration (show important info and above)
    process.env.NODE_ENV = 'production';
    
    // Re-import to trigger fresh environment-based configuration
    jest.resetModules();
    const { LogEngine: ProdLogEngine } = require('../index');
    
    ProdLogEngine.debug('Debug message');
    ProdLogEngine.info('Info message');
    ProdLogEngine.warn('Warning message');
    
    // DEBUG should be filtered, INFO and above should show
    expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Info message')
    );
    expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(1);
  });

  it('should set DEBUG mode for development environment', () => {
    // Test development environment auto-configuration (verbose logging for debugging)
    process.env.NODE_ENV = 'development';
    
    jest.resetModules();
    const { LogEngine: DevLogEngine } = require('../index');
    
    DevLogEngine.debug('Debug message');
    
    // DEBUG should be visible in development
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Debug message')
    );
  });

  it('should set WARN mode for staging environment', () => {
    // Test staging environment auto-configuration (focused logging)
    process.env.NODE_ENV = 'staging';
    
    jest.resetModules();
    const { LogEngine: StagingLogEngine } = require('../index');
    
    StagingLogEngine.debug('Debug message');
    StagingLogEngine.info('Info message');
    StagingLogEngine.warn('Warning message');
    
    // Only WARN and above should show in staging
    expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
    expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(1);
  });

  it('should set ERROR mode for test environment', () => {
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

  it('should set INFO mode for unknown environments', () => {
    // Test fallback behavior for unrecognized NODE_ENV values
    process.env.NODE_ENV = 'unknown';
    
    jest.resetModules();
    const { LogEngine: UnknownLogEngine } = require('../index');
    
    UnknownLogEngine.debug('Debug message');
    UnknownLogEngine.info('Info message');
    
    // Should default to INFO mode (DEBUG filtered, INFO shown)
    expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Info message')
    );
  });

  it('should set INFO mode when NODE_ENV is undefined', () => {
    // Test fallback behavior when NODE_ENV is not set at all
    delete process.env.NODE_ENV;
    
    jest.resetModules();
    const { LogEngine: DefaultLogEngine } = require('../index');
    
    DefaultLogEngine.debug('Debug message');
    DefaultLogEngine.info('Info message');
    
    // Should default to INFO mode when NODE_ENV is undefined
    expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('Info message')
    );
  });
});

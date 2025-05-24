import { setupConsoleMocks, restoreConsoleMocks, ConsoleMocks } from './test-utils';

describe('Environment-based configuration', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  let mocks: ConsoleMocks;

  beforeEach(() => {
    // Create fresh mocks for each test
    mocks = setupConsoleMocks();
  });

  afterEach(() => {
    // Restore original NODE_ENV and console methods
    process.env.NODE_ENV = originalNodeEnv;
    restoreConsoleMocks(mocks);
  });

  it('should set WARN level for production environment', () => {
    process.env.NODE_ENV = 'production';
    
    // Re-import to trigger environment-based configuration
    jest.resetModules();
    const { LogEngine: ProdLogEngine } = require('../index');
    
    ProdLogEngine.info('Info message');
    ProdLogEngine.warn('Warning message');
    
    expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
    expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(1);
  });

  it('should set DEBUG level for development environment', () => {
    process.env.NODE_ENV = 'development';
    
    jest.resetModules();
    const { LogEngine: DevLogEngine } = require('../index');
    
    DevLogEngine.debug('Debug message');
    
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG] Debug message')
    );
  });

  it('should set ERROR level for test environment', () => {
    process.env.NODE_ENV = 'test';
    
    jest.resetModules();
    const { LogEngine: TestLogEngine } = require('../index');
    
    TestLogEngine.warn('Warning message');
    TestLogEngine.error('Error message');
    
    expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
    expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);
  });

  it('should set INFO level for unknown environments', () => {
    process.env.NODE_ENV = 'unknown';
    
    jest.resetModules();
    const { LogEngine: UnknownLogEngine } = require('../index');
    
    UnknownLogEngine.debug('Debug message');
    UnknownLogEngine.info('Info message');
    
    expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] Info message')
    );
  });

  it('should set INFO level when NODE_ENV is undefined', () => {
    delete process.env.NODE_ENV;
    
    jest.resetModules();
    const { LogEngine: DefaultLogEngine } = require('../index');
    
    DefaultLogEngine.debug('Debug message');
    DefaultLogEngine.info('Info message');
    
    expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] Info message')
    );
  });
});

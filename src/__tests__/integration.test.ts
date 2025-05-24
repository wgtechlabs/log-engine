import { LogEngine, LogLevel } from '../index';
import { setupConsoleMocks, restoreConsoleMocks, ConsoleMocks } from './test-utils';

describe('Integration tests', () => {
  let mocks: ConsoleMocks;

  beforeEach(() => {
    // Create fresh mocks for each test
    mocks = setupConsoleMocks();
  });

  afterEach(() => {
    // Restore console methods after each test
    restoreConsoleMocks(mocks);
  });

  it('should work end-to-end with multiple log levels', () => {
    LogEngine.configure({ level: LogLevel.INFO });
    
    LogEngine.debug('Debug message');
    LogEngine.info('Info message');
    LogEngine.warn('Warning message');
    LogEngine.error('Error message');
    
    expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
    expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(1);
    expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);
  });

  it('should handle rapid configuration changes', () => {
    LogEngine.configure({ level: LogLevel.DEBUG });
    LogEngine.debug('Debug 1');
    
    LogEngine.configure({ level: LogLevel.ERROR });
    LogEngine.debug('Debug 2');
    LogEngine.error('Error 1');
    
    expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
    expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);
  });

  it('should maintain state across multiple method calls', () => {
    LogEngine.configure({ level: LogLevel.WARN });
    
    for (let i = 0; i < 5; i++) {
      LogEngine.info(`Info ${i}`);
      LogEngine.warn(`Warning ${i}`);
    }
    
    expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
    expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(5);
  });
});

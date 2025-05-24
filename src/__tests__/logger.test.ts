import { Logger } from '../logger';
import { LogLevel } from '../types';
import { setupConsoleMocks, restoreConsoleMocks, ConsoleMocks } from './test-utils';

describe('Logger class', () => {
  let logger: Logger;
  let mocks: ConsoleMocks;

  beforeEach(() => {
    logger = new Logger();
    // Create fresh mocks for each test
    mocks = setupConsoleMocks();
  });

  afterEach(() => {
    // Restore console methods after each test
    restoreConsoleMocks(mocks);
  });

  it('should have default log level of INFO', () => {
    logger.info('Info message');
    logger.debug('Debug message');
    
    expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] Info message')
    );
  });

  it('should allow configuration changes', () => {
    logger.configure({ level: LogLevel.DEBUG });
    logger.debug('Debug message');
    
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('[DEBUG] Debug message')
    );
  });

  it('should filter messages based on configured level', () => {
    logger.configure({ level: LogLevel.WARN });
    
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
    
    expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
    expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(1);
    expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);
  });
});

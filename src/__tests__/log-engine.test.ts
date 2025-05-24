import { LogEngine, LogLevel } from '../index';
import { setupConsoleMocks, restoreConsoleMocks, ConsoleMocks } from './test-utils';

describe('LogEngine', () => {
  let mocks: ConsoleMocks;

  beforeEach(() => {
    // Create fresh mocks for each test
    mocks = setupConsoleMocks();
    
    // Reset LogEngine to default state
    LogEngine.configure({ level: LogLevel.INFO });
  });

  afterEach(() => {
    // Restore console methods after each test
    restoreConsoleMocks(mocks);
  });

  describe('Basic logging functionality', () => {
    it('should log debug messages when level is DEBUG', () => {
      LogEngine.configure({ level: LogLevel.DEBUG });
      LogEngine.debug('Debug message');
      
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Debug message')
      );
    });

    it('should log info messages when level is INFO or lower', () => {
      LogEngine.configure({ level: LogLevel.INFO });
      LogEngine.info('Info message');
      
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] Info message')
      );
    });

    it('should log warn messages when level is WARN or lower', () => {
      LogEngine.configure({ level: LogLevel.WARN });
      LogEngine.warn('Warning message');
      
      expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleWarn).toHaveBeenCalledWith(
        expect.stringContaining('[WARN] Warning message')
      );
    });

    it('should log error messages when level is ERROR or lower', () => {
      LogEngine.configure({ level: LogLevel.ERROR });
      LogEngine.error('Error message');
      
      expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleError).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Error message')
      );
    });
  });

  describe('Log level filtering', () => {
    it('should not log debug messages when level is INFO', () => {
      LogEngine.configure({ level: LogLevel.INFO });
      LogEngine.debug('Debug message');
      
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should not log info messages when level is WARN', () => {
      LogEngine.configure({ level: LogLevel.WARN });
      LogEngine.info('Info message');
      
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
    });

    it('should not log warn messages when level is ERROR', () => {
      LogEngine.configure({ level: LogLevel.ERROR });
      LogEngine.warn('Warning message');
      
      expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
    });

    it('should not log any messages when level is SILENT', () => {
      LogEngine.configure({ level: LogLevel.SILENT });
      LogEngine.debug('Debug message');
      LogEngine.info('Info message');
      LogEngine.warn('Warning message');
      LogEngine.error('Error message');
      
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
      expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
      expect(mocks.mockConsoleError).not.toHaveBeenCalled();
    });
  });

  describe('Configuration', () => {
    it('should accept partial configuration', () => {
      LogEngine.configure({ level: LogLevel.DEBUG });
      LogEngine.debug('Debug message');
      
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Debug message')
      );
    });

    it('should maintain configuration between calls', () => {
      LogEngine.configure({ level: LogLevel.ERROR });
      LogEngine.info('Should not appear');
      LogEngine.error('Should appear');
      
      expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
      expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);
    });
  });
});



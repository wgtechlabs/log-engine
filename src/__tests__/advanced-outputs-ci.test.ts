/**
 * Simplified test suite for Phase 3 Advanced Output Handlers - CI Version
 * Tests core functionality without complex file I/O operations
 */

import { LogEngine, LogMode } from '../index';

describe('Phase 3: Advanced Output Handlers (CI)', () => {
  beforeEach(() => {
    // Reset to default configuration
    LogEngine.configure({
      mode: LogMode.DEBUG,
      outputs: undefined,
      enhancedOutputs: undefined,
      advancedOutputConfig: undefined,
      suppressConsoleOutput: false
    });
  });

  afterEach(() => {
    // Reset configuration
    LogEngine.configure({ mode: LogMode.INFO });
  });

  describe('Enhanced Output Targets', () => {
    test('should support configured handler objects in enhancedOutputs', () => {
      const mockHandler = jest.fn();

      LogEngine.configure({
        enhancedOutputs: [
          'silent',  // Use silent instead of console to avoid output
          mockHandler
        ],
        suppressConsoleOutput: true
      });

      LogEngine.info('Test message', { test: 'data' });

      expect(mockHandler).toHaveBeenCalledWith(
        'info',
        expect.stringContaining('Test message'),
        { test: 'data' }
      );
    });

    test('should support mixed enhancedOutputs with built-in strings and objects', () => {
      const mockHandler1 = jest.fn();
      const mockHandler2 = jest.fn();

      LogEngine.configure({
        enhancedOutputs: [
          mockHandler1,
          'silent',
          mockHandler2
        ],
        suppressConsoleOutput: true
      });

      LogEngine.warn('Warning message');

      expect(mockHandler1).toHaveBeenCalledWith('warn', expect.stringContaining('Warning message'), undefined);
      expect(mockHandler2).toHaveBeenCalledWith('warn', expect.stringContaining('Warning message'), undefined);
    });
  });

  describe('Error Handling', () => {
    test('should continue processing other outputs when one fails', () => {
      const failingHandler = jest.fn().mockImplementation(() => {
        throw new Error('Handler failed');
      });
      const workingHandler = jest.fn();

      LogEngine.configure({
        enhancedOutputs: [
          failingHandler,
          workingHandler
        ],
        suppressConsoleOutput: true
      });

      LogEngine.error('Error message');

      expect(failingHandler).toHaveBeenCalled();
      expect(workingHandler).toHaveBeenCalledWith('error', expect.stringContaining('Error message'), undefined);
    });
  });

  describe('Backward Compatibility', () => {
    test('should maintain compatibility with Phase 1 outputHandler', () => {
      const legacyHandler = jest.fn();

      LogEngine.configure({
        outputHandler: legacyHandler,
        suppressConsoleOutput: true
      });

      LogEngine.info('Legacy test');

      expect(legacyHandler).toHaveBeenCalledWith('info', expect.stringContaining('Legacy test'), undefined);
    });

    test('should maintain compatibility with Phase 2 outputs array', () => {
      const mockHandler = jest.fn();

      LogEngine.configure({
        outputs: [mockHandler, 'silent'],
        suppressConsoleOutput: true
      });

      LogEngine.log('Phase 2 test');

      expect(mockHandler).toHaveBeenCalledWith('log', expect.stringContaining('Phase 2 test'), undefined);
    });
  });
});

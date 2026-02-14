/**
 * Tests for per-call emoji override functionality
 * Verifies that emoji can be overridden on individual log calls
 */

import { LogFormatter } from '../formatter';
import { LogLevel } from '../types';
import { EmojiSelector } from '../formatter/emoji-selector';
import { Logger } from '../logger/core';

describe('Per-Call Emoji Override', () => {
  beforeEach(() => {
    // Reset emoji selector before each test
    EmojiSelector.reset();
  });

  describe('LogFormatter emoji override', () => {
    it('should use override emoji when provided via options', () => {
      const formatted = LogFormatter.format(
        LogLevel.INFO,
        'Database initialized',
        undefined,
        undefined,
        { emoji: '✅' }
      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      // Should contain override emoji, not auto-detected emoji
      expect(cleanFormatted).toContain('[✅]');
      expect(cleanFormatted).toMatch(/\[INFO\]\[✅\]: Database initialized$/);
    });

    it('should use override emoji even when message has keyword match', () => {
      const formatted = LogFormatter.format(
        LogLevel.ERROR,
        'Database connection failed',
        undefined,
        undefined,
        { emoji: '🔴' }
      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      // Should contain override emoji, not database emoji (🗃️)
      expect(cleanFormatted).toContain('[🔴]');
      expect(cleanFormatted).not.toContain('[🗃️]');
      expect(cleanFormatted).toMatch(/\[ERROR\]\[🔴\]: Database connection failed$/);
    });

    it('should use auto-detected emoji when no override provided', () => {
      const formatted = LogFormatter.format(
        LogLevel.ERROR,
        'Database connection failed',
        undefined,
        undefined
      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      // Should contain auto-detected database emoji
      expect(cleanFormatted).toContain('[🗃️]');
      expect(cleanFormatted).toMatch(/\[ERROR\]\[🗃️\]: Database connection failed$/);
    });

    it('should suppress emoji when override is empty string', () => {
      const formatted = LogFormatter.format(
        LogLevel.INFO,
        'Database initialized',
        undefined,
        undefined,
        { emoji: '' }
      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      // Should not contain any emoji brackets
      expect(cleanFormatted).not.toMatch(/\[🗃️\]/);
      expect(cleanFormatted).not.toMatch(/\[✅\]/);
      expect(cleanFormatted).not.toMatch(/\[ℹ️\]/);
      expect(cleanFormatted).toMatch(/\[INFO\]: Database initialized$/);
    });

    it('should respect includeEmoji: false even with override emoji', () => {
      const formatted = LogFormatter.format(
        LogLevel.INFO,
        'Test message',
        undefined,
        { includeEmoji: false },
        { emoji: '✅' }
      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      // Should not include emoji when globally disabled
      expect(cleanFormatted).not.toContain('[✅]');
      expect(cleanFormatted).toMatch(/\[INFO\]: Test message$/);
    });
  });

  describe('Logger method emoji override', () => {
    let logger: Logger;
    let capturedOutput: { level: string; message: string }[];

    beforeEach(() => {
      logger = new Logger();
      capturedOutput = [];

      // Configure logger to capture output with INFO mode to see all log levels
      logger.configure({
        mode: 1, // LogMode.INFO
        outputs: [(level: string, message: string) => {
          capturedOutput.push({ level, message });
        }]
      });
    });

    it('should override emoji in logger.info() with options', () => {
      logger.info('Config engine initialized', undefined, { emoji: '✅' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[✅]');
      expect(cleanMessage).toMatch(/\[INFO\]\[✅\]: Config engine initialized$/);
    });

    it('should override emoji in logger.error() with options', () => {
      logger.error('Critical failure', undefined, { emoji: '💥' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[💥]');
      expect(cleanMessage).toMatch(/\[ERROR\]\[💥\]: Critical failure$/);
    });

    it('should override emoji in logger.debug() with options', () => {
      logger.configure({ mode: 0 }); // Enable DEBUG mode
      logger.debug('Debugging info', undefined, { emoji: '🔍' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[🔍]');
      expect(cleanMessage).toMatch(/\[DEBUG\]\[🔍\]: Debugging info$/);
    });

    it('should override emoji in logger.warn() with options', () => {
      logger.warn('Low disk space', undefined, { emoji: '💾' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[💾]');
      expect(cleanMessage).toMatch(/\[WARN\]\[💾\]: Low disk space$/);
    });

    it('should override emoji in logger.log() with options', () => {
      logger.log('System ready', undefined, { emoji: '🚀' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[🚀]');
      expect(cleanMessage).toMatch(/\[LOG\]\[🚀\]: System ready$/);
    });

    it('should work with data parameter and emoji override', () => {
      logger.info('User logged in', { userId: 123 }, { emoji: '👤' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[👤]');
      expect(cleanMessage).toMatch(/\[INFO\]\[👤\]: User logged in/);
      expect(cleanMessage).toContain('userId');
    });

    it('should maintain backward compatibility when options not provided', () => {
      logger.info('Database initialized');

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      // Should use auto-detected or fallback emoji
      expect(cleanMessage).toMatch(/\[INFO\]\[.+\]: Database initialized$/);
    });
  });

  describe('Raw logging methods with emoji override', () => {
    let logger: Logger;
    let capturedOutput: { level: string; message: string }[];

    beforeEach(() => {
      logger = new Logger();
      capturedOutput = [];

      logger.configure({
        mode: 1, // LogMode.INFO
        outputs: [(level: string, message: string) => {
          capturedOutput.push({ level, message });
        }]
      });
    });

    it('should override emoji in debugRaw() with options', () => {
      logger.configure({ mode: 0 }); // Enable DEBUG mode
      logger.debugRaw('Debug output', { secret: 'password123' }, { emoji: '🔐' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[🔐]');
      expect(cleanMessage).toMatch(/\[DEBUG\]\[🔐\]: Debug output/);
      // Raw methods should not redact
      expect(cleanMessage).toContain('password123');
    });

    it('should override emoji in infoRaw() with options', () => {
      logger.infoRaw('Info output', undefined, { emoji: '📝' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[📝]');
      expect(cleanMessage).toMatch(/\[INFO\]\[📝\]: Info output$/);
    });

    it('should override emoji in warnRaw() with options', () => {
      logger.warnRaw('Warning output', undefined, { emoji: '🚨' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[🚨]');
      expect(cleanMessage).toMatch(/\[WARN\]\[🚨\]: Warning output$/);
    });

    it('should override emoji in errorRaw() with options', () => {
      logger.errorRaw('Error output', undefined, { emoji: '☠️' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[☠️]');
      expect(cleanMessage).toMatch(/\[ERROR\]\[☠️\]: Error output$/);
    });

    it('should override emoji in logRaw() with options', () => {
      logger.logRaw('Log output', undefined, { emoji: '📋' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[📋]');
      expect(cleanMessage).toMatch(/\[LOG\]\[📋\]: Log output$/);
    });
  });

  describe('Real-world use cases', () => {
    let logger: Logger;
    let capturedOutput: { level: string; message: string }[];

    beforeEach(() => {
      logger = new Logger();
      capturedOutput = [];

      logger.configure({
        mode: 1, // LogMode.INFO
        outputs: [(level: string, message: string) => {
          capturedOutput.push({ level, message });
        }]
      });
    });

    it('should prevent duplicate emoji when caller wants specific emoji', () => {
      // Before: logger.info('✅ Config engine initialized') would result in [ℹ️]: ✅ Config engine...
      // After: logger.info('Config engine initialized', undefined, { emoji: '✅' })
      logger.info('Config engine initialized', undefined, { emoji: '✅' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');

      // Should have emoji only in the element, not in message
      expect(cleanMessage).toContain('[✅]');
      expect(cleanMessage).toMatch(/\[INFO\]\[✅\]: Config engine initialized$/);
      // Should not have duplicate emoji in message
      expect(cleanMessage).not.toMatch(/\[INFO\]\[.+\]: ✅/);
    });

    it('should allow custom robot emoji for AI/bot messages', () => {
      logger.info('Heartware initialized', undefined, { emoji: '🤖' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[🤖]');
      expect(cleanMessage).toMatch(/\[INFO\]\[🤖\]: Heartware initialized$/);
    });

    it('should allow mix of override and auto-detected emoji in same session', () => {
      logger.info('Database initialized', undefined, { emoji: '✅' });
      logger.info('Starting API server'); // Auto-detected
      logger.error('Connection failed', undefined, { emoji: '🔴' });

      expect(capturedOutput).toHaveLength(3);

      const clean1 = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(clean1).toContain('[✅]');

      const clean2 = capturedOutput[1].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(clean2).toMatch(/\[INFO\]\[.+\]: Starting API server$/);

      const clean3 = capturedOutput[2].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(clean3).toContain('[🔴]');
    });
  });

  describe('LogEngine wrapper emoji override', () => {
    let capturedOutput: { level: string; message: string }[];

    beforeEach(() => {
      capturedOutput = [];
    });

    it('should pass emoji override through LogEngine.info()', async () => {
      const { LogEngine } = await import('../index');

      LogEngine.configure({
        mode: 1, // LogMode.INFO
        outputs: [(level: string, message: string) => {
          capturedOutput.push({ level, message });
        }]
      });

      LogEngine.info('Database initialized', undefined, { emoji: '✅' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[✅]');
      expect(cleanMessage).toMatch(/\[INFO\]\[✅\]: Database initialized$/);
    });

    it('should pass emoji override through LogEngine.error()', async () => {
      const { LogEngine } = await import('../index');

      LogEngine.configure({
        mode: 1, // LogMode.INFO
        outputs: [(level: string, message: string) => {
          capturedOutput.push({ level, message });
        }]
      });

      LogEngine.error('Critical failure', undefined, { emoji: '💥' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[💥]');
      expect(cleanMessage).toMatch(/\[ERROR\]\[💥\]: Critical failure$/);
    });

    it('should pass emoji override through LogEngine.debug()', async () => {
      const { LogEngine } = await import('../index');

      LogEngine.configure({
        mode: 0, // LogMode.DEBUG
        outputs: [(level: string, message: string) => {
          capturedOutput.push({ level, message });
        }]
      });

      LogEngine.debug('Debug info', undefined, { emoji: '🔍' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[🔍]');
      expect(cleanMessage).toMatch(/\[DEBUG\]\[🔍\]: Debug info$/);
    });

    it('should pass emoji override through LogEngine.warn()', async () => {
      const { LogEngine } = await import('../index');

      LogEngine.configure({
        mode: 1, // LogMode.INFO
        outputs: [(level: string, message: string) => {
          capturedOutput.push({ level, message });
        }]
      });

      LogEngine.warn('Low memory', undefined, { emoji: '💾' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[💾]');
      expect(cleanMessage).toMatch(/\[WARN\]\[💾\]: Low memory$/);
    });

    it('should pass emoji override through LogEngine.log()', async () => {
      const { LogEngine } = await import('../index');

      LogEngine.configure({
        mode: 1, // LogMode.INFO
        outputs: [(level: string, message: string) => {
          capturedOutput.push({ level, message });
        }]
      });

      LogEngine.log('System started', undefined, { emoji: '🚀' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[🚀]');
      expect(cleanMessage).toMatch(/\[LOG\]\[🚀\]: System started$/);
    });

    it('should pass emoji override through LogEngine.infoRaw()', async () => {
      const { LogEngine } = await import('../index');

      LogEngine.configure({
        mode: 1, // LogMode.INFO
        outputs: [(level: string, message: string) => {
          capturedOutput.push({ level, message });
        }]
      });

      LogEngine.infoRaw('Raw info', { secret: 'data' }, { emoji: '📝' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[📝]');
      expect(cleanMessage).toMatch(/\[INFO\]\[📝\]: Raw info/);
      // Raw methods should not redact
      expect(cleanMessage).toContain('secret');
    });

    it('should pass emoji override through LogEngine.withoutRedaction()', async () => {
      const { LogEngine } = await import('../index');

      LogEngine.configure({
        mode: 1, // LogMode.INFO
        outputs: [(level: string, message: string) => {
          capturedOutput.push({ level, message });
        }]
      });

      LogEngine.withoutRedaction().info('Unredacted', { password: 'secret' }, { emoji: '🔓' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      expect(cleanMessage).toContain('[🔓]');
      expect(cleanMessage).toMatch(/\[INFO\]\[🔓\]: Unredacted/);
      // withoutRedaction should not redact
      expect(cleanMessage).toContain('password');
    });

    it('should allow suppressing emoji via empty string through LogEngine', async () => {
      const { LogEngine } = await import('../index');

      LogEngine.configure({
        mode: 1, // LogMode.INFO
        outputs: [(level: string, message: string) => {
          capturedOutput.push({ level, message });
        }]
      });

      LogEngine.info('Plain message', undefined, { emoji: '' });

      expect(capturedOutput).toHaveLength(1);
      const cleanMessage = capturedOutput[0].message.replace(/\x1b\[[0-9;]*m/g, '');
      // Should not have emoji brackets (like [✅]) between [INFO] and the colon
      expect(cleanMessage).not.toMatch(/\[INFO\]\[.+\]:/);
      expect(cleanMessage).toMatch(/\[INFO\]: Plain message$/);
    });
  });
});

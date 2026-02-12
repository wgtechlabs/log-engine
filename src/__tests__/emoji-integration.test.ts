/**
 * Integration tests for emoji feature in log formatting
 * Verifies that emoji are correctly integrated into log output
 */

import { LogFormatter } from '../formatter';
import { LogLevel, LogMode } from '../types';
import { EmojiSelector } from '../formatter/emoji-selector';
import { Logger } from '../logger/core';

describe('Emoji Integration with LogFormatter', () => {
  beforeEach(() => {
    // Reset emoji selector before each test
    EmojiSelector.reset();
  });

  describe('Default Behavior (Emoji Enabled)', () => {
    it('should include emoji by default', () => {
      const formatted = LogFormatter.format(LogLevel.INFO, 'General information');
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      // Should contain fallback INFO emoji
      expect(cleanFormatted).toContain('[ℹ️]');

      // Should follow format: [ISO_TIMESTAMP][LOCAL_TIME][LEVEL][EMOJI]: message
      expect(cleanFormatted).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]\[\d{1,2}:\d{2}[AP]M\]\[INFO\]\[ℹ️\]: General information$/);
    });

    it('should not include emoji when explicitly disabled', () => {
      const formatted = LogFormatter.format(
        LogLevel.INFO,
        'Test message',
        undefined,
        { includeEmoji: false }
      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      // Should not contain emoji brackets
      expect(cleanFormatted).not.toMatch(/\[🐛\]/);
      expect(cleanFormatted).not.toMatch(/\[ℹ️\]/);

      // Should follow format: [ISO_TIMESTAMP][LOCAL_TIME][LEVEL]: message
      expect(cleanFormatted).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]\[\d{1,2}:\d{2}[AP]M\]\[INFO\]: Test message$/);
    });
  });

  describe('Emoji Enabled with Context', () => {
    it('should include context-aware emoji in formatted output', () => {
      const formatted = LogFormatter.format(
        LogLevel.ERROR,
        'Database connection failed'
      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      // Should include database emoji
      expect(cleanFormatted).toContain('[🗃️]');

      // Should follow format: [ISO_TIMESTAMP][LOCAL_TIME][LEVEL][EMOJI]: message
      expect(cleanFormatted).toMatch(/\[ERROR\]\[🗃️\]: Database connection failed$/);
    });

    it('should include bug emoji for bug-related messages', () => {
      const formatted = LogFormatter.format(
        LogLevel.ERROR,
        'Fixed a bug in the system'
      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      expect(cleanFormatted).toContain('[🐛]');
      expect(cleanFormatted).toMatch(/\[ERROR\]\[🐛\]: Fixed a bug in the system$/);
    });

    it('should include deploy emoji for deployment messages', () => {
      const formatted = LogFormatter.format(
        LogLevel.INFO,
        'Deployed to production',
        undefined,

      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      expect(cleanFormatted).toContain('[🚀]');
      expect(cleanFormatted).toMatch(/\[INFO\]\[🚀\]: Deployed to production$/);
    });

    it('should include performance emoji for performance messages', () => {
      const formatted = LogFormatter.format(
        LogLevel.WARN,
        'Performance issues detected',
        undefined,

      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      expect(cleanFormatted).toContain('[⚡️]');
      expect(cleanFormatted).toMatch(/\[WARN\]\[⚡️\]: Performance issues detected$/);
    });

    it('should include security emoji for security messages', () => {
      const formatted = LogFormatter.format(
        LogLevel.ERROR,
        'Security breach detected',
        undefined,

      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      expect(cleanFormatted).toContain('[🔒️]');
      expect(cleanFormatted).toMatch(/\[ERROR\]\[🔒️\]: Security breach detected$/);
    });
  });

  describe('Emoji Enabled with Fallback', () => {
    it('should use fallback emoji for DEBUG when no context match', () => {
      const formatted = LogFormatter.format(
        LogLevel.DEBUG,
        'Random debug information',
        undefined,

      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      expect(cleanFormatted).toContain('[🐞]');
      expect(cleanFormatted).toMatch(/\[DEBUG\]\[🐞\]: Random debug information$/);
    });

    it('should use fallback emoji for INFO when no context match', () => {
      const formatted = LogFormatter.format(
        LogLevel.INFO,
        'General information',
        undefined,

      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      expect(cleanFormatted).toContain('[ℹ️]');
      expect(cleanFormatted).toMatch(/\[INFO\]\[ℹ️\]: General information$/);
    });

    it('should use fallback emoji for WARN when no context match', () => {
      const formatted = LogFormatter.format(
        LogLevel.WARN,
        'Generic warning',
        undefined,

      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      expect(cleanFormatted).toContain('[⚠️]');
      expect(cleanFormatted).toMatch(/\[WARN\]\[⚠️\]: Generic warning$/);
    });

    it('should use fallback emoji for ERROR when no context match', () => {
      const formatted = LogFormatter.format(
        LogLevel.ERROR,
        'Unknown error occurred',
        undefined,

      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      expect(cleanFormatted).toContain('[❌]');
      expect(cleanFormatted).toMatch(/\[ERROR\]\[❌\]: Unknown error occurred$/);
    });

    it('should use fallback emoji for LOG when no context match', () => {
      const formatted = LogFormatter.format(
        LogLevel.LOG,
        'Application started',
        undefined,

      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      expect(cleanFormatted).toContain('[✅]');
      expect(cleanFormatted).toMatch(/\[LOG\]\[✅\]: Application started$/);
    });
  });

  describe('Emoji with Data', () => {
    it('should include emoji when data is present', () => {
      const formatted = LogFormatter.format(
        LogLevel.INFO,
        'User logged in',
        { username: 'john', timestamp: Date.now() },

      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      // Should include fallback INFO emoji
      expect(cleanFormatted).toContain('[ℹ️]');

      // Should include data
      expect(cleanFormatted).toContain('username');
      expect(cleanFormatted).toContain('john');
    });

    it('should analyze data for context-aware emoji selection', () => {
      const formatted = LogFormatter.format(
        LogLevel.INFO,
        'Operation completed',
        { database: 'postgres', query: 'SELECT * FROM users' },

      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      // Should detect database context from data
      expect(cleanFormatted).toContain('[🗃️]');
    });
  });

  describe('Custom Emoji Configuration', () => {
    it('should use custom emoji mappings', () => {
      // Configure EmojiSelector with custom mappings
      EmojiSelector.configure({
        customMappings: [
          { emoji: '🎯', code: ':dart:', description: 'Target', keywords: ['target'] }
        ]
      });

      const formatted = LogFormatter.format(
        LogLevel.INFO,
        'Custom target achieved',
        undefined,
        { includeEmoji: true }
      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      expect(cleanFormatted).toContain('[🎯]');

      // Reset after test
      EmojiSelector.reset();
    });

    it('should use custom fallback emojis', () => {
      // Configure EmojiSelector with custom fallbacks
      EmojiSelector.configure({
        customFallbacks: { INFO: '📢' }
      });

      const formatted = LogFormatter.format(
        LogLevel.INFO,
        'Unknown event',
        undefined,
        { includeEmoji: true }
      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      expect(cleanFormatted).toContain('[📢]');

      // Reset after test
      EmojiSelector.reset();
    });
  });

  describe('Emoji Position in Output Format', () => {
    it('should place emoji between level and message', () => {
      const formatted = LogFormatter.format(
        LogLevel.INFO,
        'Deploy started',
        undefined,

      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      // Verify exact format: [TIMESTAMP][LEVEL][EMOJI]: message
      const pattern = /\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]\[\d{1,2}:\d{2}[AP]M\]\[INFO\]\[🚀\]: Deploy started$/;
      expect(cleanFormatted).toMatch(pattern);
    });

    it('should maintain correct spacing with emoji', () => {
      const formatted = LogFormatter.format(
        LogLevel.ERROR,
        'Database error',
        undefined,

      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      // Should have colon and space after emoji bracket
      expect(cleanFormatted).toContain('[🗃️]: Database error');
      expect(cleanFormatted).not.toContain('[🗃️]:Database error'); // No missing space
    });
  });

  describe('Emoji with Timestamp Configuration', () => {
    it('should work with ISO timestamp only', () => {
      const formatted = LogFormatter.format(
        LogLevel.INFO,
        'Test message',
        undefined,
        {
          includeIsoTimestamp: true,
          includeLocalTime: false,

        }
      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      expect(cleanFormatted).toContain('[ℹ️]');
      expect(cleanFormatted).toMatch(/^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\]\[INFO\]\[ℹ️\]: Test message$/);
    });

    it('should work with local time only', () => {
      const formatted = LogFormatter.format(
        LogLevel.INFO,
        'Test message',
        undefined,
        {
          includeIsoTimestamp: false,
          includeLocalTime: true,

        }
      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      expect(cleanFormatted).toContain('[ℹ️]');
      expect(cleanFormatted).toMatch(/^\[\d{1,2}:\d{2}[AP]M\]\[INFO\]\[ℹ️\]: Test message$/);
    });

    it('should work with no timestamps', () => {
      const formatted = LogFormatter.format(
        LogLevel.INFO,
        'Test message',
        undefined,
        {
          includeIsoTimestamp: false,
          includeLocalTime: false,

        }
      );
      const cleanFormatted = formatted.replace(/\x1b\[[0-9;]*m/g, '');

      expect(cleanFormatted).toContain('[ℹ️]');
      expect(cleanFormatted).toMatch(/^\[INFO\]\[ℹ️\]: Test message$/);
    });
  });

  describe('Logger.configure Emoji Configuration', () => {
    let logger: Logger;
    let consoleOutput: string[];

    beforeEach(() => {
      logger = new Logger();
      consoleOutput = [];
      jest.spyOn(console, 'log').mockImplementation((...args: any[]) => {
        consoleOutput.push(args.map(String).join(' '));
      });
      jest.spyOn(console, 'error').mockImplementation((...args: any[]) => {
        consoleOutput.push(args.map(String).join(' '));
      });
      jest.spyOn(console, 'warn').mockImplementation((...args: any[]) => {
        consoleOutput.push(args.map(String).join(' '));
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
      EmojiSelector.reset();
    });

    it('should configure emoji selector when format.emoji is provided', () => {
      logger.configure({
        mode: LogMode.DEBUG,
        format: {
          emoji: {
            customMappings: [
              { emoji: '💰', code: ':moneybag:', description: 'Payment', keywords: ['payment'] }
            ]
          }
        }
      });

      logger.info('Payment processed');
      expect(consoleOutput).toHaveLength(1);

      const clean = consoleOutput[0].replace(/\x1b\[[0-9;]*m/g, '');
      expect(clean).toContain('[💰]');
    });

    it('should reset emoji selector when no format.emoji config is provided', () => {
      // First configure with custom emoji
      logger.configure({
        mode: LogMode.DEBUG,
        format: {
          emoji: {
            customFallbacks: { INFO: '📢' }
          }
        }
      });

      // Then reconfigure with format but without emoji config - should reset to defaults
      logger.configure({
        mode: LogMode.DEBUG,
        format: {
          includeEmoji: true
        }
      });

      logger.info('Generic message');
      expect(consoleOutput).toHaveLength(1);

      const clean = consoleOutput[0].replace(/\x1b\[[0-9;]*m/g, '');
      // Should use default fallback, not custom
      expect(clean).toContain('[ℹ️]');
    });
  });
});

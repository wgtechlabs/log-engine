/**
 * Tests for emoji functionality
 * Verifies context-aware emoji selection and fallback behavior
 */

import { LogLevel } from '../types';
import { EmojiSelector } from '../formatter/emoji-selector';
import { FALLBACK_EMOJI, EMOJI_MAPPINGS } from '../formatter/emoji-data';

describe('EmojiSelector', () => {
  beforeEach(() => {
    // Reset emoji selector before each test
    EmojiSelector.reset();
  });

  describe('Configuration', () => {
    it('should have default configuration', () => {
      const config = EmojiSelector.getConfig();
      expect(config.customMappings).toEqual([]);
      expect(config.customFallbacks).toEqual({});
      expect(config.useCustomOnly).toBe(false);
    });

    it('should configure emoji selector with custom settings', () => {
      const customMappings = [
        { emoji: '🎯', code: ':dart:', description: 'Target', keywords: ['target', 'goal'] }
      ];
      EmojiSelector.configure({ customMappings });
      const config = EmojiSelector.getConfig();
      expect(config.customMappings).toEqual(customMappings);
    });

    it('should support custom mappings', () => {
      const customMappings = [
        { emoji: '🎯', code: ':dart:', description: 'Target', keywords: ['target', 'goal'] }
      ];
      EmojiSelector.configure({ customMappings });
      const config = EmojiSelector.getConfig();
      expect(config.customMappings).toEqual(customMappings);
    });

    it('should support custom fallbacks', () => {
      const customFallbacks = { DEBUG: '🔍', INFO: '📢' };
      EmojiSelector.configure({ customFallbacks });
      const config = EmojiSelector.getConfig();
      expect(config.customFallbacks).toEqual(customFallbacks);
    });

    it('should reset configuration', () => {
      EmojiSelector.configure({ useCustomOnly: true });
      EmojiSelector.reset();
      const config = EmojiSelector.getConfig();
      expect(config.useCustomOnly).toBe(false);
    });
  });

  describe('Emoji Selection - Context-Aware', () => {
    it('should select bug emoji for bug-related messages', () => {
      const emoji = EmojiSelector.selectEmoji(LogLevel.ERROR, 'Fixed a bug in login system');
      expect(emoji).toBe('🐛');
    });

    it('should select database emoji for database-related messages', () => {
      const emoji = EmojiSelector.selectEmoji(LogLevel.ERROR, 'Database connection failed');
      expect(emoji).toBe('🗃️');
    });

    it('should select deploy emoji for deployment messages', () => {
      const emoji = EmojiSelector.selectEmoji(LogLevel.INFO, 'Deployed to production successfully');
      expect(emoji).toBe('🚀');
    });

    it('should select performance emoji for performance messages', () => {
      const emoji = EmojiSelector.selectEmoji(LogLevel.WARN, 'Performance degradation detected');
      expect(emoji).toBe('⚡️');
    });

    it('should select security emoji for security messages', () => {
      const emoji = EmojiSelector.selectEmoji(LogLevel.ERROR, 'Security vulnerability detected');
      expect(emoji).toBe('🔒️');
    });

    it('should select critical hotfix emoji for critical messages', () => {
      const emoji = EmojiSelector.selectEmoji(LogLevel.ERROR, 'Critical system crash requires urgent fix');
      expect(emoji).toBe('🚑️');
    });

    it('should be case-insensitive in keyword matching', () => {
      const emoji1 = EmojiSelector.selectEmoji(LogLevel.INFO, 'DATABASE query completed');
      const emoji2 = EmojiSelector.selectEmoji(LogLevel.INFO, 'database query completed');
      expect(emoji1).toBe('🗃️');
      expect(emoji2).toBe('🗃️');
    });

    it('should use word boundary matching', () => {
      // "fixed" should match, but "fixedwidth" should not match "fix"
      const emoji1 = EmojiSelector.selectEmoji(LogLevel.INFO, 'fixed the issue');
      const emoji2 = EmojiSelector.selectEmoji(LogLevel.INFO, 'fixedwidth font used');
      expect(emoji1).toBe('🐛'); // matches "fix"
      expect(emoji2).toBe('ℹ️'); // no match, falls back
    });

    it('should analyze data object for context', () => {
      const data = { database: 'postgres', table: 'users' };
      const emoji = EmojiSelector.selectEmoji(LogLevel.INFO, 'Operation completed', data);
      expect(emoji).toBe('🗃️');
    });

    it('should handle string data for context', () => {
      const emoji = EmojiSelector.selectEmoji(LogLevel.INFO, 'Event occurred', 'deploy started');
      expect(emoji).toBe('🚀');
    });
  });

  describe('Emoji Selection - Fallback', () => {
    it('should use fallback emoji for DEBUG level when no context match', () => {
      const emoji = EmojiSelector.selectEmoji(LogLevel.DEBUG, 'Random debug message');
      expect(emoji).toBe(FALLBACK_EMOJI.DEBUG);
      expect(emoji).toBe('🐞');
    });

    it('should use fallback emoji for INFO level when no context match', () => {
      const emoji = EmojiSelector.selectEmoji(LogLevel.INFO, 'Random info message');
      expect(emoji).toBe(FALLBACK_EMOJI.INFO);
      expect(emoji).toBe('ℹ️');
    });

    it('should use fallback emoji for WARN level when no context match', () => {
      const emoji = EmojiSelector.selectEmoji(LogLevel.WARN, 'Random warning message');
      expect(emoji).toBe(FALLBACK_EMOJI.WARN);
      expect(emoji).toBe('⚠️');
    });

    it('should use fallback emoji for ERROR level when no context match', () => {
      const emoji = EmojiSelector.selectEmoji(LogLevel.ERROR, 'Random error message');
      expect(emoji).toBe(FALLBACK_EMOJI.ERROR);
      expect(emoji).toBe('❌');
    });

    it('should use fallback emoji for LOG level when no context match', () => {
      const emoji = EmojiSelector.selectEmoji(LogLevel.LOG, 'Random log message');
      expect(emoji).toBe(FALLBACK_EMOJI.LOG);
      expect(emoji).toBe('✅');
    });
  });

  describe('Custom Emoji Configuration', () => {
    it('should prioritize custom mappings over defaults', () => {
      const customMappings = [
        { emoji: '🎯', code: ':dart:', description: 'Custom bug', keywords: ['bug'] }
      ];
      EmojiSelector.configure({ customMappings });
      const emoji = EmojiSelector.selectEmoji(LogLevel.ERROR, 'Bug found');
      expect(emoji).toBe('🎯'); // Custom mapping takes precedence
    });

    it('should use custom mappings exclusively when useCustomOnly is true', () => {
      const customMappings = [
        { emoji: '🎯', code: ':dart:', description: 'Target', keywords: ['target'] }
      ];
      EmojiSelector.configure({ customMappings, useCustomOnly: true });

      const emoji1 = EmojiSelector.selectEmoji(LogLevel.INFO, 'Target acquired');
      const emoji2 = EmojiSelector.selectEmoji(LogLevel.ERROR, 'Bug found'); // "bug" not in custom

      expect(emoji1).toBe('🎯');
      expect(emoji2).toBe('❌'); // Falls back to level emoji
    });

    it('should use custom fallback emojis', () => {
      const customFallbacks = { INFO: '📢', ERROR: '💀' };
      EmojiSelector.configure({ customFallbacks });

      const emoji1 = EmojiSelector.selectEmoji(LogLevel.INFO, 'Random event happened');
      const emoji2 = EmojiSelector.selectEmoji(LogLevel.ERROR, 'Something went wrong');

      expect(emoji1).toBe('📢');
      expect(emoji2).toBe('💀');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty messages', () => {
      const emoji = EmojiSelector.selectEmoji(LogLevel.INFO, '');
      expect(emoji).toBe(FALLBACK_EMOJI.INFO);
    });

    it('should handle messages with only whitespace', () => {
      const emoji = EmojiSelector.selectEmoji(LogLevel.INFO, '   ');
      expect(emoji).toBe(FALLBACK_EMOJI.INFO);
    });

    it('should handle circular references in data without crashing', () => {
      const circularData: any = { name: 'test' };
      circularData.self = circularData;

      // Should not throw
      expect(() => {
        EmojiSelector.selectEmoji(LogLevel.INFO, 'Test message', circularData);
      }).not.toThrow();
    });

    it('should handle null data', () => {
      const emoji = EmojiSelector.selectEmoji(LogLevel.INFO, 'Test message', null);
      expect(emoji).toBe(FALLBACK_EMOJI.INFO);
    });

    it('should handle undefined data', () => {
      const emoji = EmojiSelector.selectEmoji(LogLevel.INFO, 'Test message', undefined);
      expect(emoji).toBe(FALLBACK_EMOJI.INFO);
    });
  });

  describe('Multiple Keyword Matches', () => {
    it('should return first matching emoji when multiple keywords match', () => {
      // Message contains both "bug" and "database" keywords
      // Should return the first match found in the mappings array
      const emoji = EmojiSelector.selectEmoji(LogLevel.ERROR, 'Fixed bug in database query');

      // The emoji should be one of the valid matches (order depends on EMOJI_MAPPINGS)
      const validEmojis = ['🐛', '🗃️'];
      expect(validEmojis).toContain(emoji);
    });
  });

  describe('Data Structure', () => {
    it('should have valid EMOJI_MAPPINGS structure', () => {
      expect(Array.isArray(EMOJI_MAPPINGS)).toBe(true);
      expect(EMOJI_MAPPINGS.length).toBeGreaterThan(0);

      EMOJI_MAPPINGS.forEach(mapping => {
        expect(mapping).toHaveProperty('emoji');
        expect(mapping).toHaveProperty('code');
        expect(mapping).toHaveProperty('description');
        expect(mapping).toHaveProperty('keywords');
        expect(Array.isArray(mapping.keywords)).toBe(true);
        expect(typeof mapping.emoji).toBe('string');
        expect(typeof mapping.code).toBe('string');
        expect(typeof mapping.description).toBe('string');
      });
    });

    it('should have valid FALLBACK_EMOJI structure', () => {
      expect(FALLBACK_EMOJI).toHaveProperty('DEBUG');
      expect(FALLBACK_EMOJI).toHaveProperty('INFO');
      expect(FALLBACK_EMOJI).toHaveProperty('WARN');
      expect(FALLBACK_EMOJI).toHaveProperty('ERROR');
      expect(FALLBACK_EMOJI).toHaveProperty('LOG');

      expect(FALLBACK_EMOJI.DEBUG).toBe('🐞');
      expect(FALLBACK_EMOJI.INFO).toBe('ℹ️');
      expect(FALLBACK_EMOJI.WARN).toBe('⚠️');
      expect(FALLBACK_EMOJI.ERROR).toBe('❌');
      expect(FALLBACK_EMOJI.LOG).toBe('✅');
    });
  });
});

/**
 * Emoji selector for context-aware logging
 * Analyzes log messages to select appropriate emoji based on context
 */

import { LogLevel, LogData, EmojiConfig, EmojiMapping } from '../types';
import { EMOJI_MAPPINGS, FALLBACK_EMOJI } from './emoji-data';

/**
 * Compiled emoji mapping with precompiled regex for performance
 */
interface CompiledEmojiMapping {
  emoji: string;
  code: string;
  description?: string;
  keywords: string[];
  regexes: RegExp[];
}

/**
 * Emoji selector class
 * Provides context-aware emoji selection for log messages
 */
export class EmojiSelector {
  private static config: EmojiConfig = {
    customMappings: [],
    customFallbacks: {},
    useCustomOnly: false
  };

  // Cache for precompiled regex patterns
  private static compiledMappings: CompiledEmojiMapping[] | null = null;

  /**
   * Configure the emoji selector
   * @param config - Configuration options
   */
  static configure(config: Partial<EmojiConfig>): void {
    EmojiSelector.config = {
      ...EmojiSelector.config,
      ...config
    };
    // Invalidate compiled cache when config changes
    EmojiSelector.compiledMappings = null;
  }

  /**
   * Get current configuration
   * @returns Current emoji configuration
   */
  static getConfig(): EmojiConfig {
    const { customMappings = [], customFallbacks = {}, ...rest } = EmojiSelector.config;

    return {
      ...rest,
      customMappings: [...customMappings],
      customFallbacks: { ...customFallbacks }
    };
  }

  /**
   * Reset configuration to defaults
   */
  static reset(): void {
    EmojiSelector.config = {
      customMappings: [],
      customFallbacks: {},
      useCustomOnly: false
    };
    // Clear compiled cache
    EmojiSelector.compiledMappings = null;
  }

  /**
   * Get compiled emoji mappings with precompiled regex patterns
   * This is cached to avoid recompiling regex on every log line
   */
  private static getCompiledMappings(): CompiledEmojiMapping[] {
    if (EmojiSelector.compiledMappings) {
      return EmojiSelector.compiledMappings;
    }

    const { customMappings = [], useCustomOnly } = EmojiSelector.config;
    const mappings = useCustomOnly ? customMappings : [...customMappings, ...EMOJI_MAPPINGS];

    EmojiSelector.compiledMappings = mappings.map(mapping => ({
      ...mapping,
      regexes: mapping.keywords.map(keyword => {
        // Escape regex metacharacters to prevent ReDoS and invalid patterns
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Precompile regex for performance
        return new RegExp(`\\b${escapedKeyword}\\b`, 'i');
      })
    }));

    return EmojiSelector.compiledMappings;
  }

  /**
   * Select appropriate emoji based on log level and message content
   * @param level - Log level
   * @param message - Log message
   * @param data - Optional log data
   * @returns Selected emoji or empty string
   */
  static selectEmoji(level: LogLevel, message: string, data?: LogData): string {
    // Try to find context-aware emoji
    const contextEmoji = EmojiSelector.findContextEmoji(message, data);
    if (contextEmoji) {
      return contextEmoji;
    }

    // Fall back to level-based emoji
    return EmojiSelector.getFallbackEmoji(level);
  }

  /**
   * Find emoji based on message and data context
   * @param message - Log message
   * @param data - Optional log data
   * @returns Emoji if match found, null otherwise
   */
  private static findContextEmoji(message: string, data?: LogData): string | null {
    const searchText = EmojiSelector.prepareSearchText(message, data);
    const compiledMappings = EmojiSelector.getCompiledMappings();

    // Search through compiled mappings for keyword matches
    for (const mapping of compiledMappings) {
      if (EmojiSelector.matchesWithCompiledRegexes(searchText, mapping.regexes)) {
        return mapping.emoji;
      }
    }

    return null;
  }

  /**
   * Get combined mappings (custom + default or custom only)
   * @returns Array of emoji mappings
   * @deprecated Use getCompiledMappings() for better performance
   */
  private static getMappings(): EmojiMapping[] {
    const { customMappings = [], useCustomOnly = false } = EmojiSelector.config;

    if (useCustomOnly) {
      return customMappings;
    }

    // Merge custom mappings first (higher priority) with defaults
    return [...customMappings, ...EMOJI_MAPPINGS];
  }

  /**
   * Prepare text for searching by combining message and data
   * @param message - Log message
   * @param data - Optional log data
   * @returns Lowercase combined text
   */
  private static prepareSearchText(message: string, data?: LogData): string {
    let text = message.toLowerCase();

    // If data is provided and is an object, include its keys and string values
    if (data && typeof data === 'object') {
      try {
        const dataStr = JSON.stringify(data).toLowerCase();
        text += ' ' + dataStr;
      } catch {
        // Ignore circular references or stringify errors
      }
    } else if (data && typeof data === 'string') {
      text += ' ' + data.toLowerCase();
    }

    return text;
  }

  /**
   * Check if search text matches any of the precompiled regexes
   * @param searchText - Lowercase text to search in
   * @param regexes - Precompiled regex patterns
   * @returns true if any regex matches
   */
  private static matchesWithCompiledRegexes(searchText: string, regexes: RegExp[]): boolean {
    return regexes.some(regex => regex.test(searchText));
  }

  /**
   * Check if search text matches any of the keywords
   * @param searchText - Lowercase text to search in
   * @param keywords - Keywords to look for
   * @returns true if any keyword matches
   * @deprecated Use matchesWithCompiledRegexes() for better performance
   */
  private static matchesKeywords(searchText: string, keywords: string[]): boolean {
    return keywords.some(keyword => {
      // Escape regex metacharacters to prevent ReDoS and invalid patterns
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Use word boundary matching for more accurate results
      // Safe: escapedKeyword is sanitized by regex escape above
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
      return regex.test(searchText);
    });
  }

  /**
   * Get fallback emoji for a given log level
   * @param level - Log level
   * @returns Fallback emoji for the level
   */
  private static getFallbackEmoji(level: LogLevel): string {
    const levelName = EmojiSelector.getLevelName(level);

    // Explicitly handle unknown levels: no emoji by default
    if (levelName === 'UNKNOWN') {
      return '';
    }

    const { customFallbacks = {} } = EmojiSelector.config;

    // Check custom fallbacks first
    // Safe: levelName is constrained to specific log level strings
    if (levelName in customFallbacks && customFallbacks[levelName]) {
      return customFallbacks[levelName] || '';
    }

    // Use default fallback
    // Safe: levelName is constrained to specific log level strings
    return FALLBACK_EMOJI[levelName] || '';
  }

  /**
   * Convert LogLevel enum to string
   * @param level - Log level
   * @returns Level name as string
   */
  private static getLevelName(level: LogLevel): 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'LOG' | 'UNKNOWN' {
    switch (level) {
    case LogLevel.DEBUG: return 'DEBUG';
    case LogLevel.INFO: return 'INFO';
    case LogLevel.WARN: return 'WARN';
    case LogLevel.ERROR: return 'ERROR';
    case LogLevel.LOG: return 'LOG';
    default: return 'UNKNOWN';
    }
  }
}

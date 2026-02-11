/**
 * Emoji selector for context-aware logging
 * Analyzes log messages to select appropriate emoji based on context
 */

import { LogLevel, LogData, EmojiConfig, EmojiMapping } from '../types';
import { EMOJI_MAPPINGS, FALLBACK_EMOJI } from './emoji-data';

/**
 * Emoji selector class
 * Provides context-aware emoji selection for log messages
 */
export class EmojiSelector {
  private static config: EmojiConfig = {
    enabled: false, // Disabled by default to maintain backwards compatibility
    customMappings: [],
    customFallbacks: {},
    useCustomOnly: false
  };

  /**
   * Configure the emoji selector
   * @param config - Configuration options
   */
  static configure(config: Partial<EmojiConfig>): void {
    EmojiSelector.config = {
      ...EmojiSelector.config,
      ...config
    };
  }

  /**
   * Get current configuration
   * @returns Current emoji configuration
   */
  static getConfig(): EmojiConfig {
    return { ...EmojiSelector.config };
  }

  /**
   * Reset configuration to defaults
   */
  static reset(): void {
    EmojiSelector.config = {
      enabled: false,
      customMappings: [],
      customFallbacks: {},
      useCustomOnly: false
    };
  }

  /**
   * Select appropriate emoji based on log level and message content
   * @param level - Log level
   * @param message - Log message
   * @param data - Optional log data
   * @returns Selected emoji or empty string if disabled
   */
  static selectEmoji(level: LogLevel, message: string, data?: LogData): string {
    // Return empty string if emoji feature is disabled
    if (!EmojiSelector.config.enabled) {
      return '';
    }

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
    const mappings = EmojiSelector.getMappings();

    // Search through mappings for keyword matches
    for (const mapping of mappings) {
      if (EmojiSelector.matchesKeywords(searchText, mapping.keywords)) {
        return mapping.emoji;
      }
    }

    return null;
  }

  /**
   * Get combined mappings (custom + default or custom only)
   * @returns Array of emoji mappings
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
   * Check if search text matches any of the keywords
   * @param searchText - Lowercase text to search in
   * @param keywords - Keywords to look for
   * @returns true if any keyword matches
   */
  private static matchesKeywords(searchText: string, keywords: string[]): boolean {
    return keywords.some(keyword => {
      // Use word boundary matching for more accurate results
      // eslint-disable-next-line security/detect-non-literal-regexp
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
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
    const { customFallbacks = {} } = EmojiSelector.config;

    // Check custom fallbacks first
    // eslint-disable-next-line security/detect-object-injection
    if (customFallbacks[levelName]) {
      // eslint-disable-next-line security/detect-object-injection
      return customFallbacks[levelName];
    }

    // Use default fallback
    // eslint-disable-next-line security/detect-object-injection
    return FALLBACK_EMOJI[levelName] || '';
  }

  /**
   * Convert LogLevel enum to string
   * @param level - Log level
   * @returns Level name as string
   */
  private static getLevelName(level: LogLevel): string {
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

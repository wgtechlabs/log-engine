/**
 * Formatter module exports
 * Provides centralized access to all formatting functionality
 */

export { MessageFormatter } from './message-formatter';
export { colors, colorScheme } from './colors';
export { getTimestampComponents, formatTimestamp } from './timestamp';
export { formatData, styleData } from './data-formatter';
export { EmojiSelector } from './emoji-selector';
export { EMOJI_MAPPINGS, FALLBACK_EMOJI } from './emoji-data';

// Backward compatibility - maintain the original LogFormatter class interface
export { MessageFormatter as LogFormatter } from './message-formatter';

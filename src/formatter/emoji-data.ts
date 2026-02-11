/**
 * Emoji data for context-aware logging
 * Based on gitmoji.dev emoji set
 * Each entry maps emoji to keywords that help identify when to use it
 */

import { EmojiMapping } from '../types';

/**
 * Curated emoji mappings for context-aware logging
 * Based on the gitmoji set from https://gitmoji.dev
 * Ordered by specificity - more specific keywords first
 */
export const EMOJI_MAPPINGS: EmojiMapping[] = [
  // More specific contexts first

  // Database (specific)
  { emoji: '🗃️', code: ':card_file_box:', description: 'Database related', keywords: ['database', 'db', 'sql', 'query', 'table', 'schema', 'migration', 'mongo', 'postgres', 'mysql'] },

  // Deployment and releases (specific)
  { emoji: '🚀', code: ':rocket:', description: 'Deploy or release', keywords: ['deploy', 'deployed', 'deployment', 'release', 'launched', 'production'] },

  // Performance (specific)
  { emoji: '⚡️', code: ':zap:', description: 'Improve performance', keywords: ['performance', 'speed', 'optimize', 'fast', 'slow', 'latency', 'throughput'] },

  // Security (specific)
  { emoji: '🔒️', code: ':lock:', description: 'Fix security issues', keywords: ['security', 'secure', 'vulnerability', 'exploit', 'auth', 'authentication', 'authorization', 'permission'] },

  // Critical issues (specific)
  { emoji: '🚑️', code: ':ambulance:', description: 'Critical hotfix', keywords: ['critical', 'hotfix', 'urgent', 'emergency', 'crash', 'fatal'] },

  // Bugs and fixes (specific)
  { emoji: '🐛', code: ':bug:', description: 'Fix a bug', keywords: ['bug', 'fix', 'fixed', 'fixing', 'defect', 'issue'] },

  // Less specific/generic contexts last

  // Errors and failures (generic)
  { emoji: '❌', code: ':x:', description: 'Error or failure', keywords: ['error', 'fail', 'failed', 'failure', 'exception', 'reject'] },
  { emoji: '🔥', code: ':fire:', description: 'Remove code or files', keywords: ['remove', 'delete', 'deprecated', 'obsolete'] },
  { emoji: '🐌', code: ':snail:', description: 'Slow performance', keywords: ['timeout', 'hang', 'freeze'] },

  { emoji: '🔓️', code: ':unlock:', description: 'Unlock or access', keywords: ['unlock', 'access', 'grant', 'allow'] },

  { emoji: '💾', code: ':floppy_disk:', description: 'Save or persist data', keywords: ['save', 'saved', 'saving', 'persist', 'write', 'store'] },

  { emoji: '🎉', code: ':tada:', description: 'Initial commit or milestone', keywords: ['initial', 'milestone', 'celebrate', 'success', 'complete'] },

  // Configuration
  { emoji: '🔧', code: ':wrench:', description: 'Configuration changes', keywords: ['config', 'configuration', 'setting', 'settings', 'configure'] },
  { emoji: '⚙️', code: ':gear:', description: 'Configuration or settings', keywords: ['setup', 'init', 'initialize'] },

  // API and network
  { emoji: '🌐', code: ':globe_with_meridians:', description: 'Network or internet', keywords: ['network', 'internet', 'http', 'https', 'request', 'response', 'api', 'endpoint'] },
  { emoji: '🔌', code: ':electric_plug:', description: 'Connection or plugin', keywords: ['connect', 'connection', 'disconnect', 'plugin', 'integration'] },

  // Testing
  { emoji: '✅', code: ':white_check_mark:', description: 'Tests passing', keywords: ['tests', 'testing', 'pass', 'passed', 'validation', 'validate'] },
  { emoji: '🧪', code: ':test_tube:', description: 'Running tests', keywords: ['experiment', 'trial', 'spec'] },

  // Documentation
  { emoji: '📝', code: ':memo:', description: 'Add or update documentation', keywords: ['document', 'documentation', 'docs', 'readme', 'comment'] },
  { emoji: '💡', code: ':bulb:', description: 'New idea or insight', keywords: ['idea', 'insight', 'suggestion', 'tip', 'hint'] },

  // Dependencies
  { emoji: '➕', code: ':heavy_plus_sign:', description: 'Add dependency', keywords: ['add', 'added', 'adding', 'install', 'dependency', 'package'] },
  { emoji: '➖', code: ':heavy_minus_sign:', description: 'Remove dependency', keywords: ['uninstall', 'removed'] },
  { emoji: '⬆️', code: ':arrow_up:', description: 'Upgrade dependencies', keywords: ['upgrade', 'update', 'updated'] },
  { emoji: '⬇️', code: ':arrow_down:', description: 'Downgrade dependencies', keywords: ['downgrade', 'rollback'] },

  // Files and structure
  { emoji: '📦', code: ':package:', description: 'Update compiled files', keywords: ['package', 'build', 'compile', 'bundle'] },
  { emoji: '🚚', code: ':truck:', description: 'Move or rename files', keywords: ['move', 'moved', 'rename', 'renamed', 'relocate'] },

  // Work in progress
  { emoji: '🚧', code: ':construction:', description: 'Work in progress', keywords: ['wip', 'progress', 'working', 'ongoing', 'incomplete'] },

  // Breaking changes
  { emoji: '💥', code: ':boom:', description: 'Breaking changes', keywords: ['breaking', 'break', 'incompatible'] },

  // Accessibility
  { emoji: '♿️', code: ':wheelchair:', description: 'Improve accessibility', keywords: ['accessibility', 'a11y', 'accessible'] },

  // Internationalization
  { emoji: '🌍', code: ':earth_africa:', description: 'Internationalization', keywords: ['i18n', 'localization', 'l10n', 'translation', 'language'] },

  // UI and styling
  { emoji: '💄', code: ':lipstick:', description: 'Update UI and style', keywords: ['ui', 'style', 'css', 'design', 'interface', 'layout'] },
  { emoji: '🎨', code: ':art:', description: 'Improve structure', keywords: ['refactor', 'refactoring', 'restructure', 'format'] },

  // Logging and monitoring
  { emoji: '🔊', code: ':loud_sound:', description: 'Add or update logs', keywords: ['logging', 'trace'] },
  { emoji: '🔇', code: ':mute:', description: 'Remove logs', keywords: ['silent', 'quiet', 'mute'] },
  { emoji: '📊', code: ':bar_chart:', description: 'Analytics or metrics', keywords: ['analytics', 'metrics', 'stats', 'statistics', 'monitor', 'monitoring'] },

  // Code review
  { emoji: '👌', code: ':ok_hand:', description: 'Code review changes', keywords: ['review', 'approve', 'approved', 'lgtm'] },

  // Catch-all for new features (put last)
  { emoji: '✨', code: ':sparkles:', description: 'New feature', keywords: ['feature', 'new', 'enhancement', 'improve', 'improved'] },
];

/**
 * Default fallback emoji for each log level
 * These are used when no context-specific emoji matches
 */
export const FALLBACK_EMOJI: Record<string, string> = {
  DEBUG: '🐞',
  INFO: 'ℹ️',
  WARN: '⚠️',
  ERROR: '❌',
  LOG: '✅'
};

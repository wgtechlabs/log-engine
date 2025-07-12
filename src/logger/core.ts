/**
 * Core Logger class that handles log message output with configurable levels
 * Supports DEBUG, INFO, WARN, ERROR, and LOG levels with intelligent filtering
 * LOG level always outputs regardless of configuration
 * Uses colorized console output with timestamps for better readability
 * Includes automatic data redaction for sensitive information
 */

import { LogLevel, LogMode, LoggerConfig, LogOutputHandler, OutputTarget, EnhancedOutputTarget, LogData } from '../types';
import { LogFormatter } from '../formatter';
import { DataRedactor, RedactionController, defaultRedactionConfig } from '../redaction';
import { LoggerConfigManager } from './config';
import { LogFilter } from './filtering';
import { createBuiltInHandler } from './advanced-outputs';

/**
 * Logger class responsible for managing log output and configuration
 * Provides mode-based filtering and formatted console output
 */
export class Logger {
  private configManager: LoggerConfigManager;
  private cachedConfig: LoggerConfig | null = null;

  /**
     * Logger constructor - sets up environment-based auto-configuration
     */
  constructor() {
    this.configManager = new LoggerConfigManager();
  }

  /**
   * Get cached configuration or refresh cache if needed
   * This avoids repeated getConfig() calls for better performance
   */
  private getCachedConfig(): LoggerConfig {
    if (this.cachedConfig === null) {
      this.cachedConfig = this.configManager.getConfig();
    }
    return this.cachedConfig;
  }

  /**
   * Invalidate the configuration cache when configuration changes
   */
  private invalidateConfigCache(): void {
    this.cachedConfig = null;
  }

  /**
     * Built-in output handlers for common use cases
     */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getBuiltInHandler(type: string, config?: any): LogOutputHandler | null {
    switch (type) {
    case 'console':
      return (level: string, message: string, data?: LogData) => {
        // Use appropriate console method based on level
        if (level === 'error') {
          if (data !== undefined) {
            console.error(message, data);
          } else {
            console.error(message);
          }
        } else if (level === 'warn') {
          if (data !== undefined) {
            console.warn(message, data);
          } else {
            console.warn(message);
          }
        } else {
          if (data !== undefined) {
            console.log(message, data);
          } else {
            console.log(message);
          }
        }
      };
    case 'silent':
      return () => {
        // Do nothing - silent output
      };
    case 'file':
    case 'http':
      // Use advanced output handlers for file and http
      return createBuiltInHandler(type, config);
    default:
      return null;
    }
  }

  /**
     * Process a single output target with error handling
     * @param output - Single output target to process
     * @param level - Log level
     * @param rawMessage - Original unformatted message
     * @param formattedMessage - Formatted message for console-based outputs
     * @param data - Optional data
     * @param isEnhanced - Whether this is an enhanced output (supports configured handler objects)
     */
  private processSingleOutput(
    output: OutputTarget | EnhancedOutputTarget,
    level: string,
    rawMessage: string,
    formattedMessage: string,
    data?: LogData,
    isEnhanced = false
  ): void {
    const config = this.configManager.getConfig();

    try {
      if (typeof output === 'string') {
        // Built-in handler - get config if available
        const outputConfig = config.advancedOutputConfig?.[output as keyof typeof config.advancedOutputConfig];
        const handler = this.getBuiltInHandler(output, outputConfig);
        if (handler) {
          // Advanced handlers (file, http) get raw message, console gets formatted
          const messageToUse = (output === 'file' || output === 'http') ? rawMessage : formattedMessage;
          handler(level, messageToUse, data);
        } else {
          console.error('[LogEngine] Unknown built-in output handler:', JSON.stringify(output));
        }
      } else if (typeof output === 'function') {
        // Custom function handler gets formatted message for backward compatibility
        output(level, formattedMessage, data);
      } else if (isEnhanced && typeof output === 'object' && output.type && output.config) {
        // Configured handler object (only available for enhanced outputs)
        const handler = this.getBuiltInHandler(output.type, output.config);
        if (handler) {
          // Advanced configured handlers get raw message
          handler(level, rawMessage, data);
        } else {
          console.error('[LogEngine] Unknown enhanced output handler type:', JSON.stringify(output));
        }
      } else {
        const outputType = isEnhanced ? 'enhanced output target' : 'output target';
        console.error(`[LogEngine] Invalid ${outputType}:`, output);
      }
    } catch (error) {
      // Continue processing other outputs even if one fails
      const handlerType = isEnhanced ? 'Enhanced output' : 'Output';
      console.error(`[LogEngine] ${handlerType} handler failed: ${error}`);
    }
  }

  /**
     * Process multiple output targets
     * @param outputs - Array of output targets to process
     * @param level - Log level
     * @param rawMessage - Original unformatted message
     * @param formattedMessage - Formatted message for console-based outputs
     * @param data - Optional data
     */
  private processOutputs(outputs: OutputTarget[], level: string, rawMessage: string, formattedMessage: string, data?: LogData): void {
    for (const output of outputs) {
      this.processSingleOutput(output, level, rawMessage, formattedMessage, data, false);
    }
  }

  /**
     * Process enhanced output targets
     * @param enhancedOutputs - Array of enhanced output targets to process
     * @param level - Log level
     * @param rawMessage - Original unformatted message
     * @param formattedMessage - Formatted message for console-based outputs
     * @param data - Optional data
     */
  private processEnhancedOutputs(enhancedOutputs: EnhancedOutputTarget[], level: string, rawMessage: string, formattedMessage: string, data?: LogData): void {
    for (const output of enhancedOutputs) {
      this.processSingleOutput(output, level, rawMessage, formattedMessage, data, true);
    }
  }

  /**
     * Updates logger configuration with new settings
     * Also updates redaction configuration based on environment
     * @param config - Partial configuration object to apply
     */
  configure(config: Partial<LoggerConfig>): void {
    this.configManager.updateConfig(config);

    // Invalidate configuration cache since config has changed
    this.invalidateConfigCache();

    // Update redaction configuration based on current environment
    DataRedactor.updateConfig({
      ...defaultRedactionConfig,
      ...RedactionController.getEnvironmentConfig()
    });
  }

  /**
     * Get current logger configuration
     * @returns Current logger configuration
     */
  getConfig(): LoggerConfig {
    return this.configManager.getConfig();
  }

  /**
     * Determines if a message should be logged based on current log mode
     * @param level - The log level of the message to check
     * @returns true if message should be logged, false otherwise
     */
  private shouldLog(level: LogLevel): boolean {
    const currentConfig = this.configManager.getConfig();
    const currentMode = currentConfig.mode !== undefined ? currentConfig.mode : LogMode.INFO;
    return LogFilter.shouldLog(level, currentMode);
  }

  /**
     * Writes log output using configured output handler or default console methods
     * Supports single output handler, multiple outputs, and enhanced outputs
     * Priority: outputs > enhancedOutputs > outputHandler > default console
     * @param level - The log level as a string
     * @param rawMessage - The original unformatted message
     * @param formattedMessage - The pre-formatted message to output
     * @param data - Optional data object that was logged
     * @param isError - Whether this is an error level message (for console.error)
     * @param isWarn - Whether this is a warning level message (for console.warn)
     */
  private writeToOutput(level: string, rawMessage: string, formattedMessage: string, data?: LogData, isError = false, isWarn = false): void {
    const config = this.configManager.getConfig();

    // Multiple outputs support (highest priority - newer API)
    if (config.outputs !== undefined) {
      if (config.outputs.length > 0) {
        // Process outputs array when it has actual outputs
        this.processOutputs(config.outputs, level, rawMessage, formattedMessage, data);
      }
      // If outputs is explicitly set to empty array, disable all logging
      return;
    }

    // Enhanced outputs with advanced configuration (second priority)
    if (config.enhancedOutputs !== undefined && config.enhancedOutputs.length > 0) {
      this.processEnhancedOutputs(config.enhancedOutputs, level, rawMessage, formattedMessage, data);
      return;
    }

    // Single output handler (third priority - legacy compatibility)
    if (config.outputHandler) {
      try {
        config.outputHandler(level, formattedMessage, data);
      } catch (error) {
        // Fallback to console if custom handler fails
        console.error(`[LogEngine] Output handler failed: ${error}. Falling back to console.`);
        if (isError) {
          console.error(formattedMessage);
        } else if (isWarn) {
          console.warn(formattedMessage);
        } else {
          console.log(formattedMessage);
        }
      }
      return;
    }

    // Default: Console output (unless suppressed)
    if (!config.suppressConsoleOutput) {
      if (isError) {
        console.error(formattedMessage);
      } else if (isWarn) {
        console.warn(formattedMessage);
      } else {
        console.log(formattedMessage);
      }
    }
    // If suppressConsoleOutput is true and no outputHandler/outputs, do nothing (silent)
  }

  /**
     * Log a debug message with DEBUG level formatting
     * Uses console.log for output with purple/magenta coloring
     * Automatically redacts sensitive data when provided
     * @param message - The debug message to log
     * @param data - Optional data object to log (will be redacted)
     */
  debug(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const processedData = DataRedactor.redactData(data);
      const cachedConfig = this.getCachedConfig();
      const formatted = LogFormatter.format(LogLevel.DEBUG, message, processedData, cachedConfig.format);
      this.writeToOutput('debug', message, formatted, processedData);
    }
  }

  /**
     * Log an informational message with INFO level formatting
     * Uses console.log for output with blue coloring
     * Automatically redacts sensitive data when provided
     * @param message - The info message to log
     * @param data - Optional data object to log (will be redacted)
     */
  info(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const processedData = DataRedactor.redactData(data);
      const cachedConfig = this.getCachedConfig();
      const formatted = LogFormatter.format(LogLevel.INFO, message, processedData, cachedConfig.format);
      this.writeToOutput('info', message, formatted, processedData);
    }
  }

  /**
     * Log a warning message with WARN level formatting
     * Uses console.warn for output with yellow coloring
     * Automatically redacts sensitive data when provided
     * @param message - The warning message to log
     * @param data - Optional data object to log (will be redacted)
     */
  warn(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const processedData = DataRedactor.redactData(data);
      const cachedConfig = this.getCachedConfig();
      const formatted = LogFormatter.format(LogLevel.WARN, message, processedData, cachedConfig.format);
      this.writeToOutput('warn', message, formatted, processedData, false, true);
    }
  }

  /**
     * Log an error message with ERROR level formatting
     * Uses console.error for output with red coloring
     * Automatically redacts sensitive data when provided
     * @param message - The error message to log
     * @param data - Optional data object to log (will be redacted)
     */
  error(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const processedData = DataRedactor.redactData(data);
      const cachedConfig = this.getCachedConfig();
      const formatted = LogFormatter.format(LogLevel.ERROR, message, processedData, cachedConfig.format);
      this.writeToOutput('error', message, formatted, processedData, true, false);
    }
  }

  /**
     * Log a message with LOG level formatting (always outputs unless mode is OFF)
     * Uses console.log for output with green coloring
     * LOG level bypasses normal filtering and always outputs (except when OFF is set)
     * Automatically redacts sensitive data when provided
     * @param message - The log message to output
     * @param data - Optional data object to log (will be redacted)
     */
  log(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.LOG)) {
      const processedData = DataRedactor.redactData(data);
      const cachedConfig = this.getCachedConfig();
      const formatted = LogFormatter.format(LogLevel.LOG, message, processedData, cachedConfig.format);
      this.writeToOutput('log', message, formatted, processedData);
    }
  }

  // Raw logging methods (bypass redaction for debugging)
  /**
     * Log a debug message without data redaction
     * @param message - The debug message to log
     * @param data - Optional data object to log (no redaction applied)
     */
  debugRaw(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const cachedConfig = this.getCachedConfig();
      const formatted = LogFormatter.format(LogLevel.DEBUG, message, data, cachedConfig.format);
      this.writeToOutput('debug', message, formatted, data);
    }
  }

  /**
     * Log an info message without data redaction
     * @param message - The info message to log
     * @param data - Optional data object to log (no redaction applied)
     */
  infoRaw(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const cachedConfig = this.getCachedConfig();
      const formatted = LogFormatter.format(LogLevel.INFO, message, data, cachedConfig.format);
      this.writeToOutput('info', message, formatted, data);
    }
  }

  /**
     * Log a warning message without data redaction
     * @param message - The warning message to log
     * @param data - Optional data object to log (no redaction applied)
     */
  warnRaw(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const cachedConfig = this.getCachedConfig();
      const formatted = LogFormatter.format(LogLevel.WARN, message, data, cachedConfig.format);
      this.writeToOutput('warn', message, formatted, data, false, true);
    }
  }

  /**
     * Log an error message without data redaction
     * @param message - The error message to log
     * @param data - Optional data object to log (no redaction applied)
     */
  errorRaw(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const cachedConfig = this.getCachedConfig();
      const formatted = LogFormatter.format(LogLevel.ERROR, message, data, cachedConfig.format);
      this.writeToOutput('error', message, formatted, data, true, false);
    }
  }

  /**
     * Log a message without data redaction (always outputs unless mode is OFF)
     * @param message - The log message to output
     * @param data - Optional data object to log (no redaction applied)
     */
  logRaw(message: string, data?: LogData): void {
    if (this.shouldLog(LogLevel.LOG)) {
      const cachedConfig = this.getCachedConfig();
      const formatted = LogFormatter.format(LogLevel.LOG, message, data, cachedConfig.format);
      this.writeToOutput('log', message, formatted, data);
    }
  }
}

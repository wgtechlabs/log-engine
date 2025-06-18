/**
 * Logger configuration management
 * Handles logger settings and configuration updates
 */

import { LoggerConfig, LogLevel, LogMode } from '../types';
import { EnvironmentDetector } from './environment';

/**
 * Configuration manager for logger settings
 * Handles configuration validation, updates, and backward compatibility
 */
export class LoggerConfigManager {
    private config: LoggerConfig;

    constructor() {
        // Set initial configuration with environment-based auto-configuration
        this.config = {
            mode: EnvironmentDetector.getEnvironmentMode()
        };
    }

    /**
     * Get current configuration
     * @returns Current logger configuration
     */
    getConfig(): LoggerConfig {
        return { ...this.config };
    }

    /**
     * Updates logger configuration with new settings
     * Merges provided config with existing settings (partial update)
     * Supports backwards compatibility by mapping level to mode with deprecation warnings
     * @param config - Partial configuration object to apply
     */
    updateConfig(config: Partial<LoggerConfig>): void {
        // Handle backwards compatibility - if level is provided but mode is not
        if (config.level !== undefined && config.mode === undefined) {
            this.handleLegacyLevelConfig(config);
        } else {
            // Normal configuration update
            // If mode is present, remove legacy level property to avoid conflicts
            if (config.mode !== undefined && config.level !== undefined) {
                const { level, ...configWithoutLevel } = config;
                this.config = { ...this.config, ...configWithoutLevel };
            } else {
                this.config = { ...this.config, ...config };
            }
        }
    }

    /**
     * Handle legacy level-based configuration with deprecation warnings
     * @param config - Configuration containing legacy level property
     */
    private handleLegacyLevelConfig(config: Partial<LoggerConfig>): void {
        // Map legacy level values to new LogMode values and validate first
        const levelValue = config.level as number;
        const mappedMode = this.mapLevelToMode(levelValue);
        
        // Fail fast if the level value is invalid
        if (mappedMode === undefined) {
            throw new Error(`Invalid LogLevel value: ${config.level}. Valid values are: DEBUG(0), INFO(1), WARN(2), ERROR(3), LOG(99), or use LogMode instead.`);
        }
        
        // Only show deprecation warning after confirming the level is valid and in non-test environments
        if (!EnvironmentDetector.isTestEnvironment()) {
            this.createDeprecationWarning();
        }
        
        // Merge existing config with all keys from the passed config, and override mode with mapped value
        // Remove the legacy 'level' property to avoid conflicts with the new 'mode' property
        const { level, ...configWithoutLevel } = config;
        this.config = { ...this.config, ...configWithoutLevel, mode: mappedMode };
    }

    /**
     * Map legacy LogLevel values to LogMode values
     * @param levelValue - Legacy level value
     * @returns Corresponding LogMode or undefined if invalid
     */
    private mapLevelToMode(levelValue: number): LogMode | undefined {
        const levelToModeMap: Record<number, LogMode> = {
            [LogLevel.DEBUG]: LogMode.DEBUG,      // 0 -> 0
            [LogLevel.INFO]: LogMode.INFO,        // 1 -> 1
            [LogLevel.WARN]: LogMode.WARN,        // 2 -> 2
            [LogLevel.ERROR]: LogMode.ERROR,      // 3 -> 3
            [LogLevel.LOG]: LogMode.SILENT,       // 99 -> 4 (preserves critical-only behavior)
            4: LogMode.SILENT,                    // Legacy SILENT -> 4
            5: LogMode.OFF                        // Legacy OFF -> 5
        };
        
        return levelToModeMap[levelValue];
    }

    /**
     * Create deprecation warning message using LogFormatter
     * Outputs formatted deprecation warning messages to console
     */
    private createDeprecationWarning(): void {
        // Import LogFormatter to format system messages properly
        const { LogFormatter } = require('../formatter');
        
        console.warn(LogFormatter.formatSystemMessage('⚠️  DEPRECATION WARNING: The "level" configuration is deprecated and will be removed in v2.0.0. Please use "mode" instead.'));
        console.warn(LogFormatter.formatSystemMessage('   Migration: LogEngine.configure({ level: LogLevel.DEBUG }) → LogEngine.configure({ mode: LogMode.DEBUG })'));
        console.warn(LogFormatter.formatSystemMessage('   See: https://github.com/wgtechlabs/log-engine#migration-guide-loglevel--logmode'));
    }
}

/**
 * Environment detection utilities for logging configuration
 * Handles automatic environment-based configuration
 */

import { LogMode } from '../types';

/**
 * Environment detection and configuration utilities
 */
export class EnvironmentDetector {
    /**
     * Get the normalized NODE_ENV value
     * @returns Normalized NODE_ENV (trimmed and lowercase)
     */
    private static getNormalizedNodeEnv(): string {
        return (process.env.NODE_ENV || '').trim().toLowerCase();
    }

    /**
     * Determines the appropriate log mode based on NODE_ENV
     * @returns LogMode appropriate for current environment
     */
    static getEnvironmentMode(): LogMode {
        const nodeEnv = EnvironmentDetector.getNormalizedNodeEnv();
        
        switch (nodeEnv) {
            case 'development':
                return LogMode.DEBUG;    // Verbose logging for development
            case 'production':
                return LogMode.INFO;     // Important info and above for production
            case 'staging':
                return LogMode.WARN;     // Focused logging for staging
            case 'test':
                return LogMode.ERROR;    // Minimal logging during tests
            default:
                return LogMode.INFO;     // Default fallback for unknown environments
        }
    }

    /**
     * Check if we're in a test environment
     * @returns true if NODE_ENV is 'test'
     */
    static isTestEnvironment(): boolean {
        return EnvironmentDetector.getNormalizedNodeEnv() === 'test';
    }

    /**
     * Check if we're in a development environment
     * @returns true if NODE_ENV is 'development'
     */
    static isDevelopmentEnvironment(): boolean {
        return EnvironmentDetector.getNormalizedNodeEnv() === 'development';
    }

    /**
     * Check if we're in a production environment
     * @returns true if NODE_ENV is 'production'
     */
    static isProductionEnvironment(): boolean {
        return EnvironmentDetector.getNormalizedNodeEnv() === 'production';
    }
}

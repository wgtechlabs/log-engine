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
     * Determines the appropriate log mode based on NODE_ENV
     * @returns LogMode appropriate for current environment
     */
    static getEnvironmentMode(): LogMode {
        // Normalize NODE_ENV by trimming whitespace and converting to lowercase
        const nodeEnv = (process.env.NODE_ENV || '').trim().toLowerCase();
        
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
        return process.env.NODE_ENV === 'test';
    }

    /**
     * Check if we're in a development environment
     * @returns true if NODE_ENV is 'development'
     */
    static isDevelopmentEnvironment(): boolean {
        return process.env.NODE_ENV === 'development';
    }

    /**
     * Check if we're in a production environment
     * @returns true if NODE_ENV is 'production'
     */
    static isProductionEnvironment(): boolean {
        return process.env.NODE_ENV === 'production';
    }
}

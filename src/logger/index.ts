/**
 * Logger module exports
 * Provides centralized access to all logging functionality
 */

export { Logger } from './core';
export { LoggerConfigManager } from './config';
export { LogFilter } from './filtering';
export { EnvironmentDetector } from './environment';

// Backward compatibility - maintain the original Logger class interface
export { Logger as CoreLogger } from './core';

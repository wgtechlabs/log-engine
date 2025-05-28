import { LogLevel } from './types';

export class LogFormatter {
    // ANSI color codes
    private static readonly colors = {
        reset: '\x1b[0m',
        dim: '\x1b[2m',
        red: '\x1b[31m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        gray: '\x1b[90m'
    };

    static format(level: LogLevel, message: string): string {
        const now = new Date();
        const isoTimestamp = now.toISOString();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        const levelName = this.getLevelName(level);
        const levelColor = this.getLevelColor(level);
        
        // Color the components
        const coloredTimestamp = `${this.colors.gray}[${isoTimestamp}]${this.colors.reset}`;
        const coloredTimeString = `${this.colors.cyan}[${timeString}]${this.colors.reset}`;
        const coloredLevel = `${levelColor}[${levelName}]${this.colors.reset}`;
        
        return `${coloredTimestamp}${coloredTimeString}${coloredLevel}: ${message}`;
    }

    private static getLevelName(level: LogLevel): string {
        switch (level) {
            case LogLevel.DEBUG: return 'DEBUG';
            case LogLevel.INFO: return 'INFO';
            case LogLevel.WARN: return 'WARN';
            case LogLevel.ERROR: return 'ERROR';
            case LogLevel.SILENT: return 'SILENT';
            default: return 'UNKNOWN';
        }
    }

    private static getLevelColor(level: LogLevel): string {
        switch (level) {
            case LogLevel.DEBUG: return this.colors.magenta;
            case LogLevel.INFO: return this.colors.blue;
            case LogLevel.WARN: return this.colors.yellow;
            case LogLevel.ERROR: return this.colors.red;
            case LogLevel.SILENT: return this.colors.dim;
            default: return this.colors.white;
        }
    }
}
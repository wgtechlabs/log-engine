import { LogLevel } from './types';

export class LogFormatter {
    static format(level: LogLevel, message: string): string {
        const now = new Date();
        const isoTimestamp = now.toISOString();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });

        const levelName = this.getLevelName(level);
        return `[${isoTimestamp}] [${timeString}] [${levelName}] ${message}`;
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
}
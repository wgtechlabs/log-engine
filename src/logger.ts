import { LogLevel, LoggerConfig } from './types';
import { LogFormatter } from './formatter';

export class Logger {
    private config: LoggerConfig = {
        level: LogLevel.INFO
    };

    configure(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
    }

    private shouldLog(level: LogLevel): boolean {
        return level >= this.config.level;
    }

    debug(message: string): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            const formatted = LogFormatter.format(LogLevel.DEBUG, message);
            console.log(formatted);
        }
    }

    info(message: string): void {
        if (this.shouldLog(LogLevel.INFO)) {
            const formatted = LogFormatter.format(LogLevel.INFO, message);
            console.log(formatted);
        }
    }

    warn(message: string): void {
        if (this.shouldLog(LogLevel.WARN)) {
            const formatted = LogFormatter.format(LogLevel.WARN, message);
            console.warn(formatted);
        }
    }

    error(message: string): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            const formatted = LogFormatter.format(LogLevel.ERROR, message);
            console.error(formatted);
        }
    }
}
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    SILENT = 4
}

export interface LogEntry {
    timestamp: Date;
    level: LogLevel;
    message: string;
}

export interface LoggerConfig {
    level: LogLevel;
    environment?: string;
}
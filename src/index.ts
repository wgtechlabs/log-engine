import { Logger as LoggerClass } from './logger';
import { LogLevel, LoggerConfig } from './types';

const logger = new LoggerClass();

// Auto-configure based on NODE_ENV if available
const getDefaultLogLevel = (): LogLevel => {
    const nodeEnv = process.env.NODE_ENV;
    switch (nodeEnv) {
        case 'production':
            return LogLevel.WARN;
        case 'development':
            return LogLevel.DEBUG;
        case 'test':
            return LogLevel.ERROR;
        default:
            return LogLevel.INFO;
    }
};

logger.configure({ level: getDefaultLogLevel() });

export const LogEngine = {
    configure: (config: Partial<LoggerConfig>) => logger.configure(config),
    debug: (message: string) => logger.debug(message),
    info: (message: string) => logger.info(message),
    warn: (message: string) => logger.warn(message),
    error: (message: string) => logger.error(message)
};

export { LogLevel, LoggerConfig } from './types';
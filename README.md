# Log Engine

WG's Log Engine is a lightweight and efficient logging utility designed specifically for bot applications running on Node.js.

## Features

- Log messages with timestamps
- Support for multiple log levels: DEBUG, INFO, WARN, ERROR, SILENT
- Configurable log level filtering
- Environment-based auto-configuration
- Easy integration into your Node.js applications

## Installation

To install the @wgtechlabs/log-engine package, run the following command:

```
npm install @wgtechlabs/log-engine
```

## Usage

Here's a quick example of how to use the Log Engine in your application:

```typescript
import { LogEngine, LogLevel } from '@wgtechlabs/log-engine';

// Basic usage with auto-configuration based on NODE_ENV
LogEngine.debug('This is a debug message');
LogEngine.info('This is an info message');
LogEngine.warn('This is a warning message');
LogEngine.error('This is an error message');
```

### Configuration

You can configure the logger based on your environment variables or specific requirements:

```typescript
import { LogEngine, LogLevel } from '@wgtechlabs/log-engine';

// Configure based on your custom environment variable
const env = process.env.APP_ENV || 'development';

if (env === 'production') {
    LogEngine.configure({ level: LogLevel.ERROR });
} else if (env === 'staging') {
    LogEngine.configure({ level: LogLevel.WARN });
} else {
    LogEngine.configure({ level: LogLevel.DEBUG });
}

// Now use the logger - only messages at or above the configured level will be shown
LogEngine.debug('This will only show in development');
LogEngine.info('General information');
LogEngine.warn('Warning message');
LogEngine.error('Error message');
```

### Available Log Levels

The logger supports the following levels (in order of severity):

- `LogLevel.DEBUG` (0) - Detailed information for debugging
- `LogLevel.INFO` (1) - General information
- `LogLevel.WARN` (2) - Warning messages
- `LogLevel.ERROR` (3) - Error messages
- `LogLevel.SILENT` (4) - No output

### Auto-Configuration

The logger automatically configures itself based on the `NODE_ENV` environment variable:

- `production` → `LogLevel.WARN`
- `development` → `LogLevel.DEBUG`
- `test` → `LogLevel.ERROR`
- `default` → `LogLevel.INFO`

## Log Format

The log messages will be formatted as follows:

```
[2025-05-20T16:57:45.678Z] [4:57 PM] [INFO] Message here.
```

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bugs.

## License

This project is licensed under the AGPL-v3. See the LICENSE file for more details.
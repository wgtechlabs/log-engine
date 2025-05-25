# Log Engine

[![Test](https://github.com/wgtechlabs/log-engine/actions/workflows/test.yml/badge.svg)](https://github.com/wgtechlabs/log-engine/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/wgtechlabs/log-engine/branch/main/graph/badge.svg)](https://codecov.io/gh/wgtechlabs/log-engine)

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

## Testing

The log-engine project includes a comprehensive test suite to ensure reliability and functionality. The tests are organized into focused, maintainable files covering different aspects of the logging system.

### Test Structure

The test suite is organized as follows:

```
src/__tests__/
├── test-utils.ts              # Shared test utilities and mocking helpers
├── log-engine.test.ts         # LogEngine core functionality tests
├── logger.test.ts             # Logger class unit tests
├── formatter.test.ts          # LogFormatter functionality tests
├── environment.test.ts        # Environment-based configuration tests
├── log-level.test.ts          # LogLevel enum validation tests
└── integration.test.ts        # End-to-end integration tests
```

### Running Tests

#### Run All Tests
```bash
npm test
```

#### Run Tests with Coverage
```bash
npm run test:coverage
```

#### Run Tests in Watch Mode
```bash
npm run test:watch
```

#### Run Specific Test Files
```bash
# Run only LogEngine tests
npm test log-engine

# Run only Logger class tests
npm test logger

# Run only integration tests
npm test integration

# Run only formatter tests
npm test formatter
```

### Test Coverage

The project maintains high test coverage:

- **Statements**: ~94%
- **Branches**: ~87%
- **Functions**: ~90%
- **Lines**: ~94%

Coverage reports are generated in the `coverage/` directory after running `npm run test:coverage`.

### Test Categories

#### Unit Tests
- **LogEngine** (`log-engine.test.ts`): Core logging functionality, configuration, and level filtering
- **Logger** (`logger.test.ts`): Logger class behavior and configuration
- **LogFormatter** (`formatter.test.ts`): Message formatting with timestamps and levels
- **LogLevel** (`log-level.test.ts`): Enum values and ordering validation

#### Configuration Tests
- **Environment** (`environment.test.ts`): Auto-configuration based on `NODE_ENV`

#### Integration Tests
- **Integration** (`integration.test.ts`): End-to-end scenarios and workflows

### Writing Tests

When contributing to the project, follow these testing guidelines:

#### Test Structure
```typescript
import { LogEngine, LogLevel } from '../index';
import { setupConsoleMocks, restoreConsoleMocks, ConsoleMocks } from './test-utils';

describe('Feature Name', () => {
  let mocks: ConsoleMocks;

  beforeEach(() => {
    mocks = setupConsoleMocks();
    // Setup test state
  });

  afterEach(() => {
    restoreConsoleMocks(mocks);
    // Cleanup
  });

  it('should describe the expected behavior', () => {
    // Arrange
    LogEngine.configure({ level: LogLevel.INFO });
    
    // Act
    LogEngine.info('Test message');
    
    // Assert
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
      expect.stringContaining('[INFO] Test message')
    );
  });
});
```

#### Best Practices
- Use descriptive test names that explain the expected behavior
- Follow the Arrange-Act-Assert pattern
- Use the shared `test-utils` for console mocking
- Clean up after each test to avoid side effects
- Test both positive and negative scenarios
- Include edge cases and error conditions

#### Console Mocking
The project uses shared console mocking utilities:

```typescript
import { setupConsoleMocks, restoreConsoleMocks, ConsoleMocks } from './test-utils';

// In your test setup
const mocks = setupConsoleMocks();

// In your test cleanup
restoreConsoleMocks(mocks);

// In your assertions
expect(mocks.mockConsoleLog).toHaveBeenCalledWith(expected);
expect(mocks.mockConsoleWarn).toHaveBeenCalledTimes(1);
expect(mocks.mockConsoleError).not.toHaveBeenCalled();
```

### Continuous Integration

Tests are automatically run on:
- Pull requests
- Pushes to main branch
- Release workflows

Ensure all tests pass before submitting contributions.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bugs.

## License

This project is licensed under the AGPL-v3. See the LICENSE file for more details.
# Testing Guide for Log Engine

This document provides comprehensive information about testing the log-engine project.

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch
```

## Test Architecture

### File Organization

The test suite follows a modular approach with each test file focusing on a specific component:

```
src/__tests__/
├── test-utils.ts              # Shared utilities and mocking helpers
├── log-engine.test.ts         # LogEngine static methods and configuration
├── logger.test.ts             # Logger class instance methods
├── formatter.test.ts          # LogFormatter message formatting
├── environment.test.ts        # NODE_ENV based auto-configuration
├── log-level.test.ts          # LogLevel enum validation
└── integration.test.ts        # End-to-end workflows
```

### Why This Structure?

- **Maintainability**: Smaller, focused files are easier to understand and modify
- **Parallel Execution**: Tests can run concurrently, reducing execution time
- **Team Collaboration**: Reduces merge conflicts when multiple developers work on tests
- **Debugging**: Easier to isolate and fix issues in specific components
- **Single Responsibility**: Each file tests one main concept

## Test Utilities

### Console Mocking

The `test-utils.ts` file provides shared console mocking functionality:

```typescript
export interface ConsoleMocks {
  mockConsoleLog: jest.SpyInstance;
  mockConsoleWarn: jest.SpyInstance;
  mockConsoleError: jest.SpyInstance;
}

export const setupConsoleMocks = (): ConsoleMocks => {
  // Creates mocks for console.log, console.warn, console.error
};

export const restoreConsoleMocks = (mocks: ConsoleMocks): void => {
  // Restores original console methods
};
```

### Usage in Tests

```typescript
import { setupConsoleMocks, restoreConsoleMocks, ConsoleMocks } from './test-utils';

describe('Your Test Suite', () => {
  let mocks: ConsoleMocks;

  beforeEach(() => {
    mocks = setupConsoleMocks();
    // Your setup code
  });

  afterEach(() => {
    restoreConsoleMocks(mocks);
    // Your cleanup code
  });

  it('should test something', () => {
    // Your test code
    expect(mocks.mockConsoleLog).toHaveBeenCalledWith('expected output');
  });
});
```

## Test Categories

### 1. Unit Tests

#### LogEngine Tests (`log-engine.test.ts`)
- **Purpose**: Test the main LogEngine static interface
- **Coverage**: Basic logging, level filtering, configuration
- **Key Tests**:
  - Each log level outputs correctly
  - Level filtering works as expected
  - Configuration is maintained between calls

#### Logger Tests (`logger.test.ts`)
- **Purpose**: Test the underlying Logger class
- **Coverage**: Instance-based logging, configuration changes
- **Key Tests**:
  - Default log level behavior
  - Configuration updates
  - Message filtering based on level

#### Formatter Tests (`formatter.test.ts`)
- **Purpose**: Test message formatting functionality
- **Coverage**: Timestamp formatting, level labeling, message handling
- **Key Tests**:
  - Correct timestamp format
  - Proper level labels
  - Special character handling
  - Empty message handling

#### LogLevel Tests (`log-level.test.ts`)
- **Purpose**: Validate enum values and ordering
- **Coverage**: Enum numeric values, comparison logic
- **Key Tests**:
  - Correct numeric values (DEBUG=0, INFO=1, etc.)
  - Proper ordering for level comparisons

### 2. Configuration Tests

#### Environment Tests (`environment.test.ts`)
- **Purpose**: Test auto-configuration based on NODE_ENV
- **Coverage**: Different environment configurations
- **Key Tests**:
  - Production → WARN level
  - Development → DEBUG level
  - Test → ERROR level
  - Unknown/undefined → INFO level

### 3. Integration Tests

#### Integration Tests (`integration.test.ts`)
- **Purpose**: Test complete workflows and interactions
- **Coverage**: End-to-end scenarios, complex interactions
- **Key Tests**:
  - Multiple log levels in sequence
  - Rapid configuration changes
  - State persistence across multiple calls

## Writing New Tests

### Test File Template

```typescript
import { LogEngine, LogLevel } from '../index';
import { setupConsoleMocks, restoreConsoleMocks, ConsoleMocks } from './test-utils';

describe('Feature Name', () => {
  let mocks: ConsoleMocks;

  beforeEach(() => {
    mocks = setupConsoleMocks();
    // Reset to known state
    LogEngine.configure({ level: LogLevel.INFO });
  });

  afterEach(() => {
    restoreConsoleMocks(mocks);
  });

  describe('Specific functionality', () => {
    it('should describe expected behavior clearly', () => {
      // Arrange: Set up test conditions
      LogEngine.configure({ level: LogLevel.DEBUG });
      
      // Act: Execute the functionality
      LogEngine.debug('Test message');
      
      // Assert: Verify the results
      expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
      expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
        expect.stringContaining('[DEBUG] Test message')
      );
    });
  });
});
```

### Testing Guidelines

#### 1. Test Names
- Use descriptive names that explain the expected behavior
- Follow the pattern: `should [expected behavior] when [condition]`
- Examples:
  - `should log debug messages when level is DEBUG`
  - `should not log info messages when level is WARN`

#### 2. Test Structure
- **Arrange**: Set up test conditions and data
- **Act**: Execute the functionality being tested
- **Assert**: Verify the expected outcomes

#### 3. Assertions
- Test both positive and negative cases
- Verify console method call counts
- Check message content using `expect.stringContaining()`
- Test edge cases and error conditions

#### 4. Test Isolation
- Each test should be independent
- Use `beforeEach`/`afterEach` for setup/cleanup
- Reset state between tests
- Avoid shared test data that could cause interference

## Coverage Requirements

### Current Coverage Targets
- **Statements**: ≥90%
- **Branches**: ≥85%
- **Functions**: ≥90%
- **Lines**: ≥90%

### Viewing Coverage
```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/lcov-report/index.html
```

### Coverage Analysis
- **Red**: Uncovered code that needs tests
- **Yellow**: Partially covered branches
- **Green**: Fully covered code

## Debugging Tests

### Running Specific Tests
```bash
# Run tests matching a pattern
npm test -- --testNamePattern="should log debug"

# Run tests in a specific file
npm test log-engine.test.ts

# Run tests with verbose output
npm test -- --verbose

# Run failed tests only
npm test -- --onlyFailures
```

### Debug Mode
```bash
# Run tests with Node.js debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Use VS Code debugger
# Set breakpoints and run "Jest: Debug Current File"
```

## Common Testing Patterns

### Testing Console Output
```typescript
expect(mocks.mockConsoleLog).toHaveBeenCalledWith(
  expect.stringContaining('[INFO] Expected message')
);
```

### Testing Call Counts
```typescript
expect(mocks.mockConsoleLog).toHaveBeenCalledTimes(1);
expect(mocks.mockConsoleWarn).not.toHaveBeenCalled();
```

### Testing Configuration Changes
```typescript
LogEngine.configure({ level: LogLevel.ERROR });
LogEngine.info('Should not appear');
LogEngine.error('Should appear');

expect(mocks.mockConsoleLog).not.toHaveBeenCalled();
expect(mocks.mockConsoleError).toHaveBeenCalledTimes(1);
```

### Testing Environment Variables
```typescript
const originalNodeEnv = process.env.NODE_ENV;

afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
});

it('should configure for production', () => {
  process.env.NODE_ENV = 'production';
  jest.resetModules();
  const { LogEngine } = require('../index');
  
  // Test production configuration
});
```

## Continuous Integration

### Pre-commit Hooks
Tests should pass before committing:
```bash
# Add to package.json scripts
"precommit": "npm test"
```

### CI/CD Pipeline
Tests run automatically on:
- Pull requests
- Pushes to main branch
- Release workflows
- Scheduled runs (optional)

### Test Reporting
- Coverage reports are generated in CI
- Failed tests block merging
- Coverage trends are tracked over time

## Performance Considerations

### Test Execution Speed
- Use mocks to avoid actual console output
- Group related tests in describe blocks
- Avoid unnecessary async operations
- Use `--runInBand` for debugging only

### Memory Usage
- Clean up mocks after each test
- Avoid memory leaks in test setup
- Use `jest.resetModules()` carefully (only when needed)

## Troubleshooting

### Common Issues

#### Tests Not Finding Modules
```bash
# Ensure TypeScript is compiled
npm run build

# Check Jest configuration in package.json
```

#### Console Mocks Not Working
```typescript
// Ensure mocks are set up before LogEngine usage
beforeEach(() => {
  mocks = setupConsoleMocks();
  LogEngine.configure({ level: LogLevel.INFO }); // After mocks
});
```

#### Environment Tests Failing
```typescript
// Always restore original NODE_ENV
const originalNodeEnv = process.env.NODE_ENV;
afterEach(() => {
  process.env.NODE_ENV = originalNodeEnv;
});
```

### Getting Help
- Check Jest documentation: https://jestjs.io/docs/
- Review existing test patterns in the codebase
- Ask questions in project issues or discussions

## Contributing Tests

### Before Submitting
1. Run the full test suite: `npm test`
2. Check coverage: `npm run test:coverage`
3. Ensure new features have corresponding tests
4. Follow the established testing patterns
5. Update documentation if needed

### Pull Request Checklist
- [ ] All tests pass locally
- [ ] New functionality is tested
- [ ] Edge cases are covered
- [ ] Test names are descriptive
- [ ] Coverage requirements are met
- [ ] No test pollution (tests affect each other)

Thank you for contributing to the log-engine test suite! 🧪

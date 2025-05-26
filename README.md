# Log Engine 📝 ![gitHub actions workflow status](https://img.shields.io/github/actions/workflow/status/wgtechlabs/log-engine/test.yml?branch=main&style=flat-square&logo=github&labelColor=181717&link=https%3A%2F%2Fgithub.com%2Fwgtechlabs%2Flog-engine%2Factions%2Fworkflows%2Ftest.yml) ![codecov](https://img.shields.io/codecov/c/github/wgtechlabs/log-engine?token=PWRJTBVKQ9&style=flat-square&logo=codecov&labelColor=181717&link=https%3A%2F%2Fcodecov.io%2Fgh%2Fwgtechlabs%2Flog-engine)

[![made by](https://img.shields.io/badge/made%20by-WG%20Technology%20Labs-0060a0.svg?logo=github&longCache=true&labelColor=181717&style=flat-square)](https://github.com/wgtechlabs) [![sponsors](https://img.shields.io/badge/sponsor-%E2%9D%A4-%23db61a2.svg?&logo=github&logoColor=white&labelColor=181717&style=flat-square)](https://github.com/sponsors/wgtechlabs) [![release](https://img.shields.io/github/release/wgtechlabs/log-engine.svg?logo=github&labelColor=181717&color=green&style=flat-square)](https://github.com/wgtechlabs/log-engine/releases) [![star](https://img.shields.io/github/stars/wgtechlabs/log-engine.svg?&logo=github&labelColor=181717&color=yellow&style=flat-square)](https://github.com/wgtechlabs/log-engine/stargazers) [![license](https://img.shields.io/github/license/wgtechlabs/log-engine.svg?&logo=github&labelColor=181717&style=flat-square)](https://github.com/wgtechlabs/log-engine/blob/main/license)

WG's Log Engine is a lightweight and efficient logging utility designed specifically for bot applications running on Node.js. Built with performance and simplicity in mind, it provides structured logging with configurable levels and automatic environment-based configuration.

Whether you're building Discord bots, Telegram bots, or any Node.js application that needs reliable logging, Log Engine delivers the tools you need with minimal overhead and maximum flexibility.

## 🤗 Special Thanks

<!-- markdownlint-disable MD033 -->
| <div align="center">💎 Platinum Sponsor</div> |
|:-------------------------------------------:|
| <a href="https://unthread.com"><img src="https://raw.githubusercontent.com/wgtechlabs/unthread-discord-bot/main/.github/assets/sponsors/platinum_unthread.png" width="250" alt="Unthread"></a> |
| <div align="center"><a href="https://unthread.com" target="_blank"><b>Unthread</b></a><br/>Streamlined support ticketing for modern teams.</div> |
<!-- markdownlint-enable MD033 -->

## ✨ Key Features

- **Lightweight & Fast**: Minimal overhead with maximum performance for production applications
- **Multiple Log Levels**: Support for DEBUG, INFO, WARN, ERROR, and SILENT levels with smart filtering
- **Auto-Configuration**: Intelligent environment-based setup using NODE_ENV variables
- **Timestamp Support**: Formatted timestamps with both ISO and human-readable formats
- **TypeScript Ready**: Full TypeScript support with comprehensive type definitions
- **Zero Dependencies**: No external dependencies for maximum compatibility and security
- **Easy Integration**: Simple API that works seamlessly with existing Node.js applications

## 📦 Installation

Install the package using npm:

```bash
npm install @wgtechlabs/log-engine
```

Or using yarn:

```bash
yarn add @wgtechlabs/log-engine
```

## 🕹️ Usage

### Quick Start

```typescript
import { LogEngine, LogLevel } from '@wgtechlabs/log-engine';

// Basic usage with auto-configuration based on NODE_ENV
LogEngine.debug('This is a debug message');
LogEngine.info('This is an info message');
LogEngine.warn('This is a warning message');
LogEngine.error('This is an error message');
```

### Custom Configuration

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

### Log Levels

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

### Log Format

Log messages are formatted with timestamps and levels:

```
[2025-05-20T16:57:45.678Z] [4:57 PM] [INFO] Message here.
```

## 🧪 Testing

The log-engine project includes a comprehensive test suite to ensure reliability and functionality. The tests are organized into focused, maintainable files covering different aspects of the logging system.

### Test Structure

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

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test files
npm test log-engine
npm test logger
npm test integration
```

### Test Coverage

The project maintains high test coverage:

- **Statements**: ~94%
- **Branches**: ~87%
- **Functions**: ~90%
- **Lines**: ~94%

## 💬 Community Discussions

Join our community discussions to get help, share ideas, and connect with other users:

- 📣 **[Announcements](https://github.com/wgtechlabs/log-engine/discussions/categories/announcements)**: Official updates from the maintainer
- 📸 **[Showcase](https://github.com/wgtechlabs/log-engine/discussions/categories/showcase)**: Show and tell your implementation
- 💖 **[Wall of Love](https://github.com/wgtechlabs/log-engine/discussions/categories/wall-of-love)**: Share your experience with the library
- 🛟 **[Help & Support](https://github.com/wgtechlabs/log-engine/discussions/categories/help-support)**: Get assistance from the community
- 🧠 **[Ideas](https://github.com/wgtechlabs/log-engine/discussions/categories/ideas)**: Suggest new features and improvements

## 🛟 Help & Support

### Getting Help

Need assistance with the library? Here's how to get help:

- **Community Support**: Check the [Help & Support](https://github.com/wgtechlabs/log-engine/discussions/categories/help-support) category in our GitHub Discussions for answers to common questions.
- **Ask a Question**: Create a [new discussion](https://github.com/wgtechlabs/log-engine/discussions/new?category=help-support) if you can't find answers to your specific issue.
- **Documentation**: Review the [usage instructions](#🕹️-usage) in this README for common examples and configurations.
- **Known Issues**: Browse [existing issues](https://github.com/wgtechlabs/log-engine/issues) to see if your problem has already been reported.

### Reporting Issues

Please report any issues, bugs, or improvement suggestions by [creating a new issue](https://github.com/wgtechlabs/log-engine/issues/new/choose). Before submitting, please check if a similar issue already exists to avoid duplicates.

### Security Vulnerabilities

For security vulnerabilities, please do not report them publicly. Follow the guidelines in our [security policy](./security.md) to responsibly disclose security issues.

Your contributions to improving this project are greatly appreciated! 🙏✨

## 🎯 Contributing

Contributions are welcome, create a pull request to this repo and I will review your code. Please consider to submit your pull request to the `dev` branch. Thank you!

Read the project's [contributing guide](./contributing.md) for more info.

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

## 🙏 Sponsor

Like this project? **Leave a star**! ⭐⭐⭐⭐⭐

There are several ways you can support this project:

- [Become a sponsor](https://github.com/sponsors/wgtechlabs) and get some perks! 💖
- [Buy me a coffee](https://buymeacoffee.com/wgtechlabs) if you just love what I do! ☕

## ⭐ GitHub Star Nomination

Found this project helpful? Consider nominating me **(@warengonzaga)** for the [GitHub Star program](https://stars.github.com/nominate/)! This recognition supports ongoing development of this project and [my other open-source projects](https://github.com/warengonzaga?tab=repositories). GitHub Stars are recognized for their significant contributions to the developer community - your nomination makes a difference and encourages continued innovation!

## 📋 Code of Conduct

I'm committed to providing a welcoming and inclusive environment for all contributors and users. Please review the project's [Code of Conduct](./code_of_conduct.md) to understand the community standards and expectations for participation.

## 📃 License

This project is licensed under the [GNU Affero General Public License v3.0](https://opensource.org/licenses/AGPL-3.0). This license requires that all modifications to the code must be shared under the same license, especially when the software is used over a network. See the [LICENSE](LICENSE) file for the full license text.

## 📝 Author

This project is created by **[Waren Gonzaga](https://github.com/warengonzaga)** under [WG Technology Labs](https://github.com/wgtechlabs), with the help of awesome [contributors](https://github.com/wgtechlabs/log-engine/graphs/contributors).

[![contributors](https://contrib.rocks/image?repo=wgtechlabs/log-engine)](https://github.com/wgtechlabs/log-engine/graphs/contributors)

---

💻 with ❤️ by [Waren Gonzaga](https://warengonzaga.com) under [WG Technology Labs](https://wgtechlabs.com), and [Him](https://www.youtube.com/watch?v=HHrxS4diLew&t=44s) 🙏
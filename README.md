# Log Engine 📜🚂 [![made by](https://img.shields.io/badge/made%20by-WG%20Tech%20Labs-0060a0.svg?logo=github&longCache=true&labelColor=181717&style=flat-square)](https://github.com/wgtechlabs)

[![github actions workflow status](https://img.shields.io/github/actions/workflow/status/wgtechlabs/log-engine/test.yml?branch=main&style=flat-square&logo=github&labelColor=181717)](https://github.com/wgtechlabs/log-engine/actions/workflows/test.yml) [![codecov](https://img.shields.io/codecov/c/github/wgtechlabs/log-engine?token=PWRJTBVKQ9&style=flat-square&logo=codecov&labelColor=181717)](https://codecov.io/gh/wgtechlabs/log-engine) [![npm downloads](https://img.shields.io/npm/d18m/%40wgtechlabs%2Flog-engine?style=flat-square&logo=npm&label=installs&labelColor=181717&color=%23CD0000)](https://www.npmjs.com/package/@wgtechlabs/log-engine) [![sponsors](https://img.shields.io/badge/sponsor-%E2%9D%A4-%23db61a2.svg?&logo=github&logoColor=white&labelColor=181717&style=flat-square)](https://github.com/sponsors/wgtechlabs) [![release](https://img.shields.io/github/release/wgtechlabs/log-engine.svg?logo=github&labelColor=181717&color=green&style=flat-square)](https://github.com/wgtechlabs/log-engine/releases) [![star](https://img.shields.io/github/stars/wgtechlabs/log-engine.svg?&logo=github&labelColor=181717&color=yellow&style=flat-square)](https://github.com/wgtechlabs/log-engine/stargazers) [![license](https://img.shields.io/github/license/wgtechlabs/log-engine.svg?&logo=github&labelColor=181717&style=flat-square)](https://github.com/wgtechlabs/log-engine/blob/main/license)

[![banner](https://raw.githubusercontent.com/wgtechlabs/log-engine/main/.github/assets/repo_banner.jpg)](https://github.com/wgtechlabs/log-engine)

WG's Log Engine is the **ultimate logging solution for Node.js developers** - a lightweight, battle-tested utility specifically engineered for Discord bots, Telegram bots, web servers, APIs, and server-side applications. Born from real-world development challenges and proven in production environments like the [Unthread Discord Bot](https://github.com/wgtechlabs/unthread-discord-bot/), Log Engine delivers enterprise-grade logging with zero complexity and beautiful color-coded console output.

**Stop wrestling with logging configurations and start building amazing applications.** Whether you're creating the next viral Discord community bot, building high-performance APIs, developing microservices, or deploying production servers, Log Engine provides intelligent terminal-based logging with vibrant colors that scales with your application's growth - from your first "Hello World" to handling millions of requests across distributed systems.

## ❣️ Motivation

Picture this: It's 2 AM, your server is crashing in production, and you're staring at a terminal filled with thousands of debug messages mixed with critical errors. Sound familiar? I've been there too many times. I created Log Engine because every developer deserves to sleep peacefully, knowing their logs are working intelligently in the background.

Log Engine transforms your development experience from chaotic debugging sessions into confident, data-driven problem solving. No more guessing what went wrong, no more drowning in irrelevant logs, no more manual configuration headaches. Just clear, contextual information exactly when and where you need it. Because great applications deserve great logging, and great developers deserve tools that just work.

## ✨ Key Features

- **Lightweight & Fast**: Minimal overhead with maximum performance - designed to enhance your application, not slow it down.
- **No Learning Curve**: Dead simple API that you can master in seconds. No extensive documentation, complex configurations, or setup required - Log Engine works instantly.
- **Colorized Console Output**: Beautiful ANSI color-coded log levels with intelligent terminal formatting - instantly identify message severity at a glance with color-coded output.
- **Multiple Log Levels**: Support for DEBUG, INFO, WARN, ERROR, SILENT, OFF, and special LOG levels with smart filtering - just set your level and let it handle the rest.
- **Auto-Configuration**: Intelligent environment-based setup using NODE_ENV variables. No config files, initialization scripts, or manual setup - Log Engine works perfectly out of the box.
- **Enhanced Formatting**: Structured log entries with dual timestamps (ISO + human-readable) and colored level indicators for maximum readability.
- **TypeScript Ready**: Full TypeScript support with comprehensive type definitions for a seamless development experience.
- **Zero Dependencies**: No external dependencies for maximum compatibility and security - keeps your bundle clean and your project simple.
- **Easy Integration**: Simple API that works seamlessly with existing Node.js applications. Just `import` and start logging - no middleware, plugins, or configuration required.

## 🤔 How It Works
<!-- markdownlint-disable MD051 -->
1. Log Engine automatically detects your environment using `NODE_ENV` and sets appropriate log levels for optimal performance
2. When you call logging methods, messages are filtered based on the configured severity level (only messages at or above the set level are displayed)
3. Each log message is instantly formatted with precise timestamps in both ISO and human-readable formats
4. Messages are output to the console with **colorized level indicators and timestamps**, making debugging and monitoring effortless - errors show in red, warnings in yellow, info in blue, and debug in purple
5. ANSI color codes ensure compatibility across different terminal environments while maintaining beautiful, readable output

Ready to streamline your application logging? Get started in seconds with our [simple installation](#📦-installation)!
<!-- markdownlint-enable MD051 -->
## 🤗 Special Thanks

<!-- markdownlint-disable MD033 -->
| <div align="center">💎 Platinum Sponsor</div> |
|:-------------------------------------------:|
| <a href="https://unthread.com"><img src="https://raw.githubusercontent.com/wgtechlabs/unthread-discord-bot/main/.github/assets/sponsors/platinum_unthread.png" width="250" alt="Unthread"></a> |
| <div align="center"><a href="https://unthread.com" target="_blank"><b>Unthread</b></a><br/>Streamlined support ticketing for modern teams.</div> |
<!-- markdownlint-enable MD033 -->

## 💸 Sponsored Ads

Open source development is resource-intensive. These **sponsored ads help keep Log Engine free and actively maintained** while connecting you with tools and services that support open-source development.

[![sponsored ads](https://gitads.dev/v1/ad-serve?source=wgtechlabs/log-engine@github)](https://gitads.dev/v1/ad-track?source=wgtechlabs/log-engine@github)

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
LogEngine.log('This is a critical message that always shows');
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

// Now use Log Engine - only messages at or above the configured level will be shown
LogEngine.debug('This will only show in development');
LogEngine.info('General information');
LogEngine.warn('Warning message');
LogEngine.error('Error message');
LogEngine.log('Critical message that always shows');
```

### Color-Coded Output 🎨

Log Engine now features beautiful, color-coded console output that makes debugging and monitoring a breeze:

```typescript
import { LogEngine } from '@wgtechlabs/log-engine';

// Each log level gets its own distinct color for instant recognition
LogEngine.debug('🔍 Debugging user authentication flow');    // Purple/Magenta
LogEngine.info('ℹ️ User successfully logged in');            // Blue  
LogEngine.warn('⚠️ API rate limit at 80% capacity');         // Yellow
LogEngine.error('❌ Database connection timeout');           // Red
LogEngine.log('🚀 Application started successfully');        // Green
```

**Why Colors Matter:**

- **Instant Recognition**: Quickly spot errors, warnings, and debug info without reading every line
- **Better Debugging**: Visually separate different types of messages during development
- **Production Monitoring**: Easily scan logs for critical issues in terminal environments
- **Enhanced Readability**: Color-coded timestamps and level indicators reduce eye strain

### Log Levels

Log Engine supports the following levels (in order of severity):

- `LogLevel.DEBUG` (0) - Detailed information for debugging
- `LogLevel.INFO` (1) - General information
- `LogLevel.WARN` (2) - Warning messages
- `LogLevel.ERROR` (3) - Error messages
- `LogLevel.SILENT` (4) - No output except LOG level messages
- `LogLevel.OFF` (5) - Completely disable all output including LOG level messages
- `LogLevel.LOG` (99) - Critical messages that always show (except when OFF is set)

### Auto-Configuration

Log Engine automatically configures itself based on the `NODE_ENV` environment variable:

- `production` → `LogLevel.INFO`
- `development` → `LogLevel.DEBUG`
- `test` → `LogLevel.ERROR`
- `default` → `LogLevel.INFO`

### Special LOG Level

The `LOG` level is special and behaves differently from other levels:

- **Always Visible**: LOG messages are always displayed regardless of the configured log level (except when OFF is set)
- **Critical Information**: Perfect for essential system messages, application lifecycle events, and operational information that must never be filtered out
- **Green Color**: Uses green coloring to distinguish it from other levels
- **Use Cases**: Application startup/shutdown, server listening notifications, critical configuration changes, deployment information

```typescript
import { LogEngine, LogLevel } from '@wgtechlabs/log-engine';

// Even with SILENT level, LOG messages still appear
LogEngine.configure({ level: LogLevel.SILENT });

LogEngine.debug('Debug message');    // Hidden
LogEngine.info('Info message');      // Hidden
LogEngine.warn('Warning message');   // Hidden  
LogEngine.error('Error message');    // Hidden
LogEngine.log('Server started on port 3000'); // ✅ Always visible!

// But with OFF level, even LOG messages are hidden
LogEngine.configure({ level: LogLevel.OFF });
LogEngine.log('This LOG message is hidden'); // ❌ Hidden with OFF level
```

### Complete Silence with OFF Level

The `OFF` level provides complete logging silence when you need to disable all output:

- **Total Silence**: Disables ALL logging including the special LOG level messages
- **Testing & CI/CD**: Perfect for automated testing environments where no console output is desired
- **Performance**: Minimal overhead when logging is completely disabled
- **Use Cases**: Unit tests, CI/CD pipelines, production environments requiring zero log output

```typescript
import { LogEngine, LogLevel } from '@wgtechlabs/log-engine';

// Comparison: SILENT vs OFF
LogEngine.configure({ level: LogLevel.SILENT });
LogEngine.info('Info message');  // Hidden
LogEngine.log('Critical message'); // ✅ Still visible with SILENT

LogEngine.configure({ level: LogLevel.OFF });
LogEngine.info('Info message');  // Hidden
LogEngine.log('Critical message'); // ❌ Hidden with OFF - complete silence!
```

### Log Format

Log messages are beautifully formatted with colorized timestamps, levels, and smart terminal output:

```bash
# Example colorized output (colors visible in terminal)
[2025-05-29T16:57:45.678Z][4:57 PM][DEBUG]: Debugging application flow
[2025-05-29T16:57:46.123Z][4:57 PM][INFO]: Server started successfully  
[2025-05-29T16:57:47.456Z][4:57 PM][WARN]: API rate limit approaching
[2025-05-29T16:57:48.789Z][4:57 PM][ERROR]: Database connection failed
[2025-05-29T16:57:49.012Z][4:57 PM][LOG]: Application startup complete
```

**Color Scheme:**

- 🟣 **DEBUG**: Magenta/Purple - Detailed debugging information
- 🔵 **INFO**: Blue - General informational messages  
- 🟡 **WARN**: Yellow - Warning messages that need attention
- 🔴 **ERROR**: Red - Error messages requiring immediate action
- 🟢 **LOG**: Green - Critical messages that always display
- ⚫ **Timestamps**: Gray (ISO) and Cyan (local time) for easy scanning

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
<!-- markdownlint-disable MD051 -->
- **Community Support**: Check the [Help & Support](https://github.com/wgtechlabs/log-engine/discussions/categories/help-support) category in our GitHub Discussions for answers to common questions.
- **Ask a Question**: Create a [new discussion](https://github.com/wgtechlabs/log-engine/discussions/new?category=help-support) if you can't find answers to your specific issue.
- **Documentation**: Review the [usage instructions](#🕹️-usage) in this README for common examples and configurations.
- **Known Issues**: Browse [existing issues](https://github.com/wgtechlabs/log-engine/issues) to see if your problem has already been reported.
<!-- markdownlint-enable MD051 -->

### Reporting Issues

Please report any issues, bugs, or improvement suggestions by [creating a new issue](https://github.com/wgtechlabs/log-engine/issues/new/choose). Before submitting, please check if a similar issue already exists to avoid duplicates.

### Security Vulnerabilities

For security vulnerabilities, please do not report them publicly. Follow the guidelines in our [security policy](./security.md) to responsibly disclose security issues.

Your contributions to improving this project are greatly appreciated! 🙏✨

## 🎯 Contributing

Contributions are welcome, create a pull request to this repo and I will review your code. Please consider to submit your pull request to the `dev` branch. Thank you!

Read the project's [contributing guide](./CONTRIBUTING.md) for more info, including testing guidelines and requirements.

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

<!-- GitAds-Verify: O4MESJK7VTBCELWNTFQAWB5HDX57H9MS -->

# Log Engine 📝 ![gitHub actions workflow status](https://img.shields.io/github/actions/workflow/status/wgtechlabs/log-engine/test.yml?branch=main&style=flat-square&logo=github&labelColor=181717&link=https%3A%2F%2Fgithub.com%2Fwgtechlabs%2Flog-engine%2Factions%2Fworkflows%2Ftest.yml) ![codecov](https://img.shields.io/codecov/c/github/wgtechlabs/log-engine?token=PWRJTBVKQ9&style=flat-square&logo=codecov&labelColor=181717&link=https%3A%2F%2Fcodecov.io%2Fgh%2Fwgtechlabs%2Flog-engine)

[![made by](https://img.shields.io/badge/made%20by-WG%20Technology%20Labs-0060a0.svg?logo=github&longCache=true&labelColor=181717&style=flat-square)](https://github.com/wgtechlabs) [![sponsors](https://img.shields.io/badge/sponsor-%E2%9D%A4-%23db61a2.svg?&logo=github&logoColor=white&labelColor=181717&style=flat-square)](https://github.com/sponsors/wgtechlabs) [![release](https://img.shields.io/github/release/wgtechlabs/log-engine.svg?logo=github&labelColor=181717&color=green&style=flat-square)](https://github.com/wgtechlabs/log-engine/releases) [![star](https://img.shields.io/github/stars/wgtechlabs/log-engine.svg?&logo=github&labelColor=181717&color=yellow&style=flat-square)](https://github.com/wgtechlabs/log-engine/stargazers) [![license](https://img.shields.io/github/license/wgtechlabs/log-engine.svg?&logo=github&labelColor=181717&style=flat-square)](https://github.com/wgtechlabs/log-engine/blob/main/license)

[![banner](https://raw.githubusercontent.com/wgtechlabs/log-engine/main/.github/assets/repo_banner.jpg)](https://github.com/wgtechlabs/log-engine)

WG's Log Engine is the **ultimate logging solution for Node.js developers** - a lightweight, battle-tested utility specifically engineered for Discord bots, Telegram bots, web servers, APIs, and server-side applications. Born from real-world development challenges and proven in production environments like the [Unthread Discord Bot](https://github.com/wgtechlabs/unthread-discord-bot/), Log Engine delivers enterprise-grade logging with zero complexity.

**Stop wrestling with logging configurations and start building amazing applications.** Whether you're creating the next viral Discord community bot, building high-performance APIs, developing microservices, or deploying production servers, Log Engine provides intelligent terminal-based logging that scales with your application's growth - from your first "Hello World" to handling millions of requests across distributed systems.

## ❣️ Motivation

Picture this: It's 2 AM, your server is crashing in production, and you're staring at a terminal filled with thousands of debug messages mixed with critical errors. Sound familiar? I've been there too many times. I created Log Engine because every developer deserves to sleep peacefully, knowing their logs are working intelligently in the background.

Log Engine transforms your development experience from chaotic debugging sessions into confident, data-driven problem solving. No more guessing what went wrong, no more drowning in irrelevant logs, no more manual configuration headaches. Just clear, contextual information exactly when and where you need it. Because great applications deserve great logging, and great developers deserve tools that just work.

## ✨ Key Features

- **Lightweight & Fast**: Minimal overhead with maximum performance - designed to enhance your application, not slow it down.
- **No Learning Curve**: Dead simple API that you can master in seconds. No extensive documentation, complex configurations, or setup required - Log Engine works instantly.
- **Multiple Log Levels**: Support for DEBUG, INFO, WARN, ERROR, and SILENT levels with smart filtering - just set your level and let it handle the rest.
- **Auto-Configuration**: Intelligent environment-based setup using NODE_ENV variables. No config files, initialization scripts, or manual setup - Log Engine works perfectly out of the box.
- **Timestamp Support**: Formatted timestamps with both ISO and human-readable formats - all the formatting you need built right in.
- **TypeScript Ready**: Full TypeScript support with comprehensive type definitions for a seamless development experience.
- **Zero Dependencies**: No external dependencies for maximum compatibility and security - keeps your bundle clean and your project simple.
- **Easy Integration**: Simple API that works seamlessly with existing Node.js applications. Just `import` and start logging - no middleware, plugins, or configuration required.

## 🤔 How It Works

1. Log Engine automatically detects your environment using `NODE_ENV` and sets appropriate log levels for optimal performance
2. When you call logging methods, messages are filtered based on the configured severity level (only messages at or above the set level are displayed)
3. Each log message is instantly formatted with precise timestamps in both ISO and human-readable formats
4. Messages are output to the console with clear level indicators, making debugging and monitoring effortless

Ready to streamline your application logging? Get started in seconds with our [simple installation](#📦-installation)!

## 🤗 Special Thanks

<!-- markdownlint-disable MD033 -->
| <div align="center">💎 Platinum Sponsor</div> |
|:-------------------------------------------:|
| <a href="https://unthread.com"><img src="https://raw.githubusercontent.com/wgtechlabs/unthread-discord-bot/main/.github/assets/sponsors/platinum_unthread.png" width="250" alt="Unthread"></a> |
| <div align="center"><a href="https://unthread.com" target="_blank"><b>Unthread</b></a><br/>Streamlined support ticketing for modern teams.</div> |
<!-- markdownlint-enable MD033 -->

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

// Now use Log Engine - only messages at or above the configured level will be shown
LogEngine.debug('This will only show in development');
LogEngine.info('General information');
LogEngine.warn('Warning message');
LogEngine.error('Error message');
```

### Log Levels

Log Engine supports the following levels (in order of severity):

- `LogLevel.DEBUG` (0) - Detailed information for debugging
- `LogLevel.INFO` (1) - General information
- `LogLevel.WARN` (2) - Warning messages
- `LogLevel.ERROR` (3) - Error messages
- `LogLevel.SILENT` (4) - No output

### Auto-Configuration

Log Engine automatically configures itself based on the `NODE_ENV` environment variable:

- `production` → `LogLevel.WARN`
- `development` → `LogLevel.DEBUG`
- `test` → `LogLevel.ERROR`
- `default` → `LogLevel.INFO`

### Log Format

Log messages are formatted with timestamps and levels:

```
[2025-05-20T16:57:45.678Z] [4:57 PM] [INFO] Message here.
```

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
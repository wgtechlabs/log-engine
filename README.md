# Log Engine 📜🚂 [![made by](https://img.shields.io/badge/made%20by-WG%20Tech%20Labs// Advanced automatic data redaction (no configuration needed!)
LogEngine.info('User login', {
  username: 'john_doe',        // ✅ Visible
  password: 'secret123',       // ❌ [REDACTED]
  email: 'john@example.com',   // ❌ [REDACTED]
  apiKey: 'apikey123'          // ❌ [REDACTED]
});.svg?logo=github&longCache=true&labelColor=181717&style=flat-square)](https://github.com/wgtechlabs)

[![github actions workflow status](https://img.shields.io/github/actions/workflow/status/wgtechlabs/log-engine/test.yml?branch=main&style=flat-square&logo=github&labelColor=181717)](https://github.com/wgtechlabs/log-engine/actions/workflows/test.yml) [![codecov](https://img.shields.io/codecov/c/github/wgtechlabs/log-engine?token=PWRJTBVKQ9&style=flat-square&logo=codecov&labelColor=181717)](https://codecov.io/gh/wgtechlabs/log-engine) [![npm downloads](https://img.shields.io/npm/d18m/%40wgtechlabs%2Flog-engine?style=flat-square&logo=npm&label=installs&labelColor=181717&color=%23CD0000)](https://www.npmjs.com/package/@wgtechlabs/log-engine) [![sponsors](https://img.shields.io/badge/sponsor-%E2%9D%A4-%23db61a2.svg?&logo=github&logoColor=white&labelColor=181717&style=flat-square)](https://github.com/sponsors/wgtechlabs) [![release](https://img.shields.io/github/release/wgtechlabs/log-engine.svg?logo=github&labelColor=181717&color=green&style=flat-square)](https://github.com/wgtechlabs/log-engine/releases) [![star](https://img.shields.io/github/stars/wgtechlabs/log-engine.svg?&logo=github&labelColor=181717&color=yellow&style=flat-square)](https://github.com/wgtechlabs/log-engine/stargazers) [![license](https://img.shields.io/github/license/wgtechlabs/log-engine.svg?&logo=github&labelColor=181717&style=flat-square)](https://github.com/wgtechlabs/log-engine/blob/main/license)

[![banner](https://raw.githubusercontent.com/wgtechlabs/log-engine/main/.github/assets/repo_banner.jpg)](https://github.com/wgtechlabs/log-engine)

WG's Log Engine is the **ultimate logging solution for Node.js developers** - a lightweight, battle-tested utility specifically engineered for Discord bots, Telegram bots, web servers, APIs, and server-side applications. Born from real-world development challenges and proven in production environments like the [Unthread Discord Bot](https://github.com/wgtechlabs/unthread-discord-bot/), Log Engine delivers enterprise-grade logging with zero complexity, beautiful color-coded console output, and **advanced automatic data redaction with comprehensive PII protection**.

**The first logging library with built-in advanced PII protection and comprehensive TypeScript support.** Stop wrestling with logging configurations and start building amazing applications safely. Whether you're creating the next viral Discord community bot, building high-performance APIs, developing microservices, or deploying production servers, Log Engine provides intelligent terminal-based logging with vibrant colors, advanced customizable redaction patterns, and automatic sensitive data protection that scales with your application's growth - from your first "Hello World" to handling millions of requests across distributed systems.

## ❣️ Motivation

Picture this: It's 2 AM, your server is crashing in production, and you're staring at a terminal filled with thousands of debug messages mixed with critical errors. Sound familiar? I've been there too many times. I created Log Engine because every developer deserves to sleep peacefully, knowing their logs are working intelligently in the background.

Log Engine transforms your development experience from chaotic debugging sessions into confident, data-driven problem solving. No more guessing what went wrong, no more drowning in irrelevant logs, no more manual configuration headaches. Just clear, contextual information exactly when and where you need it. Because great applications deserve great logging, and great developers deserve tools that just work.

## ✨ Key Features

- **🔒 Advanced Data Redaction (Enhanced!)**: Built-in PII protection with **custom regex patterns**, **dynamic field management**, and **environment-based configuration** - the first logging library with comprehensive security-first logging by default.
- **⚡ Custom Redaction Patterns**: Add your own regex patterns for advanced field detection and enterprise-specific data protection requirements.
- **🎯 Dynamic Field Management**: Runtime configuration of sensitive fields with case-insensitive matching and partial field name detection.
- **🛠️ Developer-Friendly API**: Advanced redaction methods including `testFieldRedaction()`, `withoutRedaction()`, and comprehensive configuration management.
- **📊 Comprehensive TypeScript Support**: Full type definitions with 10+ interfaces covering all functionality for maximum developer experience and IDE support.
- **🚀 Lightweight & Fast**: Minimal overhead with maximum performance - designed to enhance your application, not slow it down.
- **📚 No Learning Curve**: Dead simple API that you can master in seconds. No extensive documentation, complex configurations, or setup required - Log Engine works instantly.
- **🌈 Colorized Console Output**: Beautiful ANSI color-coded log levels with intelligent terminal formatting - instantly identify message severity at a glance with color-coded output.
- **🎛️ Multiple Log Modes**: Support for DEBUG, INFO, WARN, ERROR, SILENT, OFF, and special LOG levels with smart filtering - just set your mode and let it handle the rest.
- **⚙️ Auto-Configuration**: Intelligent environment-based setup using NODE_ENV variables. No config files, initialization scripts, or manual setup - Log Engine works perfectly out of the box.
- **✨ Enhanced Formatting**: Structured log entries with dual timestamps (ISO + human-readable) and colored level indicators for maximum readability.
- **🔗 Zero Dependencies**: No external dependencies for maximum compatibility and security - keeps your bundle clean and your project simple.
- **🔌 Easy Integration**: Simple API that works seamlessly with existing Node.js applications. Just `import` and start logging - no middleware, plugins, or configuration required.

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
import { LogEngine, LogMode } from '@wgtechlabs/log-engine';

// Basic usage with auto-configuration based on NODE_ENV
LogEngine.debug('This is a debug message');
LogEngine.info('This is an info message');
LogEngine.warn('This is a warning message');
LogEngine.error('This is an error message');
LogEngine.log('This is a critical message that always shows');

// Advanced automatic data redaction (no configuration needed!)
LogEngine.info('User login', {
  username: 'john_doe',        // ✅ Visible
  password: 'secret123',       // ❌ [REDACTED]
  email: 'john@example.com',   // ❌ [REDACTED]
  apiKey: 'apikey123'             // ❌ [REDACTED]
});

// Advanced redaction features - Add custom patterns
LogEngine.addCustomRedactionPatterns([/internal.*/i, /company.*/i]);
LogEngine.addSensitiveFields(['companySecret', 'internalToken']);

// Test field redaction
console.log(LogEngine.testFieldRedaction('password')); // true
console.log(LogEngine.testFieldRedaction('username')); // false

// Raw logging for debugging (bypasses redaction)
LogEngine.withoutRedaction().info('Debug data', { password: 'visible-in-debug' });
```

### Mode-Based Configuration (Recommended)

Log Engine now uses a modern **LogMode** system that separates message severity from output control:

```typescript
import { LogEngine, LogMode } from '@wgtechlabs/log-engine';

// Configure using LogMode (recommended approach)
LogEngine.configure({ mode: LogMode.DEBUG });  // Most verbose
LogEngine.configure({ mode: LogMode.INFO });   // Balanced
LogEngine.configure({ mode: LogMode.WARN });   // Focused  
LogEngine.configure({ mode: LogMode.ERROR });  // Minimal
LogEngine.configure({ mode: LogMode.SILENT }); // Critical only
LogEngine.configure({ mode: LogMode.OFF });    // Complete silence

// Environment-based configuration example
const env = process.env.NODE_ENV || 'development';

if (env === 'production') {
    LogEngine.configure({ mode: LogMode.INFO });
} else if (env === 'staging') {
    LogEngine.configure({ mode: LogMode.WARN });
} else {
    LogEngine.configure({ mode: LogMode.DEBUG });
}

// Now use Log Engine - only messages appropriate for the mode will be shown
LogEngine.debug('This will only show in DEBUG mode');
LogEngine.info('General information');
LogEngine.warn('Warning message');
LogEngine.error('Error message');
LogEngine.log('Critical message that always shows');
```

### Legacy Level-Based Configuration (Backwards Compatible)

For backwards compatibility, the old `LogLevel` API is still supported:

```typescript
import { LogEngine, LogLevel } from '@wgtechlabs/log-engine';

// Legacy configuration (still works but LogMode is recommended)
LogEngine.configure({ level: LogLevel.DEBUG });
LogEngine.configure({ level: LogLevel.INFO });
LogEngine.configure({ level: LogLevel.WARN });
LogEngine.configure({ level: LogLevel.ERROR });
```

### Migration Guide: LogLevel → LogMode

**Version 1.2.0+** introduces the new LogMode system for better separation of concerns. Here's how to migrate:

```typescript
// OLD (v1.1.0 and earlier) - still works but deprecated
import { LogEngine, LogLevel } from '@wgtechlabs/log-engine';
LogEngine.configure({ level: LogLevel.DEBUG });

// NEW (v1.2.1+) - recommended approach with advanced features
import { LogEngine, LogMode } from '@wgtechlabs/log-engine';
LogEngine.configure({ mode: LogMode.DEBUG });
```

**Key Benefits of LogMode:**

- **Clearer API**: Separates message severity (`LogLevel`) from output control (`LogMode`)
- **Better Environment Defaults**: `development→DEBUG`, `staging→WARN`, `test→ERROR`
- **Advanced Features**: New redaction APIs and TypeScript interfaces work with LogMode
- **Future-Proof**: All new features use the LogMode system
- **100% Backwards Compatible**: Existing code continues to work unchanged

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

### Log Modes

Log Engine uses a **LogMode** system that controls output verbosity and filtering:

- `LogMode.DEBUG` (0) - Most verbose: shows DEBUG, INFO, WARN, ERROR, LOG messages
- `LogMode.INFO` (1) - Balanced: shows INFO, WARN, ERROR, LOG messages  
- `LogMode.WARN` (2) - Focused: shows WARN, ERROR, LOG messages
- `LogMode.ERROR` (3) - Minimal: shows ERROR, LOG messages
- `LogMode.SILENT` (4) - Critical only: shows LOG messages only
- `LogMode.OFF` (5) - Complete silence: shows no messages at all

### Message Severity Levels

Individual log messages have severity levels that determine their importance:

- `LogLevel.DEBUG` (0) - Detailed information for debugging
- `LogLevel.INFO` (1) - General information
- `LogLevel.WARN` (2) - Warning messages
- `LogLevel.ERROR` (3) - Error messages
- `LogLevel.LOG` (99) - Critical messages that always show (except when OFF mode is set)

### Auto-Configuration

Log Engine automatically configures itself based on the `NODE_ENV` environment variable:

- `development` → `LogMode.DEBUG` (most verbose)
- `production` → `LogMode.INFO` (balanced)
- `staging` → `LogMode.WARN` (focused)
- `test` → `LogMode.ERROR` (minimal)
- `default` → `LogMode.INFO` (balanced)

### Special LOG Level

The `LOG` level is special and behaves differently from other levels:

- **Always Visible**: LOG messages are always displayed regardless of the configured log mode (except when OFF mode is set)
- **Critical Information**: Perfect for essential system messages, application lifecycle events, and operational information that must never be filtered out
- **Green Color**: Uses green coloring to distinguish it from other levels
- **Use Cases**: Application startup/shutdown, server listening notifications, critical configuration changes, deployment information

```typescript
import { LogEngine, LogMode } from '@wgtechlabs/log-engine';

// Even with SILENT mode, LOG messages still appear
LogEngine.configure({ mode: LogMode.SILENT });

LogEngine.debug('Debug message');    // Hidden
LogEngine.info('Info message');      // Hidden
LogEngine.warn('Warning message');   // Hidden  
LogEngine.error('Error message');    // Hidden
LogEngine.log('Server started on port 3000'); // ✅ Always visible!

// But with OFF mode, even LOG messages are hidden
LogEngine.configure({ mode: LogMode.OFF });
LogEngine.log('This LOG message is hidden'); // ❌ Hidden with OFF mode
```

### Complete Silence with OFF Mode

The `OFF` mode provides complete logging silence when you need to disable all output:

- **Total Silence**: Disables ALL logging including the special LOG level messages
- **Testing & CI/CD**: Perfect for automated testing environments where no console output is desired
- **Performance**: Minimal overhead when logging is completely disabled
- **Use Cases**: Unit tests, CI/CD pipelines, production environments requiring zero log output

```typescript
import { LogEngine, LogMode } from '@wgtechlabs/log-engine';

// Comparison: SILENT vs OFF
LogEngine.configure({ mode: LogMode.SILENT });
LogEngine.info('Info message');  // Hidden
LogEngine.log('Critical message'); // ✅ Still visible with SILENT

LogEngine.configure({ mode: LogMode.OFF });
LogEngine.info('Info message');  // Hidden
LogEngine.log('Critical message'); // ❌ Hidden with OFF - complete silence!
```

### Log Format

Log messages are beautifully formatted with colorized timestamps, levels, and smart terminal output:

```bash
# Example colorized output (colors visible in terminal)
[2025-05-29T16:57:45.678Z][4:57PM][DEBUG]: Debugging application flow
[2025-05-29T16:57:46.123Z][4:57PM][INFO]: Server started successfully  
[2025-05-29T16:57:47.456Z][4:57PM][WARN]: API rate limit approaching
[2025-05-29T16:57:48.789Z][4:57PM][ERROR]: Database connection failed
[2025-05-29T16:57:49.012Z][4:57PM][LOG]: Application startup complete
```

**Color Scheme:**

- 🟣 **DEBUG**: Magenta/Purple - Detailed debugging information
- 🔵 **INFO**: Blue - General informational messages  
- 🟡 **WARN**: Yellow - Warning messages that need attention
- 🔴 **ERROR**: Red - Error messages requiring immediate action
- 🟢 **LOG**: Green - Critical messages that always display
- ⚫ **Timestamps**: Gray (ISO) and Cyan (local time) for easy scanning

## 🔒 Advanced Data Redaction

**LogEngine features comprehensive built-in PII protection with advanced customization capabilities that automatically redacts sensitive information from your logs.** This security-first approach prevents accidental exposure of passwords, tokens, emails, and other sensitive data while maintaining full debugging capabilities with enterprise-grade flexibility.

### Zero Configuration Security

Just use LogEngine normally - **sensitive data is automatically protected**:

```typescript
import { LogEngine } from '@wgtechlabs/log-engine';

// ✅ Automatic redaction - no setup needed!
LogEngine.info('User authentication', {
  username: 'john_doe',        // ✅ Visible
  password: 'secret123',       // ❌ [REDACTED]
  email: 'john@example.com',   // ❌ [REDACTED]
  apiKey: 'apikey123',         // ❌ [REDACTED]
  timestamp: new Date()        // ✅ Visible
});

// Output: [INFO]: User authentication {"username":"john_doe","password":"[REDACTED]","email":"[REDACTED]","apiKey":"[REDACTED]","timestamp":"2025-06-17T..."}
```

### Protected Data Types

**50+ sensitive patterns automatically detected:**

- **Authentication**: `password`, `token`, `apiKey`, `secret`, `jwt`, `auth`, `sessionId`
- **Personal Info**: `email`, `phone`, `ssn`, `firstName`, `lastName`, `address`
- **Financial**: `creditCard`, `cvv`, `bankAccount`, `routingNumber`
- **System**: `clientSecret`, `privateKey`, `webhookSecret`

### Deep Object Scanning

Automatically scans nested objects and arrays:

```typescript
LogEngine.warn('Payment processing', {
  order: {
    id: 'order-123',           // ✅ Visible
    customer: {
      username: 'customer1',      // ✅ Visible
      email: 'user@example.com',  // ❌ [REDACTED]
      creditCard: '4532-****'     // ❌ [REDACTED]
    }
  },
  metadata: {
    processor: 'stripe',
    apiSecret: 'sk_live_...'     // ❌ [REDACTED]
  }
});
```

### Content Truncation

Large content fields are automatically truncated to prevent log bloat:

```typescript
LogEngine.debug('Large payload', {
  content: 'Very long content...'.repeat(100), // Truncated at 100 chars + "... [TRUNCATED]"
  size: 'large',
  processed: true
});
```

### Development-Friendly Features

**Raw Methods for Debugging:**

```typescript
// ⚠️ Use with caution - bypasses redaction
LogEngine.debugRaw('Full debug data', {
  password: 'secret123',    // ⚠️ Visible (not redacted)
  apiKey: 'full-key'        // ⚠️ Visible (not redacted)
});

// Or use the helper method
LogEngine.withoutRedaction().info('Debug mode', sensitiveData);
```

**Environment-Based Control:**

```bash
# Development - show everything (redaction disabled)
NODE_ENV=development

# Explicitly disable redaction  
LOG_REDACTION_DISABLED=true
DEBUG_FULL_PAYLOADS=true

# Custom redaction configuration
LOG_REDACTION_TEXT="***CONFIDENTIAL***"
LOG_MAX_CONTENT_LENGTH=200
LOG_SENSITIVE_FIELDS="customField,companySecret,internalData"
LOG_TRUNCATION_TEXT="... [CUSTOM_TRUNCATED]"

# Advanced environment integration
LOG_REDACTION_ENABLED=false  # Alternative disable method
```

### Custom Configuration

**Modify redaction behavior:**

```typescript
// Custom redaction settings
LogEngine.configureRedaction({
  redactionText: '***HIDDEN***',
  maxContentLength: 200,
  sensitiveFields: ['myCustomField', 'internalSecret']
});

// Get current configuration
const config = LogEngine.getRedactionConfig();
console.log(config);
```

### Advanced Redaction Features (v1.2.1+)

**Custom Patterns & Dynamic Field Management:**

```typescript
// Add custom regex patterns for enterprise-specific data protection
LogEngine.addCustomRedactionPatterns([
  /internal.*/i,        // Matches any field starting with "internal"
  /company.*/i,         // Matches any field starting with "company"  
  /^config[A-Z]/        // Matches camelCase config fields
]);

// Add custom sensitive field names dynamically
LogEngine.addSensitiveFields(['companySecret', 'internalToken', 'proprietaryData']);

// Test field redaction before logging
if (LogEngine.testFieldRedaction('myField')) {
  console.log('Field will be redacted');
}

// Advanced configuration management
LogEngine.configureRedaction({
  redactionText: '***CONFIDENTIAL***',
  maxContentLength: 150,
  customPatterns: [/private.*/i, /secret.*/i]
});

// Configuration utilities
const currentConfig = LogEngine.getRedactionConfig();
LogEngine.refreshRedactionConfig();  // Refresh from environment
LogEngine.resetRedactionConfig();    // Reset to defaults
LogEngine.clearCustomRedactionPatterns(); // Clear custom patterns
```

**Enhanced Development Workflow:**

```typescript
// Raw logging methods (bypass redaction) - use with caution
LogEngine.debugRaw('Full debug data', { password: 'visible', apiKey: 'full-key' });

// Temporary redaction bypass using helper method
LogEngine.withoutRedaction().info('Debug mode', sensitiveData);

// Compare outputs during development
LogEngine.info('With redaction', data);                    // ❌ [REDACTED]
LogEngine.withoutRedaction().info('Without redaction', data); // ⚠️ Visible
```

### Environment Behavior

| Environment | Redaction Status | Use Case |
|-------------|------------------|----------|
| **Production** | 🔒 **Active** | Full protection for live systems |
| **Development** | 🛠️ **Disabled** | Full data visibility for debugging |
| **Staging** | 🔒 **Active** | Test with production-like security |
| **Test** | 🔒 **Active** | Consistent test environment |

### Security Benefits

✅ **Advanced Pattern Recognition** - Custom regex patterns for enterprise-specific data protection  
✅ **Dynamic Field Management** - Runtime configuration of sensitive fields with intelligent matching  
✅ **Comprehensive Testing API** - `testFieldRedaction()` for validation and debugging  
✅ **Environment Integration** - Seamless configuration via environment variables  
✅ **Development Workflow** - Raw logging methods and temporary redaction bypass for debugging  
✅ **Prevents Data Leaks** - Automatic protection against accidental exposure with 50+ built-in patterns  
✅ **Compliance Ready** - Helps meet GDPR, HIPAA, and other privacy requirements  
✅ **Zero Configuration** - Secure by default, advanced features when needed  
✅ **Performance Optimized** - Minimal overhead with intelligent processing and depth limiting  
✅ **TypeScript Excellence** - Full type safety with comprehensive interfaces and type definitions  

**Perfect for:** Enterprise applications, compliance requirements, team development environments, production systems requiring both security and debugging flexibility, and any scenario where sensitive data protection is critical.

## 📚 Comprehensive TypeScript Support

**LogEngine v1.2.1+ includes extensive TypeScript definitions with 10+ interfaces for maximum type safety and developer experience:**

### Core Interfaces

```typescript
import { 
  LogEngine, 
  LogMode, 
  LogLevel,
  ILogEngine,
  ILogEngineWithoutRedaction,
  RedactionConfig,
  LoggerConfig,
  IDataRedactor
} from '@wgtechlabs/log-engine';

// Full type safety for all methods
const config: RedactionConfig = {
  enabled: true,
  sensitiveFields: ['password', 'token'],
  redactionText: '[HIDDEN]',
  maxContentLength: 100,
  // ... fully typed configuration
};

// Advanced redaction testing with return types
const isRedacted: boolean = LogEngine.testFieldRedaction('password');
const currentConfig: RedactionConfig = LogEngine.getRedactionConfig();

// Type-safe raw logging
const rawLogger: ILogEngineWithoutRedaction = LogEngine.withoutRedaction();
rawLogger.info('Debug info', sensitiveData); // Fully typed methods
```

### Available Interfaces

- **`ILogEngine`** - Complete LogEngine API with all methods
- **`ILogEngineWithoutRedaction`** - Raw logging methods interface  
- **`IDataRedactor`** - Static DataRedactor class methods
- **`RedactionConfig`** - Comprehensive redaction configuration
- **`LoggerConfig`** - Logger configuration options
- **`LogEntry`** - Structured log entry interface
- **`EnvironmentConfig`** - Environment variable documentation
- **Plus 3+ additional interfaces** for advanced use cases

**IDE Benefits:** IntelliSense, auto-completion, parameter hints, error detection, and comprehensive documentation tooltips throughout your development workflow.

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

**Latest Version:** v1.3.0 - Enhanced with advanced redaction features, comprehensive TypeScript support, and 95%+ test coverage.

[![contributors](https://contrib.rocks/image?repo=wgtechlabs/log-engine)](https://github.com/wgtechlabs/log-engine/graphs/contributors)

---

💻 with ❤️ by [Waren Gonzaga](https://warengonzaga.com) under [WG Technology Labs](https://wgtechlabs.com), and [Him](https://www.youtube.com/watch?v=HHrxS4diLew&t=44s) 🙏

<!-- GitAds-Verify: O4MESJK7VTBCELWNTFQAWB5HDX57H9MS -->

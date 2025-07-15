# Log Engine 📜🚂 [![made by](https://img.shields.io/badge/made%20by-WG%20Tech%20Labs-0060a0.svg?logo=github&longCache=true&labelColor=181717&style=flat-square)](https://github.com/wgtechlabs)

[![codecov](https://img.shields.io/codecov/c/github/wgtechlabs/log-engine?token=PWRJTBVKQ9&style=flat-square&logo=codecov&labelColor=181717)](https://codecov.io/gh/wgtechlabs/log-engine) [![npm downloads](https://img.shields.io/npm/dm/%40wgtechlabs%2Flog-engine?style=flat-square&logo=npm&label=installs&labelColor=181717&color=%23CD0000)](https://www.npmjs.com/package/@wgtechlabs/log-engine) [![sponsors](https://img.shields.io/badge/sponsor-%E2%9D%A4-%23db61a2.svg?&logo=github&logoColor=white&labelColor=181717&style=flat-square)](https://github.com/sponsors/wgtechlabs) [![release](https://img.shields.io/github/release/wgtechlabs/log-engine.svg?logo=github&labelColor=181717&color=green&style=flat-square)](https://github.com/wgtechlabs/log-engine/releases) [![star](https://img.shields.io/github/stars/wgtechlabs/log-engine.svg?&logo=github&labelColor=181717&color=yellow&style=flat-square)](https://github.com/wgtechlabs/log-engine/stargazers) [![license](https://img.shields.io/github/license/wgtechlabs/log-engine.svg?&logo=github&labelColor=181717&style=flat-square)](https://github.com/wgtechlabs/log-engine/blob/main/license)

[![banner](https://raw.githubusercontent.com/wgtechlabs/log-engine/main/.github/assets/repo_banner.jpg)](https://github.com/wgtechlabs/log-engine)

WG's Log Engine is the **ultimate logging solution for Node.js developers** - a lightweight, battle-tested utility specifically engineered for Discord bots, Telegram bots, web servers, APIs, and server-side applications. Born from real-world development challenges and proven in production environments like the [Unthread Discord Bot](https://github.com/wgtechlabs/unthread-discord-bot/), Log Engine delivers enterprise-grade logging with zero complexity, beautiful color-coded console output, **revolutionary configurable output routing**, and **advanced automatic data redaction with comprehensive PII protection**.

**The first logging library with built-in advanced PII protection, configurable output handlers, and comprehensive TypeScript support.** Stop wrestling with logging configurations and start building amazing applications safely. Whether you're creating the next viral Discord community bot, building high-performance APIs, developing microservices, or deploying production servers, Log Engine provides intelligent logging with vibrant colors, flexible output routing to any destination, advanced customizable redaction patterns, and automatic sensitive data protection that scales with your application's growth - from your first "Hello World" to handling millions of requests across distributed systems.

## ❣️ Motivation

Picture this: It's 2 AM, your server is crashing in production, and you're staring at a terminal filled with thousands of debug messages mixed with critical errors. Sound familiar? I've been there too many times. I created Log Engine because every developer deserves to sleep peacefully, knowing their logs are working intelligently in the background.

Log Engine transforms your development experience from chaotic debugging sessions into confident, data-driven problem solving. No more guessing what went wrong, no more drowning in irrelevant logs, no more manual configuration headaches. Just clear, contextual information exactly when and where you need it. Because great applications deserve great logging, and great developers deserve tools that just work.

## ✨ Key Features

- **🔒 Advanced Data Redaction (Enhanced!)**: Built-in PII protection with **custom regex patterns**, **dynamic field management**, and **environment-based configuration** - the first logging library with comprehensive security-first logging by default.
- **🎯 Configurable Output Handlers (New!)**: Revolutionary output routing system supporting **custom destinations**, **multiple simultaneous outputs**, and **production-ready handlers** - redirect logs to files, HTTP endpoints, GUI applications, testing frameworks, or any custom destination with zero configuration complexity.
- **⚡ Custom Redaction Patterns**: Add your own regex patterns for advanced field detection and enterprise-specific data protection requirements.
- **🎯 Dynamic Field Management**: Runtime configuration of sensitive fields with case-insensitive matching and partial field name detection.
- **🛠️ Developer-Friendly API**: Advanced redaction methods including `testFieldRedaction()`, `withoutRedaction()`, and comprehensive configuration management.
- **📊 Comprehensive TypeScript Support**: Full type definitions with 15+ interfaces covering all functionality for maximum developer experience and IDE support.
- **🚀 Lightweight & Fast**: Minimal overhead with maximum performance - designed to enhance your application, not slow it down.
- **📚 No Learning Curve**: Dead simple API that you can master in seconds. No extensive documentation, complex configurations, or setup required - Log Engine works instantly.
- **🌈 Colorized Console Output**: Beautiful ANSI color-coded log levels with intelligent terminal formatting - instantly identify message severity at a glance with color-coded output.
- **🎛️ Multiple Log Modes**: Support for DEBUG, INFO, WARN, ERROR, SILENT, OFF, and special LOG levels with smart filtering - just set your mode and let it handle the rest.
- **⚙️ Auto-Configuration**: Intelligent environment-based setup using NODE_ENV variables. No config files, initialization scripts, or manual setup - Log Engine works perfectly out of the box.
- **✨ Enhanced Formatting**: Structured log entries with dual timestamps (ISO + human-readable) and colored level indicators for maximum readability.
- **🔗 Zero Dependencies**: No external dependencies for maximum compatibility and security - keeps your bundle clean and your project simple.
- **🔌 Easy Integration**: Simple API that works seamlessly with existing Node.js applications. Just `import` and start logging - no middleware, plugins, or configuration required.

## ⚠️ Breaking Changes Notice

**v3.0.0 Breaking Change**: The legacy `level` configuration will be removed in v3.0.0. If you're using `LogEngine.configure({ level: LogLevel.DEBUG })`, please migrate to `LogEngine.configure({ mode: LogMode.DEBUG })`. See our [Migration Guide](#migration-guide-loglevel--logmode) for details.

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

Install the package using yarn (recommended):

```bash
yarn add @wgtechlabs/log-engine
```

Or using npm:

```bash
npm install @wgtechlabs/log-engine
```

> **Note**: This project uses yarn as the primary package manager for development. If you're contributing to the project, please use yarn to ensure consistency with the development environment.

## 🕹️ Usage

> **⚠️ Important**: If you're using the legacy `level` configuration, please migrate to `mode`. The `level` configuration is deprecated and will be removed in v3.0.0. See the [Migration Guide](#migration-guide-loglevel--logmode) below.

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
  apiKey: 'apikey123'          // ❌ [REDACTED]
});

// Advanced redaction features - Add custom patterns
LogEngine.addCustomRedactionPatterns([/internal.*/i, /company.*/i]);
LogEngine.addSensitiveFields(['companySecret', 'internalToken']);

// Test field redaction
console.log(LogEngine.testFieldRedaction('password')); // true
console.log(LogEngine.testFieldRedaction('username')); // false

// Raw logging for debugging (bypasses redaction)
LogEngine.withoutRedaction().info('Debug data', { password: 'visible-in-debug' });

// NEW: Custom output destinations (v2.0+)
LogEngine.configure({
  outputHandler: (level, message, data) => {
    // Send logs anywhere: GUI apps, files, APIs, databases
    myCustomHandler(level, message, data);
  },
  suppressConsoleOutput: true  // Optional: disable console
});

// NEW: Multiple outputs simultaneously
LogEngine.configure({
  outputs: [
    'console',             // Built-in console
    myFileHandler,         // Custom file handler
    myMonitoringHandler    // Custom monitoring
  ]
});
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

### Legacy Level-Based Configuration (⚠️ Deprecated)

**⚠️ DEPRECATION WARNING**: The `level` configuration is deprecated and will be removed in **v3.0.0**. Please use `mode` instead.

For backwards compatibility, the old `LogLevel` API is still supported but shows deprecation warnings:

```typescript
import { LogEngine, LogLevel } from '@wgtechlabs/log-engine';

// ⚠️ DEPRECATED: Legacy configuration (shows warning, will be removed in v3.0.0)
LogEngine.configure({ level: LogLevel.DEBUG });   // Triggers deprecation warning
LogEngine.configure({ level: LogLevel.INFO });    // Triggers deprecation warning
LogEngine.configure({ level: LogLevel.WARN });    // Triggers deprecation warning
LogEngine.configure({ level: LogLevel.ERROR });   // Triggers deprecation warning

// ✅ RECOMMENDED: Use the modern LogMode API instead
LogEngine.configure({ mode: LogMode.DEBUG });     // No warnings, future-proof
```

**Why migrate to LogMode?**

- No deprecation warnings
- Future-proof API that won't be removed
- Better separation of concerns
- Access to all v2.0+ features including output handlers
- Clearer, more intuitive configuration

### Migration Guide: LogLevel → LogMode

**⚠️ IMPORTANT DEPRECATION NOTICE**: The `level` configuration is **deprecated as of v2.0.0** and will be **removed in v3.0.0**. Please migrate to the new `mode` configuration.

**Version 1.2.0+** introduces the new LogMode system for better separation of concerns. Here's how to migrate:

```typescript
// ❌ OLD (v1.1.0 and earlier) - DEPRECATED, will be removed in v3.0.0
import { LogEngine, LogLevel } from '@wgtechlabs/log-engine';
LogEngine.configure({ level: LogLevel.DEBUG });  // Shows deprecation warning

// ✅ NEW (v2.0.0+) - recommended approach with advanced features
import { LogEngine, LogMode } from '@wgtechlabs/log-engine';
LogEngine.configure({ mode: LogMode.DEBUG });   // Modern, future-proof API
```

**Migration Benefits:**

**Key Benefits of LogMode:**

- **Clearer API**: Separates message severity (`LogLevel`) from output control (`LogMode`)
- **Better Environment Defaults**: `development→DEBUG`, `staging→WARN`, `test→ERROR`
- **Advanced Features**: New redaction APIs and TypeScript interfaces work with LogMode
- **Future-Proof**: All new features use the LogMode system
- **100% Backwards Compatible**: Existing code continues to work unchanged (with deprecation warnings)
- **No Breaking Changes in v2.0**: Legacy `level` support maintained until v3.0.0

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

### Customizing Log Elements

**LogEngine v2.1+ introduces the ability to customize which elements are included in your log output** while keeping log levels mandatory for clarity and consistency.

#### Available Customization Options

You can control the inclusion of timestamp elements:

- **ISO Timestamp**: `[2025-05-29T16:57:45.678Z]` - Precise UTC timestamp
- **Local Time**: `[4:57PM]` - Human-readable local time
- **Log Level**: `[INFO]` - Always included (non-customizable as per design)

#### Format Configuration Examples

```typescript
import { LogEngine, LogMode } from '@wgtechlabs/log-engine';

// Default format (backward compatible)
LogEngine.configure({ mode: LogMode.DEBUG });
LogEngine.info('Server started');
// Output: [2025-05-29T16:57:45.678Z][4:57PM][INFO]: Server started

// Only ISO timestamp
LogEngine.configure({ 
  mode: LogMode.DEBUG,
  format: {
    includeIsoTimestamp: true,
    includeLocalTime: false
  }
});
LogEngine.info('Database connected');
// Output: [2025-05-29T16:57:45.678Z][INFO]: Database connected

// Only local time
LogEngine.configure({ 
  mode: LogMode.DEBUG,
  format: {
    includeIsoTimestamp: false,
    includeLocalTime: true
  }
});
LogEngine.warn('Rate limit approaching');
// Output: [4:57PM][WARN]: Rate limit approaching

// Minimal format (no timestamps)
LogEngine.configure({ 
  mode: LogMode.DEBUG,
  format: {
    includeIsoTimestamp: false,
    includeLocalTime: false
  }
});
LogEngine.error('Connection failed');
// Output: [ERROR]: Connection failed
```

#### Benefits of Log Element Customization

- **🎯 Reduced Verbosity**: Remove unnecessary timestamp information in containerized environments where external logging systems add timestamps
- **📱 Space Efficiency**: Minimize log line length for mobile or constrained display environments  
- **🔧 Integration Ready**: Match existing log format requirements in your infrastructure
- **⚡ Performance**: Slightly reduced formatting overhead when timestamps are disabled
- **🔒 Backward Compatible**: Default behavior remains unchanged - existing code continues to work without modifications

**Note**: Log levels (`[DEBUG]`, `[INFO]`, `[WARN]`, `[ERROR]`, `[LOG]`) are always included regardless of configuration to maintain log clarity and filtering capabilities.

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

## 🎯 Configurable Output Handlers

**LogEngine v2.0+ introduces revolutionary output routing capabilities that transform how and where your logs are delivered.** This powerful system enables custom log destinations, multiple simultaneous outputs, and production-ready handlers while maintaining the same simple API you know and love.

### Zero-Configuration Custom Routing

**Redirect logs anywhere with a single configuration:**

```typescript
import { LogEngine } from '@wgtechlabs/log-engine';

// Redirect to GUI application
LogEngine.configure({
  outputHandler: (level, message, data) => {
    updateReactUI({ level, message, timestamp: new Date() });
  },
  suppressConsoleOutput: true  // Optional: disable console output
});

// Testing framework integration
const capturedLogs = [];
LogEngine.configure({
  outputHandler: (level, message, data) => {
    capturedLogs.push({ level, message, data });
  },
  suppressConsoleOutput: true
});

// Now use LogEngine normally - output goes to your custom handler
LogEngine.info('User logged in', { userId: 123 });
```

### Multiple Simultaneous Outputs

**Log to multiple destinations at once with built-in handlers:**

```typescript
LogEngine.configure({
  outputs: [
    'console',           // Built-in console handler
    'silent',           // Built-in silent handler (no output)
    (level, message, data) => {
      // Custom file handler
      fs.appendFileSync('./app.log', `${new Date().toISOString()} [${level}] ${message}\n`);
    },
    (level, message, data) => {
      // Custom network handler
      if (level === 'error') {
        sendToMonitoringService({ level, message, data });
      }
    }
  ]
});

// Single log call outputs to all configured destinations
LogEngine.error('Database connection failed', { retries: 3 });
```

### Production-Ready Advanced Handlers

**Enterprise-grade file and HTTP outputs with advanced features:**

```typescript
LogEngine.configure({
  enhancedOutputs: [
    'console',
    {
      type: 'file',
      config: {
        filePath: './logs/app.log',
        maxFileSize: 10485760,        // 10MB rotation
        maxBackupFiles: 5,            // Keep 5 backup files
        append: true,                 // Append mode
        formatter: (level, message, data) => {
          const timestamp = new Date().toISOString();
          const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
          return `[${timestamp}] ${level.toUpperCase()}: ${message}${dataStr}\n`;
        }
      }
    },
    {
      type: 'http',
      config: {
        url: 'https://api.datadog.com/v1/logs',
        method: 'POST',
        batchSize: 10,                // Batch requests for performance
        timeout: 5000,                // 5-second timeout
        headers: {
          'Authorization': 'Bearer your-api-key',
          'Content-Type': 'application/json'
        },
        formatter: (logs) => ({
          service: 'my-app',
          environment: process.env.NODE_ENV,
          logs: logs.map(log => ({
            timestamp: log.timestamp,
            level: log.level,
            message: log.message,
            metadata: log.data
          }))
        })
      }
    }
  ]
});
```

### Configuration Priority System

**Flexible configuration with intelligent priority handling:**

```typescript
// Priority: outputs > enhancedOutputs > outputHandler > default console

// Single handler (legacy compatibility)
LogEngine.configure({
  outputHandler: myHandler,
  suppressConsoleOutput: true
});

// Multiple basic outputs - takes priority over outputHandler
LogEngine.configure({
  outputs: ['console', myFileHandler, myNetworkHandler]
});

// Advanced outputs - used when outputs not specified
LogEngine.configure({
  enhancedOutputs: [
    'console',
    { type: 'file', config: { filePath: './app.log' } }
  ]
});
```

### Error Handling & Resilience

**Robust error handling ensures logging never breaks your application:**

```typescript
LogEngine.configure({
  outputs: [
    'console',                    // Always works
    (level, message) => {
      throw new Error('Handler failed');  // This failure won't break other outputs
    },
    (level, message) => {
      fs.writeFileSync('./logs/app.log', message);  // This still works
    }
  ]
});

// If any handler fails, others continue working + fallback to console
LogEngine.error('Critical error');  // Logs to console + working file handler
```

### Output Handler Benefits

✅ **GUI Integration** - Perfect for desktop applications, web dashboards, and real-time monitoring  
✅ **Testing Support** - Capture and assert on log output in automated tests  
✅ **Production Monitoring** - Send logs to Datadog, New Relic, CloudWatch, or custom endpoints  
✅ **File Logging** - Persistent logs with automatic rotation and backup management  
✅ **Silent Operation** - Disable console output for clean CLI tools and background services  
✅ **Multi-Destination** - Log to console + file + network simultaneously with zero overhead  
✅ **Error Isolation** - Failed outputs don't break other outputs or your application  
✅ **Backward Compatible** - Existing code works unchanged, new features are opt-in only  
✅ **TypeScript Ready** - Full type safety with comprehensive interfaces and IntelliSense  
✅ **Zero Dependencies** - Built-in handlers use only Node.js standard library  

**Use Cases:** Desktop applications, testing frameworks, production monitoring, CI/CD pipelines, microservices, IoT devices, and any scenario requiring flexible log routing with enterprise-grade reliability.

## 📚 Comprehensive TypeScript Support

**LogEngine v2.0+ includes extensive TypeScript definitions with 15+ interfaces for maximum type safety and developer experience:**

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
  LogOutputHandler,
  FileOutputConfig,
  HttpOutputConfig,
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

// Type-safe output handler configuration
const outputHandler: LogOutputHandler = (level, message, data) => {
  console.log(`[${level}] ${message}`, data);
};

const fileConfig: FileOutputConfig = {
  filePath: './app.log',
  maxFileSize: 1048576,
  maxBackupFiles: 3,
  formatter: (level, message, data) => `${level}: ${message}\n`
};

// Advanced redaction testing with return types
const isRedacted: boolean = LogEngine.testFieldRedaction('password');
const currentConfig: RedactionConfig = LogEngine.getRedactionConfig();

// Type-safe raw logging
const rawLogger: ILogEngineWithoutRedaction = LogEngine.withoutRedaction();
rawLogger.info('Debug info', sensitiveData); // Fully typed methods

// ⚠️ Legacy (deprecated) - will be removed in v3.0.0
import { LogLevel } from '@wgtechlabs/log-engine';
LogEngine.configure({ level: LogLevel.DEBUG }); // Shows deprecation warning
```

### Available Interfaces

- **`ILogEngine`** - Complete LogEngine API with all methods
- **`ILogEngineWithoutRedaction`** - Raw logging methods interface  
- **`IDataRedactor`** - Static DataRedactor class methods
- **`LogOutputHandler`** - Custom output handler function interface
- **`FileOutputConfig`** - File output handler configuration
- **`HttpOutputConfig`** - HTTP output handler configuration
- **`RedactionConfig`** - Comprehensive redaction configuration
- **`LoggerConfig`** - Logger configuration options (including output handlers)
- **`LogEntry`** - Structured log entry interface
- **`LogLevel`** - ⚠️ **Deprecated**: Legacy level enumeration (use `LogMode` instead)
- **`LogMode`** - ✅ **Recommended**: Modern mode enumeration
- **`EnvironmentConfig`** - Environment variable documentation
- **`EnvironmentConfig`** - Environment variable documentation
- **Plus 5+ additional interfaces** for advanced output handling and configuration

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

**Development Environment:**

- This project is configured for **local development workflows only** - no CI/CD setup required
- Uses **yarn** as the primary package manager for consistency
- Simple, cross-platform development setup with TypeScript, Jest, and ESLint
- Clean test output maintained using `jest.setup.js` to suppress console noise during testing
- All error logging functionality remains intact in production code
- Security scanning available via Snyk for dependency vulnerability checking

**Available Scripts:**

- `yarn test` - Run all tests
- `yarn test:watch` - Run tests in watch mode
- `yarn test:coverage` - Run tests with coverage reporting
- `yarn lint` - Run TypeScript and code quality checks
- `yarn lint:fix` - Automatically fix linting issues
- `yarn lint:security` - Run security-focused linting
- `yarn secure` - Run comprehensive security checks
- `yarn build` - Build the TypeScript project
- `yarn validate` - Run full validation (lint + test + build)

Read the project's [contributing guide](./CONTRIBUTING.md) for detailed development setup, testing guidelines, and contribution requirements.

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

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT). See the [LICENSE](LICENSE) file for the full license text.

## 📝 Author

This project is created by **[Waren Gonzaga](https://github.com/warengonzaga)** under [WG Technology Labs](https://github.com/wgtechlabs), with the help of awesome [contributors](https://github.com/wgtechlabs/log-engine/graphs/contributors).

**Latest Version:** v2.1.0 - Enhanced with advanced output handlers, comprehensive security-first logging, complete TypeScript support, and 95%+ test coverage for local development workflows.

[![contributors](https://contrib.rocks/image?repo=wgtechlabs/log-engine)](https://github.com/wgtechlabs/log-engine/graphs/contributors)

---

💻 with ❤️ by [Waren Gonzaga](https://warengonzaga.com) under [WG Technology Labs](https://wgtechlabs.com), and [Him](https://www.youtube.com/watch?v=HHrxS4diLew&t=44s) 🙏

<!-- GitAds-Verify: ATEXU25ZNQXEHHBSSKYIKDFHVSEEAMEF -->

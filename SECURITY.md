# 🔒 Security Policy

## Security-First Logging

Log Engine is built with security as a core principle. This document outlines our security policies, practices, and how to report vulnerabilities.

## Built-in Security Features

### 🛡️ Automatic Data Redaction

- **PII Protection**: Automatically redacts passwords, API keys, emails, and other sensitive data
- **Custom Patterns**: Support for custom regex patterns to match organization-specific sensitive data
- **Runtime Configuration**: Dynamic field management with environment-based configuration
- **Zero-Config Security**: Secure by default with no configuration required

### 🔍 Security Scanning

The project includes comprehensive security scanning tools:

```bash
# Run security-focused linting
yarn lint:security

# Run dependency vulnerability scanning (requires Snyk account)
yarn secure:test

# Run code security analysis (requires Snyk account)
yarn secure:code

# Run complete security checks
yarn secure
```

### 📋 Security Best Practices

**For Developers:**

- Use `LogEngine.testFieldRedaction('fieldName')` to verify redaction rules
- Leverage `LogEngine.withoutRedaction()` only in development environments
- Review logs regularly to ensure sensitive data isn't being exposed
- Use environment-based configuration to disable redaction only in development

**For Production:**

- Never disable redaction in production environments
- Regularly audit custom redaction patterns
- Monitor log outputs for potential data leaks
- Use secure transport when sending logs to external systems

## Supported Versions

| Version | Supported          | Security Updates |
| ------- | ------------------ | ---------------- |
| 2.1.x   | ✅ Yes             | ✅ Active        |
| 2.0.x   | ✅ Yes             | ✅ Active        |
| < 2.0   | ❌ No              | ❌ None          |

## Reporting Vulnerabilities

If you discover a security vulnerability, please follow responsible disclosure practices:

### 🚨 Critical/High Severity

For critical security issues that could compromise user data or system security:

📧 **Email**: [security@wgtechlabs.com](mailto:security@wgtechlabs.com)

- Response within 24 hours
- Initial assessment within 48 hours
- Security patches prioritized

### 📊 Medium/Low Severity

For general security improvements or non-critical issues:

- Create a private security advisory on GitHub
- Or email [security@wgtechlabs.com](mailto:security@wgtechlabs.com)
- Response within 72 hours

### 🛡️ What to Include

When reporting a vulnerability, please include:

1. **Description** of the vulnerability
2. **Steps to reproduce** the issue
3. **Potential impact** and affected versions
4. **Suggested fix** (if you have one)
5. **Your contact information** for follow-up

### ⚡ What to Expect

- **Acknowledgment** within 24-72 hours
- **Regular updates** on investigation progress
- **Credit** in security advisories (if desired)
- **Coordinated disclosure** timeline discussion

## Security Contact

**Primary Security Contact**: [security@wgtechlabs.com](mailto:security@wgtechlabs.com)
**Backup Contact**: [opensource@wgtechlabs.com](mailto:opensource@wgtechlabs.com)

Your efforts to help maintain the security and integrity of Log Engine are greatly appreciated. Thank you for contributing to a safer open-source community!

---

🔐 with ❤️ by [Waren Gonzaga](https://warengonzaga.com) under [WG Technology Labs](https://wgtechlabs.com) and [Him](https://www.youtube.com/watch?v=HHrxS4diLew&t=44s) 🙏
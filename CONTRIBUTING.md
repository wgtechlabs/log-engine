# 🎯 Contribute to Open Source

Any contributions are welcome, encouraged, and valued. See the following information below for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for me as maintainer and smooth out the experience for all involved. The community looks forward to your contributions. 🎉✌✨

## 📋 Code of Conduct

This project and everyone participating in it is governed by the project's [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to <opensource@wgtechlabs.com>.

## 💖 How to Contribute

There are many ways to contribute to this open source project. Any contributions are welcome and appreciated. Be sure to read the details of each section for you to start contributing.

### 🧬 Development

If you can write code then create a pull request to this repo and I will review your code.

#### Branch Strategy

**Local Development Workflow:**

- **Work directly on any feature branch** for development and bug fixes
- **No CI/CD pipeline** - all validation happens locally
- **Use local testing commands** for quick validation before commits

**Production Workflow:**  

- **Create PR to `main`** for production releases
- **Local validation required** before creating PR
- **All quality checks must pass locally** before requesting review

> **Important**: Please ensure all tests and linting pass locally before submitting pull requests. This project is configured for local-only development workflows.

#### 🔧 Setup

To get started with development:

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/your-username/log-engine.git
   cd log-engine
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Build the project**

   ```bash
   pnpm build
   ```

4. **Run tests to verify setup**

   ```bash
   pnpm test
   ```

> **Note**: This project uses pnpm for dependency management. Please use `pnpm` for all development tasks to ensure consistency with our package manager configuration.

Please refer to the [README](./README.md) for more detailed setup instructions.

### 🧪 Testing

This section provides comprehensive information about testing the log-engine project and our two-tier testing strategy optimized for different development workflows.

#### Local Development Testing Strategy

We use a **simplified local testing** approach optimized for developer productivity:

🚀 **Local Development Testing**

- **Fast feedback** in ~3-5 seconds with `pnpm test`
- **Quick validation** without coverage generation using `pnpm test -- --silent`
- **Optimized for iteration** speed and developer productivity

🛡️ **Comprehensive Local Testing**

- **Full coverage** reporting with `pnpm test:coverage`
- **Security validation** with `pnpm secure` (requires Snyk account)
- **Complete validation** with `pnpm validate` before creating PRs

#### Quick Start

```bash
# Install dependencies
pnpm install

# 🚀 Fast local testing (recommended for development)
pnpm test

# 🛡️ Full testing with coverage (before creating PRs)
pnpm test:coverage

# 📊 Coverage only
pnpm test:coverage

# 👀 Watch mode for development
pnpm test:watch

# 🐛 Debug test issues
pnpm test:debug
```

#### Test Commands Reference

| Command | Speed | Coverage | Use Case |
|---------|-------|----------|----------|
| `test` | ⚡⚡⚡⚡⚡ | ❌ | Quick validation, daily development |
| `test:coverage` | ⚡⚡⚡ | ✅ | Pre-PR testing, quality assurance |
| `test:debug` | ⚡⚡ | ❌ | Troubleshooting hanging tests |
| `test:watch` | ⚡⚡⚡⚡ | ❌ | Live development, TDD workflow |

#### Development Workflow

**For Feature Development:**

1. Work on feature branch from `main`
2. Use `pnpm test` for quick validation during development
3. Use `pnpm lint` to check code quality
4. Commit changes with descriptive messages
5. Iterate quickly with fast local feedback

**For Production Release:**

1. Run full validation: `pnpm validate` (lint + test + build)
2. Ensure coverage requirements are met with `pnpm test:coverage`
3. Run security checks: `pnpm secure` (if Snyk is configured)
4. Create PR to `main` for review

#### Test Architecture

- **Location**: Tests are in `src/__tests__/` organized by component
- **Utilities**: Async test utilities in `async-test-utils.ts` for reliable file/HTTP testing
- **Isolation**: Each test uses unique directories to prevent conflicts
- **Cleanup**: Automated cleanup with timeout protection
- **CI Optimization**: Different configs for local vs CI environments

#### Test Output Suppression

The project uses a clean testing approach that suppresses noisy console output:

- **Global Setup**: `jest.setup.js` automatically mocks `console.error` during tests to prevent confusing output
- **Production Code**: Error logging works normally in production - suppression only applies to test environments
- **Test Isolation**: Each test maintains proper error logging behavior while keeping console output clean
- **CI/CD**: Clean test output in continuous integration environments without affecting production logging

This approach ensures that test logs remain readable while preserving all error logging functionality in production code.

#### Contributing Tests

**Local Development:**

1. Write your tests alongside feature development
2. Run `pnpm test` for quick validation (~3-5 seconds)
3. Ensure tests follow established patterns and are isolated
4. Use `pnpm test:watch` for live development feedback

**Pre-Pull Request:**

1. Run full test suite: `pnpm test:coverage`
2. Verify coverage requirements are met (should be 80%+)
3. Test across different scenarios and edge cases
4. Run linting: `pnpm lint`
5. Run full validation: `pnpm validate`

**Pull Request Checklist:**

- [ ] All tests pass with `pnpm test`
- [ ] Coverage requirements met with `pnpm test:coverage`  
- [ ] New functionality has corresponding tests
- [ ] Edge cases and error scenarios are covered
- [ ] Test names are descriptive and follow conventions
- [ ] No test pollution (tests are properly isolated)
- [ ] Tests complete quickly (no arbitrary timeouts)
- [ ] Code quality checks pass with `pnpm lint`

#### Test Best Practices

**✅ Do:**

- Use `async/await` for asynchronous operations
- Utilize `waitForFile()`, `waitForFileContent()` from `async-test-utils.ts`
- Create unique test directories to prevent conflicts
- Write descriptive test names
- Test both success and failure scenarios

**❌ Don't:**

- Use arbitrary `setTimeout()` calls
- Use `done` callbacks (prefer async/await)
- Create tests that depend on other tests
- Use fixed file paths that might conflict
- Write tests that take longer than necessary

#### Troubleshooting Tests

**If tests are hanging:**

```bash
pnpm test:ci:debug  # Shows open handles and verbose output
```

**If tests are flaky:**

- Check for shared resources (files, directories)
- Ensure proper cleanup in `afterEach`/`afterAll`
- Use unique identifiers for test artifacts

Thank you for contributing to the log-engine test suite! 🧪

### 📖 Documentation

Improvements to documentation are always welcome! This includes:

- README updates
- Code comments
- Examples and usage guides
- Fixing typos or clarifying existing documentation

### 🐞 Reporting Bugs

For any security bugs or issues, please read the [security policy](./SECURITY.md).
For other bugs, please create an issue using the bug report template.

## Local Development Philosophy

This project is intentionally configured for **local-only development workflows** to keep the setup simple and accessible:

### 🎯 Benefits of Local-Only Development

- **🚀 Faster iteration**: No waiting for CI/CD pipelines
- **🛠️ Simpler setup**: No complex CI configurations to maintain
- **💰 Cost-effective**: No CI/CD resource costs
- **🔧 Developer control**: Full control over testing and validation
- **📦 Lightweight**: Focus on code quality, not infrastructure

### 🏗️ Quality Assurance

Quality is maintained through:

- **Comprehensive local testing** with 95%+ coverage
- **Security scanning** via Snyk integration
- **TypeScript strict mode** for type safety
- **ESLint with security rules** for code quality
- **Pre-commit validation** via `pnpm validate`
- **Manual review process** for all contributions

---

💻 with ❤️ by [Waren Gonzaga](https://warengonzaga.com), [WG Technology Labs](https://wgtechlabs.com), and [Him](https://www.youtube.com/watch?v=HHrxS4diLew&t=44s) 🙏

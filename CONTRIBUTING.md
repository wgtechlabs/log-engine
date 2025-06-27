# 🎯 Contribute to Open Source

Any contributions are welcome, encouraged, and valued. See the following information below for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for me as maintainer and smooth out the experience for all involved. The community looks forward to your contributions. 🎉✌✨

## 📋 Code of Conduct

This project and everyone participating in it is governed by the project's [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to <opensource@wgtechlabs.com>.

## 💖 How to Contribute

There are many ways to contribute to this open source project. Any contributions are welcome and appreciated. Be sure to read the details of each section for you to start contributing.

### 🧬 Development

If you can write code then create a pull request to this repo and I will review your code. 

#### Branch Strategy

**Development Workflow:**
- **Work on `dev` branch** for feature development and bug fixes
- **Fast CI feedback** (~3-5 minutes) for quick iteration
- **Use `yarn test:ci:fast`** for local validation

**Production Workflow:**  
- **Create PR from `dev` to `main`** for production releases
- **Comprehensive CI validation** (~8-10 minutes) with full coverage
- **All Node.js versions tested** before merge

> **Important**: Please submit pull requests to the `dev` branch. Pull requests to the `main` branch will be automatically rejected unless they are hotfixes or critical security updates.

#### 🔧 Setup

To get started with development:

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/your-username/log-engine.git
   cd log-engine
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Build the project**

   ```bash
   yarn build
   ```

4. **Run tests to verify setup**

   ```bash
   yarn test
   ```

> **Note**: This project uses Yarn for dependency management. Please use `yarn` for all development tasks to ensure consistency with our package manager configuration.

Please refer to the [README](./README.md) for more detailed setup instructions.

### 🧪 Testing

This section provides comprehensive information about testing the log-engine project and our two-tier testing strategy optimized for different development workflows.

#### Two-Tier Testing Strategy

We use a **fast feedback** approach for development and **comprehensive validation** for production readiness:

**🚀 Development Testing (dev branch)**
- **Fast feedback** in ~3-5 seconds
- **Quick validation** without coverage generation
- **Optimized for iteration** speed and developer productivity

**🛡️ Production Testing (main branch)**  
- **Full coverage** reporting and analysis
- **Cross-platform validation** (Node.js 16.x, 18.x, 20.x)
- **Comprehensive checks** before production deployment

#### Quick Start

```bash
# Install dependencies
yarn install

# 🚀 Fast development testing (recommended for local dev)
yarn test:ci:fast

# 🛡️ Full testing with coverage (before PR to main)
yarn test:ci

# 📊 Coverage only
yarn test:coverage

# 👀 Watch mode for development
yarn test:watch

# 🐛 Debug test issues
yarn test:ci:debug
```

#### Test Commands Reference

| Command | Speed | Coverage | Use Case |
|---------|-------|----------|----------|
| `test:ci:fast` | ⚡⚡⚡⚡⚡ | ❌ | Quick validation, dev iteration |
| `test:ci` | ⚡⚡⚡ | ✅ | Pre-PR testing, CI/CD |
| `test:ci:debug` | ⚡⚡ | ✅ | Troubleshooting hanging tests |
| `test:ci:safe` | ⚡⚡⚡ | ✅ | Unreliable environments |

#### Development Workflow

**For Feature Development:**
1. Work on `dev` branch
2. Use `yarn test:ci:fast` for quick validation  
3. Push to `dev` → triggers fast CI tests (3-5 min)
4. Iterate quickly with fast feedback

**For Production Release:**
1. Create PR from `dev` to `main`
2. Use `yarn test:ci` for full validation
3. PR triggers comprehensive tests (8-10 min)
4. Full coverage and cross-platform validation

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

**Development Phase (dev branch):**

1. Write your tests alongside feature development
2. Run `yarn test:ci:fast` for quick validation (~3-5 seconds)
3. Ensure tests follow established patterns and are isolated
4. Push to `dev` branch for fast CI validation

**Pre-Production Phase (before main merge):**

1. Run full test suite: `yarn test:ci`
2. Verify coverage requirements are met
3. Test across different scenarios and edge cases
4. Ensure no test pollution or hanging issues

**Pull Request Checklist:**

- [ ] All tests pass with `yarn test:ci:fast`
- [ ] Full test suite passes with `yarn test:ci`  
- [ ] New functionality has corresponding tests
- [ ] Edge cases and error scenarios are covered
- [ ] Test names are descriptive and follow conventions
- [ ] Coverage requirements are met (80%+ for CI)
- [ ] No test pollution (tests are properly isolated)
- [ ] Tests complete quickly (no arbitrary timeouts)

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
yarn test:ci:debug  # Shows open handles and verbose output
```

**If tests are flaky:**
- Check for shared resources (files, directories)
- Ensure proper cleanup in `afterEach`/`afterAll`
- Use unique identifiers for test artifacts

**If coverage is low:**
```bash
yarn test:coverage  # Generate detailed coverage report
yarn coverage:open   # Open coverage report in browser
```

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

---

💻 with ❤️ by [Waren Gonzaga](https://warengonzaga.com), [WG Technology Labs](https://wgtechlabs.com), and [Him](https://www.youtube.com/watch?v=HHrxS4diLew&t=44s) 🙏

#### CI/CD Testing Strategy

Our GitHub Actions workflow implements a **two-tier testing strategy** to optimize for both speed and thoroughness:

##### Dev Branch (Fast Feedback) 
- **Trigger**: Push to `dev` branch or PR to `dev`
- **Runtime**: ~3-5 minutes total
- **Node Versions**: 18.x, 20.x (reduced matrix)
- **Command**: `yarn test:ci:fast`
- **Features**: No coverage, fail-fast, optimized for speed
- **Purpose**: Quick validation for development iteration

##### Main Branch (Comprehensive)
- **Trigger**: Push to `main` branch or PR to `main`  
- **Runtime**: ~8-10 minutes total
- **Node Versions**: 16.x, 18.x, 20.x (full matrix)
- **Command**: `yarn test:ci`
- **Features**: Full coverage, Codecov reporting, comprehensive validation
- **Purpose**: Production-ready validation

##### Branch Protection Rules

**Dev Branch Requirements:**
- `test-dev` job must pass
- Quick feedback for iterative development
- Allows for faster iteration cycles

**Main Branch Requirements:**
- `test-main` job must pass
- Coverage thresholds must be met
- All Node.js versions must pass
- Codecov integration for coverage tracking

This strategy ensures:
- 🚀 **Fast development** cycles with immediate feedback
- 🛡️ **Thorough validation** before production deployment  
- 💰 **Cost efficiency** through optimized CI resource usage
- 🔍 **Quality assurance** with comprehensive testing on critical branches

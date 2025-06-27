# 🎯 Contribute to Open Source

Any contributions are welcome, encouraged, and valued. See the following information below for different ways to help and details about how this project handles them. Please make sure to read the relevant section before making your contribution. It will make it a lot easier for me as maintainer and smooth out the experience for all involved. The community looks forward to your contributions. 🎉✌✨

## 📋 Code of Conduct

This project and everyone participating in it is governed by the project's [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to <opensource@wgtechlabs.com>.

## 💖 How to Contribute

There are many ways to contribute to this open source project. Any contributions are welcome and appreciated. Be sure to read the details of each section for you to start contributing.

### 🧬 Development

If you can write code then create a pull request to this repo and I will review your code. Please consider submitting your pull request to the `dev` branch. I will auto reject if you submit your pull request to the `main` branch.

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

> **Note**: This project uses yarn as the primary package manager. Please use yarn for all development tasks to ensure consistency across the development environment and CI/CD pipeline.

Please refer to the [README](./README.md) for more detailed setup instructions.

### 🧪 Testing

This section provides comprehensive information about testing the log-engine project and how to contribute tests.

#### Quick Start

```bash
# Install dependencies
yarn install

# Run all tests
yarn test

# Run tests with coverage
yarn test:coverage

# Run tests in watch mode (for development)
yarn test:watch
```

#### Test Architecture

- Tests are located in `src/__tests__/` and organized by component.
- Utilities for mocking and setup are in `test-utils.ts`.
- Each test file focuses on a single responsibility for maintainability and parallel execution.
- Global test setup is configured in `jest.setup.js` (loaded via `jest.config.js`) to suppress error console output during tests while preserving test functionality.

#### Test Output Suppression

The project uses a clean testing approach that suppresses noisy console output:

- **Global Setup**: `jest.setup.js` automatically mocks `console.error` during tests to prevent confusing output
- **Production Code**: Error logging works normally in production - suppression only applies to test environments
- **Test Isolation**: Each test maintains proper error logging behavior while keeping console output clean
- **CI/CD**: Clean test output in continuous integration environments without affecting production logging

This approach ensures that test logs remain readable while preserving all error logging functionality in production code.

#### Writing and Running Tests

- Use the provided test file template and follow the Arrange-Act-Assert pattern.
- Use descriptive test names (e.g., `should log debug messages when level is DEBUG`).
- Mock console output using utilities from `test-utils.ts`.
- Ensure each test is isolated using `beforeEach`/`afterEach`.
- Check coverage with `yarn test:coverage` (targets: Statements ≥90%, Branches ≥85%, Functions ≥90%, Lines ≥90%).

#### Common Testing Patterns

- Test both positive and negative cases.
- Verify console method call counts and message content.
- Test configuration changes and environment variable effects.
- See the codebase and below for more examples.

#### Continuous Integration

- Tests must pass before merging pull requests.
- Coverage is checked in CI/CD workflows.
- Use pre-commit hooks to ensure tests pass locally.

#### Troubleshooting

- If modules are not found, ensure TypeScript is compiled (`yarn build`).
- If console mocks do not work, set them up before using LogEngine in tests.
- Always restore environment variables after environment-based tests.

#### Contributing Tests

Before submitting:

1. Run the full test suite: `yarn test`
2. Check coverage: `yarn test:coverage`
3. Ensure new features have corresponding tests
4. Follow the established testing patterns
5. Update documentation if needed

Pull Request Checklist:

- [ ] All tests pass locally
- [ ] New functionality is tested
- [ ] Edge cases are covered
- [ ] Test names are descriptive
- [ ] Coverage requirements are met
- [ ] No test pollution (tests affect each other)

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

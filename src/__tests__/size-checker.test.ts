/**
 * Tests for the bundle size checker script
 * Verifies that the size checker correctly validates bundle sizes
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

describe('Bundle Size Checker Script', () => {
  const projectRoot = join(__dirname, '..', '..');
  const scriptPath = join(projectRoot, 'scripts', 'check-size.js');
  const distPath = join(projectRoot, 'dist');

  beforeAll(() => {
    // Ensure dist directory exists before running tests
    if (!existsSync(distPath)) {
      try {
        execSync('pnpm build', {
          cwd: projectRoot,
          stdio: 'ignore',
          timeout: 60000
        });
      } catch (error) {
        console.warn('Could not build project for size check tests');
      }
    }
  });

  describe('Script existence and execution', () => {
    it('should have check-size.js script in scripts directory', () => {
      expect(existsSync(scriptPath)).toBe(true);
    });

    it('should be executable', () => {
      // Check if script can be executed
      expect(() => {
        execSync(`node ${scriptPath}`, {
          cwd: projectRoot,
          encoding: 'utf-8',
          timeout: 10000
        });
      }).not.toThrow();
    });

    it('should output size report when run', () => {
      const output = execSync(`node ${scriptPath}`, {
        cwd: projectRoot,
        encoding: 'utf-8',
        timeout: 10000
      });

      // Check for expected output elements
      expect(output).toContain('Log Engine Bundle Size Checker');
      expect(output).toContain('Bundle Size Report');
      expect(output).toContain('Total (dist)');
      expect(output).toContain('ESM Build');
      expect(output).toContain('CJS Build');
    });

    it('should exit with code 0 when all checks pass', () => {
      // execSync will throw if the command exits with non-zero status
      // If it doesn't throw, the test passes
      expect(() => {
        execSync(`node ${scriptPath}`, {
          cwd: projectRoot,
          stdio: 'ignore',
          timeout: 10000
        });
      }).not.toThrow();
    });

    it('should report all checks pass for current bundle size', () => {
      const output = execSync(`node ${scriptPath}`, {
        cwd: projectRoot,
        encoding: 'utf-8',
        timeout: 10000
      });

      expect(output).toContain('All size checks passed');
    });
  });

  describe('Size limits validation', () => {
    it('should validate total dist size is under 1MB', () => {
      const output = execSync(`node ${scriptPath}`, {
        cwd: projectRoot,
        encoding: 'utf-8',
        timeout: 10000
      });

      // Should contain PASS for Total (dist)
      expect(output).toMatch(/Total \(dist\).*\[PASS\]/);
    });

    it('should validate ESM build size is under 512KB', () => {
      const output = execSync(`node ${scriptPath}`, {
        cwd: projectRoot,
        encoding: 'utf-8',
        timeout: 10000
      });

      // Should contain PASS for ESM Build
      expect(output).toMatch(/ESM Build.*\[PASS\]/);
    });

    it('should validate CJS build size is under 512KB', () => {
      const output = execSync(`node ${scriptPath}`, {
        cwd: projectRoot,
        encoding: 'utf-8',
        timeout: 10000
      });

      // Should contain PASS for CJS Build
      expect(output).toMatch(/CJS Build.*\[PASS\]/);
    });
  });

  describe('Package.json script integration', () => {
    it('should be accessible via pnpm run size:check', () => {
      expect(() => {
        execSync('pnpm run size:check', {
          cwd: projectRoot,
          stdio: 'ignore',
          timeout: 15000
        });
      }).not.toThrow();
    });

    it('should be part of the validate script', () => {
      const packageJson = require(join(projectRoot, 'package.json'));

      // Check if size:check script exists
      expect(packageJson.scripts['size:check']).toBeDefined();
      expect(packageJson.scripts['size:check']).toContain('check-size.js');

      // Check if validate script includes size:check
      expect(packageJson.scripts.validate).toContain('size:check');
    });
  });
});

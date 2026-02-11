#!/usr/bin/env node

/**
 * @wgtechlabs/log-engine - Bundle Size Checker
 * 
 * This script validates that the built package remains lightweight by checking
 * the total size of the dist directory and individual build formats.
 * 
 * ## Purpose
 * As a lightweight logging library with zero dependencies, it's critical to
 * maintain a small bundle size. This checker ensures the package doesn't
 * exceed reasonable size limits for a lightweight library.
 * 
 * ## Size Limits
 * - Total dist size: 1MB (1024KB)
 * - ESM build: 512KB
 * - CJS build: 512KB
 * 
 * ## Usage
 * ```bash
 * node scripts/check-size.js
 * pnpm run size:check
 * ```
 * 
 * ## Exit Codes
 * - 0: All size checks passed
 * - 1: Size limit exceeded or dist directory not found
 * 
 * @author WG Tech Labs
 * @license MIT
 */

import { stat, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Size limits in KB
const SIZE_LIMITS = {
  total: 1024,     // 1MB total dist size
  esm: 512,        // 512KB for ESM build
  cjs: 512,        // 512KB for CJS build
};

/**
 * Calculate the total size of a directory recursively
 * 
 * @param {string} dirPath - Path to directory
 * @returns {Promise<number>} Total size in bytes
 */
async function getDirectorySize(dirPath) {
  let totalSize = 0;

  try {
    const entries = await readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);

      if (entry.isDirectory()) {
        totalSize += await getDirectorySize(fullPath);
      } else if (entry.isFile()) {
        const stats = await stat(fullPath);
        totalSize += stats.size;
      }
    }
  } catch (error) {
    // Directory might not exist, return 0
    return 0;
  }

  return totalSize;
}

/**
 * Format bytes to human-readable string
 * 
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  
  const kb = bytes / 1024;
  if (kb < 1) return `${bytes} B`;
  
  const mb = kb / 1024;
  if (mb < 1) return `${kb.toFixed(2)} KB`;
  
  return `${mb.toFixed(2)} MB`;
}

/**
 * Check if size is within limit
 * 
 * @param {number} sizeBytes - Actual size in bytes
 * @param {number} limitKB - Limit in KB
 * @param {string} label - Label for the check
 * @returns {boolean} True if within limit
 */
function checkSize(sizeBytes, limitKB, label) {
  const limitBytes = limitKB * 1024;
  const percentage = (sizeBytes / limitBytes) * 100;
  
  const passed = sizeBytes <= limitBytes;
  const icon = passed ? '✅' : '❌';
  const status = passed ? 'PASS' : 'FAIL';
  
  console.log(`${icon} ${label.padEnd(20)} ${formatBytes(sizeBytes).padEnd(12)} / ${formatBytes(limitBytes).padEnd(12)} (${percentage.toFixed(1)}%) [${status}]`);
  
  return passed;
}

/**
 * Main size checker function
 */
async function main() {
  console.log('\n🔍 Log Engine Bundle Size Checker\n');
  console.log('═'.repeat(80));
  console.log();

  const projectRoot = join(__dirname, '..');
  const distPath = join(projectRoot, 'dist');

  // Check if dist directory exists
  if (!existsSync(distPath)) {
    console.error('❌ Error: dist directory not found. Please run "pnpm build" first.\n');
    process.exit(1);
  }

  const esmPath = join(distPath, 'esm');
  const cjsPath = join(distPath, 'cjs');

  // Get directory sizes
  const totalSize = await getDirectorySize(distPath);
  const esmSize = await getDirectorySize(esmPath);
  const cjsSize = await getDirectorySize(cjsPath);

  console.log('📊 Bundle Size Report:\n');

  // Check sizes against limits
  const results = [];
  results.push(checkSize(totalSize, SIZE_LIMITS.total, 'Total (dist)'));
  results.push(checkSize(esmSize, SIZE_LIMITS.esm, 'ESM Build'));
  results.push(checkSize(cjsSize, SIZE_LIMITS.cjs, 'CJS Build'));

  console.log();
  console.log('═'.repeat(80));

  // Determine overall result
  const allPassed = results.every(result => result === true);

  if (allPassed) {
    console.log('\n✅ All size checks passed! Package remains lightweight.\n');
    process.exit(0);
  } else {
    console.log('\n❌ Size limit exceeded! Please review and optimize the bundle size.\n');
    console.log('💡 Tips to reduce bundle size:');
    console.log('   - Remove unused code and dependencies');
    console.log('   - Check for duplicate code that can be refactored');
    console.log('   - Review imports and ensure tree-shaking works properly');
    console.log('   - Consider code splitting for large features\n');
    process.exit(1);
  }
}

// Run the checker
main().catch((error) => {
  console.error('\n❌ Unexpected error:', error.message);
  console.error(error.stack);
  process.exit(1);
});

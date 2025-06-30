#!/usr/bin/env node

/**
 * @wgtechlabs/forklift - Entry Point Runner
 * 
 * This is the main CLI entry point for the Forklift dual build system.
 * It provides a lightweight interface that loads and executes the main 
 * forklift.js module with the appropriate configuration.
 * 
 * When forklift is extracted as a standalone npm package, this file will
 * become the `bin` entry point, allowing users to run `npx forklift` or
 * install it globally and run `forklift` from anywhere.
 * 
 * @author Waren Gonzaga, WG Technology Labs
 * @version 1.0.0
 * @license MIT
 */

// Import and run the forklift module
import('./forklift.js').then(async (forklift) => {
  // Merge default configuration with runtime overrides
  const config = {
    ...forklift.defaultConfig,
    clean: process.argv.includes('--clean'),
    watch: process.argv.includes('--watch'),
    verbose: process.argv.includes('--verbose') || process.argv.includes('-v'),
    dryRun: process.argv.includes('--dry-run') || process.argv.includes('-n'),
  };

  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log(`
🚀 @wgtechlabs/forklift - Dual Build System

Usage: node scripts/forklift-runner.js [options]

Options:
  --clean              Clean output directory before build
  --watch              Watch mode (rebuild on file changes)
  --verbose, -v        Enable verbose logging
  --dry-run, -n        Show what would be done without building
  --help, -h           Show this help message
  `);
    process.exit(0);
  }

  try {
    forklift.validateConfig(config);
    
    if (config.watch) {
      await forklift.watchMode(config);
    } else {
      const success = await forklift.build(config);
      process.exit(success ? 0 : 1);
    }
  } catch (error) {
    console.error('❌ Forklift error:', error.message);
    process.exit(1);
  }
}).catch(error => {
  console.error('❌ Failed to load forklift:', error);
  process.exit(1);
});

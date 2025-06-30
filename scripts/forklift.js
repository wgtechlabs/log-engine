#!/usr/bin/env node

/**
 * @wgtechlabs/forklift - Complete Dual Build System
 * 
 * A comprehensive TypeScript dual build tool that "lifts" your code between 
 * ESM and CommonJS formats effortlessly. Just like a forklift moves heavy loads 
 * with precision and ease, this tool handles the complex task of dual module 
 * builds without breaking a sweat.
 * 
 * ## Features
 * - ✅ Pure TypeScript compilation (no bundling overhead)
 * - ✅ Automatic ESM import extension fixing (.js)
 * - ✅ CJS package marker generation
 * - ✅ Comprehensive error handling and reporting
 * - ✅ Configurable build options
 * - ✅ Watch mode support
 * - ✅ Zero configuration for most projects
 * - ✅ Intelligent directory/file detection for imports
 * - ✅ Performance optimized with detailed metrics
 * 
 * ## Usage
 * ```bash
 * node scripts/forklift.js [options]
 * ```
 * 
 * ## Options
 * - `--entry <file>`       Entry point (default: src/index.ts)
 * - `--out-dir <path>`     Output directory (default: dist)
 * - `--formats <list>`     Build formats: esm,cjs (default: esm,cjs)
 * - `--clean`              Clean output directory before build
 * - `--watch`              Watch mode (rebuild on file changes)
 * - `--verbose, -v`        Enable verbose logging
 * - `--dry-run, -n`        Show what would be done without building
 * - `--help, -h`           Show this help message
 * 
 * ## Examples
 * ```bash
 * # Basic build with cleanup
 * node scripts/forklift.js --clean --verbose
 * 
 * # ESM only build
 * node scripts/forklift.js --formats esm
 * 
 * # Watch mode for development
 * node scripts/forklift.js --watch
 * 
 * # Dry run to see what would happen
 * node scripts/forklift.js --dry-run
 * ```
 * 
 * ## Architecture
 * The build process follows these steps:
 * 1. **Validation**: Validates configuration and entry points
 * 2. **Cleanup**: Optionally cleans output directory
 * 3. **TypeScript Compilation**: Compiles for each target format
 * 4. **ESM Import Fixing**: Adds .js extensions to relative imports
 * 5. **Package Markers**: Creates CJS package.json markers
 * 6. **Reporting**: Provides detailed build statistics
 * 
 * ## Import Fixing Logic
 * The ESM import fixer intelligently determines whether to add:
 * - `.js` for direct file imports (./utils → ./utils.js)
 * - `/index.js` for directory imports (./logger → ./logger/index.js)
 * 
 * This is done by checking the file system at build time to determine
 * the correct import path structure.
 * 
 * @author Waren Gonzaga, WG Technology Labs
 * @version 1.0.0
 * @license MIT
 * @since 2025-06-30
 */

import { spawn } from 'child_process';
import { rm, mkdir, stat, watch, readdir, readFile, writeFile } from 'fs/promises';
import { join, dirname, relative, resolve, extname, basename, normalize, isAbsolute } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Security helper functions to prevent path traversal and command injection
 */

/**
 * Validate and sanitize file paths to prevent path traversal attacks
 * 
 * @param {string} filePath - The file path to validate
 * @param {string} [basePath] - Optional base path to restrict access to
 * @returns {string} Sanitized path
 * @throws {Error} If path is invalid or contains traversal attempts
 */
function validatePath(filePath, basePath = process.cwd()) {
  if (!filePath || typeof filePath !== 'string') {
    throw new Error('Invalid file path provided');
  }

  // Normalize the path to resolve any '..' or '.' segments
  const normalizedPath = normalize(filePath);
  
  // If it's a relative path, resolve it against the base path
  const resolvedPath = isAbsolute(normalizedPath) 
    ? normalizedPath 
    : resolve(basePath, normalizedPath);
  
  // Ensure the resolved path is within the allowed base path
  const normalizedBasePath = normalize(resolve(basePath));
  if (!resolvedPath.startsWith(normalizedBasePath)) {
    throw new Error(`Path traversal attempt detected: ${filePath}`);
  }
  
  return resolvedPath;
}

/**
 * Validate command and arguments to prevent command injection
 * 
 * @param {string} command - The command to validate
 * @param {string[]} args - Command arguments to validate
 * @returns {boolean} True if command is safe
 * @throws {Error} If command or arguments contain dangerous patterns
 */
function validateCommand(command, args = []) {
  // Allow only specific known commands
  const allowedCommands = ['npx', 'tsc', 'node', 'cmd'];
  const baseCommand = basename(command);
  
  if (!allowedCommands.includes(baseCommand)) {
    throw new Error(`Command not allowed: ${command}`);
  }
  
  // Special handling for Windows cmd with npx
  if (baseCommand === 'cmd' && process.platform === 'win32') {
    if (args.length >= 3 && args[0] === '/c' && args[1] === 'npx') {
      // Allow cmd /c npx ... pattern
      return validateCommand('npx', args.slice(2));
    }
  }
  
  // Check for dangerous patterns in arguments
  const dangerousPatterns = [
    /[;&|`$(){}[\]]/,  // Shell metacharacters
    /\.\./,            // Path traversal
  ];
  
  const safeFlags = ['-p', '--project', '--version', '--help', 'tsc', '/c'];
  const safeFileExtensions = ['.json', '.ts', '.js'];
  
  for (const arg of args) {
    if (typeof arg !== 'string') {
      throw new Error('All arguments must be strings');
    }
    
    // Allow safe flags
    if (safeFlags.some(flag => arg === flag || arg.startsWith(flag))) {
      continue;
    }
    
    // Allow files with safe extensions
    if (safeFileExtensions.some(ext => arg.endsWith(ext))) {
      // Validate file path
      try {
        validatePath(arg);
        continue;
      } catch (error) {
        throw new Error(`Invalid file path in argument: ${arg}`);
      }
    }
    
    // Check for dangerous patterns
    for (const pattern of dangerousPatterns) {
      if (pattern.test(arg)) {
        throw new Error(`Dangerous pattern detected in argument: ${arg}`);
      }
    }
  }
  
  return true;
}

/**
 * Parse command line arguments into a configuration object
 * 
 * @returns {Object} Configuration object with parsed arguments
 * @property {string} entry - Entry point file path
 * @property {string} outDir - Output directory path  
 * @property {string[]} formats - Array of build formats ('esm', 'cjs')
 * @property {boolean} clean - Whether to clean output directory
 * @property {boolean} watch - Whether to enable watch mode
 * @property {boolean} verbose - Whether to enable verbose logging
 * @property {boolean} dryRun - Whether to run in dry-run mode
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    entry: 'src/index.ts',
    outDir: 'dist',
    formats: ['esm', 'cjs'],
    clean: false,
    watch: false,
    verbose: false,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--entry':
        if (i + 1 >= args.length) {
          console.error('❌ --entry requires a value');
          process.exit(1);
        }
        config.entry = args[++i];
        break;
      case '--out-dir':
        if (i + 1 >= args.length) {
          console.error('❌ --out-dir requires a value');
          process.exit(1);
        }
        config.outDir = args[++i];
        break;
      case '--formats':
        if (i + 1 >= args.length) {
          console.error('❌ --formats requires a value');
          process.exit(1);
        }
        config.formats = args[++i].split(',').map(f => f.trim());
        break;
      case '--clean':
        config.clean = true;
        break;
      case '--watch':
        config.watch = true;
        break;
      case '--verbose':
      case '-v':
        config.verbose = true;
        break;
      case '--dry-run':
      case '-n':
        config.dryRun = true;
        break;
      case '--help':
      case '-h':
        console.log(`
🚀 @wgtechlabs/forklift - Dual Build System

Usage: node scripts/forklift.js [options]

Options:
  --entry <file>       Entry point (default: src/index.ts)
  --out-dir <path>     Output directory (default: dist)
  --formats <list>     Build formats: esm,cjs (default: esm,cjs)
  --clean              Clean output directory before build
  --watch              Watch mode (rebuild on file changes)
  --verbose, -v        Enable verbose logging
  --dry-run, -n        Show what would be done without building
  --help, -h           Show this help message

Examples:
  node scripts/forklift.js --clean --verbose
  node scripts/forklift.js --formats esm
  node scripts/forklift.js --watch
        `);
        process.exit(0);
        break;
      default:
        if (arg.startsWith('-')) {
          console.error(`❌ Unknown option: ${arg}`);
          process.exit(1);
        }
        break;
    }
  }

  return config;
}

/**
 * Build statistics tracking and reporting class
 * 
 * Tracks build performance, success/failure states, and post-processing
 * operations to provide comprehensive build reports.
 */
class BuildStats {
  /**
   * Initialize build statistics tracking
   */
  constructor() {
    this.builds = {};
    this.errors = [];
    this.fixes = {};
    this.startTime = Date.now();
  }

  /**
   * Add build result for a specific format
   * 
   * @param {string} format - Build format ('esm' or 'cjs')
   * @param {boolean} success - Whether the build succeeded
   * @param {number} duration - Build duration in milliseconds
   * @param {string} outputPath - Relative path to output directory
   */
  addBuild(format, success, duration, outputPath) {
    this.builds[format] = { success, duration, outputPath };
  }

  /**
   * Add an error that occurred during the build process
   * 
   * @param {string} operation - The operation that failed
   * @param {Error} error - The error object
   */
  addError(operation, error) {
    this.errors.push({ operation, error: error.message });
  }

  /**
   * Add post-processing operation result
   * 
   * @param {string} operation - Description of the operation performed
   * @param {number} count - Number of items processed
   */
  addFix(operation, count) {
    this.fixes[operation] = count;
  }

  /**
   * Mark the end of the build process and calculate total duration
   */
  finish() {
    this.endTime = Date.now();
    this.totalDuration = this.endTime - this.startTime;
  }

  /**
   * Generate and display a comprehensive build report
   * Shows build results, post-processing operations, timing, and errors
   */
  report() {
    console.log(`\n📊 Forklift Build Results:`);
    
    Object.entries(this.builds).forEach(([format, result]) => {
      const status = result.success ? '✅' : '❌';
      console.log(`   ${status} ${format.toUpperCase()}: ${result.duration}ms → ${result.outputPath}`);
    });

    if (Object.keys(this.fixes).length > 0) {
      console.log(`\n🔧 Post-processing:`);
      Object.entries(this.fixes).forEach(([operation, count]) => {
        console.log(`   ✅ ${operation}: ${count} files processed`);
      });
    }

    console.log(`   ⏱️  Total time: ${this.totalDuration}ms`);
    
    if (this.errors.length > 0) {
      console.log(`\n❌ Errors encountered:`);
      this.errors.forEach(({ operation, error }) => {
        console.log(`   ${operation}: ${error}`);
      });
    }
  }

  /**
   * Check if any errors occurred during the build process
   * 
   * @returns {boolean} True if there were errors, false otherwise
   */
  get hasErrors() {
    return this.errors.length > 0 || Object.values(this.builds).some(b => !b.success);
  }
}

/**
 * Execute a shell command and return a promise with the result
 * 
 * @param {string} command - The command to execute
 * @param {string[]} args - Command arguments
 * @param {Object} options - Execution options
 * @param {boolean} [options.verbose=false] - Whether to show command output
 * @returns {Promise<{stdout: string, stderr: string}>} Command result
 */
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    try {
      // Validate command and arguments for security
      validateCommand(command, args);
      
      // On Windows, npx needs to be executed through cmd for proper resolution
      let actualCommand = command;
      let actualArgs = args;
      
      if (process.platform === 'win32' && command === 'npx') {
        actualCommand = 'cmd';
        actualArgs = ['/c', 'npx', ...args];
      }
      
      const child = spawn(actualCommand, actualArgs, {
        stdio: options.verbose ? 'inherit' : 'pipe',
        shell: false, // Keep shell disabled for security
        ...options
      });

      let stdout = '';
      let stderr = '';

      if (!options.verbose) {
        child.stdout?.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr?.on('data', (data) => {
          stderr += data.toString();
        });
      }

      child.on('close', (code) => {
        if (code === 0) {
          resolve({ stdout, stderr });
        } else {
          reject(new Error(`Command failed with code ${code}: ${stderr || stdout}`));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Clean the output directory if requested in configuration
 * 
 * @param {string} outDir - Output directory path to clean
 * @param {Object} config - Build configuration
 * @param {boolean} config.clean - Whether cleaning is enabled
 * @param {boolean} config.verbose - Whether to show verbose output
 * @param {boolean} config.dryRun - Whether to run in dry-run mode
 */
async function cleanOutputDir(outDir, config) {
  if (!config.clean) return;

  // Validate output directory path
  const validatedOutDir = validatePath(outDir);

  if (config.verbose) {
    console.log(`🧹 Cleaning output directory: ${validatedOutDir}`);
  }

  if (!config.dryRun && existsSync(validatedOutDir)) {
    await rm(validatedOutDir, { recursive: true, force: true });
  }

  console.log(`✅ Cleaned: ${relative(process.cwd(), validatedOutDir)}`);
}

/**
 * Create TypeScript configuration for a specific module format
 * 
 * Generates appropriate compiler options for either ESM or CommonJS output,
 * including correct module settings, output directories, and build options.
 * 
 * @param {string} format - Target format ('esm' or 'cjs')
 * @param {Object} config - Build configuration
 * @param {string} config.outDir - Base output directory
 * @returns {Object} TypeScript configuration object
 */
function createTsConfig(format, config) {
  // Validate paths to prevent traversal
  const validatedOutDir = validatePath(config.outDir);
  
  const baseConfig = {
    compilerOptions: {
      target: 'ES2020',
      lib: ['ES2020'],
      module: format === 'esm' ? 'ESNext' : 'CommonJS',
      moduleResolution: 'node',
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      outDir: join(validatedOutDir, format),
      rootDir: 'src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      removeComments: false,
      preserveConstEnums: true,
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist', '**/*.test.ts', '**/*.spec.ts']
  };

  return baseConfig;
}

/**
 * Fix ESM imports by adding .js extensions to relative imports
 * 
 * This function recursively processes all JavaScript files in the ESM output
 * directory and adds appropriate file extensions to relative imports. It
 * intelligently determines whether to add '.js' for direct file imports or
 * '/index.js' for directory imports by checking the file system.
 * 
 * Handles these import patterns:
 * - `import ... from './path'` → `import ... from './path.js'` or `./path/index.js`
 * - `export ... from './path'` → `export ... from './path.js'` or `./path/index.js` 
 * - `import('./path')` → `import('./path.js')` or `./path/index.js`
 * - `export { ... } from './path'` → `export { ... } from './path.js'` or `./path/index.js`
 * 
 * @param {string} dirPath - Directory containing ESM output to fix
 * @param {Object} config - Build configuration
 * @param {boolean} config.verbose - Whether to show verbose output
 * @param {boolean} config.dryRun - Whether to run in dry-run mode
 * @returns {Promise<{filesFixed: number, totalImportsFixed: number}>} Fix results
 */
async function fixEsmImports(dirPath, config) {
  // Validate directory path to prevent traversal
  const validatedDirPath = validatePath(dirPath);
  
  if (config.verbose) {
    console.log(`🔧 Fixing ESM imports in: ${validatedDirPath}`);
  }

  let filesFixed = 0;
  let totalImportsFixed = 0;

  async function processDirectory(currentDir) {
    // Validate each directory being processed
    const validatedCurrentDir = validatePath(currentDir);
    const entries = await readdir(validatedCurrentDir, { withFileTypes: true });

    for (const entry of entries) {
      // Validate entry name to prevent traversal
      if (entry.name.includes('..') || entry.name.includes('/') || entry.name.includes('\\')) {
        console.warn(`⚠️  Skipping suspicious filename: ${entry.name}`);
        continue;
      }
      
      const fullPath = join(validatedCurrentDir, entry.name);
      const validatedFullPath = validatePath(fullPath);
      
      if (entry.isDirectory()) {
        await processDirectory(validatedFullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.mjs'))) {
        const fixed = await fixImportsInFile(validatedFullPath);
        if (fixed > 0) {
          filesFixed++;
          totalImportsFixed += fixed;
          if (config.verbose) {
            console.log(`   📝 Fixed ${fixed} imports in: ${relative(validatedDirPath, validatedFullPath)}`);
          }
        }
      }
    }
  }

  async function fixImportsInFile(filePath) {
    const validatedFilePath = validatePath(filePath);
    const content = await readFile(validatedFilePath, 'utf-8');
    let fixedContent = content;
    let importsFixed = 0;

    // Pattern for standard imports/exports from relative paths
    const importPatterns = [
      // import ... from './path'
      /from\s+['"](\.[^'"]*?)(?<!\.js|\.mjs|\.json)['"]/g,
      // export ... from './path'
      /export\s+.*?\s+from\s+['"](\.[^'"]*?)(?<!\.js|\.mjs|\.json)['"]/g,
      // import('./path')
      /import\s*\(\s*['"](\.[^'"]*?)(?<!\.js|\.mjs|\.json)['"]\s*\)/g,
      // export { ... } from './path'
      /export\s*\{\s*[^}]*\}\s*from\s+['"](\.[^'"]*?)(?<!\.js|\.mjs|\.json)['"]/g,
    ];

    for (const pattern of importPatterns) {
      fixedContent = fixedContent.replace(pattern, (match, importPath) => {
        // Validate import path to prevent traversal
        try {
          const targetPath = validatePath(resolve(dirname(validatedFilePath), importPath));
          const indexPath = join(targetPath, 'index.js');
          const directPath = targetPath + '.js';
          
          let newImportPath;
          if (existsSync(indexPath)) {
            // Directory with index.js - add /index.js
            newImportPath = importPath + '/index.js';
          } else if (existsSync(directPath)) {
            // Direct file - add .js
            newImportPath = importPath + '.js';
          } else {
            // Can't determine, assume .js
            newImportPath = importPath + '.js';
          }
          
          importsFixed++;
          return match.replace(importPath, newImportPath);
        } catch (error) {
          console.warn(`⚠️  Skipping suspicious import path: ${importPath}`);
          return match; // Return unchanged if path validation fails
        }
      });
    }

    if (importsFixed > 0 && !config.dryRun) {
      await writeFile(validatedFilePath, fixedContent, 'utf-8');
    }

    return importsFixed;
  }

  await processDirectory(validatedDirPath);
  
  return { filesFixed, totalImportsFixed };
}

/**
 * Create CommonJS package marker file
 * 
 * Creates a package.json file in the CJS output directory with
 * `{"type": "commonjs"}` to ensure Node.js treats the directory
 * as CommonJS modules.
 * 
 * @param {string} cjsDir - CJS output directory path
 * @param {Object} config - Build configuration
 * @param {boolean} config.verbose - Whether to show verbose output
 * @param {boolean} config.dryRun - Whether to run in dry-run mode
 */
async function createCjsPackageMarker(cjsDir, config) {
  // Validate directory path to prevent traversal
  const validatedCjsDir = validatePath(cjsDir);
  
  if (config.verbose) {
    console.log(`📦 Creating CJS package marker in: ${validatedCjsDir}`);
  }

  const packageJsonPath = join(validatedCjsDir, 'package.json');
  const validatedPackageJsonPath = validatePath(packageJsonPath);
  
  const packageContent = {
    type: 'commonjs'
  };

  if (!config.dryRun) {
    await writeFile(validatedPackageJsonPath, JSON.stringify(packageContent, null, 2));
  }

  console.log(`✅ Created CJS package marker`);
}

/**
 * Create a temporary TypeScript config file safely without path traversal risks
 * 
 * @param {string} format - The build format ('esm' or 'cjs')
 * @param {Object} config - Build configuration
 * @returns {Promise<string>} The safe filename of the created temp config
 */
async function createTempTsConfig(format, config) {
  // Use completely hardcoded paths to avoid any taint from user input
  const TEMP_CONFIG_ESM = 'tsconfig.esm.temp.json';
  const TEMP_CONFIG_CJS = 'tsconfig.cjs.temp.json';
  
  const safeTempFilename = (format === 'esm') ? TEMP_CONFIG_ESM : TEMP_CONFIG_CJS;
  const tsConfig = createTsConfig(format, config);
  const workingDir = process.cwd();
  const tempFilePath = join(workingDir, safeTempFilename);
  
  await writeFile(tempFilePath, JSON.stringify(tsConfig, null, 2));
  return safeTempFilename;
}

/**
 * Build a specific module format (ESM or CJS)
 * 
 * Performs the complete build process for a single format:
 * 1. Creates output directory
 * 2. Runs TypeScript compilation  
 * 3. Applies post-processing (ESM import fixing, CJS markers)
 * 4. Reports build metrics
 * 
 * @param {string} format - Target format ('esm' or 'cjs')
 * @param {Object} config - Build configuration
 * @param {BuildStats} stats - Build statistics tracker
 * @throws {Error} If build fails
 */
async function buildFormat(format, config, stats) {
  const startTime = Date.now();
  // Validate output paths to prevent traversal
  const validatedOutDir = validatePath(config.outDir);
  const outputPath = join(validatedOutDir, format);
  const validatedOutputPath = validatePath(outputPath);
  
  console.log(`🔨 Building ${format.toUpperCase()}...`);

  try {
    if (!config.dryRun) {
      // Ensure output directory exists
      await mkdir(validatedOutputPath, { recursive: true });

      // Use existing tsconfig files if they exist, otherwise create inline
      let tscCommand;
      let tempConfigPath = null;
      const configFile = `tsconfig.${format}.json`;
      const validatedConfigFile = validatePath(configFile);
      
      if (existsSync(validatedConfigFile)) {
        tscCommand = ['npx', 'tsc', '-p', validatedConfigFile];
        if (config.verbose) {
          console.log(`   📝 Using existing config: ${validatedConfigFile}`);
        }
      } else {
        // Create temporary config with completely isolated path construction
        tempConfigPath = await createTempTsConfig(format, config);
        tscCommand = ['npx', 'tsc', '-p', tempConfigPath];
        
        if (config.verbose) {
          console.log(`   📝 Creating temporary config: ${tempConfigPath}`);
        }
      }

      try {
        // Run TypeScript compiler
        if (config.verbose) {
          console.log(`   🔧 Running: ${tscCommand.join(' ')}`);
        }
        
        await runCommand(tscCommand[0], tscCommand.slice(1), { 
          verbose: config.verbose 
        });
      } finally {
        // Clean up temp config file immediately after use
        if (tempConfigPath) {
          const safeTempPath = join(process.cwd(), tempConfigPath);
          if (existsSync(safeTempPath)) {
            try {
              await rm(safeTempPath);
              if (config.verbose) {
                console.log(`   🧹 Cleaned up temporary config: ${tempConfigPath}`);
              }
            } catch (cleanupError) {
              console.warn(`⚠️  Warning: Could not clean up temp config ${tempConfigPath}:`, cleanupError.message);
            }
          }
        }
      }

      // Post-process ESM builds to fix imports
      if (format === 'esm') {
        console.log(`🔧 Fixing ESM imports...`);
        const fixResults = await fixEsmImports(validatedOutputPath, config);
        stats.addFix('ESM import fixes', fixResults.totalImportsFixed);
        
        if (config.verbose && fixResults.totalImportsFixed > 0) {
          console.log(`   ✅ Fixed ${fixResults.totalImportsFixed} imports in ${fixResults.filesFixed} files`);
        }
      }

      // Create CJS package marker
      if (format === 'cjs') {
        await createCjsPackageMarker(validatedOutputPath, config);
      }
    }

    const duration = Date.now() - startTime;
    stats.addBuild(format, true, duration, relative(process.cwd(), validatedOutputPath));
    console.log(`✅ ${format.toUpperCase()} build completed in ${duration}ms`);

  } catch (error) {
    const duration = Date.now() - startTime;
    stats.addBuild(format, false, duration, relative(process.cwd(), validatedOutputPath));
    stats.addError(`${format.toUpperCase()} build`, error);
    throw error;
  }
}

/**
 * Perform a complete dual build process
 * 
 * Orchestrates the entire build pipeline:
 * 1. Validates configuration and entry point
 * 2. Optionally cleans output directory
 * 3. Builds each requested format (ESM/CJS)
 * 4. Applies format-specific post-processing
 * 5. Reports comprehensive build results
 * 
 * @param {Object} config - Build configuration object
 * @param {string} config.entry - Entry point file path
 * @param {string} config.outDir - Output directory path
 * @param {string[]} config.formats - Array of formats to build
 * @param {boolean} config.clean - Whether to clean output first
 * @param {boolean} config.verbose - Enable verbose logging
 * @param {boolean} config.dryRun - Run without making changes
 * @returns {Promise<boolean>} True if build succeeded, false otherwise
 */
async function build(config) {
  console.log(`🚀 Forklift - Lifting your TypeScript builds\n`);
  
  // Validate entry point path
  const validatedEntry = validatePath(config.entry);
  console.log(`📁 Entry: ${validatedEntry}`);
  
  // Validate output directory path
  const validatedOutDir = validatePath(config.outDir);
  console.log(`📁 Output: ${validatedOutDir}`);
  
  console.log(`🎯 Formats: ${config.formats.join(', ')}`);
  
  if (config.dryRun) {
    console.log('🔍 Running in dry-run mode');
  }
  
  console.log('');

  const stats = new BuildStats();

  try {
    // Validate entry point exists
    if (!existsSync(validatedEntry)) {
      throw new Error(`Entry point not found: ${validatedEntry}`);
    }

    // Clean output directory if requested (using validated path)
    await cleanOutputDir(validatedOutDir, { ...config, outDir: validatedOutDir });

    // Build each format
    for (const format of config.formats) {
      if (!['esm', 'cjs'].includes(format)) {
        throw new Error(`Unsupported format: ${format}`);
      }
      
      await buildFormat(format, { ...config, entry: validatedEntry, outDir: validatedOutDir }, stats);
    }

    stats.finish();
    stats.report();

    if (stats.hasErrors) {
      console.log(`\n❌ Build completed with errors`);
      return false;
    } else {
      console.log(`\n🎉 Forklift successfully lifted your builds!`);
      return true;
    }

  } catch (error) {
    stats.addError('Build process', error);
    stats.finish();
    stats.report();
    console.error(`\n❌ Forklift failed:`, error.message);
    return false;
  }
}

/**
 * Watch mode implementation for continuous development
 * 
 * Monitors the source directory for file changes and automatically
 * triggers rebuilds. Includes debouncing to handle rapid file changes
 * and build queuing to prevent overlapping builds.
 * 
 * @param {Object} config - Build configuration (same as build function)
 */
async function watchMode(config) {
  console.log(`👀 Forklift Watch Mode - Monitoring for changes...\n`);

  let isBuilding = false;
  let buildQueued = false;
  let queuedBuildTimeout = null;
  let debounceTimeout = null;

  const triggerBuild = async () => {
    if (isBuilding) {
      buildQueued = true;
      return;
    }

    isBuilding = true;
    buildQueued = false;

    console.log(`\n🔄 Changes detected, re-lifting builds...`);
    
    try {
      await build(config);
    } catch (error) {
      console.error('Build error:', error.message);
    }

    isBuilding = false;

    // If another build was queued while we were building, trigger it
    if (buildQueued) {
      // Clear any existing queued build timeout
      if (queuedBuildTimeout) {
        clearTimeout(queuedBuildTimeout);
      }
      queuedBuildTimeout = setTimeout(triggerBuild, 100);
    }
  };

  // Initial build
  await triggerBuild();

  // Watch for changes
  const srcDir = validatePath(dirname(config.entry));
  const watcher = watch(srcDir, { recursive: true });

  console.log(`\n👀 Watching ${srcDir} for changes... Press Ctrl+C to stop.`);

  for await (const event of watcher) {
    if (event.filename && (
      event.filename.endsWith('.ts') || 
      event.filename.endsWith('.js') ||
      event.filename.endsWith('.json')
    )) {
      if (config.verbose) {
        console.log(`📁 ${event.eventType}: ${event.filename}`);
      }
      
      // Clear any existing debounce timeout to prevent memory leaks
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      
      // Debounce rapid changes
      debounceTimeout = setTimeout(triggerBuild, 300);
    }
  }
}

/**
 * Validate configuration
 */
function validateConfig(config) {
  const errors = [];

  if (!config.entry) {
    errors.push('Entry point is required');
  }

  if (!config.outDir) {
    errors.push('Output directory is required');
  }

  if (!config.formats || config.formats.length === 0) {
    errors.push('At least one format must be specified');
  }

  const validFormats = ['esm', 'cjs'];
  const invalidFormats = config.formats.filter(f => !validFormats.includes(f));
  if (invalidFormats.length > 0) {
    errors.push(`Invalid formats: ${invalidFormats.join(', ')}. Valid formats: ${validFormats.join(', ')}`);
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    const config = parseArgs();
    validateConfig(config);

    if (config.watch) {
      await watchMode(config);
    } else {
      const success = await build(config);
      process.exit(success ? 0 : 1);
    }

  } catch (error) {
    console.error('❌ Forklift error:', error.message);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script if called directly
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  main();
}

export { build, watchMode, validateConfig, fixEsmImports, createCjsPackageMarker };

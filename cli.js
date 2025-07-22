#!/usr/bin/env node

/**
 * Swinelink - CLI Entry Point
 * 
 * Entry point stub for the Swinelink CLI that ensures the project is built
 * before running commands and provides helpful error messages.
 * 
 * This project is not affiliated with or endorsed by Porkbun, LLC.
 * This is an independent third-party client for the Porkbun API.
 * 
 * @author Alex Handy <swinelinkapp@gmail.com>
 * @copyright 2025 Alex Handy
 * @version 1.1.0
 * @license MIT
 * @see https://porkbun.com for official Porkbun services
 */

// Check if dist/cli.js exists, if not suggest building
const fs = require('fs');
const path = require('path');

const distCliPath = path.join(__dirname, 'dist', 'cli.js');

if (!fs.existsSync(distCliPath)) {
  console.error('Error: Swinelink CLI not built yet.');
  console.error('Please run: npm run build');
  console.error('Then try your command again.');
  process.exit(1);
}

// Load and run the built CLI
require('./dist/cli');

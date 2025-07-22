#!/usr/bin/env node

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

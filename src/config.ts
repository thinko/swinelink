/**
 * Swinelink - The Config Pigpen 🏠
 * 
 * Where all the important pig feed (API keys) gets stored! This smart little
 * system checks environment variables, user config files, and project settings
 * to make sure your pig is properly fed and ready to work.
 * 
 * We're just the farmers tending the config barn - the real Porkbun magic
 * happens over at their place! (https://porkbun.com)
 * 
 * @author Alex Handy <swinelinkapp@gmail.com>
 * @copyright 2025 Alex Handy
 * @version 1.1.0
 * @license MIT
 */

const filesystem = require('fs');
const pathUtils = require('path');
const osUtils = require('os');

// Multi-level configuration loading with priority:
// 1. Environment variables (highest)
// 2. User config file (~/.config/swinelink/config or ~/.swinelink)
// 3. Project .env file (lowest, for development)

function loadConfig() {
  const config = {
    apiKey: null,
    secretKey: null,
    baseURL: 'https://api.porkbun.com/api/json/v3',
    port: 3000,
    HIDE_RATELIMIT_INFO: null,
    ACKNOWLEDGE_PRICING_DISCLAIMER: null,
    DEFAULT_FRIENDLY_OUTPUT: null,
    HIDE_PB_SEARCH_LINKS: null,
    SUPPRESS_EMOJIS: null,
    LIMIT_TLDS: null
  };

  // 3. Try to load from project .env file (lowest priority)
  try {
    require('dotenv').config({ quiet: true });
  } catch (e) {
    // Ignore if dotenv fails
  }

  // 2. Try to load from user config file
  const userConfigPaths = [
    pathUtils.join(osUtils.homedir(), '.config', 'swinelink', 'swinelink.conf'),
    pathUtils.join(osUtils.homedir(), '.swinelink')
  ];

  for (const configPath of userConfigPaths) {
    if (filesystem.existsSync(configPath)) {
      try {
        const userConfig = filesystem.readFileSync(configPath, 'utf8');
        const lines = userConfig.split('\n');
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=');
            const value = valueParts.join('=').trim();
            
            switch (key.trim().toUpperCase()) {
              case 'PORKBUN_API_KEY':
                config.apiKey = value;
                break;
              case 'PORKBUN_SECRET_KEY':
                config.secretKey = value;
                break;
              case 'PORKBUN_BASE_URL':
                config.baseURL = value;
                break;
              case 'PORT':
                config.port = parseInt(value) || 3000;
                break;
              case 'HIDE_RATELIMIT_INFO':
                config.HIDE_RATELIMIT_INFO = value;
                break;
              case 'ACKNOWLEDGE_PRICING_DISCLAIMER':
                config.ACKNOWLEDGE_PRICING_DISCLAIMER = value;
                break;
              case 'DEFAULT_FRIENDLY_OUTPUT':
                config.DEFAULT_FRIENDLY_OUTPUT = value;
                break;
              case 'HIDE_PB_SEARCH_LINKS':
                config.HIDE_PB_SEARCH_LINKS = value;
                break;
              case 'SUPPRESS_EMOJIS':
                config.SUPPRESS_EMOJIS = value;
                break;
              case 'LIMIT_TLDS':
                config.LIMIT_TLDS = value;
                break;
            }
          }
        }
        break; // Use first config file found
      } catch (e) {
        // Continue to next config path if this one fails
      }
    }
  }

  // 1. Environment variables override everything (highest priority)
  if (process.env.PORKBUN_API_KEY) config.apiKey = process.env.PORKBUN_API_KEY;
  if (process.env.PORKBUN_SECRET_KEY) config.secretKey = process.env.PORKBUN_SECRET_KEY;
  if (process.env.PORKBUN_BASE_URL) config.baseURL = process.env.PORKBUN_BASE_URL;
  if (process.env.PORT) config.port = parseInt(process.env.PORT) || 3000;
  if (process.env.HIDE_RATELIMIT_INFO) config.HIDE_RATELIMIT_INFO = process.env.HIDE_RATELIMIT_INFO;
  if (process.env.ACKNOWLEDGE_PRICING_DISCLAIMER) config.ACKNOWLEDGE_PRICING_DISCLAIMER = process.env.ACKNOWLEDGE_PRICING_DISCLAIMER;
  if (process.env.DEFAULT_FRIENDLY_OUTPUT) config.DEFAULT_FRIENDLY_OUTPUT = process.env.DEFAULT_FRIENDLY_OUTPUT;
  if (process.env.HIDE_PB_SEARCH_LINKS) config.HIDE_PB_SEARCH_LINKS = process.env.HIDE_PB_SEARCH_LINKS;
  if (process.env.SUPPRESS_EMOJIS) config.SUPPRESS_EMOJIS = process.env.SUPPRESS_EMOJIS;
  if (process.env.LIMIT_TLDS) config.LIMIT_TLDS = process.env.LIMIT_TLDS;

  return config;
}

function createUserConfigDir() {
  const configDir = pathUtils.join(osUtils.homedir(), '.config', 'swinelink');
  if (!filesystem.existsSync(configDir)) {
    filesystem.mkdirSync(configDir, { recursive: true });
  }
  return configDir;
}

function getUserConfigPath() {
  return pathUtils.join(osUtils.homedir(), '.config', 'swinelink', 'swinelink.conf');
}

function createDefaultUserConfig() {
  const configDir = createUserConfigDir();
  const configPath = getUserConfigPath();
  
  if (!filesystem.existsSync(configPath)) {
    // "Salutations!" - time to create a terrific config file
    const defaultConfig = `# Swinelink Configuration
# Get your API credentials from: https://porkbun.com/account/api

PORKBUN_API_KEY=your_api_key_here
PORKBUN_SECRET_KEY=your_secret_key_here
PORKBUN_BASE_URL=https://api.porkbun.com/api/json/v3
PORT=3000

# Output Configuration
# Hide rate limit messages (true/false)
HIDE_RATELIMIT_INFO=false

# Acknowledge pricing disclaimer and hide warnings (true/false)
# Setting to true means you acknowledge pricing is not guaranteed
ACKNOWLEDGE_PRICING_DISCLAIMER=false

# Use friendly output format by default (true/false)
DEFAULT_FRIENDLY_OUTPUT=true

# Hide Porkbun checkout/search links (true/false)
HIDE_PB_SEARCH_LINKS=false

# Suppress all emojis in output (true/false)
SUPPRESS_EMOJIS=false

# Limit TLD results to specific extensions (comma-separated list)
# Uncomment and customize the line below to filter results
# LIMIT_TLDS=com,net,org,co,ca,io,ai,site,xyz
`;
    
    filesystem.writeFileSync(configPath, defaultConfig);
    return configPath;
  }
  return null;
}

module.exports = {
  ...loadConfig(),
  createUserConfigDir,
  getUserConfigPath,
  createDefaultUserConfig
};

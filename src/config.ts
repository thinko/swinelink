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
  const config: any = {
    apiKey: null,
    secretKey: null,
    baseURL: 'https://api.porkbun.com/api/json/v3',
    port: 3000,
    SWINELINK_HIDE_RATELIMIT_INFO: null,
    SWINELINK_ACCEPT_PRICE_WARNING: null,
    SWINELINK_FRIENDLY_TEXT: null,
    SWINELINK_HIDE_LINKS: null,
    SWINELINK_BASIC_TEXT: null,
    SWINELINK_ONLY_TLDS: null,

    // Track sources for config show command
    _sources: {
      dotenv: {},
      userConfig: {},
      envVars: {},
      userConfigPath: null
    }
  };

  // 3. Try to load from project .env file (lowest priority)
  const dotenvPath = pathUtils.join(process.cwd(), '.env');
  if (filesystem.existsSync(dotenvPath)) {
    try {
      const envContent = filesystem.readFileSync(dotenvPath, 'utf8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const [key, ...valueParts] = trimmed.split('=');
          const value = valueParts.join('=').trim();
          const cleanKey = key.trim();
          
          if (['PORKBUN_API_KEY', 'PORKBUN_SECRET_KEY', 'PORKBUN_BASE_URL', 'SWINELINK_MCP_PORT', 
               'SWINELINK_HIDE_RATELIMIT_INFO', 'SWINELINK_ACCEPT_PRICE_WARNING', 
               'SWINELINK_FRIENDLY_TEXT', 'SWINELINK_HIDE_LINKS', 
               'SWINELINK_BASIC_TEXT', 'SWINELINK_ONLY_TLDS'].includes(cleanKey)) {
            config._sources.dotenv[cleanKey] = value;
          }
        }
      }
      
      require('dotenv').config({ quiet: true });
    } catch (e) {
      // Ignore if dotenv fails
    }
  }

  // 2. Try to load from user config file
  const userConfigPaths = [
    pathUtils.join(osUtils.homedir(), '.config', 'swinelink', 'swinelink.conf'),
    pathUtils.join(osUtils.homedir(), '.swinelink')
  ];

  for (const configPath of userConfigPaths) {
    if (filesystem.existsSync(configPath)) {
      config._sources.userConfigPath = configPath;
      try {
        const userConfig = filesystem.readFileSync(configPath, 'utf8');
        const lines = userConfig.split('\n');
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const [key, ...valueParts] = trimmed.split('=');
            const value = valueParts.join('=').trim();
            const cleanKey = key.trim().toUpperCase();
            
            // Store in sources for display
            config._sources.userConfig[cleanKey] = value;
            
            switch (cleanKey) {
              case 'PORKBUN_API_KEY':
                config.apiKey = value;
                break;
              case 'PORKBUN_SECRET_KEY':
                config.secretKey = value;
                break;
              case 'PORKBUN_BASE_URL':
                config.baseURL = value;
                break;
              case 'SWINELINK_MCP_PORT':
                config.port = parseInt(value) || 3000;
                break;
              case 'SWINELINK_HIDE_RATELIMIT_INFO':
                config.SWINELINK_HIDE_RATELIMIT_INFO = value;
                break;
              case 'SWINELINK_ACCEPT_PRICE_WARNING':
                config.SWINELINK_ACCEPT_PRICE_WARNING = value;
                break;
              case 'SWINELINK_FRIENDLY_TEXT':
                config.SWINELINK_FRIENDLY_TEXT = value;
                break;
              case 'SWINELINK_HIDE_LINKS':
                config.SWINELINK_HIDE_LINKS = value;
                break;
              case 'SWINELINK_BASIC_TEXT':
                config.SWINELINK_BASIC_TEXT = value;
                break;
              case 'SWINELINK_ONLY_TLDS':
                config.SWINELINK_ONLY_TLDS = value;
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
  const envVars = ['PORKBUN_API_KEY', 'PORKBUN_SECRET_KEY', 'PORKBUN_BASE_URL', 'SWINELINK_MCP_PORT',
                   'SWINELINK_HIDE_RATELIMIT_INFO', 'SWINELINK_ACCEPT_PRICE_WARNING', 
                   'SWINELINK_FRIENDLY_TEXT', 'SWINELINK_HIDE_LINKS', 
                   'SWINELINK_BASIC_TEXT', 'SWINELINK_ONLY_TLDS'];
  
  for (const envVar of envVars) {
    if (process.env[envVar]) {
      config._sources.envVars[envVar] = process.env[envVar];
      
      switch (envVar) {
        case 'PORKBUN_API_KEY':
          config.apiKey = process.env[envVar];
          break;
        case 'PORKBUN_SECRET_KEY':
          config.secretKey = process.env[envVar];
          break;
        case 'PORKBUN_BASE_URL':
          config.baseURL = process.env[envVar];
          break;
        case 'SWINELINK_MCP_PORT':
          config.port = parseInt(process.env[envVar]) || 3000;
          break;
        default:
          config[envVar] = process.env[envVar];
          break;
      }
    }
  }

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

function formatConfigShow() {
  const config = loadConfig();
  let output = '🔧 Current Configuration:\n\n';
  
  // Helper function to redact API keys
  const redactKey = (key) => {
    if (!key) return '❌ Not set';
    return `${key.substring(0, 8)}...`;
  };
  
  // Helper function to check if value is overridden
  const isOverridden = (key) => {
    return config._sources.envVars.hasOwnProperty(key);
  };
  
  // 1. Show environment variables if any are set
  const envVarKeys = Object.keys(config._sources.envVars);
  if (envVarKeys.length > 0) {
    output += '🌍 Environment Variables (highest priority):\n';
    envVarKeys.forEach(key => {
      const value = config._sources.envVars[key];
      if (key.includes('KEY')) {
        output += `   ${key}: ${redactKey(value)}\n`;
      } else {
        output += `   ${key}: ${value}\n`;
      }
    });
    output += '\n';
  }
  
  // 2. Show user config file if it exists
  if (config._sources.userConfigPath) {
    output += `📁 User Config File: ${config._sources.userConfigPath}\n`;
    const userConfigKeys = Object.keys(config._sources.userConfig);
    if (userConfigKeys.length > 0) {
      userConfigKeys.forEach(key => {
        const value = config._sources.userConfig[key];
        const overridden = isOverridden(key);
        let line = '   ';
        
        if (overridden) {
          line += '\x1b[90m'; // Grey text
        }
        
        if (key.includes('KEY')) {
          line += `${key}: ${redactKey(value)}`;
        } else {
          line += `${key}: ${value}`;
        }
        
        if (overridden) {
          line += ' (overridden by env var)\x1b[0m'; // Reset color
        }
        
        output += line + '\n';
      });
    }
    output += '\n';
  }
  
  // 3. Show .env file if it exists
  const dotenvKeys = Object.keys(config._sources.dotenv);
  if (dotenvKeys.length > 0) {
    output += '📄 Project .env File (development only):\n';
    dotenvKeys.forEach(key => {
      const value = config._sources.dotenv[key];
      const overriddenByEnv = isOverridden(key);
      const overriddenByUser = config._sources.userConfig.hasOwnProperty(key);
      const overridden = overriddenByEnv || overriddenByUser;
      
      let line = '   ';
      
      if (overridden) {
        line += '\x1b[90m'; // Grey text
      }
      
      if (key.includes('KEY')) {
        line += `${key}: ${redactKey(value)}`;
      } else {
        line += `${key}: ${value}`;
      }
      
      if (overridden) {
        if (overriddenByEnv) {
          line += ' (overridden by env var)\x1b[0m';
        } else {
          line += ' (overridden by config file)\x1b[0m';
        }
      }
      
      output += line + '\n';
    });
    output += '\n';
  }
  
  // Show effective values summary
  output += '✅ Effective Configuration:\n';
  output += `   API Key: ${redactKey(config.apiKey)}\n`;
  output += `   Secret Key: ${redactKey(config.secretKey)}\n`;
  output += `   Base URL: ${config.baseURL}\n`;
  output += `   Port: ${config.port}\n`;
  
  // Show optional settings only if they're set
  const optionalSettings = [
    { key: 'SWINELINK_HIDE_RATELIMIT_INFO', label: 'Hide Rate Limit Info' },
    { key: 'SWINELINK_ACCEPT_PRICE_WARNING', label: 'Accept Price Warning' },
    { key: 'SWINELINK_FRIENDLY_TEXT', label: 'Friendly Text Output' },
    { key: 'SWINELINK_HIDE_LINKS', label: 'Hide Links' },
    { key: 'SWINELINK_BASIC_TEXT', label: 'Basic Text' },
    { key: 'SWINELINK_ONLY_TLDS', label: 'Only TLDs' }
  ];
  
  const activeSettings = optionalSettings.filter(setting => 
    config[setting.key] !== null && config[setting.key] !== undefined
  );
  
  if (activeSettings.length > 0) {
    output += '\n📝 Active Optional Settings:\n';
    activeSettings.forEach(setting => {
      output += `   ${setting.label}: ${config[setting.key]}\n`;
    });
  }
  
  return output;
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
SWINELINK_MCP_PORT=3000

# Output Configuration
# Hide rate limit messages (true/false)
SWINELINK_HIDE_RATELIMIT_INFO=false

# Acknowledge pricing disclaimer and hide warnings (true/false)
# Setting to true means you acknowledge pricing is not guaranteed
SWINELINK_ACCEPT_PRICE_WARNING=false

# Use friendly output format by default (true/false)
SWINELINK_FRIENDLY_TEXT=true

# Hide Porkbun checkout/search links (true/false)
SWINELINK_HIDE_LINKS=false

# Use basic text output - no emojis, colors, or special formatting (true/false)
SWINELINK_BASIC_TEXT=false

# Limit TLD results to specific extensions (comma-separated list)
# Uncomment and customize the line below to filter results
# SWINELINK_ONLY_TLDS=com,net,org,co,ca,io,ai,site,xyz
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
  createDefaultUserConfig,
  formatConfigShow
};

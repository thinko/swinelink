# 🔧 Configuration Guide

Complete guide to configuring Swinelink for your perfect pig personality!

## Configuration Priority Order

Swinelink supports multiple configuration methods with this priority order:

1. **CLI Options** (highest priority) - Override anything for specific commands
3. **Environment Variables** - Active shell parameters
2. **User Config File** - Your pig's persistent preferences  
4. **Project `.env` File** - Development defaults (lowest priority)

## Quick Setup (Recommended)

```bash
# Create user config with all options documented
swinelink config init

# View your current configuration
swinelink config show

# Edit the config file with your API credentials and preferences
# The file will be created at ~/.config/swinelink/swinelink.conf
```

## Getting Your Porkbun API Keys

1. Go to [porkbun.com](https://porkbun.com) and log into your account
2. Navigate to [API section](https://porkbun.com/account/api)
3. Generate API key and secret key
4. Add them to your config file or environment variables

## Configuration Options

### Core Settings

```bash
# API Credentials (required)
PORKBUN_API_KEY=pk1_your_api_key_here
PORKBUN_SECRET_KEY=sk1_your_secret_key_here
PORKBUN_BASE_URL=https://api.porkbun.com/api/json/v3
SWINELINK_MCP_PORT=3000
```

### Output Control Options

```bash
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
```

## Alternative Configuration Methods

### Environment Variables

```bash
export PORKBUN_API_KEY=pk1_your_api_key_here
export PORKBUN_SECRET_KEY=sk1_your_secret_key_here
export SWINELINK_BASIC_TEXT=true
export SWINELINK_ONLY_TLDS=com,net,org
export SWINELINK_FRIENDLY_TEXT=true
export SWINELINK_HIDE_RATELIMIT_INFO=false
export SWINELINK_ACCEPT_PRICE_WARNING=false
export SWINELINK_HIDE_LINKS=false
```

### CLI Options (Override Everything)

All config options are available as CLI flags and override all other settings:

```bash
# Output control with single-letter aliases
-f, --friendly                # Human-readable output (default: true)  
-j, --json                    # Force JSON output (overrides friendly mode)
-b, --basic-text              # Basic text output (no emojis, colors, or special formatting)
-r, --hide-rate-limit         # Hide rate limit information
-a, --acknowledge-pricing     # Hide pricing disclaimers (you accept terms)
-l, --hide-pb-search-links    # Remove Porkbun purchase/search links
-t, --only-tlds="com,net"     # Filter TLD results to specific extensions

# Debug and utility options  
-d, --debug                   # Enable detailed debug output
    --help                    # Show command help
    --version                 # Show version and attribution info
```

#### CLI Override Examples

```bash
# All config options available as CLI flags
swinelink domain check example.com --basic-text --hide-rate-limit
swinelink domain pricing --only-tlds="com,net,org,io" --acknowledge-pricing

# Using single-letter aliases for efficiency
swinelink do ch example.com -b -r        # Check domain, basic text/no rate limits  
swinelink pr g -t "com,net,org" -a -f    # Get pricing for specific TLDs
swinelink dn l example.com -b            # List DNS records with basic text
swinelink pi -f                          # Test connection with friendly output
swinelink pi -j                          # Test connection with JSON output
swinelink dn l example.com -j            # List DNS records in JSON format

# JSON output overrides friendly mode
swinelink pr g com net -f -j             # Results in JSON despite -f flag
```

## Configuration File Locations

### User Configuration File

**Linux/macOS**: `~/.config/swinelink/swinelink.conf`
**Windows**: `%APPDATA%\swinelink\swinelink.conf`

### Project Configuration File (Development)

**Location**: `.env` file in project root  
**Purpose**: Development defaults only  
**Priority**: Lowest (overridden by all other methods)

## Example Complete Configuration

```bash
# ~/.config/swinelink/swinelink.conf

# API Credentials (required)
PORKBUN_API_KEY=pk1_your_actual_api_key_here
PORKBUN_SECRET_KEY=sk1_your_actual_secret_key_here

# Output Preferences
SWINELINK_FRIENDLY_TEXT=true
SWINELINK_BASIC_TEXT=false
SWINELINK_HIDE_RATELIMIT_INFO=false
SWINELINK_ACCEPT_PRICE_WARNING=false
SWINELINK_HIDE_LINKS=false

# TLD Filtering (uncomment and customize)
# SWINELINK_ONLY_TLDS=com,net,org,io,co,ca,ai,xyz

# MCP Server Settings
SWINELINK_MCP_PORT=3000
PORKBUN_BASE_URL=https://api.porkbun.com/api/json/v3
```

## Configuration for Different Use Cases

### Script-Friendly Configuration

Perfect for automation and scripts:

```bash
# Environment variables for scripts
export SWINELINK_BASIC_TEXT=true
export SWINELINK_HIDE_RATELIMIT_INFO=true
export SWINELINK_HIDE_LINKS=true
export SWINELINK_ACCEPT_PRICE_WARNING=true
export SWINELINK_FRIENDLY_TEXT=false

# Or use CLI flags
swinelink domain check example.com -j -b -r -l -a
```

### Human-Friendly Configuration

Perfect for interactive terminal use:

```bash
# User config file settings
SWINELINK_FRIENDLY_TEXT=true
SWINELINK_BASIC_TEXT=false
SWINELINK_HIDE_RATELIMIT_INFO=false
SWINELINK_ACCEPT_PRICE_WARNING=false
SWINELINK_HIDE_LINKS=false

# Or use CLI flags
swinelink domain check example.com -f
```

### Domain Portfolio Management

Perfect for managing multiple domains:

```bash
# Focus on your preferred TLDs
SWINELINK_ONLY_TLDS=com,net,org,io,co

# Hide noise for cleaner output
HIDE_PB_SEARCH_LINKS=true
ACKNOWLEDGE_PRICING_DISCLAIMER=true

# Commands become cleaner
swinelink pr g  # Only shows your preferred TLDs
swinelink do ch example.com  # Clean availability check
```

## Testing Your Configuration

```bash
# Test API connectivity
swinelink ping

# View current configuration
swinelink config show

# Test with different output modes
swinelink pi -f    # Friendly output
swinelink pi -j    # JSON output
swinelink pi -b    # Basic text
```

## Troubleshooting Configuration

### Common Issues

1. **API keys not working**: Check that keys are correctly set and have API access enabled in Porkbun
2. **Config file not found**: Run `swinelink config init` to create the default config
3. **Options not taking effect**: Check priority order - CLI options override everything
4. **Permissions issues**: Ensure write access to config directory

### Debug Configuration

```bash
# Enable debug mode to see configuration loading
swinelink -d ping

# Or use environment variable
SWINE_DEBUG=1 swinelink ping
```

This will show you exactly which configuration values are being loaded and from where. 
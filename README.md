# 🐷 Swinelink - Your Favorite Pig-Powered Domain Wrangler

Oink oink! Welcome to the barn where domains get the royal pig treatment! This snout-to-tail **CLI tool** and **MCP server** lets you wrangle domains, wrestle DNS records, farm SSL certificates, and much more through the amazing [Porkbun.com](https://porkbun.com) API.

## ✨ What Makes This Pig Special

- 🖥️ **Full CLI Interface** - Command-line pig whispering with shell completion
- 🔌 **MCP Server** - 25 prize-winning tools for AI assistants and automation
- 🌐 **Complete API Coverage** - Every corner of the Porkbun API barnyard
- 🛡️ **Rate Limiting** - Built-in pig patience with cooldowns and state management  
- 📝 **Rich Documentation** - More detailed than a pig farmer's almanac
- 🔧 **Easy Integration** - Plays nice with Claude Desktop, custom apps, and scripts
- ⚙️ **Comprehensive Configuration** - 6 output control options for perfect pig personality

## 🚀 Getting Your Pig Ready for Work

### Bringing Home the Bacon (Installation)

```bash
# Clone and install
git clone <repository-url>
cd swinelink
npm install

# Install globally for CLI usage
npm link
```

## ⚙️ Configuration (Setting Up Your Pig's Preferences!)

Swinelink supports multiple configuration methods with this priority order:
1. **CLI Options** (highest priority) - Override anything for specific commands
2. **User Config File** - Your pig's persistent preferences  
3. **Environment Variables** - System-level defaults
4. **Project `.env` File** - Development defaults (lowest priority)

### Quick Setup (Recommended)

```bash
# Create user config with all options documented
swinelink config init

# View your current configuration
swinelink config show

# Edit the config file with your API credentials and preferences
# The file will be created at ~/.config/swinelink/swinelink.conf
```

### Get Your Porkbun API Keys

1. Go to [porkbun.com](https://porkbun.com) and log into your account
2. Navigate to [API section](https://porkbun.com/account/api)
3. Generate API key and secret key
4. Add them to your config file or environment variables

### Configuration Options

#### Core Settings
```bash
# API Credentials (required)
PORKBUN_API_KEY=pk1_your_api_key_here
PORKBUN_SECRET_KEY=sk1_your_secret_key_here
PORKBUN_BASE_URL=https://api.porkbun.com/api/json/v3
PORT=3000
```

#### Output Control Options (New!)
```bash
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
```

#### Alternative Configuration Methods

**Environment Variables:**
```bash
export PORKBUN_API_KEY=pk1_your_api_key_here
export PORKBUN_SECRET_KEY=sk1_your_secret_key_here
export SUPPRESS_EMOJIS=true
export LIMIT_TLDS=com,net,org
```

**CLI Options (Override Everything):**
```bash
# All config options available as CLI flags
swinelink domain check example.com --suppress-emojis --hide-rate-limit
swinelink domain pricing --limit-tlds="com,net,org,io" --acknowledge-pricing
```

### Test Your Pig's Connection

```bash
# Test API connectivity (make sure your pig can oink!)
swinelink ping

# List your domains (see what's in the barn)
swinelink domain list

# Get help (when your pig needs guidance)
swinelink --help
```

## 🖥️ CLI Usage Examples (Pig Style!)

### Output Customization (Make It Your Own!)

Swinelink offers tons of ways to customize output - perfect for both casual pig whispering and serious scripting!

```bash
# Clean, script-friendly output (no emojis, no rate limits, no checkout links)
swinelink domain check example.com --suppress-emojis --hide-rate-limit --hide-pb-search-links

# Minimal disclaimers (acknowledge pricing warnings once in config)
swinelink domain pricing --acknowledge-pricing

# Filter to your favorite TLDs only  
swinelink domain pricing --limit-tlds="com,net,org,io,co"

# Friendly output with all the pig charm (default behavior)
swinelink domain check example.com --friendly
```

### Domain Management (Pig Wrangling!)

```bash
# Check domain availability
swinelink domain check example.com
swinelink do ch example.com          # Abbreviated form

# List your domains
swinelink domain list
swinelink do l                       # Ultra-short form

# Get pricing for all TLDs (now available as top-level command)
swinelink pricing get
swinelink pr g                       # Ultra-short form
swinelink domain pricing             # Legacy form (still works)

# Filter pricing for specific TLDs (flexible input parsing)
swinelink pricing get com net org .io "co.uk,.ca"
swinelink pr g com net org           # Ultra-short form
swinelink domain pricing "com net mysite.org .io;domain.ca"

# With config TLD filtering enabled, pricing respects your LIMIT_TLDS setting
swinelink pr g                       # Only shows TLDs from your config filter
```

### DNS Management

```bash
# List all DNS records
swinelink dns list mydomain.com
swinelink dn l mydomain.com          # Ultra-short form

# Create A record
swinelink dns create mydomain.com --type A --name www --content 192.168.1.1 --ttl 300
swinelink dn c mydomain.com --type A --name www --content 192.168.1.1 --ttl 300

# Create CNAME record
swinelink dns create mydomain.com --type CNAME --name blog --content www.mydomain.com
swinelink dn c mydomain.com --type CNAME --name blog --content www.mydomain.com

# Get specific record by ID (new structure)
swinelink dns get id mydomain.com 12345
swinelink dn g id mydomain.com 12345 # Ultra-short form

# Get records by type and subdomain (new structure)
swinelink dns get type mydomain.com A www
swinelink dn g type mydomain.com A www     # Ultra-short form

# Update records by type and subdomain
swinelink dns update type mydomain.com A www --content 192.168.1.2
swinelink dn u type mydomain.com A www --content 192.168.1.2

# Delete DNS record by ID
swinelink dns delete mydomain.com 12345
swinelink dn d mydomain.com 12345    # Ultra-short form
```

### SSL & Forwarding

```bash
# Get SSL certificate bundle
swinelink ssl get mydomain.com
swinelink ss g mydomain.com          # Ultra-short form

# List URL forwarding rules
swinelink forwarding list mydomain.com
swinelink fw l mydomain.com          # Ultra-short form

# Create URL forwarding
swinelink forwarding create mydomain.com --location https://newsite.com --type permanent
swinelink fw c mydomain.com --location https://newsite.com --type permanent

# Delete URL forwarding
swinelink forwarding delete mydomain.com 12345
swinelink fw d mydomain.com 12345    # Ultra-short form
```

### DNSSEC & Advanced

```bash
# Create DNSSEC record
swinelink dnssec create-record mydomain.com --flags 257 --algorithm 8 --publickey "ABC123..."
swinelink sec c mydomain.com --flags 257 --algorithm 8 --publickey "ABC123..."

# Get DNSSEC records
swinelink dnssec get-records mydomain.com
swinelink sec g mydomain.com         # Ultra-short form

# Delete DNSSEC record by keytag
swinelink dnssec delete-record mydomain.com 12345
swinelink sec d mydomain.com 12345   # Ultra-short form

# Update nameservers
swinelink nameservers update mydomain.com ns1.example.com ns2.example.com
swinelink ns u mydomain.com ns1.example.com ns2.example.com  # Ultra-short form

# Get nameservers
swinelink nameservers get mydomain.com
swinelink ns g mydomain.com          # Ultra-short form

# Manage glue records
swinelink glue create mydomain.com ns1.mydomain.com 192.168.1.10
swinelink gl c mydomain.com ns1.mydomain.com 192.168.1.10   # Ultra-short form

swinelink glue list mydomain.com
swinelink gl l mydomain.com          # Ultra-short form

swinelink glue delete mydomain.com ns1.mydomain.com
swinelink gl d mydomain.com ns1.mydomain.com    # Ultra-short form
```

## 🎯 CLI Command Abbreviations

Swinelink supports **command abbreviations** - type only enough characters to make a command unique! Perfect for network professionals and power users.

### Quick Reference Table

| Full Command | Ultra-Short | Description |
|-------------|-------------|-------------|
| `ping` | `pi` | Test API connection |
| `pricing get` | `pr g` | Get domain pricing |
| `domain check` | `do ch` | Check domain availability |
| `dns list` | `dn l` | List DNS records |
| `dns get id` | `dn g id` | Get DNS record by ID |
| `dns get type` | `dn g type` | Get DNS records by type |
| `nameservers get` | `ns g` | Get nameservers |
| `dnssec get` | `sec g` | Get DNSSEC records |
| `forwarding create` | `fw c` | Create URL forwarding |
| `ssl get` | `ss g` | Get SSL certificates |

### Examples Using Abbreviations

```bash
# These are all equivalent ways to test connectivity:
swinelink ping
swinelink pin  
swinelink pi

# These are all equivalent ways to list DNS records:
swinelink dns list example.com
swinelink dn list example.com
swinelink dn l example.com

# Ultra-efficient domain management:
swinelink pr g com net org    # Get pricing for specific TLDs
swinelink do ch example.com   # Check domain availability  
swinelink dn g id example.com 12345  # Get DNS record by ID
swinelink ns u example.com ns1.example.com ns2.example.com  # Update nameservers
```

**📚 Full Reference**: See `_dev_docs_/cli-abbreviation-reference.md` for complete abbreviation tables and examples.

### Global CLI Options (Your Pig's Personality!)

These options work with **any** command and override config file settings:

```bash
# Output control options (with single-letter aliases)
-f, --friendly                # Human-readable output (default: true)  
-j, --json                    # Force JSON output (overrides friendly mode)
-e, --suppress-emojis         # Remove all emojis for clean text
-r, --hide-rate-limit         # Hide rate limit information
-a, --acknowledge-pricing     # Hide pricing disclaimers (you accept terms)
-l, --hide-pb-search-links    # Remove Porkbun purchase/search links
-t, --limit-tlds="com,net"    # Filter TLD results to specific extensions

# Debug and utility options  
-d, --debug                   # Enable detailed debug output
    --help                    # Show command help
    --version                 # Show version and attribution info

# Examples using single-letter aliases for efficiency
swinelink do ch example.com -e -r        # Check domain, no emojis/rate limits  
swinelink pr g -t "com,net,org" -a -f    # Get pricing for specific TLDs
swinelink dn l example.com -e            # List DNS records without emojis
swinelink pi -f                          # Test connection with friendly output
swinelink pi -j                          # Test connection with JSON output
swinelink dn l example.com -j            # List DNS records in JSON format

# JSON output overrides friendly mode
swinelink pr g com net -f -j             # Results in JSON despite -f flag

# Examples combining abbreviated commands with full options
swinelink domain check example.com --suppress-emojis --hide-rate-limit
swinelink pricing get --limit-tlds="com,net,org" --acknowledge-pricing --friendly
```

### Debug Mode

```bash
# Enable debug output with --debug flag
swinelink --debug domain check example.com

# Or use environment variable
SWINE_DEBUG=1 swinelink domain list
```

### Shell Completion

```bash
# Set up completion (bash)
eval "$(swinelink completion)"

# Get setup instructions for your shell
swinelink completion-setup bash
swinelink completion-setup zsh
swinelink completion-setup fish

# Then use TAB completion
swinelink dns <TAB>        # Shows: create, list, retrieve, update, delete...
swinelink domain <TAB>     # Shows: check, register, list, details, pricing
```

## 🔌 MCP Server Integration

### Start MCP Server

```bash
# Build and start the MCP server (TypeScript)
npm run mcp

# Development mode (with TypeScript watching)
npm run mcp:dev

# Build TypeScript to JavaScript
npm run build

# Run compiled version directly
node dist/index.js
```

The MCP server provides **25 tools** across 7 categories:

- **Core API** (1): Connectivity testing
- **Domain Management** (3): Availability checking, listing, pricing  
- **DNS Records** (8): Complete CRUD operations with ID and name/type access
- **SSL Management** (1): Certificate retrieval
- **URL Forwarding** (3): Forwarding rules management
- **DNSSEC** (3): DNSSEC record management
- **Nameservers** (2): Nameserver management
- **Glue Records** (4): Glue record operations

### MCP Protocol Communication

The server communicates via **stdio** using the official MCP protocol. This allows seamless integration with MCP-compatible AI assistants and clients.

## 🤖 AI Assistant Integration

### Claude Desktop Configuration

Add to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "swinelink": {
      "command": "node",
      "args": ["/path/to/swinelink/dist/index.js"],
      "env": {
        "PORKBUN_API_KEY": "your_api_key",
        "PORKBUN_SECRET_KEY": "your_secret_key"
      }
    }
  }
}
```

### Continue.dev Configuration

Add to your `config.json`:

```json
{
  "mcpServers": [
    {
      "name": "swinelink",
      "serverPath": "/path/to/swinelink/dist/index.js",
      "env": {
        "PORKBUN_API_KEY": "your_api_key", 
        "PORKBUN_SECRET_KEY": "your_secret_key"
      }
    }
  ]
}
```

### Cursor IDE Integration

Add to Cursor's MCP settings:

```json
{
  "mcp": {
    "servers": {
      "swinelink": {
        "command": "node",
        "args": ["/path/to/swinelink/dist/index.js"],
        "env": {
          "PORKBUN_API_KEY": "your_api_key",
          "PORKBUN_SECRET_KEY": "your_secret_key"
        }
      }
    }
  }
}
```

## 📚 Integration Examples

### Using the CLI Programmatically

```bash
# Check domain availability with JSON output
swinelink domain check example.com

# Get human-readable output
swinelink --friendly domain check example.com

# Create DNS record
swinelink dns create mydomain.com --type A --name www --content 192.168.1.1
```

### Node.js CLI Integration

```javascript
const { exec } = require('child_process');

// Execute CLI commands from Node.js
const checkDomain = (domain) => {
  return new Promise((resolve, reject) => {
    exec(`swinelink domain check ${domain}`, (error, stdout) => {
      if (error) reject(error);
      else resolve(JSON.parse(stdout));
    });
  });
};

// Usage
checkDomain('example.com')
  .then(result => console.log('Domain available:', result.status))
  .catch(err => console.error('Error:', err));
```

### Python CLI Integration

```python
import subprocess
import json

def check_domain(domain):
    """Check domain availability using swinelink CLI"""
    result = subprocess.run(
        ['swinelink', 'domain', 'check', domain],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        return json.loads(result.stdout)
    else:
        raise Exception(f"CLI error: {result.stderr}")

# Usage
try:
    result = check_domain("example.com")
    print(f"Domain available: {result['status']}")
except Exception as e:
         print(f"Error: {e}")
```

### MCP Client Integration

For direct MCP protocol integration with the stdio server, use MCP-compatible libraries or build your own client following the [Model Context Protocol specification](https://modelcontextprotocol.io/).

## 🧪 Development & Testing (Pig Laboratory!)

### Run Tests (Make Sure Your Pigs Perform!)

```bash
# Run the test suite
npm test

# Test CLI commands manually
swinelink ping
swinelink domain list
```

### Project Structure

```
swinelink/
├── cli.js              # CLI entry point stub
├── src/                # TypeScript source files
│   ├── index.ts        # MCP server implementation
│   ├── cli.ts          # CLI implementation
│   ├── config.ts       # Configuration management
│   └── porkbunClient.ts # Porkbun API client
├── dist/               # Compiled JavaScript output
│   ├── index.js        # Compiled MCP server
│   ├── cli.js          # Compiled CLI
│   ├── config.js       # Compiled config
│   └── porkbunClient.js # Compiled API client
├── tests/              # Test files
├── tsconfig.json       # TypeScript configuration
└── package.json        # Dependencies and scripts
```

### Available Scripts

```bash
# Build and Run
npm run build         # Build TypeScript to JavaScript
npm run mcp           # Build and start MCP server
npm run mcp:dev       # Start MCP server in development mode

# CLI Usage
swinelink <command>   # Use CLI globally (after npm link)
./cli.js <command>    # Run CLI directly from project

# Testing
npm test              # Run test suite
```

## 🛠️ Our Prize Pig Tool Collection

<details>
<summary>🔌 <strong>Core API (1 tool)</strong></summary>

- `ping` - Test API connectivity and authentication
</details>

<details>
<summary>🌐 <strong>Domain Management (3 tools)</strong></summary>

- `checkAvailability` - Check if domain is available
- `listDomains` - List all account domains
- `getPricing` - Get domain pricing for all TLDs
</details>

<details>
<summary>📝 <strong>DNS Records (8 tools)</strong></summary>

- `dnsCreateRecord` - Create DNS record
- `dnsListRecords` - List DNS records
- `dnsRetrieveRecord` - Get DNS record by ID
- `dnsRetrieveRecordByNameType` - Get DNS records by name/type
- `dnsUpdateRecord` - Update DNS record by ID
- `dnsUpdateRecordByNameType` - Update DNS records by name/type  
- `dnsDeleteRecord` - Delete DNS record by ID
- `dnsDeleteRecordByNameType` - Delete DNS records by name/type
</details>

<details>
<summary>🔒 <strong>SSL Management (1 tool)</strong></summary>

- `sslRetrieve` - Get SSL certificate bundle
</details>

<details>
<summary>🔗 <strong>URL Forwarding (3 tools)</strong></summary>

- `urlForwardingList` - List forwarding rules
- `urlForwardingCreate` - Create forwarding rule
- `urlForwardingDelete` - Delete forwarding rule  
</details>

<details>
<summary>🛡️ <strong>DNSSEC (3 tools)</strong></summary>

- `createDnssecRecord` - Create DNSSEC record
- `getDnssecRecords` - List DNSSEC records
- `deleteDnssecRecord` - Delete DNSSEC record
</details>

<details>
<summary>🔧 <strong>Nameservers (2 tools)</strong></summary>

- `getNameservers` - Get domain nameservers
- `updateNameservers` - Update domain nameservers
</details>

<details>
<summary>⚡ <strong>Glue Records (4 tools)</strong></summary>

- `createGlueRecord` - Create glue record
- `updateGlueRecord` - Update glue record  
- `deleteGlueRecord` - Delete glue record
- `getGlueRecords` - List glue records
</details>

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

ISC License - see package.json for details

## 🔗 Links

- [Porkbun API Documentation](https://porkbun.com/api/json/v3/documentation)
- [Model Context Protocol (MCP)](https://modelcontextprotocol.io/)
- [Claude Desktop](https://claude.ai/desktop)

---

## 🐽 The Fine Print (But With Pig Puns!)

**Hold your horses... er, pigs!** We're just independent pig farmers who happen to love the [Porkbun, LLC](https://porkbun.com) API. We're not part of the official Porkbun crew - just enthusiastic pig whisperers doing our own thing in the domain barnyard!

**Where Credit's Due:** All the juicy API data that makes our tools squeal with delight comes straight from the pros at [Porkbun, LLC](https://porkbun.com). We're just the messengers bringing home the bacon!

**The Official Word on Warranties:** Porkbun's API comes "as is" - no warranty, no guarantees, just pure API goodness. It's like adopting a pig: it might be amazing, but there's no promise it won't occasionally roll in the mud! Porkbun, LLC can change the rules of their barnyard anytime they want (because it's their farm, after all).

**Need the Real Deal?** For official Porkbun support and services, don't ask us - we're just the pig enthusiasts! Trot on over to the real farm at [https://porkbun.com](https://porkbun.com).

---

## ©️ Copyright Notice

Product and company names mentioned in this documentation are trademarks or registered trademarks of their respective owners. All rights reserved.

- **Porkbun** is a trademark of Porkbun, LLC
- **Claude** and **Claude Desktop** are trademarks of Anthropic PBC
- **Continue.dev** is a trademark of Continue Dev, Inc.
- **Cursor** is a trademark of Anysphere, Inc.
- **TypeScript** and **Visual Studio Code** are trademarks of Microsoft Corporation
- **Gemini** is a trademark of Google LLC
- **Node.js** is a trademark of the OpenJS Foundation

This project is independent software and is not affiliated with, endorsed by, or sponsored by any of the above companies or organizations.

---

**Made with 🐷 and lots of oinking for domain management automation**


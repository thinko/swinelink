# 🐷 Swinelink - Your Favorite Pig-Powered Domain Wrangler

Oink oink! Welcome to the barn where domains get the royal pig treatment! This snout-to-tail **CLI tool** and **MCP server** lets you wrangle domains, wrestle DNS records, farm SSL certificates, and much more through the amazing [Porkbun.com](https://porkbun.com) API.

## ✨ What Makes This Pig Special

- 🖥️ **Full CLI Interface** - Command-line pig whispering with abbreviations and shell completion
- 🔌 **MCP Server** - 25 prize-winning tools for AI assistants and automation
- 🌐 **Complete API Coverage** - Every corner of the Porkbun API barnyard
- 🛡️ **Rate Limiting** - Built-in pig patience with cooldowns and state management  
- 📝 **Rich Documentation** - More detailed than a pig farmer's almanac
- 🔧 **Easy Integration** - Plays nice with Claude Desktop, custom apps, and scripts
- ⚙️ **Comprehensive Configuration** - Multiple output control options for perfect pig personality

## 🚀 Quick Start

### 1. Installation

```bash
# Clone and install
git clone <repository-url>
cd swinelink
npm install

# Install globally for CLI usage
npm link
```

### 2. Get Your API Keys

1. Sign up at [Porkbun.com](https://porkbun.com)
2. Generate API keys at [Porkbun API Settings](https://porkbun.com/account/api)
3. Note your API Key and Secret Key

### 3. Configure Swinelink

```bash
# Create config file with guided setup
swinelink config init

# Edit ~/.config/swinelink/swinelink.conf with your API keys
# Or use environment variables:
export PORKBUN_API_KEY="your_api_key"
export PORKBUN_SECRET_KEY="your_secret_key"
```

### 4. Test Your Connection

```bash
# Test API connection (friendly output)
swinelink ping

# Test with JSON output  
swinelink pi -j
```

## 🎯 Basic Usage Examples

```bash
# Domain management
swinelink domain check example.com
swinelink do ch example.com              # Abbreviated form

# Get pricing
swinelink pricing get com net org
swinelink pr g com net org               # Ultra-short form

# DNS management
swinelink dns list mydomain.com
swinelink dn l mydomain.com              # Abbreviated form

# Create DNS record
swinelink dns create mydomain.com --type A --name www --content 192.168.1.1
swinelink dn c mydomain.com --type A --name www --content 192.168.1.1

# Force JSON output for any command
swinelink domain check example.com -j
swinelink dn l mydomain.com -j
```

## 🎯 Command Abbreviations

Swinelink supports command abbreviations - type only enough characters to make commands unique:

| Full Command | Ultra-Short | Example |
|-------------|-------------|---------|
| `ping` | `pi` | `swinelink pi` |
| `domain check` | `do ch` | `swinelink do ch example.com` |
| `pricing get` | `pr g` | `swinelink pr g com net` |
| `dns list` | `dn l` | `swinelink dn l mydomain.com` |
| `nameservers get` | `ns g` | `swinelink ns g mydomain.com` |

**Single-Letter Options**: All parameters support single-letter aliases (`-j` for JSON, `-f` for friendly, `-b` for basic text, `-r` for no rate limits, etc.)

## 📚 Documentation

- **[Configuration Guide](docs/configuration.md)** - Complete configuration options and setup
- **[CLI Usage](docs/cli-usage.md)** - Comprehensive command examples and advanced usage  
- **[MCP Integration](docs/mcp-integration.md)** - MCP server setup and AI assistant integration
- **[Development Guide](docs/development.md)** - Development, testing, and contributing
- **[Command Reference](_dev_docs_/cli-abbreviation-reference.md)** - Complete abbreviation and command reference

## 🔌 MCP Server (AI Assistant Integration)

Start as MCP server for Claude Desktop, Continue.dev, Cursor, and other AI assistants:

```bash
# Build and start MCP server
npm run mcp

# Or run directly after building
npm run build
node dist/index.js

# Custom port via environment variable
SWINELINK_MCP_PORT=3001 node dist/index.js
```

Add to your AI assistant configuration - see [MCP Integration Guide](docs/mcp-integration.md) for detailed setup instructions.

## 🛠️ Available Tools

**Domain Management**: Check availability, list domains, get pricing  
**DNS Management**: Full CRUD operations, record types (A, AAAA, CNAME, MX, TXT, SRV, CAA)  
**SSL Certificates**: Retrieve certificate bundles  
**URL Forwarding**: Create, list, delete forwarding rules  
**DNSSEC**: Manage DNSSEC records and key operations  
**Advanced**: Nameservers, glue records, domain forwarding

## 🤝 Contributing

Contributions welcome! Please see the [Development Guide](docs/development.md) for setup instructions, testing, and contribution guidelines.

## 📄 License

ISC License - see LICENSE file for details.

## 🔗 Links

- **[Porkbun.com](https://porkbun.com)** - Official Porkbun domain registrar
- **[Porkbun API Docs](https://porkbun.com/api)** - Official API documentation  
- **[MCP Protocol](https://modelcontextprotocol.io)** - Model Context Protocol specification

---

## 🔒 Disclaimer

This project is not affiliated with Porkbun, LLC. This is an independent third-party client for the Porkbun API. The Porkbun API is provided WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.

**API data attribution**: Porkbun, LLC (https://porkbun.com)


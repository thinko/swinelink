# 🔌 MCP Integration Guide

Complete guide to integrating Swinelink with AI assistants via the Model Context Protocol (MCP).

## Overview

Swinelink provides a full MCP server implementation with **25 tools** across 7 categories, allowing AI assistants to directly manage domains, DNS records, SSL certificates, and more through the Porkbun API.

## Starting the MCP Server

### Development Mode

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

### Production Mode

```bash
# Build the project
npm run build

# Start MCP server directly
node dist/index.js

# Custom port (if the server supports it - via environment variable)
SWINELINK_MCP_PORT=3001 node dist/index.js
```

## Available MCP Tools

The MCP server provides **25 tools** organized into these categories:

### 🔌 Core API (1 tool)
- `ping` - Test API connectivity and authentication

### 🌐 Domain Management (3 tools)  
- `checkAvailability` - Check if domain is available
- `listDomains` - List all account domains
- `getPricing` - Get domain pricing for all TLDs

### 📝 DNS Records (8 tools)
- `dnsCreateRecord` - Create DNS record
- (future) `dnsListRecords` - List DNS records (not supported today)
- `dnsRetrieveRecord` - Get DNS record by name+ID
- `dnsRetrieveRecordByNameType` - Get DNS records by name+type
- `dnsUpdateRecord` - Update DNS record by name+ID
- `dnsUpdateRecordByNameType` - Update DNS records by name+type  
- `dnsDeleteRecord` - Delete DNS record by name+ID
- `dnsDeleteRecordByNameType` - Delete DNS records by name+type

### 🔒 SSL Management (1 tool)
- `sslRetrieve` - Get SSL certificate bundle

### 🔗 URL Forwarding (3 tools)
- `urlForwardingList` - List forwarding rules
- `urlForwardingCreate` - Create forwarding rule
- `urlForwardingDelete` - Delete forwarding rule  

### 🛡️ DNSSEC (3 tools)
- `createDnssecRecord` - Create DNSSEC record
- `getDnssecRecords` - List DNSSEC records
- `deleteDnssecRecord` - Delete DNSSEC record

### 🔧 Nameservers (2 tools)
- `getNameservers` - Get domain nameservers
- `updateNameservers` - Update domain nameservers

### ⚡ Glue Records (4 tools)
- `createGlueRecord` - Create glue record
- `updateGlueRecord` - Update glue record  
- `deleteGlueRecord` - Delete glue record
- `getGlueRecords` - List glue records

## AI Assistant Integration

### Claude Desktop Configuration

Add to your Claude Desktop `claude_desktop_config.json`:

#### Absolute Path Configuration (Recommended)

```json
{
  "mcpServers": {
    "swinelink": {
      "command": "node",
      "args": ["/absolute/path/to/swinelink/dist/index.js"],
      "env": {
        "PORKBUN_API_KEY": "your_api_key",
        "PORKBUN_SECRET_KEY": "your_secret_key"
      }
    }
  }
}
```

#### NPM Global Installation Configuration

If you've installed globally with `npm link`:

```json
{
  "mcpServers": {
    "swinelink": {
      "command": "node",
      "args": ["/path/to/global/node_modules/swinelink/dist/index.js"],
      "env": {
        "PORKBUN_API_KEY": "your_api_key",
        "PORKBUN_SECRET_KEY": "your_secret_key"
      }
    }
  }
}
```

#### Configuration File Location

- **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
- **Linux**: `~/.config/Claude/claude_desktop_config.json`

### Continue.dev Configuration

Add to your Continue.dev `config.json`:

```json
{
  "mcpServers": [
    {
      "name": "swinelink",
      "serverPath": "/absolute/path/to/swinelink/dist/index.js",
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
        "args": ["/absolute/path/to/swinelink/dist/index.js"],
        "env": {
          "PORKBUN_API_KEY": "your_api_key",
          "PORKBUN_SECRET_KEY": "your_secret_key"
        }
      }
    }
  }
}
```

### Visual Studio Code Integration

#### Method 1: Using Copilot MCP Extension

Install the "Copilot MCP" extension from the VS Code marketplace, then configure:

1. Open VS Code settings
2. Search for "MCP Servers"
3. Add a new server configuration:

```json
{
  "mcp": {
    "servers": {
      "swinelink": {
        "command": "node",
        "args": ["/absolute/path/to/swinelink/dist/index.js"],
        "env": {
          "PORKBUN_API_KEY": "your_api_key",
          "PORKBUN_SECRET_KEY": "your_secret_key"
        }
      }
    }
  }
}
```

#### Method 2: Using Workspace Configuration

Create a `.vscode/mcp.json` file in your workspace:

```json
{
  "servers": {
    "swinelink": {
      "type": "stdio",
      "command": "node",
      "args": ["/absolute/path/to/swinelink/dist/index.js"],
      "env": {
        "PORKBUN_API_KEY": "your_api_key",
        "PORKBUN_SECRET_KEY": "your_secret_key"
      }
    }
  }
}
```

#### Method 3: Using MCP Server Runner Extension

Install the "MCP Server Runner" extension, then:

1. Click the MCP Servers icon in the activity bar
2. Click the "+" button to add a new server
3. Configure with:
   - **Name**: swinelink
   - **Command**: `node /absolute/path/to/swinelink/dist/index.js`
   - **Port**: 3000 (or your preferred port)
   - **Auto-start**: Enable if desired

### Google Gemini Integration

#### Using Gemini CLI with MCP

If you have the Gemini CLI installed or are running it as a code-compatible extension, add Swinelink to your MCP configuration by adding this to your Gemini CLI settings file (typically `~/.gemini/settings.json`).:

```json
{
  "mcpServers": {
    "swinelink": {
      "command": "node",
      "args": ["/absolute/path/to/swinelink/dist/index.js"],
      "env": {
        "PORKBUN_API_KEY": "your_api_key",
        "PORKBUN_SECRET_KEY": "your_secret_key"
      }
    }
  }
}
```


### Custom MCP Client Integration

For direct MCP protocol integration with the stdio server, use MCP-compatible libraries or build your own client following the [Model Context Protocol specification](https://modelcontextprotocol.io/).

## Configuration Options for MCP

### Environment Variables

The MCP server respects all the same configuration options as the CLI:

```bash
# Required API credentials
PORKBUN_API_KEY=your_api_key
PORKBUN_SECRET_KEY=your_secret_key

# Optional configuration
PORKBUN_BASE_URL=https://api.porkbun.com/api/json/v3
SWINELINK_MCP_PORT=3000

# Output control (affects MCP tool responses)
SWINELINK_FRIENDLY_TEXT=true
SWINELINK_HIDE_RATELIMIT_INFO=true
SWINELINK_ONLY_TLDS=com,net,org,io
```

### Custom Port Configuration

```bash
# Start MCP server on custom port via environment variable
SWINELINK_MCP_PORT=3001 node dist/index.js
```

## MCP Protocol Communication

The server communicates via **stdio** using the official MCP protocol. This allows seamless integration with MCP-compatible AI assistants and clients.

### Protocol Features

- **Tool Discovery**: AI assistants can discover all 25 available tools
- **Schema Validation**: All tool parameters are validated according to JSON schemas
- **Error Handling**: Proper error responses with detailed messages
- **Rate Limiting**: Built-in rate limiting with respectful API usage
- **Streaming**: Supports streaming responses for large data sets

## Example AI Assistant Prompts

Once configured, you can ask your AI assistant to:

### Domain Management
- "Check if example.com is available"
- "List all my domains"
- "Get pricing for .com and .net domains"

### DNS Management  
- "List all DNS records for mydomain.com"
- "Create an A record for www.mydomain.com pointing to 192.168.1.1"
- "Update the DNS record with ID 12345 to point to 192.168.1.2"
- "Delete all A records for www.mydomain.com"

### SSL Certificates
- "Get the SSL certificate bundle for mydomain.com"

### URL Forwarding
- "List all URL forwarding rules for mydomain.com"
- "Create a permanent redirect from mydomain.com to https://newsite.com"

### Advanced Operations
- "Set up DNSSEC for mydomain.com"
- "Update nameservers for mydomain.com to ns1.example.com and ns2.example.com"
- "Create glue records for my nameservers"

## Troubleshooting MCP Integration

### Common Issues

1. **Server not starting**: Check that API keys are set and valid
2. **Tools not appearing**: Verify MCP server configuration in AI assistant
3. **Permission errors**: Ensure the AI assistant can execute Node.js
4. **API rate limits**: Built-in rate limiting should handle this automatically

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Debug mode via environment variable
SWINE_DEBUG=1 node dist/index.js
```

### Verify MCP Server

Test that the MCP server is working:

```bash
# Start server and test stdio communication
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | node dist/index.js
```

### Claude Desktop Specific

1. **Restart Claude Desktop** after configuration changes
2. **Check logs** in Claude Desktop's developer console
3. **Verify file paths** are absolute and accessible
4. **Test with simple commands** first (like ping)

### VSCode Specific

1. **Restart VS Code** after installing MCP extensions
2. **Check Extension Logs** in the Output panel
3. **Verify Node.js path** is accessible to VS Code
4. **Test MCP server independently** before integrating

### Gemini Specific

1. **Verify Google Cloud credentials** are properly configured
2. **Check Gemini API access** and quotas
3. **Test MCP server connection** independently
4. **Ensure Vertex AI API** is enabled if using Vertex AI integration

## Security Considerations

### API Key Protection

- Use environment variables for API keys (never hardcode)
- Restrict API key permissions in Porkbun dashboard if possible
- Consider using separate API keys for different environments

### Access Control

- The MCP server provides full API access to connected AI assistants
- Only connect to trusted AI assistants
- Monitor API usage through Porkbun dashboard

### Network Security

- MCP server communicates via stdio (no network exposure)
- All API calls go directly to Porkbun's official API
- No data is stored locally or transmitted to third parties

## Advanced MCP Usage

### Monitoring and Logging

Monitor MCP server usage:

```bash
# Enable debug logging
SWINE_DEBUG=1 node dist/index.js

# Log to file  
SWINE_DEBUG=1 node dist/index.js 2>&1 | tee mcp-server.log
```

### Performance Optimization

For high-volume usage:

- Enable rate limiting configuration
- Monitor API quota usage
- Consider caching for frequently accessed data
- Use TLD filtering to reduce response sizes

## Integration Examples

### Automated Domain Portfolio Management

With an AI assistant connected via MCP:

1. **Daily domain monitoring**: "Check which of my domains are expiring soon"
2. **DNS automation**: "Update all www A records to point to my new server IP"
3. **Security auditing**: "Check DNSSEC status for all my domains"
4. **Cost optimization**: "Compare renewal pricing across all my domains"

### Development Workflow Integration

1. **Environment setup**: "Create DNS records for my staging environment"
2. **SSL management**: "Get SSL certificates for all my development domains"  
3. **Testing automation**: "Create temporary subdomains for feature branch testing"
4. **Cleanup automation**: "Remove all DNS records for deprecated projects"

The MCP integration makes Swinelink's powerful domain management capabilities available directly within your AI-assisted workflows! 
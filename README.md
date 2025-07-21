# 🐷 Swinelink - Porkbun Domain Management Suite

A comprehensive **CLI tool** and **MCP server** for managing domains, DNS records, SSL certificates, and more through the [Porkbun.com](https://porkbun.com) API.

## ✨ Features

- 🖥️ **Full CLI Interface** - Complete command-line tool with shell completion
- 🔌 **MCP Server** - 25 tools for AI assistants and automation
- 🌐 **Complete API Coverage** - All Porkbun API endpoints
- 🛡️ **Rate Limiting** - Built-in cooldowns and state management  
- 📝 **Rich Documentation** - Comprehensive help and examples
- 🔧 **Easy Integration** - Works with Claude Desktop, custom apps, and scripts

## 🚀 Quick Start

### Installation & Setup

```bash
# Clone and install
git clone <repository-url>
cd swinelink
npm install

# Configure API keys (get from porkbun.com)
cp .env.example .env
# Edit .env with your PORKBUN_API_KEY and PORKBUN_SECRET_KEY

# Install globally for CLI usage
npm link
```

### Test Connection

```bash
# Test API connectivity
swinelink ping

# List your domains
swinelink domain list

# Get help
swinelink --help
```

## 🖥️ CLI Usage Examples

### Domain Management

```bash
# Check domain availability
swinelink domain check example.com

# List your domains
swinelink domain list

# Get pricing for multiple domains
swinelink domain pricing example.com mydomain.org
```

### DNS Management

```bash
# List all DNS records
swinelink dns list mydomain.com

# Create A record
swinelink dns create mydomain.com --type A --name www --content 192.168.1.1 --ttl 300

# Create CNAME record
swinelink dns create mydomain.com --type CNAME --name blog --content www.mydomain.com

# Update DNS record by name/type
swinelink dns update-by-name-type mydomain.com A www --content 192.168.1.2

# Delete DNS record
swinelink dns delete mydomain.com 12345
```

### SSL & Forwarding

```bash
# Get SSL certificate bundle
swinelink ssl get mydomain.com

# List URL forwarding rules
swinelink forwarding list mydomain.com

# Create URL forwarding
swinelink forwarding create mydomain.com --location https://newsite.com --type permanent

# Delete URL forwarding
swinelink forwarding delete mydomain.com 12345
```

### DNSSEC & Advanced

```bash
# Create DNSSEC record
swinelink dnssec create-record mydomain.com --flags 257 --algorithm 8 --publickey "ABC123..."

# Get DNSSEC records
swinelink dnssec get-records mydomain.com

# Delete DNSSEC record by keytag
swinelink dnssec delete-record mydomain.com 12345

# Update nameservers
swinelink nameservers update mydomain.com ns1.example.com ns2.example.com

# Manage glue records
swinelink glue create mydomain.com ns1.mydomain.com 192.168.1.10
swinelink glue get mydomain.com
swinelink glue delete mydomain.com ns1.mydomain.com
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
# Start the server
npm start
# or
node server.js

# Test the server
node _dev_tests_/mcp-client-test.js
```

The MCP server exposes **25 tools** across 8 categories:
- **Core API** (1): Connectivity testing
- **Domain Management** (4): Registration, listing, details, pricing  
- **DNS Records** (8): Complete CRUD operations
- **SSL Management** (1): Certificate retrieval
- **URL Forwarding** (3): Forwarding rules management
- **DNSSEC** (6): DNSSEC configuration
- **Nameservers** (2): Nameserver management
- **Glue Records** (4): Glue record operations

### MCP Endpoints

- `GET /mcp/manifest` - Tool definitions and schemas
- `POST /mcp/invoke` - Execute tools
- `GET /mcp/tools` - Tool discovery
- `GET /` - Health check

## 🤖 AI Assistant Integration

### Claude Desktop Configuration

Add to your Claude Desktop `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "swinelink": {
      "command": "node",
      "args": ["/path/to/swinelink/server.js"],
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
      "serverPath": "/path/to/swinelink/server.js",
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
        "args": ["/path/to/swinelink/server.js"],
        "cwd": "/path/to/swinelink"
      }
    }
  }
}
```

### Custom Application Integration

```javascript
const axios = require('axios');

// MCP client example
const client = axios.create({
  baseURL: 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' }
});

// Check domain availability
const checkDomain = async (domain) => {
  const response = await client.post('/mcp/invoke', {
    tool: 'checkAvailability',
    arguments: { domain }
  });
  return response.data;
};

// Create DNS record
const createDNS = async (domain, record) => {
  const response = await client.post('/mcp/invoke', {
    tool: 'dnsCreateRecord', 
    arguments: { domain, record }
  });
  return response.data;
};
```

## 📚 API Examples

### Direct HTTP API Usage

```bash
# Check domain availability
curl -X POST http://localhost:3000/mcp/invoke \
  -H "Content-Type: application/json" \
  -d '{"tool": "checkAvailability", "arguments": {"domain": "example.com"}}'

# List domains
curl -X POST http://localhost:3000/mcp/invoke \
  -H "Content-Type: application/json" \
  -d '{"tool": "listDomains", "arguments": {}}'

# Create DNS A record
curl -X POST http://localhost:3000/mcp/invoke \
  -H "Content-Type: application/json" \
  -d '{
    "tool": "dnsCreateRecord",
    "arguments": {
      "domain": "example.com",
      "record": {
        "type": "A",
        "name": "www", 
        "content": "192.168.1.1",
        "ttl": 300
      }
    }
  }'

# Get all available tools
curl http://localhost:3000/mcp/manifest | jq '.tools[].name'
```

### JavaScript/Node.js Integration

```javascript
// Using with Express.js
app.post('/create-subdomain', async (req, res) => {
  const { domain, subdomain, ip } = req.body;
  
  const result = await client.post('/mcp/invoke', {
    tool: 'dnsCreateRecord',
    arguments: {
      domain,
      record: {
        type: 'A',
        name: subdomain,
        content: ip,
        ttl: 300
      }
    }
  });
  
  res.json(result.data);
});
```

### Python Integration

```python
import requests

class SwinelinkClient:
    def __init__(self, base_url="http://localhost:3000"):
        self.base_url = base_url
    
    def invoke_tool(self, tool, arguments={}):
        response = requests.post(f"{self.base_url}/mcp/invoke", 
                               json={"tool": tool, "arguments": arguments})
        return response.json()
    
    def check_domain(self, domain):
        return self.invoke_tool("checkAvailability", {"domain": domain})
    
    def list_domains(self):
        return self.invoke_tool("listDomains")

# Usage
client = SwinelinkClient()
result = client.check_domain("example.com")
print(f"Domain available: {result['result']['status']}")
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file:

```env
PORKBUN_API_KEY=pk1_your_api_key_here
PORKBUN_SECRET_KEY=sk1_your_secret_key_here
PORT=3000
```

### Porkbun API Setup

1. Go to [porkbun.com](https://porkbun.com)
2. Log in to your account
3. Navigate to API section
4. Generate API key and secret key
5. Add your server IP to the allowed IPs list
6. Copy keys to your `.env` file

## 🧪 Development & Testing

### Run Tests

```bash
# Test MCP server functionality
node _dev_tests_/mcp-client-test.js

# Test CLI commands
swinelink ping
swinelink domain list
```

### Project Structure

```
swinelink/
├── cli.js              # Command-line interface
├── server.js           # MCP server implementation  
├── manifest.js         # MCP tool definitions
├── porkbunClient.js    # Porkbun API client
├── config.js           # Configuration loader
├── _dev_tests_/        # Test scripts
├── _dev_docs_/         # Documentation
└── package.json        # Dependencies and scripts
```

### Available Scripts

```bash
npm start              # Start MCP server
npm test              # Run tests (currently placeholder)
node cli.js           # Run CLI directly
```

## 🛠️ Tool Categories

<details>
<summary>🔌 <strong>Core API (1 tool)</strong></summary>

- `ping` - Test API connectivity and authentication
</details>

<details>
<summary>🌐 <strong>Domain Management (4 tools)</strong></summary>

- `checkAvailability` - Check if domain is available
- `registerDomain` - Register a new domain  
- `listDomains` - List all account domains
- `domainDetails` - Get domain details
- `getPricing` - Get domain pricing
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
<summary>🛡️ <strong>DNSSEC (6 tools)</strong></summary>

- `enableDnssec` - Enable DNSSEC
- `disableDnssec` - Disable DNSSEC
- `getDnssec` - Get DNSSEC status
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

**Made with 🐷 for domain management automation**


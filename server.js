const express = require('express');
const bodyParser = require('body-parser');
const manifest = require('./manifest');
const pb = require('./porkbunClient');
const { port } = require('./config');

const app = express();
app.use(bodyParser.json());

// 1. Expose the manifest
app.get('/mcp/manifest', (req, res) => {
  res.json(manifest);
});

// 2. Invocation endpoint
app.post('/mcp/invoke', async (req, res) => {
  const { tool, arguments: args } = req.body;

  try {
    let result;
    
    switch (tool) {
      // Core API
      case 'ping':
        ({ data: result } = await pb.ping());
        break;

      // Domain Management
      case 'checkAvailability':
        ({ data: result } = await pb.checkAvailability(args.domain));
        break;
      case 'listDomains':
        ({ data: result } = await pb.listDomains());
        break;
      case 'getPricing':
        ({ data: result } = await pb.getPricing(args.domains));
        break;

      // DNS Record Management
      case 'dnsCreateRecord':
        ({ data: result } = await pb.dnsCreateRecord(args.domain, args.record));
        break;
      case 'dnsListRecords':
        ({ data: result } = await pb.dnsListRecords(args.domain));
        break;
      case 'dnsRetrieveRecord':
        ({ data: result } = await pb.dnsRetrieveRecord(args.domain, args.id));
        break;
      case 'dnsRetrieveRecordByNameType':
        ({ data: result } = await pb.dnsRetrieveRecordByNameType(
          args.domain, 
          args.type, 
          args.subdomain || ''
        ));
        break;
      case 'dnsUpdateRecord':
        ({ data: result } = await pb.dnsUpdateRecord(args.domain, args.id, args.record));
        break;
      case 'dnsUpdateRecordByNameType':
        ({ data: result } = await pb.dnsUpdateRecordByNameType(
          args.domain, 
          args.type, 
          args.record, 
          args.subdomain || ''
        ));
        break;
      case 'dnsDeleteRecord':
        ({ data: result } = await pb.dnsDeleteRecord(args.domain, args.id));
        break;
      case 'dnsDeleteRecordByNameType':
        ({ data: result } = await pb.dnsDeleteRecordByNameType(
          args.domain, 
          args.type, 
          args.subdomain || ''
        ));
        break;

      // SSL Management
      case 'sslRetrieve':
        ({ data: result } = await pb.sslRetrieve(args.domain));
        break;

      // URL Forwarding
      case 'urlForwardingList':
        ({ data: result } = await pb.urlForwardingList(args.domain));
        break;
      case 'urlForwardingCreate':
        ({ data: result } = await pb.urlForwardingCreate(args.domain, args.record));
        break;
      case 'urlForwardingDelete':
        ({ data: result } = await pb.urlForwardingDelete(args.domain, args.id));
        break;

      // DNSSEC Management (only record operations)
      case 'createDnssecRecord':
        ({ data: result } = await pb.createDnssecRecord(args.domain, args.record));
        break;
      case 'getDnssecRecords':
        ({ data: result } = await pb.getDnssecRecords(args.domain));
        break;
      case 'deleteDnssecRecord':
        ({ data: result } = await pb.deleteDnssecRecord(args.domain, args.keytag));
        break;

      // Nameserver Management
      case 'getNameservers':
        ({ data: result } = await pb.getNameservers(args.domain));
        break;
      case 'updateNameservers':
        ({ data: result } = await pb.updateNameservers(args.domain, args.nameservers));
        break;

      // Glue Record Management
      case 'createGlueRecord':
        ({ data: result } = await pb.createGlueRecord(args.domain, args.host, args.ip));
        break;
      case 'updateGlueRecord':
        ({ data: result } = await pb.updateGlueRecord(args.domain, args.host, args.ip));
        break;
      case 'deleteGlueRecord':
        ({ data: result } = await pb.deleteGlueRecord(args.domain, args.host));
        break;
      case 'getGlueRecords':
        ({ data: result } = await pb.getGlueRecords(args.domain));
        break;

      default:
        return res.status(400).json({ 
          success: false,
          error: `Unknown tool: ${tool}`,
          availableTools: manifest.tools.map(t => t.id)
        });
    }

    return res.json({
      success: true,
      tool,
      result
    });
  } catch (err) {
    console.error(`Error executing tool ${tool}:`, err.message);
    
    return res.status(502).json({
      success: false,
      tool,
      error: err.response?.data || err.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Healthcheck
app.get('/', (req, res) => {
  res.json({
    service: 'swinelink MCP server',
    status: 'running',
    version: '1.1.0',
    tools: manifest.tools.length,
    endpoints: {
      manifest: '/mcp/manifest',
      invoke: '/mcp/invoke'
    }
  });
});

// Tool discovery endpoint
app.get('/mcp/tools', (req, res) => {
  res.json({
    tools: manifest.tools.map(tool => ({
      id: tool.id,
      name: tool.name,
      description: tool.description,
      requiredParams: tool.parameters.required || []
    }))
  });
});

// Start
app.listen(port, () => {
  console.log(`🐷 swinelink MCP server ${version} listening on http://localhost:${port}`);
  console.log(`📝 Manifest available at: http://localhost:${port}/mcp/manifest`);
  console.log(`🛠️  ${manifest.tools.length} tools available`);
});

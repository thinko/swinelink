const express = require('express');
const bodyParser = require('body-parser');
const manifest = require('./manifest');
const pb = require('./porkbunClient');
const { port } = require('./config');

const app = express();
app.use(bodyParser.json());

// Enhanced error handler for MCP operations
const safeExecute = async (operation, tool) => {
  try {
    // Execute the operation and handle both sync and async errors
    const result = await operation();
    return {
      success: true,
      tool,
      result
    };
  } catch (error) {
    console.error(`Error executing tool ${tool}:`, error.message);
    
    // Handle domain validation errors with more specific messaging
    let errorResponse;
    if (error.message && error.message.includes('Domain')) {
      errorResponse = {
        success: false,
        tool,
        error: {
          type: 'DOMAIN_VALIDATION_ERROR',
          message: error.message,
          hint: 'Please check your domain format and try again'
        },
        timestamp: new Date().toISOString()
      };
    } else {
      errorResponse = {
        success: false,
        tool,
        error: error.response?.data || error.message,
        timestamp: new Date().toISOString()
      };
    }
    
    return errorResponse;
  }
};

// 1. Expose the manifest
app.get('/mcp/manifest', (req, res) => {
  res.json(manifest);
});

// 2. Invocation endpoint  
app.post('/mcp/invoke', async (req, res) => {
  const { tool, arguments: args } = req.body;

  let response;
  
  switch (tool) {
    // Core API
    case 'ping':
      response = await safeExecute(async () => {
        const { data } = await pb.ping();
        return data;
      }, tool);
      break;

    // Domain Management
    case 'checkAvailability':
      response = await safeExecute(async () => {
        const { data } = await pb.checkAvailability(args.domain);
        return data;
      }, tool);
      break;
    case 'listDomains':
      response = await safeExecute(async () => {
        const { data } = await pb.listDomains();
        return data;
      }, tool);
      break;
    case 'getPricing':
      response = await safeExecute(async () => {
        const { data } = await pb.getPricing(args.domains);
        return data;
      }, tool);
      break;

    // DNS Record Management
    case 'dnsCreateRecord':
      response = await safeExecute(async () => {
        const { data } = await pb.dnsCreateRecord(args.domain, args.record);
        return data;
      }, tool);
      break;
    case 'dnsListRecords':
      console.log(`DEBUG: dnsListRecords called with domain: "${args.domain}"`);
      response = await safeExecute(async () => {
        console.log(`DEBUG: About to call pb.dnsListRecords with domain: "${args.domain}"`);
        const { data } = await pb.dnsListRecords(args.domain);
        console.log(`DEBUG: pb.dnsListRecords completed successfully`);
        return data;
      }, tool);
      console.log(`DEBUG: safeExecute response:`, JSON.stringify(response, null, 2));
      break;
      case 'dnsRetrieveRecord':
        response = await safeExecute(async () => {
          const { data } = await pb.dnsRetrieveRecord(args.domain, args.id);
          return data;
        }, tool);
        break;
      case 'dnsRetrieveRecordByNameType':
        response = await safeExecute(async () => {
          const { data } = await pb.dnsRetrieveRecordByNameType(
            args.domain, 
            args.type, 
            args.subdomain || ''
          );
          return data;
        }, tool);
        break;
      case 'dnsUpdateRecord':
        response = await safeExecute(async () => {
          const { data } = await pb.dnsUpdateRecord(args.domain, args.id, args.record);
          return data;
        }, tool);
        break;
      case 'dnsUpdateRecordByNameType':
        response = await safeExecute(async () => {
          const { data } = await pb.dnsUpdateRecordByNameType(
            args.domain, 
            args.type, 
            args.record, 
            args.subdomain || ''
          );
          return data;
        }, tool);
        break;
      case 'dnsDeleteRecord':
        response = await safeExecute(async () => {
          const { data } = await pb.dnsDeleteRecord(args.domain, args.id);
          return data;
        }, tool);
        break;
      case 'dnsDeleteRecordByNameType':
        response = await safeExecute(async () => {
          const { data } = await pb.dnsDeleteRecordByNameType(
            args.domain, 
            args.type, 
            args.subdomain || ''
          );
          return data;
        }, tool);
        break;

      // SSL Management
      case 'sslRetrieve':
        response = await safeExecute(async () => {
          const { data } = await pb.sslRetrieve(args.domain);
          return data;
        }, tool);
        break;

      // URL Forwarding
      case 'urlForwardingList':
        response = await safeExecute(async () => {
          const { data } = await pb.urlForwardingList(args.domain);
          return data;
        }, tool);
        break;
      case 'urlForwardingCreate':
        response = await safeExecute(async () => {
          const { data } = await pb.urlForwardingCreate(args.domain, args.record);
          return data;
        }, tool);
        break;
      case 'urlForwardingDelete':
        response = await safeExecute(async () => {
          const { data } = await pb.urlForwardingDelete(args.domain, args.id);
          return data;
        }, tool);
        break;

      // DNSSEC Management (only record operations)
      case 'createDnssecRecord':
        response = await safeExecute(async () => {
          const { data } = await pb.createDnssecRecord(args.domain, args.record);
          return data;
        }, tool);
        break;
      case 'getDnssecRecords':
        response = await safeExecute(async () => {
          const { data } = await pb.getDnssecRecords(args.domain);
          return data;
        }, tool);
        break;
      case 'deleteDnssecRecord':
        response = await safeExecute(async () => {
          const { data } = await pb.deleteDnssecRecord(args.domain, args.keytag);
          return data;
        }, tool);
        break;

      // Nameserver Management
      case 'getNameservers':
        response = await safeExecute(async () => {
          const { data } = await pb.getNameservers(args.domain);
          return data;
        }, tool);
        break;
      case 'updateNameservers':
        response = await safeExecute(async () => {
          const { data } = await pb.updateNameservers(args.domain, args.nameservers);
          return data;
        }, tool);
        break;

      // Glue Record Management
      case 'createGlueRecord':
        response = await safeExecute(async () => {
          const { data } = await pb.createGlueRecord(args.domain, args.host, args.ip);
          return data;
        }, tool);
        break;
      case 'updateGlueRecord':
        response = await safeExecute(async () => {
          const { data } = await pb.updateGlueRecord(args.domain, args.host, args.ip);
          return data;
        }, tool);
        break;
      case 'deleteGlueRecord':
        response = await safeExecute(async () => {
          const { data } = await pb.deleteGlueRecord(args.domain, args.host);
          return data;
        }, tool);
        break;
      case 'getGlueRecords':
        response = await safeExecute(async () => {
          const { data } = await pb.getGlueRecords(args.domain);
          return data;
        }, tool);
        break;

      default:
        return res.status(400).json({ 
          success: false,
          error: `Unknown tool: ${tool}`,
          availableTools: manifest.tools.map(t => t.id)
        });
  }

  // Return the response from safeExecute (which already has the correct structure)
  if (response.success) {
    return res.json(response);
  } else {
    return res.status(502).json(response);
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
const version = manifest.version;
app.listen(port, () => {
  console.log(`🐷 swinelink MCP server ${version} listening on http://localhost:${port}`);
  console.log(`📝 Manifest available at: http://localhost:${port}/mcp/manifest`);
  console.log(`🛠️  ${manifest.tools.length} tools available`);
});

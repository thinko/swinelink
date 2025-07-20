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
      case 'checkAvailability':
        ({ data: result } = await pb.checkAvailability(args.domain));
        break;
      case 'registerDomain':
        ({ data: result } = await pb.registerDomain(
          args.domain, 
          args.years || 1, 
          args.contact
        ));
        break;
      case 'listDomains':
        ({ data: result } = await pb.listDomains());
        break;
      case 'domainDetails':
        ({ data: result } = await pb.domainDetails(args.domain));
        break;
      default:
        return res.status(400).json({ error: `Unknown tool: ${tool}` });
    }

    return res.json({
      success: true,
      tool,
      result
    });
  } catch (err) {
    return res.status(502).json({
      success: false,
      tool,
      error: err.response?.data || err.message
    });
  }
});

// Healthcheck
app.get('/', (req, res) => {
  res.send('swinelink MCP server is running');
});

// Start
app.listen(port, () => {
  console.log(`swinelink listening on http://localhost:${port}`);
});

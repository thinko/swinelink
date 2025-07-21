#!/usr/bin/env node

const { Server } = require("@modelcontextprotocol/sdk/server/index.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} = require("@modelcontextprotocol/sdk/types.js");
const { z } = require("zod");

// Import our existing Porkbun client
const pb = require('./porkbunClient');

// Zod schemas for tool parameters
const DomainSchema = z.object({
  domain: z.string().describe("The domain name (e.g. example.com)")
});

const DNSRecordSchema = z.object({
  domain: z.string().describe("The domain name"),
  record: z.object({
    name: z.string().optional().describe("Subdomain/name (e.g. 'www' or empty for root)"),
    type: z.string().describe("DNS record type (A, AAAA, CNAME, MX, TXT, etc.)"),
    content: z.string().describe("The record content/value"),
    ttl: z.number().optional().describe("Time to live in seconds (default: 600)"),
    prio: z.number().optional().describe("Priority for MX records")
  })
});

const DNSRecordUpdateSchema = z.object({
  domain: z.string().describe("The domain name"),
  id: z.string().describe("The DNS record ID to update"),
  record: z.object({
    name: z.string().optional().describe("Subdomain/name"),
    type: z.string().describe("DNS record type"),
    content: z.string().describe("The record content/value"),
    ttl: z.number().optional().describe("Time to live in seconds"),
    prio: z.number().optional().describe("Priority for MX records")
  })
});

const DNSRecordByNameTypeSchema = z.object({
  domain: z.string().describe("The domain name"),
  type: z.string().describe("DNS record type"),
  subdomain: z.string().optional().describe("Subdomain (empty for root)")
});

const NameserversSchema = z.object({
  domain: z.string().describe("The domain name"),
  nameservers: z.array(z.string()).describe("Array of nameserver hostnames")
});

const GlueRecordSchema = z.object({
  domain: z.string().describe("The domain name"),
  host: z.string().describe("The hostname for the glue record"),
  ip: z.string().describe("The IP address for the glue record")
});

const URLForwardingSchema = z.object({
  domain: z.string().describe("The domain name"),
  record: z.object({
    subdomain: z.string().optional().describe("Subdomain (empty for root)"),
    location: z.string().describe("The URL to forward to"),
    type: z.string().optional().describe("Forward type (temporary or permanent)")
  })
});

const DNSSECRecordSchema = z.object({
  domain: z.string().describe("The domain name"),
  record: z.object({
    flags: z.number().describe("DNSSEC flags"),
    tag: z.number().describe("Key tag"),
    alg: z.number().describe("Algorithm"),
    key: z.string().describe("Public key")
  })
});

// Enhanced error wrapper for consistent error handling
async function safeExecute<T>(operation: () => Promise<T>, toolName: string): Promise<T> {
  try {
    const result = await operation();
    return result;
  } catch (error: any) {
    // Handle domain validation errors with more specific messaging
    if (error.message && error.message.includes('Domain')) {
      throw new Error(`Domain validation error: ${error.message}`);
    } else if (error.response?.data?.message) {
      // Handle API errors from Porkbun
      throw new Error(`API error: ${error.response.data.message}`);
    } else {
      // Handle other errors
      throw new Error(`${toolName} failed: ${error.message || 'Unknown error'}`);
    }
  }
}

// Create the MCP server
const server = new Server(
  {
    name: "swinelink",
    version: "1.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      // Core API
      {
        name: "ping",
        description: "Test authentication and connectivity to the Porkbun API",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      
      // Domain Management
      {
        name: "checkAvailability",
        description: "Check if a domain name is available to register",
        inputSchema: {
          type: "object",
          properties: {
            domain: {
              type: "string",
              description: "The domain name to check (e.g. example.com)",
            },
          },
          required: ["domain"],
        },
      },
      
      {
        name: "listDomains",
        description: "List all domains on your Porkbun account",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },
      
      {
        name: "getPricing",
        description: "Get pricing information for all TLDs",
        inputSchema: {
          type: "object",
          properties: {},
          required: [],
        },
      },

      // DNS Record Management
      {
        name: "dnsCreateRecord",
        description: "Create a new DNS record for a domain",
        inputSchema: {
          type: "object",
          properties: {
            domain: {
              type: "string",
              description: "The domain name",
            },
            record: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "Subdomain/name (e.g. 'www' or empty for root)",
                },
                type: {
                  type: "string",
                  description: "DNS record type (A, AAAA, CNAME, MX, TXT, etc.)",
                },
                content: {
                  type: "string",
                  description: "The record content/value",
                },
                ttl: {
                  type: "number",
                  description: "Time to live in seconds (default: 600)",
                },
                prio: {
                  type: "number",
                  description: "Priority for MX records",
                },
              },
              required: ["type", "content"],
            },
          },
          required: ["domain", "record"],
        },
      },

      {
        name: "dnsListRecords",
        description: "List all DNS records for a domain",
        inputSchema: {
          type: "object",
          properties: {
            domain: {
              type: "string",
              description: "The domain name",
            },
          },
          required: ["domain"],
        },
      },

      {
        name: "dnsRetrieveRecord",
        description: "Retrieve a specific DNS record by ID",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
            id: { type: "string", description: "The DNS record ID" },
          },
          required: ["domain", "id"],
        },
      },

      {
        name: "dnsRetrieveRecordByNameType",
        description: "Retrieve DNS records by name and type",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
            type: { type: "string", description: "DNS record type" },
            subdomain: { type: "string", description: "Subdomain (empty for root)" },
          },
          required: ["domain", "type"],
        },
      },

      {
        name: "dnsUpdateRecord",
        description: "Update a DNS record by ID",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
            id: { type: "string", description: "The DNS record ID" },
            record: {
              type: "object",
              properties: {
                name: { type: "string", description: "Subdomain/name" },
                type: { type: "string", description: "DNS record type" },
                content: { type: "string", description: "The record content/value" },
                ttl: { type: "number", description: "Time to live in seconds" },
                prio: { type: "number", description: "Priority for MX records" },
              },
              required: ["type", "content"],
            },
          },
          required: ["domain", "id", "record"],
        },
      },

      {
        name: "dnsUpdateRecordByNameType",
        description: "Update DNS records by name and type",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
            type: { type: "string", description: "DNS record type" },
            record: {
              type: "object",
              properties: {
                name: { type: "string", description: "Subdomain/name" },
                content: { type: "string", description: "The record content/value" },
                ttl: { type: "number", description: "Time to live in seconds" },
                prio: { type: "number", description: "Priority for MX records" },
              },
              required: ["content"],
            },
            subdomain: { type: "string", description: "Subdomain (empty for root)" },
          },
          required: ["domain", "type", "record"],
        },
      },

      {
        name: "dnsDeleteRecord",
        description: "Delete a DNS record by ID",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
            id: { type: "string", description: "The DNS record ID" },
          },
          required: ["domain", "id"],
        },
      },

      {
        name: "dnsDeleteRecordByNameType",
        description: "Delete DNS records by name and type",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
            type: { type: "string", description: "DNS record type" },
            subdomain: { type: "string", description: "Subdomain (empty for root)" },
          },
          required: ["domain", "type"],
        },
      },

      // SSL Management
      {
        name: "sslRetrieve",
        description: "Retrieve SSL certificate bundle for a domain",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
          },
          required: ["domain"],
        },
      },

      // URL Forwarding
      {
        name: "urlForwardingList",
        description: "List URL forwarding rules for a domain",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
          },
          required: ["domain"],
        },
      },

      {
        name: "urlForwardingCreate",
        description: "Create a URL forwarding rule",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
            record: {
              type: "object",
              properties: {
                subdomain: { type: "string", description: "Subdomain (empty for root)" },
                location: { type: "string", description: "The URL to forward to" },
                type: { type: "string", description: "Forward type (temporary or permanent)" },
              },
              required: ["location"],
            },
          },
          required: ["domain", "record"],
        },
      },

      {
        name: "urlForwardingDelete",
        description: "Delete a URL forwarding rule",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
            id: { type: "string", description: "The forwarding rule ID" },
          },
          required: ["domain", "id"],
        },
      },

      // DNSSEC Management
      {
        name: "createDnssecRecord",
        description: "Create a DNSSEC record",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
            record: {
              type: "object",
              properties: {
                flags: { type: "number", description: "DNSSEC flags" },
                tag: { type: "number", description: "Key tag" },
                alg: { type: "number", description: "Algorithm" },
                key: { type: "string", description: "Public key" },
              },
              required: ["flags", "tag", "alg", "key"],
            },
          },
          required: ["domain", "record"],
        },
      },

      {
        name: "getDnssecRecords",
        description: "Get DNSSEC records for a domain",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
          },
          required: ["domain"],
        },
      },

      {
        name: "deleteDnssecRecord",
        description: "Delete a DNSSEC record",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
            keytag: { type: "string", description: "The key tag of the record to delete" },
          },
          required: ["domain", "keytag"],
        },
      },

      // Nameserver Management
      {
        name: "getNameservers",
        description: "Get nameservers for a domain",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
          },
          required: ["domain"],
        },
      },

      {
        name: "updateNameservers",
        description: "Update nameservers for a domain",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
            nameservers: {
              type: "array",
              items: { type: "string" },
              description: "Array of nameserver hostnames",
            },
          },
          required: ["domain", "nameservers"],
        },
      },

      // Glue Record Management
      {
        name: "createGlueRecord",
        description: "Create a glue record",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
            host: { type: "string", description: "The hostname for the glue record" },
            ip: { type: "string", description: "The IP address for the glue record" },
          },
          required: ["domain", "host", "ip"],
        },
      },

      {
        name: "updateGlueRecord",
        description: "Update a glue record",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
            host: { type: "string", description: "The hostname for the glue record" },
            ip: { type: "string", description: "The IP address for the glue record" },
          },
          required: ["domain", "host", "ip"],
        },
      },

      {
        name: "deleteGlueRecord",
        description: "Delete a glue record",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
            host: { type: "string", description: "The hostname of the glue record to delete" },
          },
          required: ["domain", "host"],
        },
      },

      {
        name: "getGlueRecords",
        description: "Get glue records for a domain",
        inputSchema: {
          type: "object",
          properties: {
            domain: { type: "string", description: "The domain name" },
          },
          required: ["domain"],
        },
      },

      // Add more tools as needed - this is a foundation
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request: any) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "ping":
        return await safeExecute(async () => {
          const { data } = await pb.ping();
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "ping");

      case "checkAvailability":
        return await safeExecute(async () => {
          const { domain } = DomainSchema.parse(args);
          const { data } = await pb.checkAvailability(domain);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "checkAvailability");

      case "listDomains":
        return await safeExecute(async () => {
          const { data } = await pb.listDomains();
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "listDomains");

      case "getPricing":
        return await safeExecute(async () => {
          const { data } = await pb.getPricing();
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "getPricing");

      case "dnsCreateRecord":
        return await safeExecute(async () => {
          const { domain, record } = DNSRecordSchema.parse(args);
          const { data } = await pb.dnsCreateRecord(domain, record);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "dnsCreateRecord");

      case "dnsListRecords":
        return await safeExecute(async () => {
          const { domain } = DomainSchema.parse(args);
          const { data } = await pb.dnsListRecords(domain);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "dnsListRecords");

      case "dnsRetrieveRecord":
        return await safeExecute(async () => {
          const { domain, id } = z.object({
            domain: z.string(),
            id: z.string()
          }).parse(args);
          const { data } = await pb.dnsRetrieveRecord(domain, id);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "dnsRetrieveRecord");

      case "dnsRetrieveRecordByNameType":
        return await safeExecute(async () => {
          const { domain, type, subdomain } = DNSRecordByNameTypeSchema.parse(args);
          const { data } = await pb.dnsRetrieveRecordByNameType(domain, type, subdomain || '');
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "dnsRetrieveRecordByNameType");

      case "dnsUpdateRecord":
        return await safeExecute(async () => {
          const { domain, id, record } = DNSRecordUpdateSchema.parse(args);
          const { data } = await pb.dnsUpdateRecord(domain, id, record);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "dnsUpdateRecord");

      case "dnsUpdateRecordByNameType":
        return await safeExecute(async () => {
          const { domain, type, record, subdomain } = z.object({
            domain: z.string(),
            type: z.string(),
            record: z.object({
              name: z.string().optional(),
              content: z.string(),
              ttl: z.number().optional(),
              prio: z.number().optional()
            }),
            subdomain: z.string().optional()
          }).parse(args);
          const { data } = await pb.dnsUpdateRecordByNameType(domain, type, record, subdomain || '');
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "dnsUpdateRecordByNameType");

      case "dnsDeleteRecord":
        return await safeExecute(async () => {
          const { domain, id } = z.object({
            domain: z.string(),
            id: z.string()
          }).parse(args);
          const { data } = await pb.dnsDeleteRecord(domain, id);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "dnsDeleteRecord");

      case "dnsDeleteRecordByNameType":
        return await safeExecute(async () => {
          const { domain, type, subdomain } = DNSRecordByNameTypeSchema.parse(args);
          const { data } = await pb.dnsDeleteRecordByNameType(domain, type, subdomain || '');
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "dnsDeleteRecordByNameType");

      // SSL Management
      case "sslRetrieve":
        return await safeExecute(async () => {
          const { domain } = DomainSchema.parse(args);
          const { data } = await pb.sslRetrieve(domain);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "sslRetrieve");

      // URL Forwarding
      case "urlForwardingList":
        return await safeExecute(async () => {
          const { domain } = DomainSchema.parse(args);
          const { data } = await pb.urlForwardingList(domain);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "urlForwardingList");

      case "urlForwardingCreate":
        return await safeExecute(async () => {
          const { domain, record } = URLForwardingSchema.parse(args);
          const { data } = await pb.urlForwardingCreate(domain, record);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "urlForwardingCreate");

      case "urlForwardingDelete":
        return await safeExecute(async () => {
          const { domain, id } = z.object({
            domain: z.string(),
            id: z.string()
          }).parse(args);
          const { data } = await pb.urlForwardingDelete(domain, id);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "urlForwardingDelete");

      // DNSSEC Management
      case "createDnssecRecord":
        return await safeExecute(async () => {
          const { domain, record } = DNSSECRecordSchema.parse(args);
          const { data } = await pb.createDnssecRecord(domain, record);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "createDnssecRecord");

      case "getDnssecRecords":
        return await safeExecute(async () => {
          const { domain } = DomainSchema.parse(args);
          const { data } = await pb.getDnssecRecords(domain);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "getDnssecRecords");

      case "deleteDnssecRecord":
        return await safeExecute(async () => {
          const { domain, keytag } = z.object({
            domain: z.string(),
            keytag: z.string()
          }).parse(args);
          const { data } = await pb.deleteDnssecRecord(domain, keytag);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "deleteDnssecRecord");

      // Nameserver Management
      case "getNameservers":
        return await safeExecute(async () => {
          const { domain } = DomainSchema.parse(args);
          const { data } = await pb.getNameservers(domain);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "getNameservers");

      case "updateNameservers":
        return await safeExecute(async () => {
          const { domain, nameservers } = NameserversSchema.parse(args);
          const { data } = await pb.updateNameservers(domain, nameservers);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "updateNameservers");

      // Glue Record Management
      case "createGlueRecord":
        return await safeExecute(async () => {
          const { domain, host, ip } = GlueRecordSchema.parse(args);
          const { data } = await pb.createGlueRecord(domain, host, ip);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "createGlueRecord");

      case "updateGlueRecord":
        return await safeExecute(async () => {
          const { domain, host, ip } = GlueRecordSchema.parse(args);
          const { data } = await pb.updateGlueRecord(domain, host, ip);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "updateGlueRecord");

      case "deleteGlueRecord":
        return await safeExecute(async () => {
          const { domain, host } = z.object({
            domain: z.string(),
            host: z.string()
          }).parse(args);
          const { data } = await pb.deleteGlueRecord(domain, host);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "deleteGlueRecord");

      case "getGlueRecords":
        return await safeExecute(async () => {
          const { domain } = DomainSchema.parse(args);
          const { data } = await pb.getGlueRecords(domain);
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(data, null, 2),
              },
            ],
          };
        }, "getGlueRecords");

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Swinelink MCP server running on stdio");
}

main().catch((error) => {
  console.error("Server failed to start:", error);
  process.exit(1);
});

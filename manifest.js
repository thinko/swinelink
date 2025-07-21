module.exports = {
  name: 'swinelink',
  version: '1.0.0',
  description: 'Porkbun.com domain and DNS management API as MCP tools - verified against official API endpoints',
  tools: [
    // Core API
    {
      id: 'ping',
      name: 'PingAPI',
      description: 'Test authentication and connectivity to the Porkbun API',
      parameters: { type: 'object', properties: {}, required: [] }
    },

    // Domain Management
    {
      id: 'checkAvailability',
      name: 'CheckDomainAvailability',
      description: 'Check if a domain name is available to register',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'The domain name to check (e.g. example.com)' }
        },
        required: ['domain']
      }
    },
    {
      id: 'listDomains',
      name: 'ListDomains',
      description: 'List all domains on your Porkbun account',
      parameters: { type: 'object', properties: {}, required: [] }
    },
    {
      id: 'getPricing',
      name: 'GetDomainPricing',
      description: 'Get pricing information for one or more domains',
      parameters: {
        type: 'object',
        properties: {
          domains: { type: 'array', items: { type: 'string' }, description: 'Array of domain names to get pricing for' }
        },
        required: ['domains']
      }
    },

    // DNS Record Management
    {
      id: 'dnsCreateRecord',
      name: 'CreateDNSRecord',
      description: 'Create a new DNS record for a domain',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' },
          record: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Subdomain name (empty for root)' },
              type: { type: 'string', description: 'Record type (A, CNAME, MX, etc.)' },
              content: { type: 'string', description: 'Record content (IP address, hostname, etc.)' },
              ttl: { type: 'integer', description: 'Time to live in seconds', default: 300 },
              prio: { type: 'integer', description: 'Priority for MX records' }
            },
            required: ['type', 'content']
          }
        },
        required: ['domain', 'record']
      }
    },
    {
      id: 'dnsListRecords',
      name: 'ListDNSRecords',
      description: 'List all DNS records for a domain',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' }
        },
        required: ['domain']
      }
    },
    {
      id: 'dnsRetrieveRecord',
      name: 'RetrieveDNSRecord',
      description: 'Retrieve a specific DNS record by ID',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' },
          id: { type: 'string', description: 'Record ID' }
        },
        required: ['domain', 'id']
      }
    },
    {
      id: 'dnsRetrieveRecordByNameType',
      name: 'RetrieveDNSRecordByNameType',
      description: 'Retrieve DNS records by name and type',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' },
          type: { type: 'string', description: 'Record type (A, CNAME, etc.)' },
          subdomain: { type: 'string', description: 'Subdomain name (optional)', default: '' }
        },
        required: ['domain', 'type']
      }
    },
    {
      id: 'dnsUpdateRecord',
      name: 'UpdateDNSRecord',
      description: 'Update a DNS record by ID',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' },
          id: { type: 'string', description: 'Record ID' },
          record: {
            type: 'object',
            properties: {
              name: { type: 'string', description: 'Subdomain name' },
              type: { type: 'string', description: 'Record type' },
              content: { type: 'string', description: 'Record content' },
              ttl: { type: 'integer', description: 'Time to live in seconds' },
              prio: { type: 'integer', description: 'Priority for MX records' }
            }
          }
        },
        required: ['domain', 'id', 'record']
      }
    },
    {
      id: 'dnsUpdateRecordByNameType',
      name: 'UpdateDNSRecordByNameType',
      description: 'Update DNS records by name and type',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' },
          type: { type: 'string', description: 'Record type' },
          record: {
            type: 'object',
            properties: {
              content: { type: 'string', description: 'Record content' },
              ttl: { type: 'integer', description: 'Time to live in seconds' },
              prio: { type: 'integer', description: 'Priority for MX records' }
            },
            required: ['content']
          },
          subdomain: { type: 'string', description: 'Subdomain name (optional)', default: '' }
        },
        required: ['domain', 'type', 'record']
      }
    },
    {
      id: 'dnsDeleteRecord',
      name: 'DeleteDNSRecord',
      description: 'Delete a DNS record by ID',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' },
          id: { type: 'string', description: 'Record ID' }
        },
        required: ['domain', 'id']
      }
    },
    {
      id: 'dnsDeleteRecordByNameType',
      name: 'DeleteDNSRecordByNameType',
      description: 'Delete DNS records by name and type',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' },
          type: { type: 'string', description: 'Record type' },
          subdomain: { type: 'string', description: 'Subdomain name (optional)', default: '' }
        },
        required: ['domain', 'type']
      }
    },

    // SSL Management
    {
      id: 'sslRetrieve',
      name: 'RetrieveSSLBundle',
      description: 'Retrieve SSL certificate bundle for a domain',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' }
        },
        required: ['domain']
      }
    },

    // URL Forwarding
    {
      id: 'urlForwardingList',
      name: 'ListURLForwarding',
      description: 'List all URL forwarding records for a domain',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' }
        },
        required: ['domain']
      }
    },
    {
      id: 'urlForwardingCreate',
      name: 'CreateURLForwarding',
      description: 'Create a URL forwarding record',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' },
          record: {
            type: 'object',
            properties: {
              location: { type: 'string', description: 'Destination URL' },
              type: { type: 'string', description: 'Forwarding type', default: 'temporary' },
              include_path: { type: 'boolean', description: 'Include path in forwarding', default: true },
              https: { type: 'boolean', description: 'Use HTTPS', default: true }
            },
            required: ['location']
          }
        },
        required: ['domain', 'record']
      }
    },
    {
      id: 'urlForwardingDelete',
      name: 'DeleteURLForwarding',
      description: 'Delete a URL forwarding record',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' },
          id: { type: 'string', description: 'Forwarding record ID' }
        },
        required: ['domain', 'id']
      }
    },

    // DNSSEC Management (only record operations that exist)
    {
      id: 'createDnssecRecord',
      name: 'CreateDNSSECRecord',
      description: 'Create a DNSSEC record',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' },
          record: {
            type: 'object',
            properties: {
              algorithm: { type: 'string', description: 'DNSSEC algorithm' },
              digest_type: { type: 'string', description: 'Digest type' },
              digest: { type: 'string', description: 'Digest' },
              keytag: { type: 'string', description: 'Keytag' }
            },
            required: ['algorithm', 'digest_type', 'digest', 'keytag']
          }
        },
        required: ['domain', 'record']
      }
    },
    {
      id: 'getDnssecRecords',
      name: 'GetDNSSECRecords',
      description: 'Get all DNSSEC records for a domain',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' }
        },
        required: ['domain']
      }
    },
    {
      id: 'deleteDnssecRecord',
      name: 'DeleteDNSSECRecord',
      description: 'Delete a DNSSEC record by keytag',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' },
          keytag: { type: 'string', description: 'Keytag of record to delete' }
        },
        required: ['domain', 'keytag']
      }
    },

    // Nameserver Management
    {
      id: 'getNameservers',
      name: 'GetNameservers',
      description: 'Get nameservers for a domain',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' }
        },
        required: ['domain']
      }
    },
    {
      id: 'updateNameservers',
      name: 'UpdateNameservers',
      description: 'Update nameservers for a domain',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' },
          nameservers: { type: 'array', items: { type: 'string' }, description: 'Array of nameserver hostnames' }
        },
        required: ['domain', 'nameservers']
      }
    },

    // Glue Record Management
    {
      id: 'createGlueRecord',
      name: 'CreateGlueRecord',
      description: 'Create a glue record',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' },
          host: { type: 'string', description: 'Host name' },
          ip: { type: 'string', description: 'IP address' }
        },
        required: ['domain', 'host', 'ip']
      }
    },
    {
      id: 'updateGlueRecord',
      name: 'UpdateGlueRecord',
      description: 'Update a glue record',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' },
          host: { type: 'string', description: 'Host name' },
          ip: { type: 'string', description: 'IP address' }
        },
        required: ['domain', 'host', 'ip']
      }
    },
    {
      id: 'deleteGlueRecord',
      name: 'DeleteGlueRecord',
      description: 'Delete a glue record',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' },
          host: { type: 'string', description: 'Host name' }
        },
        required: ['domain', 'host']
      }
    },
    {
      id: 'getGlueRecords',
      name: 'ListGlueRecords',
      description: 'List all glue records for a domain',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name' }
        },
        required: ['domain']
      }
    }
  ]
};

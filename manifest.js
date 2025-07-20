module.exports = {
  name: 'swinelink',
  version: '1.0.0',
  description: 'Expose Porkbun.com domain API as MCP tools',
  tools: [
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
      id: 'registerDomain',
      name: 'RegisterDomain',
      description: 'Register a domain for a specified number of years',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'Domain name to register' },
          years:  { type: 'integer', description: 'Number of years to register for' },
          contact:{ type: 'object',  description: 'Contact info object per Porkbun API spec' }
        },
        required: ['domain', 'contact']
      }
    },
    {
      id: 'listDomains',
      name: 'ListDomains',
      description: 'List all domains on your Porkbun account',
      parameters: { type: 'object', properties: {}, required: [] }
    },
    {
      id: 'domainDetails',
      name: 'GetDomainDetails',
      description: 'Retrieve details for a specific domain',
      parameters: {
        type: 'object',
        properties: {
          domain: { type: 'string', description: 'The domain name to fetch details for' }
        },
        required: ['domain']
      }
    }
  ]
};

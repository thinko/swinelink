const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { apiKey, secretKey, baseURL } = require('./config');

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

const stateFilePath = path.join(__dirname, '.swinelink.state.json');

/**
 * Validates a domain name according to RFC standards
 * @param {string} domain - The domain name to validate
 * @returns {boolean} - True if valid, false otherwise
 * @throws {Error} - If domain is invalid with descriptive message
 */
const validateDomain = (domain) => {
  if (typeof domain !== 'string' || !domain) {
    throw new Error('Domain must be a non-empty string');
  }

  // Remove trailing dot if present (FQDN format)
  const normalizedDomain = domain.replace(/\.$/, '');
  
  // Check overall length (RFC 1035: max 253 characters)
  if (normalizedDomain.length > 253) {
    throw new Error('Domain name too long (max 253 characters)');
  }

  // Check minimum length and structure
  if (normalizedDomain.length < 3) {
    throw new Error('Domain name too short (minimum format: a.b)');
  }

  // Split into labels (parts separated by dots)
  const labels = normalizedDomain.split('.');

  // Must have at least 2 labels (domain.tld)
  if (labels.length < 2) {
    throw new Error('Domain must have at least 2 parts (domain.tld)');
  }

  // Validate each label
  for (let i = 0; i < labels.length; i++) {
    const label = labels[i];
    
    // Check label length (RFC 1035: max 63 characters per label)
    if (label.length === 0) {
      throw new Error('Domain labels cannot be empty');
    }
    if (label.length > 63) {
      throw new Error(`Domain label too long: "${label}" (max 63 characters)`);
    }

    // Check for valid characters (RFC 1123: letters, digits, hyphens)
    // Also support punycode (xn--) for internationalized domains
    if (!/^[a-zA-Z0-9-]+$/.test(label)) {
      throw new Error(`Invalid characters in domain label: "${label}"`);
    }

    // Labels cannot start or end with hyphen (RFC 952/1123)
    if (label.startsWith('-') || label.endsWith('-')) {
      throw new Error(`Domain labels cannot start or end with hyphen: "${label}"`);
    }

    // TLD (last label) validation
    if (i === labels.length - 1) {
      // TLD must be at least 2 characters
      if (label.length < 2) {
        throw new Error(`TLD too short: "${label}" (minimum 2 characters)`);
      }
      
      // TLD should be letters only (except for punycode which starts with xn--)
      if (!label.startsWith('xn--') && !/^[a-zA-Z]+$/.test(label)) {
        throw new Error(`TLD contains invalid characters: "${label}"`);
      }
    }
  }

  return true;
};

const readState = () => {
  try {
    if (fs.existsSync(stateFilePath)) {
      const stateData = fs.readFileSync(stateFilePath, 'utf8');
      return JSON.parse(stateData);
    }
  } catch (error) {
    // If file is corrupted or unreadable, treat as if it doesn't exist.
    console.error('Error reading state file:', error.message);
  }
  return {};
};

const writeState = (state) => {
  try {
    fs.writeFileSync(stateFilePath, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error('Error writing state file:', error.message);
  }
};

const post = (url, data = {}) => {
  const body = {
    apikey: apiKey,
    secretapikey: secretKey,
    ...data
  };
  return client.post(url, body);
};

const canCheckDomain = () => {
  const state = readState();
  const lastCheck = state.lastDomainCheck || 0;
  const cooldown = (state.domainCheckCooldown || 10) * 1000; // Default to 10 seconds
  const now = Date.now();

  if (now - lastCheck < cooldown) {
    const timeLeft = Math.ceil((cooldown - (now - lastCheck)) / 1000);
    return { canCheck: false, timeLeft };
  }
  return { canCheck: true };
};

module.exports = {
  ping: () => post('/ping'),

  checkAvailability: domain => {
    validateDomain(domain);
    
    const { canCheck, timeLeft } = canCheckDomain();
    if (!canCheck) {
      return Promise.reject({ response: { data: { status: 'ERROR', message: `Please wait ${timeLeft} seconds before checking another domain.` } } });
    }

    return post(`/domain/checkDomain/${domain}`).then(response => {
      const state = readState();
      state.lastDomainCheck = Date.now();
      if (response.data && response.data.limits && response.data.limits.TTL) {
        state.domainCheckCooldown = response.data.limits.TTL;
      }
      writeState(state);
      return response;
    });
  },

  listDomains: () =>
    post('/domain/listAll'),

  // DNS Records
  dnsCreateRecord: (domain, record) => {
    validateDomain(domain);
    return post(`/dns/create/${domain}`, record);
  },

  dnsListRecords: domain => {
    validateDomain(domain);
    return post(`/dns/retrieve/${domain}`);
  },

  dnsRetrieveRecord: (domain, id) => {
    validateDomain(domain);
    return post(`/dns/retrieve/${domain}/${id}`);
  },

  dnsRetrieveRecordByNameType: (domain, type, subdomain = '') => {
    validateDomain(domain);
    return post(`/dns/retrieveByNameType/${domain}/${type}/${subdomain}`);
  },

  dnsUpdateRecord: (domain, id, record) => {
    validateDomain(domain);
    return post(`/dns/edit/${domain}/${id}`, record);
  },

  dnsUpdateRecordByNameType: (domain, type, record, subdomain = '') => {
    validateDomain(domain);
    return post(`/dns/editByNameType/${domain}/${type}/${subdomain}`, record);
  },

  dnsDeleteRecord: (domain, id) => {
    validateDomain(domain);
    return post(`/dns/delete/${domain}/${id}`);
  },

  dnsDeleteRecordByNameType: (domain, type, subdomain = '') => {
    validateDomain(domain);
    return post(`/dns/deleteByNameType/${domain}/${type}/${subdomain}`);
  },

  // SSL
  sslRetrieve: domain => {
    validateDomain(domain);
    return post(`/ssl/retrieve/${domain}`);
  },

  // Domain Forwarding
  urlForwardingList: domain => {
    validateDomain(domain);
    return post(`/domain/getUrlForwarding/${domain}`);
  },

  urlForwardingCreate: (domain, record) => {
    validateDomain(domain);
    return post(`/domain/addUrlForward/${domain}`, record);
  },

  urlForwardingDelete: (domain, id) => {
    validateDomain(domain);
    return post(`/domain/deleteUrlForward/${domain}/${id}`);
  },

  // DNSSEC Records (only the endpoints that actually exist)
  createDnssecRecord: (domain, record) => {
    validateDomain(domain);
    return post(`/dns/createDnssecRecord/${domain}`, record);
  },

  getDnssecRecords: domain => {
    validateDomain(domain);
    return post(`/dns/getDnssecRecords/${domain}`);
  },

  deleteDnssecRecord: (domain, keytag) => {
    validateDomain(domain);
    return post(`/dns/deleteDnssecRecord/${domain}/${keytag}`);
  },

  // Nameservers (fixed to use correct API paths)
  getNameservers: domain => {
    validateDomain(domain);
    return post(`/domain/getNs/${domain}`);
  },

  updateNameservers: (domain, nameservers) => {
    validateDomain(domain);
    return post(`/domain/updateNs/${domain}`, { ns: nameservers });
  },

  // Glue Records
  createGlueRecord: (domain, host, ip) => {
    validateDomain(domain);
    return post(`/domain/createGlue/${domain}/${host}`, { ip });
  },

  updateGlueRecord: (domain, host, ip) => {
    validateDomain(domain);
    return post(`/domain/updateGlue/${domain}/${host}`, { ip });
  },

  deleteGlueRecord: (domain, host) => {
    validateDomain(domain);
    return post(`/domain/deleteGlue/${domain}/${host}`);
  },

  getGlueRecords: domain => {
    validateDomain(domain);
    return post(`/domain/getGlue/${domain}`);
  },

  // Domain Pricing (NO validation - accepts partial strings for TLD pricing)
  getPricing: domains =>
    post('/pricing/get', { domain: domains }),
};
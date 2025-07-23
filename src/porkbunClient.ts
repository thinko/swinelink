/**
 * Swinelink - The Main Pig API Wrangler 🐷✨
 * 
 * This is where the real bacon gets made! Our prize pig handles all the heavy
 * lifting: domain checking, DNS record mud-wrestling, SSL certificate farming,
 * URL forwarding, DNSSEC magic, and even glue record maintenance. 
 * 
 * With built-in domain validation (because we don't want any sick pigs!) and
 * proper error handling, this little oinker is ready for the big leagues.
 * 
 * Disclaimer: We're independent pig enthusiasts, not the official Porkbun crew!
 * 
 * @author Alex Handy <swinelinkapp@gmail.com>
 * @copyright 2025 Alex Handy
 * @version 1.1.0
 * @license MIT
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { apiKey, secretKey, baseURL } = require('./config');

// Check for required credentials and provide helpful error message
if (!apiKey || !secretKey) {
  console.error('❌ Missing Porkbun API credentials!');
  console.error('');
  console.error('🔧 To fix this, run: swinelink config init');
  console.error('   Then edit the config file with your API credentials.');
  console.error('');
  console.error('🔗 Get your API keys from: https://porkbun.com/account/api');
  console.error('');
  console.error('💡 Alternative: Set environment variables:');
  console.error('   export PORKBUN_API_KEY="your_key"');
  console.error('   export PORKBUN_SECRET_KEY="your_secret"');
  process.exit(1);
}

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

const stateFilePath = path.join(__dirname, '.swinelink.state.json');

/**
 * Validates a domain name according to RFC standards
 * "Some Pig" - but first, let's make sure it's a valid domain!
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

const getPricingFromCache = () => {
  const state = readState();
  const now = Date.now();
  const cacheAge = now - (state.pricingCacheTimestamp || 0);
  const cacheMaxAge = (state.pricingCacheTTL || 20) * 60 * 1000; // Default 20 minutes in milliseconds

  if (state.pricingCache && cacheAge < cacheMaxAge) {
    // Cache is valid
    return {
      cached: true,
      data: state.pricingCache,
      ageMinutes: Math.round(cacheAge / 60000)
    };
  }

  // Cache is invalid or doesn't exist
  return { cached: false };
};

const setPricingCache = (pricingData) => {
  const state = readState();
  state.pricingCache = pricingData;
  state.pricingCacheTimestamp = Date.now();
  state.pricingCacheTTL = 20; // 20 minutes
  writeState(state);
};

// Intelligent TLD extraction using actual pricing data
const extractTldFromDomain = (domain) => {
  if (!domain || typeof domain !== 'string') return null;
  
  // Remove trailing dot if present (FQDN format)
  const cleanDomain = domain.replace(/\.$/, '');
  const parts = cleanDomain.split('.');
  
  // Try to get valid TLDs from cache
  try {
    const { cached, data } = getPricingFromCache();
    
    if (cached && data.pricing) {
      const validTlds = Object.keys(data.pricing);
      
      // For domains like "example.co.uk", "test.com.mx", etc.
      // Try progressively longer suffixes (co.uk, then uk)
      for (let i = 1; i < parts.length; i++) {
        const candidateTld = parts.slice(i).join('.');
        if (validTlds.includes(candidateTld)) {
          return candidateTld;
        }
      }
      
      // If no multi-label TLD found, try the last part
      const lastPart = parts[parts.length - 1];
      return validTlds.includes(lastPart) ? lastPart : lastPart;
    }
  } catch (error) {
    console.log(`[TLD_DEBUG] Error: ${error.message}`);
  }
  
  // Fall back to simple extraction if no pricing data available
  return parts[parts.length - 1];
};

module.exports = {
  ping: () => post('/ping'),

  checkAvailability: domain => {
    validateDomain(domain);
    
    const { canCheck, timeLeft } = canCheckDomain();
    if (!canCheck) {
      return Promise.reject({ response: { data: { status: 'ERROR', message: `Please wait ${timeLeft} seconds before checking another domain.` } } });
    }

    // Ensure pricing cache is available for accurate TLD extraction
    const ensurePricingCache = () => {
      const { cached } = getPricingFromCache();
      if (!cached) {
        // Synchronously try to populate cache if it doesn't exist
        // This is a fallback - ideally cache should already be there
        return post('/pricing/get').then(response => {
          if (response.data) {
            setPricingCache(response.data);
          }
          return response.data;
        }).catch(() => null); // Ignore errors, fall back to simple extraction
      }
      return Promise.resolve(null); // Cache already exists
    };

    return ensurePricingCache().then(() => {
      return post(`/domain/checkDomain/${domain}`);
    }).then(response => {
      const state = readState();
      state.lastDomainCheck = Date.now();
      if (response.data && response.data.limits && response.data.limits.TTL) {
        state.domainCheckCooldown = response.data.limits.TTL;
      }
      writeState(state);
      
      // Enhance response with query metadata and pricing disclaimer
      if (response.data) {
        const recognizedTLD = extractTldFromDomain(domain);
        const pricingDisclaimer = "Pricing shown is not guaranteed and may be cached or incorrect. For up-to-date pricing, please visit: https://porkbun.com/products/domains";
        
        // Add info to the response object where AI models will see it
        if (response.data.response) {
          response.data.response.queriedDomain = domain,
          response.data.response.recognizedTLD = recognizedTLD,
          response.data.response.priceWarning = pricingDisclaimer;
        }
        
        response.data = {
          queriedDomain: domain,
          recognizedTLD: recognizedTLD,
          pricingDisclaimer: pricingDisclaimer, // Keep at top level for CLI compatibility
          ...response.data
        };
      }
      
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

  // there is no dnsListRecords in the API, so we're going to try using the retrieve
  // endpoint, but we may need to query by name and type multiple times or with a
  // wildcard to get all the records
  
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
  getPricing: () => {
    const { cached, data, ageMinutes } = getPricingFromCache();
    if (cached) {
      console.log(`Returning cached pricing data (age: ${ageMinutes} minutes)`);
      // Add disclaimer to cached data
      const dataWithDisclaimer = {
        pricingDisclaimer: "Pricing shown is not guaranteed and may be cached or incorrect. For up-to-date pricing, please visit: https://porkbun.com/products/domains",
        ...data
      };
      return Promise.resolve({ data: dataWithDisclaimer });
    }

    return post('/pricing/get').then(response => {
      setPricingCache(response.data);
      
      // Add disclaimer to fresh data
      if (response.data) {
        response.data = {
          pricingDisclaimer: "Pricing shown is not guaranteed and may be cached or incorrect. For up-to-date pricing, please visit: https://porkbun.com/products/domains",
          ...response.data
        };
      }
      
      return response;
    });
  },
};
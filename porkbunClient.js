const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { apiKey, secretKey, baseURL } = require('./config');

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

const stateFilePath = path.join(__dirname, '.swinelink.state.json');

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
  dnsCreateRecord: (domain, record) =>
    post(`/dns/create/${domain}`, record),

  dnsListRecords: domain =>
    post(`/dns/retrieve/${domain}`),

  dnsRetrieveRecord: (domain, id) =>
    post(`/dns/retrieve/${domain}/${id}`),

  dnsRetrieveRecordByNameType: (domain, type, subdomain = '') =>
    post(`/dns/retrieveByNameType/${domain}/${type}/${subdomain}`),

  dnsUpdateRecord: (domain, id, record) =>
    post(`/dns/edit/${domain}/${id}`, record),

  dnsUpdateRecordByNameType: (domain, type, record, subdomain = '') =>
    post(`/dns/editByNameType/${domain}/${type}/${subdomain}`, record),

  dnsDeleteRecord: (domain, id) =>
    post(`/dns/delete/${domain}/${id}`),

  dnsDeleteRecordByNameType: (domain, type, subdomain = '') =>
    post(`/dns/deleteByNameType/${domain}/${type}/${subdomain}`),

  // SSL
  sslRetrieve: domain =>
    post(`/ssl/retrieve/${domain}`),

  // Domain Forwarding
  urlForwardingList: domain =>
    post(`/domain/getUrlForwarding/${domain}`),

  urlForwardingCreate: (domain, record) =>
    post(`/domain/addUrlForward/${domain}`, record),

  urlForwardingDelete: (domain, id) =>
    post(`/domain/deleteUrlForward/${domain}/${id}`),

  // DNSSEC Records (only the endpoints that actually exist)
  createDnssecRecord: (domain, record) =>
    post(`/dns/createDnssecRecord/${domain}`, record),

  getDnssecRecords: domain =>
    post(`/dns/getDnssecRecords/${domain}`),

  deleteDnssecRecord: (domain, keytag) =>
    post(`/dns/deleteDnssecRecord/${domain}/${keytag}`),

  // Nameservers (fixed to use correct API paths)
  getNameservers: domain =>
    post(`/domain/getNs/${domain}`),

  updateNameservers: (domain, nameservers) =>
    post(`/domain/updateNs/${domain}`, { ns: nameservers }),

  // Glue Records
  createGlueRecord: (domain, host, ip) =>
    post(`/domain/createGlue/${domain}/${host}`, { ip }),

  updateGlueRecord: (domain, host, ip) =>
    post(`/domain/updateGlue/${domain}/${host}`, { ip }),

  deleteGlueRecord: (domain, host) =>
    post(`/domain/deleteGlue/${domain}/${host}`),

  getGlueRecords: domain =>
    post(`/domain/getGlue/${domain}`),

  // Domain Pricing
  getPricing: domains =>
    post('/pricing/get', { domain: domains }),
};
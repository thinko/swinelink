const axios = require('axios');
const { apiKey, secretKey, baseURL } = require('./config');

const client = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
});

let lastDomainCheck = 0;
const domainCheckCooldown = 10000; // 10 seconds

const post = (url, data = {}) => {
  const body = {
    apikey: apiKey,
    secretapikey: secretKey,
    ...data
  };
  return client.post(url, body);
};

const canCheckDomain = () => {
  const now = Date.now();
  if (now - lastDomainCheck < domainCheckCooldown) {
    return { canCheck: false, timeLeft: Math.ceil((domainCheckCooldown - (now - lastDomainCheck)) / 1000) };
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
    lastDomainCheck = Date.now();
    return post(`/domain/checkDomain/${domain}`).catch(error => {
      if (error.response && error.response.data && error.response.data.limits) {
        const { TTL, used, limit } = error.response.data.limits;
        if (used >= limit) {
          lastDomainCheck = Date.now() + (TTL * 1000);
        }
      }
      return Promise.reject(error);
    });
  },

  registerDomain: (domain, years = 1, contact) =>
    post('/domain/register', {
      domain,
      years,
      contact,
      auto_renew: false
    }),

  listDomains: () =>
    post('/domain/listAll'),

  domainDetails: domain =>
    post('/domain/detail', { domain }),

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

  // DNSSEC
  enableDnssec: domain =>
    post(`/dns/enable_dnssec/${domain}`),

  disableDnssec: domain =>
    post(`/dns/disable_dnssec/${domain}`),

  getDnssec: domain =>
    post(`/dns/get_dnssec/${domain}`),

  createDnssecRecord: (domain, record) =>
    post(`/dns/createDnssecRecord/${domain}`, record),

  getDnssecRecords: domain =>
    post(`/dns/getDnssecRecords/${domain}`),

  deleteDnssecRecord: (domain, keytag) =>
    post(`/dns/deleteDnssecRecord/${domain}/${keytag}`),

  // Nameservers
  getNameservers: domain =>
    post(`/domain/get_ns/${domain}`),

  updateNameservers: (domain, nameservers) =>
    post(`/domain/update_ns/${domain}`, { ns: nameservers }),

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

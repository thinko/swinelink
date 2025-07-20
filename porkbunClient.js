const axios = require('axios');
const { apiKey, secretKey, baseURL } = require('./config');

const client = axios.create({
  baseURL,
  params: { apikey: apiKey, secretapikey: secretKey },
  headers: { 'Content-Type': 'application/json' }
});

module.exports = {
  checkAvailability: domain =>
    client.post('/domain/search', { searchTerm: domain }),

  registerDomain: (domain, years = 1, contact) =>
    client.post('/domain/register', {
      domain,
      years,
      contact,
      auto_renew: false
    }),

  listDomains: () =>
    client.post('/domain/list'),

  domainDetails: domain =>
    client.post('/domain/detail', { domain })
};

require('dotenv').config();

module.exports = {
  apiKey: process.env.PORKBUN_API_KEY,
  secretKey: process.env.PORKBUN_SECRET_KEY,
  port:     process.env.PORT || 3000,
  baseURL:  'https://api.porkbun.com/api/json/v3'
};

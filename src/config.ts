require('dotenv').config();

module.exports = {
  apiKey: process.env.PORKBUN_API_KEY,
  secretKey: process.env.PORKBUN_SECRET_KEY,
  baseURL: process.env.PORKBUN_BASE_URL || 'https://api.porkbun.com/api/json/v3',
  port: process.env.PORT || 3000
};

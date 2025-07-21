// Suppress all dotenv output
const originalStdoutWrite = process.stdout.write;
const originalStderrWrite = process.stderr.write;
process.stdout.write = () => {};
process.stderr.write = () => {};
require('dotenv').config();
process.stdout.write = originalStdoutWrite;
process.stderr.write = originalStderrWrite;

module.exports = {
  apiKey: process.env.PORKBUN_API_KEY,
  secretKey: process.env.PORKBUN_SECRET_KEY,
  port:     process.env.PORT || 3000,
  baseURL:  'https://api.porkbun.com/api/json/v3'
};

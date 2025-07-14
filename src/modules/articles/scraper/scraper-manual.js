const axios = require('axios');
const config = require('config');

// آدرس کامل سرور API بر اساس محیط
const SERVER_CONFIG = {
  IP: config.get("SERVER.IP"),
  PORT: config.get("SERVER.PORT"),
  NODE_ENV: process.env.NODE_ENV || 'development'
};
console.log('NODE_ENV==============:', process.env.NODE_ENV);
// تعیین پروتکل بر اساس محیط
const PROTOCOL = SERVER_CONFIG.NODE_ENV === 'production' ? 'https' : 'http';

const isProd = SERVER_CONFIG.NODE_ENV === 'production';
const isStandardPort = (SERVER_CONFIG.PORT === '80' && PROTOCOL === 'http') || (SERVER_CONFIG.PORT === '443' && PROTOCOL === 'https');
const portPart = (isProd && isStandardPort) ? '' : `:${SERVER_CONFIG.PORT}`;
const API_URL = `${PROTOCOL}://${SERVER_CONFIG.IP}${portPart}/articles/scraper/all/save`;
console.log("تتتتتتتتتت"+API_URL);
async function runScraper() {
  try {
    console.log(`🚀 [MANUAL] Scraping and saving all news (manual run) - Environment: ${SERVER_CONFIG.NODE_ENV} - Server: ${SERVER_CONFIG.IP}:${SERVER_CONFIG.PORT}`);
    const response = await axios.post(API_URL);
    console.log('✅ [MANUAL] Result:', response.data);
  } catch (error) {
    console.error('❌ [MANUAL] Error:', error.message);
  }
}

// اگر می‌خواهید این فایل را مستقیم اجرا کنید:.
if (require.main === module) {
  runScraper();
}

module.exports = runScraper; 
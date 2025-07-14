const { CronJob } = require('cron');
const axios = require('axios');
const config = require('config');

// آدرس کامل سرور API بر اfffffffساس محیط
const SERVER_CONFIG = {
  IP: config.get("SERVER.IP"),
  PORT: config.get("SERVER.PORT"),
  NODE_ENV: process.env.NODE_ENV || 'development'
};

// تعیین پروتکل بر اساس محیط
const PROTOCOL = SERVER_CONFIG.NODE_ENV === 'production' ? 'https' : 'http';

const isProd = SERVER_CONFIG.NODE_ENV === 'production';
const isStandardPort = (SERVER_CONFIG.PORT === '80' && PROTOCOL === 'http') || (SERVER_CONFIG.PORT === '443' && PROTOCOL === 'https');
const portPart = (isProd && isStandardPort) ? '' : `:${SERVER_CONFIG.PORT}`;
const API_URL = `${PROTOCOL}://${SERVER_CONFIG.IP}${portPart}/articles/scraper/all/save`;
console.log(API_URL);
const job = new CronJob('*/10 * * * *', async () => {
  try {
    console.log(`⏰ [CRON] Scraping and saving all news (every 10 minutes) - Environment: ${SERVER_CONFIG.NODE_ENV} - Server: ${SERVER_CONFIG.IP}:${SERVER_CONFIG.PORT}`);
    const response = await axios.post(API_URL);
    console.log('✅ [CRON] Result:', response.data);
  } catch (error) {
    console.error('❌ [CRON] Error:', error.message);
  }
});

job.start(); 
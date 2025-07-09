const { CronJob } = require('cron');
const axios = require('axios');
const config = require('config');

// آدرس کامل سرور API بر اfffffffساس محیط
const SERVER_CONFIG = {
  IP: config.get("SERVER.IP"),
  PORT: config.get("SERVER.PORT"),
  NODE_ENV: process.env.NODE_ENV || 'development'
};

const API_URL = `http://${SERVER_CONFIG.IP}:${SERVER_CONFIG.PORT}/articles/scraper/all/save`;

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
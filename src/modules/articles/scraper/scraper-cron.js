const { CronJob } = require('cron');
const axios = require('axios');

// آدرس کامل سرور API (در صورت نیاز پورت را تغییر بده)
const API_URL = 'http://localhost:3000/articles/scraper/all/save';

const job = new CronJob('*/1 * * * *', async () => {
  try {
    console.log('⏰ [CRON] Scraping and saving all news (every 2 minutes)...');
    const response = await axios.post(API_URL);
    console.log('✅ [CRON] Result:', response.data);
  } catch (error) {
    console.error('❌ [CRON] Error:', error.message);
  }
});

job.start(); 
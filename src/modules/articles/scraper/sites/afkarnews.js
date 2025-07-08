const axios = require('axios');
const cheerio = require('cheerio');
const Article = require('../../article/model');
const Tag = require('../../tag/model');
const Category = require('../../category/model');
const Agency = require('../../agency/model');

const BASE_URL = 'https://www.afkarnews.com';
const CDN_URL = 'https://cdn.afkarnews.com';

// تابع کمکی برای واکشی دسته با slug
async function getCategoryBySlug(slug) {
  const category = await Category.findOne({ where: { slug } });
  if (!category) throw new Error(`دسته با slug ${slug} یافت نشد.`);
  return category;
}

// تابع کمکی برای استخراج تگ‌ها از افکار نیوز
function extractTagsFromAfkarNews($) {
  let tags = [];
  
  // روش اول: از بخش کلمات کلیدی
  $('#keyword .float.w80 a').each((i, el) => {
    const tag = $(el).text().trim();
    if (tag && tag.length > 0) {
      tags.push(tag);
    }
  });
  
  // روش دوم: از تمام لینک‌های کلمات کلیدی
  if (tags.length === 0) {
    $('#keyword a').each((i, el) => {
      const tag = $(el).text().trim();
      if (tag && tag.length > 0) {
        tags.push(tag);
      }
    });
  }
  
  // روش سوم: از meta keywords
  if (tags.length === 0) {
    const metaKeywords = $('meta[name="keywords"]').attr('content');
    if (metaKeywords) {
      tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
    }
  }
  
  // حذف تگ‌های تکراری
  tags = [...new Set(tags)];
  
  console.log('AfkarNews: تگ‌های استخراج شده:', tags);
  return tags;
}

class AfkarNewsScraper {
  static async scrapePolitics() {
    const url = `${BASE_URL}/بخش-سیاسی-3`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    // سلکتور صحیح برای لیست اخبار سیاسی
    $('#specialnews .box-content ul.pl8.pr8 > li').each((i, el) => {
      const a = $(el).find('a').first();
      const href = a.attr('href');
      if (!href) return;
      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = $(el).find('h3.title').text().trim();
      let image = a.find('img').attr('src') || null;
      if (image && !image.startsWith('http')) image = CDN_URL + image;
      const lead = $(el).find('p.lead').text().trim();
      articles.push({ link, title, image, lead });
    });
    // واکشی جزئیات هر خبر
    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);
        // تگ‌ها - استفاده از تابع کمکی
        const tags = extractTagsFromAfkarNews($$);
        article.tags = tags;
        // تصویر اصلی
        let mainImage = $$('.newsimg-contain img').attr('src');
        if (mainImage && !mainImage.startsWith('http')) mainImage = CDN_URL + mainImage;
        // لید
        const lead = $$('.lead').text().trim();
        article.title = $$('.fb.title').text().trim() || article.title;
        article.lead = lead || article.lead;
        article.image = mainImage || article.image;
      } catch (err) {
        console.error('AfkarNews: خطا در واکشی جزئیات خبر:', article.link, err.message);
      }
    }
    return articles;
  }

  static async scrapeAndSavePolitics() {
    const articles = await this.scrapePolitics();
    if (!articles.length) throw new Error('هیچ خبر سیاسی یافت نشد.');
    const article = articles[0];
    // جلوگیری از ثبت تکراری
    const exists = await Article.findOne({ where: { sourceUrl: article.link } });
    if (exists) throw new Error('این خبر قبلاً ثبت شده است.');
    // ذخیره تگ‌ها
    const uniqueTags = [...new Set(article.tags)];
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    // پیدا کردن دسته و آژانس با slug
    const category = await getCategoryBySlug('politics');
    const agency = await Agency.findOne({ where: { nameEn: 'Afkar News Agency' } });
    if (!agency) throw new Error('آژانس افکار نیوز یافت نشد.');
    // ذخیره خبر
    const newArticle = await Article.create({
      title: article.title,
      summary: article.lead || '',
      sourceUrl: article.link,
      imageUrl: article.image || null,
      publishedAt: new Date(), // اگر تاریخ دقیق داری جایگزین کن
      agencyId: agency.id,
      isActive: true,
      scrapedAt: new Date()
    });
    await newArticle.setTags(tagIds);
    await newArticle.setCategories([category.id]);
    // خروجی با روابط کامل
    const createdArticle = await Article.findByPk(newArticle.id, {
      include: [
        { model: Agency, as: 'agency', attributes: ['id', 'name', 'logo'] },
        { model: Category, as: 'categories', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
        { model: Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } }
      ]
    });
    return createdArticle;
  }

  static async scrapeSports() {
    const url = `${BASE_URL}/بخش-ورزشی-7`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    $('#specialnews .box-content ul.pl8.pr8 > li').each((i, el) => {
      const a = $(el).find('a').first();
      const href = a.attr('href');
      if (!href) return;
      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = $(el).find('h3.title').text().trim();
      let image = a.find('img').attr('src') || null;
      if (image && !image.startsWith('http')) image = CDN_URL + image;
      const lead = $(el).find('p.lead').text().trim();
      articles.push({ link, title, image, lead });
    });
    // واکشی جزئیات هر خبر
    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);
        // تگ‌ها - استفاده از تابع کمکی
        const tags = extractTagsFromAfkarNews($$);
        article.tags = tags;
        let mainImage = $$('.newsimg-contain img').attr('src');
        if (mainImage && !mainImage.startsWith('http')) mainImage = CDN_URL + mainImage;
        const lead = $$('.lead').text().trim();
        article.title = $$('.fb.title').text().trim() || article.title;
        article.lead = lead || article.lead;
        article.image = mainImage || article.image;
      } catch (err) {
        console.error('AfkarNews: خطا در واکشی جزئیات خبر ورزشی:', article.link, err.message);
      }
    }
    return articles;
  }

  static async scrapeAndSaveSports() {
    const articles = await this.scrapeSports();
    if (!articles.length) throw new Error('هیچ خبر ورزشی یافت نشد.');
    const article = articles[0];
    const exists = await Article.findOne({ where: { sourceUrl: article.link } });
    if (exists) throw new Error('این خبر قبلاً ثبت شده است.');
    const uniqueTags = [...new Set(article.tags)];
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug('sports');
    const agency = await Agency.findOne({ where: { nameEn: 'Afkar News Agency' } });
    if (!agency) throw new Error('آژانس افکار نیوز یافت نشد.');
    const newArticle = await Article.create({
      title: article.title,
      summary: article.lead || '',
      sourceUrl: article.link,
      imageUrl: article.image || null,
      publishedAt: new Date(),
      agencyId: agency.id,
      isActive: true,
      scrapedAt: new Date()
    });
    await newArticle.setTags(tagIds);
    await newArticle.setCategories([category.id]);
    const createdArticle = await Article.findByPk(newArticle.id, {
      include: [
        { model: Agency, as: 'agency', attributes: ['id', 'name', 'logo'] },
        { model: Category, as: 'categories', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
        { model: Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } }
      ]
    });
    return createdArticle;
  }

  static async scrapeEconomy() {
    const url = `${BASE_URL}/بخش-اقتصادی-4`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    $('#specialnews .box-content ul.pl8.pr8 > li').each((i, el) => {
      const a = $(el).find('a').first();
      const href = a.attr('href');
      if (!href) return;
      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = $(el).find('h3.title').text().trim();
      let image = a.find('img').attr('src') || null;
      if (image && !image.startsWith('http')) image = CDN_URL + image;
      const lead = $(el).find('p.lead').text().trim();
      articles.push({ link, title, image, lead });
    });
    // واکشی جزئیات هر خبر
    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);
        let tags = [];
        $$('#keyword a').each((i, el) => {
          const tag = $$(el).text().trim();
          if (tag) tags.push(tag);
        });
        if (tags.length === 0) {
          const metaKeywords = $$('meta[name="keywords"]').attr('content');
          if (metaKeywords) tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
        }
        let mainImage = $$('.newsimg-contain img').attr('src');
        if (mainImage && !mainImage.startsWith('http')) mainImage = CDN_URL + mainImage;
        const lead = $$('.lead').text().trim();
        article.title = $$('.fb.title').text().trim() || article.title;
        article.lead = lead || article.lead;
        article.image = mainImage || article.image;
      } catch (err) {
        console.error('AfkarNews: خطا در واکشی جزئیات خبر اقتصادی:', article.link, err.message);
      }
    }
    return articles;
  }

  static async scrapeAndSaveEconomy() {
    const articles = await this.scrapeEconomy();
    if (!articles.length) throw new Error('هیچ خبر اقتصادی یافت نشد.');
    const article = articles[0];
    const exists = await Article.findOne({ where: { sourceUrl: article.link } });
    if (exists) throw new Error('این خبر قبلاً ثبت شده است.');
    const uniqueTags = [...new Set(article.tags)];
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug('economy');
    const agency = await Agency.findOne({ where: { nameEn: 'Afkar News Agency' } });
    if (!agency) throw new Error('آژانس افکار نیوز یافت نشد.');
    const newArticle = await Article.create({
      title: article.title,
      summary: article.lead || '',
      sourceUrl: article.link,
      imageUrl: article.image || null,
      publishedAt: new Date(),
      agencyId: agency.id,
      isActive: true,
      scrapedAt: new Date()
    });
    await newArticle.setTags(tagIds);
    await newArticle.setCategories([category.id]);
    const createdArticle = await Article.findByPk(newArticle.id, {
      include: [
        { model: Agency, as: 'agency', attributes: ['id', 'name', 'logo'] },
        { model: Category, as: 'categories', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
        { model: Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } }
      ]
    });
    return createdArticle;
  }

  static async scrapeInternational() {
    const url = `${BASE_URL}/بخش-بین-الملل-8`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    $('#specialnews .box-content ul.pl8.pr8 > li').each((i, el) => {
      const a = $(el).find('a').first();
      const href = a.attr('href');
      if (!href) return;
      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = $(el).find('h3.title').text().trim();
      let image = a.find('img').attr('src') || null;
      if (image && !image.startsWith('http')) image = CDN_URL + image;
      const lead = $(el).find('p.lead').text().trim();
      articles.push({ link, title, image, lead });
    });
    // واکشی جزئیات هر خبر
    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);
        let tags = [];
        $$('#keyword a').each((i, el) => {
          const tag = $$(el).text().trim();
          if (tag) tags.push(tag);
        });
        if (tags.length === 0) {
          const metaKeywords = $$('meta[name="keywords"]').attr('content');
          if (metaKeywords) tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
        }
        let mainImage = $$('.newsimg-contain img').attr('src');
        if (mainImage && !mainImage.startsWith('http')) mainImage = CDN_URL + mainImage;
        const lead = $$('.lead').text().trim();
        article.title = $$('.fb.title').text().trim() || article.title;
        article.lead = lead || article.lead;
        article.image = mainImage || article.image;
      } catch (err) {
        console.error('AfkarNews: خطا در واکشی جزئیات خبر بین‌الملل:', article.link, err.message);
      }
    }
    return articles;
  }

  static async scrapeAndSaveInternational() {
    const articles = await this.scrapeInternational();
    if (!articles.length) throw new Error('هیچ خبر بین‌الملل یافت نشد.');
    const article = articles[0];
    const exists = await Article.findOne({ where: { sourceUrl: article.link } });
    if (exists) throw new Error('این خبر قبلاً ثبت شده است.');
    const uniqueTags = [...new Set(article.tags)];
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug('international');
    const agency = await Agency.findOne({ where: { nameEn: 'Afkar News Agency' } });
    if (!agency) throw new Error('آژانس افکار نیوز یافت نشد.');
    const newArticle = await Article.create({
      title: article.title,
      summary: article.lead || '',
      sourceUrl: article.link,
      imageUrl: article.image || null,
      publishedAt: new Date(),
      agencyId: agency.id,
      isActive: true,
      scrapedAt: new Date()
    });
    await newArticle.setTags(tagIds);
    await newArticle.setCategories([category.id]);
    const createdArticle = await Article.findByPk(newArticle.id, {
      include: [
        { model: Agency, as: 'agency', attributes: ['id', 'name', 'logo'] },
        { model: Category, as: 'categories', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
        { model: Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } }
      ]
    });
    return createdArticle;
  }

  static async scrapeSocial() {
    const url = `${BASE_URL}/بخش-اجتماعی-5`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    $('#specialnews .box-content ul.pl8.pr8 > li').each((i, el) => {
      const a = $(el).find('a').first();
      const href = a.attr('href');
      if (!href) return;
      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = $(el).find('h3.title').text().trim();
      let image = a.find('img').attr('src') || null;
      if (image && !image.startsWith('http')) image = CDN_URL + image;
      const lead = $(el).find('p.lead').text().trim();
      articles.push({ link, title, image, lead });
    });
    // واکشی جزئیات هر خبر
    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);
        let tags = [];
        $$('#keyword a').each((i, el) => {
          const tag = $$(el).text().trim();
          if (tag) tags.push(tag);
        });
        if (tags.length === 0) {
          const metaKeywords = $$('meta[name="keywords"]').attr('content');
          if (metaKeywords) tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
        }
        let mainImage = $$('.newsimg-contain img').attr('src');
        if (mainImage && !mainImage.startsWith('http')) mainImage = CDN_URL + mainImage;
        const lead = $$('.lead').text().trim();
        article.title = $$('.fb.title').text().trim() || article.title;
        article.lead = lead || article.lead;
        article.image = mainImage || article.image;
      } catch (err) {
        console.error('AfkarNews: خطا در واکشی جزئیات خبر اجتماعی:', article.link, err.message);
      }
    }
    return articles;
  }

  static async scrapeAndSaveSocial() {
    const articles = await this.scrapeSocial();
    if (!articles.length) throw new Error('هیچ خبر اجتماعی یافت نشد.');
    const article = articles[0];
    const exists = await Article.findOne({ where: { sourceUrl: article.link } });
    if (exists) throw new Error('این خبر قبلاً ثبت شده است.');
    const uniqueTags = [...new Set(article.tags)];
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug('social');
    const agency = await Agency.findOne({ where: { nameEn: 'Afkar News Agency' } });
    if (!agency) throw new Error('آژانس افکار نیوز یافت نشد.');
    const newArticle = await Article.create({
      title: article.title,
      summary: article.lead || '',
      sourceUrl: article.link,
      imageUrl: article.image || null,
      publishedAt: new Date(),
      agencyId: agency.id,
      isActive: true,
      scrapedAt: new Date()
    });
    await newArticle.setTags(tagIds);
    await newArticle.setCategories([category.id]);
    const createdArticle = await Article.findByPk(newArticle.id, {
      include: [
        { model: Agency, as: 'agency', attributes: ['id', 'name', 'logo'] },
        { model: Category, as: 'categories', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
        { model: Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } }
      ]
    });
    return createdArticle;
  }

  static async scrapeCultureArt() {
    const url = `${BASE_URL}/بخش-فرهنگ-هنر-6`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    $('#specialnews .box-content ul.pl8.pr8 > li').each((i, el) => {
      const a = $(el).find('a').first();
      const href = a.attr('href');
      if (!href) return;
      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = $(el).find('h3.title').text().trim();
      let image = a.find('img').attr('src') || null;
      if (image && !image.startsWith('http')) image = CDN_URL + image;
      const lead = $(el).find('p.lead').text().trim();
      articles.push({ link, title, image, lead });
    });
    // واکشی جزئیات هر خبر
    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);
        let tags = [];
        $$('#keyword a').each((i, el) => {
          const tag = $$(el).text().trim();
          if (tag) tags.push(tag);
        });
        if (tags.length === 0) {
          const metaKeywords = $$('meta[name="keywords"]').attr('content');
          if (metaKeywords) tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
        }
        let mainImage = $$('.newsimg-contain img').attr('src');
        if (mainImage && !mainImage.startsWith('http')) mainImage = CDN_URL + mainImage;
        const lead = $$('.lead').text().trim();
        article.title = $$('.fb.title').text().trim() || article.title;
        article.lead = lead || article.lead;
        article.image = mainImage || article.image;
      } catch (err) {
        console.error('AfkarNews: خطا در واکشی جزئیات خبر فرهنگ و هنر:', article.link, err.message);
      }
    }
    return articles;
  }

  static async scrapeAndSaveCultureArt() {
    const articles = await this.scrapeCultureArt();
    if (!articles.length) throw new Error('هیچ خبر فرهنگ و هنر یافت نشد.');
    const article = articles[0];
    const exists = await Article.findOne({ where: { sourceUrl: article.link } });
    if (exists) throw new Error('این خبر قبلاً ثبت شده است.');
    const uniqueTags = [...new Set(article.tags)];
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug('culture-art');
    const agency = await Agency.findOne({ where: { nameEn: 'Afkar News Agency' } });
    if (!agency) throw new Error('آژانس افکار نیوز یافت نشد.');
    const newArticle = await Article.create({
      title: article.title,
      summary: article.lead || '',
      sourceUrl: article.link,
      imageUrl: article.image || null,
      publishedAt: new Date(),
      agencyId: agency.id,
      isActive: true,
      scrapedAt: new Date()
    });
    await newArticle.setTags(tagIds);
    await newArticle.setCategories([category.id]);
    const createdArticle = await Article.findByPk(newArticle.id, {
      include: [
        { model: Agency, as: 'agency', attributes: ['id', 'name', 'logo'] },
        { model: Category, as: 'categories', attributes: ['id', 'name', 'slug'], through: { attributes: [] } },
        { model: Tag, as: 'tags', attributes: ['id', 'name'], through: { attributes: [] } }
      ]
    });
    return createdArticle;
  }
}

module.exports = AfkarNewsScraper; 
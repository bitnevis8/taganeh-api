const axios = require('axios');
const cheerio = require('cheerio');
const Article = require('../../article/model');
const Tag = require('../../tag/model');
const Category = require('../../category/model');
const Agency = require('../../agency/model');

const BASE_URL = 'https://www.parsnews.com';

// Helper to get category by slug
async function getCategoryBySlug(slug) {
  const category = await Category.findOne({ where: { slug } });
  if (!category) throw new Error(`دسته با slug ${slug} یافت نشد.`);
  return category;
}

class ParsNewsScraper {
  static async scrapePolitics() {
    const url = `${BASE_URL}/بخش-سیاسی-3`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    // لیست اخبار اصلی بخش سیاسی
    $('.landing-list li.myBox').each((i, el) => {
      const a = $(el).find('.bargozide-img a, .bargozide-content h2 a').first();
      const href = a.attr('href');
      if (!href) return;
      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = a.text().trim();
      let image = $(el).find('.bargozide-img img').attr('src') || null;
      if (image && !image.startsWith('http')) image = BASE_URL + image;
      const lead = $(el).find('.bargozide-lead').text().trim();
      articles.push({ link, title, image, lead });
    });
    // واکشی جزئیات هر خبر
    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);
        // تگ‌ها
        let tags = [];
        const metaKeywords = $$('meta[name="keywords"]').attr('content');
        if (metaKeywords) tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
        // تصویر اصلی
        let mainImage = $$('meta[property="og:image"]').attr('content') || $$('img.res-img').attr('src');
        if (mainImage && !mainImage.startsWith('http')) mainImage = BASE_URL + mainImage;
        // لید
        const lead = $$('meta[property="og:description"]').attr('content') || article.lead;
        // متن خبر
        let body = '';
        $$('.news-body p').each((i, el) => {
          body += $$(el).text().trim() + '\n';
        });
        article.title = $$('meta[property="og:title"]').attr('content') || article.title;
        article.lead = lead || article.lead;
        article.image = mainImage || article.image;
        article.tags = [...new Set(tags)];
      } catch (err) {
        console.error('ParsNews: خطا در واکشی جزئیات خبر سیاسی:', article.link, err.message);
      }
    }
    return articles;
  }

  static async scrapeAndSavePolitics() {
    const articles = await this.scrapePolitics();
    if (!articles.length) throw new Error('هیچ خبر سیاسی یافت نشد.');
    const article = articles[0];
    const exists = await Article.findOne({ where: { sourceUrl: article.link } });
    if (exists) throw new Error('این خبر قبلاً ثبت شده است.');
    const uniqueTags = [...new Set(article.tags)];
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug('politics');
    const agency = await Agency.findOne({ where: { nameEn: 'Pars News Agency' } });
    if (!agency) throw new Error('آژانس پارس نیوز یافت نشد.');
    const newArticle = await Article.create({
      title: article.title,
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
    $('.landing-list li.myBox').each((i, el) => {
      const a = $(el).find('.bargozide-img a, .bargozide-content h2 a').first();
      const href = a.attr('href');
      if (!href) return;
      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = a.text().trim();
      let image = $(el).find('.bargozide-img img').attr('src') || null;
      if (image && !image.startsWith('http')) image = BASE_URL + image;
      const lead = $(el).find('.bargozide-lead').text().trim();
      articles.push({ link, title, image, lead });
    });
    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);
        let tags = [];
        const metaKeywords = $$('meta[name="keywords"]').attr('content');
        if (metaKeywords) tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
        let mainImage = $$('meta[property="og:image"]').attr('content') || $$('img.res-img').attr('src');
        if (mainImage && !mainImage.startsWith('http')) mainImage = BASE_URL + mainImage;
        const lead = $$('meta[property="og:description"]').attr('content') || article.lead;
        let body = '';
        $$('.news-body p').each((i, el) => {
          body += $$(el).text().trim() + '\n';
        });
        article.title = $$('meta[property="og:title"]').attr('content') || article.title;
        article.lead = lead || article.lead;
        article.image = mainImage || article.image;
        article.tags = [...new Set(tags)];
      } catch (err) {
        console.error('ParsNews: خطا در واکشی جزئیات خبر بین الملل:', article.link, err.message);
      }
    }
    return articles;
  }

  static async scrapeAndSaveInternational() {
    const articles = await this.scrapeInternational();
    if (!articles.length) throw new Error('هیچ خبر بین الملل یافت نشد.');
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
    const agency = await Agency.findOne({ where: { nameEn: 'Pars News Agency' } });
    if (!agency) throw new Error('آژانس پارس نیوز یافت نشد.');
    const newArticle = await Article.create({
      title: article.title,
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
    $('.landing-list li.myBox').each((i, el) => {
      const a = $(el).find('.bargozide-img a, .bargozide-content h2 a').first();
      const href = a.attr('href');
      if (!href) return;
      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = a.text().trim();
      let image = $(el).find('.bargozide-img img').attr('src') || null;
      if (image && !image.startsWith('http')) image = BASE_URL + image;
      const lead = $(el).find('.bargozide-lead').text().trim();
      articles.push({ link, title, image, lead });
    });
    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);
        let tags = [];
        const metaKeywords = $$('meta[name="keywords"]').attr('content');
        if (metaKeywords) tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
        let mainImage = $$('meta[property="og:image"]').attr('content') || $$('img.res-img').attr('src');
        if (mainImage && !mainImage.startsWith('http')) mainImage = BASE_URL + mainImage;
        const lead = $$('meta[property="og:description"]').attr('content') || article.lead;
        let body = '';
        $$('.news-body p').each((i, el) => {
          body += $$(el).text().trim() + '\n';
        });
        article.title = $$('meta[property="og:title"]').attr('content') || article.title;
        article.lead = lead || article.lead;
        article.image = mainImage || article.image;
        article.tags = [...new Set(tags)];
      } catch (err) {
        console.error('ParsNews: خطا در واکشی جزئیات خبر اقتصادی:', article.link, err.message);
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
    const agency = await Agency.findOne({ where: { nameEn: 'Pars News Agency' } });
    if (!agency) throw new Error('آژانس پارس نیوز یافت نشد.');
    const newArticle = await Article.create({
      title: article.title,
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
    $('.landing-list li.myBox').each((i, el) => {
      const a = $(el).find('.bargozide-img a, .bargozide-content h2 a').first();
      const href = a.attr('href');
      if (!href) return;
      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = a.text().trim();
      let image = $(el).find('.bargozide-img img').attr('src') || null;
      if (image && !image.startsWith('http')) image = BASE_URL + image;
      const lead = $(el).find('.bargozide-lead').text().trim();
      articles.push({ link, title, image, lead });
    });
    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);
        let tags = [];
        const metaKeywords = $$('meta[name="keywords"]').attr('content');
        if (metaKeywords) tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
        let mainImage = $$('meta[property="og:image"]').attr('content') || $$('img.res-img').attr('src');
        if (mainImage && !mainImage.startsWith('http')) mainImage = BASE_URL + mainImage;
        const lead = $$('meta[property="og:description"]').attr('content') || article.lead;
        let body = '';
        $$('.news-body p').each((i, el) => {
          body += $$(el).text().trim() + '\n';
        });
        article.title = $$('meta[property="og:title"]').attr('content') || article.title;
        article.lead = lead || article.lead;
        article.image = mainImage || article.image;
        article.tags = [...new Set(tags)];
      } catch (err) {
        console.error('ParsNews: خطا در واکشی جزئیات خبر اجتماعی:', article.link, err.message);
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
    const agency = await Agency.findOne({ where: { nameEn: 'Pars News Agency' } });
    if (!agency) throw new Error('آژانس پارس نیوز یافت نشد.');
    const newArticle = await Article.create({
      title: article.title,
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

  static async scrapeSports() {
    const url = `${BASE_URL}/بخش-ورزشی-7`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    $('.landing-list li.myBox').each((i, el) => {
      const a = $(el).find('.bargozide-img a, .bargozide-content h2 a').first();
      const href = a.attr('href');
      if (!href) return;
      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = a.text().trim();
      let image = $(el).find('.bargozide-img img').attr('src') || null;
      if (image && !image.startsWith('http')) image = BASE_URL + image;
      const lead = $(el).find('.bargozide-lead').text().trim();
      articles.push({ link, title, image, lead });
    });
    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);
        let tags = [];
        const metaKeywords = $$('meta[name="keywords"]').attr('content');
        if (metaKeywords) tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
        let mainImage = $$('meta[property="og:image"]').attr('content') || $$('img.res-img').attr('src');
        if (mainImage && !mainImage.startsWith('http')) mainImage = BASE_URL + mainImage;
        const lead = $$('meta[property="og:description"]').attr('content') || article.lead;
        let body = '';
        $$('.news-body p').each((i, el) => {
          body += $$(el).text().trim() + '\n';
        });
        article.title = $$('meta[property="og:title"]').attr('content') || article.title;
        article.lead = lead || article.lead;
        article.image = mainImage || article.image;
        article.tags = [...new Set(tags)];
      } catch (err) {
        console.error('ParsNews: خطا در واکشی جزئیات خبر ورزشی:', article.link, err.message);
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
    const agency = await Agency.findOne({ where: { nameEn: 'Pars News Agency' } });
    if (!agency) throw new Error('آژانس پارس نیوز یافت نشد.');
    const newArticle = await Article.create({
      title: article.title,
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
    const url = `${BASE_URL}/بخش-فرهنگی-6`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    $('.landing-list li.myBox').each((i, el) => {
      const a = $(el).find('.bargozide-img a, .bargozide-content h2 a').first();
      const href = a.attr('href');
      if (!href) return;
      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = a.text().trim();
      let image = $(el).find('.bargozide-img img').attr('src') || null;
      if (image && !image.startsWith('http')) image = BASE_URL + image;
      const lead = $(el).find('.bargozide-lead').text().trim();
      articles.push({ link, title, image, lead });
    });
    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);
        let tags = [];
        const metaKeywords = $$('meta[name="keywords"]').attr('content');
        if (metaKeywords) tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
        let mainImage = $$('meta[property="og:image"]').attr('content') || $$('img.res-img').attr('src');
        if (mainImage && !mainImage.startsWith('http')) mainImage = BASE_URL + mainImage;
        const lead = $$('meta[property="og:description"]').attr('content') || article.lead;
        let body = '';
        $$('.news-body p').each((i, el) => {
          body += $$(el).text().trim() + '\n';
        });
        article.title = $$('meta[property="og:title"]').attr('content') || article.title;
        article.lead = lead || article.lead;
        article.image = mainImage || article.image;
        article.tags = [...new Set(tags)];
      } catch (err) {
        console.error('ParsNews: خطا در واکشی جزئیات خبر فرهنگ و هنر:', article.link, err.message);
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
    const agency = await Agency.findOne({ where: { nameEn: 'Pars News Agency' } });
    if (!agency) throw new Error('آژانس پارس نیوز یافت نشد.');
    const newArticle = await Article.create({
      title: article.title,
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

module.exports = ParsNewsScraper; 
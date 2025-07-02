const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment-jalaali");
const Article = require("../../article/model");
const Tag = require("../../tag/model");
const Category = require("../../category/model");
const Agency = require("../../agency/model");

const BASE_URL = "https://www.mashreghnews.ir";

function parseMashreghDate() {
  // مشرق نیوز معمولاً تاریخ را در متا یا صفحه قرار نمی‌دهد، پس فعلاً زمان فعلی
  const now = moment();
  return {
    publishedAt: now.toISOString(),
    publishedAtJalali: now.format('jYYYY/jMM/jDD HH:mm'),
    publishedAtRelative: now.fromNow(),
  };
}

async function getCategoryBySlug(slug) {
  const category = await Category.findOne({ where: { slug } });
  if (!category) throw new Error(`دسته با slug ${slug} یافت نشد.`);
  return category;
}

async function getAgencyByNameEn(nameEn) {
  const agency = await Agency.findOne({ where: { nameEn } });
  if (!agency) throw new Error(`آژانس با نام انگلیسی ${nameEn} یافت نشد.`);
  return agency;
}

function deduplicateTags(tags) {
  return [...new Set(tags)];
}

class MashreghNewsScraper {
  async scrapePolitics() {
    const url = `${BASE_URL}/service/political-news`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر سیاست فقط از بخش تازه‌های سیاست
    let href = $('#box41 ul li.news .desc h3 a').first().attr('href');
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = href.startsWith("http") ? href : BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('title').text().trim();
    // خلاصه
    const summary = $$('meta[name="description"]').attr('content') || '';
    // عکس شاخص
    const image = $$('meta[property="og:image"]').attr('content') || '';
    // تاریخ انتشار
    let publishedAt = $$('meta[property="article:published_time"]').attr('content') ||
                      $$('meta[itemprop="datePublished"]').attr('content') ||
                      $$('meta[property="nastooh:publishDate"]').attr('content') ||
                      $$('meta[name="date"]').attr('content');
    let publishedAtJalali = null, publishedAtRelative = null;
    if (publishedAt) {
      if (/T\d{2}:\d{2}:\d{2}/.test(publishedAt)) {
        publishedAtJalali = moment(publishedAt).format('jYYYY/jMM/jDD HH:mm');
        publishedAtRelative = moment(publishedAt).fromNow();
      } else {
        publishedAtJalali = moment(publishedAt, 'YYYY-MM-DD').format('jYYYY/jMM/jDD');
        publishedAtRelative = moment(publishedAt, 'YYYY-MM-DD').fromNow();
      }
    } else {
      const now = moment();
      publishedAt = now.toISOString();
      publishedAtJalali = now.format('jYYYY/jMM/jDD HH:mm');
      publishedAtRelative = now.fromNow();
    }
    // تگ‌ها (keywords)
    let tags = [];
    const keywords = $$('meta[name="keywords"]').attr('content') || $$('meta[property="article:tag"]').attr('content');
    if (keywords) {
      tags = keywords.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [{
      title,
      link,
      summary,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Mashregh News",
      category: "politics"
    }];
  }

  async scrapeAndSavePolitics() {
    const articles = await this.scrapePolitics();
    if (!articles.length) throw new Error("No politics article found");
    const news = articles[0];
    // جلوگیری از ذخیره تکراری
    const exists = await Article.findOne({ where: { sourceUrl: news.link } });
    if (exists) throw new Error("این خبر قبلاً ثبت شده است.");
    const uniqueTags = deduplicateTags(news.tags);
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug("politics");
    const agency = await getAgencyByNameEn("Mashregh News");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedAt || new Date(),
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

  async scrapeCultureArt() {
    const url = `${BASE_URL}/service/culture-news`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر فرهنگ و هنر فقط از بخش اصلی
    let href = $('section.box.list ul li.news .desc h3 a').first().attr('href');
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = href.startsWith("http") ? href : BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('title').text().trim();
    // خلاصه
    const summary = $$('meta[name="description"]').attr('content') || '';
    // عکس شاخص
    const image = $$('meta[property="og:image"]').attr('content') || '';
    // تاریخ انتشار
    let publishedAt = $$('meta[property="article:published_time"]').attr('content') || $$('meta[itemprop="datePublished"]').attr('content') || $$('meta[property="nastooh:publishDate"]').attr('content') || $$('meta[name="date"]').attr('content');
    let publishedAtJalali = null, publishedAtRelative = null;
    if (publishedAt) {
      if (/T\d{2}:\d{2}:\d{2}/.test(publishedAt)) {
        publishedAtJalali = moment(publishedAt).format('jYYYY/jMM/jDD HH:mm');
        publishedAtRelative = moment(publishedAt).fromNow();
      } else {
        publishedAtJalali = moment(publishedAt, 'YYYY-MM-DD').format('jYYYY/jMM/jDD');
        publishedAtRelative = moment(publishedAt, 'YYYY-MM-DD').fromNow();
      }
    } else {
      const now = moment();
      publishedAt = now.toISOString();
      publishedAtJalali = now.format('jYYYY/jMM/jDD HH:mm');
      publishedAtRelative = now.fromNow();
    }
    // تگ‌ها (keywords)
    let tags = [];
    const keywords = $$('meta[name="keywords"]').attr('content') || $$('meta[property="article:tag"]').attr('content');
    if (keywords) {
      tags = keywords.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [{
      title,
      link,
      summary,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Mashregh News",
      category: "culture-art"
    }];
  }

  async scrapeAndSaveCultureArt() {
    const articles = await this.scrapeCultureArt();
    if (!articles.length) throw new Error("No culture-art article found");
    const news = articles[0];
    // جلوگیری از ذخیره تکراری
    const exists = await Article.findOne({ where: { sourceUrl: news.link } });
    if (exists) throw new Error("این خبر قبلاً ثبت شده است.");
    const uniqueTags = deduplicateTags(news.tags);
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug("culture-art");
    const agency = await getAgencyByNameEn("Mashregh News");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedAt || new Date(),
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

  async scrapeInternational() {
    const url = `${BASE_URL}/service/world-news`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر بین‌الملل فقط از بخش اصلی
    let href = $('section.box.list ul li.news .desc h3 a').first().attr('href');
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = href.startsWith("http") ? href : BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('title').text().trim();
    // خلاصه
    const summary = $$('meta[name="description"]').attr('content') || '';
    // عکس شاخص
    const image = $$('meta[property="og:image"]').attr('content') || '';
    // تاریخ انتشار
    let publishedAt = $$('meta[property="article:published_time"]').attr('content') || $$('meta[itemprop="datePublished"]').attr('content') || $$('meta[property="nastooh:publishDate"]').attr('content') || $$('meta[name="date"]').attr('content');
    let publishedAtJalali = null, publishedAtRelative = null;
    if (publishedAt) {
      if (/T\d{2}:\d{2}:\d{2}/.test(publishedAt)) {
        publishedAtJalali = moment(publishedAt).format('jYYYY/jMM/jDD HH:mm');
        publishedAtRelative = moment(publishedAt).fromNow();
      } else {
        publishedAtJalali = moment(publishedAt, 'YYYY-MM-DD').format('jYYYY/jMM/jDD');
        publishedAtRelative = moment(publishedAt, 'YYYY-MM-DD').fromNow();
      }
    } else {
      const now = moment();
      publishedAt = now.toISOString();
      publishedAtJalali = now.format('jYYYY/jMM/jDD HH:mm');
      publishedAtRelative = now.fromNow();
    }
    // تگ‌ها (keywords)
    let tags = [];
    const keywords = $$('meta[name="keywords"]').attr('content') || $$('meta[property="article:tag"]').attr('content');
    if (keywords) {
      tags = keywords.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [{
      title,
      link,
      summary,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Mashregh News",
      category: "international"
    }];
  }

  async scrapeAndSaveInternational() {
    const articles = await this.scrapeInternational();
    if (!articles.length) throw new Error("No international article found");
    const news = articles[0];
    // جلوگیری از ذخیره تکراری
    const exists = await Article.findOne({ where: { sourceUrl: news.link } });
    if (exists) throw new Error("این خبر قبلاً ثبت شده است.");
    const uniqueTags = deduplicateTags(news.tags);
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug("international");
    const agency = await getAgencyByNameEn("Mashregh News");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedAt || new Date(),
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

  async scrapeSocial() {
    const url = `${BASE_URL}/service/social-news`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر اجتماعی فقط از بخش اصلی
    let href = $('section.box.list ul li.news .desc h3 a').first().attr('href');
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = href.startsWith("http") ? href : BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('title').text().trim();
    // خلاصه
    const summary = $$('meta[name="description"]').attr('content') || '';
    // عکس شاخص
    const image = $$('meta[property="og:image"]').attr('content') || '';
    // تاریخ انتشار
    let publishedAt = $$('meta[property="article:published_time"]').attr('content') || $$('meta[itemprop="datePublished"]').attr('content') || $$('meta[property="nastooh:publishDate"]').attr('content') || $$('meta[name="date"]').attr('content');
    let publishedAtJalali = null, publishedAtRelative = null;
    if (publishedAt) {
      if (/T\d{2}:\d{2}:\d{2}/.test(publishedAt)) {
        publishedAtJalali = moment(publishedAt).format('jYYYY/jMM/jDD HH:mm');
        publishedAtRelative = moment(publishedAt).fromNow();
      } else {
        publishedAtJalali = moment(publishedAt, 'YYYY-MM-DD').format('jYYYY/jMM/jDD');
        publishedAtRelative = moment(publishedAt, 'YYYY-MM-DD').fromNow();
      }
    } else {
      const now = moment();
      publishedAt = now.toISOString();
      publishedAtJalali = now.format('jYYYY/jMM/jDD HH:mm');
      publishedAtRelative = now.fromNow();
    }
    // تگ‌ها (keywords)
    let tags = [];
    const keywords = $$('meta[name="keywords"]').attr('content') || $$('meta[property="article:tag"]').attr('content');
    if (keywords) {
      tags = keywords.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [{
      title,
      link,
      summary,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Mashregh News",
      category: "social"
    }];
  }

  async scrapeAndSaveSocial() {
    const articles = await this.scrapeSocial();
    if (!articles.length) throw new Error("No social article found");
    const news = articles[0];
    // جلوگیری از ذخیره تکراری
    const exists = await Article.findOne({ where: { sourceUrl: news.link } });
    if (exists) throw new Error("این خبر قبلاً ثبت شده است.");
    const uniqueTags = deduplicateTags(news.tags);
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug("social");
    const agency = await getAgencyByNameEn("Mashregh News");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedAt || new Date(),
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

  async scrapeEconomy() {
    const url = `${BASE_URL}/service/economic-news`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر اقتصادی فقط از بخش اصلی
    let href = $('section.box.list ul li.news .desc h3 a').first().attr('href');
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = href.startsWith("http") ? href : BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('title').text().trim();
    // خلاصه
    const summary = $$('meta[name="description"]').attr('content') || '';
    // عکس شاخص
    const image = $$('meta[property="og:image"]').attr('content') || '';
    // تاریخ انتشار
    let publishedAt = $$('meta[property="article:published_time"]').attr('content') || $$('meta[itemprop="datePublished"]').attr('content') || $$('meta[property="nastooh:publishDate"]').attr('content') || $$('meta[name="date"]').attr('content');
    let publishedAtJalali = null, publishedAtRelative = null;
    if (publishedAt) {
      if (/T\d{2}:\d{2}:\d{2}/.test(publishedAt)) {
        publishedAtJalali = moment(publishedAt).format('jYYYY/jMM/jDD HH:mm');
        publishedAtRelative = moment(publishedAt).fromNow();
      } else {
        publishedAtJalali = moment(publishedAt, 'YYYY-MM-DD').format('jYYYY/jMM/jDD');
        publishedAtRelative = moment(publishedAt, 'YYYY-MM-DD').fromNow();
      }
    } else {
      const now = moment();
      publishedAt = now.toISOString();
      publishedAtJalali = now.format('jYYYY/jMM/jDD HH:mm');
      publishedAtRelative = now.fromNow();
    }
    // تگ‌ها (keywords)
    let tags = [];
    const keywords = $$('meta[name="keywords"]').attr('content') || $$('meta[property="article:tag"]').attr('content');
    if (keywords) {
      tags = keywords.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [{
      title,
      link,
      summary,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Mashregh News",
      category: "economy"
    }];
  }

  async scrapeAndSaveEconomy() {
    const articles = await this.scrapeEconomy();
    if (!articles.length) throw new Error("No economy article found");
    const news = articles[0];
    // جلوگیری از ذخیره تکراری
    const exists = await Article.findOne({ where: { sourceUrl: news.link } });
    if (exists) throw new Error("این خبر قبلاً ثبت شده است.");
    const uniqueTags = deduplicateTags(news.tags);
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug("economy");
    const agency = await getAgencyByNameEn("Mashregh News");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedAt || new Date(),
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

  async scrapeSports() {
    const url = `${BASE_URL}/service/sports-news`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر ورزشی فقط از بخش اصلی
    let href = $('section.box.list ul li.news .desc h3 a').first().attr('href');
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = href.startsWith("http") ? href : BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('title').text().trim();
    // خلاصه
    const summary = $$('meta[name="description"]').attr('content') || '';
    // عکس شاخص
    const image = $$('meta[property="og:image"]').attr('content') || '';
    // تاریخ انتشار
    let publishedAt = $$('meta[property="article:published_time"]').attr('content') || $$('meta[itemprop="datePublished"]').attr('content') || $$('meta[property="nastooh:publishDate"]').attr('content') || $$('meta[name="date"]').attr('content');
    let publishedAtJalali = null, publishedAtRelative = null;
    if (publishedAt) {
      if (/T\d{2}:\d{2}:\d{2}/.test(publishedAt)) {
        publishedAtJalali = moment(publishedAt).format('jYYYY/jMM/jDD HH:mm');
        publishedAtRelative = moment(publishedAt).fromNow();
      } else {
        publishedAtJalali = moment(publishedAt, 'YYYY-MM-DD').format('jYYYY/jMM/jDD');
        publishedAtRelative = moment(publishedAt, 'YYYY-MM-DD').fromNow();
      }
    } else {
      const now = moment();
      publishedAt = now.toISOString();
      publishedAtJalali = now.format('jYYYY/jMM/jDD HH:mm');
      publishedAtRelative = now.fromNow();
    }
    // تگ‌ها (keywords)
    let tags = [];
    const keywords = $$('meta[name="keywords"]').attr('content') || $$('meta[property="article:tag"]').attr('content');
    if (keywords) {
      tags = keywords.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [{
      title,
      link,
      summary,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Mashregh News",
      category: "sports"
    }];
  }

  async scrapeAndSaveSports() {
    const articles = await this.scrapeSports();
    if (!articles.length) throw new Error("No sports article found");
    const news = articles[0];
    // جلوگیری از ذخیره تکراری
    const exists = await Article.findOne({ where: { sourceUrl: news.link } });
    if (exists) throw new Error("این خبر قبلاً ثبت شده است.");
    const uniqueTags = deduplicateTags(news.tags);
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug("sports");
    const agency = await getAgencyByNameEn("Mashregh News");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedAt || new Date(),
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

module.exports = new MashreghNewsScraper(); 
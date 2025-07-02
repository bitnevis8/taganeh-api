const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment-jalaali");
const Article = require("../../article/model");
const Tag = require("../../tag/model");
const Category = require("../../category/model");
const Agency = require("../../agency/model");

const BASE_URL = "https://www.ettelaat.com";

function faToEnDigits(str) {
  if (!str) return str;
  return str.replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
}

function deduplicateTags(tags) {
  return [...new Set(tags)];
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

function parseEttelaatDate(dateStr) {
  // Ettelaat may not show date on list, so we may need to fetch from article page
  // Placeholder: return nulls for now
  return { publishedAt: null, publishedAtJalali: null, publishedAtRelative: null };
}

class EttelaatScraper {
  async scrapePolitics() {
    const url = `${BASE_URL}/service/politics`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر
    const firstArticle = $("section.box ul li").first();
    const a = firstArticle.find("h3 a").first();
    const href = a.attr("href");
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = href.startsWith("http") ? href : BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('h1').text().trim();
    // خلاصه (در صورت وجود)
    const summary = $$('meta[name="description"]').attr('content') || '';
    // عکس شاخص
    const image = $$('meta[property="og:image"]').attr('content') || $$('img').first().attr('src');
    // تگ‌ها (در صورت وجود)
    let tags = [];
    let metaKeywords = $$('meta[name="keywords"]').attr('content') || $$('meta[property="article:tag"]').attr('content');
    if (metaKeywords) {
      tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
    }
    // تاریخ انتشار (در صورت وجود)
    let publishedAt = $$('meta[property="article:published_time"]').attr('content');
    let publishedAtJalali = null, publishedAtRelative = null;
    if (publishedAt) {
      const m = moment(publishedAt).utcOffset('+03:30');
      publishedAtJalali = m.format('jYYYY/jMM/jDD HH:mm');
      publishedAtRelative = m.fromNow();
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
      agency: "Ettelaat News Agency",
      category: "politics"
    }];
  }

  async scrapeAndSavePolitics() {
    const articles = await this.scrapePolitics();
    if (!articles.length) throw new Error("No article found");
    const news = articles[0];
    const exists = await Article.findOne({ where: { sourceUrl: news.link } });
    if (exists) throw new Error("این خبر قبلاً ثبت شده است.");
    const uniqueTags = deduplicateTags(news.tags);
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug("politics");
    const agency = await getAgencyByNameEn("Ettelaat News Agency");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedAt,
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
    const url = `${BASE_URL}/service/economy`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر
    const firstArticle = $("section.box ul li").first();
    const a = firstArticle.find("h3 a").first();
    const href = a.attr("href");
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = href.startsWith("http") ? href : BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('h1').text().trim();
    // خلاصه (در صورت وجود)
    const summary = $$('meta[name="description"]').attr('content') || '';
    // عکس شاخص
    const image = $$('meta[property="og:image"]').attr('content') || $$('img').first().attr('src');
    // تگ‌ها (در صورت وجود)
    let tags = [];
    let metaKeywords = $$('meta[name="keywords"]').attr('content') || $$('meta[property="article:tag"]').attr('content');
    if (metaKeywords) {
      tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
    }
    // تاریخ انتشار (در صورت وجود)
    let publishedAt = $$('meta[property="article:published_time"]').attr('content');
    let publishedAtJalali = null, publishedAtRelative = null;
    if (publishedAt) {
      const m = moment(publishedAt).utcOffset('+03:30');
      publishedAtJalali = m.format('jYYYY/jMM/jDD HH:mm');
      publishedAtRelative = m.fromNow();
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
      agency: "Ettelaat News Agency",
      category: "economy"
    }];
  }

  async scrapeAndSaveEconomy() {
    const articles = await this.scrapeEconomy();
    if (!articles.length) throw new Error("No article found");
    const news = articles[0];
    const exists = await Article.findOne({ where: { sourceUrl: news.link } });
    if (exists) throw new Error("این خبر قبلاً ثبت شده است.");
    const uniqueTags = deduplicateTags(news.tags);
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug("economy");
    const agency = await getAgencyByNameEn("Ettelaat News Agency");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedAt,
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
    const url = `${BASE_URL}/service/sports`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر
    const firstArticle = $("section.box ul li").first();
    const a = firstArticle.find("h3 a").first();
    const href = a.attr("href");
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = href.startsWith("http") ? href : BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('h1').text().trim();
    // خلاصه (در صورت وجود)
    const summary = $$('meta[name="description"]').attr('content') || '';
    // عکس شاخص
    const image = $$('meta[property="og:image"]').attr('content') || $$('img').first().attr('src');
    // تگ‌ها (در صورت وجود)
    let tags = [];
    let metaKeywords = $$('meta[name="keywords"]').attr('content') || $$('meta[property="article:tag"]').attr('content');
    if (metaKeywords) {
      tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
    }
    // تاریخ انتشار (در صورت وجود)
    let publishedAt = $$('meta[property="article:published_time"]').attr('content');
    let publishedAtJalali = null, publishedAtRelative = null;
    if (publishedAt) {
      const m = moment(publishedAt).utcOffset('+03:30');
      publishedAtJalali = m.format('jYYYY/jMM/jDD HH:mm');
      publishedAtRelative = m.fromNow();
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
      agency: "Ettelaat News Agency",
      category: "sports"
    }];
  }

  async scrapeAndSaveSports() {
    const articles = await this.scrapeSports();
    if (!articles.length) throw new Error("No article found");
    const news = articles[0];
    const exists = await Article.findOne({ where: { sourceUrl: news.link } });
    if (exists) throw new Error("این خبر قبلاً ثبت شده است.");
    const uniqueTags = deduplicateTags(news.tags);
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug("sports");
    const agency = await getAgencyByNameEn("Ettelaat News Agency");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedAt,
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
    const url = `${BASE_URL}/service/world`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر
    const firstArticle = $("section.box ul li").first();
    const a = firstArticle.find("h3 a").first();
    const href = a.attr("href");
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = href.startsWith("http") ? href : BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('h1').text().trim();
    // خلاصه (در صورت وجود)
    const summary = $$('meta[name="description"]').attr('content') || '';
    // عکس شاخص
    const image = $$('meta[property="og:image"]').attr('content') || $$('img').first().attr('src');
    // تگ‌ها (در صورت وجود)
    let tags = [];
    let metaKeywords = $$('meta[name="keywords"]').attr('content') || $$('meta[property="article:tag"]').attr('content');
    if (metaKeywords) {
      tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
    }
    // تاریخ انتشار (در صورت وجود)
    let publishedAt = $$('meta[property="article:published_time"]').attr('content');
    let publishedAtJalali = null, publishedAtRelative = null;
    if (publishedAt) {
      const m = moment(publishedAt).utcOffset('+03:30');
      publishedAtJalali = m.format('jYYYY/jMM/jDD HH:mm');
      publishedAtRelative = m.fromNow();
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
      agency: "Ettelaat News Agency",
      category: "international"
    }];
  }

  async scrapeAndSaveInternational() {
    const articles = await this.scrapeInternational();
    if (!articles.length) throw new Error("No article found");
    const news = articles[0];
    const exists = await Article.findOne({ where: { sourceUrl: news.link } });
    if (exists) throw new Error("این خبر قبلاً ثبت شده است.");
    const uniqueTags = deduplicateTags(news.tags);
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug("international");
    const agency = await getAgencyByNameEn("Ettelaat News Agency");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedAt,
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
    const url = `${BASE_URL}/service/culture`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر
    const firstArticle = $("section.box ul li").first();
    const a = firstArticle.find("h3 a").first();
    const href = a.attr("href");
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = href.startsWith("http") ? href : BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('h1').text().trim();
    // خلاصه (در صورت وجود)
    const summary = $$('meta[name="description"]').attr('content') || '';
    // عکس شاخص
    const image = $$('meta[property="og:image"]').attr('content') || $$('img').first().attr('src');
    // تگ‌ها (در صورت وجود)
    let tags = [];
    let metaKeywords = $$('meta[name="keywords"]').attr('content') || $$('meta[property="article:tag"]').attr('content');
    if (metaKeywords) {
      tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
    }
    // تاریخ انتشار (در صورت وجود)
    let publishedAt = $$('meta[property="article:published_time"]').attr('content');
    let publishedAtJalali = null, publishedAtRelative = null;
    if (publishedAt) {
      const m = moment(publishedAt).utcOffset('+03:30');
      publishedAtJalali = m.format('jYYYY/jMM/jDD HH:mm');
      publishedAtRelative = m.fromNow();
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
      agency: "Ettelaat News Agency",
      category: "culture-art"
    }];
  }

  async scrapeAndSaveCultureArt() {
    const articles = await this.scrapeCultureArt();
    if (!articles.length) throw new Error("No article found");
    const news = articles[0];
    const exists = await Article.findOne({ where: { sourceUrl: news.link } });
    if (exists) throw new Error("این خبر قبلاً ثبت شده است.");
    const uniqueTags = deduplicateTags(news.tags);
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug("culture-art");
    const agency = await getAgencyByNameEn("Ettelaat News Agency");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedAt,
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
    const url = `${BASE_URL}/service/society`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر
    const firstArticle = $("section.box ul li").first();
    const a = firstArticle.find("h3 a").first();
    const href = a.attr("href");
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = href.startsWith("http") ? href : BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('h1').text().trim();
    // خلاصه (در صورت وجود)
    const summary = $$('meta[name="description"]').attr('content') || '';
    // عکس شاخص
    const image = $$('meta[property="og:image"]').attr('content') || $$('img').first().attr('src');
    // تگ‌ها (در صورت وجود)
    let tags = [];
    let metaKeywords = $$('meta[name="keywords"]').attr('content') || $$('meta[property="article:tag"]').attr('content');
    if (metaKeywords) {
      tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
    }
    // تاریخ انتشار (در صورت وجود)
    let publishedAt = $$('meta[property="article:published_time"]').attr('content');
    let publishedAtJalali = null, publishedAtRelative = null;
    if (publishedAt) {
      const m = moment(publishedAt).utcOffset('+03:30');
      publishedAtJalali = m.format('jYYYY/jMM/jDD HH:mm');
      publishedAtRelative = m.fromNow();
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
      agency: "Ettelaat News Agency",
      category: "social"
    }];
  }

  async scrapeAndSaveSocial() {
    const articles = await this.scrapeSocial();
    if (!articles.length) throw new Error("No article found");
    const news = articles[0];
    const exists = await Article.findOne({ where: { sourceUrl: news.link } });
    if (exists) throw new Error("این خبر قبلاً ثبت شده است.");
    const uniqueTags = deduplicateTags(news.tags);
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug("social");
    const agency = await getAgencyByNameEn("Ettelaat News Agency");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedAt,
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

  async scrapeScienceTech() {
    const url = `${BASE_URL}/service/life`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر
    const firstArticle = $("section.box ul li").first();
    const a = firstArticle.find("h3 a").first();
    const href = a.attr("href");
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = href.startsWith("http") ? href : BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('h1').text().trim();
    // خلاصه (در صورت وجود)
    const summary = $$('meta[name="description"]').attr('content') || '';
    // عکس شاخص
    const image = $$('meta[property="og:image"]').attr('content') || $$('img').first().attr('src');
    // تگ‌ها (در صورت وجود)
    let tags = [];
    let metaKeywords = $$('meta[name="keywords"]').attr('content') || $$('meta[property="article:tag"]').attr('content');
    if (metaKeywords) {
      tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
    }
    // تاریخ انتشار (در صورت وجود)
    let publishedAt = $$('meta[property="article:published_time"]').attr('content');
    let publishedAtJalali = null, publishedAtRelative = null;
    if (publishedAt) {
      const m = moment(publishedAt).utcOffset('+03:30');
      publishedAtJalali = m.format('jYYYY/jMM/jDD HH:mm');
      publishedAtRelative = m.fromNow();
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
      agency: "Ettelaat News Agency",
      category: "science-tech"
    }];
  }

  async scrapeAndSaveScienceTech() {
    const articles = await this.scrapeScienceTech();
    if (!articles.length) throw new Error("No article found");
    const news = articles[0];
    const exists = await Article.findOne({ where: { sourceUrl: news.link } });
    if (exists) throw new Error("این خبر قبلاً ثبت شده است.");
    const uniqueTags = deduplicateTags(news.tags);
    const tagIds = [];
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug("science-tech");
    const agency = await getAgencyByNameEn("Ettelaat News Agency");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedAt,
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

module.exports = new EttelaatScraper(); 
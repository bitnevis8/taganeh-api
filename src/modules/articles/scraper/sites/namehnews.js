const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment-jalaali");
const Article = require("../../article/model");
const Tag = require("../../tag/model");
const Category = require("../../category/model");
const Agency = require("../../agency/model");

const BASE_URL = "https://www.namehnews.com";

function parseNamehNewsDate() {
  // Nameh News does not provide ISO or Jalali date in meta, so fallback to current time
  const now = moment();
  return {
    publishedAt: now.toISOString(),
    publishedAtJalali: now.format('jYYYY/jMM/jDD HH:mm'),
    publishedAtRelative: now.fromNow(),
  };
}

class NamehNewsScraper {
  async scrapePolitics() {
    const url = `${BASE_URL}/بخش-خبر-سیاسی-10`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const firstLi = $('ul.l-second-right-list > li.container').first();
    if (!firstLi.length) throw new Error('No article found');
    const a = firstLi.find('div.image a.block');
    const link = BASE_URL + a.attr('href');
    const image = a.find('img').attr('src');
    const title = firstLi.find('div.content h3.title a').text().trim();
    const summary = firstLi.find('div.content p.lead').text().trim();

    // Fetch article page for tags and meta
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // Tags
    let tags = [];
    $$('.article-tag a').each((i, el) => {
      const tag = $$(el).text().trim();
      if (tag) tags.push(tag);
    });
    // Date: fallback to now (no reliable date in meta)
    const { publishedAt, publishedAtJalali, publishedAtRelative } = parseNamehNewsDate();
    // Agency and category
    return [{
      title,
      link,
      summary,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Nameh News",
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
    const agency = await getAgencyByNameEn("Nameh News");
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
    const url = `${BASE_URL}/بخش-خبر-اقتصادی-4`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const firstLi = $('ul.l-second-right-list > li.container').first();
    if (!firstLi.length) throw new Error('No article found');
    const a = firstLi.find('div.image a.block');
    const link = BASE_URL + a.attr('href');
    const image = a.find('img').attr('src');
    const title = firstLi.find('div.content h3.title a').text().trim();
    const summary = firstLi.find('div.content p.lead').text().trim();

    // Fetch article page for tags and meta
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // Tags
    let tags = [];
    $$('.article-tag a').each((i, el) => {
      const tag = $$(el).text().trim();
      if (tag) tags.push(tag);
    });
    // Date: fallback to now (no reliable date in meta)
    const { publishedAt, publishedAtJalali, publishedAtRelative } = parseNamehNewsDate();
    // Agency and category
    return [{
      title,
      link,
      summary,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Nameh News",
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
    const agency = await getAgencyByNameEn("Nameh News");
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
    const url = `${BASE_URL}/بخش-خبر-ورزشی-12`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const firstLi = $('ul.l-second-right-list > li.container').first();
    if (!firstLi.length) throw new Error('No article found');
    const a = firstLi.find('div.image a.block');
    const link = BASE_URL + a.attr('href');
    const image = a.find('img').attr('src');
    const title = firstLi.find('div.content h3.title a').text().trim();
    const summary = firstLi.find('div.content p.lead').text().trim();

    // Fetch article page for tags and meta
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // Tags
    let tags = [];
    $$('.article-tag a').each((i, el) => {
      const tag = $$(el).text().trim();
      if (tag) tags.push(tag);
    });
    // Date: fallback to now (no reliable date in meta)
    const { publishedAt, publishedAtJalali, publishedAtRelative } = parseNamehNewsDate();
    // Agency and category
    return [{
      title,
      link,
      summary,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Nameh News",
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
    const agency = await getAgencyByNameEn("Nameh News");
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

  async scrapeScienceTech() {
    const url = `${BASE_URL}/بخش-تکنولوژی-8`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const firstLi = $('ul.l-second-right-list > li.container').first();
    if (!firstLi.length) throw new Error('No article found');
    const a = firstLi.find('div.image a.block');
    const link = BASE_URL + a.attr('href');
    const image = a.find('img').attr('src');
    const title = firstLi.find('div.content h3.title a').text().trim();
    const summary = firstLi.find('div.content p.lead').text().trim();

    // Fetch article page for tags and meta
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // Tags
    let tags = [];
    $$('.article-tag a').each((i, el) => {
      const tag = $$(el).text().trim();
      if (tag) tags.push(tag);
    });
    // Date: fallback to now (no reliable date in meta)
    const { publishedAt, publishedAtJalali, publishedAtRelative } = parseNamehNewsDate();
    // Agency and category
    return [{
      title,
      link,
      summary,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Nameh News",
      category: "science-tech"
    }];
  }

  async scrapeAndSaveScienceTech() {
    const articles = await this.scrapeScienceTech();
    if (!articles.length) throw new Error("No science-tech article found");
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
    const category = await getCategoryBySlug("science-tech");
    const agency = await getAgencyByNameEn("Nameh News");
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
    const url = `${BASE_URL}/بخش-خبر-حوادث-اجتماعی-17`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const firstLi = $('ul.l-second-right-list > li.container').first();
    if (!firstLi.length) throw new Error('No article found');
    const a = firstLi.find('div.image a.block');
    const link = BASE_URL + a.attr('href');
    const image = a.find('img').attr('src');
    const title = firstLi.find('div.content h3.title a').text().trim();
    const summary = firstLi.find('div.content p.lead').text().trim();

    // Fetch article page for tags and meta
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // Tags
    let tags = [];
    $$('.article-tag a').each((i, el) => {
      const tag = $$(el).text().trim();
      if (tag) tags.push(tag);
    });
    // Date: fallback to now (no reliable date in meta)
    const { publishedAt, publishedAtJalali, publishedAtRelative } = parseNamehNewsDate();
    // Agency and category
    return [{
      title,
      link,
      summary,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Nameh News",
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
    const agency = await getAgencyByNameEn("Nameh News");
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

module.exports = new NamehNewsScraper(); 
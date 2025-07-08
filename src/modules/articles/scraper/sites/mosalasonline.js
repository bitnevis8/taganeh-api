const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment-jalaali");
const Article = require("../../article/model");
const Tag = require("../../tag/model");
const Category = require("../../category/model");
const Agency = require("../../agency/model");

const BASE_URL = "https://www.mosalasonline.com";

function parseMosalasDate(dateStr, timeStr) {
  // Example: dateStr = '۱۰ تیر ۱۴۰۴', timeStr = '۱۱:۱۳'
  // Fallback to now if not parsable
  let now = moment();
  let publishedAt = now.toISOString();
  let publishedAtJalali = now.format('jYYYY/jMM/jDD HH:mm');
  let publishedAtRelative = now.fromNow();
  if (dateStr && timeStr) {
    try {
      // Convert Persian numbers to English
      const toEn = s => s.replace(/[۰-۹]/g, d => '0123456789'[d.charCodeAt(0)-1776]);
      const jalali = toEn(dateStr) + ' ' + toEn(timeStr);
      const m = moment(jalali, 'jD jMMMM jYYYY HH:mm');
      if (m.isValid()) {
        publishedAt = m.toDate().toISOString();
        publishedAtJalali = m.format('jYYYY/jMM/jDD HH:mm');
        publishedAtRelative = m.fromNow();
      }
    } catch {}
  }
  return { publishedAt, publishedAtJalali, publishedAtRelative };
}

class MosalasOnlineScraper {
  async scrapePolitics() {
    const url = `${BASE_URL}/بخش-جدیدترین-اخبار-سیاسی-6`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const firstLi = $('div.landing-news-cnt ul.archive-n-land > li').first();
    if (!firstLi.length) throw new Error('No article found');
    const a = firstLi.find('div.right-service a.service-pic');
    const link = BASE_URL + a.attr('href');
    const image = a.find('img').attr('src');
    const title = firstLi.find('div.left-service h2.title a').text().trim();
    const summary = firstLi.find('div.left-service p.lead').text().trim();
    // Date
    const timeElem = firstLi.find('div.left-service .service-date time.news-time').first();
    let jalaliDateTime = timeElem.text().replace(/\s+/g, ' ').trim(); // e.g. "۱۴۰۴/۰۳/۲۸ ۱۶:۳۱:۰۸"
    let isoDateTime = timeElem.attr('datetime'); // e.g. "2025-06-18T13:01:08Z"
    let publishedAt = isoDateTime || new Date().toISOString();
    let publishedAtJalali = jalaliDateTime || '';
    let publishedAtRelative = publishedAt ? moment(publishedAt).fromNow() : '';
    // If isoDateTime is missing, try to parse jalaliDateTime
    if (!isoDateTime && jalaliDateTime) {
      const m = moment(toEn(jalaliDateTime), 'jYYYY/jMM/jDD HH:mm:ss');
      if (m.isValid()) {
        publishedAt = m.toDate().toISOString();
        publishedAtJalali = m.format('jYYYY/jMM/jDD HH:mm:ss');
        publishedAtRelative = m.fromNow();
      }
    }
    // Fetch article page for tags
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    let tags = [];
    $$('.article-tag a, div.article_tag .tags a').each((i, el) => {
      const tag = $$(el).text().trim();
      if (tag) tags.push(tag);
    });
    return [{
      title,
      link,
      summary,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Mosalas Online",
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
    const agency = await getAgencyByNameEn("Mosalas Online");
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
    const url = `${BASE_URL}/بخش-جهان-5`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const firstLi = $('div.landing-news-cnt ul.archive-n-land > li').first();
    if (!firstLi.length) throw new Error('No article found');
    const a = firstLi.find('div.right-service a.service-pic');
    const link = BASE_URL + a.attr('href');
    const image = a.find('img').attr('src');
    const title = firstLi.find('div.left-service h2.title a').text().trim();
    const summary = firstLi.find('div.left-service p.lead').text().trim();
    // Date
    const timeElem = firstLi.find('div.left-service .service-date time.news-time').first();
    let jalaliDateTime = timeElem.text().replace(/\s+/g, ' ').trim(); // e.g. "۱۴۰۴/۰۳/۲۸ ۱۶:۳۱:۰۸"
    let isoDateTime = timeElem.attr('datetime'); // e.g. "2025-06-18T13:01:08Z"
    let publishedAt = isoDateTime || new Date().toISOString();
    let publishedAtJalali = jalaliDateTime || '';
    let publishedAtRelative = publishedAt ? moment(publishedAt).fromNow() : '';
    // If isoDateTime is missing, try to parse jalaliDateTime
    if (!isoDateTime && jalaliDateTime) {
      const m = moment(toEn(jalaliDateTime), 'jYYYY/jMM/jDD HH:mm:ss');
      if (m.isValid()) {
        publishedAt = m.toDate().toISOString();
        publishedAtJalali = m.format('jYYYY/jMM/jDD HH:mm:ss');
        publishedAtRelative = m.fromNow();
      }
    }
    // Fetch article page for tags
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    let tags = [];
    $$('.article-tag a, div.article_tag .tags a').each((i, el) => {
      const tag = $$(el).text().trim();
      if (tag) tags.push(tag);
    });
    return [{
      title,
      link,
      summary,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Mosalas Online",
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
    const agency = await getAgencyByNameEn("Mosalas Online");
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
    const url = `${BASE_URL}/بخش-فرهنگی-4`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const firstLi = $('div.landing-news-cnt ul.archive-n-land > li').first();
    if (!firstLi.length) throw new Error('No article found');
    const a = firstLi.find('div.right-service a.service-pic');
    const link = BASE_URL + a.attr('href');
    const image = a.find('img').attr('src');
    const title = firstLi.find('div.left-service h2.title a').text().trim();
    const summary = firstLi.find('div.left-service p.lead').text().trim();
    // Date
    const timeElem = firstLi.find('div.left-service .service-date time.news-time').first();
    let jalaliDateTime = timeElem.text().replace(/\s+/g, ' ').trim(); // e.g. "۱۴۰۴/۰۳/۲۸ ۱۶:۳۱:۰۸"
    let isoDateTime = timeElem.attr('datetime'); // e.g. "2025-06-18T13:01:08Z"
    let publishedAt = isoDateTime || new Date().toISOString();
    let publishedAtJalali = jalaliDateTime || '';
    let publishedAtRelative = publishedAt ? moment(publishedAt).fromNow() : '';
    // If isoDateTime is missing, try to parse jalaliDateTime
    if (!isoDateTime && jalaliDateTime) {
      const m = moment(toEn(jalaliDateTime), 'jYYYY/jMM/jDD HH:mm:ss');
      if (m.isValid()) {
        publishedAt = m.toDate().toISOString();
        publishedAtJalali = m.format('jYYYY/jMM/jDD HH:mm:ss');
        publishedAtRelative = m.fromNow();
      }
    }
    // Fetch article page for tags
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    let tags = [];
    $$('.article-tag a, div.article_tag .tags a').each((i, el) => {
      const tag = $$(el).text().trim();
      if (tag) tags.push(tag);
    });
    return [{
      title,
      link,
      summary,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Mosalas Online",
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
    const agency = await getAgencyByNameEn("Mosalas Online");
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
    const url = `${BASE_URL}/بخش-اقتصادی-10`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const firstLi = $('div.landing-news-cnt ul.archive-n-land > li').first();
    if (!firstLi.length) throw new Error('No article found');
    const a = firstLi.find('div.right-service a.service-pic');
    const link = BASE_URL + a.attr('href');
    const image = a.find('img').attr('src');
    const title = firstLi.find('div.left-service h2.title a').text().trim();
    const summary = firstLi.find('div.left-service p.lead').text().trim();
    // Date
    const timeElem = firstLi.find('div.left-service .service-date time.news-time').first();
    let jalaliDateTime = timeElem.text().replace(/\s+/g, ' ').trim(); // e.g. "۱۴۰۴/۰۳/۲۸ ۱۶:۳۱:۰۸"
    let isoDateTime = timeElem.attr('datetime'); // e.g. "2025-06-18T13:01:08Z"
    let publishedAt = isoDateTime || new Date().toISOString();
    let publishedAtJalali = jalaliDateTime || '';
    let publishedAtRelative = publishedAt ? moment(publishedAt).fromNow() : '';
    // If isoDateTime is missing, try to parse jalaliDateTime
    if (!isoDateTime && jalaliDateTime) {
      const m = moment(toEn(jalaliDateTime), 'jYYYY/jMM/jDD HH:mm:ss');
      if (m.isValid()) {
        publishedAt = m.toDate().toISOString();
        publishedAtJalali = m.format('jYYYY/jMM/jDD HH:mm:ss');
        publishedAtRelative = m.fromNow();
      }
    }
    // Fetch article page for tags
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    let tags = [];
    $$('.article-tag a, div.article_tag .tags a').each((i, el) => {
      const tag = $$(el).text().trim();
      if (tag) tags.push(tag);
    });
    return [{
      title,
      link,
      summary,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Mosalas Online",
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
    const agency = await getAgencyByNameEn("Mosalas Online");
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
    const url = `${BASE_URL}/بخش-اجتماعی-7`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const firstLi = $('div.landing-news-cnt ul.archive-n-land > li').first();
    if (!firstLi.length) throw new Error('No article found');
    const a = firstLi.find('div.right-service a.service-pic');
    const link = BASE_URL + a.attr('href');
    const image = a.find('img').attr('src');
    const title = firstLi.find('div.left-service h2.title a').text().trim();
    const summary = firstLi.find('div.left-service p.lead').text().trim();
    // Date
    const timeElem = firstLi.find('div.left-service .service-date time.news-time').first();
    let jalaliDateTime = timeElem.text().replace(/\s+/g, ' ').trim(); // e.g. "۱۴۰۴/۰۳/۲۸ ۱۶:۳۱:۰۸"
    let isoDateTime = timeElem.attr('datetime'); // e.g. "2025-06-18T13:01:08Z"
    let publishedAt = isoDateTime || new Date().toISOString();
    let publishedAtJalali = jalaliDateTime || '';
    let publishedAtRelative = publishedAt ? moment(publishedAt).fromNow() : '';
    // If isoDateTime is missing, try to parse jalaliDateTime
    if (!isoDateTime && jalaliDateTime) {
      const m = moment(toEn(jalaliDateTime), 'jYYYY/jMM/jDD HH:mm:ss');
      if (m.isValid()) {
        publishedAt = m.toDate().toISOString();
        publishedAtJalali = m.format('jYYYY/jMM/jDD HH:mm:ss');
        publishedAtRelative = m.fromNow();
      }
    }
    // Fetch article page for tags
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    let tags = [];
    $$('.article-tag a, div.article_tag .tags a').each((i, el) => {
      const tag = $$(el).text().trim();
      if (tag) tags.push(tag);
    });
    return [{
      title,
      link,
      summary,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Mosalas Online",
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
    const agency = await getAgencyByNameEn("Mosalas Online");
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
  return await Category.findOne({ where: { slug } });
}

async function getAgencyByNameEn(nameEn) {
  return await Agency.findOne({ where: { nameEn } });
}

function deduplicateTags(tags) {
  return [...new Set(tags.map(t => t.trim()).filter(Boolean))];
}

module.exports = new MosalasOnlineScraper(); 
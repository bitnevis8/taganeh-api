const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment-jalaali");
const Article = require("../../article/model");
const Tag = require("../../tag/model");
const Category = require("../../category/model");
const Agency = require("../../agency/model");

const BASE_URL = "https://www.khabaronline.ir";

function faToEnDigits(str) {
  if (!str) return str;
  return str.replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
}

function parseKhabarOnlineDate($) {
  // 1. متا تگ ISO
  let publishedAt = $(
    'meta[property="article:published_time"]'
  ).attr("content") || $(
    'meta[itemprop="datePublished"]'
  ).attr("content");

  // 2. JSON-LD
  if (!publishedAt) {
    $("script[type='application/ld+json']").each((i, el) => {
      try {
        const json = JSON.parse($(el).html());
        if (json.datePublished) publishedAt = json.datePublished;
      } catch (e) {}
    });
  }

  // 3. متا تگ name="date"
  if (!publishedAt) {
    publishedAt = $('meta[name="date"]').attr('content');
  }

  // 4. متن صفحه (فارسی)
  if (!publishedAt) {
    publishedAt = $('.item-date span').text().trim() || $('.print-header .date').text().trim();
  }

  let publishedAtISO = null, publishedAtJalali = null, publishedAtRelative = null;
  if (publishedAt) {
    // اگر ISO بود
    if (/T\d{2}:\d{2}:\d{2}/.test(publishedAt)) {
      publishedAtISO = publishedAt;
      const m = moment(publishedAtISO).utcOffset('+03:30');
      publishedAtJalali = m.format('jYYYY/jMM/jDD HH:mm');
      publishedAtRelative = m.fromNow();
    } else {
      // اگر فارسی بود (مثلاً: ۶ تیر ۱۴۰۴ - ۰۹:۰۲)
      const faMonths = {
        "فروردین": "01", "اردیبهشت": "02", "خرداد": "03", "تیر": "04",
        "مرداد": "05", "شهریور": "06", "مهر": "07", "آبان": "08",
        "آذر": "09", "دی": "10", "بهمن": "11", "اسفند": "12"
      };
      let str = faToEnDigits(publishedAt);
      const match = str.match(/(\d{1,2}) ([^ ]+) (\d{4}) - (\d{2}):(\d{2})/);
      if (match) {
        let [, day, faMonth, year, hour, minute] = match;
        let month = faMonths[faMonth];
        let jalali = `${year}/${month}/${day} ${hour}:${minute}`;
        publishedAtJalali = jalali;
        const m = moment(`${year}-${month}-${day} ${hour}:${minute}`, 'jYYYY-jMM-jDD HH:mm').utcOffset('+03:30');
        publishedAtISO = m.format();
        publishedAtRelative = m.fromNow();
      }
    }
  }
  return { publishedAt: publishedAtISO, publishedAtJalali, publishedAtRelative };
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

class KhabarOnlineScraper {
  async scrapePolitics() {
    const url = BASE_URL + "/service/Politics";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر
    const firstArticle = $("li.News").first();
    const a = firstArticle.find(".desc h3 a").first();
    const href = a.attr("href");
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('h1.title').text().trim();
    // خلاصه
    const summary = $$('.item-summary .summary').text().trim();
    // متن کامل
    const content = $$('.item-body .item-text').text().trim();
    // عکس شاخص
    const image = $$('.item-summary img').attr('src') || $$('meta[property="og:image"]').attr('content');
    // تگ‌ها
    let tags = [];
    $$('.box.tags ul li a').each((i, el) => {
      const tag = $$(el).text().trim();
      if (tag) tags.push(tag);
    });
    tags = deduplicateTags(tags);
    // تاریخ انتشار
    const { publishedAt, publishedAtJalali, publishedAtRelative } = parseKhabarOnlineDate($$);
    return [{
      title,
      link,
      summary,
      content,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Khabar Online News Agency",
      category: "politics"
    }];
  }

  async scrapeEconomy() {
    const url = BASE_URL + "/service/Economy";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر
    const firstArticle = $("li.News").first();
    const a = firstArticle.find(".desc h3 a").first();
    const href = a.attr("href");
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('h1.title').text().trim();
    // خلاصه
    const summary = $$('.item-summary .summary').text().trim();
    // متن کامل
    const content = $$('.item-body .item-text').text().trim();
    // عکس شاخص
    const image = $$('.item-summary img').attr('src') || $$('meta[property="og:image"]').attr('content');
    // تگ‌ها
    let tags = [];
    $$('.box.tags ul li a').each((i, el) => {
      const tag = $$(el).text().trim();
      if (tag) tags.push(tag);
    });
    tags = deduplicateTags(tags);
    // تاریخ انتشار
    const { publishedAt, publishedAtJalali, publishedAtRelative } = parseKhabarOnlineDate($$);
    return [{
      title,
      link,
      summary,
      content,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Khabar Online News Agency",
      category: "economy"
    }];
  }

  async scrapeSports() {
    const url = BASE_URL + "/service/sport";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر
    const firstArticle = $("li.News").first();
    const a = firstArticle.find(".desc h3 a").first();
    const href = a.attr("href");
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('h1.title').text().trim();
    // خلاصه
    const summary = $$('.item-summary .summary').text().trim();
    // متن کامل
    const content = $$('.item-body .item-text').text().trim();
    // عکس شاخص
    const image = $$('.item-summary img').attr('src') || $$('meta[property="og:image"]').attr('content');
    // تگ‌ها
    let tags = [];
    $$('.box.tags ul li a').each((i, el) => {
      const tag = $$(el).text().trim();
      if (tag) tags.push(tag);
    });
    tags = deduplicateTags(tags);
    // تاریخ انتشار
    const { publishedAt, publishedAtJalali, publishedAtRelative } = parseKhabarOnlineDate($$);
    return [{
      title,
      link,
      summary,
      content,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Khabar Online News Agency",
      category: "sports"
    }];
  }

  async scrapeSociety() {
    const url = BASE_URL + "/service/society";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر
    const firstArticle = $("li.News").first();
    const a = firstArticle.find(".desc h3 a").first();
    const href = a.attr("href");
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('h1.title').text().trim();
    // خلاصه
    const summary = $$('.item-summary .summary').text().trim();
    // متن کامل
    const content = $$('.item-body .item-text').text().trim();
    // عکس شاخص
    const image = $$('.item-summary img').attr('src') || $$('meta[property="og:image"]').attr('content');
    // تگ‌ها
    let tags = [];
    $$('.box.tags ul li a').each((i, el) => {
      const tag = $$(el).text().trim();
      if (tag) tags.push(tag);
    });
    tags = deduplicateTags(tags);
    // تاریخ انتشار
    const { publishedAt, publishedAtJalali, publishedAtRelative } = parseKhabarOnlineDate($$);
    return [{
      title,
      link,
      summary,
      content,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Khabar Online News Agency",
      category: "social"
    }];
  }

  async scrapeInternational() {
    const url = BASE_URL + "/service/World";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر
    const firstArticle = $("li.News").first();
    const a = firstArticle.find(".desc h3 a").first();
    const href = a.attr("href");
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('h1.title').text().trim();
    // خلاصه
    const summary = $$('.item-summary .summary').text().trim();
    // متن کامل
    const content = $$('.item-body .item-text').text().trim();
    // عکس شاخص
    const image = $$('.item-summary img').attr('src') || $$('meta[property="og:image"]').attr('content');
    // تگ‌ها
    let tags = [];
    $$('.box.tags ul li a').each((i, el) => {
      const tag = $$(el).text().trim();
      if (tag) tags.push(tag);
    });
    tags = deduplicateTags(tags);
    // تاریخ انتشار
    const { publishedAt, publishedAtJalali, publishedAtRelative } = parseKhabarOnlineDate($$);
    return [{
      title,
      link,
      summary,
      content,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Khabar Online News Agency",
      category: "international"
    }];
  }

  async scrapeCulture() {
    const url = BASE_URL + "/service/culture";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر
    const firstArticle = $("li.News").first();
    const a = firstArticle.find(".desc h3 a").first();
    const href = a.attr("href");
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('h1.title').text().trim();
    // خلاصه
    const summary = $$('.item-summary .summary').text().trim();
    // متن کامل
    const content = $$('.item-body .item-text').text().trim();
    // عکس شاخص
    const image = $$('.item-summary img').attr('src') || $$('meta[property="og:image"]').attr('content');
    // تگ‌ها
    let tags = [];
    $$('.box.tags ul li a').each((i, el) => {
      const tag = $$(el).text().trim();
      if (tag) tags.push(tag);
    });
    tags = deduplicateTags(tags);
    // تاریخ انتشار
    const { publishedAt, publishedAtJalali, publishedAtRelative } = parseKhabarOnlineDate($$);
    return [{
      title,
      link,
      summary,
      content,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Khabar Online News Agency",
      category: "culture-art"
    }];
  }

  async scrapeScienceTech() {
    const url = BASE_URL + "/service/science";
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // پیدا کردن اولین خبر
    const firstArticle = $("li.News").first();
    const a = firstArticle.find(".desc h3 a").first();
    const href = a.attr("href");
    if (!href) throw new Error("هیچ لینکی برای خبر پیدا نشد.");
    const link = BASE_URL + href;
    // ورود به صفحه خبر
    const { data: articleHtml } = await axios.get(link);
    const $$ = cheerio.load(articleHtml);
    // عنوان
    const title = $$('meta[property="og:title"]').attr('content') || $$('h1.title').text().trim();
    // خلاصه
    const summary = $$('.item-summary .summary').text().trim();
    // متن کامل
    const content = $$('.item-body .item-text').text().trim();
    // عکس شاخص
    const image = $$('.item-summary img').attr('src') || $$('meta[property="og:image"]').attr('content');
    // تگ‌ها
    let tags = [];
    $$('.box.tags ul li a').each((i, el) => {
      const tag = $$(el).text().trim();
      if (tag) tags.push(tag);
    });
    tags = deduplicateTags(tags);
    // تاریخ انتشار
    const { publishedAt, publishedAtJalali, publishedAtRelative } = parseKhabarOnlineDate($$);
    return [{
      title,
      link,
      summary,
      content,
      image,
      tags,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      agency: "Khabar Online News Agency",
      category: "science-tech"
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
    const agency = await getAgencyByNameEn("Khabar Online News Agency");
    const newArticle = await Article.create({
      title: news.title,
      content: news.content || news.summary || news.title,
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
    const agency = await getAgencyByNameEn("Khabar Online News Agency");
    const newArticle = await Article.create({
      title: news.title,
      content: news.content || news.summary || news.title,
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
    const agency = await getAgencyByNameEn("Khabar Online News Agency");
    const newArticle = await Article.create({
      title: news.title,
      content: news.content || news.summary || news.title,
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

  async scrapeAndSaveSociety() {
    const articles = await this.scrapeSociety();
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
    const agency = await getAgencyByNameEn("Khabar Online News Agency");
    const newArticle = await Article.create({
      title: news.title,
      content: news.content || news.summary || news.title,
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
    const agency = await getAgencyByNameEn("Khabar Online News Agency");
    const newArticle = await Article.create({
      title: news.title,
      content: news.content || news.summary || news.title,
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

  async scrapeAndSaveCulture() {
    const articles = await this.scrapeCulture();
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
    const agency = await getAgencyByNameEn("Khabar Online News Agency");
    const newArticle = await Article.create({
      title: news.title,
      content: news.content || news.summary || news.title,
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

  async scrapeAndSaveScienceTech() {
    const articles = await this.scrapeScienceTech();
    if (!articles.length) throw new Error("هیچ خبری برای ذخیره وجود ندارد.");
    const news = articles[0];
    // ذخیره در دیتابیس مشابه سایر دسته‌ها
    const exists = await Article.findOne({ where: { sourceUrl: news.link } });
    if (exists) return exists;
    const tagIds = [];
    const uniqueTags = deduplicateTags(news.tags);
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug("science-tech");
    const categoryIds = [category.id];
    const agency = await getAgencyByNameEn("Khabar Online News Agency");
    if (!agency) throw new Error("آژانس خبری یافت نشد.");
    const newArticle = await Article.create({
      title: news.title,
      content: news.content || news.summary || news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedAt,
      agencyId: agency.id,
      isActive: true,
      scrapedAt: new Date()
    });
    await newArticle.setTags(tagIds);
    await newArticle.setCategories(categoryIds);
    return newArticle;
  }
}

module.exports = new KhabarOnlineScraper();
 
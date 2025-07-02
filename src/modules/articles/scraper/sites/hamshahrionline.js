const axios = require("axios");
const cheerio = require("cheerio");
const Article = require("../../article/model");
const Tag = require("../../tag/model");
const Category = require("../../category/model");
const Agency = require("../../agency/model");

const BASE_URL = "https://www.hamshahrionline.ir";

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

class HamshahriOnlineScraper {
  static agencyName = "همشهری آنلاین";

  // تابع استخراج جزئیات خبر
  static async extractArticleDetails(url) {
    try {
      const { data: html } = await axios.get(url);
      const $ = cheerio.load(html);

      // Title
      const title = $('meta[property="og:title"]').attr('content') ||
                    $('title').text().trim();

      // Summary/Description
      const summary = $('meta[name="description"]').attr('content') ||
                      $('meta[property="og:description"]').attr('content') || '';

      // Image
      const image = $('meta[property="og:image"]').attr('content') ||
                    $('meta[name="thumbnail"]').attr('content') || '';

      // Published Date (ISO)
      const publishedDate = $('meta[itemprop="datePublished"]').attr('content') ||
                             $('meta[property="article:published_time"]').attr('content') || '';

      // Tags
      let tags = [];
      $('section.box.tags ul li a[rel="tag"]').each((i, el) => {
        tags.push($(el).text().trim());
      });

      // Content (فرض: article-body یا main-content)
      // let content = $('.article-body').text().trim();
      // if (!content) {
      //   content = $('.main-content').text().trim();
      // }

      return {
        title,
        summary,
        image,
        publishedDate,
        tags,
        link: url,
        agency: 'hamshahrionline',
      };
    } catch (err) {
      return { error: true, link: url, message: err.message };
    }
  }

  static async scrapePolitics() {
    const url = `${BASE_URL}/service/Iran`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    const links = [];

    $("li.news, li.report").each((i, el) => {
      if (links.length >= 1) return false; // فقط اولین خبر
      const a = $(el).find("div.desc h3 a");
      const href = a.attr("href");
      if (!href) return;
      const link = href.startsWith("http") ? href : BASE_URL + href;
      if (!links.includes(link)) {
        links.push(link);
      }
    });

    // استخراج جزئیات کامل هر خبر
    const details = await Promise.all(
      links.map(link => HamshahriOnlineScraper.extractArticleDetails(link))
    );
    // فقط خبرهای بدون خطا را نگه می‌داریم
    return details.filter(d => !d.error);
  }

  static async scrapeAndSavePolitics() {
    const articles = await this.scrapePolitics();
    if (!articles.length) throw new Error("No article found");
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
    const agency = await getAgencyByNameEn("Hamshahri Online");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedDate,
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
    const url = `${BASE_URL}/service/world`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    const links = [];

    $("li.news, li.report").each((i, el) => {
      if (links.length >= 1) return false; // فقط اولین خبر
      const a = $(el).find("div.desc h3 a");
      const href = a.attr("href");
      if (!href) return;
      const link = href.startsWith("http") ? href : BASE_URL + href;
      if (!links.includes(link)) {
        links.push(link);
      }
    });

    // استخراج جزئیات کامل هر خبر
    const details = await Promise.all(
      links.map(link => HamshahriOnlineScraper.extractArticleDetails(link))
    );
    // فقط خبرهای بدون خطا را نگه می‌داریم
    return details.filter(d => !d.error);
  }

  static async scrapeAndSaveInternational() {
    const articles = await this.scrapeInternational();
    if (!articles.length) throw new Error("No article found");
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
    const agency = await getAgencyByNameEn("Hamshahri Online");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedDate,
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
    const url = `${BASE_URL}/service/Society`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    const links = [];

    $("li.news, li.report").each((i, el) => {
      if (links.length >= 1) return false; // فقط اولین خبر
      const a = $(el).find("div.desc h3 a");
      const href = a.attr("href");
      if (!href) return;
      const link = href.startsWith("http") ? href : BASE_URL + href;
      if (!links.includes(link)) {
        links.push(link);
      }
    });

    // استخراج جزئیات کامل هر خبر
    const details = await Promise.all(
      links.map(link => HamshahriOnlineScraper.extractArticleDetails(link))
    );
    // فقط خبرهای بدون خطا را نگه می‌داریم
    return details.filter(d => !d.error);
  }

  static async scrapeAndSaveSocial() {
    const articles = await this.scrapeSocial();
    if (!articles.length) throw new Error("No article found");
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
    const agency = await getAgencyByNameEn("Hamshahri Online");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedDate,
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
    const url = `${BASE_URL}/service/Economy`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    const links = [];

    $("li.news, li.report").each((i, el) => {
      if (links.length >= 1) return false; // فقط اولین خبر
      const a = $(el).find("div.desc h3 a");
      const href = a.attr("href");
      if (!href) return;
      const link = href.startsWith("http") ? href : BASE_URL + href;
      if (!links.includes(link)) {
        links.push(link);
      }
    });

    // استخراج جزئیات کامل هر خبر
    const details = await Promise.all(
      links.map(link => HamshahriOnlineScraper.extractArticleDetails(link))
    );
    // فقط خبرهای بدون خطا را نگه می‌داریم
    return details.filter(d => !d.error);
  }

  static async scrapeAndSaveEconomy() {
    const articles = await this.scrapeEconomy();
    if (!articles.length) throw new Error("No article found");
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
    const agency = await getAgencyByNameEn("Hamshahri Online");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedDate,
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

  static async scrapeScienceTech() {
    const url = `${BASE_URL}/service/Science`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    const links = [];

    $("li.news, li.report").each((i, el) => {
      if (links.length >= 1) return false; // فقط اولین خبر
      const a = $(el).find("div.desc h3 a");
      const href = a.attr("href");
      if (!href) return;
      const link = href.startsWith("http") ? href : BASE_URL + href;
      if (!links.includes(link)) {
        links.push(link);
      }
    });

    // استخراج جزئیات کامل هر خبر
    const details = await Promise.all(
      links.map(link => HamshahriOnlineScraper.extractArticleDetails(link))
    );
    // فقط خبرهای بدون خطا را نگه می‌داریم
    return details.filter(d => !d.error);
  }

  static async scrapeAndSaveScienceTech() {
    const articles = await this.scrapeScienceTech();
    if (!articles.length) throw new Error("No article found");
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
    const agency = await getAgencyByNameEn("Hamshahri Online");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedDate,
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
    const url = `${BASE_URL}/service/Culture`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    const links = [];

    $("li.news, li.report").each((i, el) => {
      if (links.length >= 1) return false; // فقط اولین خبر
      const a = $(el).find("div.desc h3 a");
      const href = a.attr("href");
      if (!href) return;
      const link = href.startsWith("http") ? href : BASE_URL + href;
      if (!links.includes(link)) {
        links.push(link);
      }
    });

    // استخراج جزئیات کامل هر خبر
    const details = await Promise.all(
      links.map(link => HamshahriOnlineScraper.extractArticleDetails(link))
    );
    // فقط خبرهای بدون خطا را نگه می‌داریم
    return details.filter(d => !d.error);
  }

  static async scrapeAndSaveCultureArt() {
    const articles = await this.scrapeCultureArt();
    if (!articles.length) throw new Error("No article found");
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
    const agency = await getAgencyByNameEn("Hamshahri Online");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedDate,
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
    const url = `${BASE_URL}/service/Sport`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    const links = [];

    $("li.news, li.report").each((i, el) => {
      if (links.length >= 1) return false; // فقط اولین خبر
      const a = $(el).find("div.desc h3 a");
      const href = a.attr("href");
      if (!href) return;
      const link = href.startsWith("http") ? href : BASE_URL + href;
      if (!links.includes(link)) {
        links.push(link);
      }
    });

    // استخراج جزئیات کامل هر خبر
    const details = await Promise.all(
      links.map(link => HamshahriOnlineScraper.extractArticleDetails(link))
    );
    // فقط خبرهای بدون خطا را نگه می‌داریم
    return details.filter(d => !d.error);
  }

  static async scrapeAndSaveSports() {
    const articles = await this.scrapeSports();
    if (!articles.length) throw new Error("No article found");
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
    const agency = await getAgencyByNameEn("Hamshahri Online");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.image || null,
      publishedAt: news.publishedDate,
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

module.exports = HamshahriOnlineScraper; 
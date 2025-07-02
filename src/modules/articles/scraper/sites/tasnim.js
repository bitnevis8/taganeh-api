const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment-jalaali");
const Article = require("../../article/model");
const Tag = require("../../tag/model");
const Category = require("../../category/model");
const Agency = require("../../agency/model");

const BASE_URL = "https://www.tasnimnews.com";

function faToEnDigits(str) {
  if (!str) return str;
  return str.replace(/[۰-۹]/g, d => "۰۱۲۳۴۵۶۷۸۹".indexOf(d));
}

// تبدیل تاریخ شمسی با ساعت (مثلاً: 06/04/1404 03:06:48 ب.ظ)
function parseRnewsDate(str) {
  str = faToEnDigits(str);
  // مثال: 06/04/1404 03:06:48 ب.ظ
  const match = str.match(/(\d{2})\/(\d{2})\/(\d{4}) (\d{2}):(\d{2}):(\d{2}) (ب\.ظ|ق\.ظ)/);
  if (!match) return { iso: null, jalali: null, relative: null };
  let [, day, month, year, hour, minute, second, ampm] = match;
  hour = parseInt(hour, 10);
  if (ampm === "ب.ظ" && hour < 12) hour += 12;
  if (ampm === "ق.ظ" && hour === 12) hour = 0;
  const jalali = `${year}/${month}/${day} ${hour.toString().padStart(2, "0")}:${minute}:${second}`;
  const m = moment(jalali, "jYYYY/jMM/jDD HH:mm:ss");
  return {
    iso: m.isValid() ? m.toISOString() : null,
    jalali,
    relative: m.isValid() ? m.fromNow() : null
  };
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

class TasnimScraper {
  async scrapePolitical() {
    const url = `${BASE_URL}/fa/service/1/%D8%B3%DB%8C%D8%A7%D8%B3%DB%8C`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // فقط آخرین خبر
    const firstArticle = $("article.list-item, article.box-item").first();
    const a = firstArticle.find("a").first();
    const link = BASE_URL + a.attr("href");

    // واکشی اطلاعات کامل خبر
    const details = await this.scrapeArticleDetails(link);
    return [details];
  }

  async scrapeEconomic() {
    const url = `${BASE_URL}/fa/service/7/%D8%A7%D9%82%D8%AA%D8%B5%D8%A7%D8%AF%DB%8C`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // فقط آخرین خبر
    const firstArticle = $("article.list-item, article.box-item").first();
    const a = firstArticle.find("a").first();
    const link = BASE_URL + a.attr("href");

    // واکشی اطلاعات کامل خبر
    const details = await this.scrapeArticleDetails(link);
    return [details];
  }

  async scrapeSports() {
    const url = `${BASE_URL}/fa/service/3/%D9%88%D8%B1%D8%B2%D8%B4%DB%8C`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // فقط آخرین خبر
    const firstArticle = $("article.list-item, article.box-item").first();
    const a = firstArticle.find("a").first();
    const link = BASE_URL + a.attr("href");

    // واکشی اطلاعات کامل خبر
    const details = await this.scrapeArticleDetails(link);
    return [details];
  }

  async scrapeSocial() {
    const url = `${BASE_URL}/fa/service/2/%D8%A7%D8%AC%D8%AA%D9%85%D8%A7%D8%B9%DB%8C`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // فقط آخرین خبر
    const firstArticle = $("article.list-item, article.box-item").first();
    const a = firstArticle.find("a").first();
    const link = BASE_URL + a.attr("href");

    // واکشی اطلاعات کامل خبر
    const details = await this.scrapeArticleDetails(link);
    return [details];
  }

  async scrapeInternational() {
    const url = `${BASE_URL}/fa/service/8/%D8%A8%DB%8C%D9%86-%D8%A7%D9%84%D9%85%D9%84%D9%84`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // فقط آخرین خبر
    const firstArticle = $("article.list-item, article.box-item").first();
    const a = firstArticle.find("a").first();
    const link = BASE_URL + a.attr("href");

    // واکشی اطلاعات کامل خبر
    const details = await this.scrapeArticleDetails(link);
    return [details];
  }

  async scrapeCultural() {
    const url = `${BASE_URL}/fa/service/4/%D9%81%D8%B1%D9%87%D9%86%DA%AF%DB%8C`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    // فقط آخرین خبر
    const firstArticle = $("article.list-item, article.box-item").first();
    const a = firstArticle.find("a").first();
    const link = BASE_URL + a.attr("href");

    // واکشی اطلاعات کامل خبر
    const details = await this.scrapeArticleDetails(link);
    return [details];
  }

  async scrapeScienceTech() {
    const url = `${BASE_URL}/fa/service/1486/%D9%81%D8%B6%D8%A7-%D9%88-%D9%86%D8%AC%D9%88%D9%85`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    // فقط آخرین خبر
    const firstArticle = $("article.list-item, article.box-item").first();
    const a = firstArticle.find("a").first();
    const link = BASE_URL + a.attr("href");
    // واکشی اطلاعات کامل خبر
    const details = await this.scrapeArticleDetails(link);
    details.category = "science-tech";
    return [details];
  }

  async scrapeArticleDetails(link) {
    const { data } = await axios.get(link);
    const $ = cheerio.load(data);

    // استخراج تاریخ
    let publishedAt = null, publishedAtJalali = null, publishedAtRelative = null;
    // ۱. JSON-LD
    const ldJson = $('script[type="application/ld+json"]').html();
    if (ldJson) {
      try {
        const json = JSON.parse(ldJson);
        if (json.datePublished) {
          publishedAt = json.datePublished;
          publishedAtJalali = moment(publishedAt).format("jYYYY/jMM/jDD HH:mm");
          publishedAtRelative = moment(publishedAt).fromNow();
        }
      } catch (e) {}
    }
    // ۲. rnews:datePublished
    if (!publishedAt) {
      const rnews = $('meta[property="rnews:datePublished"]').attr("content");
      if (rnews) {
        const parsed = parseRnewsDate(rnews);
        publishedAt = parsed.iso;
        publishedAtJalali = parsed.jalali;
        publishedAtRelative = parsed.relative;
      }
    }
    // ۳. itemprop=datePublished (فقط تاریخ)
    if (!publishedAt) {
      const itemprop = $('meta[itemprop="datePublished"]').attr("content");
      if (itemprop) {
        publishedAt = moment(itemprop, "YYYY-MM-DD").toISOString();
        publishedAtJalali = moment(itemprop, "YYYY-MM-DD").format("jYYYY/jMM/jDD");
        publishedAtRelative = moment(itemprop, "YYYY-MM-DD").fromNow();
      }
    }
    // ۴. از صفحه (li.time)
    if (!publishedAt) {
      const liTime = $("li.time").text().trim();
      if (liTime) {
        // مثال: ۰۶ تير ۱۴۰۴ - ۱۵:۰۶
        // تبدیل اعداد فارسی و استخراج اجزا
        const faMonths = {
          "فروردین": "01", "اردیبهشت": "02", "خرداد": "03", "تير": "04",
          "مرداد": "05", "شهریور": "06", "مهر": "07", "آبان": "08",
          "آذر": "09", "دی": "10", "بهمن": "11", "اسفند": "12"
        };
        const timeStr = faToEnDigits(liTime);
        const match = timeStr.match(/(\d{2}) ([^ ]+) (\d{4}) - (\d{2}):(\d{2})/);
        if (match) {
          let [, day, faMonth, year, hour, minute] = match;
          const month = faMonths[faMonth];
          const jalali = `${year}/${month}/${day} ${hour}:${minute}`;
          const m = moment(jalali, "jYYYY/jMM/jDD HH:mm");
          publishedAt = m.isValid() ? m.toISOString() : null;
          publishedAtJalali = jalali;
          publishedAtRelative = m.isValid() ? m.fromNow() : null;
        }
      }
    }

    // سایر بخش‌های خبر (عنوان، محتوا، تگ‌ها و ...)
    const title = $("h1.title").text().trim();
    const summary = $("h2.lead").text().trim();
    const imageUrl = $("figure img").attr("src") || $("meta[property='og:image']").attr("content");
    // تگ‌ها و کلمات کلیدی
    let tags = [];
    // فقط اولین بلوک کلیدواژه‌های کاربردی را بگیر
    const firstKeywordBlock = $('.news-container.keywords-box .content ul.smart-keyword').first();
    if (firstKeywordBlock.length) {
      firstKeywordBlock.find('li.skeyword-item a').each((i, el) => {
      const tag = $(el).text().trim();
      if (tag) tags.push(tag);
    });
    }
    // اگر تگ نبود، از meta[name=keywords] هم اضافه کن
    if (tags.length === 0) {
      const keywords = $('meta[name="keywords"]').attr("content");
      if (keywords) tags = tags.concat(keywords.split("|").map(t => t.trim()));
    }
    // حذف تکراری‌ها
    tags = [...new Set(tags)];

    return {
      title,
      link,
      publishedAt,
      publishedAtJalali,
      publishedAtRelative,
      summary,
      imageUrl,
      tags
    };
  }

  async scrapeAndSavePolitical() {
    const articles = await this.scrapePolitical();
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
    const agency = await getAgencyByNameEn("Tasnim News Agency");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.imageUrl || null,
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

  async scrapeAndSaveEconomic() {
    const articles = await this.scrapeEconomic();
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
    const agency = await getAgencyByNameEn("Tasnim News Agency");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.imageUrl || null,
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
    const agency = await getAgencyByNameEn("Tasnim News Agency");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.imageUrl || null,
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
    const agency = await getAgencyByNameEn("Tasnim News Agency");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.imageUrl || null,
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
    const agency = await getAgencyByNameEn("Tasnim News Agency");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.imageUrl || null,
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

  async scrapeAndSaveCultural() {
    const articles = await this.scrapeCultural();
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
    const agency = await getAgencyByNameEn("Tasnim News Agency");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.imageUrl || null,
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
    const uniqueTags = deduplicateTags(news.tags || []);
    for (const tagName of uniqueTags) {
      const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name: tagName } });
      tagIds.push(tag.id);
    }
    const category = await getCategoryBySlug("science-tech");
    const categoryIds = [category.id];
    const agency = await getAgencyByNameEn("Tasnim News Agency");
    if (!agency) throw new Error("آژانس خبری یافت نشد.");
    const newArticle = await Article.create({
      title: news.title,
      summary: news.summary || "",
      sourceUrl: news.link,
      imageUrl: news.imageUrl || null,
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

module.exports = new TasnimScraper(); 
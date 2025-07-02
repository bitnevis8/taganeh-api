const axios = require('axios');
const cheerio = require('cheerio');
const Article = require('../../article/model');
const Tag = require('../../tag/model');
const Category = require('../../category/model');
const Agency = require('../../agency/model');

const BASE_URL = 'https://fararu.com';

async function getCategoryBySlug(slug) {
  const category = await Category.findOne({ where: { slug } });
  if (!category) throw new Error(`Category with slug ${slug} not found.`);
  return category;
}

class FararuScraper {
  static async scrapePolitics() {
    const url = `${BASE_URL}/بخش-سیاست-90`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];

    $('div.tab_box.landing_b ul.list > li.items').each((i, el) => {
      const a = $(el).find('a.title');
      const href = a.attr('href');
      if (!href) return;

      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = a.text().trim();
      
      articles.push({ link, title });
    });

    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);

        let tags = [];
        const metaKeywords = $$('meta[name="keywords"]').attr('content');
        if (metaKeywords) {
          tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
        }
        
        if(tags.length === 0){
             $$('.tags a').each((i, el) => {
                const tag = $$(el).text().trim();
                if (tag) tags.push(tag);
            });
        }

        const timeElem = $$('.news_time time');
        const publishedAt = timeElem.attr('datetime') || null;
        const publishedAtText = timeElem.text().replace(/\s+/g, ' ').trim();

        let mainImage = $$('meta[property="og:image"]').attr('content');
        if(!mainImage){
            mainImage = $$('.body-media img').attr('src');
        }
        if (mainImage && !mainImage.startsWith('http')) mainImage = BASE_URL + mainImage;

        let lead = $$('meta[property="og:description"]').attr('content');
        if(!lead){
             lead = $$('.lead').text().trim();
        }

        article.title = $$('meta[property="og:title"]').attr('content') || article.title;
        article.lead = lead || '';
        article.image = mainImage || null;
        article.tags = [...new Set(tags)];
        article.publishedAt = publishedAt;
        article.publishedAtText = publishedAtText;

      } catch (err) {
        console.error(`Fararu: Error fetching article details for: ${article.link}`, err.message);
      }
    }

    return articles;
  }

  static async scrapeAndSavePolitics() {
    const articles = await this.scrapePolitics();
    if (!articles || articles.length === 0) {
      throw new Error('No political articles found from Fararu.');
    }
    
    const article = articles.find(a => a.title && a.link);
    if (!article) {
        throw new Error('No complete political articles could be scraped from Fararu.');
    }

    const existingArticle = await Article.findOne({ where: { sourceUrl: article.link } });
    if (existingArticle) {
      throw new Error('This article has already been saved.');
    }

    const tagIds = [];
    if (article.tags) {
        const uniqueTags = [...new Set(article.tags)];
        for (const tagName of uniqueTags) {
            const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name:tagName } });
            tagIds.push(tag.id);
        }
    }

    const category = await getCategoryBySlug('politics');
    const agency = await Agency.findOne({ where: { nameEn: 'Fararu News Agency' } });
    if (!agency) {
      throw new Error('Fararu News Agency not found.');
    }

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

    if (tagIds.length > 0) {
        await newArticle.setTags(tagIds);
    }
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
    const url = `${BASE_URL}/بخش-ورزشی-140`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];

    $('div.tab_box.landing_b ul.list > li.items').each((i, el) => {
      const a = $(el).find('a.title');
      const href = a.attr('href');
      if (!href) return;

      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = a.text().trim();
      
      articles.push({ link, title });
    });

    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);

        let tags = [];
        const metaKeywords = $$('meta[name="keywords"]').attr('content');
        if (metaKeywords) {
          tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
        }
        
        if(tags.length === 0){
             $$('.tags a').each((i, el) => {
                const tag = $$(el).text().trim();
                if (tag) tags.push(tag);
            });
        }

        const timeElem = $$('.news_time time');
        const publishedAt = timeElem.attr('datetime') || null;
        const publishedAtText = timeElem.text().replace(/\s+/g, ' ').trim();

        let mainImage = $$('meta[property="og:image"]').attr('content');
        if(!mainImage){
            mainImage = $$('.body-media img').attr('src');
        }
        if (mainImage && !mainImage.startsWith('http')) mainImage = BASE_URL + mainImage;

        let lead = $$('meta[property="og:description"]').attr('content');
        if(!lead){
             lead = $$('.lead').text().trim();
        }

        article.title = $$('meta[property="og:title"]').attr('content') || article.title;
        article.lead = lead || '';
        article.image = mainImage || null;
        article.tags = [...new Set(tags)];
        article.publishedAt = publishedAt;
        article.publishedAtText = publishedAtText;

      } catch (err) {
        console.error(`Fararu: Error fetching article details for: ${article.link}`, err.message);
      }
    }

    return articles;
  }

  static async scrapeAndSaveSports() {
    const articles = await this.scrapeSports();
    if (!articles || articles.length === 0) {
      throw new Error('No sports articles found from Fararu.');
    }
    
    const article = articles.find(a => a.title && a.link);
    if (!article) {
        throw new Error('No complete sports articles could be scraped from Fararu.');
    }

    const existingArticle = await Article.findOne({ where: { sourceUrl: article.link } });
    if (existingArticle) {
      throw new Error('This article has already been saved.');
    }

    const tagIds = [];
    if (article.tags) {
        const uniqueTags = [...new Set(article.tags)];
        for (const tagName of uniqueTags) {
            const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name:tagName } });
            tagIds.push(tag.id);
        }
    }

    const category = await getCategoryBySlug('sports');
    const agency = await Agency.findOne({ where: { nameEn: 'Fararu News Agency' } });
    if (!agency) {
      throw new Error('Fararu News Agency not found.');
    }

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

    if (tagIds.length > 0) {
        await newArticle.setTags(tagIds);
    }
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
    const url = `${BASE_URL}/بخش-علم-تکنولوژی-68`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];

    $('div.tab_box.landing_b ul.list > li.items').each((i, el) => {
      const a = $(el).find('a.title');
      const href = a.attr('href');
      if (!href) return;

      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = a.text().trim();
      
      articles.push({ link, title });
    });

    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);

        let tags = [];
        const metaKeywords = $$('meta[name="keywords"]').attr('content');
        if (metaKeywords) {
          tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
        }
        
        if(tags.length === 0){
             $$('.tags a').each((i, el) => {
                const tag = $$(el).text().trim();
                if (tag) tags.push(tag);
            });
        }

        const timeElem = $$('.news_time time');
        const publishedAt = timeElem.attr('datetime') || null;
        const publishedAtText = timeElem.text().replace(/\s+/g, ' ').trim();

        let mainImage = $$('meta[property="og:image"]').attr('content');
        if(!mainImage){
            mainImage = $$('.body-media img').attr('src');
        }
        if (mainImage && !mainImage.startsWith('http')) mainImage = BASE_URL + mainImage;

        let lead = $$('meta[property="og:description"]').attr('content');
        if(!lead){
             lead = $$('.lead').text().trim();
        }

        article.title = $$('meta[property="og:title"]').attr('content') || article.title;
        article.lead = lead || '';
        article.image = mainImage || null;
        article.tags = [...new Set(tags)];
        article.publishedAt = publishedAt;
        article.publishedAtText = publishedAtText;

      } catch (err) {
        console.error(`Fararu: Error fetching article details for: ${article.link}`, err.message);
      }
    }

    return articles;
  }

  static async scrapeAndSaveScienceTech() {
    const articles = await this.scrapeScienceTech();
    if (!articles || articles.length === 0) {
      throw new Error('No science-tech articles found from Fararu.');
    }
    
    const article = articles.find(a => a.title && a.link);
    if (!article) {
        throw new Error('No complete science-tech articles could be scraped from Fararu.');
    }

    const existingArticle = await Article.findOne({ where: { sourceUrl: article.link } });
    if (existingArticle) {
      throw new Error('This article has already been saved.');
    }

    const tagIds = [];
    if (article.tags) {
        const uniqueTags = [...new Set(article.tags)];
        for (const tagName of uniqueTags) {
            const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name:tagName } });
            tagIds.push(tag.id);
        }
    }

    const category = await getCategoryBySlug('science-tech');
    const agency = await Agency.findOne({ where: { nameEn: 'Fararu News Agency' } });
    if (!agency) {
      throw new Error('Fararu News Agency not found.');
    }

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

    if (tagIds.length > 0) {
        await newArticle.setTags(tagIds);
    }
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
    const url = `${BASE_URL}/بخش-اقتصاد-22`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];

    $('div.tab_box.landing_b ul.list > li.items').each((i, el) => {
      const a = $(el).find('a.title');
      const href = a.attr('href');
      if (!href) return;

      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = a.text().trim();
      articles.push({ link, title });
    });

    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);

        let tags = [];
        const metaKeywords = $$('meta[name="keywords"]').attr('content');
        if (metaKeywords) {
          tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
        }
        $$('.article_tag.noprint a').each((i, el) => {
          const tag = $$(el).text().trim();
          if (tag && !tags.includes(tag)) tags.push(tag);
        });

        const timeElem = $$('.news_time time');
        const publishedAt = timeElem.attr('datetime') || null;
        const publishedAtText = timeElem.text().replace(/\s+/g, ' ').trim();

        let mainImage = $$('meta[property="og:image"]').attr('content');
        if(!mainImage){
            mainImage = $$('.body-media img').attr('src');
        }
        if (mainImage && !mainImage.startsWith('http')) mainImage = BASE_URL + mainImage;

        let lead = $$('meta[property="og:description"]').attr('content');
        if(!lead){
             lead = $$('.lead').text().trim();
        }

        article.title = $$('meta[property="og:title"]').attr('content') || article.title;
        article.lead = lead || '';
        article.image = mainImage || null;
        article.tags = [...new Set(tags)];
        article.publishedAt = publishedAt;
        article.publishedAtText = publishedAtText;

      } catch (err) {
        console.error(`Fararu: Error fetching article details for: ${article.link}`, err.message);
      }
    }

    return articles;
  }

  static async scrapeAndSaveEconomy() {
    const articles = await this.scrapeEconomy();
    if (!articles || articles.length === 0) {
      throw new Error('No economy articles found from Fararu.');
    }
    
    const article = articles.find(a => a.title && a.link);
    if (!article) {
        throw new Error('No complete economy articles could be scraped from Fararu.');
    }

    const existingArticle = await Article.findOne({ where: { sourceUrl: article.link } });
    if (existingArticle) {
      throw new Error('This article has already been saved.');
    }

    const tagIds = [];
    if (article.tags) {
        const uniqueTags = [...new Set(article.tags)];
        for (const tagName of uniqueTags) {
            const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name:tagName } });
            tagIds.push(tag.id);
        }
    }

    const category = await getCategoryBySlug('economy');
    const agency = await Agency.findOne({ where: { nameEn: 'Fararu News Agency' } });
    if (!agency) {
      throw new Error('Fararu News Agency not found.');
    }

    const newArticle = await Article.create({
      title: article.title,
      summary: article.lead || '',
      sourceUrl: article.link,
      imageUrl: article.image || null,
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
      agencyId: agency.id,
      isActive: true,
      scrapedAt: new Date()
    });

    if (tagIds.length > 0) {
        await newArticle.setTags(tagIds);
    }
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

  static async scrapeSociety() {
    const url = `${BASE_URL}/بخش-جامعه-101`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];

    $('div.tab_box.landing_b ul.list > li.items').each((i, el) => {
      const a = $(el).find('a.title');
      const href = a.attr('href');
      if (!href) return;

      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = a.text().trim();
      articles.push({ link, title });
    });

    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);

        let tags = [];
        const metaKeywords = $$('meta[name="keywords"]').attr('content');
        if (metaKeywords) {
          tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
        }
        $$('.article_tag.noprint a').each((i, el) => {
          const tag = $$(el).text().trim();
          if (tag && !tags.includes(tag)) tags.push(tag);
        });

        const timeElem = $$('.news_time time');
        const publishedAt = timeElem.attr('datetime') || null;
        const publishedAtText = timeElem.text().replace(/\s+/g, ' ').trim();

        let mainImage = $$('meta[property="og:image"]').attr('content');
        if(!mainImage){
            mainImage = $$('.body-media img').attr('src');
        }
        if (mainImage && !mainImage.startsWith('http')) mainImage = BASE_URL + mainImage;

        let lead = $$('meta[property="og:description"]').attr('content');
        if(!lead){
             lead = $$('.lead').text().trim();
        }

        article.title = $$('meta[property="og:title"]').attr('content') || article.title;
        article.lead = lead || '';
        article.image = mainImage || null;
        article.tags = [...new Set(tags)];
        article.publishedAt = publishedAt;
        article.publishedAtText = publishedAtText;

      } catch (err) {
        console.error(`Fararu: Error fetching article details for: ${article.link}`, err.message);
      }
    }

    return articles;
  }

  static async scrapeAndSaveSociety() {
    const articles = await this.scrapeSociety();
    if (!articles || articles.length === 0) {
      throw new Error('No society articles found from Fararu.');
    }
    
    const article = articles.find(a => a.title && a.link);
    if (!article) {
        throw new Error('No complete society articles could be scraped from Fararu.');
    }

    const existingArticle = await Article.findOne({ where: { sourceUrl: article.link } });
    if (existingArticle) {
      throw new Error('This article has already been saved.');
    }

    const tagIds = [];
    if (article.tags) {
        const uniqueTags = [...new Set(article.tags)];
        for (const tagName of uniqueTags) {
            const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name:tagName } });
            tagIds.push(tag.id);
        }
    }

    const category = await getCategoryBySlug('social');
    const agency = await Agency.findOne({ where: { nameEn: 'Fararu News Agency' } });
    if (!agency) {
      throw new Error('Fararu News Agency not found.');
    }

    const newArticle = await Article.create({
      title: article.title,
      summary: article.lead || '',
      sourceUrl: article.link,
      imageUrl: article.image || null,
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
      agencyId: agency.id,
      isActive: true,
      scrapedAt: new Date()
    });

    if (tagIds.length > 0) {
        await newArticle.setTags(tagIds);
    }
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
    const url = `${BASE_URL}/بخش-فرهنگ-هنر-85`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];

    $('div.tab_box.landing_b ul.list > li.items').each((i, el) => {
      const a = $(el).find('a.title');
      const href = a.attr('href');
      if (!href) return;

      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = a.text().trim();
      articles.push({ link, title });
    });

    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);

        let tags = [];
        const metaKeywords = $$('meta[name="keywords"]').attr('content');
        if (metaKeywords) {
          tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
        }
        $$('.article_tag.noprint a').each((i, el) => {
          const tag = $$(el).text().trim();
          if (tag && !tags.includes(tag)) tags.push(tag);
        });

        const timeElem = $$('.news_time time');
        const publishedAt = timeElem.attr('datetime') || null;
        const publishedAtText = timeElem.text().replace(/\s+/g, ' ').trim();

        let mainImage = $$('meta[property="og:image"]').attr('content');
        if(!mainImage){
            mainImage = $$('.body-media img').attr('src');
        }
        if (mainImage && !mainImage.startsWith('http')) mainImage = BASE_URL + mainImage;

        let lead = $$('meta[property="og:description"]').attr('content');
        if(!lead){
             lead = $$('.lead').text().trim();
        }

        article.title = $$('meta[property="og:title"]').attr('content') || article.title;
        article.lead = lead || '';
        article.image = mainImage || null;
        article.tags = [...new Set(tags)];
        article.publishedAt = publishedAt;
        article.publishedAtText = publishedAtText;

      } catch (err) {
        console.error(`Fararu: Error fetching article details for: ${article.link}`, err.message);
      }
    }

    return articles;
  }

  static async scrapeAndSaveCultureArt() {
    const articles = await this.scrapeCultureArt();
    if (!articles || articles.length === 0) {
      throw new Error('No culture-art articles found from Fararu.');
    }
    
    const article = articles.find(a => a.title && a.link);
    if (!article) {
        throw new Error('No complete culture-art articles could be scraped from Fararu.');
    }

    const existingArticle = await Article.findOne({ where: { sourceUrl: article.link } });
    if (existingArticle) {
      throw new Error('This article has already been saved.');
    }

    const tagIds = [];
    if (article.tags) {
        const uniqueTags = [...new Set(article.tags)];
        for (const tagName of uniqueTags) {
            const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name:tagName } });
            tagIds.push(tag.id);
        }
    }

    const category = await getCategoryBySlug('culture-art');
    const agency = await Agency.findOne({ where: { nameEn: 'Fararu News Agency' } });
    if (!agency) {
      throw new Error('Fararu News Agency not found.');
    }

    const newArticle = await Article.create({
      title: article.title,
      summary: article.lead || '',
      sourceUrl: article.link,
      imageUrl: article.image || null,
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
      agencyId: agency.id,
      isActive: true,
      scrapedAt: new Date()
    });

    if (tagIds.length > 0) {
        await newArticle.setTags(tagIds);
    }
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
    const url = `${BASE_URL}/بخش-جهان-56`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];

    $('div.tab_box.landing_b ul.list > li.items').each((i, el) => {
      const a = $(el).find('a.title');
      const href = a.attr('href');
      if (!href) return;

      const link = href.startsWith('http') ? href : BASE_URL + href;
      const title = a.text().trim();
      articles.push({ link, title });
    });

    for (const article of articles) {
      try {
        const { data: articleHtml } = await axios.get(article.link);
        const $$ = cheerio.load(articleHtml);

        let tags = [];
        const metaKeywords = $$('meta[name="keywords"]').attr('content');
        if (metaKeywords) {
          tags = metaKeywords.split(',').map(t => t.trim()).filter(Boolean);
        }
        $$('.article_tag.noprint a').each((i, el) => {
          const tag = $$(el).text().trim();
          if (tag && !tags.includes(tag)) tags.push(tag);
        });

        const timeElem = $$('.news_time time');
        const publishedAt = timeElem.attr('datetime') || null;
        const publishedAtText = timeElem.text().replace(/\s+/g, ' ').trim();

        let mainImage = $$('meta[property="og:image"]').attr('content');
        if(!mainImage){
            mainImage = $$('.body-media img').attr('src');
        }
        if (mainImage && !mainImage.startsWith('http')) mainImage = BASE_URL + mainImage;

        let lead = $$('meta[property="og:description"]').attr('content');
        if(!lead){
             lead = $$('.lead').text().trim();
        }

        article.title = $$('meta[property="og:title"]').attr('content') || article.title;
        article.lead = lead || '';
        article.image = mainImage || null;
        article.tags = [...new Set(tags)];
        article.publishedAt = publishedAt;
        article.publishedAtText = publishedAtText;

      } catch (err) {
        console.error(`Fararu: Error fetching article details for: ${article.link}`, err.message);
      }
    }

    return articles;
  }

  static async scrapeAndSaveInternational() {
    const articles = await this.scrapeInternational();
    if (!articles || articles.length === 0) {
      throw new Error('No international articles found from Fararu.');
    }
    
    const article = articles.find(a => a.title && a.link);
    if (!article) {
        throw new Error('No complete international articles could be scraped from Fararu.');
    }

    const existingArticle = await Article.findOne({ where: { sourceUrl: article.link } });
    if (existingArticle) {
      throw new Error('This article has already been saved.');
    }

    const tagIds = [];
    if (article.tags) {
        const uniqueTags = [...new Set(article.tags)];
        for (const tagName of uniqueTags) {
            const [tag] = await Tag.findOrCreate({ where: { name: tagName }, defaults: { name:tagName } });
            tagIds.push(tag.id);
        }
    }

    const category = await getCategoryBySlug('international');
    const agency = await Agency.findOne({ where: { nameEn: 'Fararu News Agency' } });
    if (!agency) {
      throw new Error('Fararu News Agency not found.');
    }

    const newArticle = await Article.create({
      title: article.title,
      summary: article.lead || '',
      sourceUrl: article.link,
      imageUrl: article.image || null,
      publishedAt: article.publishedAt ? new Date(article.publishedAt) : new Date(),
      agencyId: agency.id,
      isActive: true,
      scrapedAt: new Date()
    });

    if (tagIds.length > 0) {
        await newArticle.setTags(tagIds);
    }
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

module.exports = FararuScraper; 
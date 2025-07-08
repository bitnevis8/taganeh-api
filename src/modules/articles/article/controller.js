const BaseController = require("../../../core/baseController");
const Article = require("./model");
const Agency = require("../agency/model");
const Category = require("../category/model");
const Tag = require("../tag/model");
const Joi = require("joi");
const { Op } = require("sequelize");

class ArticleController extends BaseController {
  constructor() {
    super(Article);
  }

  // ✅ دریافت تمام مقالات
  async getAll(req, res) {
    try {
      const { 
        sortBy, 
        sortOrder, 
        agencyId, 
        categoryId, 
        tagId, 
        page = 1, 
        limit = 20,
        search 
      } = req.query;
      
      const order = [];
      const allowedSortColumns = ["title", "publishedAt", "createdAt", "scrapedAt"];

      if (sortBy && allowedSortColumns.includes(sortBy)) {
        order.push([sortBy, sortOrder && sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"]);
      }

      const whereClause = { isActive: true };
      const includeClause = [
        {
          model: Agency,
          as: 'agency',
          attributes: ['id', 'name', 'logo']
        },
        {
          model: Category,
          as: 'categories',
          attributes: ['id', 'name', 'slug'],
          through: { attributes: [] }
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['id', 'name'],
          through: { attributes: [] }
        }
      ];

      // فیلتر بر اساس آژانس
      if (agencyId) {
        whereClause.agencyId = agencyId;
      }

      // فیلتر بر اساس دسته‌بندی
      if (categoryId) {
        includeClause[1].where = { id: categoryId };
      }

      // فیلتر بر اساس تگ
      if (tagId) {
        includeClause[2].where = { id: tagId };
      }

      // جستجو در عنوان و محتوا
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } },
          { summary: { [Op.like]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const articles = await Article.findAndCountAll({
        where: whereClause,
        include: includeClause,
        order: order.length > 0 ? order : [['publishedAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset,
        distinct: true
      });

      const totalPages = Math.ceil(articles.count / limit);

      return this.response(res, 200, true, "لیست مقالات دریافت شد.", {
        articles: articles.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: articles.count,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error("❌ Error in getAll:", error);
      return this.response(
        res,
        500,
        false,
        error.message || "خطا در دریافت داده‌ها",
        null,
        error
      );
    }
  }

  // ✅ دریافت یک مقاله بر اساس ID
  async getOne(req, res) {
    try {
      const article = await Article.findByPk(req.params.id, {
        include: [
          {
            model: Agency,
            as: 'agency',
            attributes: ['id', 'name', 'logo', 'websiteUrl']
          },
          {
            model: Category,
            as: 'categories',
            attributes: ['id', 'name', 'slug'],
            through: { attributes: [] }
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }
        ]
      });
      
      if (!article) {
        return this.response(res, 404, false, "مقاله یافت نشد.");
      }

      return this.response(res, 200, true, "مقاله دریافت شد.", article);
    } catch (error) {
      console.error("❌ Error in getOne:", error);
      return this.response(res, 500, false, "خطا در دریافت داده", null, error);
    }
  }

  // ✅ ایجاد یک مقاله جدید
  async create(req, res) {
    try {
      const { 
        title, 
        content, 
        summary, 
        sourceUrl, 
        imageUrl, 
        publishedAt, 
        agencyId,
        categoryIds,
        tagIds 
      } = req.body;

      // اعتبارسنجی ورودی‌ها
      const schema = Joi.object({
        title: Joi.string().required().max(500),
        content: Joi.string().required(),
        summary: Joi.string().optional().allow('', null),
        sourceUrl: Joi.string().uri().required().max(500),
        imageUrl: Joi.string().uri().optional().allow('', null).max(500),
        publishedAt: Joi.date().required(),
        agencyId: Joi.number().integer().required(),
        categoryIds: Joi.array().items(Joi.number().integer()).optional(),
        tagIds: Joi.array().items(Joi.number().integer()).optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return this.response(res, 400, false, error.details[0].message);
      }

      // چک کردن تکراری بودن sourceUrl
      const existingArticle = await Article.findOne({
        where: { sourceUrl: value.sourceUrl }
      });

      if (existingArticle) {
        return this.response(res, 400, false, "این مقاله قبلاً ثبت شده است.");
      }

      // چک کردن وجود آژانس
      const agency = await Agency.findByPk(value.agencyId);
      if (!agency) {
        return this.response(res, 400, false, "آژانس خبری یافت نشد.");
      }

      // ایجاد مقاله جدید
      const newArticle = await Article.create({
        title: value.title,
        content: value.content,
        summary: value.summary || null,
        sourceUrl: value.sourceUrl,
        imageUrl: value.imageUrl || null,
        publishedAt: value.publishedAt,
        agencyId: value.agencyId,
        scrapedAt: new Date()
      });

      // اضافه کردن دسته‌بندی‌ها
      if (value.categoryIds && value.categoryIds.length > 0) {
        const categories = await Category.findAll({
          where: { id: value.categoryIds }
        });
        await newArticle.setCategories(categories);
      }

      // اضافه کردن تگ‌ها
      if (value.tagIds && value.tagIds.length > 0) {
        const tags = await Tag.findAll({
          where: { id: value.tagIds }
        });
        await newArticle.setTags(tags);
      }

      // دریافت مقاله با اطلاعات مرتبط
      const createdArticle = await Article.findByPk(newArticle.id, {
        include: [
          {
            model: Agency,
            as: 'agency',
            attributes: ['id', 'name', 'logo']
          },
          {
            model: Category,
            as: 'categories',
            attributes: ['id', 'name', 'slug'],
            through: { attributes: [] }
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }
        ]
      });

      return this.response(res, 201, true, "مقاله جدید ایجاد شد.", createdArticle);
    } catch (error) {
      console.error("❌ Error in create:", error);
      return this.response(res, 500, false, "خطا در ایجاد مقاله", null, error);
    }
  }

  // ✅ ویرایش یک مقاله
  async update(req, res) {
    try {
      const article = await Article.findByPk(req.params.id);
      if (!article) {
        return this.response(res, 404, false, "مقاله یافت نشد.");
      }

      const { 
        title, 
        content, 
        summary, 
        sourceUrl, 
        imageUrl, 
        publishedAt, 
        agencyId,
        categoryIds,
        tagIds 
      } = req.body;

      // اعتبارسنجی ورودی‌ها
      const schema = Joi.object({
        title: Joi.string().required().max(500),
        content: Joi.string().required(),
        summary: Joi.string().optional().allow('', null),
        sourceUrl: Joi.string().uri().required().max(500),
        imageUrl: Joi.string().uri().optional().allow('', null).max(500),
        publishedAt: Joi.date().required(),
        agencyId: Joi.number().integer().required(),
        categoryIds: Joi.array().items(Joi.number().integer()).optional(),
        tagIds: Joi.array().items(Joi.number().integer()).optional()
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return this.response(res, 400, false, error.details[0].message);
      }

      // چک کردن تکراری بودن sourceUrl (به جز خودش)
      const existingArticle = await Article.findOne({
        where: { 
          sourceUrl: value.sourceUrl,
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingArticle) {
        return this.response(res, 400, false, "این مقاله قبلاً ثبت شده است.");
      }

      // چک کردن وجود آژانس
      const agency = await Agency.findByPk(value.agencyId);
      if (!agency) {
        return this.response(res, 400, false, "آژانس خبری یافت نشد.");
      }

      // بروزرسانی مقاله
      await article.update({
        title: value.title,
        content: value.content,
        summary: value.summary || null,
        sourceUrl: value.sourceUrl,
        imageUrl: value.imageUrl || null,
        publishedAt: value.publishedAt,
        agencyId: value.agencyId
      });

      // بروزرسانی دسته‌بندی‌ها
      if (value.categoryIds !== undefined) {
        if (value.categoryIds && value.categoryIds.length > 0) {
          const categories = await Category.findAll({
            where: { id: value.categoryIds }
          });
          await article.setCategories(categories);
        } else {
          await article.setCategories([]);
        }
      }

      // بروزرسانی تگ‌ها
      if (value.tagIds !== undefined) {
        if (value.tagIds && value.tagIds.length > 0) {
          const tags = await Tag.findAll({
            where: { id: value.tagIds }
          });
          await article.setTags(tags);
        } else {
          await article.setTags([]);
        }
      }

      // دریافت مقاله بروزرسانی شده
      const updatedArticle = await Article.findByPk(req.params.id, {
        include: [
          {
            model: Agency,
            as: 'agency',
            attributes: ['id', 'name', 'logo']
          },
          {
            model: Category,
            as: 'categories',
            attributes: ['id', 'name', 'slug'],
            through: { attributes: [] }
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }
        ]
      });

      return this.response(res, 200, true, "مقاله بروزرسانی شد.", updatedArticle);
    } catch (error) {
      console.error("❌ Error in update:", error);
      return this.response(res, 500, false, "خطا در بروزرسانی مقاله", null, error);
    }
  }

  // ✅ حذف یک مقاله
  async delete(req, res) {
    try {
      const article = await Article.findByPk(req.params.id);
      if (!article) {
        return this.response(res, 404, false, "مقاله یافت نشد.");
      }

      // حذف منطقی
      await article.update({ isActive: false });

      return this.response(res, 200, true, "مقاله حذف شد.");
    } catch (error) {
      console.error("❌ Error in delete:", error);
      return this.response(res, 500, false, "خطا در حذف مقاله", null, error);
    }
  }

  // ✅ جستجو در مقالات
  async search(req, res) {
    try {
      const { q, page = 1, limit = 20 } = req.query;
      
      if (!q) {
        return this.response(res, 400, false, "پارامتر جستجو الزامی است.");
      }

      const offset = (page - 1) * limit;

      const articles = await Article.findAndCountAll({
        where: {
          [Op.and]: [
            { isActive: true },
            {
              [Op.or]: [
                { title: { [Op.like]: `%${q}%` } },
                { content: { [Op.like]: `%${q}%` } },
                { summary: { [Op.like]: `%${q}%` } }
              ]
            }
          ]
        },
        include: [
          {
            model: Agency,
            as: 'agency',
            attributes: ['id', 'name', 'logo']
          },
          {
            model: Category,
            as: 'categories',
            attributes: ['id', 'name', 'slug'],
            through: { attributes: [] }
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }
        ],
        order: [['publishedAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset,
        distinct: true
      });

      const totalPages = Math.ceil(articles.count / limit);

      return this.response(res, 200, true, "نتایج جستجو دریافت شد.", {
        articles: articles.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: articles.count,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error("❌ Error in search:", error);
      return this.response(res, 500, false, "خطا در جستجو", null, error);
    }
  }

  // ✅ دریافت مقالات یک آژانس
  async getByAgency(req, res) {
    try {
      const { agencyId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const offset = (page - 1) * limit;

      const articles = await Article.findAndCountAll({
        where: { 
          agencyId: agencyId,
          isActive: true 
        },
        include: [
          {
            model: Agency,
            as: 'agency',
            attributes: ['id', 'name', 'logo']
          },
          {
            model: Category,
            as: 'categories',
            attributes: ['id', 'name', 'slug'],
            through: { attributes: [] }
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }
        ],
        order: [['publishedAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset,
        distinct: true
      });

      const totalPages = Math.ceil(articles.count / limit);

      return this.response(res, 200, true, "مقالات آژانس دریافت شد.", {
        articles: articles.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: articles.count,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error("❌ Error in getByAgency:", error);
      return this.response(res, 500, false, "خطا در دریافت مقالات آژانس", null, error);
    }
  }

  // ✅ دریافت مقالات یک دسته‌بندی
  async getByCategory(req, res) {
    try {
      const { categoryId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const offset = (page - 1) * limit;

      const articles = await Article.findAndCountAll({
        where: { isActive: true },
        include: [
          {
            model: Agency,
            as: 'agency',
            attributes: ['id', 'name', 'logo']
          },
          {
            model: Category,
            as: 'categories',
            attributes: ['id', 'name', 'slug'],
            where: { id: categoryId },
            through: { attributes: [] }
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name'],
            through: { attributes: [] }
          }
        ],
        order: [['publishedAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset,
        distinct: true
      });

      const totalPages = Math.ceil(articles.count / limit);

      return this.response(res, 200, true, "مقالات دسته‌بندی دریافت شد.", {
        articles: articles.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: articles.count,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error("❌ Error in getByCategory:", error);
      return this.response(res, 500, false, "خطا در دریافت مقالات دسته‌بندی", null, error);
    }
  }

  // ✅ دریافت مقالات یک تگ
  async getByTag(req, res) {
    try {
      const { tagId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      const offset = (page - 1) * limit;

      const articles = await Article.findAndCountAll({
        where: { isActive: true },
        include: [
          {
            model: Agency,
            as: 'agency',
            attributes: ['id', 'name', 'logo']
          },
          {
            model: Category,
            as: 'categories',
            attributes: ['id', 'name', 'slug'],
            through: { attributes: [] }
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name'],
            where: { id: tagId },
            through: { attributes: [] }
          }
        ],
        order: [['publishedAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset,
        distinct: true
      });

      const totalPages = Math.ceil(articles.count / limit);

      return this.response(res, 200, true, "مقالات تگ دریافت شد.", {
        articles: articles.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: articles.count,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error("❌ Error in getByTag:", error);
      return this.response(res, 500, false, "خطا در دریافت مقالات تگ", null, error);
    }
  }

  // ✅ دریافت مقالات بر اساس چندین تگ
  async getByTags(req, res) {
    try {
      const { tagIds, page = 1, limit = 20 } = req.query;
      if (!tagIds) {
        return this.response(res, 400, false, "شناسه‌های تگ‌ها الزامی است.");
      }
      const tagIdsArray = Array.isArray(tagIds) ? tagIds : tagIds.split(',').map(id => parseInt(id.trim()));
      if (tagIdsArray.length === 0) {
        return this.response(res, 400, false, "حداقل یک تگ باید انتخاب شود.");
      }
      const offset = (page - 1) * limit;

      const articles = await Article.findAndCountAll({
        where: { isActive: true },
        include: [
          {
            model: Agency,
            as: 'agency',
            attributes: ['id', 'name', 'logo']
          },
          {
            model: Category,
            as: 'categories',
            attributes: ['id', 'name', 'slug'],
            through: { attributes: [] }
          },
          {
            model: Tag,
            as: 'tags',
            attributes: ['id', 'name'],
            where: { id: { [Op.in]: tagIdsArray } },
            through: { attributes: [] }
          }
        ],
        order: [['publishedAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset,
        distinct: true
      });

      const totalPages = Math.ceil(articles.count / limit);

      return this.response(res, 200, true, "مقالات بر اساس تگ‌ها دریافت شد.", {
        articles: articles.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: articles.count,
          itemsPerPage: parseInt(limit)
        },
        selectedTags: tagIdsArray
      });
    } catch (error) {
      console.error("❌ Error in getByTags:", error);
      return this.response(res, 500, false, "خطا در دریافت مقالات بر اساس تگ‌ها", null, error);
    }
  }
}

module.exports = new ArticleController(); 
const BaseController = require("../../../core/baseController");
const Tag = require("./model");
const Class = require("../class/model");
const ClassTag = require("../classTag/model");
const Joi = require("joi");
const { Op } = require("sequelize");

class TagController extends BaseController {
  constructor() {
    super(Tag);
  }

  // ✅ دریافت تمام تگ‌ها
  async getAll(req, res) {
    try {
      const { sortBy, sortOrder, hasFamily } = req.query;
      const order = [];
      const allowedSortColumns = ["name", "createdAt"];

      if (sortBy && allowedSortColumns.includes(sortBy)) {
        order.push([sortBy, sortOrder && sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"]);
      }

      const whereClause = { isActive: true };
      
      // فیلتر بر اساس hasFamily
      if (hasFamily !== undefined) {
        whereClause.hasFamily = hasFamily === 'true';
      }

      const tags = await Tag.findAll({
        where: whereClause,
        order: order.length > 0 ? order : [['createdAt', 'DESC']]
      });

      return this.response(res, 200, true, "لیست تگ‌ها دریافت شد.", tags);
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

  // ✅ دریافت یک تگ بر اساس ID
  async getOne(req, res) {
    try {
      const tag = await Tag.findByPk(req.params.id);
      
      if (!tag) {
        return this.response(res, 404, false, "تگ یافت نشد.");
      }

      return this.response(res, 200, true, "تگ دریافت شد.", tag);
    } catch (error) {
      console.error("❌ Error in getOne:", error);
      return this.response(res, 500, false, "خطا در دریافت داده", null, error);
    }
  }

  // ✅ دریافت یک تگ بر اساس نام
  async getByName(req, res) {
    try {
      const { name } = req.params;
      
      if (!name) {
        return this.response(res, 400, false, "نام تگ الزامی است.");
      }

      // Decode the name parameter to handle spaces and special characters
      const decodedName = decodeURIComponent(name);
      console.log('=== DEBUG getByName ===');
      console.log('Original name param:', name);
      console.log('Decoded name:', decodedName);
      console.log('Request URL:', req.url);
      console.log('Request params:', req.params);

      // First, let's see all tags in the database
      const allTags = await Tag.findAll({
        where: { isActive: true }
      });
      
      console.log('All tags in database:');
      allTags.forEach(tag => {
        console.log(`- ID: ${tag.id}, Name: "${tag.name}", isActive: ${tag.isActive}`);
      });

      const tag = await Tag.findOne({
        where: { 
          name: decodedName,
          isActive: true 
        }
      });
      
      if (!tag) {
        console.log('Tag not found for exact name:', decodedName);
        // Try case-insensitive search as fallback
        const foundTag = allTags.find(t => 
          t.name.toLowerCase() === decodedName.toLowerCase()
        );
        
        if (foundTag) {
          console.log('Found tag with case-insensitive search:', foundTag.name);
          return this.response(res, 200, true, "تگ دریافت شد.", foundTag);
        }
        
        console.log('No tag found even with case-insensitive search');
        return this.response(res, 404, false, "تگ یافت نشد.");
      }

      console.log('Found tag:', tag.name);
      return this.response(res, 200, true, "تگ دریافت شد.", tag);
    } catch (error) {
      console.error("❌ Error in getByName:", error);
      return this.response(res, 500, false, "خطا در دریافت داده", null, error);
    }
  }

  // ✅ ایجاد یک تگ جدید
  async create(req, res) {
    try {
      const { name, description, hasFamily, tagFamilyId } = req.body;

      // اعتبارسنجی ورودی‌ها
      const schema = Joi.object({
        name: Joi.string().required().max(100),
        description: Joi.string().optional().allow('', null),
        hasFamily: Joi.boolean().default(false),
        tagFamilyId: Joi.number().integer().optional().allow(null)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return this.response(res, 400, false, error.details[0].message);
      }

      // چک کردن تکراری بودن نام
      const existingTag = await Tag.findOne({
        where: { name: value.name }
      });

      if (existingTag) {
        return this.response(res, 400, false, "نام تگ قبلاً ثبت شده است.");
      }

      // اگر tagFamilyId ارائه شده، چک کردن وجود خانواده تگ
      if (value.tagFamilyId) {
        // const tagFamily = await TagFamily.findByPk(value.tagFamilyId); // Removed TagFamily check
        // if (!tagFamily) {
        //   return this.response(res, 400, false, "خانواده تگ یافت نشد.");
        // }
      }

      // ایجاد تگ جدید
      const newTag = await Tag.create({
        name: value.name,
        description: value.description || null,
        hasFamily: value.hasFamily,
        tagFamilyId: value.tagFamilyId || null
      });

      // دریافت تگ با اطلاعات خانواده
      const createdTag = await Tag.findByPk(newTag.id);

      return this.response(res, 201, true, "تگ جدید ایجاد شد.", createdTag);
    } catch (error) {
      console.error("❌ Error in create:", error);
      return this.response(res, 500, false, "خطا در ایجاد تگ", null, error);
    }
  }

  // ✅ ویرایش یک تگ
  async update(req, res) {
    try {
      const tag = await Tag.findByPk(req.params.id);
      if (!tag) {
        return this.response(res, 404, false, "تگ یافت نشد.");
      }

      const { name, description, hasFamily, tagFamilyId } = req.body;

      // اعتبارسنجی ورودی‌ها
      const schema = Joi.object({
        name: Joi.string().required().max(100),
        description: Joi.string().optional().allow('', null),
        hasFamily: Joi.boolean().default(false),
        tagFamilyId: Joi.number().integer().optional().allow(null)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return this.response(res, 400, false, error.details[0].message);
      }

      // چک کردن تکراری بودن نام (به جز خودش)
      const existingTag = await Tag.findOne({
        where: { 
          name: value.name,
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingTag) {
        return this.response(res, 400, false, "نام تگ قبلاً ثبت شده است.");
      }

      // اگر tagFamilyId ارائه شده، چک کردن وجود خانواده تگ
      if (value.tagFamilyId) {
        // const tagFamily = await TagFamily.findByPk(value.tagFamilyId); // Removed TagFamily check
        // if (!tagFamily) {
        //   return this.response(res, 400, false, "خانواده تگ یافت نشد.");
        // }
      }

      // بروزرسانی تگ
      await tag.update({
        name: value.name,
        description: value.description || null,
        hasFamily: value.hasFamily,
        tagFamilyId: value.tagFamilyId || null
      });

      // دریافت تگ بروزرسانی شده با اطلاعات خانواده
      const updatedTag = await Tag.findByPk(req.params.id);

      return this.response(res, 200, true, "تگ بروزرسانی شد.", updatedTag);
    } catch (error) {
      console.error("❌ Error in update:", error);
      return this.response(res, 500, false, "خطا در بروزرسانی تگ", null, error);
    }
  }

  // ✅ حذف یک تگ
  async delete(req, res) {
    try {
      const tag = await Tag.findByPk(req.params.id);
      if (!tag) {
        return this.response(res, 404, false, "تگ یافت نشد.");
      }

      // حذف منطقی
      await tag.update({ isActive: false });

      return this.response(res, 200, true, "تگ حذف شد.");
    } catch (error) {
      console.error("❌ Error in delete:", error);
      return this.response(res, 500, false, "خطا در حذف تگ", null, error);
    }
  }

  // ✅ جستجو در تگ‌ها
  async search(req, res) {
    try {
      const { q, hasFamily } = req.query;
      
      if (!q) {
        return this.response(res, 400, false, "پارامتر جستجو الزامی است.");
      }

      const whereClause = {
        [Op.and]: [
          { isActive: true },
          {
            [Op.or]: [
              { name: { [Op.like]: `%${q}%` } },
              { description: { [Op.like]: `%${q}%` } }
            ]
          }
        ]
      };

      // فیلتر بر اساس hasFamily
      if (hasFamily !== undefined) {
        whereClause[Op.and].push({ hasFamily: hasFamily === 'true' });
      }

      const tags = await Tag.findAll({
        where: whereClause,
        order: [['createdAt', 'DESC']]
      });

      return this.response(res, 200, true, "نتایج جستجو دریافت شد.", tags);
    } catch (error) {
      console.error("❌ Error in search:", error);
      return this.response(res, 500, false, "خطا در جستجو", null, error);
    }
  }

  // ✅ دریافت تگ‌های یک خانواده
  async getByFamily(req, res) {
    try {
      const { familyId } = req.params;
      
      const tags = await Tag.findAll({
        where: { 
          tagFamilyId: familyId,
          isActive: true 
        },
        order: [['name', 'ASC']]
      });

      return this.response(res, 200, true, "تگ‌های خانواده دریافت شد.", tags);
    } catch (error) {
      console.error("❌ Error in getByFamily:", error);
      return this.response(res, 500, false, "خطا در دریافت تگ‌های خانواده", null, error);
    }
  }

  // ✅ دریافت تگ‌ها بر اساس کلاس‌هایشان
  async getByClasses(req, res) {
    try {
      // دریافت تمام کلاس‌ها با تگ‌های مربوطه
      const classes = await Class.findAll({
        include: [{
          model: Tag,
          as: 'tags',
          through: { attributes: [] }, // Exclude junction table attributes
          where: { isActive: true },
          required: false // LEFT JOIN
        }],
        order: [
          ['name', 'ASC'],
          [{ model: Tag, as: 'tags' }, 'name', 'ASC']
        ]
      });

      console.log('Classes found:', classes.length);
      classes.forEach(classItem => {
        console.log(`Class: ${classItem.name}, Tags: ${classItem.tags?.length || 0}`);
      });

      // گروه‌بندی تگ‌ها بر اساس کلاس‌ها
      const groupedTags = classes.map(classItem => ({
        classId: classItem.id,
        className: classItem.name,
        classSlug: classItem.slug,
        classDescription: classItem.description,
        parentSlug: classItem.parentSlug,
        tags: classItem.tags || []
      })).filter(classItem => classItem.tags.length > 0); // فقط کلاس‌هایی که تگ دارند

      console.log('Grouped tags:', groupedTags.length, 'classes with tags');

      return this.response(res, 200, true, "تگ‌ها بر اساس کلاس‌ها دریافت شد.", groupedTags);
    } catch (error) {
      console.error("❌ Error in getByClasses:", error);
      return this.response(res, 500, false, "خطا در دریافت داده", null, error);
    }
  }

  // ✅ تست دیتابیس
  async testDatabase(req, res) {
    try {
      const Article = require('../article/model');
      const ArticleTag = require('../articleTag/model');
      
      // شمارش کل مقالات
      const totalArticles = await Article.count();
      const activeArticles = await Article.count({ where: { isActive: true } });
      
      // شمارش کل تگ‌ها
      const totalTags = await Tag.count();
      const activeTags = await Tag.count({ where: { isActive: true } });
      
      // شمارش کل ارتباطات
      const totalArticleTags = await ArticleTag.count();
      
      // چند نمونه مقاله با تگ‌هایشان
      const sampleArticles = await Article.findAll({
        include: [{
          model: Tag,
          as: 'tags',
          through: { attributes: [] }
        }],
        limit: 5
      });
      
      // چند نمونه تگ با مقالاتشان
      const sampleTags = await Tag.findAll({
        include: [{
          model: Article,
          as: 'articles',
          through: { attributes: [] }
        }],
        limit: 5
      });

      // تست شمارش مستقیم برای چند تگ
      const testTagCounts = await Promise.all(
        sampleTags.map(async (tag) => {
          const directCount = await ArticleTag.count({
            where: { tagId: tag.id }
          });
          return {
            id: tag.id,
            name: tag.name,
            associationCount: tag.articles?.length || 0,
            directCount
          };
        })
      );

      return this.response(res, 200, true, "اطلاعات دیتابیس", {
        articles: {
          total: totalArticles,
          active: activeArticles,
          sample: sampleArticles.map(a => ({
            id: a.id,
            title: a.title,
            tagCount: a.tags?.length || 0
          }))
        },
        tags: {
          total: totalTags,
          active: activeTags,
          sample: sampleTags.map(t => ({
            id: t.id,
            name: t.name,
            articleCount: t.articles?.length || 0
          }))
        },
        relationships: {
          totalArticleTags
        },
        testCounts: testTagCounts
      });
    } catch (error) {
      console.error("❌ Error in testDatabase:", error);
      return this.response(res, 500, false, "خطا در تست دیتابیس", null, error);
    }
  }

  // ✅ دریافت همه تگ‌ها با شمارش مقالات
  async getAllWithArticleCount(req, res) {
    try {
      const { sortBy = 'name', sortOrder = 'ASC' } = req.query;
      
      // دریافت همه تگ‌ها
      const tags = await Tag.findAll({
        where: { isActive: true },
        order: [[sortBy, sortOrder.toUpperCase()]]
      });

      console.log(`Found ${tags.length} tags`);

      // شمارش مقالات برای هر تگ
      const ArticleTag = require('../articleTag/model');
      const Article = require('../article/model');
      
      const tagsWithCount = await Promise.all(
        tags.map(async (tag) => {
          try {
            // شمارش مستقیم از جدول junction
            const articleCount = await ArticleTag.count({
              where: { tagId: tag.id }
            });

            console.log(`Tag "${tag.name}": Article count = ${articleCount}`);

            return {
              ...tag.toJSON(),
              articleCount
            };
          } catch (error) {
            console.error(`Error counting articles for tag ${tag.name}:`, error);
            return {
              ...tag.toJSON(),
              articleCount: 0
            };
          }
        })
      );

      // محاسبه آمار کلی
      const totalTags = tagsWithCount.length;
      const totalArticles = tagsWithCount.reduce((sum, tag) => sum + tag.articleCount, 0);
      const averageArticlesPerTag = totalTags > 0 ? Math.round(totalArticles / totalTags) : 0;
      
      // شمارش تگ‌های طبقه‌بندی شده
      const ClassTag = require('../classTag/model');
      const classifiedTags = await ClassTag.count({
        distinct: true,
        col: 'tagId'
      });

      return this.response(res, 200, true, "همه تگ‌ها با شمارش مقالات دریافت شد.", {
        tags: tagsWithCount,
        stats: {
          totalTags,
          totalArticles,
          averageArticlesPerTag,
          classifiedTags,
          unclassifiedTags: totalTags - classifiedTags
        }
      });
    } catch (error) {
      console.error("❌ Error in getAllWithArticleCount:", error);
      return this.response(res, 500, false, "خطا در دریافت داده", null, error);
    }
  }
}

module.exports = new TagController(); 
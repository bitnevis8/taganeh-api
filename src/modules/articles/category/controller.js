const BaseController = require("../../../core/baseController");
const Category = require("./model");
const Joi = require("joi");
const { Op } = require("sequelize");

class CategoryController extends BaseController {
  constructor() {
    super(Category);
  }

  // ✅ دریافت تمام دسته‌بندی‌ها
  async getAll(req, res) {
    try {
      const { sortBy, sortOrder, parentId } = req.query;
      const order = [];
      const allowedSortColumns = ["name", "createdAt"];

      if (sortBy && allowedSortColumns.includes(sortBy)) {
        order.push([sortBy, sortOrder && sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"]);
      }

      const whereClause = { isActive: true };
      
      // فیلتر بر اساس parentId
      if (parentId !== undefined) {
        if (parentId === 'null' || parentId === '') {
          whereClause.parentId = null; // دسته‌بندی‌های اصلی
        } else {
          whereClause.parentId = parentId;
        }
      }

      const categories = await Category.findAll({
        where: whereClause,
        include: [{
          model: Category,
          as: 'parentCategory',
          attributes: ['id', 'name']
        }, {
          model: Category,
          as: 'subCategories',
          attributes: ['id', 'name'],
          where: { isActive: true },
          required: false
        }],
        order: order.length > 0 ? order : [['name', 'ASC']]
      });

      return this.response(res, 200, true, "لیست دسته‌بندی‌ها دریافت شد.", categories);
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

  // ✅ دریافت یک دسته‌بندی بر اساس ID
  async getOne(req, res) {
    try {
      const category = await Category.findByPk(req.params.id, {
        include: [{
          model: Category,
          as: 'parentCategory',
          attributes: ['id', 'name']
        }, {
          model: Category,
          as: 'subCategories',
          attributes: ['id', 'name'],
          where: { isActive: true },
          required: false
        }]
      });
      
      if (!category) {
        return this.response(res, 404, false, "دسته‌بندی یافت نشد.");
      }

      return this.response(res, 200, true, "دسته‌بندی دریافت شد.", category);
    } catch (error) {
      console.error("❌ Error in getOne:", error);
      return this.response(res, 500, false, "خطا در دریافت داده", null, error);
    }
  }

  // ✅ ایجاد یک دسته‌بندی جدید
  async create(req, res) {
    try {
      const { name, description, slug, parentId } = req.body;

      // اعتبارسنجی ورودی‌ها
      const schema = Joi.object({
        name: Joi.string().required().max(100),
        description: Joi.string().optional().allow('', null),
        slug: Joi.string().required().max(100),
        parentId: Joi.number().integer().optional().allow(null)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return this.response(res, 400, false, error.details[0].message);
      }

      // چک کردن تکراری بودن نام و slug
      const existingCategory = await Category.findOne({
        where: { 
          [Op.or]: [
            { name: value.name },
            { slug: value.slug }
          ]
        }
      });

      if (existingCategory) {
        return this.response(res, 400, false, "نام یا slug دسته‌بندی قبلاً ثبت شده است.");
      }

      // اگر parentId ارائه شده، چک کردن وجود دسته‌بندی والد
      if (value.parentId) {
        const parentCategory = await Category.findByPk(value.parentId);
        if (!parentCategory) {
          return this.response(res, 400, false, "دسته‌بندی والد یافت نشد.");
        }
      }

      // ایجاد دسته‌بندی جدید
      const newCategory = await Category.create({
        name: value.name,
        description: value.description || null,
        slug: value.slug,
        parentId: value.parentId || null
      });

      // دریافت دسته‌بندی با اطلاعات والد
      const createdCategory = await Category.findByPk(newCategory.id, {
        include: [{
          model: Category,
          as: 'parentCategory',
          attributes: ['id', 'name']
        }]
      });

      return this.response(res, 201, true, "دسته‌بندی جدید ایجاد شد.", createdCategory);
    } catch (error) {
      console.error("❌ Error in create:", error);
      return this.response(res, 500, false, "خطا در ایجاد دسته‌بندی", null, error);
    }
  }

  // ✅ ویرایش یک دسته‌بندی
  async update(req, res) {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) {
        return this.response(res, 404, false, "دسته‌بندی یافت نشد.");
      }

      const { name, description, slug, parentId } = req.body;

      // اعتبارسنجی ورودی‌ها
      const schema = Joi.object({
        name: Joi.string().required().max(100),
        description: Joi.string().optional().allow('', null),
        slug: Joi.string().required().max(100),
        parentId: Joi.number().integer().optional().allow(null)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return this.response(res, 400, false, error.details[0].message);
      }

      // چک کردن تکراری بودن نام و slug (به جز خودش)
      const existingCategory = await Category.findOne({
        where: { 
          [Op.or]: [
            { name: value.name },
            { slug: value.slug }
          ],
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingCategory) {
        return this.response(res, 400, false, "نام یا slug دسته‌بندی قبلاً ثبت شده است.");
      }

      // اگر parentId ارائه شده، چک کردن وجود دسته‌بندی والد
      if (value.parentId) {
        const parentCategory = await Category.findByPk(value.parentId);
        if (!parentCategory) {
          return this.response(res, 400, false, "دسته‌بندی والد یافت نشد.");
        }
        
        // چک کردن اینکه خودش را به عنوان والد انتخاب نکرده باشد
        if (value.parentId == req.params.id) {
          return this.response(res, 400, false, "دسته‌بندی نمی‌تواند والد خودش باشد.");
        }
      }

      // بروزرسانی دسته‌بندی
      await category.update({
        name: value.name,
        description: value.description || null,
        slug: value.slug,
        parentId: value.parentId || null
      });

      // دریافت دسته‌بندی بروزرسانی شده با اطلاعات والد
      const updatedCategory = await Category.findByPk(req.params.id, {
        include: [{
          model: Category,
          as: 'parentCategory',
          attributes: ['id', 'name']
        }]
      });

      return this.response(res, 200, true, "دسته‌بندی بروزرسانی شد.", updatedCategory);
    } catch (error) {
      console.error("❌ Error in update:", error);
      return this.response(res, 500, false, "خطا در بروزرسانی دسته‌بندی", null, error);
    }
  }

  // ✅ حذف یک دسته‌بندی
  async delete(req, res) {
    try {
      const category = await Category.findByPk(req.params.id);
      if (!category) {
        return this.response(res, 404, false, "دسته‌بندی یافت نشد.");
      }

      // چک کردن اینکه آیا زیردسته دارد یا نه
      const hasSubCategories = await Category.findOne({
        where: { 
          parentId: req.params.id,
          isActive: true 
        }
      });

      if (hasSubCategories) {
        return this.response(res, 400, false, "ابتدا زیردسته‌های این دسته‌بندی را حذف کنید.");
      }

      // حذف منطقی
      await category.update({ isActive: false });

      return this.response(res, 200, true, "دسته‌بندی حذف شد.");
    } catch (error) {
      console.error("❌ Error in delete:", error);
      return this.response(res, 500, false, "خطا در حذف دسته‌بندی", null, error);
    }
  }

  // ✅ جستجو در دسته‌بندی‌ها
  async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return this.response(res, 400, false, "پارامتر جستجو الزامی است.");
      }

      const categories = await Category.findAll({
        where: {
          [Op.and]: [
            { isActive: true },
            {
              [Op.or]: [
                { name: { [Op.like]: `%${q}%` } },
                { description: { [Op.like]: `%${q}%` } },
                { slug: { [Op.like]: `%${q}%` } }
              ]
            }
          ]
        },
        include: [{
          model: Category,
          as: 'parentCategory',
          attributes: ['id', 'name']
        }],
        order: [['name', 'ASC']]
      });

      return this.response(res, 200, true, "نتایج جستجو دریافت شد.", categories);
    } catch (error) {
      console.error("❌ Error in search:", error);
      return this.response(res, 500, false, "خطا در جستجو", null, error);
    }
  }

  // ✅ دریافت دسته‌بندی‌های اصلی (بدون والد)
  async getMainCategories(req, res) {
    try {
      const categories = await Category.findAll({
        where: { 
          parentId: null,
          isActive: true 
        },
        include: [{
          model: Category,
          as: 'subCategories',
          attributes: ['id', 'name'],
          where: { isActive: true },
          required: false
        }],
        order: [['name', 'ASC']]
      });

      return this.response(res, 200, true, "دسته‌بندی‌های اصلی دریافت شد.", categories);
    } catch (error) {
      console.error("❌ Error in getMainCategories:", error);
      return this.response(res, 500, false, "خطا در دریافت دسته‌بندی‌های اصلی", null, error);
    }
  }
}

module.exports = new CategoryController(); 
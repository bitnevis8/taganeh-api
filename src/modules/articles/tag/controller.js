const BaseController = require("../../../core/baseController");
const Tag = require("./model");
const TagFamily = require("../tagFamily/model");
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
        include: [{
          model: TagFamily,
          as: 'tagFamily',
          attributes: ['id', 'name']
        }],
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
      const tag = await Tag.findByPk(req.params.id, {
        include: [{
          model: TagFamily,
          as: 'tagFamily',
          attributes: ['id', 'name']
        }]
      });
      
      if (!tag) {
        return this.response(res, 404, false, "تگ یافت نشد.");
      }

      return this.response(res, 200, true, "تگ دریافت شد.", tag);
    } catch (error) {
      console.error("❌ Error in getOne:", error);
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
        const tagFamily = await TagFamily.findByPk(value.tagFamilyId);
        if (!tagFamily) {
          return this.response(res, 400, false, "خانواده تگ یافت نشد.");
        }
      }

      // ایجاد تگ جدید
      const newTag = await Tag.create({
        name: value.name,
        description: value.description || null,
        hasFamily: value.hasFamily,
        tagFamilyId: value.tagFamilyId || null
      });

      // دریافت تگ با اطلاعات خانواده
      const createdTag = await Tag.findByPk(newTag.id, {
        include: [{
          model: TagFamily,
          as: 'tagFamily',
          attributes: ['id', 'name']
        }]
      });

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
        const tagFamily = await TagFamily.findByPk(value.tagFamilyId);
        if (!tagFamily) {
          return this.response(res, 400, false, "خانواده تگ یافت نشد.");
        }
      }

      // بروزرسانی تگ
      await tag.update({
        name: value.name,
        description: value.description || null,
        hasFamily: value.hasFamily,
        tagFamilyId: value.tagFamilyId || null
      });

      // دریافت تگ بروزرسانی شده با اطلاعات خانواده
      const updatedTag = await Tag.findByPk(req.params.id, {
        include: [{
          model: TagFamily,
          as: 'tagFamily',
          attributes: ['id', 'name']
        }]
      });

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
        include: [{
          model: TagFamily,
          as: 'tagFamily',
          attributes: ['id', 'name']
        }],
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
        include: [{
          model: TagFamily,
          as: 'tagFamily',
          attributes: ['id', 'name']
        }],
        order: [['name', 'ASC']]
      });

      return this.response(res, 200, true, "تگ‌های خانواده دریافت شد.", tags);
    } catch (error) {
      console.error("❌ Error in getByFamily:", error);
      return this.response(res, 500, false, "خطا در دریافت تگ‌های خانواده", null, error);
    }
  }
}

module.exports = new TagController(); 
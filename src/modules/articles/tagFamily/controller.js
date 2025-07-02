const BaseController = require("../../../core/baseController");
const TagFamily = require("./model");
const Joi = require("joi");
const { Op } = require("sequelize");

class TagFamilyController extends BaseController {
  constructor() {
    super(TagFamily);
  }

  // ✅ دریافت تمام خانواده‌های تگ
  async getAll(req, res) {
    try {
      const { sortBy, sortOrder } = req.query;
      const order = [];
      const allowedSortColumns = ["name", "createdAt"];

      if (sortBy && allowedSortColumns.includes(sortBy)) {
        order.push([sortBy, sortOrder && sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"]);
      }

      const tagFamilies = await TagFamily.findAll({
        where: { isActive: true },
        order: order.length > 0 ? order : [['createdAt', 'DESC']]
      });

      return this.response(res, 200, true, "لیست خانواده‌های تگ دریافت شد.", tagFamilies);
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

  // ✅ دریافت یک خانواده تگ بر اساس ID
  async getOne(req, res) {
    try {
      const tagFamily = await TagFamily.findByPk(req.params.id);
      
      if (!tagFamily) {
        return this.response(res, 404, false, "خانواده تگ یافت نشد.");
      }

      return this.response(res, 200, true, "خانواده تگ دریافت شد.", tagFamily);
    } catch (error) {
      console.error("❌ Error in getOne:", error);
      return this.response(res, 500, false, "خطا در دریافت داده", null, error);
    }
  }

  // ✅ ایجاد یک خانواده تگ جدید
  async create(req, res) {
    try {
      const { name, description } = req.body;

      // اعتبارسنجی ورودی‌ها
      const schema = Joi.object({
        name: Joi.string().required().max(100),
        description: Joi.string().optional().allow('', null)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return this.response(res, 400, false, error.details[0].message);
      }

      // چک کردن تکراری بودن نام
      const existingTagFamily = await TagFamily.findOne({
        where: { name: value.name }
      });

      if (existingTagFamily) {
        return this.response(res, 400, false, "نام خانواده تگ قبلاً ثبت شده است.");
      }

      // ایجاد خانواده تگ جدید
      const newTagFamily = await TagFamily.create({
        name: value.name,
        description: value.description || null
      });

      return this.response(res, 201, true, "خانواده تگ جدید ایجاد شد.", newTagFamily);
    } catch (error) {
      console.error("❌ Error in create:", error);
      return this.response(res, 500, false, "خطا در ایجاد خانواده تگ", null, error);
    }
  }

  // ✅ ویرایش یک خانواده تگ
  async update(req, res) {
    try {
      const tagFamily = await TagFamily.findByPk(req.params.id);
      if (!tagFamily) {
        return this.response(res, 404, false, "خانواده تگ یافت نشد.");
      }

      const { name, description } = req.body;

      // اعتبارسنجی ورودی‌ها
      const schema = Joi.object({
        name: Joi.string().required().max(100),
        description: Joi.string().optional().allow('', null)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return this.response(res, 400, false, error.details[0].message);
      }

      // چک کردن تکراری بودن نام (به جز خودش)
      const existingTagFamily = await TagFamily.findOne({
        where: { 
          name: value.name,
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingTagFamily) {
        return this.response(res, 400, false, "نام خانواده تگ قبلاً ثبت شده است.");
      }

      // بروزرسانی خانواده تگ
      await tagFamily.update({
        name: value.name,
        description: value.description || null
      });

      return this.response(res, 200, true, "خانواده تگ بروزرسانی شد.", tagFamily);
    } catch (error) {
      console.error("❌ Error in update:", error);
      return this.response(res, 500, false, "خطا در بروزرسانی خانواده تگ", null, error);
    }
  }

  // ✅ حذف یک خانواده تگ
  async delete(req, res) {
    try {
      const tagFamily = await TagFamily.findByPk(req.params.id);
      if (!tagFamily) {
        return this.response(res, 404, false, "خانواده تگ یافت نشد.");
      }

      // حذف منطقی
      await tagFamily.update({ isActive: false });

      return this.response(res, 200, true, "خانواده تگ حذف شد.");
    } catch (error) {
      console.error("❌ Error in delete:", error);
      return this.response(res, 500, false, "خطا در حذف خانواده تگ", null, error);
    }
  }

  // ✅ جستجو در خانواده‌های تگ
  async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return this.response(res, 400, false, "پارامتر جستجو الزامی است.");
      }

      const tagFamilies = await TagFamily.findAll({
        where: {
          [Op.and]: [
            { isActive: true },
            {
              [Op.or]: [
                { name: { [Op.like]: `%${q}%` } },
                { description: { [Op.like]: `%${q}%` } }
              ]
            }
          ]
        },
        order: [['createdAt', 'DESC']]
      });

      return this.response(res, 200, true, "نتایج جستجو دریافت شد.", tagFamilies);
    } catch (error) {
      console.error("❌ Error in search:", error);
      return this.response(res, 500, false, "خطا در جستجو", null, error);
    }
  }
}

module.exports = new TagFamilyController(); 
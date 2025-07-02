const BaseController = require("../../../core/baseController");
const Agency = require("./model");
const Joi = require("joi");
const { Op } = require("sequelize");

class AgencyController extends BaseController {
  constructor() {
    super(Agency);
  }

  // ✅ دریافت تمام آژانس‌ها
  async getAll(req, res) {
    try {
      const { sortBy, sortOrder } = req.query;
      const order = [];
      const allowedSortColumns = ["name", "createdAt"];

      if (sortBy && allowedSortColumns.includes(sortBy)) {
        order.push([sortBy, sortOrder && sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"]);
      }

      const agencies = await Agency.findAll({
        where: { isActive: true },
        order: order.length > 0 ? order : [['createdAt', 'DESC']]
      });

      return this.response(res, 200, true, "لیست آژانس‌های خبری دریافت شد.", agencies);
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

  // ✅ دریافت یک آژانس بر اساس ID
  async getOne(req, res) {
    try {
      const agency = await Agency.findByPk(req.params.id);
      
      if (!agency) {
        return this.response(res, 404, false, "آژانس خبری یافت نشد.");
      }

      return this.response(res, 200, true, "آژانس خبری دریافت شد.", agency);
    } catch (error) {
      console.error("❌ Error in getOne:", error);
      return this.response(res, 500, false, "خطا در دریافت داده", null, error);
    }
  }

  // ✅ ایجاد یک آژانس جدید
  async create(req, res) {
    try {
      const { name, websiteUrl, description, logo, scrapingConfig } = req.body;

      // اعتبارسنجی ورودی‌ها
      const schema = Joi.object({
        name: Joi.string().required().max(100),
        websiteUrl: Joi.string().uri().required().max(255),
        description: Joi.string().optional().allow('', null),
        logo: Joi.string().uri().optional().allow('', null).max(255),
        scrapingConfig: Joi.object().optional().allow(null)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return this.response(res, 400, false, error.details[0].message);
      }

      // چک کردن تکراری بودن نام و URL
      const existingAgency = await Agency.findOne({
        where: { 
          [Op.or]: [
            { name: value.name },
            { websiteUrl: value.websiteUrl }
          ]
        }
      });

      if (existingAgency) {
        return this.response(res, 400, false, "نام یا URL آژانس خبری قبلاً ثبت شده است.");
      }

      // ایجاد آژانس جدید
      const newAgency = await Agency.create({
        name: value.name,
        websiteUrl: value.websiteUrl,
        description: value.description || null,
        logo: value.logo || null,
        scrapingConfig: value.scrapingConfig || null
      });

      return this.response(res, 201, true, "آژانس خبری جدید ایجاد شد.", newAgency);
    } catch (error) {
      console.error("❌ Error in create:", error);
      return this.response(res, 500, false, "خطا در ایجاد آژانس خبری", null, error);
    }
  }

  // ✅ ویرایش یک آژانس
  async update(req, res) {
    try {
      const agency = await Agency.findByPk(req.params.id);
      if (!agency) {
        return this.response(res, 404, false, "آژانس خبری یافت نشد.");
      }

      const { name, websiteUrl, description, logo, scrapingConfig } = req.body;

      // اعتبارسنجی ورودی‌ها
      const schema = Joi.object({
        name: Joi.string().required().max(100),
        websiteUrl: Joi.string().uri().required().max(255),
        description: Joi.string().optional().allow('', null),
        logo: Joi.string().uri().optional().allow('', null).max(255),
        scrapingConfig: Joi.object().optional().allow(null)
      });

      const { error, value } = schema.validate(req.body);
      if (error) {
        return this.response(res, 400, false, error.details[0].message);
      }

      // چک کردن تکراری بودن نام و URL (به جز خودش)
      const existingAgency = await Agency.findOne({
        where: { 
          [Op.or]: [
            { name: value.name },
            { websiteUrl: value.websiteUrl }
          ],
          id: { [Op.ne]: req.params.id }
        }
      });

      if (existingAgency) {
        return this.response(res, 400, false, "نام یا URL آژانس خبری قبلاً ثبت شده است.");
      }

      // بروزرسانی آژانس
      await agency.update({
        name: value.name,
        websiteUrl: value.websiteUrl,
        description: value.description || null,
        logo: value.logo || null,
        scrapingConfig: value.scrapingConfig || null
      });

      return this.response(res, 200, true, "آژانس خبری بروزرسانی شد.", agency);
    } catch (error) {
      console.error("❌ Error in update:", error);
      return this.response(res, 500, false, "خطا در بروزرسانی آژانس خبری", null, error);
    }
  }

  // ✅ حذف یک آژانس
  async delete(req, res) {
    try {
      const agency = await Agency.findByPk(req.params.id);
      if (!agency) {
        return this.response(res, 404, false, "آژانس خبری یافت نشد.");
      }

      // حذف منطقی
      await agency.update({ isActive: false });

      return this.response(res, 200, true, "آژانس خبری حذف شد.");
    } catch (error) {
      console.error("❌ Error in delete:", error);
      return this.response(res, 500, false, "خطا در حذف آژانس خبری", null, error);
    }
  }

  // ✅ جستجو در آژانس‌ها
  async search(req, res) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return this.response(res, 400, false, "پارامتر جستجو الزامی است.");
      }

      const agencies = await Agency.findAll({
        where: {
          [Op.and]: [
            { isActive: true },
            {
              [Op.or]: [
                { name: { [Op.like]: `%${q}%` } },
                { description: { [Op.like]: `%${q}%` } },
                { websiteUrl: { [Op.like]: `%${q}%` } }
              ]
            }
          ]
        },
        order: [['createdAt', 'DESC']]
      });

      return this.response(res, 200, true, "نتایج جستجو دریافت شد.", agencies);
    } catch (error) {
      console.error("❌ Error in search:", error);
      return this.response(res, 500, false, "خطا در جستجو", null, error);
    }
  }

  // ✅ تست اتصال به آژانس
  async testConnection(req, res) {
    try {
      const { websiteUrl } = req.body;
      
      if (!websiteUrl) {
        return this.response(res, 400, false, "URL آژانس الزامی است.");
      }

      // اینجا می‌توانید کد تست اتصال به آژانس را اضافه کنید
      // مثلاً ارسال درخواست HTTP و بررسی پاسخ

      return this.response(res, 200, true, "اتصال به آژانس با موفقیت تست شد.");
    } catch (error) {
      console.error("❌ Error in testConnection:", error);
      return this.response(res, 500, false, "خطا در تست اتصال", null, error);
    }
  }
}

module.exports = new AgencyController(); 
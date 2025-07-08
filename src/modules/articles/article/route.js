const express = require("express");
const articleController = require("./controller");
const scraperRoutes = require("../scraper/route");

const router = express.Router();

router.use("/scraper", scraperRoutes);

// روت‌های مربوط به مقالات
router.get("/getAll", articleController.getAll); // دریافت تمام مقالات
router.get("/search", articleController.search); // جستجوی مقالات
router.get("/getByAgency/:agencyId", articleController.getByAgency); // دریافت مقالات یک آژانس
router.get("/getByCategory/:categoryId", articleController.getByCategory); // دریافت مقالات یک دسته‌بندی
router.get("/getByTag/:tagId", articleController.getByTag); // دریافت مقالات یک تگ
router.get("/getByTags", articleController.getByTags); // دریافت مقالات بر اساس چندین تگ
router.get("/getOne/:id", articleController.getOne); // دریافت یک مقاله بر اساس ID
router.post("/create", articleController.create); // ایجاد مقاله جدید
router.put("/update/:id", articleController.update); // ویرایش مقاله بر اساس ID
router.delete("/delete/:id", articleController.delete); // حذف مقاله بر اساس ID

module.exports = router; 
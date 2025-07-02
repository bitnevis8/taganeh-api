const express = require("express");
const router = express.Router();
const articleController = require("./controller");

const scraperRoutes = require("../scraper/route");
router.use("/scraper", scraperRoutes);

// دریافت تمام مقالات
router.get("/", articleController.getAll);

// جستجو در مقالات
router.get("/search", articleController.search);

// دریافت مقالات یک آژانس
router.get("/agency/:agencyId", articleController.getByAgency);

// دریافت مقالات یک دسته‌بندی
router.get("/category/:categoryId", articleController.getByCategory);

// دریافت مقالات یک تگ
router.get("/tag/:tagId", articleController.getByTag);

// دریافت یک مقاله
router.get("/:id", articleController.getOne);

// ایجاد مقاله جدید
router.post("/", articleController.create);

// ویرایش مقاله
router.put("/:id", articleController.update);

// حذف مقاله
router.delete("/:id", articleController.delete);

module.exports = router; 
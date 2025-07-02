const express = require("express");
const router = express.Router();
const categoryController = require("./controller");

// دریافت تمام دسته‌بندی‌ها
router.get("/", categoryController.getAll);

// دریافت دسته‌بندی‌های اصلی
router.get("/main", categoryController.getMainCategories);

// جستجو در دسته‌بندی‌ها
router.get("/search", categoryController.search);

// دریافت یک دسته‌بندی
router.get("/:id", categoryController.getOne);

// ایجاد دسته‌بندی جدید
router.post("/", categoryController.create);

// ویرایش دسته‌بندی
router.put("/:id", categoryController.update);

// حذف دسته‌بندی
router.delete("/:id", categoryController.delete);

module.exports = router; 
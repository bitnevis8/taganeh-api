const express = require("express");
const categoryController = require("./controller");

const router = express.Router();

// روت‌های مربوط به دسته‌بندی‌ها
router.get("/getAll", categoryController.getAll); // دریافت تمام دسته‌بندی‌ها
router.get("/getMain", categoryController.getMainCategories); // دریافت دسته‌بندی‌های اصلی
router.get("/search", categoryController.search); // جستجوی دسته‌بندی‌ها
router.get("/getOne/:id", categoryController.getOne); // دریافت یک دسته‌بندی بر اساس ID
router.post("/create", categoryController.create); // ایجاد دسته‌بندی جدید
router.put("/update/:id", categoryController.update); // ویرایش دسته‌بندی بر اساس ID
router.delete("/delete/:id", categoryController.delete); // حذف دسته‌بندی بر اساس ID

module.exports = router; 
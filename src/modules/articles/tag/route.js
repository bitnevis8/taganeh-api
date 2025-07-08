const express = require("express");
const tagController = require("./controller");

const router = express.Router();

// روت‌های مربوط به تگ‌ها
router.get("/getAll", tagController.getAll); // دریافت تمام تگ‌ها
router.get("/getAllWithArticleCount", tagController.getAllWithArticleCount); // دریافت همه تگ‌ها با شمارش مقالات
router.get("/getByClasses", tagController.getByClasses); // دریافت تگ‌ها بر اساس کلاس‌ها
router.get("/testDatabase", tagController.testDatabase); // تست دیتابیس
router.get("/search", tagController.search); // جستجوی تگ‌ها
router.get("/getByName/:name", tagController.getByName); // دریافت یک تگ بر اساس نام
router.get("/getByFamily/:familyId", tagController.getByFamily); // دریافت تگ‌های یک خانواده خاص
router.get("/getOne/:id", tagController.getOne); // دریافت یک تگ بر اساس ID
router.post("/create", tagController.create); // ایجاد تگ جدید
router.put("/update/:id", tagController.update); // ویرایش تگ بر اساس ID
router.delete("/delete/:id", tagController.delete); // حذف تگ بر اساس ID

module.exports = router; 
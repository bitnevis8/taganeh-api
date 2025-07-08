const express = require("express");
const router = express.Router();
const agencyController = require("./controller");

// روت‌های مربوط به آژانس‌ها
router.get("/getAll", agencyController.getAll); // دریافت تمام آژانس‌ها
router.get("/search", agencyController.search); // جستجوی آژانس‌ها
router.post("/testConnection", agencyController.testConnection); // تست اتصال به آژانس
router.get("/getOne/:id", agencyController.getOne); // دریافت یک آژانس بر اساس ID
router.post("/create", agencyController.create); // ایجاد آژانس جدید
router.put("/update/:id", agencyController.update); // ویرایش آژانس بر اساس ID
router.delete("/delete/:id", agencyController.delete); // حذف آژانس بر اساس ID

module.exports = router; 
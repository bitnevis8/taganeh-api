const express = require("express");
const router = express.Router();
const agencyController = require("./controller");

// دریافت تمام آژانس‌ها
router.get("/", agencyController.getAll);

// جستجو در آژانس‌ها
router.get("/search", agencyController.search);

// تست اتصال به آژانس
router.post("/test-connection", agencyController.testConnection);

// دریافت یک آژانس
router.get("/:id", agencyController.getOne);

// ایجاد آژانس جدید
router.post("/", agencyController.create);

// ویرایش آژانس
router.put("/:id", agencyController.update);

// حذف آژانس
router.delete("/:id", agencyController.delete);

module.exports = router; 
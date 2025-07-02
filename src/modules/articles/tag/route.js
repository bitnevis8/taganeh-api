const express = require("express");
const router = express.Router();
const tagController = require("./controller");

// دریافت تمام تگ‌ها
router.get("/", tagController.getAll);

// جستجو در تگ‌ها
router.get("/search", tagController.search);

// دریافت تگ‌های یک خانواده
router.get("/family/:familyId", tagController.getByFamily);

// دریافت یک تگ
router.get("/:id", tagController.getOne);

// ایجاد تگ جدید
router.post("/", tagController.create);

// ویرایش تگ
router.put("/:id", tagController.update);

// حذف تگ
router.delete("/:id", tagController.delete);

module.exports = router; 
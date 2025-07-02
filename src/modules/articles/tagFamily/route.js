const express = require("express");
const router = express.Router();
const tagFamilyController = require("./controller");

// دریافت تمام خانواده‌های تگ
router.get("/", tagFamilyController.getAll);

// جستجو در خانواده‌های تگ
router.get("/search", tagFamilyController.search);

// دریافت یک خانواده تگ
router.get("/:id", tagFamilyController.getOne);

// ایجاد خانواده تگ جدید
router.post("/", tagFamilyController.create);

// ویرایش خانواده تگ
router.put("/:id", tagFamilyController.update);

// حذف خانواده تگ
router.delete("/:id", tagFamilyController.delete);

module.exports = router; 
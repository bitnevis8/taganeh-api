const express = require("express");
const router = express.Router();

const scraperRoutes = require("./scraper/route");
const classRoutes = require("./class/route");
const tagRoutes = require("./tag/route");
const categoryRoutes = require("./category/route");
const agencyRoutes = require("./agency/route");
const articleRoutes = require("./article/route");

router.use("/scraper", scraperRoutes);
router.use("/classes", classRoutes);
router.use("/tags", tagRoutes);
router.use("/categories", categoryRoutes);
router.use("/agencies", agencyRoutes);
router.use("/", articleRoutes);

module.exports = router; 